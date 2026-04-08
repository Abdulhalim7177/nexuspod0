# 🔥 Momentum & Gamification Module

> **Phase:** 5 · **Sprints:** 9–10 · **Status:** ⬜ Not Started

## Purpose

Turns productivity into a visible, competitive metric. Every Pod has a Momentum Score (0–100) and a Build Streak. Fosters psychological pressure to keep building and creates a platform-wide leaderboard.

## Features

| Feature | Priority | Status |
|---------|----------|--------|
| Pod Momentum Score (0–100) | P2 | ⬜ |
| Scoring algorithm (weighted) | P2 | ⬜ |
| Momentum gauge visualization | P2 | ⬜ |
| Pod Build Streaks (consecutive days) | P2 | ⬜ |
| Global Leaderboard | P2 | ⬜ |
| Weekly Build Report (auto-email) | P2 | ⬜ |
| Founder multi-pod overview | P2 | ⬜ |

## Scoring Algorithm

```
Momentum Score =
  (Tasks Completed × 5)
  + (Tasks Created × 2)
  + (Comments Posted × 1)
  + (Files Uploaded × 2)
  + (Members Active × 3)

→ Normalized to 0–100
```

## Database Tables

- `pod_momentum` — pod_id, score, streak_days, tasks_completed_7d, tasks_created_7d, active_members_7d, last_activity_at

## Background Jobs

| Job | Schedule |
|-----|----------|
| Momentum recalculation | Daily at midnight |
| Streak check | Daily at midnight |
| Weekly Build Report | Monday 8:00 AM |

## Key Files

```
app/(dashboard)/leaderboard/
app/(dashboard)/pods/[podId]/momentum/
components/dashboard/momentum-gauge.tsx
supabase/migrations/019_*.sql
```
