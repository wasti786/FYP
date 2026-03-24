// src/agents/ItineraryAgent.js
class ItineraryAgent {
  constructor() {
    this.name = "Itinerary Planner Agent";
    this.expertise = "Creating day-by-day travel itineraries";
  }

  async generateItinerary(destination, startDate, endDate, preferences, travelers) {
    try {
      console.log(`🤖 ${this.name} is planning your trip to ${destination}...`);
      
      // Call your existing backend API
      const payload = {
        destination,
        startDate,
        endDate,
        travelers,
        preferences
      };
      
      const response = await fetch("http://localhost:5000/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || "AI generation failed");
      }

      if (!data.plan?.days?.length) {
        throw new Error("No itinerary returned from AI");
      }

      return data.plan;
      
    } catch (error) {
      console.error("Itinerary Agent Error:", error);
      throw error;
    }
  }

  calculateDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
}

export { ItineraryAgent };