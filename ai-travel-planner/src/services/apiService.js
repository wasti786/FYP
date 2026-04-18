// // // src/services/apiService.js
// // class ApiService {
// //   constructor() {
// //     this.geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
// //     this.unsplashKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
// //   }

// //   async callGemini(prompt, retryCount = 0) {
// //     try {
// //       console.log(`Calling Gemini API (attempt ${retryCount + 1})...`);
      
// //       const response = await fetch(
// //         `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.geminiKey}`,
// //         {
// //           method: 'POST',
// //           headers: { 'Content-Type': 'application/json' },
// //           body: JSON.stringify({
// //             contents: [{
// //               parts: [{
// //                 text: `${prompt}\n\nIMPORTANT: Return ONLY valid JSON, no other text.`
// //               }]
// //             }],
// //             generationConfig: {
// //               temperature: 0.7,
// //               maxOutputTokens: 2000,
// //             }
// //           })
// //         }
// //       );

// //       if (!response.ok) {
// //         const error = await response.text();
// //         console.error("Gemini API error:", error);
// //         throw new Error(`Gemini API error: ${response.status}`);
// //       }

// //       const data = await response.json();
// //       const text = data.candidates[0].content.parts[0].text;
      
// //       // Extract JSON from response
// //       const jsonMatch = text.match(/\{[\s\S]*\}/);
// //       if (jsonMatch) {
// //         return JSON.parse(jsonMatch[0]);
// //       }
// //       return JSON.parse(text);
      
// //     } catch (error) {
// //       console.error("Gemini API call failed:", error);
      
// //       if (retryCount < 2) {
// //         console.log(`Retrying... (${retryCount + 1}/2)`);
// //         await new Promise(resolve => setTimeout(resolve, 1000));
// //         return this.callGemini(prompt, retryCount + 1);
// //       }
      
// //       throw error;
// //     }
// //   }

// //   async generateItinerary(destination, duration, travelers, preferences) {
// //     const prompt = `
// //       Create a detailed ${duration}-day travel itinerary for ${destination}.
      
// //       TRIP DETAILS:
// //       - Destination: ${destination}
// //       - Duration: ${duration} days
// //       - Travelers: ${travelers}
// //       - Interests/Preferences: ${preferences}
      
// //       Return a JSON object with EXACTLY this structure (no other text):
// //       {
// //         "days": [
// //           {
// //             "day": 1,
// //             "places": [
// //               {
// //                 "name": "Place Name",
// //                 "description": "Detailed description of what to do and see"
// //               }
// //             ],
// //             "tips": "Practical tips for this day"
// //           }
// //         ],
// //         "hotels": [
// //           {
// //             "name": "Hotel Name",
// //             "price": "$XX/night",
// //             "rating": 4.5,
// //             "description": "Brief description"
// //           }
// //         ],
// //         "travelTips": ["Tip 1", "Tip 2", "Tip 3", "Tip 4", "Tip 5"]
// //       }
      
// //       Make it realistic, practical, and tailored to ${preferences} interests.
// //     `;
    
// //     return await this.callGemini(prompt);
// //   }

// //   async generateBudget(destination, duration, travelers, budgetLevel) {
// //     const prompt = `
// //       Calculate a detailed travel budget for ${destination} for ${duration} days.
      
// //       DETAILS:
// //       - Destination: ${destination}
// //       - Duration: ${duration} days
// //       - Travelers: ${travelers}
// //       - Budget Level: ${budgetLevel} (Budget, Mid-range, or Luxury)
      
// //       Return a JSON object with EXACTLY this structure:
// //       {
// //         "total": number,
// //         "accommodation": number,
// //         "food": number,
// //         "transport": number,
// //         "activities": number,
// //         "miscellaneous": number,
// //         "daily": number,
// //         "recommendations": ["tip 1", "tip 2", "tip 3"]
// //       }
      
// //       All numbers in USD.
// //     `;
    
// //     return await this.callGemini(prompt);
// //   }

// //   async getPlaceImage(placeName) {
// //     try {
// //       const response = await fetch(
// //         `https://api.unsplash.com/search/photos?query=${encodeURIComponent(placeName)}&per_page=1&client_id=${this.unsplashKey}`
// //       );
// //       const data = await response.json();
// //       if (data.results && data.results.length > 0) {
// //         return data.results[0].urls.small;
// //       }
// //       return null;
// //     } catch (error) {
// //       console.error("Unsplash error:", error);
// //       return null;
// //     }
// //   }
// // }

// // export default new ApiService();


// class ApiService {
//   constructor() {
//     this.geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
//     this.unsplashKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
//   }

//   async callGemini(prompt, retryCount = 0) {
//     try {
//       console.log(`Calling Gemini API (attempt ${retryCount + 1})...`);
      
//       const response = await fetch(
//         `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiKey}`,
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             contents: [{
//               parts: [{
//                 text: `${prompt}\n\nIMPORTANT: Return ONLY valid JSON, no other text.`
//               }]
//             }],
//             generationConfig: {
//               temperature: 0.7,
//               maxOutputTokens: 2000,
//             }
//           })
//         }
//       );

//       if (!response.ok) {
//         const error = await response.text();
//         console.error("Gemini API error:", error);
//         throw new Error(`Gemini API error: ${response.status}`);
//       }

//       const data = await response.json();
//       const text = data.candidates[0].content.parts[0].text;
      
//       const jsonMatch = text.match(/\{[\s\S]*\}/);
//       if (jsonMatch) {
//         return JSON.parse(jsonMatch[0]);
//       }
//       return JSON.parse(text);
      
//     } catch (error) {
//       console.error("Gemini API call failed:", error);
      
//       if (retryCount < 2) {
//         console.log(`Retrying... (${retryCount + 1}/2)`);
//         await new Promise(resolve => setTimeout(resolve, 1000));
//         return this.callGemini(prompt, retryCount + 1);
//       }
      
//       throw error;
//     }
//   }

//   async generateItinerary(destination, duration, travelers, preferences) {
//     const prompt = `
//       Create a detailed ${duration}-day travel itinerary for ${destination}.
      
//       TRIP DETAILS:
//       - Destination: ${destination}
//       - Duration: ${duration} days
//       - Travelers: ${travelers}
//       - Interests/Preferences: ${preferences}
      
//       Return a JSON object with EXACTLY this structure (no other text):
//       {
//         "days": [
//           {
//             "day": 1,
//             "places": [
//               {
//                 "name": "Place Name",
//                 "description": "Detailed description of what to do and see"
//               }
//             ],
//             "tips": "Practical tips for this day"
//           }
//         ],
//         "travelTips": ["Tip 1", "Tip 2", "Tip 3", "Tip 4", "Tip 5"],
//         "packingEssentials": {
//           "clothing": ["Item 1", "Item 2", "Item 3"],
//           "essentials": ["Item 1", "Item 2", "Item 3"],
//           "activities": ["Item 1", "Item 2", "Item 3"]
//         }
//       }
      
//       Make it realistic, practical, and tailored to ${preferences} interests.
//     `;
    
//     return await this.callGemini(prompt);
//   }

//   // NEW: Generate multiple hotels
// // src/services/apiService.js - Update the generateHotels method

// // src/services/apiService.js - Update the generateHotels method

// async generateHotels(destination, travelers, budgetLevel) {
//   const prompt = `
//     Generate 6-8 real hotels in ${destination} for ${travelers} with ${budgetLevel} budget.
    
//     Return ONLY a JSON array with EXACTLY this structure:
//     [
//       {
//         "name": "Hotel Name",
//         "price": "$$XX/night",
//         "rating": 4.5,
//         "description": "Brief description of the hotel",
//         "imageQuery": "hotel name + city for image search",
//         "amenities": ["Free WiFi", "Pool", "Restaurant", "Spa", "Parking"],
//         "location": "Area name",
//         "distance": "X km from city center",
//         "bestFor": "What type of traveler"
//       }
//     ]
    
//     Include a mix of budget, mid-range, and luxury options.
//     Make sure hotels are REAL hotels that exist in ${destination}.
//     For imageQuery, provide a search term like "Hotel Name City" for image lookup.
//   `;
  
//   const response = await this.callGemini(prompt);
//   let hotels = Array.isArray(response) ? response : [];
  
//   // Ensure we have at least 6 hotels
//   if (hotels.length < 6) {
//     hotels = [...hotels, ...this.getFallbackHotels(destination)];
//   }
  
//   // Add image URLs for each hotel
//   hotels = await this.addHotelImages(hotels);
  
//   return hotels;
// }

// async addHotelImages(hotels) {
//   const hotelsWithImages = [];
  
//   for (const hotel of hotels) {
//     const imageQuery = hotel.imageQuery || `${hotel.name} ${destination} hotel`;
//     const imageUrl = await this.getHotelImage(imageQuery);
//     hotelsWithImages.push({
//       ...hotel,
//       imageUrl: imageUrl || `https://source.unsplash.com/featured/?hotel,${encodeURIComponent(imageQuery)}`
//     });
//   }
  
//   return hotelsWithImages;
// }

// async getHotelImage(query) {
//   try {
//     const response = await fetch(
//       `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&client_id=${this.unsplashKey}`
//     );
//     const data = await response.json();
//     if (data.results && data.results.length > 0) {
//       return data.results[0].urls.regular;
//     }
//     return null;
//   } catch (error) {
//     console.error("Unsplash error:", error);
//     return null;
//   }
// }

// getFallbackHotels(destination) {
//   const fallbackHotels = {
//     "Lahore": [
//       { name: "Pearl Continental Lahore", price: "$150/night", rating: 4.8, description: "5-star luxury hotel", location: "Shahrah-e-Quaid-e-Azam", distance: "2 km from city center", amenities: ["Free WiFi", "Pool", "Spa", "Restaurant", "Gym"], bestFor: "Luxury travelers" },
//       { name: "Avari Hotel Lahore", price: "$120/night", rating: 4.6, description: "Premium hotel with excellent service", location: "Shahrah-e-Quaid-e-Azam", distance: "3 km from city center", amenities: ["Free WiFi", "Pool", "Restaurant", "Business Center"], bestFor: "Business travelers" },
//       { name: "Nishat Hotel", price: "$90/night", rating: 4.4, description: "Modern boutique hotel", location: "Gulberg", distance: "5 km from city center", amenities: ["Free WiFi", "Restaurant", "Gym", "Parking"], bestFor: "Couples" },
//       { name: "Luxus Grand Hotel", price: "$110/night", rating: 4.5, description: "Modern luxury hotel", location: "New Garden Town", distance: "6 km from city center", amenities: ["Free WiFi", "Pool", "Restaurant", "Gym", "Bar"], bestFor: "Families" }
//     ],
//     "Gilgit Baltistan": [
//       { name: "Serena Hotel Gilgit", price: "$120/night", rating: 4.7, description: "Luxury mountain resort", location: "Gilgit", distance: "2 km from city center", amenities: ["Free WiFi", "Restaurant", "Garden", "Parking"], bestFor: "Luxury travelers" },
//       { name: "PTDC Motel", price: "$80/night", rating: 4.0, description: "Government-run comfortable stay", location: "Fairy Meadows Road", distance: "15 km from city center", amenities: ["Restaurant", "Parking", "Mountain View"], bestFor: "Adventure travelers" },
//       { name: "Hunza Embassy Hotel", price: "$70/night", rating: 4.2, description: "Traditional hospitality", location: "Karimabad", distance: "3 km from city center", amenities: ["Free WiFi", "Restaurant", "Mountain View"], bestFor: "Culture lovers" }
//     ],
//     "default": [
//       { name: `${destination} Grand Hotel`, price: "$120/night", rating: 4.5, description: "Luxury hotel", location: "City Center", distance: "1 km", amenities: ["Free WiFi", "Pool", "Restaurant"], bestFor: "All travelers" },
//       { name: `${destination} Comfort Inn`, price: "$80/night", rating: 4.0, description: "Comfortable stay", location: "Downtown", distance: "2 km", amenities: ["Free WiFi", "Restaurant", "Parking"], bestFor: "Budget travelers" },
//       { name: `${destination} Boutique Hotel`, price: "$95/night", rating: 4.2, description: "Boutique experience", location: "City Center", distance: "1.5 km", amenities: ["Free WiFi", "Restaurant", "Gym"], bestFor: "Couples" }
//     ]
//   };
  
//   return fallbackHotels[destination] || fallbackHotels.default;
// }
// async generateAdditionalHotels(destination) {
//   const prompt = `
//     Generate 4 more hotels in ${destination} with different price ranges.
//     Return ONLY a JSON array with the same structure as above.
//   `;
//   const response = await this.callGemini(prompt);
//   return Array.isArray(response) ? response : [];
// }

//   async generateBudget(destination, duration, travelers, budgetLevel) {
//     const prompt = `
//       Calculate a detailed travel budget for ${destination} for ${duration} days.
      
//       DETAILS:
//       - Destination: ${destination}
//       - Duration: ${duration} days
//       - Travelers: ${travelers}
//       - Budget Level: ${budgetLevel} (Budget, Mid-range, or Luxury)
      
//       Return a JSON object with EXACTLY this structure:
//       {
//         "total": number,
//         "accommodation": number,
//         "food": number,
//         "transport": number,
//         "activities": number,
//         "miscellaneous": number,
//         "daily": number,
//         "recommendations": ["tip 1", "tip 2", "tip 3"]
//       }
      
//       All numbers in USD.
//     `;
    
//     return await this.callGemini(prompt);
//   }

//   async getPlaceImage(placeName) {
//     try {
//       const response = await fetch(
//         `https://api.unsplash.com/search/photos?query=${encodeURIComponent(placeName)}&per_page=1&client_id=${this.unsplashKey}`
//       );
//       const data = await response.json();
//       if (data.results && data.results.length > 0) {
//         return data.results[0].urls.small;
//       }
//       return null;
//     } catch (error) {
//       console.error("Unsplash error:", error);
//       return null;
//     }
//   }
// }

// export default new ApiService();

// src/services/apiService.js


// src/services/apiService.js

class ApiService {
  constructor() {
    this.geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
    this.unsplashKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
    // All available Gemini models (will try in order)
    this.modelNames = [
      "gemini-2.0-flash-exp",
      "gemini-1.5-flash", 
      "gemini-1.5-pro",
      "gemini-1.0-pro",
      "gemini-pro"
    ];
    this.currentModelIndex = 0;
  }

  async callGemini(prompt, retryCount = 0) {
    // Reset model index if we've tried all and still failing
    if (this.currentModelIndex >= this.modelNames.length) {
      console.log("All Gemini models failed, trying OpenRouter fallback...");
      return this.callOpenRouter(prompt);
    }

    try {
      const currentModel = this.modelNames[this.currentModelIndex];
      console.log(`🤖 Trying Gemini model: ${currentModel} (attempt ${retryCount + 1})...`);
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${this.geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `${prompt}\n\nIMPORTANT: Return ONLY valid JSON, no other text or markdown.`
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2500,
              topP: 0.9,
            }
          })
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error(`Gemini API error with ${currentModel}:`, error);
        
        // If model fails (404, 403, 503, etc.), try next model
        console.log(`Model ${currentModel} failed, moving to next model...`);
        this.currentModelIndex++;
        return this.callGemini(prompt, 0);
      }

      const data = await response.json();
      
      // Check if response has valid data
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        console.error(`Invalid response structure from ${currentModel}`);
        this.currentModelIndex++;
        return this.callGemini(prompt, 0);
      }
      
      const text = data.candidates[0].content.parts[0].text;
      console.log(`✅ Success with model: ${currentModel}`);
      
      // Clean the response - remove markdown code blocks
      let cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Extract JSON from response
      const jsonMatch = cleanText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(cleanText);
      
    } catch (error) {
      console.error(`Gemini API call failed for model ${this.modelNames[this.currentModelIndex]}:`, error);
      
      // Try next model on error
      this.currentModelIndex++;
      return this.callGemini(prompt, 0);
    }
  }

  async callOpenRouter(prompt) {
    try {
      console.log("🔄 Trying OpenRouter API as fallback...");
      
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "AI Travel Planner"
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-exp:free",
          messages: [
            {
              role: "system",
              content: "You are an expert travel planner. Always respond with ONLY valid JSON, no markdown, no explanations."
            },
            {
              role: "user",
              content: `${prompt}\n\nIMPORTANT: Return ONLY valid JSON. No markdown formatting, no code blocks, just pure JSON.`
            }
          ],
          temperature: 0.7,
          max_tokens: 2500
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenRouter error:", errorText);
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      let content = data.choices[0].message.content;
      
      // Clean the response - remove markdown code blocks
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Extract JSON
      const jsonMatch = content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return JSON.parse(content);
      
    } catch (error) {
      console.error("OpenRouter call failed:", error);
      throw new Error("All AI services failed. Please check your internet connection and API keys.");
    }
  }

  // Reset model index (call this before a new generation if needed)
  resetModelIndex() {
    this.currentModelIndex = 0;
    console.log("Model index reset to 0");
  }

  async generateItinerary(destination, duration, travelers, preferences, budgetLevel = "Standard") {
    this.resetModelIndex();
    
    const prompt = `
      Create a detailed ${duration}-day travel itinerary for ${destination}.
      
      TRIP DETAILS:
      - Destination: ${destination}
      - Duration: ${duration} days
      - Travelers: ${travelers}
      - Interests/Preferences: ${preferences}
      - Budget Level: ${budgetLevel}
      
      Return a VALID JSON object with EXACTLY this structure (no markdown, no explanations):
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
        "travelTips": ["Tip 1", "Tip 2", "Tip 3", "Tip 4", "Tip 5"],
        "packingEssentials": {
          "clothing": ["Item 1", "Item 2", "Item 3"],
          "essentials": ["Item 1", "Item 2", "Item 3"],
          "activities": ["Item 1", "Item 2", "Item 3"]
        }
      }
      
      Make it realistic, practical, and tailored to ${preferences} interests with a ${budgetLevel} budget.
      Include REAL places that exist in ${destination}.
    `;
    
    try {
      return await this.callGemini(prompt);
    } catch (error) {
      console.error("All AI services failed:", error);
      // Return a basic structure so the app doesn't crash
      return this.getFallbackItinerary(destination, duration);
    }
  }

  getFallbackItinerary(destination, duration) {
    console.log("Using fallback itinerary data");
    const days = [];
    for (let i = 1; i <= Math.min(duration, 3); i++) {
      days.push({
        day: i,
        places: [
          { name: `Explore ${destination}`, description: `Discover the beauty and culture of ${destination} on day ${i}.` },
          { name: "Local Attractions", description: "Visit popular landmarks and hidden gems." },
          { name: "Cultural Experience", description: "Immerse yourself in local traditions and cuisine." }
        ],
        tips: `Day ${i} - Start early, stay hydrated, and take lots of photos!`
      });
    }
    
    return {
      days: days,
      hotels: [
        { name: `${destination} Grand Hotel`, price: "$100/night", rating: 4.2, description: "Comfortable stay in the heart of the city" },
        { name: `${destination} Boutique Inn`, price: "$75/night", rating: 4.0, description: "Charming accommodation with local character" }
      ],
      travelTips: [
        "Carry cash as ATMs may be limited",
        "Pack appropriate clothing for the weather",
        "Book accommodations in advance",
        "Learn a few local phrases",
        "Stay hydrated and rest when needed"
      ],
      packingEssentials: {
        clothing: ["Comfortable shoes", "Weather-appropriate layers", "Hat and sunglasses"],
        essentials: ["Sunscreen", "First aid kit", "Power bank", "Water bottle"],
        activities: ["Camera", "Guidebook", "Local map"]
      }
    };
  }

  async generateHotels(destination, travelers, budgetLevel) {
    this.resetModelIndex();
    
    const prompt = `
      Generate 6-8 real hotels in ${destination} for ${travelers} with ${budgetLevel} budget.
      
      Return ONLY a JSON array with EXACTLY this structure (no markdown):
      [
        {
          "name": "Hotel Name",
          "price": "$XX/night",
          "rating": 4.5,
          "description": "Brief description of the hotel",
          "imageQuery": "hotel name + city for image search",
          "amenities": ["Free WiFi", "Pool", "Restaurant", "Spa", "Parking"],
          "location": "Area name",
          "distance": "X km from city center",
          "bestFor": "What type of traveler"
        }
      ]
      
      Include a mix of budget, mid-range, and luxury options.
      Make sure hotels are REAL hotels that exist in ${destination}.
    `;
    
    try {
      const response = await this.callGemini(prompt);
      let hotels = Array.isArray(response) ? response : [];
      
      if (hotels.length < 4) {
        hotels = [...hotels, ...this.getFallbackHotels(destination)];
      }
      
      hotels = await this.addHotelImages(hotels, destination);
      return hotels;
    } catch (error) {
      console.error("Hotel generation failed, using fallback:", error);
      return this.getFallbackHotels(destination);
    }
  }

  async addHotelImages(hotels, destination) {
    const hotelsWithImages = [];
    
    for (const hotel of hotels) {
      const imageQuery = hotel.imageQuery || `${hotel.name} ${destination}`;
      const imageUrl = await this.getHotelImage(imageQuery);
      hotelsWithImages.push({
        ...hotel,
        imageUrl: imageUrl || `https://source.unsplash.com/featured/?hotel,${encodeURIComponent(imageQuery)}`
      });
    }
    
    return hotelsWithImages;
  }

  async getHotelImage(query) {
    if (!this.unsplashKey) {
      return `https://source.unsplash.com/featured/?hotel,${encodeURIComponent(query)}`;
    }
    
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&client_id=${this.unsplashKey}`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results[0].urls.regular;
      }
      return `https://source.unsplash.com/featured/?hotel,${encodeURIComponent(query)}`;
    } catch (error) {
      console.error("Unsplash error:", error);
      return `https://source.unsplash.com/featured/?hotel,${encodeURIComponent(query)}`;
    }
  }

  getFallbackHotels(destination) {
    const fallbackHotels = {
      "Lahore": [
        { name: "Pearl Continental Lahore", price: "$150/night", rating: 4.8, description: "5-star luxury hotel", location: "Shahrah-e-Quaid-e-Azam", distance: "2 km", amenities: ["Free WiFi", "Pool", "Spa", "Restaurant"], bestFor: "Luxury travelers", imageUrl: "https://source.unsplash.com/featured/?luxury,hotel" },
        { name: "Avari Hotel Lahore", price: "$120/night", rating: 4.6, description: "Premium hotel", location: "Shahrah-e-Quaid-e-Azam", distance: "3 km", amenities: ["Free WiFi", "Pool", "Restaurant"], bestFor: "Business travelers", imageUrl: "https://source.unsplash.com/featured/?hotel,modern" },
        { name: "Nishat Hotel", price: "$90/night", rating: 4.4, description: "Modern boutique hotel", location: "Gulberg", distance: "5 km", amenities: ["Free WiFi", "Restaurant", "Gym"], bestFor: "Couples", imageUrl: "https://source.unsplash.com/featured/?boutique,hotel" }
      ],
      "Gilgit Baltistan": [
        { name: "Serena Hotel Gilgit", price: "$120/night", rating: 4.7, description: "Luxury mountain resort", location: "Gilgit", distance: "2 km", amenities: ["Free WiFi", "Restaurant", "Garden"], bestFor: "Luxury travelers", imageUrl: "https://source.unsplash.com/featured/?mountain,resort" },
        { name: "Hunza Embassy Hotel", price: "$70/night", rating: 4.2, description: "Traditional hospitality", location: "Karimabad", distance: "3 km", amenities: ["Free WiFi", "Restaurant", "Mountain View"], bestFor: "Culture lovers", imageUrl: "https://source.unsplash.com/featured/?valley,hotel" },
        { name: "PTDC Motel", price: "$50/night", rating: 3.8, description: "Budget friendly stay", location: "Fairy Meadows Road", distance: "15 km", amenities: ["Restaurant", "Parking"], bestFor: "Adventure travelers", imageUrl: "https://source.unsplash.com/featured/?mountain,view" }
      ],
      "default": [
        { name: `${destination} Grand Hotel`, price: "$120/night", rating: 4.5, description: "Luxury hotel in city center", location: "City Center", distance: "1 km", amenities: ["Free WiFi", "Pool", "Restaurant"], bestFor: "All travelers", imageUrl: "https://source.unsplash.com/featured/?hotel,luxury" },
        { name: `${destination} Comfort Inn`, price: "$80/night", rating: 4.0, description: "Comfortable budget stay", location: "Downtown", distance: "2 km", amenities: ["Free WiFi", "Restaurant", "Parking"], bestFor: "Budget travelers", imageUrl: "https://source.unsplash.com/featured/?hotel,budget" },
        { name: `${destination} Boutique Hotel`, price: "$95/night", rating: 4.2, description: "Charming boutique experience", location: "City Center", distance: "1.5 km", amenities: ["Free WiFi", "Restaurant", "Gym"], bestFor: "Couples", imageUrl: "https://source.unsplash.com/featured/?boutique,hotel" }
      ]
    };
    
    return fallbackHotels[destination] || fallbackHotels.default;
  }

  async generateBudget(destination, duration, travelers, budgetLevel) {
    this.resetModelIndex();
    
    const prompt = `
      Calculate a detailed travel budget for ${destination} for ${duration} days.
      
      DETAILS:
      - Destination: ${destination}
      - Duration: ${duration} days
      - Travelers: ${travelers}
      - Budget Level: ${budgetLevel}
      
      Return a JSON object with EXACTLY this structure (no markdown):
      {
        "total": number,
        "accommodation": number,
        "food": number,
        "transport": number,
        "activities": number,
        "miscellaneous": number,
        "daily": number,
        "recommendations": ["tip 1", "tip 2", "tip 3", "tip 4", "tip 5"]
      }
      
      All numbers in USD. Be realistic for ${destination}.
    `;
    
    try {
      return await this.callGemini(prompt);
    } catch (error) {
      console.error("Budget generation failed, using fallback:", error);
      // Calculate fallback budget
      const dailyBudget = budgetLevel === "Luxury" ? 300 : (budgetLevel === "Budget" ? 80 : 150);
      const total = dailyBudget * duration;
      return {
        total: total,
        accommodation: total * 0.4,
        food: total * 0.2,
        transport: total * 0.15,
        activities: total * 0.15,
        miscellaneous: total * 0.1,
        daily: total / duration,
        recommendations: [
          "Book accommodations in advance for better rates",
          "Use local transportation to save money",
          "Try local street food for authentic experience",
          "Look for combo deals for attractions",
          "Carry a reusable water bottle"
        ]
      };
    }
  }

  async getPlaceImage(placeName) {
    if (!this.unsplashKey) {
      return `https://source.unsplash.com/400x300/?${encodeURIComponent(placeName)}`;
    }
    
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(placeName)}&per_page=1&client_id=${this.unsplashKey}`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results[0].urls.small;
      }
      return `https://source.unsplash.com/400x300/?${encodeURIComponent(placeName)}`;
    } catch (error) {
      console.error("Unsplash error:", error);
      return `https://source.unsplash.com/400x300/?${encodeURIComponent(placeName)}`;
    }
  }
}

export default new ApiService();