const express = require("express");
const axios = require("axios");
const router = express.Router();

// POST /api/ai/messages
router.post("/messages", async (req, res) => {
  const { objective } = req.body;

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-chat-v3-0324:free", // Free model
        messages: [
          {
            role: "user",
            content: `Generate 3 short, friendly marketing messages to: ${objective}. Each message should be 1 sentence and suitable for SMS or email.`,
          },
        ],
        temperature: 0.8,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000", // Optional
          "X-Title": "Mini CRM", // Optional
        },
      }
    );

    const content = response.data.choices[0].message.content;
    const messages = content
      .split("\n")
      .map((line) => line.replace(/^\d+\.\s*/, "").trim())
      .filter(Boolean);

    res.json({ messages });
  } catch (err) {
    console.error("❌ OpenRouter API error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to generate messages." });
  }
});

module.exports = router;
