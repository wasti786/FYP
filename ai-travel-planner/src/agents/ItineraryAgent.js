
import apiService from '../services/apiService';

class ItineraryAgent {
  constructor() {
    this.name = "Itinerary Planner Agent";
    this.expertise = "Creating day-by-day travel itineraries using Gemini AI";
  }

  async generateItinerary(destination, startDate, endDate, preferences, travelers) {
    try {
      console.log(`🤖 ${this.name} is planning your trip...`);
      
      const duration = this.calculateDays(startDate, endDate);
      
      // Generate itinerary (without hotels)
      const itinerary = await apiService.generateItinerary(
        destination,
        duration,
        travelers,
        preferences
      );
      
      // Generate hotels separately
      const budgetLevel = "Mid-range"; // You can pass this from payload
      const hotels = await apiService.generateHotels(destination, travelers, budgetLevel);
      
      return {
        ...itinerary,
        hotels: hotels
      };
      
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



