# Loksetu / TalkUp

## Current State
- Profile page has My Reports and My Posts tabs but My Reports shows empty (pure useState, no persistence)
- My Posts shows text only, no media (photo/video) even if the post had media
- Status viewer falls back to initials placeholder because the object URL is revoked immediately after posting in handlePost, and localStatuses is typed as `never[]` breaking TypeScript casts

## Requested Changes (Diff)

### Add
- localStorage persistence for myReports and myPosts so they survive page refresh
- Media rendering (img/video) in My Reports cards (photoBlob)
- Media rendering (img/video) in My Posts cards (localMediaUrl / localMediaIsVideo)
- Pass localMediaUrl and localMediaIsVideo through addPost so ProfileTab can show them
- Fix localStatuses type in TalkUpTab (Status section) from never[] to a proper interface
- Defer URL.revokeObjectURL so the blob URL stays valid while the status is visible

### Modify
- appStore.tsx: initialize myReports/myPosts from localStorage, persist on every update
- appStore.tsx: extend the local post shape to carry localMediaUrl and localMediaIsVideo
- ProfileTab.tsx: render img/video in both My Reports and My Posts cards
- TalkUpTab.tsx: fix localStatuses typing and remove premature URL revocation

### Remove
- Nothing removed

## Implementation Plan
1. appStore.tsx: load initial state from localStorage; save on addReport/deleteReport/editReport/addPost/deletePost/editPost; add localMediaUrl+localMediaIsVideo fields to stored post shape
2. TalkUpTab.tsx StatusSubTab: replace `never[]` with a typed LocalStatus interface; move URL.revokeObjectURL to a cleanup effect or remove it entirely so the blob URL stays alive
3. ProfileTab.tsx: add <img>/<video> rendering block inside My Reports and My Posts cards
4. TalkUpTab.tsx community post composer: pass localMediaUrl and localMediaIsVideo when calling addPost
