// src/agents/BudgetAgent.js
class BudgetAgent {
  constructor() {
    this.name = "Budget Management Agent";
    this.expertise = "Managing and optimizing travel budget";
  }

  calculateBudget(plan, payload) {
    try {
      console.log(`🤖 ${this.name} is calculating your budget...`);
      
      const itineraryDays = plan?.days || [];
      const hotels = plan?.hotels || [];
      const budgetLevel = payload.budget;
      
      // Calculate total activities
      let totalActivities = 0;
      for (const day of itineraryDays) {
        totalActivities += day.places?.length || 0;
      }
      
      // Base cost calculation based on destination
      const baseCosts = this.getBaseCosts(payload.destination);
      
      // Calculate duration
      const duration = this.calculateDays(payload.startDate, payload.endDate);
      
      // Calculate traveler multiplier
      const travelerMultiplier = this.getTravelerMultiplier(payload.travelers);
      
      // Calculate budget based on level
      const budgetMultiplier = this.getBudgetMultiplier(budgetLevel);
      
      const accommodationCost = (hotels[0]?.price ? this.parsePrice(hotels[0].price) : baseCosts.accommodation) * duration * travelerMultiplier;
      const foodCost = baseCosts.food * duration * travelerMultiplier * budgetMultiplier;
      const transportCost = baseCosts.transport * duration * travelerMultiplier * budgetMultiplier;
      const activitiesCost = totalActivities * (budgetLevel === "Luxury" ? 50 : (budgetLevel === "Mid-range" ? 30 : 15));
      const miscellaneousCost = (accommodationCost + foodCost + transportCost + activitiesCost) * 0.1;
      
      const total = accommodationCost + foodCost + transportCost + activitiesCost + miscellaneousCost;
      
      return {
        total: Math.round(total),
        daily: Math.round(total / duration),
        breakdown: {
          accommodation: Math.round(accommodationCost),
          food: Math.round(foodCost),
          transport: Math.round(transportCost),
          activities: Math.round(activitiesCost),
          miscellaneous: Math.round(miscellaneousCost)
        },
        recommendations: this.getBudgetRecommendations(budgetLevel, total),
        currency: "USD"
      };
      
    } catch (error) {
      console.error("Budget Agent Error:", error);
      return this.getFallbackBudget(payload);
    }
  }

  getBaseCosts(destination) {
    const costs = {
      "Lahore": { accommodation: 80, food: 25, transport: 15 },
      "Gilgit Baltistan": { accommodation: 70, food: 20, transport: 20 },
      "Karachi": { accommodation: 75, food: 25, transport: 12 },
      "Islamabad": { accommodation: 85, food: 25, transport: 12 },
      "default": { accommodation: 70, food: 20, transport: 15 }
    };
    return costs[destination] || costs.default;
  }

  parsePrice(priceString) {
    const match = priceString.match(/\d+/);
    return match ? parseInt(match[0]) : 80;
  }

  calculateDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  getTravelerMultiplier(travelers) {
    if (travelers.includes("Solo")) return 1;
    if (travelers.includes("Couple")) return 1.8;
    if (travelers.includes("Family")) return 2.5;
    if (travelers.includes("Group")) return 3;
    return 2;
  }

  getBudgetMultiplier(budgetLevel) {
    if (budgetLevel === "Luxury") return 2;
    if (budgetLevel === "Mid-range") return 1;
    if (budgetLevel === "Budget") return 0.6;
    return 1;
  }

  getBudgetRecommendations(budgetLevel, totalBudget) {
    if (budgetLevel === "Budget") {
      return [
        "💡 Stay in hostels or budget hotels to save 40-50%",
        "🍜 Eat at local markets instead of tourist restaurants",
        "🚌 Use public transportation or walk",
        "🎫 Look for free walking tours and attractions"
      ];
    } else if (budgetLevel === "Mid-range") {
      return [
        "💰 Mix budget and luxury experiences for best value",
        "🎟️ Book popular attractions in advance for discounts",
        "🏨 Stay in 3-4 star hotels for good amenities",
        "🚗 Use ride-sharing apps for convenience"
      ];
    } else {
      return [
        "✨ Upgrade to premium experiences that are once-in-a-lifetime",
        "👨‍💼 Consider private tours for personalized experiences",
        "🏨 Book hotels with loyalty programs for perks",
        "🍽️ Try top-rated restaurants for authentic cuisine"
      ];
    }
  }

  getFallbackBudget(payload) {
    const duration = this.calculateDays(payload.startDate, payload.endDate);
    const travelerMultiplier = this.getTravelerMultiplier(payload.travelers);
    const budgetMultiplier = this.getBudgetMultiplier(payload.budget);
    const total = 100 * duration * travelerMultiplier * budgetMultiplier;
    
    return {
      total: Math.round(total),
      daily: Math.round(total / duration),
      breakdown: {
        accommodation: Math.round(total * 0.4),
        food: Math.round(total * 0.25),
        transport: Math.round(total * 0.15),
        activities: Math.round(total * 0.15),
        miscellaneous: Math.round(total * 0.05)
      },
      recommendations: this.getBudgetRecommendations(payload.budget, total),
      currency: "USD"
    };
  }
}

export { BudgetAgent };