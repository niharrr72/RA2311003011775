import React from "react";
import { Notification } from "../types/notification";
import { Log } from "../utils/logger";

interface Props {
  notification: Notification;
  isViewed: boolean;
  onView: (id: string) => void;
  showRank?: number;
}

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Placement: { bg: "#e8f5e9", text: "#2e7d32", border: "#4caf50" },
  Result:    { bg: "#e3f2fd", text: "#1565c0", border: "#2196f3" },
  Event:     { bg: "#fff3e0", text: "#e65100", border: "#ff9800" },
};

const NotificationCard: React.FC<Props> = ({ notification, isViewed, onView, showRank }) => {
  const colors = TYPE_COLORS[notification.Type] ?? { bg: "#f5f5f5", text: "#333", border: "#ccc" };

  const handleClick = async () => {
    if (!isViewed) {
      onView(notification.ID);
      await Log("frontend", "info", "component", `Notification viewed: ID=${notification.ID} type=${notification.Type}`);
    }
  };

  const formattedTime = new Date(notification.Timestamp).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div onClick={handleClick} style={{
      background: isViewed ? "#fafafa" : "#ffffff",
      border: `1px solid ${isViewed ? "#e0e0e0" : colors.border}`,
      borderLeft: `4px solid ${colors.border}`,
      borderRadius: "8px", padding: "14px 18px", marginBottom: "10px",
      cursor: isViewed ? "default" : "pointer",
      opacity: isViewed ? 0.75 : 1,
      transition: "box-shadow 0.2s, opacity 0.2s",
      boxShadow: isViewed ? "none" : "0 2px 6px rgba(0,0,0,0.07)",
      display: "flex", alignItems: "flex-start", gap: "12px",
    }}>
      {showRank !== undefined && (
        <div style={{
          minWidth: "28px", height: "28px", borderRadius: "50%",
          background: colors.border, color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "12px", fontWeight: 700,
        }}>{showRank}</div>
      )}
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <span style={{
            background: colors.bg, color: colors.text,
            borderRadius: "12px", padding: "2px 10px",
            fontSize: "11px", fontWeight: 600,
          }}>{notification.Type.toUpperCase()}</span>
          {!isViewed && <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f44336", display: "inline-block" }} />}
          {isViewed && <span style={{ fontSize: "11px", color: "#9e9e9e" }}>Viewed</span>}
        </div>
        <p style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: isViewed ? 400 : 600, color: "#212121" }}>
          {notification.Message}
        </p>
        <p style={{ margin: 0, fontSize: "12px", color: "#757575" }}>{formattedTime}</p>
      </div>
    </div>
  );
};

export default NotificationCard;