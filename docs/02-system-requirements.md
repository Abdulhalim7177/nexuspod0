# Nexus Pod — System Requirements Document (SRD)

> **Version:** 1.0
> **Date:** 17 March 2026

---

## 1. Product Vision

Nexus Pod is a **multi-tenant workspace and ecosystem platform** that combines project/task management with community-driven collaboration features. It is designed for African founders and startup teams to manage execution, maintain accountability, and discover cross-team opportunities.

---

## 2. User Roles & Permissions Matrix

### 2.1 Role Definitions

| Role | Description | Scope |
|------|-------------|-------|
| **Founder / CEO** | Creator of the Pod. Root authority. Cannot be removed. | Full Pod control |
| **Pod Manager** | Execution manager. Promoted by Founder only. | Project & Task management |
| **Team Lead** | Leads one or more teams. Assigned by Founder/Manager. | Team-level operations |
| **Member** | The workforce. Joins via invitation link. | Task execution & collaboration |

### 2.2 Permissions Matrix

| Action | Founder | Pod Manager | Team Lead | Member |
|--------|:-------:|:-----------:|:---------:|:------:|
| Create Pod | ✅ | ❌ | ❌ | ❌ |
| Delete Pod | ✅ | ❌ | ❌ | ❌ |
| Edit Pod settings | ✅ | ❌ | ❌ | ❌ |
| Promote/demote Pod Manager | ✅ | ❌ | ❌ | ❌ |
| Create projects | ✅ | ✅ | ✅ | ❌ |
| Edit/delete projects | ✅ | ✅ | ❌ | ❌ |
| Create tasks (under projects) | ✅ | ✅ | ✅ | ✅ |
| Assign tasks | ✅ | ✅ | ✅ | ❌ |
| Edit/update any task | ✅ | ✅ | ❌ | ❌ |
| Update own assigned tasks | ✅ | ✅ | ✅ | ✅ |
| Delete task comments | ✅ | ✅ | Own only | Own only |
| Manage team members | ✅ | ✅ | Own team | ❌ |
| Assign team roles | ✅ | ✅ | ✅ | ❌ |
| Remove Pod members | ✅ | ❌ | ❌ | ❌ |
| View dashboards | ✅ | ✅ | ✅ | ✅ |
| Access all chat | ✅ | ✅ | ✅ | ✅ |
| Manage Pod files | ✅ | ✅ | ❌ | ❌ |
| Delete Pod files | ✅ | ❌ | ❌ | ❌ |
| Upload files | ✅ | ✅ | ✅ | ✅ |
| Invite founders | ✅ | ❌ | ❌ | ❌ |

### 2.3 Special Rules

- A member of one team **can be** a team lead of another team.
- A team lead **can lead** multiple teams.
- A member **can belong** to multiple teams.
- Pod Manager **cannot** assign tasks to the Founder.
- Founder **can** assign tasks to Pod Managers.
- Only the Founder can promote or demote Pod Managers.

---

## 3. Functional Requirements

### 3.1 Pod Management (FR-POD)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-POD-01 | Founder can create a new Pod with title, summary, and optional profile picture | P0 |
| FR-POD-02 | System auto-generates a unique Nexus Pod Number (NPN) in format `NP-XXXXX` | P0 |
| FR-POD-03 | Pod data is fully isolated — members of Pod A cannot see Pod B data | P0 |
| FR-POD-04 | Pod creator automatically becomes Founder, Pod Manager, Team Member, and Team Lead | P0 |
| FR-POD-05 | Founder can edit Pod title, summary, profile picture, and social media links | P1 |
| FR-POD-06 | Founder can delete the Pod | P1 |
| FR-POD-07 | Pod supports optional social media links | P2 |

### 3.2 Member & Invitation System (FR-MEM)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-MEM-01 | Founder can generate an invitation link for the Pod | P0 |
| FR-MEM-02 | Users join a Pod via the invitation link | P0 |
| FR-MEM-03 | Founder can assign roles to members (Manager, Team Lead, Member) | P0 |
| FR-MEM-04 | Founder can remove members from the Pod | P1 |
| FR-MEM-05 | Members can leave a Pod voluntarily | P1 |
| FR-MEM-06 | Invitation links can be time-limited or usage-limited | P2 |

### 3.3 Team Management (FR-TEAM)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-TEAM-01 | Pods can contain multiple teams (e.g., Marketing, Design, Support) | P1 |
| FR-TEAM-02 | Each team has a Team Lead and Team Members | P1 |
| FR-TEAM-03 | Team Leads can assign roles within their team | P1 |
| FR-TEAM-04 | Teams have dedicated task boards, chats, and file spaces | P1 |
| FR-TEAM-05 | A Pod member can belong to multiple teams simultaneously | P1 |

### 3.4 Project System (FR-PROJ)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-PROJ-01 | Founders, Managers, and Team Leads can create projects within a Pod | P0 |
| FR-PROJ-02 | Projects can be Public (all members see) or Private (invite-only) | P0 |
| FR-PROJ-03 | Projects contain tasks, a project chat room, and shared files | P0 |
| FR-PROJ-04 | Unlimited projects allowed per Pod | P0 |
| FR-PROJ-05 | Private projects are visible only to selected members | P0 |
| FR-PROJ-06 | Projects support milestones and visual progress tracking | P2 |

### 3.5 Task System (FR-TASK)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-TASK-01 | Any member can create tasks under existing projects | P0 |
| FR-TASK-02 | Task fields: Title, Description, Due Date, Assignee(s), Priority | P0 |
| FR-TASK-03 | Optional task fields: Files, Links | P0 |
| FR-TASK-04 | Task statuses: Not Started → Ongoing → Completed (via approval) | P0 |
| FR-TASK-05 | Assignees can mark tasks as DONE | P0 |
| FR-TASK-06 | After DONE, a REVERT action allows submission of work evidence | P0 |
| FR-TASK-07 | Assigner reviews and can APPROVE or CORRECT the task | P0 |
| FR-TASK-08 | CORRECT returns task to Ongoing with feedback (description, comments, links, files) | P0 |
| FR-TASK-09 | APPROVE cycle repeats until final approval | P0 |
| FR-TASK-10 | Task comments support text, files (optional), links (optional) | P1 |
| FR-TASK-11 | Files & links in comments require explanation text | P1 |
| FR-TASK-12 | Only the commenter and Founder/Manager can delete comments | P1 |
| FR-TASK-13 | Both assignee and assigner receive alert notifications on status changes | P0 |

### 3.6 Chat System (FR-CHAT)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-CHAT-01 | Pod main chat accessible to all Pod members | P0 |
| FR-CHAT-02 | Each project has a dedicated Project Chat room | P0 |
| FR-CHAT-03 | 1-on-1 Direct Messages between any two Pod members | P1 |
| FR-CHAT-04 | Unlimited text messages | P0 |
| FR-CHAT-05 | Voice recording with 24-hour auto-delete | P1 |
| FR-CHAT-06 | Audio calling within Pod/Project/Team | P2 |
| FR-CHAT-07 | Online status indicators | P1 |
| FR-CHAT-08 | Typing indicators | P1 |
| FR-CHAT-09 | Read receipts | P2 |
| FR-CHAT-10 | @mention tagging | P1 |
| FR-CHAT-11 | Message pinning | P2 |
| FR-CHAT-12 | Convert chat message into a task | P1 |
| FR-CHAT-13 | Reference tasks in chat via `@task` search | P2 |
| FR-CHAT-14 | File sharing in chat | P1 |

### 3.7 File Management (FR-FILE)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-FILE-01 | File upload in tasks, comments, and chat | P0 |
| FR-FILE-02 | Files compressed automatically for mobile access | P2 |
| FR-FILE-03 | Original files stored in cloud (Supabase Storage) | P0 |
| FR-FILE-04 | Storage limits depend on Pod tier | P2 |

### 3.8 Notification System (FR-NOTIF)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-NOTIF-01 | Notification on task assignment | P0 |
| FR-NOTIF-02 | Notification on task comment added | P1 |
| FR-NOTIF-03 | Notification on task submitted for review (DONE) | P0 |
| FR-NOTIF-04 | Deadline reminder: 72 hours before, then every 6 hours | P1 |
| FR-NOTIF-05 | Channels: in-app push notification + email | P1 |
| FR-NOTIF-06 | Reminders cancelled when task is completed | P1 |

### 3.9 Dashboards (FR-DASH)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-DASH-01 | **My Tasks Dashboard** — tasks assigned to user, due dates, status, priority | P0 |
| FR-DASH-02 | **Member Dashboard** — auto-filtered tasks, accessible projects, pod files, members | P0 |
| FR-DASH-03 | **Founder Dashboard** — all pods, projects, tasks, members, invites, file usage, stats | P1 |
| FR-DASH-04 | **Team Dashboard** — team progress view | P2 |

### 3.10 Accountability (FR-AUDIT)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-AUDIT-01 | Audit logs record: What happened, Who did it, When | P1 |
| FR-AUDIT-02 | Logs are immutable (append-only) | P1 |
| FR-AUDIT-03 | Tracked actions: project CRUD, task CRUD, member changes, role changes | P1 |

### 3.11 Opportunity Engine (FR-OPP)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-OPP-01 | Users can post opportunities with: Title, Description, Type, Deadline | P1 |
| FR-OPP-02 | Opportunity types: Collaboration, Feedback, Hiring, Funding, Exposure | P1 |
| FR-OPP-03 | Visibility toggle: Private (pod only) or Nexus Network (cross-pod) | P1 |
| FR-OPP-04 | Cross-pod opportunities visible to all platform users | P1 |

### 3.12 Momentum & Gamification (FR-MOM)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-MOM-01 | Each Pod has a Momentum Score (0–100) | P2 |
| FR-MOM-02 | Score based on: tasks completed (×5), created (×2), comments (×1), files (×2), active members (×3) | P2 |
| FR-MOM-03 | Pod Streaks — consecutive days with ≥1 task completed | P2 |
| FR-MOM-04 | Global Leaderboard across all Pods | P2 |
| FR-MOM-05 | Weekly Build Report — automated email every Monday | P2 |

### 3.13 Groups & Notes (FR-GRP)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-GRP-01 | Private/Public discussion groups within a Pod | P2 |
| FR-GRP-02 | Groups support chat, file sharing, audio calls | P2 |
| FR-GRP-03 | Individual and Pod-level notes | P2 |

### 3.14 Mini Website & Integrations (FR-WEB)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-WEB-01 | Auto-generated portfolio page per user (About, Services, Portfolio, Projects) | P3 |
| FR-WEB-02 | GitHub integration — connect repos, display activity | P3 |

### 3.15 CRM & Governance (FR-CRM)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-CRM-01 | Lightweight CRM: Contacts, Deals, Activity Notes | P3 |
| FR-CRM-02 | Multi-founder governance — shared authority, original founder protected | P2 |
| FR-CRM-03 | No founder can remove another founder | P2 |
| FR-CRM-04 | Founders can delete their own account | P2 |

### 3.16 Calendar & Operations (FR-CAL)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-CAL-01 | Centralized Pod calendar + personal calendar per member | P3 |
| FR-CAL-02 | Calendar tracks tasks, meetings, events, deadlines | P3 |
| FR-CAL-03 | Operations Hub — wiki-like area for SOPs, docs, onboarding | P3 |

### 3.17 Meetings & Events (FR-MEET)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-MEET-01 | Team/Group/Pod meetings (audio call) | P3 |
| FR-MEET-02 | Google Meet integration (initial phase) | P3 |
| FR-MEET-03 | Events visible across all pods in ecosystem | P3 |
| FR-MEET-04 | Event notifications: 7 days prior, then every 12 hours | P3 |

### 3.18 Member Profiles (FR-PROF)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-PROF-01 | Full name, profile picture, bio | P0 |
| FR-PROF-02 | Skills & expertise (input or write) | P1 |
| FR-PROF-03 | Social links (Twitter, LinkedIn, Instagram, TikTok, etc.) | P1 |
| FR-PROF-04 | Interests | P2 |
| FR-PROF-05 | Personal URL/Website | P2 |

---

## 4. Non-Functional Requirements

### 4.1 Performance

| ID | Requirement |
|----|-------------|
| NFR-PERF-01 | Page load time < 2 seconds on 3G connections |
| NFR-PERF-02 | Chat messages delivered in < 500ms (Realtime) |
| NFR-PERF-03 | Dashboard data loads within 1 second |
| NFR-PERF-04 | Support 100+ concurrent users per Pod |

### 4.2 Security

| ID | Requirement |
|----|-------------|
| NFR-SEC-01 | Row Level Security (RLS) on ALL tables — Pod isolation enforced at DB level |
| NFR-SEC-02 | Authentication via Supabase Auth (email/password + social providers) |
| NFR-SEC-03 | All API calls authenticated via JWT tokens |
| NFR-SEC-04 | File uploads validated for type and size |
| NFR-SEC-05 | Audit logs are append-only (no update/delete) |

### 4.3 Scalability

| ID | Requirement |
|----|-------------|
| NFR-SCALE-01 | Multi-tenant architecture with strict data isolation |
| NFR-SCALE-02 | Database indexes on all foreign keys and frequently queried columns |
| NFR-SCALE-03 | Supabase Storage for file management (CDN-backed) |

### 4.4 Usability

| ID | Requirement |
|----|-------------|
| NFR-UX-01 | Mobile-first responsive design |
| NFR-UX-02 | Dark/Light mode support |
| NFR-UX-03 | Loading states and skeleton screens for all data fetches |
| NFR-UX-04 | Accessible (WCAG 2.1 AA compliance) |
| NFR-UX-05 | Glassmorphism aesthetic with premium feel |

### 4.5 Reliability

| ID | Requirement |
|----|-------------|
| NFR-REL-01 | 99.9% uptime target |
| NFR-REL-02 | Graceful error handling with user-friendly messages |
| NFR-REL-03 | Database backups via Supabase managed backups |

---

## 5. Priority Legend

| Priority | Meaning | Delivery |
|----------|---------|----------|
| **P0** | Must-have for MVP launch | Phase 1–2 |
| **P1** | Important, needed for complete experience | Phase 2–3 |
| **P2** | Nice-to-have, adds significant value | Phase 3–4 |
| **P3** | Future enhancement | Phase 5+ |
