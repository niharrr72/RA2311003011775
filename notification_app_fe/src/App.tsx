import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import AllNotificationsPage from "./pages/AllNotificationsPage";
import PriorityInboxPage from "./pages/PriorityInboxPage";
import { setAuthToken, Log } from "./utils/logger";

type Page = "all" | "priority";

function App() {
  const [activePage, setActivePage] = useState<Page>("all");

  useEffect(() => {
    const token = process.env.REACT_APP_AUTH_TOKEN ?? "";
    setAuthToken(token);
    Log("frontend", "info", "config", "App initialized — auth token set");
    Log("frontend", "info", "page", "Initial page: All Notifications");
  }, []);

  const handleNavigate = async (page: Page) => {
    setActivePage(page);
    await Log("frontend", "info", "page", `Navigated to: ${page}`);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "Roboto, Arial, sans-serif" }}>
      <Navbar activePage={activePage} onNavigate={handleNavigate} />
      <main>
        {activePage === "all" && <AllNotificationsPage />}
        {activePage === "priority" && <PriorityInboxPage />}
      </main>
    </div>
  );
}

export default App;