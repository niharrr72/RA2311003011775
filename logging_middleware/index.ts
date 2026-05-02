// Logging Middleware
// Reusable package for sending structured logs to the evaluation server
// Usage: import { Log, setAuthToken } from '../logging_middleware'

const LOG_API_URL = "http://20.207.122.201/evaluation-service/logs";

// Type definitions for strict validation
type Stack = "frontend" | "backend";
type Level = "debug" | "info" | "warn" | "error" | "fatal";
type FrontendPackage = "api" | "component" | "hook" | "page" | "state" | "style";
type SharedPackage = "auth" | "config" | "middleware" | "utils";
export type Package = FrontendPackage | SharedPackage;

// Auth token storage - set once at app startup
let authToken = "";

/**
 * Sets the Bearer token for authenticated log API calls.
 * Call this once when your app starts, before using Log().
 */
export function setAuthToken(token: string): void {
  authToken = token;
}

/**
 * Sends a structured log entry to the evaluation server.
 * @param stack   - "frontend" or "backend"
 * @param level   - "debug" | "info" | "warn" | "error" | "fatal"
 * @param pkg     - package name e.g. "component", "api", "page"
 * @param message - descriptive message about what is happening
 *
 * @example
 * Log("frontend", "info", "page", "Notifications page loaded successfully")
 * Log("frontend", "error", "api", "Failed to fetch notifications from server")
 */
export async function Log(
  stack: Stack,
  level: Level,
  pkg: Package,
  message: string
): Promise<void> {
  // Warn if token not set yet
  if (!authToken) {
    console.warn("[Logger] Auth token not set. Call setAuthToken() first.");
    return;
  }

  try {
    const response = await fetch(LOG_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        stack,
        level,
        package: pkg,
        message,
      }),
    });

    const data = await response.json();

    // Show confirmation in browser/terminal console
    console.log(
      `[LOG ✓] [${stack}] [${level.toUpperCase()}] [${pkg}] ${message}`,
      "→ logID:", data.logID
    );
  } catch (err) {
    // Log locally if server call fails
    console.error("[LOG ✗] Failed to send log to server:", err);
  }
}