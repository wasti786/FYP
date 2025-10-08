import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/chat", async (req, res) => {
  const HF_API_KEY = process.env.HF_API_KEY || "YOUR_HF_API_KEY_HERE";
  const MODEL = "facebook/blenderbot-400M-distill";

  try {
    const { message } = req.body;

    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${MODEL}`,
      { inputs: message },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reply =
      response.data?.[0]?.generated_text || "Sorry, I couldn’t generate a response.";

    res.json({ reply });
  } catch (error) {
    console.error("❌ Hugging Face API Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Error communicating with Hugging Face API" });
  }
});

// ✅ Proper default export
export default router;
