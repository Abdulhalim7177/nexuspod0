# 🔔 Notifications Module

> **Phase:** 3 · **Sprint:** 6 · **Status:** ✅ Complete

## Purpose

In-app and email notifications for task assignments, comments, reviews, and deadline reminders. Uses Supabase Realtime for instant delivery.

## Features

| Feature | Priority | Status |
|---------|----------|--------|
| Task assignment notification | P0 | ✅ |
| Task review (DONE) notification | P0 | ✅ |
| In-app notification bell + dropdown | P0 | ✅ |
| Realtime notifications | P0 | ✅ |
| Mark as read | P0 | ✅ |
| Mark all as read | P1 | ✅ |
| Delete notifications | P1 | ✅ |

## Database Tables

- `notifications` — user_id, type, title, body, link, related_id, related_type, is_read, read_at

## Notification Types

| Type | Trigger |
|------|---------|
| `TASK_ASSIGNED` | User assigned to task |
| `TASK_SUBMITTED` | Task submitted for review |
| `TASK_APPROVED` | Task approved |
| `TASK_REJECTED` | Task rejected |
| `TASK_DUE_SOON` | Task due within 24h |
| `TASK_OVERDUE` | Task past due date |
| `CHAT_MENTION` | User @mentioned in chat |
| `CHAT_MESSAGE` | New message in conversation |
| `PROJECT_INVITE` | User invited to project |
| `POD_INVITE` | User invited to pod |
| `MEMBER_JOINED` | New member joined pod |
| `PROJECT_REQUEST` | Request to join project |
| `SYSTEM` | System announcements |

## Key Files

```
components/notifications/notification-bell.tsx  # Notification bell dropdown
lib/notifications/actions.ts                  # Server actions for notifications
supabase/migrations/021_notifications.sql      # Notifications table
```

## Future (Pending)

- Email notifications
- Push notifications
- Deadline reminder cron job (pg_cron)
- Voice note cleanup cron job
