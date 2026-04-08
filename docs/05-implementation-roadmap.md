# Nexus Pod — Implementation Roadmap

> **Version:** 1.0
> **Date:** 17 March 2026
> **Estimated Total:** 8 Phases · ~16 Sprints · ~32 Weeks

---

## Roadmap Overview

```
Phase 1 ████████░░░░░░░░░░░░░░░░ Foundation (Auth, Pods, Profiles)
Phase 2 ░░░░░░░░████████░░░░░░░░ Execution Engine (Projects, Tasks)
Phase 3 ░░░░░░░░░░░░░░░░████████ Collaboration (Chat, Files, Notifications)
Phase 4 ░░░░░░░░░░░░░░░░░░░░████ Ecosystem (Opportunities, Audit)
Phase 5 ░░░░░░░░░░░░░░░░░░░░░░██ Gamification (Momentum, Streaks)
Phase 6 ░░░░░░░░░░░░░░░░░░░░░░░█ Advanced (CRM, Calendar, Teams)
Phase 7 ░░░░░░░░░░░░░░░░░░░░░░░█ Public (Mini-Website, GitHub)
Phase 8 ░░░░░░░░░░░░░░░░░░░░░░░█ Polish (Performance, Testing, Launch)
```

---

## Phase 1: The Foundation (Weeks 1–4)

> **Goal:** Working auth, user profiles, Pod creation/joining, and basic dashboard shell.

### Sprint 1: Environment & Auth Cleanup (Week 1–2)

| Task | Description | Files/Components |
|------|-------------|-----------------|
| 1.1 | **Rewrite landing page** — Replace podcast content with Nexus Pod branding, value proposition, and features | `app/page.tsx` |
| 1.2 | **Rewrite dashboard** — Replace podcast stats with pod-centric dashboard shell | `app/dashboard/page.tsx` |
| 1.3 | **Remove tutorial components** — Clean starter kit artifacts | `components/tutorial/` |
| 1.4 | **Create `profiles` table** — Migration + trigger `on_auth_user_created` | `supabase/migrations/001_profiles.sql` |
| 1.5 | **Profile settings page** — Edit name, avatar, bio, skills, social links | `app/(dashboard)/profile/page.tsx` |
| 1.6 | **Install additional shadcn/ui** — Dialog, Tabs, Select, Textarea, Avatar, Toast, Sheet | `components/ui/` |
| 1.7 | **Build dashboard layout** — Sidebar navigation, topbar, mobile nav | `components/layout/` |

**Deliverable:** Clean brandedapp with profile management and dashboard shell.

### Sprint 2: Pod System (Week 3–4)

| Task | Description | Files/Components |
|------|-------------|-----------------|
| 2.1 | **Create `pods` table** — Migration with NPN trigger | `supabase/migrations/002_pods.sql` |
| 2.2 | **Create `pod_members` table** — With RLS policies | `supabase/migrations/003_pod_members.sql` |
| 2.3 | **Create `pod_invitations` table** | `supabase/migrations/004_pod_invitations.sql` |
| 2.4 | **Create Pod page** — Form with title, summary, picture | `app/(dashboard)/pods/new/page.tsx` |
| 2.5 | **Pod list page** — Show all user's Pods with NPN | `app/(dashboard)/pods/page.tsx` |
| 2.6 | **Pod overview page** — Dashboard within a Pod | `app/(dashboard)/pods/[podId]/page.tsx` |
| 2.7 | **Invitation system** — Generate invite link, join via link | `app/(dashboard)/pods/[podId]/members/` |
| 2.8 | **Role management** — Assign/change roles (Founder only) | Pod members page |
| 2.9 | **Pod settings** — Edit Pod details, manage members | `app/(dashboard)/pods/[podId]/settings/` |

**Deliverable:** Users can create Pods, invite members, assign roles, and see their Pod list.

---

## Phase 2: Execution Engine (Weeks 5–8)

> **Goal:** Full project and task system with the review/approval lifecycle.

### Sprint 3: Project System (Week 5–6)

| Task | Description | Files/Components |
|------|-------------|-----------------|
| 3.1 | **Create `projects` table** — Public/Private with RLS | `supabase/migrations/005_projects.sql` |
| 3.2 | **Create `project_members` table** — For private projects | `supabase/migrations/006_project_members.sql` |
| 3.3 | **Project creation form** — Title, description, visibility | `components/projects/create-project-form.tsx` |
| 3.4 | **Project list page** — Grid/list view within a Pod | `app/(dashboard)/pods/[podId]/projects/page.tsx` |
| 3.5 | **Project detail page** — Overview with task board | `app/(dashboard)/pods/[podId]/projects/[projectId]/page.tsx` |
| 3.6 | **Private project access control** — RLS + member management UI | Server actions + UI |

**Deliverable:** Full project CRUD with public/private visibility.

### Sprint 4: Task System & Review Loop (Week 7–8)

| Task | Description | Files/Components |
|------|-------------|-----------------|
| 4.1 | **Create `tasks` table** — With status enum and priority | `supabase/migrations/007_tasks.sql` |
| 4.2 | **Create `task_assignees` table** | `supabase/migrations/008_task_assignees.sql` |
| 4.3 | **Create `task_comments` table** | `supabase/migrations/009_task_comments.sql` |
| 4.4 | **Create `task_submissions` + `task_reviews` tables** | `supabase/migrations/010_task_lifecycle.sql` |
| 4.5 | **Task board UI** — Kanban (Not Started → Ongoing → Done) or List view | `components/tasks/project-board.tsx` |
| 4.6 | **Task creation form** — Title, description, due date, assignees, priority, files | `components/tasks/task-form.tsx` |
| 4.7 | **Task detail page** — Full view with comments, status actions | `components/tasks/task-detail.tsx` |
| 4.8 | **DONE/REVERT flow** — Assignee submits evidence | `components/tasks/review-panel.tsx` |
| 4.9 | **APPROVE/CORRECT flow** — Assigner reviews + provides feedback | `components/tasks/review-panel.tsx` |
| 4.10 | **Task comments** — Text, files, links with delete rules | `components/tasks/task-comments.tsx` |
| 4.11 | **"My Tasks" page** — Cross-pod view of assigned tasks | `app/(dashboard)/tasks/page.tsx` |

**Deliverable:** Complete task lifecycle including the verification/approval loop.

---

## Phase 3: Collaboration (Weeks 9–12)

> **Goal:** Real-time chat, file sharing, and notifications.

### Sprint 5: Chat System (Week 9–10)

| Task | Description | Files/Components |
|------|-------------|-----------------|
| 5.1 | **Create `chat_conversations` + `chat_participants` tables** | `supabase/migrations/011_chat.sql` |
| 5.2 | **Create `chat_messages` table** — With realtime subscription | `supabase/migrations/012_chat_messages.sql` |
| 5.3 | **Chat room component** — Message list with infinite scroll | `components/chat/chat-room.tsx` |
| 5.4 | **Message input** — Text composer with file attach, voice record button | `components/chat/message-input.tsx` |
| 5.5 | **Pod main chat** — Auto-created per Pod | `app/(dashboard)/pods/[podId]/chat/page.tsx` |
| 5.6 | **Project chat** — Auto-created per Project | `app/(dashboard)/pods/[podId]/projects/[projectId]/chat/page.tsx` |
| 5.7 | **Realtime subscriptions** — Live message delivery via Supabase Realtime | Supabase channel setup |
| 5.8 | **Typing indicators & online status** — Presence API | `components/chat/typing-indicator.tsx` |
| 5.9 | **1-on-1 DMs** — Create DM conversations between users | `app/(dashboard)/messages/page.tsx` |
| 5.10 | **Message → Task conversion** — "Create Task" from chat message | Chat context menu |

**Deliverable:** Fully functional realtime chat with Pod, Project, and DM rooms.

### Sprint 6: Files, Voice & Notifications (Week 11–12)

| Task | Description | Files/Components |
|------|-------------|-----------------|
| 6.1 | **Set up Supabase Storage** — Create buckets with RLS | Supabase dashboard + policies |
| 6.2 | **File upload component** — Drag-and-drop with progress | `components/shared/file-upload.tsx` |
| 6.3 | **Create `files` table** — File registry | `supabase/migrations/013_files.sql` |
| 6.4 | **Voice note recording** — WebAudio API + 24h auto-delete | `components/chat/voice-recorder.tsx` |
| 6.5 | **Create `notifications` table** | `supabase/migrations/014_notifications.sql` |
| 6.6 | **Notification bell + dropdown** | `components/notifications/` |
| 6.7 | **Realtime notifications** — Subscribe to user's notification channel | Client subscription |
| 6.8 | **Deadline reminder cron** — pg_cron job every hour | `supabase/migrations/015_cron_jobs.sql` |
| 6.9 | **@mention support** — Tag users in chat and comments | Chat/comment input enhancement |
| 6.10 | **Read receipts** | Chat message status |
| 6.11 | **Message pinning** | Pin/unpin messages |

**Deliverable:** File sharing, voice notes, notifications, and deadline reminders.

---

## Phase 4: Ecosystem (Weeks 13–16)

> **Goal:** Opportunity Engine, audit logs, and team management.

### Sprint 7: Opportunity Engine & Audit Logs (Week 13–14)

| Task | Description | Files/Components |
|------|-------------|-----------------|
| 7.1 | **Create `opportunities` table** | `supabase/migrations/016_opportunities.sql` |
| 7.2 | **Opportunities page** — List + create form | `app/(dashboard)/opportunities/page.tsx` |
| 7.3 | **Cross-pod visibility** — RLS for NEXUS_NETWORK posts | RLS policies |
| 7.4 | **Create `audit_logs` table** — Append-only | `supabase/migrations/017_audit_logs.sql` |
| 7.5 | **Audit log triggers** — Auto-log project/task/member mutations | DB triggers |
| 7.6 | **Audit log viewer** — Timeline in Pod settings | UI component |

**Deliverable:** Cross-pod opportunity posting and full audit trail.

### Sprint 8: Team Management (Week 15–16)

| Task | Description | Files/Components |
|------|-------------|-----------------|
| 8.1 | **Create `teams` + `team_members` tables** | `supabase/migrations/018_teams.sql` |
| 8.2 | **Team CRUD** — Create, edit, delete teams | `app/(dashboard)/pods/[podId]/teams/` |
| 8.3 | **Team member management** — Add/remove, assign Team Lead | UI components |
| 8.4 | **Team-specific task boards** | Filtered project board |
| 8.5 | **Team chat** — Auto-created chat room per team | Chat system extension |

**Deliverable:** Full team hierarchy within Pods.

---

## Phase 5: Gamification (Weeks 17–20)

> **Goal:** Momentum scoring, streaks, leaderboard, and weekly reports.

### Sprint 9: Momentum System (Week 17–18)

| Task | Description | Files/Components |
|------|-------------|-----------------|
| 9.1 | **Create `pod_momentum` table** | `supabase/migrations/019_momentum.sql` |
| 9.2 | **Momentum calculation** — Weighted algorithm | Edge Function or DB function |
| 9.3 | **Momentum dashboard** — Visual gauge per Pod | `components/dashboard/momentum-gauge.tsx` |
| 9.4 | **Pod streaks** — Consecutive day tracking | Cron job + UI |
| 9.5 | **Founder dashboard** — All Pods with momentum overview | `app/(dashboard)/dashboard/page.tsx` |

### Sprint 10: Leaderboard & Reports (Week 19–20)

| Task | Description | Files/Components |
|------|-------------|-----------------|
| 10.1 | **Global leaderboard** — Ranked Pods by momentum | `app/(dashboard)/leaderboard/page.tsx` |
| 10.2 | **Weekly build report** — Auto-generated email every Monday | Edge Function + pg_cron |
| 10.3 | **Pod analytics** — Charts and metrics | Dashboard components |

**Deliverable:** Momentum scores, streaks, leaderboard, and automated reports.

---

## Phase 6: Advanced Features (Weeks 21–26)

> **Goal:** Groups, notes, multi-founder governance, CRM, calendar.

### Sprint 11: Groups & Notes (Week 21–22)

| Task | Description |
|------|-------------|
| 11.1 | **Pod Groups** — Public/private discussion rooms |
| 11.2 | **Create `pod_notes` table + UI** — Personal and Pod-level notes |

### Sprint 12: Governance & CRM (Week 23–24)

| Task | Description |
|------|-------------|
| 12.1 | **Multi-founder governance** — Multiple founders, protected original |
| 12.2 | **Lightweight CRM** — Contacts, Deals, Activity Notes |

### Sprint 13: Calendar & Operations Hub (Week 25–26)

| Task | Description |
|------|-------------|
| 13.1 | **Smart Calendar** — Pod + personal calendars |
| 13.2 | **Operations Hub** — Wiki-like documentation area |

---

## Phase 7: Public Presence (Weeks 27–28)

> **Goal:** Mini-websites (user portfolios) and GitHub integration.

### Sprint 14: Mini Websites (Week 27)

| Task | Description |
|------|-------------|
| 14.1 | **Public portfolio page** — `app/[username]/page.tsx` |
| 14.2 | **Builder profiles** — Skills, pods joined, contributions |

### Sprint 15: Integrations (Week 28)

| Task | Description |
|------|-------------|
| 15.1 | **GitHub sync** — Connect repos, display activity |
| 15.2 | **Google Meet integration** — Meeting scheduling |

---

## Phase 8: Polish & Launch (Weeks 29–32)

> **Goal:** Performance optimization, testing, and production deployment.

### Sprint 16: Testing & Launch (Week 29–32)

| Task | Description |
|------|-------------|
| 16.1 | **Unit tests** — Vitest for momentum calculations, RLS logic |
| 16.2 | **E2E tests** — Playwright: signup → create pod → create task → approve |
| 16.3 | **Performance audit** — Lighthouse, Core Web Vitals |
| 16.4 | **Security audit** — RLS policy review, penetration testing |
| 16.5 | **SEO optimization** — Meta tags, OG images, sitemap |
| 16.6 | **Production deploy** — Vercel + Supabase production project |
| 16.7 | **CI/CD pipeline** — GitHub Actions: lint, test, deploy |
| 16.8 | **Documentation** — README, API docs, onboarding guide |

---

## MVP Definition (Phases 1–3)

The **Minimum Viable Product** comprises Phases 1–3 (~12 weeks) and includes:

| Feature | Included |
|---------|:--------:|
| Auth (email/password) | ✅ |
| User profiles | ✅ |
| Pod CRUD + NPN | ✅ |
| Member invitation & roles | ✅ |
| Projects (public/private) | ✅ |
| Task lifecycle (create → review → approve) | ✅ |
| Pod chat + Project chat | ✅ |
| 1-on-1 DMs | ✅ |
| File sharing | ✅ |
| Notifications + deadline reminders | ✅ |
| Teams | ❌ (Phase 4) |
| Opportunity Engine | ❌ (Phase 4) |
| Momentum/Gamification | ❌ (Phase 5) |
| CRM/Calendar | ❌ (Phase 6) |
| Mini-websites | ❌ (Phase 7) |

---

## Technology Additions Per Phase

| Phase | New Dependencies |
|-------|-----------------|
| **1** | Additional shadcn/ui components, react-hook-form, zod |
| **2** | @tanstack/react-query |
| **3** | Supabase Realtime subscriptions, WebAudio API |
| **4** | — |
| **5** | Chart.js or Recharts (analytics) |
| **6** | Calendar library (e.g., @fullcalendar/react) |
| **7** | Octokit (GitHub API) |
| **8** | Vitest, Playwright, Lighthouse CI |
