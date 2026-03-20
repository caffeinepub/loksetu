# Loksetu - Civic Super App

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Full civic utility super app with 3-tab bottom navigation
- Tab 1 (Nagrik): Community civic issue feed with upvoting, new issue reporting with camera + GPS + category dropdown, Vigilance Mode for anonymous high-stakes reporting
- Tab 2 (News Updates): News ticker carousel, Market Dashboard (fuel/commodity rates), City Hub tiles (transit, emergency, jobs, volunteering)
- Tab 3 (Profile): Guest login wall (Phone OTP), Milestone Tracker progress bar (X/50 verified reports), Satark Nagrik Pramanpatra certificate (unlocks at 50)
- Authorization system for authenticated vs guest users
- Camera integration for live issue capture
- Blob storage for issue photos

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Backend: Issue management (create, list, upvote), user profile with report count, vigilance reports (anonymous), auto-escalation metadata, market rates data, news data
2. Frontend: Bottom nav shell, NagrikTab (feed, FAB, report form, vigilance mode), NewsTab (ticker, market grid, city hub), ProfileTab (guest/auth state, progress bar, certificate)
3. Authorization: Guest vs authenticated user state
4. Camera: Live capture only for issue reporting
5. Blob storage: Store issue photos
6. AI image verification: Placeholder function in backend
7. 30-day auto-escalation: Timestamp on each issue, backend logic to flag single-vote issues older than 30 days
