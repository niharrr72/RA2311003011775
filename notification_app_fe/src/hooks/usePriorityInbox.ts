import { useState, useEffect } from "react";
import { Notification } from "../types/notification";
import { fetchNotifications, getTopNByPriority } from "../api/notifications";
import { Log } from "../utils/logger";

export function usePriorityInbox(topN: number) {
  const [priorityNotifications, setPriorityNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function build() {
      setLoading(true);
      setError(null);
      await Log("frontend", "info", "hook", `Building priority inbox for top ${topN}`);
      try {
        // Fetch pages sequentially to avoid rate limiting
        const p1 = await fetchNotifications({ page: 1, limit: 10 });
        const p2 = await fetchNotifications({ page: 2, limit: 10 });
        const p3 = await fetchNotifications({ page: 3, limit: 10 });
        const p4 = await fetchNotifications({ page: 4, limit: 10 });
        const p5 = await fetchNotifications({ page: 5, limit: 10 });

        const all = [...p1, ...p2, ...p3, ...p4, ...p5];
        await Log("frontend", "debug", "hook", `Collected ${all.length} notifications for ranking`);

        const top = getTopNByPriority(all, topN);
        setPriorityNotifications(top);
        await Log("frontend", "info", "hook", `Priority inbox built: ${top.length} items`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown";
        setError(msg);
        await Log("frontend", "error", "hook", `Priority inbox failed: ${msg}`);
      } finally {
        setLoading(false);
      }
    }
    build();
  }, [topN]);

  return { priorityNotifications, loading, error };
}