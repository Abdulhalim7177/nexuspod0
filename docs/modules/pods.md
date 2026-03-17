# 🏠 Pods Module

> **Phase:** 1 · **Sprint:** 2 · **Status:** ⬜ Not Started

## Purpose

Pods are the core workspace entity — isolated multi-tenant environments. Each Pod contains its own projects, tasks, members, chat, and files. Pods are created by Founders and joined via invitation links.

## Features

| Feature | Priority | Status |
|---------|----------|--------|
| Create Pod (title, summary, picture) | P0 | ⬜ |
| Auto-generate NPN (`NP-XXXXX`) | P0 | ⬜ |
| Pod isolation (RLS) | P0 | ⬜ |
| Founder auto-joins as all roles | P0 | ⬜ |
| Edit Pod settings | P1 | ⬜ |
| Delete Pod (Founder only) | P1 | ⬜ |
| Pod social media links | P2 | ⬜ |
| Invitation link generation | P0 | ⬜ |
| Join via invitation link | P0 | ⬜ |
| Role assignment (Founder → Manager) | P0 | ⬜ |
| Remove members (Founder only) | P1 | ⬜ |
| Multi-founder governance | P2 | ⬜ |

## Database Tables

- `pods` — id, npn, title, summary, avatar_url, founder_id
- `pod_members` — pod_id, user_id, role (FOUNDER/POD_MANAGER/TEAM_LEAD/MEMBER)
- `pod_invitations` — pod_id, code, max_uses, expires_at

## Key Files

```
app/(dashboard)/pods/              # Pod list
app/(dashboard)/pods/new/          # Create Pod
app/(dashboard)/pods/[podId]/      # Pod overview
app/(dashboard)/pods/[podId]/settings/
app/(dashboard)/pods/[podId]/members/
supabase/migrations/002_*.sql      # Pods migration
supabase/migrations/003_*.sql      # Pod members migration
supabase/migrations/004_*.sql      # Invitations migration
```

## RLS Policies

- **SELECT pods:** Only if user is a `pod_members` entry
- **INSERT pods:** Any authenticated user
- **UPDATE pods:** Founder only
- **DELETE pods:** Founder only
- **pod_members:** Founder/Manager can insert; Founder can update/delete

## Triggers

- `generate_npn` — auto-generates `NP-XXXXX` on Pod creation
- `auto_join_founder` — creates `pod_members` entry with FOUNDER role
- `create_pod_chat` — creates a POD-type chat conversation
