// // src/agents/index.js
// import { ItineraryAgent } from './ItineraryAgent';
// import { BudgetAgent } from './BudgetAgent';
// import { MapAgent } from './MapAgent';
// import { ImageAgent } from './ImageAgent';

// // Create and export instances
// export const itineraryAgent = new ItineraryAgent();
// export const budgetAgent = new BudgetAgent();
// export const mapAgent = new MapAgent();
// export const imageAgent = new ImageAgent();

// // Export classes for potential future use

// export { ItineraryAgent, BudgetAgent, MapAgent, ImageAgent };

// agents/index.js  

import { ItineraryAgent } from './ItineraryAgent';
import { BudgetAgent } from './BudgetAgent';
import { MapAgent } from './MapAgent';
import { ImageAgent } from './ImageAgent';
import { FoodAgent } from './FoodAgent';

// Since they are objects, NOT classes, just export them directly   
 export const itineraryAgent = new ItineraryAgent();
export const budgetAgent = new BudgetAgent();
export const mapAgent = new MapAgent();
export const imageAgent = new ImageAgent();
export const foodAgent = new FoodAgent(imageAgent);

// Also export as named exports
export { ItineraryAgent, BudgetAgent, MapAgent, ImageAgent, FoodAgent };
