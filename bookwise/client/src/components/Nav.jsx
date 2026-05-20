import { Link, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import styles from "./Nav.module.css";

export default function Nav() {
  const { pathname } = useLocation();
  const { readingList } = useApp();

  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.brand}>
        <span className={styles.logo}>📚</span>
        <span className={styles.brandName}>BookWise</span>
      </Link>
      <div className={styles.links}>
        <Link to="/" className={`${styles.link} ${pathname === "/" ? styles.active : ""}`}>
          Discover
        </Link>
        <Link to="/list" className={`${styles.link} ${pathname === "/list" ? styles.active : ""}`}>
          My List
          {readingList.length > 0 && (
            <span className={styles.badge}>{readingList.length}</span>
          )}
        </Link>
      </div>
    </nav>
  );
}
