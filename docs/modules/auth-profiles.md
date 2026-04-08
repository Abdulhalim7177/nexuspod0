# 🔐 Auth & Profiles Module

> **Phase:** 1 · **Sprint:** 1 · **Status:** ⬜ Not Started

## Purpose

Handles user authentication (login, signup, password recovery) and user profile management. Every user has a `profiles` record auto-created on signup via a database trigger.

## Features

| Feature | Priority | Status |
|---------|----------|--------|
| Email/password authentication | P0 | ✅ Exists (Supabase Auth) |
| Social auth (Google, GitHub) | P2 | ⬜ |
| Profile creation trigger | P0 | ⬜ |
| Profile settings page | P0 | ⬜ |
| Avatar upload | P1 | ⬜ |
| Skills & interests | P1 | ⬜ |
| Social links | P1 | ⬜ |
| Username (for mini-website) | P1 | ⬜ |

## Database Tables

- `profiles` — extends `auth.users` with name, avatar, bio, skills, social links

## Key Files

```
app/auth/                        # Auth pages (login, signup, etc.)
app/(dashboard)/profile/         # Profile settings
supabase/migrations/001_*.sql    # Profiles migration
components/login-form.tsx        # Login form
components/sign-up-form.tsx      # Signup form
```

## RLS Policies

- **SELECT:** Public (any authenticated user can view profiles)
- **UPDATE:** Own profile only (`auth.uid() = id`)
- **INSERT:** Trigger only (auto on signup)

## Dependencies

- `@supabase/ssr`, `@supabase/supabase-js` (already installed)
- `react-hook-form`, `zod`, `@hookform/resolvers` (to install)
