const express = require("express");
const cors = require("cors");
const Anthropic = require("@anthropic-ai/sdk");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// In-memory store (swap for a DB in production)
const store = {
  readingList: {},   // userId -> [book]
  ratings: {},       // userId -> { bookKey: rating }
};

// ─── AI: Suggest books ────────────────────────────────────────────────────────
app.post("/api/suggest", async (req, res) => {
  const { query } = req.body;
  if (!query?.trim()) return res.status(400).json({ error: "Query is required" });

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: `You are a warm, knowledgeable book curator. Suggest exactly 6 books based on this request: "${query}".

Return ONLY a valid JSON array with no markdown, no preamble, no trailing text:
[
  {
    "title": "Book Title",
    "author": "Author Name",
    "year": 1984,
    "genre": "Genre",
    "emoji": "single relevant emoji",
    "reason": "1-2 sentences on why this book fits the request, written directly to the reader",
    "isbn": "ISBN-13 if known, else empty string"
  }
]`,
        },
      ],
    });

    const text = message.content.map((b) => b.text || "").join("");
    const clean = text.replace(/```json|```/g, "").trim();
    const books = JSON.parse(clean);

    // Attach a stable key to each book
    const tagged = books.map((b) => ({
      ...b,
      id: uuidv4(),
      key: `${b.title.toLowerCase().replace(/\s+/g, "-")}-${b.author.toLowerCase().replace(/\s+/g, "-")}`,
    }));

    res.json({ books: tagged });
  } catch (err) {
    console.error("Suggest error:", err.message);
    res.status(500).json({ error: "Failed to get suggestions" });
  }
});

// ─── Google Books: fetch cover ────────────────────────────────────────────────
app.get("/api/cover", async (req, res) => {
  const { title, author, isbn } = req.query;
  try {
    const q = isbn
      ? `isbn:${isbn}`
      : `intitle:${encodeURIComponent(title)}+inauthor:${encodeURIComponent(author)}`;

    const { data } = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1`
    );

    const item = data.items?.[0];
    const cover =
      item?.volumeInfo?.imageLinks?.thumbnail?.replace("http://", "https://") ||
      null;

    const description = item?.volumeInfo?.description || null;

    res.json({ cover, description });
  } catch (err) {
    res.json({ cover: null, description: null });
  }
});

// ─── Reading list ─────────────────────────────────────────────────────────────
app.get("/api/list/:userId", (req, res) => {
  const list = store.readingList[req.params.userId] || [];
  res.json({ list });
});

app.post("/api/list/:userId", (req, res) => {
  const { userId } = req.params;
  const { book } = req.body;
  if (!store.readingList[userId]) store.readingList[userId] = [];

  const exists = store.readingList[userId].some((b) => b.key === book.key);
  if (!exists) store.readingList[userId].push(book);

  res.json({ list: store.readingList[userId] });
});

app.delete("/api/list/:userId/:bookKey", (req, res) => {
  const { userId, bookKey } = req.params;
  if (store.readingList[userId]) {
    store.readingList[userId] = store.readingList[userId].filter(
      (b) => b.key !== decodeURIComponent(bookKey)
    );
  }
  res.json({ list: store.readingList[userId] || [] });
});

// ─── Ratings ──────────────────────────────────────────────────────────────────
app.post("/api/rate/:userId", (req, res) => {
  const { userId } = req.params;
  const { bookKey, rating } = req.body;
  if (!store.ratings[userId]) store.ratings[userId] = {};
  store.ratings[userId][bookKey] = rating;
  res.json({ ratings: store.ratings[userId] });
});

app.get("/api/rate/:userId", (req, res) => {
  res.json({ ratings: store.ratings[req.params.userId] || {} });
});

// ─── Share ────────────────────────────────────────────────────────────────────
const shares = {};

app.post("/api/share", (req, res) => {
  const { books, query } = req.body;
  const id = uuidv4().slice(0, 8);
  shares[id] = { books, query, createdAt: new Date().toISOString() };
  res.json({ shareId: id, shareUrl: `http://localhost:5173/share/${id}` });
});

app.get("/api/share/:id", (req, res) => {
  const share = shares[req.params.id];
  if (!share) return res.status(404).json({ error: "Share not found" });
  res.json(share);
});

app.listen(PORT, () => console.log(`BookWise server running on port ${PORT}`));
