import { Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Home from "./components/Home";
import ReadingList from "./components/ReadingList";
import ShareView from "./components/ShareView";
import Nav from "./components/Nav";

export default function App() {
  return (
    <AppProvider>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/list" element={<ReadingList />} />
        <Route path="/share/:shareId" element={<ShareView />} />
      </Routes>
    </AppProvider>
  );
}
