// src/agents/ImageAgent.js
class ImageAgent {
  constructor() {
    this.name = "Image Management Agent";
    this.expertise = "Fetching and managing place images";
    this.unsplashKey = 'OdzvanAPXMDpuYyx1vl_Njl4IQHhYIK2j4bx7CzxDuU';
    this.imageCache = {};
  }

  async fetchPlaceImage(placeName) {
    // Check cache first
    if (this.imageCache[placeName]) {
      return this.imageCache[placeName];
    }
    
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(placeName)}&per_page=1&client_id=${this.unsplashKey}`
      );
      const data = await response.json();
      
      let imageUrl = null;
      if (data.results && data.results.length > 0) {
        imageUrl = data.results[0].urls.small;
        this.imageCache[placeName] = imageUrl;
      }
      
      return imageUrl;
    } catch (error) {
      console.error("Error fetching image:", error);
      return null;
    }
  }

  async fetchImagesForPlaces(places) {
    console.log(`🤖 ${this.name} is fetching images for ${places.length} places...`);
    
    const images = {};
    
    for (const place of places) {
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