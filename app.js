import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

// ✅ Replace with your actual frontend URL
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// CORS config
app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json());

// ✅ Simple health check route
app.get("/", (req, res) => {
  res.send({ message: "Blog generator backend is up and running." });
});

// ✅ Main POST route
app.post("/api/generate-blog", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: [{ role: "user", content: `Write a blog about: ${prompt}` }],
        temperature: 0.7,
        max_tokens: 800,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const blogText = response.data.choices[0]?.message?.content?.trim();
    res.json({ blog: blogText });
  } catch (error) {
    console.error(error?.response?.data || error.message);
    res.status(500).json({ error: "Failed to generate blog" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
