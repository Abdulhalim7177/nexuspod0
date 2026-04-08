# Projects Module

> **Phase:** 2 · **Sprint:** 3 · **Status:** ✅ Complete

## Purpose

Projects are containers for tasks within a Pod. They can be Public (visible to all Pod members) or Private (invite-only). Each project has its own detail page with task board, member management, history feed, and settings.

## Features

| Feature | Priority | Status |
|---------|----------|--------|
| Project CRUD (Founder/Manager/Lead) | P0 | ✅ |
| Public/Private visibility toggle | P0 | ✅ |
| Unlimited projects per Pod | P0 | ✅ |
| Project detail page with tabs | P0 | ✅ |
| Project Brief (stats, progress, details) | P1 | ✅ |
| Project member management | P0 | ✅ |
| Private project access control (Request to Join) | P0 | ✅ |
| Public project access for all pod members | P0 | ✅ |
| Activity feed with filters | P1 | ✅ |
| Project settings (update/delete) | P1 | ✅ |
| Mobile-friendly tabs | P1 | ✅ |
| Milestones & progress tracking | P2 | 🟡 (UI exists) |

## Database Tables

- `projects` — pod_id, title, description, is_private, created_by, created_at
- `project_members` — project_id, user_id (for private projects)

## Key Files

```
app/(dashboard)/pods/[podId]/projects/page.tsx         # Project list
app/(dashboard)/pods/[podId]/projects/[projectId]/page.tsx  # Project detail (tabbed)
components/projects/project-list.tsx                    # Grid card layout
components/projects/project-settings.tsx                # Settings form
components/projects/project-history.tsx                 # Activity feed (filterable, scrollable)
components/projects/project-member-manager.tsx          # Member CRUD
components/projects/project-invite-button.tsx           # Invite UI
components/projects/create-project-form.tsx             # Creation form
lib/projects/actions.ts                                 # Server actions
supabase/migrations/005_*.sql                           # Projects table
supabase/migrations/006_*.sql                           # RLS + project_members
```

## RLS Summary

- **Public projects:** All Pod members can see and access
- **Private projects:** Only `project_members` + Founder/Manager can see
- **INSERT:** Founder, Pod Manager, Team Lead only
- **UPDATE/DELETE:** Founder, Pod Manager only

## Project Detail Tabs

| Tab | Content |
|-----|---------|
| Board | Task board (Kanban) |
| Team | Member management |
| Brief | Description, progress bar, task stats grid, details |
| History | Filterable audit log feed |
| Settings | Update title, description, visibility (admin only) |
| Chat | Placeholder for real-time chat |
