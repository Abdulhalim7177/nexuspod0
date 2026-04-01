# Audit Logs Module

> **Phase:** 4 · **Sprint:** 7 · **Status:** 🟡 Partial

## Purpose

Audit logs provide an immutable trail of "Who did what and when" inside a Pod. They answer three questions: What happened? Who did it? When did it happen?

## Features

| Feature | Priority | Status |
|---------|----------|--------|
| `audit_logs` table (append-only via RLS) | P0 | ✅ |
| Task creation logging | P0 | ✅ |
| Task status change logging | P0 | ✅ |
| Project update logging | P0 | ✅ |
| History feed UI (project detail) | P1 | ✅ |
| Filter by action type (All, Tasks, Members, Project) | P1 | ✅ |
| Scrollable activity feed | P1 | ✅ |
| Database triggers for auto-logging | P1 | 🟡 (manual in server actions) |
| Pod-level audit viewer | P1 | ⬜ |
| Member add/remove logging | P1 | 🟡 |

## Database Tables

- `audit_logs` — project_id, pod_id, user_id, action, entity_type, entity_id, old_values, new_values, created_at

## Key Files

```
components/projects/project-history.tsx   # Activity feed component (client-side filter)
app/(dashboard)/pods/[podId]/projects/[projectId]/page.tsx  # Fetches audit logs
lib/projects/actions.ts                   # Logs project actions
lib/tasks/actions.ts                      # Logs task actions
supabase/migrations/009_*.sql             # audit_logs table
```

## Logged Actions

| Action | Entity | Trigger |
|--------|--------|---------|
| TASK_CREATED | TASK | Task creation |
| TASK_STATUS_CHANGED | TASK | Status update |
| TASK_UPDATED | TASK | Task edit |
| TASK_APPROVED | TASK | Review approval |
| TASK_DELETED | TASK | Task deletion |
| PROJECT_UPDATED | PROJECT | Project settings change |
| MEMBER_ADDED | MEMBER | Member added to project |
| MEMBER_REMOVED | MEMBER | Member removed from project |

## RLS Policies

- **SELECT:** Pod members only
- **INSERT:** System/server actions only
- **UPDATE:** Never (immutable)
- **DELETE:** Never (immutable)

## Remaining Work

- Add database-level triggers for automatic logging (currently manual in server actions)
- Add pod-level audit viewer page
- Add user-level activity timeline
