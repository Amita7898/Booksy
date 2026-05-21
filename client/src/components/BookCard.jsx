import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import styles from "./BookCard.module.css";

const SPINE_COLORS = [
  "#E8E0D0", "#D4C5B0", "#C8D8C0", "#C8D4E0",
  "#D8C8D0", "#E0D8C0", "#D0D8C8", "#D8D0C8",
];

export default function BookCard({ book, index }) {
  const { addToList, removeFromList, isInList, rateBook, ratings } = useApp();
  const [cover, setCover] = useState(null);
  const [coverLoading, setCoverLoading] = useState(true);
  const inList = isInList(book.key);
  const currentRating = ratings[book.key] || 0;
  const spineColor = SPINE_COLORS[index % SPINE_COLORS.length];

  useEffect(() => {
    const load = async () => {
      try {
        const params = new URLSearchParams({
          title: book.title,
          author: book.author,
          isbn: book.isbn || "",
        });
        const res = await fetch(`/api/cover?${params}`);
        const data = await res.json();
        setCover(data.cover);
      } catch {
        setCover(null);
      } finally {
        setCoverLoading(false);
      }
    };
    load();
  }, [book]);

  const toggleList = () => {
    if (inList) removeFromList(book.key);
    else addToList(book);
  };

  const handleRate = (star) => {
    rateBook(book.key, star === currentRating ? 0 : star);
  };

  return (
    <div className={styles.card} style={{ animationDelay: `${index * 0.05}s` }}>
      <div className={styles.coverArea}>
        {coverLoading ? (
          <div className={styles.coverSkeleton} style={{ background: spineColor }} />
        ) : cover ? (
          <img src={cover} alt={book.title} className={styles.cover} />
        ) : (
          <div className={styles.coverFallback} style={{ background: spineColor }}>
            <span className={styles.coverInitial}>{book.title?.charAt(0)}</span>
          </div>
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.genre}>{book.genre}</div>
        <h3 className={styles.title}>{book.title}</h3>
        <p className={styles.author}>by {book.author}</p>
        {book.year && <p className={styles.year}>{book.year}</p>}

        <div className={styles.stars}>
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              className={`${styles.star} ${s <= currentRating ? styles.starFilled : ""}`}
              onClick={() => handleRate(s)}
              title={`Rate ${s} star${s > 1 ? "s" : ""}`}
            >
              ★
            </button>
          ))}
        </div>

        <p className={styles.reason}>{book.reason}</p>

        <button
          className={`${styles.saveBtn} ${inList ? styles.saved : ""}`}
          onClick={toggleList}
        >
          {inList ? "✓ Saved" : "+ Save"}
        </button>
      </div>
    </div>
  );
}
