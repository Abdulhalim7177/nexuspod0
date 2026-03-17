# 🔗 Integrations Module

> **Phase:** 7 · **Sprint:** 15 · **Status:** ⬜ Not Started

## Purpose

External service integrations to extend Nexus Pod's capabilities. Starts with GitHub (code sync) and Google Meet (meetings), with more integrations planned.

## Features

| Feature | Priority | Status |
|---------|----------|--------|
| GitHub: Connect account | P3 | ⬜ |
| GitHub: Display repos on portfolio | P3 | ⬜ |
| GitHub: Sync project activity | P3 | ⬜ |
| Google Meet: Schedule meetings | P3 | ⬜ |
| Google Meet: Link to events/teams | P3 | ⬜ |

## Technical Notes

- **GitHub:** Uses Octokit library, OAuth flow for account linking
- **Google Meet:** Uses Google Calendar API for meeting creation
- Both require OAuth consent and token storage

## Key Files

```
app/(dashboard)/settings/integrations/
lib/integrations/github.ts
lib/integrations/google-meet.ts
```
