import { Notification, NotificationType } from "../types/notification";
import { Log } from "../utils/logger";

const BASE_URL = "/evaluation-service/notifications";
const AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJucjgyODBAc3JtaXN0LmVkdS5pbiIsImV4cCI6MTc3NzcwNjQzMywiaWF0IjoxNzc3NzA1NTMzLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiOTI4YTFjZjItNzIwNS00YjMzLTk3NTUtZGJlMmRkZWEwZjVhIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoibmloYXIgcm91dHJheSIsInN1YiI6ImRmYzc1MmNkLTFmMmYtNGU5Ni1iY2ZkLTg5NmI1MDIyOGMxZSJ9LCJlbWFpbCI6Im5yODI4MEBzcm1pc3QuZWR1LmluIiwibmFtZSI6Im5paGFyIHJvdXRyYXkiLCJyb2xsTm8iOiJyYTIzMTEwMDMwMTE3NzUiLCJhY2Nlc3NDb2RlIjoiUWticHhIIiwiY2xpZW50SUQiOiJkZmM3NTJjZC0xZjJmLTRlOTYtYmNmZC04OTZiNTAyMjhjMWUiLCJjbGllbnRTZWNyZXQiOiJmSkN0VkhuWW5qSnFXSHFiIn0.ZdKLX6huP1pBDNVUGLDFDYW8A8y1d1kgoxUfx7qimrI";

interface FetchParams {
  page?: number;
  limit?: number;
  notification_type?: NotificationType | "All";
}

export async function fetchNotifications(params: FetchParams = {}): Promise<Notification[]> {
  const { page = 1, limit = 20, notification_type } = params;
  const safeLimit = Math.min(limit, 10);
  const query = new URLSearchParams();
  query.set("page", String(page));
  query.set("limit", String(safeLimit));
  if (notification_type && notification_type !== "All") {
    query.set("notification_type", notification_type);
  }

  if (limit > 10) {
    await Log("frontend", "warn", "api", `Limit ${limit} exceeds max 10; clamped to ${safeLimit}`);
  }
  await Log("frontend", "info", "api", `Fetching notifications: page=${page} limit=${safeLimit} type=${notification_type ?? "All"}`);

  const response = await fetch(`${BASE_URL}?${query.toString()}`, {
    headers: {
      Authorization: `Bearer ${AUTH_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    await Log("frontend", "error", "api", `API failed with status ${response.status}`);
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  await Log("frontend", "debug", "api", `Received ${data.notifications?.length ?? 0} notifications`);
  return data.notifications ?? [];
}

const TYPE_WEIGHT: Record<string, number> = { Placement: 3, Result: 2, Event: 1 };

function getPriorityScore(n: Notification): number {
  return (TYPE_WEIGHT[n.Type] ?? 0) * 1e12 + new Date(n.Timestamp).getTime();
}

export function getTopNByPriority(notifications: Notification[], n: number): Notification[] {
  return [...notifications]
    .sort((a, b) => getPriorityScore(b) - getPriorityScore(a))
    .slice(0, n);
}