# 👥 Teams Module

> **Phase:** 4 · **Sprint:** 8 · **Status:** ⬜ Not Started

## Purpose

Teams are the smallest work units inside a Pod (e.g., Marketing, Design, Customer Support). Each team has a Team Lead and members, enabling focused task allocation, dedicated chats, and team meetings.

## Features

| Feature | Priority | Status |
|---------|----------|--------|
| Create/edit/delete teams | P1 | ⬜ |
| Team Lead assignment | P1 | ⬜ |
| Multi-team membership per user | P1 | ⬜ |
| User can lead multiple teams | P1 | ⬜ |
| Team-specific task boards | P1 | ⬜ |
| Team chat rooms | P1 | ⬜ |
| Team file sharing | P2 | ⬜ |
| Team progress dashboard | P2 | ⬜ |

## Database Tables

- `teams` — pod_id, name, description
- `team_members` — team_id, user_id, is_lead

## Special Rules

- A member of one team **can be** a team lead of another
- A team lead **can lead** many teams
- A member **can belong** to many teams
- Team Leads can assign roles within their team
- CEO, Founder, Pod Managers, Team Leads can assign roles

## Key Files

```
app/(dashboard)/pods/[podId]/teams/
components/teams/
supabase/migrations/018_*.sql
```
