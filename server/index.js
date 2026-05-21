require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: "https://lazybooksy.netlify.app" }));
app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const store = { readingList: {}, ratings: {} };

app.post("/api/suggest", async (req, res) => {
  const { query } = req.body;
  if (!query?.trim()) return res.status(400).json({ error: "Query is required" });
  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: `You are a book curator. Suggest exactly 6 books for: "${query}". Return ONLY a JSON array, no markdown, no backticks, no explanation:\n[{"title":"","author":"","year":2000,"genre":"","emoji":"","reason":"","isbn":""}]` }],
        temperature: 0.7,
        max_tokens: 1500,
      },
      { headers: { Authorization: `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" } }
    );
    const text = response.data.choices[0].message.content;
    const clean = text.replace(/```json|```/g, "").trim();
    const books = JSON.parse(clean);
    const tagged = books.map((b) => ({
      ...b,
      id: uuidv4(),
      key: `${b.title.toLowerCase().replace(/\s+/g, "-")}-${b.author.toLowerCase().replace(/\s+/g, "-")}`,
    }));
    res.json({ books: tagged });
  } catch (err) {
    console.error("Suggest error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to get suggestions" });
  }
});

app.get("/api/cover", async (req, res) => {
  const { title, author, isbn } = req.query;
  try {
    const q = isbn ? `isbn:${isbn}` : `intitle:${encodeURIComponent(title)}+inauthor:${encodeURIComponent(author)}`;
    const { data } = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1`);
    const item = data.items?.[0];
    const cover = item?.volumeInfo?.imageLinks?.thumbnail?.replace("http://", "https://") || null;
    res.json({ cover, description: item?.volumeInfo?.description || null });
  } catch { res.json({ cover: null, description: null }); }
});

app.get("/api/list/:userId", (req, res) => res.json({ list: store.readingList[req.params.userId] || [] }));
app.post("/api/list/:userId", (req, res) => {
  const { userId } = req.params;
  const { book } = req.body;
  if (!store.readingList[userId]) store.readingList[userId] = [];
  if (!store.readingList[userId].some((b) => b.key === book.key)) store.readingList[userId].push(book);
  res.json({ list: store.readingList[userId] });
});
app.delete("/api/list/:userId/:bookKey", (req, res) => {
  const { userId, bookKey } = req.params;
  if (store.readingList[userId]) store.readingList[userId] = store.readingList[userId].filter((b) => b.key !== decodeURIComponent(bookKey));
  res.json({ list: store.readingList[userId] || [] });
});

app.post("/api/rate/:userId", (req, res) => {
  const { userId } = req.params;
  const { bookKey, rating } = req.body;
  if (!store.ratings[userId]) store.ratings[userId] = {};
  store.ratings[userId][bookKey] = rating;
  res.json({ ratings: store.ratings[userId] });
});
app.get("/api/rate/:userId", (req, res) => res.json({ ratings: store.ratings[req.params.userId] || {} }));

const shares = {};
app.post("/api/share", (req, res) => {
  const { books, query } = req.body;
  const id = uuidv4().slice(0, 8);
  shares[id] = { books, query, createdAt: new Date().toISOString() };
  res.json({ shareId: id, shareUrl: `https://lazybooksy.netlify.app/share/${id}` });
});
app.get("/api/share/:id", (req, res) => {
  const share = shares[req.params.id];
  if (!share) return res.status(404).json({ error: "Share not found" });
  res.json(share);
});

app.listen(PORT, () => console.log(`BookWise server running on port ${PORT}`));
