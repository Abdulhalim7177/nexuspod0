# Tasks Module

> **Phase:** 2 · **Sprint:** 4 · **Status:** ✅ Complete

## Purpose

Tasks are the core execution units inside Projects. Nexus Pod uses a **Verification Loop** — work is only "Completed" when the Assigner approves the submission, preventing silent completion.

## Features

| Feature | Priority | Status |
|---------|----------|--------|
| Task CRUD (title, description, due date, priority) | P0 | ✅ |
| Multi-assignee support | P0 | ✅ |
| Task statuses (Not Started → Ongoing → Done → Approved) | P0 | ✅ |
| Kanban board view | P0 | ✅ |
| Task detail dialog/sheet | P0 | ✅ |
| Sub-tasks (real-time add/toggle/remove) | P1 | ✅ |
| DONE → SUBMIT evidence flow | P0 | ✅ |
| APPROVE / CORRECT review loop | P0 | ✅ |
| "My Tasks" cross-pod dashboard | P0 | ✅ |
| Task counter badge in sidebar | P1 | ✅ |
| Task comments | P1 | ⬜ |
| File attachments on tasks | P1 | ⬜ |
| Create task from chat message | P1 | ⬜ |

## Task Lifecycle

```
Created → TODO → IN_PROGRESS → SUBMITTED (assignee)
                                     ↓
                              UNDER_REVIEW
                                 ↙        ↘
                          APPROVED       CORRECTED
                           (Final)    (Returns to IN_PROGRESS)
                                        ↓
                                  Assignee Revises
                                        ↓
                                  SUBMITTED again (loop)
```

## Database Tables

- `tasks` — project_id, pod_id, title, description, status, priority, due_date, created_by
- `task_assignees` — task_id, user_id
- `task_submissions` — task_id, submitted_by, description, file_urls, link_urls
- `task_reviews` — submission_id, reviewed_by, action (APPROVED/CORRECTED), feedback

## Key Files

```
app/(dashboard)/pods/[podId]/projects/[projectId]/  # Project detail with task board
app/(dashboard)/tasks/                              # My Tasks (cross-pod)
components/tasks/task-board.tsx                     # Kanban board
components/tasks/task-detail-dialog.tsx             # Task detail (modal)
components/tasks/task-detail-sheet.tsx              # Task detail (sheet)
components/tasks/task-create-dialog.tsx             # Task creation
lib/tasks/actions.ts                                # Server actions
supabase/migrations/007_*.sql - 018_*.sql           # Tasks tables + RLS
```

## Sub-Tasks (Real-time)

Sub-tasks use local `useState` for instant UI feedback:
- Adding a sub-task updates the list immediately, then saves to DB
- Toggling completion updates the checkbox immediately
- Removing a sub-task hides it immediately
- Parent task state syncs via `onTaskUpdate` callback

## Status Update Rules

- Founder/Manager → can update any task status
- Assignee → can update only their assigned tasks
- Sub-tasks are managed via `sub_tasks` JSONB field on the task record
