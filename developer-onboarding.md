# Developer Onboarding

## Purpose

This guide helps a new developer start working on Dharma quickly with the most important files, workflows, and environment details.

## Quick Start

1. Clone the repo into `c:/dharma_app/Dharma`
2. Install dependencies:
   ```bash
   cd c:/dharma_app/Dharma
   npm install
   ```
3. Start Metro:
   ```bash
   npm start
   ```
4. Run Android:
   ```bash
   npm run android
   ```
5. Run iOS:
   ```bash
   npm run ios
   ```

## Core Files

- `App.tsx` - root component that mounts providers and `AppNavigator`
- `src/navigation/AppNavigator.js` - bottom tab + nested stack navigation
- `src/config/supabase.js` - Supabase client initialization and local auth persistence
- `src/context/LanguageContext.js` - current language and translation provider
- `src/context/ThemeContext.js` - theme provider
- `src/context/FontSizeContext.js` - font scaling provider
- `src/context/BookmarkContext.js` - bookmark state and Supabase bookmark sync
- `src/screens/` - app screens for Home, Chapters, Sloka detail, saved slokas, AI flows, and settings
- `src/services/` - data access, persistence, notifications, TTS, and content helpers
- `src/components/` - reusable UI components such as `AppText`, `AudioPlayer`, `SearchBar`

## App Flow

- `App.tsx` loads providers then `AppNavigator`
- `AppNavigator.js` sets up tabs:
  - `HomeScreen`
  - `ChaptersScreen` via nested stack (`SlokaListScreen`, `SlokaDetailScreen`, `SavedSlokasScreen`)
  - `GeetAIScreen`
  - `ManomitraScreen`
  - `SettingsScreen`
- Bookmarks are managed by `BookmarkContext` and stored in Supabase using a locally-generated device ID.
- Language and theme are persisted in AsyncStorage.

## Environment & Config

- No environment variable loading system is implemented in the codebase.
- Hard-coded third-party service endpoints are present in:
  - `src/config/supabase.js`
  - `src/services/ttsService.js`
  - `src/screens/GeetAIScreen.js`
  - `src/screens/ManomitraScreen.js`
- `.env.example` exists as a recommended externalization template.

## Common Commands

- Install dependencies: `npm install`
- Start Metro: `npm start`
- Run Android: `npm run android`
- Run iOS: `npm run ios`
- Run tests: `npm test`
- Run lint: `npm run lint`

## Build Commands

- Android debug: `npm run android`
- Android release:
  ```bash
  cd android
  ./gradlew assembleRelease
  ```
- iOS: open `ios/Dharma.xcworkspace` and build in Xcode

## Key Services

- Supabase data access: `src/services/supabaseService.js`
- Local persistence: `src/services/storageService.js`
- Search queries: `src/services/searchService.js`
- Daily verse caching: `src/services/dailySlokaService.js`
- TTS generation: `src/services/ttsService.js`
- Notifications: `src/services/notificationService.js`
- Content translation helpers: `src/services/contentService.js`

## Testing

- `__tests__/App.test.tsx` is the single Jest test file
- Run tests with `npm test`

## Notes for New Developers

- `react-native-sound` is manually linked for Android via `react-native.config.js`
- Android build uses compile SDK 36 and target SDK 36
- iOS uses CocoaPods from `ios/Podfile`
- No login/auth flow exists; the app uses Supabase anonymous access
- External AI and TTS endpoints are currently hard-coded and may expire

## Missing / Not Implemented

- CI/CD configuration: Not Found in Codebase
- Production release signing config: Not Found in Codebase
- Auth/login/signup: Not Found in Codebase
- Environment variable loader: Not Found in Codebase
- Crash reporting / analytics: Not Found in Codebase

## Recommended First Fixes

1. Externalize service URLs and keys into `.env`
2. Replace ngrok endpoints with stable production endpoints
3. Add secure release signing for Android
4. Add unit and integration tests for services and screens
5. Document the Supabase schema and table names
