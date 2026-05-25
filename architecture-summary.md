# Architecture Summary

This document summarizes the actual frontend/backend architecture in the Dharma codebase and explicitly identifies requested architecture areas that are not present.

---

## Group 3: Frontend & Backend Architecture

### 1. Navigation & State

#### Navigation Structure
- The app uses **React Navigation**.
- The current navigation tree includes:
  - **Bottom Tab Navigator**
    - `HomeTab` → `src/screens/HomeScreen.js`
    - `ChaptersTab` → nested stack:
      - `ChaptersList` → `src/screens/ChaptersScreen.js`
      - `SlokaList` → `src/screens/SlokaListScreen.js`
      - `SlokaDetail` → `src/screens/SlokaDetailScreen.js`
    - `GeetAITab` → `src/screens/GeetAIScreen.js`
    - `ManomitraTab` → `src/screens/ManomitraScreen.js`
    - `SettingsTab` → `src/screens/SettingsScreen.js`
  - Hidden stack route:
    - `SavedSlokas` → `src/screens/SavedSlokasScreen.js`

#### Missing Navigation Flows
- **No authentication stack** is present in the repository.
  - `Splash Screen` → Not Found in Codebase
  - `Login` → Not Found in Codebase
  - `Register` → Not Found in Codebase
  - `Forgot Password` → Not Found in Codebase
- **No separate `Bookmarks` tab** exists; bookmarks are accessible via the hidden `SavedSlokas` route.
- **No explicit `Profile/Settings` tab** exists beyond `SettingsTab`.
- **No nested stack for `Audio Player`, `Search Results`, or `Chat History`** is implemented in the current source.

#### State Management
- Global state is managed with **React Context API**.
- Active contexts in `App.tsx`:
  - `BookmarkProvider` (`src/context/BookmarkContext.js`)
  - `FontSizeProvider` (`src/context/FontSizeContext.js`)
  - `LanguageProvider` (`src/context/LanguageContext.js`)
  - `ThemeProvider` (`src/context/ThemeContext.js`)
- There is no `AuthContext` file in `src/context/`.
- There is no `AudioPlayerContext` file in `src/context/`.
- Local component state is handled with React hooks in screen components.
- AI chat state is currently maintained via component state in `GeetAIScreen.js` and `ManomitraScreen.js`, not via a dedicated AI conversation context.
- No Redux, Zustand, MobX, or similar state libraries are present.

### 2. Backend Orchestration

#### Supabase Usage
- Backend access is via **Supabase** in `src/config/supabase.js` and `src/services/supabaseService.js`.
- `src/config/supabase.js` creates a Supabase client with:
  - `SUPABASE_URL` hard-coded
  - `SUPABASE_ANON_KEY` hard-coded
  - AsyncStorage-backed auth persistence
- The service layer supports content queries and bookmark updates.

#### Edge Functions and AI Orchestration
- **No Supabase Edge Function code is present** in the repository.
- AI chat and TTS behavior are handled by external HTTP endpoints:
  - Geet AI: hard-coded URL in `src/screens/GeetAIScreen.js`
  - Manomitra: hard-coded URL in `src/screens/ManomitraScreen.js`
  - TTS: `src/services/ttsService.js` uses `https://exact-punisher-judicial.ngrok-free.dev/generate-speech`
- There is no local prompt-engineering edge function source in this repo.

#### Admin Actions
- No admin mobile interface exists.
- The repo contains no dedicated admin panel or content management UI.
- Content is likely managed externally through Supabase Dashboard, but that dashboard is not part of this codebase.
- No React web admin panel is implemented here.

---

## Group 4: Database & Storage Design

### 1. Database Schema

#### Tables referenced in code
- `chapters`
- `slokas`
- `translations`
- `bookmarks`

#### Inferred relationships
- `chapters` (1:N) → `slokas`
- `slokas` (1:N) → `translations`
- `bookmarks` references `sloka_id` and `device_id`

#### Missing tables
The following tables are not referenced anywhere in the source code and therefore are not implemented in this repo:
- `users` → Not Found in Codebase
- `user_profiles` → Not Found in Codebase
- `audio_files` → Not Found in Codebase
- `favorites` → Not Found in Codebase (instead there is `bookmarks`)
- `reading_progress` → Not Found in Codebase
- `daily_sloka` → Not Found in Codebase
- `ai_chat_history` → Not Found in Codebase
- `notifications` → Not Found in Codebase
- `settings` → Not Found in Codebase
- `languages` → Not Found in Codebase
- `feedback` → Not Found in Codebase

#### Translation strategy in code
- Translations are stored in a separate `translations` table.
- Supported translation languages are determined by language code mapping in `src/services/supabaseService.js`.
- Each translation row contains a `sloka_id` and a `language` field.

### 2. Storage Design

#### Supabase Storage
- There is **no direct Supabase Storage usage** in the repository.
- No `supabase.storage` or storage bucket operations are found in the source.
- The only local storage used is AsyncStorage for app settings and caching.

#### Local storage
- AsyncStorage stores:
  - theme
  - language
  - font size
  - notification preferences
  - last read location
  - generated local device ID
  - daily sloka cache

#### Media storage
- Generated TTS audio is written locally using `react-native-fs` in `src/services/ttsService.js`.
- Static audio storage buckets are not implemented in source.

---

## Group 5: Security & API Design

### 1. Authorization (RLS)

#### RLS and access control
- No Row Level Security policy definitions are present in the app source.
- The codebase does not include backend policy files or SQL migrations.
- The Supabase client is configured with anonymous access only.

#### Public vs authenticated data
- Public content loaded by the app:
  - `chapters`
  - `slokas`
  - `translations`
- Authenticated user-specific content expected by the requested architecture is not present:
  - `favorites` → Not Found in Codebase
  - `reading_progress` → Not Found in Codebase
  - `ai_chat_history` → Not Found in Codebase
  - `notifications` → Not Found in Codebase
  - `user_profiles` → Not Found in Codebase

### 2. API Architecture

#### API access pattern
- Current app architecture is:
  - React Native App → Supabase Client → PostgreSQL
- Supabase is used through the JS client SDK in the app.
- No GraphQL API layer is implemented.

#### AI operations
- AI requests are sent to external HTTP endpoints, not repo-hosted edge functions.
- TTS generation is performed by an external ngrok-based endpoint.
- AI request flow in source:
  - React Native app → external endpoint → response
- There is no server-side code for prompt engineering or external AI orchestration in this repository.

---

## Group 6: CI/CD & Infrastructure

### 1. Build Pipeline

#### Source control
- The repository appears to assume GitHub, but no `.github/workflows` directory exists in the current workspace.

#### CI/CD tooling
- No GitHub Actions workflows are present.
- The codebase does not contain Fastlane, EAS Build, or other CI/CD configuration.
- `package.json` scripts are limited to:
  - `android`
  - `ios`
  - `lint`
  - `start`
  - `test`
  - `postinstall`

### 2. Monitoring & Analytics

#### Crash reporting
- No Sentry integration is present in the source.

#### Analytics
- No Firebase Analytics integration is present in the source.

#### Monitoring
- No explicit monitoring configuration files are present.
- Backend logs and monitoring are not implemented in this repo.

### 3. Infrastructure reality

- Hosting: **Supabase Cloud** is implied by the use of Supabase, but no deployment config is included.
- Database: **PostgreSQL via Supabase**.
- Authentication: Supabase Auth is configured in the client, but no UI flows are implemented.
- Storage: **AsyncStorage** and local RNFS storage are used; Supabase Storage is not used.
- Backend Logic: The repository provides no Supabase Edge Functions or server-side backend logic.

---

## Summary of Findings

### Implemented in codebase
- React Native app using React Navigation and bottom tabs.
- Chapter/Sloka browsing and details.
- Supabase data access for `chapters`, `slokas`, `translations`, and `bookmarks`.
- React Context providers for theme, language, font size, and bookmarks.
- Local persistence via AsyncStorage.
- External AI and TTS calls via hard-coded HTTP endpoints.
- Generated TTS audio saved locally with `react-native-fs`.

### Not implemented in codebase
- Auth stack screens and auth context
- Admin dashboard or admin mobile interface
- Supabase Edge Functions and prompt engineering code
- Storage bucket integration for audio/images/documents
- RLS policy definitions and authenticated table APIs
- GraphQL layer
- GitHub Actions / CI/CD configuration
- Sentry / Firebase Analytics / monitoring integrations
- Dedicated chat history, notifications, or reading progress tables

---

## Recommended Architectural Next Steps

1. Add an auth flow if user login is required.
2. Externalize API keys and service URLs into environment configuration.
3. Implement Supabase Edge Functions for AI orchestration if backend logic is needed.
4. Add CI/CD workflows for automated builds and lint/test checks.
5. Introduce RLS policies and server-side role-based security for authenticated data.
6. Migrate hard-coded audio/chat endpoints to stable production services.
