# 📎 Files & Storage Module

> **Phase:** 3 · **Sprint:** 6 · **Status:** ⬜ Not Started

## Purpose

Manages file uploads, storage, and retrieval across tasks, chat, and projects. Uses Supabase Storage with CDN-backed delivery and mobile-optimized compression.

## Features

| Feature | Priority | Status |
|---------|----------|--------|
| File upload in tasks & chat | P0 | ⬜ |
| Drag-and-drop upload component | P1 | ⬜ |
| Mobile compression | P2 | ⬜ |
| Cloud storage (Supabase Storage) | P0 | ⬜ |
| Pod-tier storage limits | P2 | ⬜ |
| File registry table | P1 | ⬜ |

## Storage Buckets

| Bucket | Access | Purpose |
|--------|--------|---------|
| `avatars` | Public | Profile pictures |
| `pod-files` | Pod members | Shared files |
| `task-attachments` | Pod members | Task evidence |
| `chat-media` | Participants | Chat images/files |
| `voice-notes` | Participants | Voice recordings (24h TTL) |
| `pod-avatars` | Public | Pod profile pictures |

## Database Tables

- `files` — pod_id, uploaded_by, file_name, file_url, file_size, mime_type, context, context_id

## Key Files

```
components/shared/file-upload.tsx
lib/storage.ts
```
