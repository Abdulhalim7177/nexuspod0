# Nexus Pod

> **A multi-tenant workspace and ecosystem platform for African founders.**
> Combines project/task management with a Cross-Pod Opportunity Engine, Momentum Scoring, and accountability-driven collaboration.

**Stack:** Next.js 15 (App Router) · Supabase (PostgreSQL, Auth, Realtime, Storage) · Tailwind CSS · shadcn/ui · Vercel

---

## What Is Nexus Pod?

Nexus Pod solves the **isolation problem** faced by early-stage African startup founders. Unlike traditional project management tools (Jira, Trello), Nexus Pod combines:

- **Pod-based Workspaces** — Isolated multi-tenant environments with role-based access
- **Execution Engine** — Tasks with a Verification Loop (TODO → IN_PROGRESS → SUBMITTED → UNDER_REVIEW → APPROVED/CORRECT)
- **Collaboration Suite** — Real-time chat (Pod, Project, DM), file uploads, voice notes, notifications
- **Opportunity Engine** — Cross-pod collaboration and hiring posts (Coming Soon)
- **Momentum Scoring** — Gamified productivity tracking with streaks and leaderboards (Coming Soon)

---

## Implementation Status

### Phase 1: Foundation — ✅ Complete
- ✅ Auth system (email/password, social, magic link)
- ✅ User profiles with auto-creation trigger
- ✅ Pod creation with auto-generated NPN (NP-XXXXX)
- ✅ Pod member management (Founder, Manager, Team Lead, Member)
- ✅ Invitation system with codes and join flow
- ✅ Pod settings, RLS policies, mobile-responsive layout

### Phase 2: Execution Engine — ✅ Complete
- ✅ Project CRUD with Public/Private visibility
- ✅ Project member management (add, remove, role-based)
- ✅ Project settings with visibility toggle
- ✅ Task board (Kanban view) with status columns
- ✅ Task creation, editing, deletion
- ✅ Multi-assignee support
- ✅ Full task lifecycle: TODO → IN_PROGRESS → SUBMITTED → UNDER_REVIEW → APPROVED/DONE
- ✅ Task submissions with evidence (description, files, links)
- ✅ Review loop: Approve or Correct with feedback
- ✅ Sub-tasks with real-time UI updates
- ✅ Task detail dialog/sheet with full metadata
- ✅ "My Tasks" cross-pod dashboard
- ✅ Activity feed with filter (All, Tasks, Members, Project)
- ✅ Audit logs with History tab and filters

### Phase 3: Collaboration — ✅ Complete
- ✅ Real-time chat (POD, PROJECT, TEAM, DM, GROUP types)
- ✅ File uploads (Supabase Storage - 5 buckets)
- ✅ Notifications system with realtime updates
- ✅ Voice note recording
- ✅ Typing indicators & online presence
- ✅ 1-on-1 DMs
- ✅ @mentions, read receipts, message pinning

### Phase 4: Ecosystem — 🟡 ~30% Complete
- ✅ Audit logs (auto-logged for task/project actions, history feed with filters)
- ⬜ Opportunities engine (cross-pod posts)
- ⬜ Team management

### Phase 5: Gamification — 🟡 ~5% Complete
- 🟡 Momentum tab exists (placeholder UI in navigation)
- ⬜ Momentum scoring algorithm
- ⬜ Pod streaks
- ⬜ Global leaderboard
- ⬜ Weekly build reports

### Phase 6+: Advanced — ⬜ Not Started
- ⬜ Pod Groups & Notes
- ⬜ CRM & Multi-Founder Governance
- ⬜ Smart Calendar & Ops Hub
- ⬜ Mini Websites (user portfolios)
- ⬜ GitHub & Google Meet integration

---

## Key Features (Implemented)

### Sidebar Navigation
- Unified navigation across all pages
- Collapsible accordion groups (Overview, Workspace, Pod, Collaboration, Insights, Settings)
- Pod selector dropdown for quick switching
- Live task count badge on "My Tasks"
- Mobile-responsive with Sheet overlay
- Create Project modal integrated into sidebar

### Project Detail Page
- Tabbed interface: Board, Team, Brief, History, Settings, Chat
- Mobile-friendly tabs (icons + small text, scrollable)
- Project Brief tab with stats grid, progress bar, and detail cards
- Sticky top navbar on all screen sizes

### Task Management
- Kanban board with status columns
- Task detail with sub-tasks, attachments, execution loop
- Real-time sub-task creation and toggle (instant UI feedback)
- Submission → Review → Approve/Correct workflow

### Real-Time Chat
- Multiple conversation types: Pod, Project, Team, DM, Group
- Supabase Realtime subscriptions for instant message delivery
- File attachments and voice notes in messages
- Typing indicators and online presence
- Message pinning and @mentions

### Notifications
- Realtime notification bell with dropdown
- Email notifications with branded HTML templates
- Task assignment, submission, review, and comment alerts

---

## Quick Start

```bash
# 1. Clone and install
git clone <repo-url>
cd nexuspod0
npm install

# 2. Configure environment
cp .env.example .env.local
# Add your Supabase URL and anon key

# 3. Run database migrations
npx supabase db push

# 4. Start development server
npm run dev
```

The app runs at [localhost:3000](http://localhost:3000).

---

## Project Structure

```
app/
├── (dashboard)/           # Authenticated routes
│   ├── dashboard-client.tsx  # Sidebar + Topbar layout
│   ├── dashboard/            # Dashboard home
│   ├── pods/                 # Pod pages (list, create, detail, settings, members, chat)
│   ├── profile/              # User profile
│   └── messages/             # Direct messaging
├── api/                   # API routes (pods, email)
├── auth/                  # Auth pages (login, signup, confirm, etc.)
components/
├── layout/                # AppSidebar, Topbar
├── projects/              # ProjectList, ProjectSettings, ProjectHistory, etc.
├── tasks/                 # TaskBoard, TaskDetailDialog, TaskDetailSheet
├── chat/                  # ChatContainer, ChatInput, ChatMessages, etc.
├── notifications/         # NotificationBell
├── shared/                # FileUpload, VoiceRecorder
├── ui/                    # shadcn/ui primitives
lib/
├── navigation.ts          # Unified sidebar navigation config
├── pods/actions.ts        # Pod server actions
├── projects/actions.ts    # Project server actions
├── tasks/actions.ts       # Task server actions
├── chat/actions.ts        # Chat server actions
├── notifications/actions.ts # Notification server actions
├── email.ts               # Email service with HTML templates
├── supabase/              # Client, server, middleware
supabase/
├── migrations/            # 21 SQL migration files
docs/
├── TRACKER.md             # Development progress tracker
```

---

## Database Schema (Core Tables)

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles (name, avatar, bio, skills) |
| `pods` | Workspaces (title, NPN, founder_id) |
| `pod_members` | Pod membership (user_id, role) |
| `pod_invitations` | Invitation codes |
| `projects` | Project containers (title, visibility, pod_id) |
| `project_members` | Private project access |
| `tasks` | Task units (title, status, priority, due_date) |
| `task_assignees` | Task assignment |
| `task_submissions` | Evidence submissions |
| `task_reviews` | Approve/correct actions |
| `audit_logs` | Immutable action trail |
| `conversations` | Chat rooms (POD, PROJECT, TEAM, DM, GROUP) |
| `participants` | Conversation membership |
| `messages` | Chat messages with realtime |
| `notifications` | User notifications |

---

## Next Steps

See [docs/TRACKER.md](./docs/TRACKER.md) for the full development roadmap.

**Immediate Priorities:**
1. Opportunities Engine (cross-pod collaboration posts)
2. Team Management (teams, team leads, team task boards)
3. Momentum Scoring Algorithm & Leaderboard
4. Message-to-Task conversion
5. Deadline reminder cron (pg_cron)
