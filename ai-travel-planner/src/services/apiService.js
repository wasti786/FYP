// src/services/apiService.js
class ApiService {
  constructor() {
    this.geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
    this.unsplashKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
  }

  async callGemini(prompt, retryCount = 0) {
    try {
      console.log(`Calling Gemini API (attempt ${retryCount + 1})...`);
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `${prompt}\n\nIMPORTANT: Return ONLY valid JSON, no other text.`
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2000,
            }
          })
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error("Gemini API error:", error);
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates[0].content.parts[0].text;
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(text);
      
    } catch (error) {
      console.error("Gemini API call failed:", error);
      
      if (retryCount < 2) {
        console.log(`Retrying... (${retryCount + 1}/2)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.callGemini(prompt, retryCount + 1);
      }
      
      throw error;
    }
  }

  async generateItinerary(destination, duration, travelers, preferences) {
    const prompt = `
      Create a detailed ${duration}-day travel itinerary for ${destination}.
      
      TRIP DETAILS:
      - Destination: ${destination}
      - Duration: ${duration} days
      - Travelers: ${travelers}
      - Interests/Preferences: ${preferences}
      
      Return a JSON object with EXACTLY this structure (no other text):
      {
        "days": [
          {
            "day": 1,
            "places": [
              {
                "name": "Place Name",
                "description": "Detailed description of what to do and see"
              }
            ],
            "tips": "Practical tips for this day"
          }
        ],
        "hotels": [
          {
            "name": "Hotel Name",
            "price": "$XX/night",
            "rating": 4.5,
            "description": "Brief description"
          }
        ],
        "travelTips": ["Tip 1", "Tip 2", "Tip 3", "Tip 4", "Tip 5"]
      }
      
      Make it realistic, practical, and tailored to ${preferences} interests.
    `;
    
    return await this.callGemini(prompt);
  }

  async generateBudget(destination, duration, travelers, budgetLevel) {
    const prompt = `
      Calculate a detailed travel budget for ${destination} for ${duration} days.
      
      DETAILS:
      - Destination: ${destination}
      - Duration: ${duration} days
      - Travelers: ${travelers}
      - Budget Level: ${budgetLevel} (Budget, Mid-range, or Luxury)
      
      Return a JSON object with EXACTLY this structure:
      {
        "total": number,
        "accommodation": number,
        "food": number,
        "transport": number,
        "activities": number,
        "miscellaneous": number,
        "daily": number,
        "recommendations": ["tip 1", "tip 2", "tip 3"]
      }
      
      All numbers in USD.
    `;
    
    return await this.callGemini(prompt);
  }

  async getPlaceImage(placeName) {
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(placeName)}&per_page=1&client_id=${this.unsplashKey}`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results[0].urls.small;
      }
      return null;
    } catch (error) {
      console.error("Unsplash error:", error);
      return null;
    }
  }
}

export default new ApiService();