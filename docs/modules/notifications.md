# 🔔 Notifications Module

> **Phase:** 3 · **Sprint:** 6 · **Status:** ⬜ Not Started

## Purpose

In-app and email notifications for task assignments, comments, reviews, and deadline reminders. Uses Supabase Realtime for instant delivery and pg_cron for scheduled reminders.

## Features

| Feature | Priority | Status |
|---------|----------|--------|
| Task assignment notification | P0 | ⬜ |
| Task comment notification | P1 | ⬜ |
| Task review (DONE) notification | P0 | ⬜ |
| Deadline reminders (72h, then 6h) | P1 | ⬜ |
| In-app notification bell + dropdown | P0 | ⬜ |
| Push notifications | P1 | ⬜ |
| Email notifications | P1 | ⬜ |
| Mark as read | P0 | ⬜ |
| Reminders cancelled on completion | P1 | ⬜ |

## Database Tables

- `notifications` — user_id, pod_id, type, title, body, link, is_read

## Background Jobs (pg_cron)

| Job | Schedule | Action |
|-----|----------|--------|
| Deadline check | Every hour | Tasks due within 72h → notify |
| Voice note cleanup | Every 6h | Delete expired voice notes |

## Key Files

```
components/notifications/notification-bell.tsx
components/notifications/notification-list.tsx
app/(dashboard)/notifications/
```
