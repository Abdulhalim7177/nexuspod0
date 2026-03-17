# ✅ Tasks Module

> **Phase:** 2 · **Sprint:** 4 · **Status:** ⬜ Not Started

## Purpose

Tasks are the core execution units inside Projects. Nexus Pod uses a unique **Verification Loop** — work is only "Completed" when the Assigner approves the submission, preventing silent completion.

## Features

| Feature | Priority | Status |
|---------|----------|--------|
| Task CRUD (title, description, due date, priority) | P0 | ⬜ |
| Multi-assignee support | P0 | ⬜ |
| Task statuses (Not Started → Ongoing → Done → Approved) | P0 | ⬜ |
| Kanban board view | P0 | ⬜ |
| List view | P0 | ⬜ |
| DONE → REVERT → submit evidence | P0 | ⬜ |
| APPROVE / CORRECT review loop | P0 | ⬜ |
| Task comments (text, files, links) | P1 | ⬜ |
| File attachments on tasks | P1 | ⬜ |
| "My Tasks" cross-pod dashboard | P0 | ⬜ |
| Create task from chat message | P1 | ⬜ |
| @task reference in chat | P2 | ⬜ |

## Task Lifecycle

```
Created → Not Started → Ongoing → DONE (assignee)
                                     ↓
                              REVERT (submit evidence)
                                     ↓
                         Assigner Reviews Submission
                            ↙              ↘
                     APPROVED           CORRECTED
                      (Final)        (Returns to Ongoing)
                                          ↓
                                    Assignee Revises
                                          ↓
                                    DONE again (loop)
```

## Database Tables

- `tasks` — project_id, pod_id, title, description, status, priority, due_date, created_by
- `task_assignees` — task_id, user_id
- `task_comments` — task_id, user_id, content, file_urls, link_urls
- `task_submissions` — task_id, submitted_by, description, file_urls, link_urls
- `task_reviews` — task_id, submission_id, reviewed_by, action, feedback

## Key Files

```
app/(dashboard)/pods/[podId]/projects/[projectId]/
app/(dashboard)/tasks/                # My Tasks
components/tasks/
supabase/migrations/007_*.sql - 010_*.sql
```

## Status Update Rules

- Founder/Manager → can update any task status
- Assignee → can update only their assigned tasks
- Only commenter + Founder/Manager can delete comments
- Files & links in comments require explanation text
