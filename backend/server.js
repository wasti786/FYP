// server.js
import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GOOGLE_API_KEY;
const MODEL = "models/gemini-2.5-flash";

/* ================================
   1️⃣ CHATBOT API
================================ */
const CHAT_SYSTEM_PROMPT = `
You are a helpful AI Travel Assistant.
Only answer travel-related questions.
If not related to travel, say:
"I'm sorry, I can only answer travel-related questions."
`;

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/${MODEL}:generateContent`,
      {
        contents: [
          { parts: [{ text: CHAT_SYSTEM_PROMPT }, { text: `User: ${message}` }] }
        ]
      },
      { headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY } }
    );

    const reply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn’t generate a response.";

    res.json({ reply });
  } catch (err) {
    console.error("Chatbot Error:", err.message);
    res.status(500).json({ error: "Chatbot failed" });
  }
});

/* ================================
   2️⃣ GENERATE TRAVEL PLAN API
================================ */
app.post("/api/generate-plan", async (req, res) => {
  const { destination, startDate, endDate, travelers, interests, budget } = req.body;

  if (!destination || !startDate || !endDate || !travelers) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }

  try {
    const prompt = `
Generate a travel itinerary in JSON format ONLY for the following trip:

Destination: ${destination}
Travelers: ${travelers}
Budget: ${budget || "Mid-range"}
Interests: ${interests || "Sightseeing, nature"}
Start Date: ${startDate}
End Date: ${endDate}

**Important rules:**
- For each day, provide exactly **2‑3 places** (no more).
- Each place must have:
  * "name": the place name
  * "description": a short description (1‑2 sentences) of what to see/do
  * "imageQuery": a keyword for searching an image (e.g., "Eiffel Tower Paris")
- Include a "tips" field for each day with practical advice.

Return JSON ONLY with this structure:
{
  "budget": "estimated budget",
  "hotels": [
    { "name": "Hotel name", "price": "per night price", "rating": 4.5, "features": ["WiFi", "Breakfast"] }
  ],
  "days": [
    {
      "day": 1,
      "places": [
        { "name": "Place name", "description": "...", "imageQuery": "keyword" },
        { "name": "Place name", "description": "...", "imageQuery": "keyword" }
        // max 3 places
      ],
      "tips": "travel tips for the day"
    }
  ],
  "travelTips": ["general tip 1", "general tip 2"]
}
`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/${MODEL}:generateContent`,
      { contents: [{ parts: [{ text: prompt }] }] },
      { headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY } }
    );

    const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return res.status(500).json({ success: false, error: "No AI response" });
    }

    let plan;
    try {
      // Remove possible markdown code fences
      const cleaned = rawText.replace(/```json|```/g, "").trim();
      plan = JSON.parse(cleaned);
    } catch (err) {
      console.error("JSON parse error:", err.message, rawText);
      return res.status(500).json({ success: false, error: "Failed to parse AI response" });
    }

    // Ensure days array exists and each day has the required fields
    if (!Array.isArray(plan.days)) plan.days = [];
    plan.days = plan.days.map((day, idx) => ({
      day: day.day || idx + 1,
      places: Array.isArray(day.places)
        ? day.places.slice(0, 3).map(p => ({
            name: p.name || "Unknown",
            description: p.description || "A must‑visit location.",
            imageQuery: p.imageQuery || p.name || "travel"
          }))
        : [],
      tips: day.tips || ""
    }));

    plan.hotels = Array.isArray(plan.hotels) ? plan.hotels : [];
    plan.travelTips = Array.isArray(plan.travelTips) ? plan.travelTips : [];

    res.json({ success: true, plan });

  } catch (err) {
    console.error("Generate Plan Error:", err.message);
    res.status(500).json({ success: false, error: "AI generation failed" });
  }
});

/* ================================
   3️⃣ SERVER START
================================ */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running at http://localhost:${PORT}`));