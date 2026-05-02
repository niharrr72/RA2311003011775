const LOG_API_URL = "/evaluation-service/logs";
let authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJucjgyODBAc3JtaXN0LmVkdS5pbiIsImV4cCI6MTc3NzcwNjQzMywiaWF0IjoxNzc3NzA1NTMzLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiOTI4YTFjZjItNzIwNS00YjMzLTk3NTUtZGJlMmRkZWEwZjVhIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoibmloYXIgcm91dHJheSIsInN1YiI6ImRmYzc1MmNkLTFmMmYtNGU5Ni1iY2ZkLTg5NmI1MDIyOGMxZSJ9LCJlbWFpbCI6Im5yODI4MEBzcm1pc3QuZWR1LmluIiwibmFtZSI6Im5paGFyIHJvdXRyYXkiLCJyb2xsTm8iOiJyYTIzMTEwMDMwMTE3NzUiLCJhY2Nlc3NDb2RlIjoiUWticHhIIiwiY2xpZW50SUQiOiJkZmM3NTJjZC0xZjJmLTRlOTYtYmNmZC04OTZiNTAyMjhjMWUiLCJjbGllbnRTZWNyZXQiOiJmSkN0VkhuWW5qSnFXSHFiIn0.ZdKLX6huP1pBDNVUGLDFDYW8A8y1d1kgoxUfx7qimrI";

export function setAuthToken(token: string): void {
  authToken = token;
}

type Level = "debug" | "info" | "warn" | "error" | "fatal";
type Package = "api" | "component" | "hook" | "page" | "state" | "middleware" | "utils" | "auth" | "config";

export async function Log(
  stack: "frontend",
  level: Level,
  pkg: Package,
  message: string
): Promise<void> {
  if (!authToken) return;
  try {
    const res = await fetch(LOG_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ stack, level, package: pkg, message }),
    });
    const data = await res.json();
    console.log(`[LOG] [${level.toUpperCase()}] [${pkg}] ${message} → ${data.logID}`);
  } catch {
    console.error("[LOG FAILED]");
  }
}