import React, { useState, useEffect } from "react";
import { usePriorityInbox } from "../hooks/usePriorityInbox";
import NotificationCard from "../components/NotificationCard";
import { Log } from "../utils/logger";

const PriorityInboxPage: React.FC = () => {
  const [topN, setTopN] = useState(10);
  const [viewedSet, setViewedSet] = useState<Set<string>>(new Set());
  const { priorityNotifications, loading, error } = usePriorityInbox(topN);

  useEffect(() => { Log("frontend", "info", "page", `Priority Inbox mounted topN=${topN}`); }, [topN]);

  const handleView = (id: string) => { setViewedSet((prev) => new Set(prev).add(id)); };

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "24px 16px" }}>
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, margin: "0 0 4px", color: "#212121" }}>⭐ Priority Inbox</h1>
        <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#757575" }}>Ranked: Placement › Result › Event, then by recency</p>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#424242" }}>Show top:</span>
          {[5, 10, 15, 20].map((n) => (
            <button key={n} onClick={async () => { setTopN(n); await Log("frontend", "info", "page", `topN changed to ${n}`); }} style={{
              padding: "5px 14px", borderRadius: "16px", border: "2px solid #1976d2",
              background: topN === n ? "#1976d2" : "transparent",
              color: topN === n ? "#fff" : "#1976d2",
              fontWeight: 600, fontSize: "13px", cursor: "pointer", transition: "all 0.18s",
            }}>{n}</button>
          ))}
        </div>
      </div>
      <div style={{ background: "#f3f8ff", border: "1px solid #bbdefb", borderRadius: "8px", padding: "10px 14px", marginBottom: "20px", fontSize: "12px", color: "#1565c0" }}>
        <strong>Priority:</strong> 🟢 Placement (3) &gt; 🔵 Result (2) &gt; 🟠 Event (1) · Newer = higher rank within same type
      </div>
      {loading && <div style={{ textAlign: "center", padding: "40px", color: "#9e9e9e" }}>Building priority inbox...</div>}
      {error && <div style={{ background: "#ffebee", border: "1px solid #ef9a9a", borderRadius: "8px", padding: "16px", color: "#c62828" }}>⚠️ Failed to build priority inbox.</div>}
      {!loading && !error && priorityNotifications.map((n, idx) => (
        <NotificationCard key={n.ID} notification={n} isViewed={viewedSet.has(n.ID)} onView={handleView} showRank={idx + 1} />
      ))}
    </div>
  );
};

export default PriorityInboxPage;