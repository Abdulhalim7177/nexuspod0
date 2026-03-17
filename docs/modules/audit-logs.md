# 📋 Audit Logs Module

> **Phase:** 4 · **Sprint:** 7 · **Status:** ⬜ Not Started

## Purpose

Immutable accountability trail answering: **What happened? Who did it? When?** Prevents silent changes and eliminates blame culture in startup teams.

## Features

| Feature | Priority | Status |
|---------|----------|--------|
| Automatic logging of all mutations | P1 | ⬜ |
| Immutable (append-only, no update/delete) | P1 | ⬜ |
| Timeline viewer in Pod settings | P1 | ⬜ |
| Filter by action type, user, date | P2 | ⬜ |

## Tracked Actions

`CREATE_PROJECT`, `UPDATE_PROJECT`, `DELETE_PROJECT`, `CREATE_TASK`, `UPDATE_TASK`, `DELETE_TASK`, `ADD_MEMBER`, `REMOVE_MEMBER`, `CHANGE_ROLE`, `UPDATE_POD_SETTINGS`

## Database Tables

- `audit_logs` — pod_id, user_id, action, target_type, target_id, metadata (JSONB)

## RLS Policies

- **SELECT:** Pod members only
- **INSERT:** System/trigger only
- **UPDATE:** ❌ Never
- **DELETE:** ❌ Never

## Key Files

```
supabase/migrations/017_*.sql
components/audit/audit-timeline.tsx
```
