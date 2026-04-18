// src/agents/ImageAgent.js
import avariHotel1 from '../assets/hotels/avari-hotel1.jpg';
import baltistanHotel from '../assets/hotels/baltistan-hotel.jpg';
import byrsahotel from '../assets/hotels/byrsahotel.jpg';
import harriothotel from '../assets/hotels/harriothotel.jpg';
import himmelhotels from '../assets/hotels/himmelhotels.webp';
import kesarhotel from '../assets/hotels/kesarhotel.jpg';
import kesarhotel2 from '../assets/hotels/kesarhotel2.jpg';
import khojResort from '../assets/hotels/khoj-resort.jpg';
import mappleResort from '../assets/hotels/mapple-resort.jpg';
import riwajHotel from '../assets/hotels/riwaj-hotel.avif';
import shangrillahotel from '../assets/hotels/shangrillahotel.jpg';
import snowlandGuest from '../assets/hotels/snowland-guest.jpg';
import snowlandguest2 from '../assets/hotels/snowlandguest.jpg';
import qayamSkardu from '../assets/hotels/qayam-Skardu.jpg';
import qayamSkardu2 from '../assets/hotels/qayam-Skardu2.jpg';
class ImageAgent {
  constructor() {
    this.name = "Image Management Agent";
    this.expertise = "Fetching and managing place images";
    this.unsplashKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || 'OdzvanAPXMDpuYyx1vl_Njl4IQHhYIK2j4bx7CzxDuU';
    this.pexelsKey = import.meta.env.VITE_PEXELS_API_KEY || null;
    this.cacheVersion = 2;
    this.imageCache = {}; // generic place cache
    this.hotelCache = {}; // hotel-specific cache
    this.foodCache = {}; // food image cache

    // Local fallback images (bundled with app) to guarantee visible hotel photos
    this.localHotelImages = [
      avariHotel1,
      baltistanHotel,
      byrsahotel,
      harriothotel,
      himmelhotels,
      kesarhotel,
      kesarhotel2,
      khojResort,
      mappleResort,
      riwajHotel,
      shangrillahotel,
      snowlandGuest,
      snowlandguest2,
      qayamSkardu,
      qayamSkardu2,
    ];

    // Load caches from localStorage when available
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem('imageAgent_cache');
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.version && parsed.version === this.cacheVersion) {
              this.imageCache = parsed.imageCache || {};
              this.hotelCache = parsed.hotelCache || {};
              this.foodCache = parsed.foodCache || {};
            } else {
              // version mismatch -> ignore old cache
              this.imageCache = {};
              this.hotelCache = {};
              this.foodCache = {};
            }
          }
      }
    } catch (e) {
      // ignore storage errors
    }

    // Expose for debugging in browser console
    try {
      if (typeof window !== 'undefined') {
        window.__imageAgent = this;
      }
    } catch (e) {
      // ignore
    }
  }

  async fetchPlaceImage(placeName) {
    // Check cache first
    if (this.imageCache[placeName]) return this.imageCache[placeName];

    const query = placeName;
    // Try Pexels first (better venue photos), then Unsplash, then source.unsplash fallback
    if (this.pexelsKey) {
      try {
        const pex = await this._fetchPexelsImage(query, 1);
        if (pex) {
          this.imageCache[placeName] = pex;
          this._persistCache();
          return pex;
        }
      } catch (e) {
        console.warn('Pexels fetch failed for', query, e);
      }
    }

    if (this.unsplashKey) {
      try {
        const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&client_id=${this.unsplashKey}`);
        const data = await res.json();
        const imageUrl = data?.results?.[0]?.urls?.small || null;
        if (imageUrl) {
          this.imageCache[placeName] = imageUrl;
          this._persistCache();
          return imageUrl;
        }
      } catch (err) {
        console.warn('Unsplash place image fetch failed', err);
      }
    }

    const fallback = `https://source.unsplash.com/400x300/?${encodeURIComponent(query)}`;
    this.imageCache[placeName] = fallback;
    this._persistCache();
    return fallback;
  }

  async fetchImageForDestination(destination) {
    if (!destination) return null;
    const key = `destination:${destination}`;
    if (this.imageCache[key]) return this.imageCache[key];

    const query = `${destination} landscape`;
    // Try Pexels first, then Unsplash
    if (this.pexelsKey) {
      try {
        const pex = await this._fetchPexelsImage(`${destination} landscape`, 3);
        if (pex) {
          this.imageCache[key] = pex;
          this._persistCache();
          return pex;
        }
      } catch (e) {
        console.warn('Pexels destination fetch failed', e);
      }
    }

    if (this.unsplashKey) {
      try {
        const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=3&client_id=${this.unsplashKey}`);
        const data = await res.json();
        const imageUrl = data?.results?.[0]?.urls?.regular || null;
        if (imageUrl) {
          this.imageCache[key] = imageUrl;
          this._persistCache();
          return imageUrl;
        }
      } catch (err) {
        console.warn('Unsplash destination fetch failed', err);
      }
    }

    const fallback = `https://source.unsplash.com/1600x900/?${encodeURIComponent(destination)}`;
    this.imageCache[key] = fallback;
    this._persistCache();
    return fallback;
  }

  // Fetch unique images for a list of hotels (mutates/returns hotels array with imageUrl)
  async fetchHotelImages(hotels = [], destination = "") {
    if (!Array.isArray(hotels) || hotels.length === 0) return hotels;

    const usedUrls = new Set();
    const results = [];

    for (const hotel of hotels) {
      const hotelKey = `hotel:${(hotel.name || '').trim()}::${destination}`;
      // Prefer a unique image already present on the hotel, but replace duplicates
      let candidate = hotel.imageUrl || this.hotelCache[hotelKey] || null;

      // If candidate already used or not present, search Unsplash for a unique image
      if (!candidate || usedUrls.has(candidate)) {
        const query = `${hotel.name || 'hotel'} ${destination} hotel`;
        let chosen = null;

        // Try Pexels first for venue-specific photos
        if (this.pexelsKey) {
          try {
            const res = await this._fetchPexelsList(query, 8);
            const hits = res || [];
            for (const h of hits) {
              const url = h?.src?.large2x || h?.src?.large || h?.src?.medium || h?.src?.original;
              if (url && !usedUrls.has(url)) {
                chosen = url;
                break;
              }
            }
          } catch (err) {
            console.warn('Pexels hotel search failed for', query, err);
          }
        }

        // Then try Unsplash
        if (!chosen && this.unsplashKey) {
          try {
            const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=8&client_id=${this.unsplashKey}`);
            const data = await res.json();
            const hits = data?.results || [];
            for (const h of hits) {
              const url = h?.urls?.regular || h?.urls?.small || h?.urls?.thumb;
              if (url && !usedUrls.has(url)) {
                chosen = url;
                break;
              }
            }
          } catch (err) {
            console.warn('Unsplash hotel search failed for', query, err);
          }
        }

        if (!chosen) {
          // Prefer a bundled local hotel image when remote lookups fail
          if (this.localHotelImages && this.localHotelImages.length > 0) {
            // pick a local image not already used if possible
            const avail = this.localHotelImages.filter(u => !usedUrls.has(u));
            chosen = avail.length > 0 ? avail[Math.floor(Math.random() * avail.length)] : this.localHotelImages[Math.floor(Math.random() * this.localHotelImages.length)];
          } else {
            // fallback to source.unsplash with hotel name to increase uniqueness
            chosen = `https://source.unsplash.com/800x600/?hotel,${encodeURIComponent(hotel.name || destination)}`;
          }
        }

        candidate = chosen;
        this.hotelCache[hotelKey] = candidate;
        this._persistCache();

        // If candidate is the generic source.unsplash URL or a placeholder, try to replace with a curated random hotel image
        try {
          if (candidate && (candidate.includes('source.unsplash.com') || candidate.includes('via.placeholder.com'))) {
            const rand = await this._fetchRandomHotelImage(destination);
            if (rand) {
              candidate = rand;
              this.hotelCache[hotelKey] = candidate;
              this._persistCache();
            }
          }
        } catch (e) {
          // ignore
        }
      }

      usedUrls.add(candidate);
      console.log(`ImageAgent: assigned image for '${hotel.name}' ->`, candidate);
      results.push({ ...hotel, imageUrl: candidate });
    }

    // Post-process: ensure there are no duplicate imageUrls. If duplicates exist, try alternate queries to replace duplicates, otherwise use a unique placeholder.
    const urlToIndexes = {};
    results.forEach((r, idx) => {
      const u = r.imageUrl || "";
      if (!urlToIndexes[u]) urlToIndexes[u] = [];
      urlToIndexes[u].push(idx);
    });

    for (const [url, idxs] of Object.entries(urlToIndexes)) {
      if (!url || idxs.length <= 1) continue; // unique or empty

      for (let i = 1; i < idxs.length; i++) {
        const ri = idxs[i];
        const hotel = results[ri];
        const hotelKey = `hotel:${(hotel.name || '').trim()}::${destination}`;

        // Try alternative query patterns for a unique image
        const altQueries = [
          `${hotel.name} ${destination} hotel room`,
          `${hotel.name} ${destination} hotel interior`,
          `${hotel.name} ${destination} exterior`,
          `${hotel.name} ${destination} facade`,
          `${hotel.name} ${destination}`,
          `${destination} ${hotel.name} hotel`,
        ];

        let replaced = false;
        for (const q of altQueries) {
          // Try Pexels alt queries first
          if (this.pexelsKey) {
            try {
              const res = await this._fetchPexelsList(q, 6);
              const hits = res || [];
              for (const h of hits) {
                const url2 = h?.src?.large2x || h?.src?.large || h?.src?.medium || h?.src?.original;
                if (url2 && !usedUrls.has(url2)) {
                  results[ri].imageUrl = url2;
                  usedUrls.add(url2);
                  this.hotelCache[hotelKey] = url2;
                  this._persistCache();
                  replaced = true;
                  break;
                }
              }
            } catch (err) {
              // ignore and try next query
            }
          }

          if (!replaced && this.unsplashKey) {
            try {
              const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=6&client_id=${this.unsplashKey}`);
              const data = await res.json();
              const hits = data?.results || [];
              for (const h of hits) {
                const url2 = h?.urls?.regular || h?.urls?.small || h?.urls?.thumb;
                if (url2 && !usedUrls.has(url2)) {
                  results[ri].imageUrl = url2;
                  usedUrls.add(url2);
                  this.hotelCache[hotelKey] = url2;
                  this._persistCache();
                  replaced = true;
                  break;
                }
              }
            } catch (err) {
              // ignore and try next query
            }
          }
          if (replaced) break;
        }

        if (!replaced) {
          // Final fallback: try to fetch a random hotel photo (room/interior/etc) then fallback to local bundled images or a simple placeholder
          const randomImg = await this._fetchRandomHotelImage(destination);
          const localFallback = (this.localHotelImages && this.localHotelImages.length) ? this.localHotelImages[Math.floor(Math.random() * this.localHotelImages.length)] : null;
          const finalImg = randomImg || localFallback || `https://via.placeholder.com/800x600/0f2740/ffffff?text=${encodeURIComponent(hotel.name || destination)}`;
          results[ri].imageUrl = finalImg;
          usedUrls.add(finalImg);
          this.hotelCache[hotelKey] = finalImg;
          this._persistCache();
        }
      }
    }

    console.log('ImageAgent.fetchHotelImages results:', results.map(r => ({ name: r.name, imageUrl: r.imageUrl })));
    return results;
  }

  async fetchFoodImage(query) {
    if (!query) return null;
    if (this.foodCache[query]) return this.foodCache[query];

    // Try Pexels then Unsplash
    if (this.pexelsKey) {
      try {
        const pex = await this._fetchPexelsImage(query, 3);
        if (pex) {
          this.foodCache[query] = pex;
          this._persistCache();
          return pex;
        }
      } catch (e) {
        console.warn('Pexels food fetch failed', e);
      }
    }

    if (this.unsplashKey) {
      try {
        const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=3&client_id=${this.unsplashKey}`);
        const data = await res.json();
        const imageUrl = data?.results?.[0]?.urls?.small || null;
        if (imageUrl) {
          this.foodCache[query] = imageUrl;
          this._persistCache();
          return imageUrl;
        }
      } catch (err) {
        console.warn('Unsplash food fetch failed', err);
      }
    }

    const fallback = `https://source.unsplash.com/400x300/?${encodeURIComponent(query)}`;
    this.foodCache[query] = fallback;
    this._persistCache();
    return fallback;
  }

  // Fetch a single representative image from Pexels for a query
  async _fetchPexelsImage(query, per_page = 1) {
    if (!this.pexelsKey) return null;
    try {
      const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${per_page}`;
      const resp = await fetch(url, { headers: { Authorization: this.pexelsKey } });
      if (!resp.ok) return null;
      const data = await resp.json();
      if (data && data.photos && data.photos.length > 0) {
        const p = data.photos[0];
        return p.src.large2x || p.src.large || p.src.medium || p.src.original || null;
      }
      return null;
    } catch (e) {
      console.warn('Pexels single fetch error', e);
      return null;
    }
  }

  // Fetch list of Pexels photo objects for a query
  async _fetchPexelsList(query, per_page = 8) {
    if (!this.pexelsKey) return null;
    try {
      const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${per_page}`;
      const resp = await fetch(url, { headers: { Authorization: this.pexelsKey } });
      if (!resp.ok) return null;
      const data = await resp.json();
      return data.photos || null;
    } catch (e) {
      console.warn('Pexels list fetch error', e);
      return null;
    }
  }

  // Fetch a random hotel-related image (tries Pexels then Unsplash then source.unsplash fallback)
  async _fetchRandomHotelImage(destination = '') {
    const baseQueries = [
      'hotel room',
      'hotel interior',
      'hotel lobby',
      'hotel suite',
      'hotel bed',
      'hotel reception',
      'hotel exterior',
      'hotel facade',
      'hotel bathroom',
      `${destination} hotel room`,
      `${destination} hotel interior`
    ];

    // Shuffle queries
    for (let i = baseQueries.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [baseQueries[i], baseQueries[j]] = [baseQueries[j], baseQueries[i]];
    }

    // Try Pexels lists and pick a random photo
    if (this.pexelsKey) {
      for (const q of baseQueries) {
        try {
          const list = await this._fetchPexelsList(q, 12);
          if (list && list.length > 0) {
            const p = list[Math.floor(Math.random() * list.length)];
            const url = p?.src?.large2x || p?.src?.large || p?.src?.medium || p?.src?.original;
            if (url) return url;
          }
        } catch (e) {
          // ignore and try next
        }
      }
    }

    // Try Unsplash search and pick a random hit
    if (this.unsplashKey) {
      for (const q of baseQueries) {
        try {
          const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=12&client_id=${this.unsplashKey}`);
          const data = await res.json();
          const hits = data?.results || [];
          if (hits && hits.length > 0) {
            const h = hits[Math.floor(Math.random() * hits.length)];
            const url = h?.urls?.regular || h?.urls?.small || h?.urls?.thumb;
            if (url) return url;
          }
        } catch (e) {
          // ignore and try next
        }
      }
    }

    // Final fallback: source.unsplash random hotel image
    const fallbackQuery = baseQueries[Math.floor(Math.random() * baseQueries.length)];
    return `https://source.unsplash.com/800x600/?${encodeURIComponent(fallbackQuery)}`;
  }

  _persistCache() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('imageAgent_cache', JSON.stringify({ version: this.cacheVersion, imageCache: this.imageCache, hotelCache: this.hotelCache, foodCache: this.foodCache }));
      }
    } catch (e) {
      // ignore
    }
  }

  async fetchImagesForPlaces(places) {
    console.log(`🤖 ${this.name} is fetching images for ${places.length} places...`);
    
    const images = {};
    
    for (const place of places) {
      // Prefer any provided photoUrl (e.g., from Google Places) to preserve accuracy
      if (place && place.photoUrl) {
        images[place.name] = place.photoUrl;
        // cache it for future
        try {
          this.imageCache[place.name] = place.photoUrl;
          this._persistCache();
        } catch (e) {}
        continue;
      }

      const imageUrl = await this.fetchPlaceImage(place.name);
      if (imageUrl) {
        images[place.name] = imageUrl;
      }
    }
    
    return images;
  }

  async fetchImagesForDay(places) {
    return await this.fetchImagesForPlaces(places);
  }
}

export { ImageAgent };