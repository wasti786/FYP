// src/agents/FoodAgent.js
class FoodAgent {
  constructor(imageAgent = null) {
    this.name = 'Food Recommendation Agent';
    this.expertise = 'Suggesting local foods with images and short descriptions';
    this.imageAgent = imageAgent; // optional shared image agent
    this.unsplashKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || 'OdzvanAPXMDpuYyx1vl_Njl4IQHhYIK2j4bx7CzxDuU';
    this.cacheVersion = 1;
    this.foodCache = {};
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem('foodAgent_cache');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.version && parsed.version === this.cacheVersion) {
            this.foodCache = parsed.data || {};
          } else {
            this.foodCache = {};
          }
        }
      }
    } catch (e) {
      // ignore
    }
  }

  async generateFoodRecommendations(destination = 'Unknown') {
    const dataset = this._foodsForDestination(destination);
    // pick 4-6 items
    const count = Math.min(Math.max(4, Math.floor(dataset.length)), 6);
    const items = dataset.slice(0, count);

    const results = [];
    for (const item of items) {
      const cacheKey = `food:${item.name}::${destination}`;
      let imageUrl = this.foodCache[cacheKey];

      if (!imageUrl) {
        const query = `${item.name} ${destination} food`;
        if (this.imageAgent && typeof this.imageAgent.fetchFoodImage === 'function') {
          imageUrl = await this.imageAgent.fetchFoodImage(query);
        } else {
          imageUrl = await this._fetchUnsplashImage(query);
        }
        this.foodCache[cacheKey] = imageUrl;
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem('foodAgent_cache', JSON.stringify({ version: this.cacheVersion, data: this.foodCache }));
          }
        } catch (e) {}
      }

      results.push({
        name: item.name,
        description: item.description,
        imageUrl: imageUrl || '',
        type: item.type || 'traditional',
      });
    }

    return results;
  }

  _foodsForDestination(destination) {
    const key = (destination || '').toLowerCase();
    const foodsByDestination = {
      'gilgit baltistan': [
        { name: 'Chapshuro', description: 'Meat-filled flatbread, crispy and savory.', type: 'local' },
        { name: 'Mantu', description: 'Steamed meat dumplings served with yoghurt.', type: 'traditional' },
        { name: 'Thukpa', description: 'Hearty noodle soup, perfect for cold days.', type: 'local' },
        { name: 'Apricot Jam (Local)', description: 'Sweet apricot preserve made from local fruit.', type: 'traditional' },
        { name: 'Yak Kebabs', description: 'Grilled yak or lamb skewers in mountain regions.', type: 'street' }
      ],
      'skardu': [
        { name: 'Chapshuro', description: 'Local meat pastry – hearty and filling.', type: 'local' },
        { name: 'Balti Gosht', description: 'Rich meat curry from Baltistan.', type: 'traditional' },
        { name: 'Thukpa', description: 'Comforting noodle soup with vegetables and meat.', type: 'local' },
        { name: 'Apricot Sweets', description: 'Desserts made from dried apricots.', type: 'traditional' }
      ],
      'hunza': [
        { name: 'Chapshuro', description: 'A popular stuffed bread in northern valleys.', type: 'local' },
        { name: 'Apricot Jam & Kernels', description: 'Local apricot-based treats and snacks.', type: 'traditional' },
        { name: 'Thukpa', description: 'Warm soup with hand-made noodles and meat.', type: 'local' },
        { name: 'Yak Stew', description: 'Slow-cooked meat stew for cold evenings.', type: 'traditional' }
      ],
      'lahore': [
        { name: 'Nihari', description: 'Slow-cooked beef stew, rich and spicy.', type: 'traditional' },
        { name: 'Halwa Puri', description: 'Breakfast favourite — sweet halwa and fried bread.', type: 'street' },
        { name: 'Chargha', description: 'Whole fried spiced chicken, popular in Lahore.', type: 'traditional' },
        { name: 'Lahori Fried Fish', description: 'Crispy spiced river fish, street-style.', type: 'street' }
      ],
      'karachi': [
        { name: 'Biryani', description: 'Fragrant spiced rice with meat — iconic Karachi dish.', type: 'local' },
        { name: 'Bun Kebab', description: 'Street sandwich with spicy patty and chutneys.', type: 'street' },
        { name: 'Nihari', description: 'Slow-cooked stew eaten with naans.', type: 'traditional' },
        { name: 'Sajji', description: 'Whole roasted meat with simple seasoning.', type: 'traditional' }
      ],
      'islamabad': [
        { name: 'Chapli Kebab', description: 'Flattened spicy beef kebab, best with naan.', type: 'street' },
        { name: 'Kunna Gosht', description: 'Rich mutton curry slow-cooked in a clay pot.', type: 'traditional' },
        { name: 'Gol Gappay', description: 'Crispy hollow balls filled with spicy water and chickpeas.', type: 'street' },
        { name: 'Seekh Kebabs', description: 'Minced meat skewers full of flavour.', type: 'street' }
      ],
      'default': [
        { name: 'Local Thali', description: 'A platter of regional specialties to try.', type: 'local' },
        { name: 'Street Kebab', description: 'Grilled meat served with bread and chutney.', type: 'street' },
        { name: 'Regional Stew', description: 'Hearty stew featuring local ingredients.', type: 'traditional' },
        { name: 'Sweet Treat', description: 'Popular local dessert to finish the meal.', type: 'traditional' }
      ]
    };

    // best match by substring
    for (const k of Object.keys(foodsByDestination)) {
      if (k !== 'default' && keyIncludes(destination, k)) return foodsByDestination[k];
    }
    return foodsByDestination.default;
  }

  async _fetchUnsplashImage(query) {
    if (!this.unsplashKey) return `https://source.unsplash.com/400x300/?${encodeURIComponent(query)}`;
    try {
      const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&client_id=${this.unsplashKey}`);
      const data = await res.json();
      return data?.results?.[0]?.urls?.small || `https://source.unsplash.com/400x300/?${encodeURIComponent(query)}`;
    } catch (e) {
      return `https://source.unsplash.com/400x300/?${encodeURIComponent(query)}`;
    }
  }
}

function keyIncludes(destination, key) {
  if (!destination || !key) return false;
  return destination.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(destination.toLowerCase());
}

export { FoodAgent };
