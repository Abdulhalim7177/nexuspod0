# Nexus Pod — Database Design Document

> **Version:** 1.0
> **Date:** 17 March 2026
> **DBMS:** PostgreSQL (Supabase)

---

## 1. Entity Relationship Overview

```
profiles ──────────┐
    │               │
    │ 1:N           │ 1:N
    ▼               ▼
pod_members ◄──── pods
    │               │
    │               │ 1:N
    │               ▼
    │           projects ──────── project_members
    │               │
    │               │ 1:N
    │               ▼
    │             tasks ──────── task_assignees
    │               │
    │               │ 1:N
    │               ▼
    │          task_comments
    │
    │ N:M
    ▼
  teams ──────── team_members

Other entities:
  chat_messages, chat_conversations,
  opportunities, audit_logs, notifications,
  pod_notes, files, voice_notes
```

---

## 2. Complete Table Definitions

### 2.1 `profiles` — User Profiles

Extends `auth.users`. Created automatically via trigger on signup.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, FK → `auth.users.id` | User ID |
| `full_name` | `text` | | Full display name |
| `avatar_url` | `text` | | Profile picture URL |
| `bio` | `text` | | Short biography |
| `skills` | `text[]` | | Array of skills |
| `interests` | `text[]` | | Array of interests |
| `social_links` | `jsonb` | DEFAULT `'{}'` | `{ twitter, linkedin, instagram, tiktok, website }` |
| `username` | `text` | UNIQUE | For mini-website URL |
| `created_at` | `timestamptz` | DEFAULT `now()` | |
| `updated_at` | `timestamptz` | DEFAULT `now()` | |

---

### 2.2 `pods` — Workspaces

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `npn` | `text` | UNIQUE, NOT NULL | Nexus Pod Number `NP-XXXXX` |
| `title` | `text` | NOT NULL | Pod name |
| `summary` | `text` | | Pod description |
| `avatar_url` | `text` | | Pod profile picture |
| `social_links` | `jsonb` | DEFAULT `'{}'` | Pod social media links |
| `founder_id` | `uuid` | FK → `profiles.id`, NOT NULL | Original creator |
| `created_at` | `timestamptz` | DEFAULT `now()` | |
| `updated_at` | `timestamptz` | DEFAULT `now()` | |

**NPN Generation:** Database trigger or Edge Function auto-increments a counter and formats as `NP-XXXXX`.

---

### 2.3 `pod_members` — Pod Membership & Roles

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `pod_id` | `uuid` | FK → `pods.id` ON DELETE CASCADE | |
| `user_id` | `uuid` | FK → `profiles.id` ON DELETE CASCADE | |
| `role` | `text` | CHECK IN (`FOUNDER`, `POD_MANAGER`, `TEAM_LEAD`, `MEMBER`) | |
| `joined_at` | `timestamptz` | DEFAULT `now()` | |

**Unique:** (`pod_id`, `user_id`) — one role per user per Pod.

---

### 2.4 `pod_invitations` — Invitation Links

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `pod_id` | `uuid` | FK → `pods.id` ON DELETE CASCADE | |
| `code` | `text` | UNIQUE, NOT NULL | Short invite code |
| `created_by` | `uuid` | FK → `profiles.id` | |
| `max_uses` | `int` | | NULL = unlimited |
| `use_count` | `int` | DEFAULT 0 | |
| `expires_at` | `timestamptz` | | NULL = never expires |
| `created_at` | `timestamptz` | DEFAULT `now()` | |

---

### 2.5 `teams` — Teams Within Pods

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `pod_id` | `uuid` | FK → `pods.id` ON DELETE CASCADE | |
| `name` | `text` | NOT NULL | e.g., "Marketing", "Design" |
| `description` | `text` | | |
| `created_at` | `timestamptz` | DEFAULT `now()` | |

---

### 2.6 `team_members` — Team Membership

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `team_id` | `uuid` | FK → `teams.id` ON DELETE CASCADE | |
| `user_id` | `uuid` | FK → `profiles.id` ON DELETE CASCADE | |
| `is_lead` | `boolean` | DEFAULT `false` | Team Lead flag |
| `joined_at` | `timestamptz` | DEFAULT `now()` | |

**Unique:** (`team_id`, `user_id`)

---

### 2.7 `projects` — Project Containers

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `pod_id` | `uuid` | FK → `pods.id` ON DELETE CASCADE | |
| `title` | `text` | NOT NULL | |
| `description` | `text` | | |
| `is_private` | `boolean` | DEFAULT `false` | Public/Private visibility |
| `created_by` | `uuid` | FK → `profiles.id` | |
| `created_at` | `timestamptz` | DEFAULT `now()` | |
| `updated_at` | `timestamptz` | DEFAULT `now()` | |

---

### 2.8 `project_members` — Private Project Access

Only populated for private projects.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `project_id` | `uuid` | FK → `projects.id` ON DELETE CASCADE | |
| `user_id` | `uuid` | FK → `profiles.id` ON DELETE CASCADE | |
| `added_at` | `timestamptz` | DEFAULT `now()` | |

**Unique:** (`project_id`, `user_id`)

---

### 2.9 `tasks` — Core Work Units

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `project_id` | `uuid` | FK → `projects.id` ON DELETE CASCADE | |
| `pod_id` | `uuid` | FK → `pods.id` ON DELETE CASCADE | Denormalized for fast RLS |
| `title` | `text` | NOT NULL | |
| `description` | `text` | | |
| `status` | `text` | CHECK IN (`NOT_STARTED`, `ONGOING`, `DONE`, `APPROVED`) | |
| `priority` | `text` | CHECK IN (`LOW`, `MEDIUM`, `HIGH`, `URGENT`) | |
| `due_date` | `timestamptz` | | |
| `created_by` | `uuid` | FK → `profiles.id` | Task creator / assigner |
| `momentum_value` | `int` | DEFAULT 5 | Points awarded on completion |
| `created_at` | `timestamptz` | DEFAULT `now()` | |
| `updated_at` | `timestamptz` | DEFAULT `now()` | |

---

### 2.10 `task_assignees` — Task Assignments (M:N)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `task_id` | `uuid` | FK → `tasks.id` ON DELETE CASCADE | |
| `user_id` | `uuid` | FK → `profiles.id` ON DELETE CASCADE | |
| `assigned_at` | `timestamptz` | DEFAULT `now()` | |

**Unique:** (`task_id`, `user_id`)

---

### 2.11 `task_comments` — Task Discussion

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `task_id` | `uuid` | FK → `tasks.id` ON DELETE CASCADE | |
| `user_id` | `uuid` | FK → `profiles.id` | |
| `content` | `text` | NOT NULL | Comment text |
| `file_urls` | `text[]` | | Attached file paths |
| `link_urls` | `text[]` | | Attached links |
| `created_at` | `timestamptz` | DEFAULT `now()` | |

---

### 2.12 `task_submissions` — DONE/REVERT Submissions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `task_id` | `uuid` | FK → `tasks.id` ON DELETE CASCADE | |
| `submitted_by` | `uuid` | FK → `profiles.id` | Assignee |
| `description` | `text` | | Work evidence description |
| `file_urls` | `text[]` | | Evidence files |
| `link_urls` | `text[]` | | Evidence links |
| `created_at` | `timestamptz` | DEFAULT `now()` | |

---

### 2.13 `task_reviews` — APPROVE/CORRECT Actions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `task_id` | `uuid` | FK → `tasks.id` ON DELETE CASCADE | |
| `submission_id` | `uuid` | FK → `task_submissions.id` | |
| `reviewed_by` | `uuid` | FK → `profiles.id` | Assigner |
| `action` | `text` | CHECK IN (`APPROVED`, `CORRECTED`) | |
| `feedback` | `text` | | Correction feedback |
| `file_urls` | `text[]` | | Attached evidence |
| `created_at` | `timestamptz` | DEFAULT `now()` | |

---

### 2.14 `chat_conversations` — Chat Rooms

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `type` | `text` | CHECK IN (`POD`, `PROJECT`, `TEAM`, `DM`, `GROUP`) | |
| `pod_id` | `uuid` | FK → `pods.id` ON DELETE CASCADE | NULL for DMs |
| `project_id` | `uuid` | FK → `projects.id` | For PROJECT type |
| `team_id` | `uuid` | FK → `teams.id` | For TEAM type |
| `name` | `text` | | Display name (for groups) |
| `is_private` | `boolean` | DEFAULT `false` | For group chats |
| `created_at` | `timestamptz` | DEFAULT `now()` | |

---

### 2.15 `chat_participants` — Conversation Members

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `conversation_id` | `uuid` | FK → `chat_conversations.id` ON DELETE CASCADE | |
| `user_id` | `uuid` | FK → `profiles.id` ON DELETE CASCADE | |
| `is_admin` | `boolean` | DEFAULT `false` | Group admin flag |
| `joined_at` | `timestamptz` | DEFAULT `now()` | |

**Unique:** (`conversation_id`, `user_id`)

---

### 2.16 `chat_messages` — Messages

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `conversation_id` | `uuid` | FK → `chat_conversations.id` ON DELETE CASCADE | |
| `user_id` | `uuid` | FK → `profiles.id` | Sender |
| `content` | `text` | | Message text |
| `type` | `text` | CHECK IN (`TEXT`, `FILE`, `VOICE`, `SYSTEM`) | |
| `file_url` | `text` | | For file/voice messages |
| `reply_to` | `uuid` | FK → `chat_messages.id` | Threaded replies |
| `is_pinned` | `boolean` | DEFAULT `false` | |
| `task_ref_id` | `uuid` | FK → `tasks.id` | Referenced task |
| `read_by` | `uuid[]` | | Array of user IDs who read |
| `created_at` | `timestamptz` | DEFAULT `now()` | |
| `expires_at` | `timestamptz` | | For voice notes (24h TTL) |

---

### 2.17 `notifications` — In-App Notifications

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `user_id` | `uuid` | FK → `profiles.id` ON DELETE CASCADE | Recipient |
| `pod_id` | `uuid` | FK → `pods.id` | Context |
| `type` | `text` | NOT NULL | e.g., `TASK_ASSIGNED`, `TASK_DONE`, `DEADLINE_REMINDER` |
| `title` | `text` | NOT NULL | |
| `body` | `text` | | |
| `link` | `text` | | Deep link URL |
| `is_read` | `boolean` | DEFAULT `false` | |
| `created_at` | `timestamptz` | DEFAULT `now()` | |

---

### 2.18 `audit_logs` — Accountability Trail

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `pod_id` | `uuid` | FK → `pods.id` ON DELETE CASCADE | |
| `user_id` | `uuid` | FK → `profiles.id` | Actor |
| `action` | `text` | NOT NULL | e.g., `CREATE_PROJECT`, `DELETE_TASK`, `CHANGE_ROLE` |
| `target_type` | `text` | | `project`, `task`, `member`, etc. |
| `target_id` | `uuid` | | ID of the affected entity |
| `metadata` | `jsonb` | DEFAULT `'{}'` | Extra context |
| `created_at` | `timestamptz` | DEFAULT `now()` | |

**Security:** No UPDATE or DELETE policies. Append-only.

---

### 2.19 `opportunities` — Cross-Pod Opportunity Engine

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `pod_id` | `uuid` | FK → `pods.id` ON DELETE CASCADE | Origin Pod |
| `founder_id` | `uuid` | FK → `profiles.id` | Poster |
| `title` | `text` | NOT NULL | |
| `description` | `text` | | |
| `type` | `text` | CHECK IN (`COLLABORATION`, `FEEDBACK`, `HIRING`, `FUNDING`, `EXPOSURE`) | |
| `visibility` | `text` | CHECK IN (`PRIVATE`, `NEXUS_NETWORK`) | |
| `deadline` | `timestamptz` | | |
| `is_active` | `boolean` | DEFAULT `true` | |
| `created_at` | `timestamptz` | DEFAULT `now()` | |

---

### 2.20 `pod_momentum` — Momentum Scores

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `pod_id` | `uuid` | FK → `pods.id` ON DELETE CASCADE, UNIQUE | |
| `score` | `int` | DEFAULT 0, CHECK 0–100 | Current score |
| `streak_days` | `int` | DEFAULT 0 | Consecutive active days |
| `tasks_completed_7d` | `int` | DEFAULT 0 | |
| `tasks_created_7d` | `int` | DEFAULT 0 | |
| `active_members_7d` | `int` | DEFAULT 0 | |
| `last_activity_at` | `timestamptz` | | |
| `updated_at` | `timestamptz` | DEFAULT `now()` | |

---

### 2.21 `pod_notes` — Notes

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `pod_id` | `uuid` | FK → `pods.id` ON DELETE CASCADE | |
| `user_id` | `uuid` | FK → `profiles.id` | Author |
| `title` | `text` | NOT NULL | |
| `content` | `text` | | Rich text content |
| `is_personal` | `boolean` | DEFAULT `false` | Personal vs Pod-level |
| `created_at` | `timestamptz` | DEFAULT `now()` | |
| `updated_at` | `timestamptz` | DEFAULT `now()` | |

---

### 2.22 `files` — File Registry

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `pod_id` | `uuid` | FK → `pods.id` ON DELETE CASCADE | |
| `uploaded_by` | `uuid` | FK → `profiles.id` | |
| `file_name` | `text` | NOT NULL | Original filename |
| `file_url` | `text` | NOT NULL | Storage path |
| `file_size` | `bigint` | | Size in bytes |
| `mime_type` | `text` | | |
| `context` | `text` | | `task`, `chat`, `project`, `pod` |
| `context_id` | `uuid` | | ID of the parent entity |
| `created_at` | `timestamptz` | DEFAULT `now()` | |

---

## 3. Key Indexes

```sql
-- Pod isolation (most common query pattern)
CREATE INDEX idx_pod_members_user ON pod_members(user_id);
CREATE INDEX idx_pod_members_pod ON pod_members(pod_id);

-- Task queries
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_pod ON tasks(pod_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_task_assignees_user ON task_assignees(user_id);

-- Chat queries
CREATE INDEX idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at);
CREATE INDEX idx_chat_participants_user ON chat_participants(user_id);

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);

-- Audit logs
CREATE INDEX idx_audit_logs_pod ON audit_logs(pod_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- Opportunities
CREATE INDEX idx_opportunities_visibility ON opportunities(visibility, is_active);
```

---

## 4. Key RLS Policy Summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `profiles` | Own profile or same-pod member | Trigger only | Own profile only | Own profile only |
| `pods` | Member of pod | Authenticated user | Founder only | Founder only |
| `pod_members` | Same pod | Founder/Manager | Founder only | Founder only |
| `projects` | Pod member + (public OR project_member) | Founder/Manager/Lead | Founder/Manager | Founder/Manager |
| `tasks` | Pod member + project access | Pod member + project access | Assignee (own) / Founder/Manager (any) | Founder/Manager |
| `chat_messages` | Conversation participant | Conversation participant | Own only (edit) | Own + Founder/Admin |
| `audit_logs` | Pod member | System/trigger only | ❌ Never | ❌ Never |
| `opportunities` | Private = pod member; Network = all auth users | Pod member | Creator/Founder | Creator/Founder |
| `notifications` | Own notifications | System only | Own (mark read) | Own |

---

## 5. Database Triggers

| Trigger | Table | Event | Action |
|---------|-------|-------|--------|
| `on_auth_user_created` | `auth.users` | INSERT | Creates `profiles` entry |
| `generate_npn` | `pods` | INSERT | Generates unique NPN `NP-XXXXX` |
| `auto_join_founder` | `pods` | INSERT | Creates `pod_members` entry with FOUNDER role |
| `create_pod_chat` | `pods` | INSERT | Creates a POD-type `chat_conversations` entry |
| `create_project_chat` | `projects` | INSERT | Creates a PROJECT-type `chat_conversations` entry |
| `log_mutations` | Various | UPDATE/DELETE | Inserts into `audit_logs` |
| `update_timestamps` | Various | UPDATE | Sets `updated_at = now()` |
| `update_momentum` | `tasks` | UPDATE (status = APPROVED) | Increments pod momentum counters |
