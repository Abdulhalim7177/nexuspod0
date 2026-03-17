# 💬 Chat & Messaging Module

> **Phase:** 3 · **Sprint:** 5 · **Status:** ⬜ Not Started

## Purpose

Real-time communication across the platform. Supports Pod chat, Project chat, Team chat, DMs, and Group discussions. Powered by Supabase Realtime WebSocket channels.

## Features

| Feature | Priority | Status |
|---------|----------|--------|
| Pod main chat | P0 | ⬜ |
| Project chat rooms | P0 | ⬜ |
| 1-on-1 DMs | P1 | ⬜ |
| Unlimited text messages | P0 | ⬜ |
| Voice notes (24h auto-delete) | P1 | ⬜ |
| Audio calling | P2 | ⬜ |
| Online status indicators | P1 | ⬜ |
| Typing indicators | P1 | ⬜ |
| Read receipts | P2 | ⬜ |
| @mention tagging | P1 | ⬜ |
| Message pinning | P2 | ⬜ |
| Message → Task conversion | P1 | ⬜ |
| @task reference search | P2 | ⬜ |
| File sharing in chat | P1 | ⬜ |

## Database Tables

- `chat_conversations` — type (POD/PROJECT/TEAM/DM/GROUP), pod_id, project_id, team_id
- `chat_participants` — conversation_id, user_id, is_admin
- `chat_messages` — conversation_id, user_id, content, type, file_url, reply_to, is_pinned, task_ref_id, read_by, expires_at

## Realtime Channels

| Channel Pattern | Purpose |
|----------------|---------|
| `pod:{podId}:chat` | Pod main chat |
| `project:{projectId}:chat` | Project chat |
| `dm:{conversationId}` | Direct messages |
| `pod:{podId}:presence` | Online/typing status |

## Key Files

```
app/(dashboard)/pods/[podId]/chat/
app/(dashboard)/pods/[podId]/projects/[projectId]/chat/
app/(dashboard)/messages/
components/chat/
```
