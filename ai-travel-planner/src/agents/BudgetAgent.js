
// class BudgetAgent {
//   constructor() {
//     this.name = "Budget Management Agent";
//     this.expertise = "Managing and optimizing travel budget";
//   }

//   calculateBudget(plan, payload) {
//     try {
//       console.log(`🤖 ${this.name} is calculating your budget...`);
      
//       const itineraryDays = plan?.days || [];
//       const hotels = plan?.hotels || [];
//       const budgetLevel = payload.budget;
      
//       // Calculate total activities
//       let totalActivities = 0;
//       for (const day of itineraryDays) {
//         totalActivities += day.places?.length || 0;
//       }
      
//       // Base cost calculation based on destination
//       const baseCosts = this.getBaseCosts(payload.destination);
      
//       // Calculate duration
//       const duration = this.calculateDays(payload.startDate, payload.endDate);
      
//       // Calculate traveler multiplier
//       const travelerMultiplier = this.getTravelerMultiplier(payload.travelers);
      
//       // Calculate budget based on level
//       const budgetMultiplier = this.getBudgetMultiplier(budgetLevel);
      
//       // Calculate accommodation cost - now using average of multiple hotels
//       let accommodationCost;
//       if (hotels.length > 0) {
//         // Calculate average price from all hotels
//         const totalHotelPrice = hotels.reduce((sum, hotel) => {
//           return sum + this.parsePrice(hotel.price);
//         }, 0);
//         const avgHotelPrice = totalHotelPrice / hotels.length;
//         accommodationCost = avgHotelPrice * duration * travelerMultiplier;
//       } else {
//         accommodationCost = baseCosts.accommodation * duration * travelerMultiplier;
//       }
      
//       const foodCost = baseCosts.food * duration * travelerMultiplier * budgetMultiplier;
//       const transportCost = baseCosts.transport * duration * travelerMultiplier * budgetMultiplier;
//       const activitiesCost = totalActivities * (budgetLevel === "Luxury" ? 50 : (budgetLevel === "Mid-range" ? 30 : 15));
//       const miscellaneousCost = (accommodationCost + foodCost + transportCost + activitiesCost) * 0.1;
      
//       const total = accommodationCost + foodCost + transportCost + activitiesCost + miscellaneousCost;
      
//       return {
//         total: Math.round(total),
//         daily: Math.round(total / duration),
//         breakdown: {
//           accommodation: Math.round(accommodationCost),
//           food: Math.round(foodCost),
//           transport: Math.round(transportCost),
//           activities: Math.round(activitiesCost),
//           miscellaneous: Math.round(miscellaneousCost)
//         },
//         recommendations: this.getBudgetRecommendations(budgetLevel, total),
//         currency: "USD"
//       };
      
//     } catch (error) {
//       console.error("Budget Agent Error:", error);
//       return this.getFallbackBudget(payload);
//     }
//   }

//   getBaseCosts(destination) {
//     const costs = {
//       "Lahore": { accommodation: 80, food: 25, transport: 15 },
//       "Gilgit Baltistan": { accommodation: 70, food: 20, transport: 20 },
//       "Karachi": { accommodation: 75, food: 25, transport: 12 },
//       "Islamabad": { accommodation: 85, food: 25, transport: 12 },
//       "default": { accommodation: 70, food: 20, transport: 15 }
//     };
//     return costs[destination] || costs.default;
//   }

//   parsePrice(priceString) {
//     // Handle different price formats like "$120/night", "$120", "120 USD", etc.
//     if (!priceString) return 80;
//     const match = priceString.match(/\d+/);
//     return match ? parseInt(match[0]) : 80;
//   }

//   calculateDays(startDate, endDate) {
//     const start = new Date(startDate);
//     const end = new Date(endDate);
//     const diffTime = Math.abs(end - start);
//     return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
//   }

//   getTravelerMultiplier(travelers) {
//     if (travelers.includes("Solo")) return 1;
//     if (travelers.includes("Couple")) return 1.8;
//     if (travelers.includes("Family")) return 2.5;
//     if (travelers.includes("Group")) return 3;
//     return 2;
//   }

//   getBudgetMultiplier(budgetLevel) {
//     if (budgetLevel === "Luxury") return 2;
//     if (budgetLevel === "Mid-range") return 1;
//     if (budgetLevel === "Budget") return 0.6;
//     return 1;
//   }

//   getBudgetRecommendations(budgetLevel, totalBudget) {
//     if (budgetLevel === "Budget") {
//       return [
//         "💡 Stay in hostels or budget hotels to save 40-50%",
//         "🍜 Eat at local markets instead of tourist restaurants",
//         "🚌 Use public transportation or walk",
//         "🎫 Look for free walking tours and attractions"
//       ];
//     } else if (budgetLevel === "Mid-range") {
//       return [
//         "💰 Mix budget and luxury experiences for best value",
//         "🎟️ Book popular attractions in advance for discounts",
//         "🏨 Stay in 3-4 star hotels for good amenities",
//         "🚗 Use ride-sharing apps for convenience"
//       ];
//     } else {
//       return [
//         "✨ Upgrade to premium experiences that are once-in-a-lifetime",
//         "👨‍💼 Consider private tours for personalized experiences",
//         "🏨 Book hotels with loyalty programs for perks",
//         "🍽️ Try top-rated restaurants for authentic cuisine"
//       ];
//     }
//   }

//   getFallbackBudget(payload) {
//     const duration = this.calculateDays(payload.startDate, payload.endDate);
//     const travelerMultiplier = this.getTravelerMultiplier(payload.travelers);
//     const budgetMultiplier = this.getBudgetMultiplier(payload.budget);
//     const total = 100 * duration * travelerMultiplier * budgetMultiplier;
    
//     return {
//       total: Math.round(total),
//       daily: Math.round(total / duration),
//       breakdown: {
//         accommodation: Math.round(total * 0.4),
//         food: Math.round(total * 0.25),
//         transport: Math.round(total * 0.15),
//         activities: Math.round(total * 0.15),
//         miscellaneous: Math.round(total * 0.05)
//       },
//       recommendations: this.getBudgetRecommendations(payload.budget, total),
//       currency: "USD"
//     };
//   }
// }

// export { BudgetAgent };

// // agents/BudgetAgent.js

// // export class BudgetAgent {
// //   constructor() {
// //     this.name = "Budget Management Agent";
// //     this.expertise = "Managing and optimizing travel budget";
// //   }

// //   calculateBudget(plan, payload) {
// //     try {
// //       console.log(`🤖 ${this.name} is calculating your budget...`);
// //       console.log("Plan hotels:", plan?.hotels);
// //       console.log("Payload budget level:", payload?.budget);
      
// //       const itineraryDays = plan?.days || [];
// //       const hotels = plan?.hotels || [];
// //       const budgetLevel = payload?.budget || "Standard ($1,000 - $2,000)";
      
// //       // Calculate total activities count
// //       let totalActivities = 0;
// //       for (const day of itineraryDays) {
// //         totalActivities += day.places?.length || 0;
// //       }
      
// //       // Calculate duration
// //       const duration = this.calculateDays(payload.startDate, payload.endDate);
      
// //       // Calculate traveler multiplier
// //       const travelerMultiplier = this.getTravelerMultiplier(payload.travelers);
      
// //       // Get budget multiplier based on selected budget level
// //       const budgetMultiplier = this.getBudgetMultiplier(budgetLevel);
      
// //       // Base daily costs (in USD)
// //       const baseDailyCost = this.getBaseDailyCost(payload.destination);
      
// //       // Calculate total budget
// //       let totalBudget = baseDailyCost.baseTotal * duration * travelerMultiplier * budgetMultiplier;
      
// //       // Calculate accommodation cost - use hotel prices from plan if available
// //       let accommodationCost;
// //       if (hotels && hotels.length > 0) {
// //         // Calculate average price from all hotels
// //         let totalHotelPrice = 0;
// //         let validHotels = 0;
        
// //         for (const hotel of hotels) {
// //           const price = this.parsePrice(hotel.price);
// //           if (price > 0) {
// //             totalHotelPrice += price;
// //             validHotels++;
// //           }
// //         }
        
// //         if (validHotels > 0) {
// //           const avgHotelPrice = totalHotelPrice / validHotels;
// //           // Hotels are usually per night, multiply by duration
// //           accommodationCost = avgHotelPrice * duration * (travelerMultiplier > 1 ? travelerMultiplier / 2 : travelerMultiplier);
// //         } else {
// //           accommodationCost = baseDailyCost.accommodation * duration * travelerMultiplier * budgetMultiplier;
// //         }
// //       } else {
// //         accommodationCost = baseDailyCost.accommodation * duration * travelerMultiplier * budgetMultiplier;
// //       }
      
// //       // Calculate other costs with proper distribution
// //       const foodCost = baseDailyCost.food * duration * travelerMultiplier * budgetMultiplier;
// //       const transportCost = baseDailyCost.transport * duration * travelerMultiplier * budgetMultiplier;
      
// //       // Activities cost based on number of activities and budget level
// //       let activitiesCost;
// //       if (budgetLevel?.toLowerCase().includes("luxury")) {
// //         activitiesCost = totalActivities * 60;
// //       } else if (budgetLevel?.toLowerCase().includes("premium")) {
// //         activitiesCost = totalActivities * 45;
// //       } else if (budgetLevel?.toLowerCase().includes("standard")) {
// //         activitiesCost = totalActivities * 30;
// //       } else if (budgetLevel?.toLowerCase().includes("economy")) {
// //         activitiesCost = totalActivities * 20;
// //       } else {
// //         activitiesCost = totalActivities * 15;
// //       }
      
// //       // Multiply by duration factor
// //       activitiesCost = activitiesCost * (duration / 3);
      
// //       // Miscellaneous (10% buffer)
// //       const miscellaneousCost = (accommodationCost + foodCost + transportCost + activitiesCost) * 0.1;
      
// //       // Calculate final total
// //       const total = accommodationCost + foodCost + transportCost + activitiesCost + miscellaneousCost;
      
// //       // Adjust total if it exceeds the budget range
// //       const adjustedTotal = this.adjustToBudgetRange(total, budgetLevel);
      
// //       // Recalculate breakdown proportions based on adjusted total
// //       const proportions = this.getBudgetProportions(budgetLevel);
      
// //       const finalBreakdown = {
// //         accommodation: Math.round(adjustedTotal * proportions.accommodation),
// //         food: Math.round(adjustedTotal * proportions.food),
// //         transport: Math.round(adjustedTotal * proportions.transport),
// //         activities: Math.round(adjustedTotal * proportions.activities),
// //         miscellaneous: Math.round(adjustedTotal * proportions.miscellaneous)
// //       };
      
// //       return {
// //         total: Math.round(adjustedTotal),
// //         daily: Math.round(adjustedTotal / duration),
// //         breakdown: finalBreakdown,
// //         recommendations: this.getBudgetRecommendations(budgetLevel, adjustedTotal, payload.destination),
// //         currency: "USD",
// //         budgetLevel: budgetLevel,
// //         duration: duration,
// //         travelers: payload.travelers,
// //         activitiesCount: totalActivities
// //       };
      
// //     } catch (error) {
// //       console.error("Budget Agent Error:", error);
// //       return this.getFallbackBudget(payload);
// //     }
// //   }

// //   getBaseDailyCost(destination) {
// //     // Base daily costs per person (in USD)
// //     const costs = {
// //       "Gilgit Baltistan": { accommodation: 45, food: 20, transport: 25, baseTotal: 150 },
// //       "Skardu": { accommodation: 50, food: 22, transport: 30, baseTotal: 160 },
// //       "Hunza": { accommodation: 48, food: 20, transport: 25, baseTotal: 155 },
// //       "Naran Kaghan": { accommodation: 40, food: 18, transport: 20, baseTotal: 130 },
// //       "Lahore": { accommodation: 55, food: 25, transport: 15, baseTotal: 140 },
// //       "Karachi": { accommodation: 50, food: 25, transport: 18, baseTotal: 138 },
// //       "Islamabad": { accommodation: 60, food: 25, transport: 15, baseTotal: 145 },
// //       "default": { accommodation: 45, food: 20, transport: 20, baseTotal: 140 }
// //     };
    
// //     // Find matching destination
// //     let match = costs.default;
// //     for (const [key, value] of Object.entries(costs)) {
// //       if (destination?.toLowerCase().includes(key.toLowerCase()) || 
// //           key.toLowerCase().includes(destination?.toLowerCase())) {
// //         match = value;
// //         break;
// //       }
// //     }
    
// //     return match;
// //   }

// //   parsePrice(priceString) {
// //     if (!priceString) return 45;
    
// //     // Handle string prices like "PKR 3,000", "$120/night", etc.
// //     if (typeof priceString === 'string') {
// //       const match = priceString.match(/\d+/g);
// //       if (match) {
// //         let price = parseInt(match[0]);
// //         // Convert PKR to USD (approx 280 PKR = 1 USD)
// //         if (priceString.includes("PKR")) {
// //           price = Math.round(price / 280);
// //         }
// //         return price;
// //       }
// //     }
    
// //     // If it's already a number
// //     if (typeof priceString === 'number') return priceString;
    
// //     return 45; // Default fallback
// //   }

// //   calculateDays(startDate, endDate) {
// //     const start = new Date(startDate);
// //     const end = new Date(endDate);
// //     const diffTime = Math.abs(end - start);
// //     return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
// //   }

// //   getTravelerMultiplier(travelers) {
// //     if (!travelers) return 2;
// //     if (travelers.includes("Solo")) return 1;
// //     if (travelers.includes("Couple")) return 1.8;
// //     if (travelers.includes("Family")) return 2.5;
// //     if (travelers.includes("Group")) return 4;
// //     if (travelers.includes("Large Group")) return 6;
// //     return 2;
// //   }

// //   getBudgetMultiplier(budgetLevel) {
// //     const level = budgetLevel?.toLowerCase() || "standard";
    
// //     if (level.includes("budget")) return 0.5;
// //     if (level.includes("economy")) return 0.75;
// //     if (level.includes("standard")) return 1.0;
// //     if (level.includes("premium")) return 1.8;
// //     if (level.includes("luxury")) return 3.0;
// //     return 1.0;
// //   }

// //   getBudgetProportions(budgetLevel) {
// //     const level = budgetLevel?.toLowerCase() || "standard";
    
// //     if (level.includes("budget")) {
// //       return {
// //         accommodation: 0.25,  // 25% - cheapest stays
// //         food: 0.20,           // 20% - local food
// //         transport: 0.20,      // 20% - public transport
// //         activities: 0.20,     // 20% - free/cheap activities
// //         miscellaneous: 0.15   // 15% - buffer
// //       };
// //     }
    
// //     if (level.includes("economy")) {
// //       return {
// //         accommodation: 0.30,
// //         food: 0.20,
// //         transport: 0.20,
// //         activities: 0.20,
// //         miscellaneous: 0.10
// //       };
// //     }
    
// //     if (level.includes("standard")) {
// //       return {
// //         accommodation: 0.35,
// //         food: 0.20,
// //         transport: 0.15,
// //         activities: 0.20,
// //         miscellaneous: 0.10
// //       };
// //     }
    
// //     if (level.includes("premium")) {
// //       return {
// //         accommodation: 0.40,
// //         food: 0.20,
// //         transport: 0.15,
// //         activities: 0.18,
// //         miscellaneous: 0.07
// //       };
// //     }
    
// //     if (level.includes("luxury")) {
// //       return {
// //         accommodation: 0.45,
// //         food: 0.18,
// //         transport: 0.12,
// //         activities: 0.20,
// //         miscellaneous: 0.05
// //       };
// //     }
    
// //     return {
// //       accommodation: 0.35,
// //       food: 0.20,
// //       transport: 0.15,
// //       activities: 0.20,
// //       miscellaneous: 0.10
// //     };
// //   }

// //   adjustToBudgetRange(total, budgetLevel) {
// //     const level = budgetLevel?.toLowerCase() || "standard";
    
// //     const ranges = {
// //       budget: { min: 300, max: 800 },
// //       economy: { min: 600, max: 1200 },
// //       standard: { min: 1000, max: 2000 },
// //       premium: { min: 1800, max: 3500 },
// //       luxury: { min: 3500, max: 6000 }
// //     };
    
// //     let range = ranges.standard;
// //     if (level.includes("budget")) range = ranges.budget;
// //     else if (level.includes("economy")) range = ranges.economy;
// //     else if (level.includes("standard")) range = ranges.standard;
// //     else if (level.includes("premium")) range = ranges.premium;
// //     else if (level.includes("luxury")) range = ranges.luxury;
    
// //     if (total < range.min) return range.min;
// //     if (total > range.max) return range.max;
// //     return total;
// //   }

// //   getBudgetRecommendations(budgetLevel, totalBudget, destination) {
// //     const level = budgetLevel?.toLowerCase() || "standard";
// //     const dailyBudget = Math.round(totalBudget / 3); // Assuming 3-day trip
    
// //     if (level.includes("budget")) {
// //       return [
// //         `💰 Your daily budget is ~$${dailyBudget}. Here's how to save:`,
// //         "🏨 Stay in guesthouses or hostels ($20-30/night)",
// //         "🍜 Eat at local dhabas - delicious and cheap ($5-8/meal)",
// //         "🚌 Use local transport (vans/buses) instead of private jeeps",
// //         "🎫 Many viewpoints are free - enjoy nature without spending",
// //         "💡 Carry snacks and water to avoid tourist prices"
// //       ];
// //     }
    
// //     if (level.includes("economy")) {
// //       return [
// //         `💵 Your daily budget is ~$${dailyBudget}. Smart spending tips:`,
// //         "🏨 Book mid-range hotels 2-3 weeks in advance",
// //         "🍽️ Mix of local restaurants and occasional nice dinners",
// //         "🚐 Share jeeps with other travelers to split costs",
// //         "🎟️ Book attraction combos for discounts",
// //         "💡 Look for hotels that include breakfast"
// //       ];
// //     }
    
// //     if (level.includes("standard")) {
// //       return [
// //         `✨ Your daily budget is ~$${dailyBudget}. Comfortable travel:`,
// //         "🏨 3-star hotels with good amenities and views",
// //         "🍷 Enjoy nice dinners at recommended restaurants",
// //         "🚗 Rent a private car for flexibility",
// //         "🎯 Book popular attractions in advance",
// //         "💡 Allocate extra for souvenir shopping"
// //       ];
// //     }
    
// //     if (level.includes("premium")) {
// //       return [
// //         `🌟 Your daily budget is ~$${dailyBudget}. Premium experience:`,
// //         "🏨 4-star hotels with valley-facing rooms",
// //         "🍽️ Fine dining at top-rated restaurants",
// //         "🚁 Consider helicopter tours for unique views",
// //         "👨‍💼 Private guided tours for personalized experience",
// //         "💡 Request early check-in/late check-out"
// //       ];
// //     }
    
// //     if (level.includes("luxury")) {
// //       return [
// //         `👑 Your daily budget is ~$${dailyBudget}. Ultimate luxury:`,
// //         "🏨 5-star resorts with personal butler service",
// //         "🍷 Private chef experiences and Michelin-star dining",
// //         "🚁 Charter private helicopter for mountain tours",
// //         "✨ Exclusive experiences with VIP access",
// //         "💡 Utilize concierge for unique local experiences"
// //       ];
// //     }
    
// //     return [
// //       "📝 Plan ahead to get the best rates",
// //       "🎫 Book popular attractions online",
// //       "🚐 Share transport with other travelers",
// //       "🍜 Try local food for authentic experience"
// //     ];
// //   }

// //   getFallbackBudget(payload) {
// //     const duration = this.calculateDays(payload.startDate, payload.endDate);
// //     const travelerMultiplier = this.getTravelerMultiplier(payload.travelers);
// //     const budgetMultiplier = this.getBudgetMultiplier(payload.budget);
// //     const proportions = this.getBudgetProportions(payload.budget);
    
// //     const total = 140 * duration * travelerMultiplier * budgetMultiplier;
    
// //     return {
// //       total: Math.round(total),
// //       daily: Math.round(total / duration),
// //       breakdown: {
// //         accommodation: Math.round(total * proportions.accommodation),
// //         food: Math.round(total * proportions.food),
// //         transport: Math.round(total * proportions.transport),
// //         activities: Math.round(total * proportions.activities),
// //         miscellaneous: Math.round(total * proportions.miscellaneous)
// //       },
// //       recommendations: this.getBudgetRecommendations(payload.budget, total, payload.destination),
// //       currency: "USD",
// //       budgetLevel: payload.budget,
// //       duration: duration,
// //       travelers: payload.travelers,
// //       activitiesCount: 0
// //     };
// //   }
// // }

// // // Export an instance for direct use
// // export const budgetAgent = new BudgetAgent();

// agents/BudgetAgent.js

export class BudgetAgent {
  constructor() {
    this.name = "Budget Management Agent";
    this.expertise = "Managing and optimizing travel budget";
  }

  calculateBudget(plan, payload) {
    try {
      console.log(`🤖 ${this.name} is calculating your budget...`);
      console.log("Plan hotels:", plan?.hotels);
      console.log("Payload budget level:", payload?.budget);
      
      const itineraryDays = plan?.days || [];
      const hotels = plan?.hotels || [];
      const budgetLevel = payload?.budget || "Standard ($1,000 - $2,000)";
      
      // Calculate total activities count
      let totalActivities = 0;
      for (const day of itineraryDays) {
        totalActivities += day.places?.length || 0;
      }
      
      // Calculate duration
      const duration = this.calculateDays(payload.startDate, payload.endDate);
      
      // Calculate traveler multiplier
      const travelerMultiplier = this.getTravelerMultiplier(payload.travelers);
      
      // Get budget multiplier based on selected budget level
      const budgetMultiplier = this.getBudgetMultiplier(budgetLevel);
      
      // Base daily costs (in USD)
      const baseDailyCost = this.getBaseDailyCost(payload.destination);
      
      // Calculate total budget
      let totalBudget = baseDailyCost.baseTotal * duration * travelerMultiplier * budgetMultiplier;
      
      // Calculate accommodation cost - use hotel prices from plan if available
      let accommodationCost;
      if (hotels && hotels.length > 0) {
        // Calculate average price from all hotels
        let totalHotelPrice = 0;
        let validHotels = 0;
        
        for (const hotel of hotels) {
          const price = this.parsePrice(hotel.price);
          if (price > 0) {
            totalHotelPrice += price;
            validHotels++;
          }
        }
        
        if (validHotels > 0) {
          const avgHotelPrice = totalHotelPrice / validHotels;
          // Hotels are usually per night, multiply by duration
          accommodationCost = avgHotelPrice * duration * (travelerMultiplier > 1 ? travelerMultiplier / 2 : travelerMultiplier);
        } else {
          accommodationCost = baseDailyCost.accommodation * duration * travelerMultiplier * budgetMultiplier;
        }
      } else {
        accommodationCost = baseDailyCost.accommodation * duration * travelerMultiplier * budgetMultiplier;
      }
      
      // Calculate other costs with proper distribution
      const foodCost = baseDailyCost.food * duration * travelerMultiplier * budgetMultiplier;
      const transportCost = baseDailyCost.transport * duration * travelerMultiplier * budgetMultiplier;
      
      // Activities cost based on number of activities and budget level
      let activitiesCost;
      if (budgetLevel?.toLowerCase().includes("luxury")) {
        activitiesCost = totalActivities * 60;
      } else if (budgetLevel?.toLowerCase().includes("premium")) {
        activitiesCost = totalActivities * 45;
      } else if (budgetLevel?.toLowerCase().includes("standard")) {
        activitiesCost = totalActivities * 30;
      } else if (budgetLevel?.toLowerCase().includes("economy")) {
        activitiesCost = totalActivities * 20;
      } else {
        activitiesCost = totalActivities * 15;
      }
      
      // Multiply by duration factor
      activitiesCost = activitiesCost * (duration / 3);
      
      // Miscellaneous (10% buffer)
      const miscellaneousCost = (accommodationCost + foodCost + transportCost + activitiesCost) * 0.1;
      
      // Calculate final total
      const total = accommodationCost + foodCost + transportCost + activitiesCost + miscellaneousCost;
      
      // Adjust total if it exceeds the budget range
      let adjustedTotal = this.adjustToBudgetRange(total, budgetLevel);

      // If the label contains an explicit numeric cap (e.g. "Under $500"), enforce it strictly
      try {
        const capInfo = this.parseBudgetLabel(budgetLevel);
        if (capInfo && typeof capInfo.max === 'number') {
          adjustedTotal = Math.min(adjustedTotal, Math.round(capInfo.max));
        }
        if (capInfo && typeof capInfo.min === 'number') {
          adjustedTotal = Math.max(adjustedTotal, Math.round(capInfo.min));
        }
      } catch (e) {
        // ignore parse errors
      }

      // Recalculate breakdown proportions based on adjusted total
      const proportions = this.getBudgetProportions(budgetLevel);

      let finalBreakdown = {
        accommodation: Math.round(adjustedTotal * proportions.accommodation),
        food: Math.round(adjustedTotal * proportions.food),
        transport: Math.round(adjustedTotal * proportions.transport),
        activities: Math.round(adjustedTotal * proportions.activities),
        miscellaneous: Math.round(adjustedTotal * proportions.miscellaneous)
      };

      // Fix rounding drift so breakdown sums to adjustedTotal
      const sumParts = Object.values(finalBreakdown).reduce((s, v) => s + (v || 0), 0);
      const diff = Math.round(adjustedTotal) - sumParts;
      if (diff !== 0) {
        // Prefer adding/subtracting remainder to accommodation (largest category)
        finalBreakdown.accommodation = (finalBreakdown.accommodation || 0) + diff;
      }

      return {
        total: Math.round(adjustedTotal),
        daily: Math.round(adjustedTotal / Math.max(duration, 1)),
        breakdown: finalBreakdown,
        recommendations: this.getBudgetRecommendations(budgetLevel, adjustedTotal, payload.destination),
        currency: "USD",
        budgetLevel: budgetLevel,
        duration: duration,
        travelers: payload.travelers,
        activitiesCount: totalActivities
      };
      
    } catch (error) {
      console.error("Budget Agent Error:", error);
      return this.getFallbackBudget(payload);
    }
  }

  // Parse budget label for numeric caps/ranges, returns {min?, max?}
  parseBudgetLabel(label) {
    if (!label) return {};
    try {
      const raw = label.toString();
      const lower = raw.toLowerCase();
      const matches = raw.match(/\d[\d,]*/g) || [];
      const nums = matches.map(n => parseInt(n.replace(/,/g, ''), 10)).filter(Boolean);

      if (nums.length >= 2) {
        let a = nums[0];
        let b = nums[1];
        if (a > b) [a, b] = [b, a];
        return { min: a, max: b };
      }

      if (nums.length === 1) {
        const n = nums[0];
        if (lower.includes('under') || lower.includes('below') || raw.includes('<')) {
          return { min: Math.max(50, Math.round(n * 0.4)), max: n };
        }
        if (lower.includes('over') || lower.includes('above') || raw.includes('>')) {
          return { min: n, max: Math.round(n * 3) };
        }
        return { min: Math.max(50, Math.round(n * 0.5)), max: Math.round(n * 1.2) };
      }

      return {};
    } catch (e) {
      return {};
    }
  }

  getBaseDailyCost(destination) {
    // Base daily costs per person (in USD)
    const costs = {
      "Gilgit Baltistan": { accommodation: 45, food: 20, transport: 25, baseTotal: 150 },
      "Skardu": { accommodation: 50, food: 22, transport: 30, baseTotal: 160 },
      "Hunza": { accommodation: 48, food: 20, transport: 25, baseTotal: 155 },
      "Naran Kaghan": { accommodation: 40, food: 18, transport: 20, baseTotal: 130 },
      "Lahore": { accommodation: 55, food: 25, transport: 15, baseTotal: 140 },
      "Karachi": { accommodation: 50, food: 25, transport: 18, baseTotal: 138 },
      "Islamabad": { accommodation: 60, food: 25, transport: 15, baseTotal: 145 },
      "default": { accommodation: 45, food: 20, transport: 20, baseTotal: 140 }
    };
    
    // Find matching destination
    let match = costs.default;
    for (const [key, value] of Object.entries(costs)) {
      if (destination?.toLowerCase().includes(key.toLowerCase()) || 
          key.toLowerCase().includes(destination?.toLowerCase())) {
        match = value;
        break;
      }
    }
    
    return match;
  }

  parsePrice(priceString) {
    if (!priceString) return 45;
    
    // Handle string prices like "PKR 3,000", "$120/night", etc.
    if (typeof priceString === 'string') {
      const match = priceString.match(/\d+/g);
      if (match) {
        let price = parseInt(match[0]);
        // Convert PKR to USD (approx 280 PKR = 1 USD)
        if (priceString.includes("PKR")) {
          price = Math.round(price / 280);
        }
        return price;
      }
    }
    
    // If it's already a number
    if (typeof priceString === 'number') return priceString;
    
    return 45; // Default fallback
  }

  calculateDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  getTravelerMultiplier(travelers) {
    if (!travelers) return 2;
    if (travelers.includes("Solo")) return 1;
    if (travelers.includes("Couple")) return 1.8;
    if (travelers.includes("Family")) return 2.5;
    if (travelers.includes("Group")) return 4;
    if (travelers.includes("Large Group")) return 6;
    return 2;
  }

  getBudgetMultiplier(budgetLevel) {
    const level = budgetLevel?.toLowerCase() || "standard";
    
    if (level.includes("budget")) return 0.5;
    if (level.includes("economy")) return 0.75;
    if (level.includes("standard")) return 1.0;
    if (level.includes("premium")) return 1.8;
    if (level.includes("luxury")) return 3.0;
    return 1.0;
  }

  getBudgetProportions(budgetLevel) {
    const level = budgetLevel?.toLowerCase() || "standard";
    
    if (level.includes("budget")) {
      return {
        accommodation: 0.25,  // 25% - cheapest stays
        food: 0.20,           // 20% - local food
        transport: 0.20,      // 20% - public transport
        activities: 0.20,     // 20% - free/cheap activities
        miscellaneous: 0.15   // 15% - buffer
      };
    }
    
    if (level.includes("economy")) {
      return {
        accommodation: 0.30,
        food: 0.20,
        transport: 0.20,
        activities: 0.20,
        miscellaneous: 0.10
      };
    }
    
    if (level.includes("standard")) {
      return {
        accommodation: 0.35,
        food: 0.20,
        transport: 0.15,
        activities: 0.20,
        miscellaneous: 0.10
      };
    }
    
    if (level.includes("premium")) {
      return {
        accommodation: 0.40,
        food: 0.20,
        transport: 0.15,
        activities: 0.18,
        miscellaneous: 0.07
      };
    }
    
    if (level.includes("luxury")) {
      return {
        accommodation: 0.45,
        food: 0.18,
        transport: 0.12,
        activities: 0.20,
        miscellaneous: 0.05
      };
    }
    
    return {
      accommodation: 0.35,
      food: 0.20,
      transport: 0.15,
      activities: 0.20,
      miscellaneous: 0.10
    };
  }

  adjustToBudgetRange(total, budgetLevel) {
    const level = (budgetLevel || "").toString().toLowerCase();

    // Try to parse explicit numeric ranges or caps from the label, e.g. "Under $500" or "$1,000 - $2,000"
    try {
      const raw = (budgetLevel || "").toString();
      const numMatches = raw.match(/\d[\d,]*/g) || [];
      const nums = numMatches.map((n) => parseInt(n.replace(/,/g, ""), 10)).filter(Boolean);

      if (nums.length >= 2) {
        // explicit min-max like "$1,000 - $2,000"
        let min = nums[0];
        let max = nums[1];
        if (min > max) [min, max] = [max, min];
        if (total < min) return min;
        if (total > max) return max;
        return total;
      }

      if (nums.length === 1) {
        const n = nums[0];
        if (level.includes("under") || level.includes("below") || raw.includes("<")) {
          const min = Math.max(50, Math.round(n * 0.4));
          const max = n;
          if (total < min) return min;
          if (total > max) return max;
          return total;
        }
        if (level.includes("over") || level.includes("above") || raw.includes(">")) {
          const min = n;
          const max = Math.round(n * 3);
          if (total < min) return min;
          if (total > max) return max;
          return total;
        }
        // generic single number: treat it as an approximate max
        const approxMin = Math.max(50, Math.round(n * 0.5));
        const approxMax = Math.max(n, Math.round(n * 1.4));
        if (total < approxMin) return approxMin;
        if (total > approxMax) return approxMax;
        return total;
      }
    } catch (e) {
      // fall back to predefined ranges on parse error
      console.warn('adjustToBudgetRange parse failed', e);
    }

    // Fallback predefined ranges
    const ranges = {
      budget: { min: 300, max: 800 },
      economy: { min: 600, max: 1200 },
      standard: { min: 1000, max: 2000 },
      premium: { min: 1800, max: 3500 },
      luxury: { min: 3500, max: 6000 }
    };

    let range = ranges.standard;
    if (level.includes("budget")) range = ranges.budget;
    else if (level.includes("economy")) range = ranges.economy;
    else if (level.includes("standard")) range = ranges.standard;
    else if (level.includes("premium")) range = ranges.premium;
    else if (level.includes("luxury")) range = ranges.luxury;

    if (total < range.min) return range.min;
    if (total > range.max) return range.max;
    return total;
  }

  getBudgetRecommendations(budgetLevel, totalBudget, destination) {
    const level = budgetLevel?.toLowerCase() || "standard";
    const dailyBudget = Math.round(totalBudget / 3); // Assuming 3-day trip
    
    if (level.includes("budget")) {
      return [
        `💰 Your daily budget is ~$${dailyBudget}. Here's how to save:`,
        "🏨 Stay in guesthouses or hostels ($20-30/night)",
        "🍜 Eat at local dhabas - delicious and cheap ($5-8/meal)",
        "🚌 Use local transport (vans/buses) instead of private jeeps",
        "🎫 Many viewpoints are free - enjoy nature without spending",
        "💡 Carry snacks and water to avoid tourist prices"
      ];
    }
    
    if (level.includes("economy")) {
      return [
        `💵 Your daily budget is ~$${dailyBudget}. Smart spending tips:`,
        "🏨 Book mid-range hotels 2-3 weeks in advance",
        "🍽️ Mix of local restaurants and occasional nice dinners",
        "🚐 Share jeeps with other travelers to split costs",
        "🎟️ Book attraction combos for discounts",
        "💡 Look for hotels that include breakfast"
      ];
    }
    
    if (level.includes("standard")) {
      return [
        `✨ Your daily budget is ~$${dailyBudget}. Comfortable travel:`,
        "🏨 3-star hotels with good amenities and views",
        "🍷 Enjoy nice dinners at recommended restaurants",
        "🚗 Rent a private car for flexibility",
        "🎯 Book popular attractions in advance",
        "💡 Allocate extra for souvenir shopping"
      ];
    }
    
    if (level.includes("premium")) {
      return [
        `🌟 Your daily budget is ~$${dailyBudget}. Premium experience:`,
        "🏨 4-star hotels with valley-facing rooms",
        "🍽️ Fine dining at top-rated restaurants",
        "🚁 Consider helicopter tours for unique views",
        "👨‍💼 Private guided tours for personalized experience",
        "💡 Request early check-in/late check-out"
      ];
    }
    
    if (level.includes("luxury")) {
      return [
        `👑 Your daily budget is ~$${dailyBudget}. Ultimate luxury:`,
        "🏨 5-star resorts with personal butler service",
        "🍷 Private chef experiences and Michelin-star dining",
        "🚁 Charter private helicopter for mountain tours",
        "✨ Exclusive experiences with VIP access",
        "💡 Utilize concierge for unique local experiences"
      ];
    }
    
    return [
      "📝 Plan ahead to get the best rates",
      "🎫 Book popular attractions online",
      "🚐 Share transport with other travelers",
      "🍜 Try local food for authentic experience"
    ];
  }

  getFallbackBudget(payload) {
    const duration = this.calculateDays(payload.startDate, payload.endDate);
    const travelerMultiplier = this.getTravelerMultiplier(payload.travelers);
    const budgetMultiplier = this.getBudgetMultiplier(payload.budget);
    const proportions = this.getBudgetProportions(payload.budget);
    
    const total = 140 * duration * travelerMultiplier * budgetMultiplier;
    
    return {
      total: Math.round(total),
      daily: Math.round(total / duration),
      breakdown: {
        accommodation: Math.round(total * proportions.accommodation),
        food: Math.round(total * proportions.food),
        transport: Math.round(total * proportions.transport),
        activities: Math.round(total * proportions.activities),
        miscellaneous: Math.round(total * proportions.miscellaneous)
      },
      recommendations: this.getBudgetRecommendations(payload.budget, total, payload.destination),
      currency: "USD",
      budgetLevel: payload.budget,
      duration: duration,
      travelers: payload.travelers,
      activitiesCount: 0
    };
  }

  // NEW: Optimize an existing plan's budget according to user preferences
  optimizeBudget(plan = {}, userPreferences = {}) {
    try {
      const durationFromPlan = Array.isArray(plan.days) && plan.days.length > 0 ? plan.days.length : null;
      const duration = durationFromPlan || this.calculateDays(userPreferences.startDate || new Date().toISOString(), userPreferences.endDate || new Date().toISOString());

      const prefs = {
        accommodationType: "standard", // budget | standard | luxury
        transportMode: "public", // public | private
        activityIntensity: "medium", // low | medium | high
        foodPreference: "restaurant", // street | restaurant | premium
        destination: plan.destination || userPreferences.destination || "",
        startDate: userPreferences.startDate,
        endDate: userPreferences.endDate,
        travelers: userPreferences.travelers || userPreferences.travellers || "Couple",
        budget: userPreferences.budget || userPreferences.budgetLevel || null,
        ...userPreferences,
      };

      let budgetLabel = prefs.budget;
      if (!budgetLabel) {
        if (prefs.accommodationType === "budget") budgetLabel = "Budget";
        else if (prefs.accommodationType === "luxury") budgetLabel = "Luxury";
        else budgetLabel = "Standard";
      }

      // Use existing calculateBudget to get a realistic baseline
      const baseline = this.calculateBudget(plan, {
        destination: prefs.destination,
        startDate: prefs.startDate,
        endDate: prefs.endDate,
        travelers: prefs.travelers,
        budget: budgetLabel,
      }) || this.getFallbackBudget({ startDate: prefs.startDate, endDate: prefs.endDate, travelers: prefs.travelers, budget: budgetLabel });

      const base = baseline.breakdown || {};
      // Ensure we have numbers for each category
      const totalFromBaseline = baseline.total || (Object.values(base).reduce((s, v) => s + (v || 0), 0) || 0);
      const proportions = this.getBudgetProportions(budgetLabel || "standard");
      if (!base.accommodation) base.accommodation = Math.round(totalFromBaseline * proportions.accommodation);
      if (!base.food) base.food = Math.round(totalFromBaseline * proportions.food);
      if (!base.transport) base.transport = Math.round(totalFromBaseline * proportions.transport);
      if (!base.activities) base.activities = Math.round(totalFromBaseline * proportions.activities);
      if (!base.miscellaneous) base.miscellaneous = Math.round(totalFromBaseline * proportions.miscellaneous);

      // Multipliers for optimization choices
      const accommodationMultipliers = { budget: 0.6, standard: 1.0, luxury: 1.6 };
      const transportMultipliers = { public: 0.6, private: 1.4 };
      const activityMultipliers = { low: 0.6, medium: 1.0, high: 1.4 };
      const foodMultipliers = { street: 0.6, restaurant: 1.0, premium: 1.6 };

      const acMult = accommodationMultipliers[prefs.accommodationType] || 1.0;
      const trMult = transportMultipliers[prefs.transportMode] || 1.0;
      const actMult = activityMultipliers[prefs.activityIntensity] || 1.0;
      const foMult = foodMultipliers[prefs.foodPreference] || 1.0;

      const optimizedBreakdown = {
        accommodation: Math.round((base.accommodation || 0) * acMult),
        food: Math.round((base.food || 0) * foMult),
        transport: Math.round((base.transport || 0) * trMult),
        activities: Math.round((base.activities || 0) * actMult),
      };

      optimizedBreakdown.miscellaneous = Math.round((optimizedBreakdown.accommodation + optimizedBreakdown.food + optimizedBreakdown.transport + optimizedBreakdown.activities) * 0.1);

      const totalOptimized = Object.values(optimizedBreakdown).reduce((s, v) => s + (v || 0), 0);

      const savings = Math.max(Math.round((baseline.total || totalFromBaseline) - totalOptimized), 0);

      const suggestions = [];
      if (prefs.transportMode === "public") {
        suggestions.push("Switch to local transport to save money on transfers");
      } else {
        suggestions.push("Consider mixing public and private transport for big savings");
      }

      if (prefs.accommodationType === "budget") suggestions.push("Choose guest houses or homestays instead of hotels");
      if (prefs.accommodationType === "standard") suggestions.push("Mix mid-range hotels with a guesthouse for value");
      if (prefs.accommodationType === "luxury") suggestions.push("Upgrade one or two nights to premium rooms for special experiences");

      if (prefs.activityIntensity === "low") suggestions.push("Reduce paid attractions and enjoy free nature walks");
      if (prefs.activityIntensity === "high") suggestions.push("Prioritise must-do paid activities and book in advance for discounts");

      if (prefs.foodPreference === "street") suggestions.push("Try street food stalls for authentic taste and lower costs");
      if (prefs.foodPreference === "premium") suggestions.push("Reserve a few premium dinners and eat local for other meals");

      // Round and return
      // If user provided an explicit numeric budget cap, enforce it by scaling breakdown down to fit
      try {
        const capInfo = this.parseBudgetLabel(prefs.budget);
        if (capInfo && typeof capInfo.max === 'number' && totalOptimized > 0) {
          const cap = Math.round(capInfo.max);
          if (totalOptimized > cap) {
            const scale = cap / totalOptimized;
            optimizedBreakdown = Object.keys(optimizedBreakdown).reduce((acc, k) => {
              acc[k] = Math.max(0, Math.round((optimizedBreakdown[k] || 0) * scale));
              return acc;
            }, {});
            // recalc misc to keep proportions
            optimizedBreakdown.miscellaneous = Math.round((optimizedBreakdown.accommodation + optimizedBreakdown.food + optimizedBreakdown.transport + optimizedBreakdown.activities) * 0.1);
          }
        }
      } catch (e) {
        // ignore
      }

      const finalTotalOptimized = Object.values(optimizedBreakdown).reduce((s, v) => s + (v || 0), 0);

      return {
        total: Math.round(finalTotalOptimized),
        daily: Math.round(finalTotalOptimized / Math.max(duration || 1, 1)),
        optimizedBreakdown,
        savings,
        suggestions,
        currency: baseline.currency || "USD",
        appliedPreferences: prefs,
      };
    } catch (error) {
      console.error("optimizeBudget error:", error);
      return {
        total: 0,
        daily: 0,
        optimizedBreakdown: {
          accommodation: 0,
          food: 0,
          transport: 0,
          activities: 0,
          miscellaneous: 0,
        },
        savings: 0,
        suggestions: ["Failed to optimize budget"],
        currency: "USD",
      };
    }
  }
}

// Export an instance for direct use
export const budgetAgent = new BudgetAgent();