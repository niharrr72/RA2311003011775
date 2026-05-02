import React from "react";
import { FilterType } from "../types/notification";
import { Log } from "../utils/logger";

interface Props { active: FilterType; onChange: (filter: FilterType) => void; }

const FILTERS: FilterType[] = ["All", "Placement", "Result", "Event"];
const COLORS: Record<string, string> = { All: "#1976d2", Placement: "#2e7d32", Result: "#1565c0", Event: "#e65100" };

const FilterBar: React.FC<Props> = ({ active, onChange }) => {
  const handleChange = async (f: FilterType) => {
    onChange(f);
    await Log("frontend", "info", "component", `Filter changed to: ${f}`);
  };

  return (
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
      {FILTERS.map((f) => (
        <button key={f} onClick={() => handleChange(f)} style={{
          padding: "6px 16px", borderRadius: "20px",
          border: `2px solid ${COLORS[f]}`,
          background: active === f ? COLORS[f] : "transparent",
          color: active === f ? "#fff" : COLORS[f],
          fontWeight: 600, fontSize: "13px", cursor: "pointer", transition: "all 0.18s",
        }}>{f}</button>
      ))}
    </div>
  );
};

export default FilterBar;