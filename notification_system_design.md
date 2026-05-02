# Notification System Design

## Stage 1 - Priority Inbox

### Problem
Students lose track of important notifications due to high volume. A Priority Inbox surfaces the top N most important unread notifications.

### Priority Algorithm
Priority is determined by two factors:
1. Type Weight: Placement (3) > Result (2) > Event (1)
2. Recency: Newer notifications rank higher within same type

Score Formula:
score = (typeWeight * 10^12) + unixTimestampMilliseconds

Multiplying weight by 10^12 ensures type always dominates recency.

### Data Structure - Min-Heap
To efficiently maintain top N as new notifications arrive:
- Min-Heap of size N
- New notification score > heap minimum -> replace minimum
- O(log N) per insertion - scalable for real-time streams
- Sorting entire list every time = O(M log M), heap = O(log N)

### API
GET http://20.207.122.201/evaluation-service/notifications
Query params: page, limit, notification_type

---

## Stage 2 - Frontend Application

### Architecture
notification_app_fe/src/
|- api/ -> fetchNotifications(), getTopNByPriority()
|- components/ -> NotificationCard, FilterBar, Navbar
|- hooks/ -> useNotifications, usePriorityInbox
|- pages/ -> AllNotificationsPage, PriorityInboxPage
|- types/ -> Notification, FilterType interfaces
|- utils/ -> logger.ts (logging middleware)

### Pages
All Notifications - paginated list, filter by type, unread/viewed state
Priority Inbox - top N notifications ranked by priority, configurable N (5/10/15/20)

### Key Decisions
- No login required - token pre-configured via environment variable
- Viewed state tracked in-memory using a Set
- All events logged via logging middleware
- Vanilla CSS styling as per guidelines
