# 🌍 Opportunity Engine Module

> **Phase:** 4 · **Sprint:** 7 · **Status:** ⬜ Not Started

## Purpose

The **killer feature** of Nexus Pod. Enables cross-pod collaboration by allowing founders to post opportunities (hiring, feedback, collaboration, funding, exposure) visible across the Nexus Network. Breaks isolation between startups.

## Features

| Feature | Priority | Status |
|---------|----------|--------|
| Post opportunities (title, description, type, deadline) | P1 | ⬜ |
| Opportunity types: Collaboration, Feedback, Hiring, Funding, Exposure | P1 | ⬜ |
| Visibility toggle: Private (pod only) vs Nexus Network (cross-pod) | P1 | ⬜ |
| Browse cross-pod opportunities | P1 | ⬜ |
| Filter by type | P1 | ⬜ |

## Database Tables

- `opportunities` — pod_id, founder_id, title, description, type, visibility, deadline, is_active

## RLS Policies

- **Private:** Only pod members can see
- **Nexus Network:** All authenticated users can see
- **INSERT:** Pod members only
- **UPDATE/DELETE:** Creator or Founder

## Key Files

```
app/(dashboard)/opportunities/
components/opportunities/
supabase/migrations/016_*.sql
```
