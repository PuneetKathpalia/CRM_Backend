const axios = require("axios");

const generateMessageIdeas = async (req, res) => {
  const { objective } = req.body;

  try {
    const response = await axios.post(
      "https://api.perplexity.ai/chat/completions",
      {
        model: "llama-3-sonar-small-32k-online",
        messages: [
          {
            role: "system",
            content: "You're a CRM marketing assistant that writes engaging campaign messages.",
          },
          {
            role: "user",
            content: `Generate 3 short and catchy SMS messages to ${objective}`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const content = response.data.choices[0].message.content;
    res.json({ messages: content });
  } catch (err) {
    console.error("AI generation error:", err?.response?.data || err.message);
    res.status(500).json({ error: "AI generation failed." });
  }
};

module.exports = { generateMessageIdeas };
