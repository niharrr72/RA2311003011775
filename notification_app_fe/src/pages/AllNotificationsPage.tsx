import React, { useState, useEffect } from "react";
import { FilterType } from "../types/notification";
import { useNotifications } from "../hooks/useNotifications";
import NotificationCard from "../components/NotificationCard";
import FilterBar from "../components/FilterBar";
import { Log } from "../utils/logger";

const AllNotificationsPage: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>("All");
  const [page, setPage] = useState(1);
  const [viewedSet, setViewedSet] = useState<Set<string>>(new Set());
  const { notifications, loading, error, hasMore, markViewed, isViewed } = useNotifications(filter, page);

  const handleFilterChange = async (f: FilterType) => {
    setFilter(f); setPage(1);
    await Log("frontend", "info", "page", `Filter changed to ${f}`);
  };

  const handleView = (id: string) => {
    markViewed(id);
    setViewedSet((prev) => new Set(prev).add(id));
  };

  useEffect(() => { Log("frontend", "info", "page", "All Notifications page mounted"); }, []);

  const unreadCount = notifications.filter((n) => !isViewed(n.ID)).length;

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "24px 16px" }}>
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, margin: "0 0 4px", color: "#212121" }}>All Notifications</h1>
        <p style={{ margin: 0, fontSize: "13px", color: "#757575" }}>
          {unreadCount > 0 ? `${unreadCount} unread` : "All caught up ✓"} · Click to mark as read
        </p>
      </div>
      <FilterBar active={filter} onChange={handleFilterChange} />
      {loading && <div style={{ textAlign: "center", padding: "40px", color: "#9e9e9e" }}>Loading notifications...</div>}
      {error && <div style={{ background: "#ffebee", border: "1px solid #ef9a9a", borderRadius: "8px", padding: "16px", color: "#c62828" }}>⚠️ Failed to load. Check your connection.</div>}
      {!loading && !error && notifications.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#9e9e9e" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>📭</div>
          <p style={{ margin: 0 }}>No notifications for this filter.</p>
        </div>
      )}
      {!loading && notifications.map((n) => (
        <NotificationCard key={n.ID} notification={n} isViewed={isViewed(n.ID) || viewedSet.has(n.ID)} onView={handleView} />
      ))}
      {!loading && !error && (
        <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "24px" }}>
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} style={{ padding: "8px 20px", borderRadius: "6px", border: "1px solid #1976d2", background: page === 1 ? "#e0e0e0" : "#1976d2", color: page === 1 ? "#9e9e9e" : "#fff", cursor: page === 1 ? "not-allowed" : "pointer", fontWeight: 600 }}>← Prev</button>
          <span style={{ padding: "8px 12px", fontWeight: 600, color: "#424242" }}>Page {page}</span>
          <button disabled={!hasMore} onClick={() => setPage((p) => p + 1)} style={{ padding: "8px 20px", borderRadius: "6px", border: "1px solid #1976d2", background: !hasMore ? "#e0e0e0" : "#1976d2", color: !hasMore ? "#9e9e9e" : "#fff", cursor: !hasMore ? "not-allowed" : "pointer", fontWeight: 600 }}>Next →</button>
        </div>
      )}
    </div>
  );
};

export default AllNotificationsPage;