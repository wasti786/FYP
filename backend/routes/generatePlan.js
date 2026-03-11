// import express from "express";
// const router = express.Router();

// // ---------- TEST / MOCK AI ENDPOINT ----------
// router.post("/generate-plan", async (req, res) => {
//   const { destination, startDate, endDate, travelers, budget, preferences } = req.body;

//   try {
    
//     const mockPlan = {
//       budget: {
//         total: 180000,
//         hotel: 60000,
//         transport: 50000,
//         food: 40000,
//         activities: 30000
//       },
//       hotels: [
//         { name: "Serena Hotel Gilgit", price: 20000 },
//         { name: "Hunza Inn", price: 15000 }
//       ],
//       days: [
//         {
//           day: 1,
//           title: "Arrival & Local Exploration",
//           morning: "Arrival and hotel check-in",
//           afternoon: "Explore local bazaar",
//           evening: "Dinner with mountain view",
//           tips: "Carry warm clothes"
//         },
//         {
//           day: 2,
//           title: "Hiking and Sightseeing",
//           morning: "Hike to Rakaposhi Viewpoint",
//           afternoon: "Visit Karimabad village",
//           evening: "Local cuisine dinner",
//           tips: "Wear comfortable shoes"
//         },
//         {
//           day: 3,
//           title: "Relaxation & Departure",
//           morning: "Breakfast and leisure walk",
//           afternoon: "Check out & departure",
//           evening: "Travel back home",
//           tips: "Keep souvenirs safely"
//         }
//       ]
//     };

//     res.json({ success: true, plan: mockPlan });

//   } catch (err) {
//     console.error("Test Plan Error:", err);
//     res.status(500).json({ success: false, error: "Server error" });
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
    // MOCK PLAN (Places per Day)
    // -----------------------------
    const mockPlan = {
      budget: {
        total: 180000,
        hotel: 60000,
        transport: 50000,
        food: 40000,
        activities: 30000,
      },

      hotels: [
        { name: "Serena Hotel Gilgit", price: 20000 },
        { name: "Hunza Inn", price: 15000 },
      ],

      days: [
        {
          day: 1,
          places: [
            {
              name: "Rakaposhi Viewpoint",
              imageQuery: "Rakaposhi Viewpoint Gilgit",
            },
            {
              name: "Hunza Valley",
              imageQuery: "Hunza Valley mountains Pakistan",
            },
            {
              name: "Baltit Fort",
              imageQuery: "Baltit Fort Hunza",
            },
          ],
        },
        {
          day: 2,
          places: [
            {
              name: "Attabad Lake",
              imageQuery: "Attabad Lake Hunza Pakistan",
            },
            {
              name: "Passu Cones",
              imageQuery: "Passu Cones Gilgit Baltistan",
            },
            {
              name: "Hussaini Suspension Bridge",
              imageQuery: "Hussaini Suspension Bridge Hunza",
            },
          ],
        },
        {
          day: 3,
          places: [
            {
              name: "Naltar Valley",
              imageQuery: "Naltar Valley Gilgit",
            },
            {
              name: "Kargah Buddha",
              imageQuery: "Kargah Buddha Gilgit",
            },
            {
              name: "Gilgit Bazaar",
              imageQuery: "Gilgit Bazaar market",
            },
          ],
        },
      ],
    };

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