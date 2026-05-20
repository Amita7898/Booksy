import { useApp } from "../context/AppContext";
import BookCard from "./BookCard";
import styles from "./ReadingList.module.css";

export default function ReadingList() {
  const { readingList } = useApp();

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>My Reading List</h1>
        <p className={styles.sub}>
          {readingList.length === 0
            ? "Save books from your searches to build your list."
            : `${readingList.length} book${readingList.length !== 1 ? "s" : ""} saved`}
        </p>
      </header>

      {readingList.length === 0 ? (
        <div className={styles.empty}>
          <span>📚</span>
          <p>No books saved yet — go discover some!</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {readingList.map((book, i) => (
            <BookCard key={book.key} book={book} index={i} />
          ))}
        </div>
      )}
    </main>
  );
}
