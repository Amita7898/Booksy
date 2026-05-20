# 📚 BookWise

An AI-powered book recommendation app built with React + Node/Express, using the Anthropic Claude API.

## Features

- **AI Suggestions** — Describe your mood or a theme; Claude returns 6 tailored picks
- **Google Books Covers** — Real cover images fetched automatically for each book
- **Star Ratings** — Rate any book 1–5 stars; persisted server-side
- **Reading List** — Save books across sessions via the dedicated My List page
- **Share** — Generate a shareable link for any set of recommendations (auto-copies to clipboard)

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, React Router, CSS Modules, Vite |
| Backend | Node.js, Express |
| AI | Anthropic Claude (`claude-sonnet-4-20250514`) |
| Book Data | Google Books API (no key required for basic use) |

## Project Structure

```
bookwise/
├── client/              # React frontend (Vite)
│   └── src/
│       ├── components/  # Nav, Home, BookCard, ReadingList, ShareView
│       ├── context/     # AppContext (reading list + ratings state)
│       └── App.jsx      # Router setup
│
├── server/              # Express backend
│   └── index.js         # All API routes
│
└── package.json         # Root workspace config
```

## Quick Start

### 1. Install dependencies

```bash
npm install
cd server && npm install
cd ../client && npm install
```

### 2. Add your API key

```bash
cp server/.env.example server/.env
# Edit server/.env and add your ANTHROPIC_API_KEY
```

Get your key at https://console.anthropic.com

### 3. Run the app

```bash
# From the root directory — starts both server and client
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/suggest` | Get AI book suggestions `{ query }` |
| GET | `/api/cover` | Fetch Google Books cover `?title=&author=&isbn=` |
| GET | `/api/list/:userId` | Get user's reading list |
| POST | `/api/list/:userId` | Add book to list `{ book }` |
| DELETE | `/api/list/:userId/:bookKey` | Remove book from list |
| POST | `/api/rate/:userId` | Rate a book `{ bookKey, rating }` |
| GET | `/api/rate/:userId` | Get user's ratings |
| POST | `/api/share` | Create shareable link `{ books, query }` |
| GET | `/api/share/:id` | Get shared list by ID |

## Production Notes

- Replace the in-memory store in `server/index.js` with a real database (e.g. PostgreSQL, MongoDB)
- Add authentication to replace the hardcoded `local-user` ID
- Set `CORS` origin in the server to your production frontend URL
- Use `npm run build` to create a production React build, then serve it from Express
