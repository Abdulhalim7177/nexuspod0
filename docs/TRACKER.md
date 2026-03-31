# 📊 Nexus Pod — Development Progress Tracker

> **Last Updated:** 17 March 2026
> **Status:** 🔴 Pre-Development

---

## Legend

| Icon | Meaning |
|------|---------|
| ⬜ | Not Started |
| 🟡 | In Progress |
| ✅ | Completed |
| 🔒 | Blocked |

---

## Phase 1: The Foundation (Auth, Pods, Profiles)

**Status:** ⬜ Not Started · **Target:** Weeks 1–4

### Sprint 1: Environment & Auth Cleanup (Week 1–2)

| # | Increment | Status | Notes |
|---|-----------|--------|-------|
| 1.1 | Install shadcn/ui sidebar + additional components | ✅ | `npx shadcn add sidebar separator sheet ...` |
| 1.2 | Remove tutorial / starter kit components | ✅ | `components/tutorial/`, hero, env-var-warning |
| 1.3 | Create `profiles` table + auto-profile trigger | ✅ | Migration `001_create_profiles.sql` |
| 1.4 | Build dashboard layout (sidebar, topbar, mobile nav) | ✅ | Route group `(dashboard)` |
| 1.5 | Rewrite landing page for Nexus Pod | ✅ | Replace podcast branding |
| 1.6 | Build profile settings page | ✅ | Form + server action |
| 1.7 | Rewrite dashboard home page | ✅ | Pod-centric stats/overview |

### Sprint 2: Pod System (Week 3–4)

| # | Increment | Status | Notes |
|---|-----------|--------|-------|
| 2.1 | Create `pods` table + NPN trigger | ✅ | Migration `002_create_pods.sql` |
| 2.2 | Create `pod_members` table + RLS | ✅ | Migration `003_create_pod_members.sql` |
| 2.3 | Create `pod_invitations` table | ✅ | Migration `004_create_pod_invitations.sql` |
| 2.4 | Create Pod page (form) | ✅ | `/pods/new` |
| 2.5 | Pod list page | ✅ | `/pods` |
| 2.6 | Pod overview page | ✅ | `/pods/[podId]` |
| 2.7 | Invitation system (generate + join) | ✅ | Implemented in `lib/pods/actions.ts` |
| 2.8 | Role management UI | ✅ | Actions in `lib/pods/actions.ts` |
| 2.9 | Pod settings page | ✅ | `/pods/[podId]/settings` |

---

## Phase 2: Execution Engine (Projects & Tasks)

**Status:** ⬜ Not Started · **Target:** Weeks 5–8

### Sprint 3: Project System (Week 5–6)

| # | Increment | Status | Notes |
|---|-----------|--------|-------|
| 3.1 | Create `projects` + `project_members` tables | ⬜ | Public/Private with RLS |
| 3.2 | Project creation form | ⬜ | Title, description, visibility |
| 3.3 | Project list page | ⬜ | Grid/list view per Pod |
| 3.4 | Project detail page | ⬜ | Overview + task board |
| 3.5 | Private project access control | ⬜ | RLS + member management |

### Sprint 4: Task System & Review Loop (Week 7–8)

| # | Increment | Status | Notes |
|---|-----------|--------|-------|
| 4.1 | Create `tasks` + `task_assignees` tables | ⬜ | Status enum, priority |
| 4.2 | Create `task_comments` table | ⬜ | Text, files, links |
| 4.3 | Create `task_submissions` + `task_reviews` tables | ⬜ | Review lifecycle |
| 4.4 | Task board UI (Kanban / List) | ⬜ | Drag-and-drop |
| 4.5 | Task creation form | ⬜ | All required fields |
| 4.6 | Task detail page | ⬜ | Full view + comments |
| 4.7 | DONE / REVERT flow | ⬜ | Assignee evidence submission |
| 4.8 | APPROVE / CORRECT flow | ⬜ | Assigner review panel |
| 4.9 | "My Tasks" cross-pod page | ⬜ | `/tasks` |

---

## Phase 3: Collaboration (Chat, Files, Notifications)

**Status:** ⬜ Not Started · **Target:** Weeks 9–12

### Sprint 5: Chat System (Week 9–10)

| # | Increment | Status | Notes |
|---|-----------|--------|-------|
| 5.1 | Create chat tables (conversations, participants, messages) | ⬜ | Realtime-enabled |
| 5.2 | Chat room component | ⬜ | Infinite scroll |
| 5.3 | Message input (text, file, voice) | ⬜ | Composer UI |
| 5.4 | Pod main chat | ⬜ | Auto-created per Pod |
| 5.5 | Project chat | ⬜ | Auto-created per Project |
| 5.6 | Realtime subscriptions | ⬜ | Live message delivery |
| 5.7 | Typing indicators + online status | ⬜ | Presence API |
| 5.8 | 1-on-1 DMs | ⬜ | `/messages` |
| 5.9 | Message → Task conversion | ⬜ | Context menu action |

### Sprint 6: Files, Voice & Notifications (Week 11–12)

| # | Increment | Status | Notes |
|---|-----------|--------|-------|
| 6.1 | Set up Supabase Storage buckets | ⬜ | RLS policies |
| 6.2 | File upload component | ⬜ | Drag-and-drop |
| 6.3 | Create `files` table | ⬜ | File registry |
| 6.4 | Voice note recording (24h TTL) | ⬜ | WebAudio API |
| 6.5 | Create `notifications` table | ⬜ | In-app notifications |
| 6.6 | Notification bell + dropdown | ⬜ | UI component |
| 6.7 | Realtime notifications | ⬜ | User channel |
| 6.8 | Deadline reminder cron | ⬜ | pg_cron |
| 6.9 | @mention, read receipts, pinning | ⬜ | Chat enhancements |

---

## Phase 4: Ecosystem (Opportunities, Audit, Teams)

**Status:** ⬜ Not Started · **Target:** Weeks 13–16

### Sprint 7: Opportunity Engine & Audit Logs (Week 13–14)

| # | Increment | Status | Notes |
|---|-----------|--------|-------|
| 7.1 | Create `opportunities` table | ⬜ | Cross-pod RLS |
| 7.2 | Opportunities page + form | ⬜ | `/opportunities` |
| 7.3 | Cross-pod visibility (Nexus Network) | ⬜ | RLS policies |
| 7.4 | Create `audit_logs` table (append-only) | ⬜ | Immutable trail |
| 7.5 | Audit log triggers | ⬜ | Auto-log mutations |
| 7.6 | Audit log viewer | ⬜ | Timeline UI |

### Sprint 8: Team Management (Week 15–16)

| # | Increment | Status | Notes |
|---|-----------|--------|-------|
| 8.1 | Create `teams` + `team_members` tables | ⬜ | Team hierarchy |
| 8.2 | Team CRUD UI | ⬜ | Create, edit, delete |
| 8.3 | Team member management | ⬜ | Assign leads |
| 8.4 | Team-specific task boards | ⬜ | Filtered views |
| 8.5 | Team chat rooms | ⬜ | Auto-created |

---

## Phase 5: Gamification (Momentum, Streaks, Leaderboard)

**Status:** ⬜ Not Started · **Target:** Weeks 17–20

### Sprint 9: Momentum System (Week 17–18)

| # | Increment | Status | Notes |
|---|-----------|--------|-------|
| 9.1 | Create `pod_momentum` table | ⬜ | Score storage |
| 9.2 | Momentum calculation algorithm | ⬜ | Weighted formula |
| 9.3 | Momentum dashboard (gauge) | ⬜ | Visual display |
| 9.4 | Pod streaks | ⬜ | Consecutive day tracking |
| 9.5 | Founder overview dashboard | ⬜ | Multi-pod view |

### Sprint 10: Leaderboard & Reports (Week 19–20)

| # | Increment | Status | Notes |
|---|-----------|--------|-------|
| 10.1 | Global leaderboard | ⬜ | Ranked pods |
| 10.2 | Weekly build report (auto-email) | ⬜ | Edge Function + cron |
| 10.3 | Pod analytics charts | ⬜ | Recharts/Chart.js |

---

## Phase 6: Advanced Features (Weeks 21–26)

**Status:** ⬜ Not Started

| Sprint | Module | Status |
|--------|--------|--------|
| Sprint 11 | Pod Groups & Notes | ⬜ |
| Sprint 12 | Multi-Founder Governance & CRM | ⬜ |
| Sprint 13 | Smart Calendar & Operations Hub | ⬜ |

---

## Phase 7: Public Presence (Weeks 27–28)

**Status:** ⬜ Not Started

| Sprint | Module | Status |
|--------|--------|--------|
| Sprint 14 | Mini Websites (User Portfolios) | ⬜ |
| Sprint 15 | GitHub & Google Meet Integration | ⬜ |

---

## Phase 8: Polish & Launch (Weeks 29–32)

**Status:** ⬜ Not Started

| Sprint | Module | Status |
|--------|--------|--------|
| Sprint 16 | Unit + E2E Tests, Security Audit, SEO, CI/CD, Deploy | ⬜ |

---

## Module Completion Summary

| Module | Phase | Status | README |
|--------|-------|--------|--------|
| Auth & Profiles | 1 | ✅ | [README](./modules/auth-profiles.md) |
| Pods | 1 | ⬜ | [README](./modules/pods.md) |
| Projects | 2 | ⬜ | [README](./modules/projects.md) |
| Tasks | 2 | ⬜ | [README](./modules/tasks.md) |
| Chat & Messaging | 3 | ⬜ | [README](./modules/chat.md) |
| Files & Storage | 3 | ⬜ | [README](./modules/files.md) |
| Notifications | 3 | ⬜ | [README](./modules/notifications.md) |
| Opportunities | 4 | ⬜ | [README](./modules/opportunities.md) |
| Audit Logs | 4 | ⬜ | [README](./modules/audit-logs.md) |
| Teams | 4 | ⬜ | [README](./modules/teams.md) |
| Momentum & Gamification | 5 | ⬜ | [README](./modules/momentum.md) |
| Groups & Notes | 6 | ⬜ | [README](./modules/groups-notes.md) |
| CRM & Governance | 6 | ⬜ | [README](./modules/crm-governance.md) |
| Calendar & Ops Hub | 6 | ⬜ | [README](./modules/calendar-ops.md) |
| Mini Websites | 7 | ⬜ | [README](./modules/mini-websites.md) |
| Integrations | 7 | ⬜ | [README](./modules/integrations.md) |
