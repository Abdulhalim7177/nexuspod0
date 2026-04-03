# 📎 Files & Storage Module

> **Phase:** 3 · **Sprint:** 6 · **Status:** ✅ Complete

## Purpose

Manages file uploads, storage, and retrieval across tasks, chat, and projects. Uses Supabase Storage with CDN-backed delivery.

## Features

| Feature | Priority | Status |
|---------|----------|--------|
| File upload in tasks & chat | P0 | ✅ |
| Drag-and-drop upload component | P1 | ✅ |
| Cloud storage (Supabase Storage) | P0 | ✅ |
| File registry table | P1 | ✅ |
| Voice note recording | P1 | ✅ |
| Notification system | P1 | ✅ |

## Storage Buckets

| Bucket | Access | Purpose |
|--------|--------|---------|
| `avatars` | Public | Profile pictures |
| `pod-images` | Pod members | Pod profile pictures |
| `project-images` | Project members | Project images |
| `files` | Members | General file uploads |
| `voice-notes` | Participants | Voice recordings |

## Database Tables

- `files` — files table with pod_id, project_id, task_id, conversation_id references
- `notifications` — in-app notifications with types for tasks, chat, projects

## Key Files

```
components/shared/file-upload.tsx      # File upload component
components/shared/voice-recorder.tsx  # Voice note recorder
components/notifications/notification-bell.tsx  # Notification bell
lib/notifications/actions.ts          # Notification server actions
supabase/migrations/020_files_storage.sql
supabase/migrations/021_notifications.sql
```

## Notifications Types

- `TASK_ASSIGNED`, `TASK_SUBMITTED`, `TASK_APPROVED`, `TASK_REJECTED`
- `TASK_DUE_SOON`, `TASK_OVERDUE`
- `CHAT_MENTION`, `CHAT_MESSAGE`
- `PROJECT_INVITE`, `POD_INVITE`
- `MEMBER_JOINED`, `PROJECT_REQUEST`
- `SYSTEM`
