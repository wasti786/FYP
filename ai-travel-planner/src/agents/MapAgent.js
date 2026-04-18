// src/agents/MapAgent.js
class MapAgent {
  constructor() {
    this.name = "Map & Navigation Agent";
    this.expertise = "Managing map interactions and coordinates";
    this.googleKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || null;
  }

  async getPlaceCoordinates(placeName, destination) {
    try {
      // 1) Try Google Geocoding (best results) when API key is available
      if (this.googleKey) {
        try {
          const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(placeName + ', ' + destination)}&key=${this.googleKey}`;
          const proxyGeo = `https://api.allorigins.win/raw?url=${encodeURIComponent(geoUrl)}`;
          const geoResp = await fetch(proxyGeo);
          if (geoResp.ok) {
            const geoData = await geoResp.json();
            if (geoData && geoData.results && geoData.results.length > 0) {
              const r = geoData.results[0];
              return {
                lat: r.geometry.location.lat,
                lng: r.geometry.location.lng,
                formattedAddress: r.formatted_address
              };
            }
          }
        } catch (gErr) {
          console.warn('Google geocoding failed, falling back to OSM', gErr.message || gErr);
        }
      }

      // 2) Fallback: Use a CORS proxy for Nominatim (OpenStreetMap)
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(placeName + ', ' + destination)}&limit=1`;
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

      const response = await fetch(proxyUrl, {
        headers: {
          'User-Agent': 'AITravelPlanner/1.0',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          formattedAddress: data[0].display_name
        };
      }
      
      // If no coordinates found, return mock coordinates near the destination
      console.warn(`No coordinates found for ${placeName}, using mock coordinates`);
      return this.getMockCoordinates(placeName, destination);
      
    } catch (error) {
      console.error("Error getting coordinates for", placeName, ":", error.message);
      // Return mock coordinates as fallback
      return this.getMockCoordinates(placeName, destination);
    }
  }

  // Search Google Places Text Search via proxy and return results array (fallbacks to empty array)
  async searchGooglePlacesText(query, limit = 10) {
    if (!this.googleKey) return [];
    try {
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${this.googleKey}&pagetoken=`;
      const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      const resp = await fetch(proxy);
      if (!resp.ok) return [];
      const data = await resp.json();
      const results = Array.isArray(data.results) ? data.results.slice(0, limit) : [];
      return results;
    } catch (e) {
      console.warn('searchGooglePlacesText failed', e);
      return [];
    }
  }

  // Construct a Google Place Photo URL (usable directly in <img src>)
  getGooglePlacePhotoUrl(photoReference, maxwidth = 400) {
    if (!this.googleKey || !photoReference) return null;
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxwidth}&photoreference=${photoReference}&key=${this.googleKey}`;
  }

  // Fetch curated attractions for a destination using Google Places (fallback to empty array)
  async fetchAttractionsForDestination(destination, limit = 8) {
    try {
      if (!destination) return [];
      // Try text search: 'tourist attractions in {destination}'
      const query = `tourist attractions in ${destination}`;
      const results = await this.searchGooglePlacesText(query, limit);
      if (!results || results.length === 0) return [];

      const mapped = results.map((r) => ({
        name: r.name,
        description: r.formatted_address || (r.types ? r.types.join(', ') : ''),
        lat: r.geometry?.location?.lat,
        lng: r.geometry?.location?.lng,
        address: r.formatted_address || r.vicinity || null,
        place_id: r.place_id,
        types: r.types || [],
        rating: r.rating || null,
        user_ratings_total: r.user_ratings_total || 0,
        opening_hours: r.opening_hours || null,
        photoUrl: (r.photos && r.photos.length > 0) ? this.getGooglePlacePhotoUrl(r.photos[0].photo_reference, 400) : null,
      }));

      return mapped.slice(0, limit);
    } catch (e) {
      console.warn('fetchAttractionsForDestination failed', e);
      return [];
    }
  }

  getMockCoordinates(placeName, destination) {
    // Return mock coordinates based on destination
    const mockCoords = {
      "Lahore": { lat: 31.5497, lng: 74.3436 },
      "Gilgit Baltistan": { lat: 35.9204, lng: 74.3143 },
      "Karachi": { lat: 24.8607, lng: 67.0011 },
      "Islamabad": { lat: 33.6844, lng: 73.0479 },
      "default": { lat: 30.3753, lng: 69.3451 }
    };
    
    const baseCoords = mockCoords[destination] || mockCoords.default;
    
    // Add random offset to make places slightly different
    return {
      lat: baseCoords.lat + (Math.random() - 0.5) * 0.02,
      lng: baseCoords.lng + (Math.random() - 0.5) * 0.02,
      formattedAddress: `${placeName}, ${destination}`
    };
  }

  async addCoordinatesToPlaces(places, destination) {
    console.log(`🤖 ${this.name} is adding coordinates to ${places.length} places...`);
    
    const placesWithCoords = [];
    
    for (let i = 0; i < places.length; i++) {
      const place = places[i];
      console.log(`📍 Getting coordinates for: ${place.name}`);
      
      const coords = await this.getPlaceCoordinates(place.name, destination);
      placesWithCoords.push({
        ...place,
        lat: coords?.lat,
        lng: coords?.lng,
        address: coords?.formattedAddress
      });
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log("✅ All coordinates processed!");
    return placesWithCoords;
  }

  async processItineraryCoordinates(itinerary, destination) {
    console.log(`🤖 ${this.name} is processing all itinerary coordinates...`);
    
    if (!itinerary?.days) return itinerary;
    
    for (let i = 0; i < itinerary.days.length; i++) {
      const day = itinerary.days[i];
      if (day.places && day.places.length > 0) {
        console.log(`📍 Processing Day ${i + 1} coordinates...`);
        day.places = await this.addCoordinatesToPlaces(day.places, destination);
      }
    }
    
    return itinerary;
  }

  calculateDistance(point1, point2) {
    if (!point1.lat || !point1.lng || !point2.lat || !point2.lng) return 0;
    
    const R = 6371;
    const lat1 = point1.lat * Math.PI / 180;
    const lat2 = point2.lat * Math.PI / 180;
    const dlat = (point2.lat - point1.lat) * Math.PI / 180;
    const dlng = (point2.lng - point1.lng) * Math.PI / 180;
    
    const a = Math.sin(dlat/2) * Math.sin(dlat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dlng/2) * Math.sin(dlng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c;
  }
}

export { MapAgent };