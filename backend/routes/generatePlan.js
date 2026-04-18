
// import express from "express";

// const router = express.Router();

// router.post("/generate-plan", async (req, res) => {
//   const {
//     destination,
//     startDate,
//     endDate,
//     travelers,
//     budget,
//     preferences,
//   } = req.body;

//   try {
//     console.log("Incoming Trip Request:", req.body);

//     const mockPlan = {
//       budget: {
//         total: 180000,
//         hotel: 60000,
//         transport: 50000,
//         food: 40000,
//         activities: 30000,
//       },

//       hotels: [ 
//         { name: "Serena Hotel Gilgit", price: 20000 },
//         { name: "Hunza Inn", price: 15000 },
//       ],

//       days: [
//         {
//           day: 1,
//           places: [
//             {
//               name: "Rakaposhi Viewpoint",
//               imageQuery: "Rakaposhi Viewpoint Gilgit",
//             },
//             {
//               name: "Hunza Valley",
//               imageQuery: "Hunza Valley mountains Pakistan",
//             },
//             {
//               name: "Baltit Fort",
//               imageQuery: "Baltit Fort Hunza",
//             },
//           ],
//         },
//         {
//           day: 2,
//           places: [
//             {
//               name: "Attabad Lake",
//               imageQuery: "Attabad Lake Hunza Pakistan",
//             },
//             {
//               name: "Passu Cones",
//               imageQuery: "Passu Cones Gilgit Baltistan",
//             },
//             {
//               name: "Hussaini Suspension Bridge",
//               imageQuery: "Hussaini Suspension Bridge Hunza",
//             },
//           ],
//         },
//         {
//           day: 3,
//           places: [
//             {
//               name: "Naltar Valley",
//               imageQuery: "Naltar Valley Gilgit",
//             },
//             {
//               name: "Kargah Buddha",
//               imageQuery: "Kargah Buddha Gilgit",
//             },
//             {
//               name: "Gilgit Bazaar",
//               imageQuery: "Gilgit Bazaar market",
//             },
//           ],
//         },
//       ],
//     };

//     // -----------------------------
//     // SEND RESPONSE
//     // -----------------------------
//     res.json({
//       success: true,
//       plan: mockPlan,
//     });
//   } catch (err) {
//     console.error("Generate Plan Error:", err);
//     res.status(500).json({
//       success: false,
//       error: "Server error while generating itinerary",
//     });
//   }
// });

// export default router;


import express from "express";

const router = express.Router();

// ---------- MOCK AI ENDPOINT (Places-Only Structure) ----------
router.post("/generate-plan", async (req, res) => {
  const {
    destination,
    startDate,
    endDate,
    travelers,
    budget,
    preferences,
  } = req.body;

  try {
    console.log("Incoming Trip Request:", req.body);

    // -----------------------------
    // BUDGET-BASED PRICING LOGIC
    // -----------------------------
    const getBudgetMultiplier = (budgetLevel) => {
      if (budgetLevel?.includes("Budget")) return 0.5;
      if (budgetLevel?.includes("Economy")) return 0.75;
      if (budgetLevel?.includes("Standard")) return 1.0;
      if (budgetLevel?.includes("Premium")) return 1.5;
      if (budgetLevel?.includes("Luxury")) return 2.5;
      return 1.0; // Default
    };

    const multiplier = getBudgetMultiplier(budget);
    
    // Base prices (Standard budget: ~180,000 PKR)
    const baseTotal = 180000;
    const baseHotel = 60000;
    const baseTransport = 50000;
    const baseFood = 40000;
    const baseActivities = 30000;

    // Calculate budget based on multiplier
    const total = Math.round(baseTotal * multiplier);
    const hotel = Math.round(baseHotel * multiplier);
    const transport = Math.round(baseTransport * multiplier);
    const food = Math.round(baseFood * multiplier);
    const activities = Math.round(baseActivities * multiplier);

    // -----------------------------
    // BUDGET-BASED HOTEL SELECTION
    // -----------------------------
    const getHotelsByBudget = (budgetLevel) => {
      if (budgetLevel?.includes("Budget")) {
        return [
          { name: "Madina Hotel Gilgit", price: 3000 },
          { name: "Central Park Hotel Hunza", price: 4000 },
          { name: "Tourist Cottage Gilgit", price: 2500 },
        ];
      }
      if (budgetLevel?.includes("Economy")) {
        return [
          { name: "Hunza Embassy Hotel", price: 6000 },
          { name: "Hill Top Hotel Gilgit", price: 7000 },
          { name: "Old Hunza Inn", price: 5500 },
        ];
      }
      if (budgetLevel?.includes("Standard")) {
        return [
          { name: "Serena Hotel Gilgit", price: 20000 },
          { name: "Hunza Inn", price: 15000 },
          { name: "Luxus Hunza", price: 18000 },
        ];
      }
      if (budgetLevel?.includes("Premium")) {
        return [
          { name: "Serena Hotel Gilgit (Premium Suite)", price: 35000 },
          { name: "Eagle's Nest Hotel Hunza", price: 30000 },
          { name: "Hunza Serena Inn", price: 28000 },
        ];
      }
      if (budgetLevel?.includes("Luxury")) {
        return [
          { name: "Serena Hotel Gilgit (Royal Suite)", price: 60000 },
          { name: "Hunza Luxury Resort", price: 55000 },
          { name: "Mountain Glow Resort", price: 50000 },
        ];
      }
      return [
        { name: "Serena Hotel Gilgit", price: 20000 },
        { name: "Hunza Inn", price: 15000 },
      ];
    };

    // -----------------------------
    // BUDGET-BASED PLACES (Adds variety based on budget)
    // -----------------------------
    const getPlacesByBudget = (budgetLevel) => {
      const basePlaces = {
        day1: [
          { name: "Rakaposhi Viewpoint", imageQuery: "Rakaposhi Viewpoint Gilgit" },
          { name: "Hunza Valley", imageQuery: "Hunza Valley mountains Pakistan" },
          { name: "Baltit Fort", imageQuery: "Baltit Fort Hunza" },
        ],
        day2: [
          { name: "Attabad Lake", imageQuery: "Attabad Lake Hunza Pakistan" },
          { name: "Passu Cones", imageQuery: "Passu Cones Gilgit Baltistan" },
          { name: "Hussaini Suspension Bridge", imageQuery: "Hussaini Suspension Bridge Hunza" },
        ],
        day3: [
          { name: "Naltar Valley", imageQuery: "Naltar Valley Gilgit" },
          { name: "Kargah Buddha", imageQuery: "Kargah Buddha Gilgit" },
          { name: "Gilgit Bazaar", imageQuery: "Gilgit Bazaar market" },
        ],
      };

      // Add premium/luxury activities for higher budgets
      if (budgetLevel?.includes("Premium") || budgetLevel?.includes("Luxury")) {
        basePlaces.day1.push({ 
          name: "Private Guided Tour of Hunza", 
          imageQuery: "Hunza guided tour guide" 
        });
        basePlaces.day2.push({ 
          name: "Helicopter Tour Over Passu Cones", 
          imageQuery: "Passu Cones helicopter view" 
        });
        basePlaces.day3.push({ 
          name: "Local Cultural Dinner Experience", 
          imageQuery: "Gilgit cultural dinner local food" 
        });
      }

      // Add budget-friendly alternatives for budget travelers
      if (budgetLevel?.includes("Budget")) {
        basePlaces.day1.push({ 
          name: "Free Walking Tour of Karimabad", 
          imageQuery: "Karimabad Hunza walking tour" 
        });
        basePlaces.day2.push({ 
          name: "Sunset Photography at Attabad (Free)", 
          imageQuery: "Attabad Lake sunset" 
        });
      }

      return basePlaces;
    };

    const placesByBudget = getPlacesByBudget(budget);
    const hotelsByBudget = getHotelsByBudget(budget);

    // -----------------------------
    // MOCK PLAN (Budget-Aware)
    // -----------------------------
    const mockPlan = {
      budget: {
        total: total,
        hotel: hotel,
        transport: transport,
        food: food,
        activities: activities,
        currency: "PKR",
        budgetLevel: budget || "Standard",
      },

      hotels: hotelsByBudget,

      days: [
        {
          day: 1,
          places: placesByBudget.day1,
        },
        {
          day: 2,
          places: placesByBudget.day2,
        },
        {
          day: 3,
          places: placesByBudget.day3,
        },
      ],

      travelTips: [
        "Carry cash as ATMs are limited in remote areas",
        "Pack warm clothes even in summer",
        "Book jeeps in advance for Fairy Meadows",
        `Based on your ${budget || "Standard"} budget, we've optimized recommendations`,
      ],
    };

    // Add budget-specific tips
    if (budget?.includes("Budget")) {
      mockPlan.travelTips.unshift("💰 Budget tip: Use local transport (vans) instead of private jeeps");
      mockPlan.travelTips.unshift("🍽️ Save money by eating at local dhabas instead of hotels");
    }
    if (budget?.includes("Luxury") || budget?.includes("Premium")) {
      mockPlan.travelTips.unshift("✨ Premium experience: Book private guides and helicopter tours in advance");
      mockPlan.travelTips.unshift("🏨 Luxury tip: Request valley-facing rooms for best views");
    }

    // -----------------------------
    // SEND RESPONSE
    // -----------------------------
    res.json({
      success: true,
      plan: mockPlan,
    });
  } catch (err) {
    console.error("Generate Plan Error:", err);
    res.status(500).json({
      success: false,
      error: "Server error while generating itinerary",
    });
  }
});

export default router;