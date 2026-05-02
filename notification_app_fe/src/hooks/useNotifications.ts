import { useState, useEffect, useCallback } from "react";
import { Notification, FilterType } from "../types/notification";
import { fetchNotifications } from "../api/notifications";
import { Log } from "../utils/logger";

const viewedIds = new Set<string>();

export function useNotifications(filter: FilterType, page: number) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Log("frontend", "info", "hook", `Loading notifications page=${page} filter=${filter}`);
      const data = await fetchNotifications({
        page,
        limit: 10,
        notification_type: filter === "All" ? undefined : filter,
      });
      setNotifications(data);
      setHasMore(data.length === 10);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      await Log("frontend", "error", "hook", `Fetch failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => { load(); }, [load]);

  const markViewed = (id: string) => { viewedIds.add(id); };
  const isViewed = (id: string): boolean => viewedIds.has(id);

  return { notifications, loading, error, hasMore, markViewed, isViewed, refetch: load };
}