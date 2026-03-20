# Loksetu (TalkUp)

## Current State
- Nagrik tab has a community feed showing civic reports
- Vigilance Mode reports are fully suppressed - not saved to feed or profile
- Regular reports saved to localStorage but feed does not re-render reactively
- Profile 'My Reports' tab reads from appActivity localStorage (loksetu_my_reports)
- Only upvote exists on reports; no downvote
- appStore and appActivity are two parallel systems; ProfileTab only reads appActivity

## Requested Changes (Diff)

### Add
- Downvote button alongside upvote on every report card in Nagrik feed
- Downvote on community posts in TalkUp tab
- Anonymous/Real identity option in Vigilance Mode report form (user chooses before submitting)
- Upvote/downvote counts stored in local state and localStorage

### Modify
- Vigilance Mode reports: save to activityAddReport (loksetu_my_reports) so they appear in Profile 'My Reports'
- Vigilance Mode reports: add to Nagrik community feed with anonymous identity (masked name/avatar) when user chooses anonymous, or real name when user chooses real profile
- Nagrik feed: use reactive state so newly submitted reports appear immediately without page refresh
- NagrikTab.handleSubmit: always call activityAddReport regardless of isVigilance flag
- NagrikTab.handleSubmit: always add new report to localIssues state for immediate feed display
- Report card: show upvote + downvote buttons with counts

### Remove
- The `if (!data.isVigilance)` gate that suppresses all persistence for vigilance reports

## Implementation Plan
1. Update NagrikTab.handleSubmit to always save reports (vigilance and regular) to activityAddReport and localIssues state
2. Add identity choice (anonymous vs real profile) to Vigilance Mode report form
3. When vigilance report is posted anonymously, display masked name in feed card
4. Add downvote button + count to IssueCard component alongside existing upvote
5. Add downvote to community posts in TalkUp
6. Wire upvote/downvote counts to localStorage for persistence
7. Ensure ProfileTab 'My Reports' shows all reports including vigilance ones
