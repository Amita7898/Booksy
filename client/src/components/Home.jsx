import { useState } from "react";
import BookCard from "./BookCard";
import styles from "./Home.module.css";

const MOODS = [
  { label: "⚡ Thrilling", value: "something thrilling and fast-paced" },
  { label: "🧠 Philosophical", value: "thought-provoking and philosophical" },
  { label: "☕ Cozy", value: "a cozy, feel-good story" },
  { label: "🥹 Emotional", value: "emotionally moving and heartfelt" },
  { label: "🌑 Dark", value: "dark and mysterious" },
  { label: "😂 Funny", value: "funny and light-hearted" },
  { label: "🌌 Epic", value: "an epic fantasy or sci-fi world" },
  { label: "📖 True Story", value: "a gripping true story or biography" },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastQuery, setLastQuery] = useState("");
  const [shareUrl, setShareUrl] = useState(null);
  const [sharing, setSharing] = useState(false);

  const search = async (q) => {
    const text = (q || query).trim();
    if (!text) return;
    setLoading(true);
    setError(null);
    setShareUrl(null);
    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBooks(data.books);
      setLastQuery(text);
    } catch (err) {
      setError("Couldn't fetch suggestions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChip = (value) => {
    setQuery(value);
    search(value);
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ books, query: lastQuery }),
      });
      const data = await res.json();
      setShareUrl(data.shareUrl);
      await navigator.clipboard.writeText(data.shareUrl);
    } catch {
      setShareUrl("Failed to generate share link");
    } finally {
      setSharing(false);
    }
  };

  return (
    <main className={styles.main}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>AI-powered</p>
        <h1 className={styles.title}>
          Find your next <em>great read</em>
        </h1>
        <p className={styles.sub}>
          Describe your mood, a theme, or a book you loved — and we'll find what's next.
        </p>
      </header>

      <section className={styles.searchSection}>
        <div className={styles.chips}>
          {MOODS.map((m) => (
            <button
              key={m.value}
              className={styles.chip}
              onClick={() => handleChip(m.value)}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className={styles.inputRow}>
          <textarea
            className={styles.textarea}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                search();
              }
            }}
            placeholder="e.g. 'Something like Dune but shorter' or 'I want to cry in a coffee shop'"
            rows={3}
          />
          <button
            className={styles.searchBtn}
            onClick={() => search()}
            disabled={loading || !query.trim()}
          >
            {loading ? (
              <span className={styles.dots}>
                <span /><span /><span />
              </span>
            ) : (
              <>📖 Find Books</>
            )}
          </button>
        </div>
      </section>

      {error && <p className={styles.error}>{error}</p>}

      {books.length > 0 && (
        <section className={styles.results}>
          <div className={styles.resultsHeader}>
            <div>
              <h2 className={styles.resultsTitle}>Your reading list</h2>
              <p className={styles.resultsSubtitle}>
                {books.length} books for &ldquo;{lastQuery}&rdquo;
              </p>
            </div>
            <button
              className={styles.shareBtn}
              onClick={handleShare}
              disabled={sharing}
            >
              {sharing ? "..." : "🔗 Share"}
            </button>
          </div>

          {shareUrl && (
            <div className={styles.shareToast}>
              ✓ Link copied! <span className={styles.shareLink}>{shareUrl}</span>
            </div>
          )}

          <div className={styles.grid}>
            {books.map((book, i) => (
              <BookCard key={book.id} book={book} index={i} />
            ))}
          </div>
        </section>
      )}

      {books.length === 0 && !loading && !error && (
        <div className={styles.empty}>
          <span>📚</span>
          <p>Your recommendations will appear here</p>
        </div>
      )}
    </main>
  );
}
