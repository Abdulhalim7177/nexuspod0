# Nexus Pod — System Architecture & Design Document

> **Version:** 1.0
> **Date:** 17 March 2026

---

## 1. High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
│                                                                  │
│  ┌────────────┐  ┌──────────────┐  ┌───────────────────────────┐ │
│  │   Next.js   │  │  React Query │  │  Supabase Realtime Client │ │
│  │ App Router  │  │  State Mgmt  │  │   (Chat, Presence)        │ │
│  └─────┬──────┘  └──────┬───────┘  └──────────┬────────────────┘ │
└────────┼────────────────┼──────────────────────┼─────────────────┘
         │                │                      │
         ▼                ▼                      ▼
┌──────────────────────────────────────────────────────────────────┐
│                      SUPABASE PLATFORM                           │
│                                                                  │
│  ┌────────────┐  ┌──────────────┐  ┌────────────────────────────┐│
│  │    Auth     │  │   PostgREST  │  │       Realtime             ││
│  │ (JWT/SSR)  │  │   (REST API) │  │  (WebSocket Channels)      ││
│  └────────────┘  └──────────────┘  └────────────────────────────┘│
│                                                                  │
│  ┌────────────┐  ┌──────────────┐  ┌────────────────────────────┐│
│  │  Storage   │  │   pg_cron    │  │    Edge Functions           ││
│  │  (Files)   │  │  (Reminders) │  │  (NPN Gen, Reports)        ││
│  └────────────┘  └──────────────┘  └────────────────────────────┘│
│                                                                  │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │              PostgreSQL Database                              ││
│  │    ┌──────┐ ┌────────┐ ┌──────┐ ┌──────┐ ┌───────────────┐  ││
│  │    │ pods │ │projects│ │tasks │ │ chat │ │  audit_logs   │  ││
│  │    └──────┘ └────────┘ └──────┘ └──────┘ └───────────────┘  ││
│  │    Row Level Security (RLS) on ALL tables                    ││
│  └──────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────────┐
│                         VERCEL                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Edge Runtime (Middleware) │ Node.js (Server Components)   │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Decisions

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Framework** | Next.js 15 (App Router) | SSR for SEO (landing, profiles), CSR for dynamic features (chat) |
| **Auth** | Supabase Auth | Email/password + social. JWT-based. Cookie sessions via `@supabase/ssr` |
| **Database** | PostgreSQL (Supabase) | Relational model suits multi-tenant hierarchy. RLS for isolation |
| **Realtime** | Supabase Realtime | WebSocket channels for chat, presence, typing indicators |
| **Storage** | Supabase Storage | CDN-backed. Organized by buckets (avatars, files, voice-notes) |
| **Cron Jobs** | pg_cron | Deadline reminders, voice note cleanup, weekly reports |
| **Edge Functions** | Supabase Edge Functions | NPN generation, momentum calculation, email dispatch |
| **CSS** | Tailwind CSS 3.4 | Mobile-first responsive. Custom design tokens |
| **UI** | shadcn/ui (Radix) | Accessible, composable primitives |
| **State** | React Context + SWR/React Query | Server state caching with optimistic updates |
| **Deployment** | Vercel | Preview branches, edge middleware, auto-scaling |

---

## 3. Application Architecture

### 3.1 Route Structure

```
app/
├── (marketing)/                # Public pages (no auth required)
│   ├── page.tsx                # Landing page
│   ├── about/
│   └── pricing/
│
├── auth/                       # Authentication flows
│   ├── login/
│   ├── sign-up/
│   ├── forgot-password/
│   ├── update-password/
│   ├── confirm/
│   └── error/
│
├── (dashboard)/                # Protected — requires auth
│   ├── layout.tsx              # Sidebar nav + topbar
│   ├── dashboard/              # Home dashboard (My Tasks, overview)
│   │
│   ├── pods/
│   │   ├── page.tsx            # List all user's Pods
│   │   ├── new/                # Create Pod form
│   │   └── [podId]/
│   │       ├── page.tsx        # Pod overview (projects, members, stats)
│   │       ├── settings/       # Pod settings (Founder only)
│   │       ├── members/        # Member management
│   │       ├── teams/
│   │       │   ├── page.tsx    # All teams list
│   │       │   └── [teamId]/   # Team detail view
│   │       ├── projects/
│   │       │   ├── page.tsx    # Project list
│   │       │   └── [projectId]/
│   │       │       ├── page.tsx    # Project board (tasks)
│   │       │       ├── chat/      # Project chat
│   │       │       └── files/     # Project files
│   │       ├── chat/           # Pod main chat
│   │       ├── files/          # Pod file manager
│   │       ├── notes/          # Pod notes
│   │       └── momentum/       # Momentum dashboard
│   │
│   ├── tasks/                  # Cross-pod "My Tasks" view
│   ├── messages/               # DMs
│   ├── opportunities/          # Opportunity Engine
│   ├── notifications/          # Notification centre
│   ├── profile/                # User profile settings
│   └── leaderboard/            # Global leaderboard
│
├── [username]/                 # Public mini-website (dynamic route)
│
└── api/                        # API routes (if needed)
```

### 3.2 Component Architecture

```
components/
├── ui/                         # shadcn/ui primitives (button, card, dialog, etc.)
├── layout/
│   ├── sidebar.tsx             # Main sidebar navigation
│   ├── topbar.tsx              # Top navigation bar
│   ├── mobile-nav.tsx          # Mobile bottom navigation
│   └── breadcrumb.tsx          # Route breadcrumbs
├── pods/
│   ├── pod-card.tsx            # Pod summary card
│   ├── create-pod-form.tsx     # Pod creation wizard
│   └── pod-settings.tsx        # Pod settings panel
├── projects/
│   ├── project-card.tsx        # Project summary card
│   ├── create-project-form.tsx # Project creation form
│   └── project-board.tsx       # Task board (kanban/list)
├── tasks/
│   ├── task-card.tsx           # Individual task card
│   ├── task-detail.tsx         # Full task detail view
│   ├── task-form.tsx           # Create/edit task form
│   ├── task-comments.tsx       # Comments section
│   └── review-panel.tsx        # APPROVE/CORRECT panel
├── chat/
│   ├── chat-room.tsx           # Main chat interface
│   ├── message-bubble.tsx      # Individual message
│   ├── message-input.tsx       # Composing input with file/voice
│   ├── voice-recorder.tsx      # Voice note recorder
│   └── typing-indicator.tsx    # "User is typing..." indicator
├── teams/
│   ├── team-card.tsx           # Team summary
│   └── team-members.tsx        # Member management
├── dashboard/
│   ├── momentum-gauge.tsx      # Visual momentum score
│   ├── stats-grid.tsx          # Stat cards
│   └── task-summary.tsx        # Quick task overview
├── opportunities/
│   ├── opportunity-card.tsx    # Opportunity listing
│   └── opportunity-form.tsx    # Create opportunity form
├── notifications/
│   ├── notification-bell.tsx   # Bell with badge
│   └── notification-list.tsx   # Dropdown list
└── shared/
    ├── avatar.tsx              # User avatar
    ├── file-upload.tsx         # Drag-and-drop file upload
    ├── rich-text-editor.tsx    # For task descriptions, notes
    ├── search-bar.tsx          # Universal search
    └── empty-state.tsx         # Empty state illustrations
```

### 3.3 Data Flow Diagram

```
┌─────────────┐    Create Pod     ┌──────────────┐
│   Founder   │ ───────────────►  │   Supabase   │
│   (Client)  │                   │   Database   │
│             │ ◄─────────────── │              │
│             │   Pod + NPN       │              │
└──────┬──────┘                   └──────┬───────┘
       │                                 │
       │  Invite Link                    │  Realtime
       ▼                                 ▼
┌─────────────┐    Join Pod       ┌──────────────┐
│   Member    │ ───────────────►  │  pod_members │
│  (Client)   │                   │    table     │
│             │ ◄─────────────── │              │
│             │   Pod Data (RLS)  │              │
└──────┬──────┘                   └──────────────┘
       │
       │  Work on Tasks
       ▼
┌──────────────────────────────────────────────┐
│               TASK LIFECYCLE                  │
│                                              │
│  Created ──► Not Started ──► Ongoing         │
│                                  │           │
│                                  ▼           │
│                              Submitted       │
│                              (DONE)          │
│                                  │           │
│                         ┌────────┴────────┐  │
│                         ▼                 ▼  │
│                    APPROVED          CORRECTED│
│                    (Final)           (Reopen) │
│                                         │    │
│                                         ▼    │
│                                     Ongoing  │
│                                     (loop)   │
└──────────────────────────────────────────────┘
```

---

## 4. Multi-Tenancy Model

### 4.1 Pod Isolation Strategy

Every data table includes a `pod_id` foreign key. Row Level Security policies ensure:

```sql
-- Example: Members can only see tasks in their Pods
CREATE POLICY "pod_isolation_tasks" ON tasks
  FOR SELECT USING (
    pod_id IN (
      SELECT pod_id FROM pod_members
      WHERE user_id = auth.uid()
    )
  );
```

### 4.2 Role-Based Access Control (RBAC)

Roles are stored in the `pod_members` table with a `role` enum:

```
FOUNDER | POD_MANAGER | TEAM_LEAD | MEMBER
```

RLS policies check the user's role in the relevant Pod:

```sql
-- Example: Only Founders can delete projects
CREATE POLICY "founder_delete_projects" ON projects
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM pod_members
      WHERE pod_members.pod_id = projects.pod_id
        AND pod_members.user_id = auth.uid()
        AND pod_members.role = 'FOUNDER'
    )
  );
```

---

## 5. Realtime Architecture

### 5.1 Channel Strategy

| Channel | Purpose | Subscribers |
|---------|---------|-------------|
| `pod:{podId}:chat` | Pod main chat messages | All Pod members |
| `project:{projectId}:chat` | Project-specific chat | Project members |
| `dm:{conversationId}` | Direct messages | 2 users |
| `pod:{podId}:presence` | Online/typing status | All Pod members |
| `user:{userId}:notifications` | User notifications | Single user |
| `pod:{podId}:tasks` | Task status changes | All Pod members |

### 5.2 Presence System

```typescript
// Track online status and typing indicators
const channel = supabase.channel(`pod:${podId}:presence`)
  .on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState();
    // Update online users UI
  })
  .on('presence', { event: 'join' }, ({ newPresences }) => {
    // User came online
  })
  .on('presence', { event: 'leave' }, ({ leftPresences }) => {
    // User went offline
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({
        user_id: userId,
        online_at: new Date().toISOString(),
        typing: false,
      });
    }
  });
```

---

## 6. Storage Architecture

### 6.1 Bucket Structure

| Bucket | Purpose | Access |
|--------|---------|--------|
| `avatars` | User profile pictures | Public |
| `pod-files` | Pod-level shared files | Pod members (RLS) |
| `task-attachments` | Files attached to tasks | Pod members (RLS) |
| `chat-media` | Images/files shared in chat | Chat participants (RLS) |
| `voice-notes` | Voice recordings (24h TTL) | Chat participants (RLS) |
| `pod-avatars` | Pod profile pictures | Public |

### 6.2 File Path Convention

```
{bucket}/{pod_id}/{context}/{timestamp}_{filename}

Examples:
  pod-files/abc123/general/2026-03-17_report.pdf
  task-attachments/abc123/task-456/evidence.png
  voice-notes/abc123/chat/1710680400_voice.webm
```

---

## 7. Background Jobs (pg_cron)

| Job | Schedule | Action |
|-----|----------|--------|
| Deadline Reminders | Every hour | Check tasks due within 72h, send notifications |
| Voice Note Cleanup | Every 6 hours | Delete voice notes older than 24h |
| Momentum Calculation | Daily at midnight | Recalculate Pod momentum scores |
| Weekly Build Report | Monday 8:00 AM | Generate and email weekly pod reports |
| Streak Check | Daily at midnight | Update Pod streak counters |

---

## 8. Security Architecture

### 8.1 Authentication Flow

```
User ──► Next.js Middleware ──► Check Supabase Session
                                    │
                            ┌───────┴───────┐
                            │               │
                       Authenticated    Not Authenticated
                            │               │
                       Continue to      Redirect to
                       Dashboard        /auth/login
```

### 8.2 Authorization Layers

1. **Middleware Layer:** Route protection (auth check)
2. **RLS Layer:** Database-level data isolation (Pod membership)
3. **Application Layer:** UI conditional rendering based on role
4. **API Layer:** Server action validation before mutations

### 8.3 Data Privacy

- All inter-Pod data is invisible across Pod boundaries
- Private projects further restrict visibility within a Pod
- Audit logs are immutable (INSERT only, no UPDATE/DELETE)
- Voice notes auto-delete after 24h for privacy

---

## 9. Performance Considerations

| Strategy | Implementation |
|----------|---------------|
| **Server Components** | Use for initial page loads (dashboards, project views) |
| **Client Components** | Use for interactive features (chat, task boards, forms) |
| **Streaming SSR** | Use Suspense boundaries with loading skeletons |
| **Database Indexes** | On `pod_id`, `project_id`, `user_id`, `status`, `due_date` |
| **Optimistic Updates** | For task status changes, chat messages |
| **Image Optimization** | Next.js Image component for all user-uploaded images |
| **Pagination** | Cursor-based for chat history, offset-based for task lists |
| **Caching** | React Query / SWR with stale-while-revalidate for dashboards |
