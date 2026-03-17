# 🌐 Mini Websites Module

> **Phase:** 7 · **Sprint:** 14 · **Status:** ⬜ Not Started

## Purpose

Auto-generated public portfolio page for each user. Showcases their skills, pods joined, projects, and contributions. Accessible via a personalized URL like `nexuspod.com/username`.

## Features

| Feature | Priority | Status |
|---------|----------|--------|
| Public portfolio page per user | P3 | ⬜ |
| Sections: Header, About, Services, Portfolio, Projects | P3 | ⬜ |
| Personalized URL (`/[username]`) | P3 | ⬜ |
| Builder profiles (skills, pods, contributions) | P2 | ⬜ |
| Manual project upload | P3 | ⬜ |

## Key Files

```
app/[username]/page.tsx       # Dynamic public route
components/portfolio/
```

## Notes

- Uses Next.js dynamic routes for SSR (SEO-friendly)
- Pulls data from `profiles`, `pod_members`, `tasks` (completed count)
- No auth required to view (public pages)
