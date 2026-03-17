# 💬 Groups & Notes Module

> **Phase:** 6 · **Sprint:** 11 · **Status:** ⬜ Not Started

## Purpose

Groups are private/public discussion rooms within a Pod (beyond project-specific chats). Pod Notes provide a lightweight note-taking system for meeting notes, strategy docs, and founder thoughts.

## Features

| Feature | Priority | Status |
|---------|----------|--------|
| Create public/private groups | P2 | ⬜ |
| Group chat, file sharing, audio calls | P2 | ⬜ |
| Group admin management | P2 | ⬜ |
| Individual notes (personal) | P2 | ⬜ |
| Pod-level notes (shared) | P2 | ⬜ |
| Rich text editing | P2 | ⬜ |

## Database Tables

- Leverages `chat_conversations` (type = GROUP) + `chat_participants`
- `pod_notes` — pod_id, user_id, title, content, is_personal

## Key Files

```
app/(dashboard)/pods/[podId]/notes/
components/notes/
```
