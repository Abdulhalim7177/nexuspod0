# 📁 Projects Module

> **Phase:** 2 · **Sprint:** 3 · **Status:** ⬜ Not Started

## Purpose

Projects are containers for tasks within a Pod. They can be Public (visible to all Pod members) or Private (invite-only). Each project has its own chat room and file space.

## Features

| Feature | Priority | Status |
|---------|----------|--------|
| Project CRUD (Founder/Manager/Lead) | P0 | ⬜ |
| Public/Private visibility | P0 | ⬜ |
| Unlimited projects per Pod | P0 | ⬜ |
| Project-level file sharing | P1 | ⬜ |
| Milestones & progress tracking | P2 | ⬜ |
| Auto-create project chat room | P0 | ⬜ |

## Database Tables

- `projects` — pod_id, title, description, is_private, created_by
- `project_members` — project_id, user_id (for private projects only)

## Key Files

```
app/(dashboard)/pods/[podId]/projects/
app/(dashboard)/pods/[podId]/projects/[projectId]/
components/projects/
supabase/migrations/005_*.sql
supabase/migrations/006_*.sql
```

## RLS Summary

- **Public projects:** All Pod members can see
- **Private projects:** Only `project_members` + Founder/Manager can see
- **INSERT:** Founder, Pod Manager, Team Lead only
- **UPDATE/DELETE:** Founder, Pod Manager only
