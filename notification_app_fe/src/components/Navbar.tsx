import React from "react";

interface Props { activePage: "all" | "priority"; onNavigate: (page: "all" | "priority") => void; }

const Navbar: React.FC<Props> = ({ activePage, onNavigate }) => (
  <nav style={{
    background: "#1976d2", color: "#fff", padding: "0 24px",
    display: "flex", alignItems: "center", height: "56px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.18)", position: "sticky", top: 0, zIndex: 100,
  }}>
    <span style={{ fontWeight: 700, fontSize: "17px", marginRight: "32px" }}>📢 Campus Notify</span>
    {(["all", "priority"] as const).map((page) => (
      <button key={page} onClick={() => onNavigate(page)} style={{
        background: activePage === page ? "rgba(255,255,255,0.18)" : "transparent",
        color: "#fff", border: "none", padding: "8px 18px", borderRadius: "6px",
        fontWeight: activePage === page ? 700 : 400, fontSize: "14px",
        cursor: "pointer", marginRight: "4px", transition: "background 0.18s",
      }}>
        {page === "all" ? "All Notifications" : "⭐ Priority Inbox"}
      </button>
    ))}
  </nav>
);

export default Navbar;