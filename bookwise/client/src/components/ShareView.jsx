import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import BookCard from "./BookCard";
import styles from "./ShareView.module.css";

export default function ShareView() {
  const { shareId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/share/${shareId}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setData)
      .catch(() => setError(true));
  }, [shareId]);

  if (error) {
    return (
      <main className={styles.main}>
        <div className={styles.error}>
          <p>This share link is no longer valid.</p>
          <Link to="/" className={styles.backBtn}>Go to BookWise →</Link>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className={styles.main}>
        <p className={styles.loading}>Loading...</p>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Shared reading list</p>
        <h1 className={styles.title}>Books for &ldquo;{data.query}&rdquo;</h1>
        <Link to="/" className={styles.backBtn}>Find your own recommendations →</Link>
      </header>
      <div className={styles.grid}>
        {data.books.map((book, i) => (
          <BookCard key={book.key} book={book} index={i} />
        ))}
      </div>
    </main>
  );
}
