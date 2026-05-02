import { Log, setAuthToken } from "../logging_middleware/index";

const AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJucjgyODBAc3JtaXN0LmVkdS5pbiIsImV4cCI6MTc3NzcwMDIyMywiaWF0IjoxNzc3Njk5MzIzLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiN2Y4MzgzNmQtMjNjZi00YmNlLTllNDQtZmRmMmRjZDFkZTg2IiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoibmloYXIgcm91dHJheSIsInN1YiI6ImRmYzc1MmNkLTFmMmYtNGU5Ni1iY2ZkLTg5NmI1MDIyOGMxZSJ9LCJlbWFpbCI6Im5yODI4MEBzcm1pc3QuZWR1LmluIiwibmFtZSI6Im5paGFyIHJvdXRyYXkiLCJyb2xsTm8iOiJyYTIzMTEwMDMwMTE3NzUiLCJhY2Nlc3NDb2RlIjoiUWticHhIIiwiY2xpZW50SUQiOiJkZmM3NTJjZC0xZjJmLTRlOTYtYmNmZC04OTZiNTAyMjhjMWUiLCJjbGllbnRTZWNyZXQiOiJmSkN0VkhuWW5qSnFXSHFiIn0.w9O6N3UyknOQqYZY-B8KfLecU8MJZape250PxilVLGo";
const NOTIFICATIONS_API = "http://20.207.122.201/evaluation-service/notifications";

interface Notification {
  ID: string;
  Type: "Placement" | "Result" | "Event";
  Message: string;
  Timestamp: string;
}

const TYPE_WEIGHT: Record<string, number> = { Placement: 3, Result: 2, Event: 1 };

function getPriorityScore(n: Notification): number {
  return (TYPE_WEIGHT[n.Type] ?? 0) * 1e12 + new Date(n.Timestamp).getTime();
}

class MinHeap {
  private heap: { score: number; notification: Notification }[] = [];
  private maxSize: number;
  constructor(maxSize: number) { this.maxSize = maxSize; }
  private parent(i: number) { return Math.floor((i - 1) / 2); }
  private left(i: number) { return 2 * i + 1; }
  private right(i: number) { return 2 * i + 2; }
  private swap(i: number, j: number) { [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]]; }
  private bubbleUp(i: number) {
    while (i > 0 && this.heap[this.parent(i)].score > this.heap[i].score) {
      this.swap(i, this.parent(i)); i = this.parent(i);
    }
  }
  private bubbleDown(i: number) {
    let s = i; const l = this.left(i), r = this.right(i);
    if (l < this.heap.length && this.heap[l].score < this.heap[s].score) s = l;
    if (r < this.heap.length && this.heap[r].score < this.heap[s].score) s = r;
    if (s !== i) { this.swap(i, s); this.bubbleDown(s); }
  }
  insert(notification: Notification) {
    const score = getPriorityScore(notification);
    if (this.heap.length < this.maxSize) { this.heap.push({ score, notification }); this.bubbleUp(this.heap.length - 1); }
    else if (score > this.heap[0].score) { this.heap[0] = { score, notification }; this.bubbleDown(0); }
  }
  getTopN(): Notification[] {
    return [...this.heap].sort((a, b) => b.score - a.score).map(item => item.notification);
  }
}

async function getTopNPriorityNotifications(n: number = 10): Promise<void> {
  setAuthToken(AUTH_TOKEN);
  await Log("backend", "info", "utils", `Starting Priority Inbox — fetching top ${n} notifications`);
  let all: Notification[] = [];
  let page = 1;
  while (true) {
    await Log("backend", "debug", "utils", `Fetching page=${page}`);
    try {
      const res = await fetch(`${NOTIFICATIONS_API}?page=${page}&limit=20`, {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}`, "Content-Type": "application/json" },
      });
      if (!res.ok) { await Log("backend", "error", "utils", `API status ${res.status}`); break; }
      const data = await res.json();
      const notifs: Notification[] = data.notifications ?? [];
      if (notifs.length === 0) break;
      all = all.concat(notifs);
      await Log("backend", "info", "utils", `Fetched ${notifs.length} from page ${page}, total: ${all.length}`);
      page++;
    } catch (err) {
      await Log("backend", "fatal", "utils", `Network error: ${err}`); break;
    }
  }
  const heap = new MinHeap(n);
  for (const notif of all) heap.insert(notif);
  const topN = heap.getTopN();
  await Log("backend", "info", "utils", `Priority Inbox ready with ${topN.length} notifications`);
  console.log(`\n${"=".repeat(60)}\n   TOP ${n} PRIORITY NOTIFICATIONS\n${"=".repeat(60)}`);
  topN.forEach((notif, idx) => {
    console.log(`\n#${idx + 1} [${notif.Type}] (weight: ${TYPE_WEIGHT[notif.Type]})`);
    console.log(`   Message  : ${notif.Message}`);
    console.log(`   Timestamp: ${notif.Timestamp}`);
    console.log(`   ID       : ${notif.ID}`);
  });
}

getTopNPriorityNotifications(10);