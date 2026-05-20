import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AppContext = createContext(null);
const USER_ID = "local-user"; // Single-user; replace with auth in production

export function AppProvider({ children }) {
  const [readingList, setReadingList] = useState([]);
  const [ratings, setRatings] = useState({});

  useEffect(() => {
    fetch(`/api/list/${USER_ID}`)
      .then((r) => r.json())
      .then((d) => setReadingList(d.list || []))
      .catch(() => {});

    fetch(`/api/rate/${USER_ID}`)
      .then((r) => r.json())
      .then((d) => setRatings(d.ratings || {}))
      .catch(() => {});
  }, []);

  const addToList = useCallback(async (book) => {
    const res = await fetch(`/api/list/${USER_ID}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ book }),
    });
    const data = await res.json();
    setReadingList(data.list);
  }, []);

  const removeFromList = useCallback(async (bookKey) => {
    const res = await fetch(`/api/list/${USER_ID}/${encodeURIComponent(bookKey)}`, {
      method: "DELETE",
    });
    const data = await res.json();
    setReadingList(data.list);
  }, []);

  const rateBook = useCallback(async (bookKey, rating) => {
    const res = await fetch(`/api/rate/${USER_ID}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookKey, rating }),
    });
    const data = await res.json();
    setRatings(data.ratings);
  }, []);

  const isInList = useCallback(
    (bookKey) => readingList.some((b) => b.key === bookKey),
    [readingList]
  );

  return (
    <AppContext.Provider
      value={{ readingList, ratings, addToList, removeFromList, rateBook, isInList }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
