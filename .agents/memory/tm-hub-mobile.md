---
name: TM Hub Mobile companion app
description: Expo mobile companion for TM Hub — setup, auth, API, and dev server quirks
---

## Key setup decisions

- **Port 8082**: mockup-sandbox occupies 8081 (default Metro port). Mobile dev script uses `--port 8082` explicitly.
- **Non-interactive mode**: Expo 54 does not support `--non-interactive` (shows warning but still starts); use `CI=1` if needed.
- **Workflow name**: `artifacts/tm-hub-mobile: TM Hub Mobile` — configured via configureWorkflow, NOT via createArtifact (was pre-scaffolded).
- **Clerk env**: `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=$CLERK_PUBLISHABLE_KEY` prepended to dev script; needs `CLERK_PUBLISHABLE_KEY` secret to be set.
- **Artifact NOT registered**: No `.replit-artifact/artifact.toml` — workflow was manually configured. Does not appear in preview dropdown.

## Auth (Clerk Expo v3)

- **Sign-in**: `signIn.create({ identifier, password })` then `setActive({ session: createdSessionId })`
- **Sign-up**: `signUp.create({ emailAddress, password })` → `signUp.prepareEmailAddressVerification({ strategy: 'email_code' })` → `signUp.attemptEmailAddressVerification({ code })`
- **Token getter**: `setAuthTokenGetter(() => getToken())` called in (tabs)/_layout.tsx AuthGate on mount
- **tokenCache**: from `@clerk/expo/token-cache`

## API pattern

Mobile uses `lib/api.ts` with `setAuthTokenGetter` (mirrors web's `apiFetch` but with bearer token header). Does NOT use `@workspace/api-client-react` hooks.

**Why:** Web app also uses hand-written apiFetch (not generated hooks). Mobile mirrors this pattern for consistency.

## Screen structure

```
app/(auth)/sign-in.tsx, sign-up.tsx  — Clerk custom auth screens
app/(tabs)/index.tsx                 — Dashboard with stats + recent projects
app/(tabs)/projects.tsx              — Projects list + create modal
app/(tabs)/assets.tsx                — Assets list + create/edit modal
app/(tabs)/settings.tsx              — Profile + sign out
app/project/[id].tsx                 — Project detail with tabs (overview/shots/schedule/files)
lib/hooks.ts                         — All React Query hooks + types
lib/api.ts                           — apiFetch + setAuthTokenGetter
constants/colors.ts                  — TM Hub dark theme (both light+dark keys identical)
```
