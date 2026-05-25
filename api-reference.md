# API Reference

## Overview

This file documents the API and service interactions used by Dharma.

## Supabase

### Client configuration

- `src/config/supabase.js`
- Uses `@supabase/supabase-js`
- Hard-coded values are currently stored in the file.

### Supabase tables used

- `chapters`
- `slokas`
- `translations`
- `bookmarks`

### Supabase functions

#### fetchChapters()
- File: `src/services/supabaseService.js`
- Query: `supabase.from('chapters').select('*').order('chapter_number', { ascending: true })`
- Used by: `src/screens/ChaptersScreen.js`

#### fetchChapterByNumber(chapterNumber)
- File: `src/services/supabaseService.js`
- Query: `supabase.from('chapters').select('*').eq('chapter_number', chapterNumber).maybeSingle()`
- Used by: `src/screens/SlokaDetailScreen.js`

#### fetchSlokasWithTranslations(chapterNumber, language)
- File: `src/services/supabaseService.js`
- Purpose: Load slokas for a chapter and optional translation rows when language is not English
- Used by: `src/screens/SlokaListScreen.js`

#### fetchSloka(chapterNumber, slokaNumber, language)
- File: `src/services/supabaseService.js`
- Purpose: Load a single verse with translation data
- Used by: `src/screens/SlokaDetailScreen.js`

#### addBookmark(deviceId, slokaId)
- File: `src/services/supabaseService.js`
- Purpose: Create bookmark record in `bookmarks`
- Used by: `src/context/BookmarkContext.js`, `src/screens/SlokaDetailScreen.js`

#### removeBookmark(deviceId, slokaId)
- File: `src/services/supabaseService.js`
- Purpose: Remove bookmark record
- Used by: `src/context/BookmarkContext.js`, `src/screens/SavedSlokasScreen.js`

#### fetchBookmarks(deviceId, language)
- File: `src/services/supabaseService.js`
- Purpose: Retrieve all bookmarks for a local device ID and preferred language
- Used by: `src/context/BookmarkContext.js`, `src/screens/SavedSlokasScreen.js`

#### isBookmarked(deviceId, slokaId)
- File: `src/services/supabaseService.js`
- Purpose: Check bookmark state for a verse
- Used by: `src/context/BookmarkContext.js`, `src/screens/SlokaDetailScreen.js`

## Search API

- File: `src/services/searchService.js`

### searchByKeyword(keyword)
- Supabase query against `slokas` or translations
- Filters by `sanskrit_text`, `transliteration`, `hindi_meaning`, `english_meaning`

### searchByChapter(chapterNumber)
- Queries `slokas` by `chapter_number`

### searchBySloka(chapterNumber, slokaNumber)
- Queries `slokas` by both `chapter_number` and `sloka_number`

## Daily Sloka API

- File: `src/services/dailySlokaService.js`

### fetchDailySloka(language)
- Logic: returns a cached daily verse and rotates verses once per day
- Caches data in AsyncStorage keys: `@daily_sloka`, `@last_sloka_update`

### resetDailySloka()
- Force reset daily verse cache

## TTS API

- File: `src/services/ttsService.js`
- Endpoint: `https://exact-punisher-judicial.ngrok-free.dev/generate-speech`
- Request type: POST
- Payload: JSON containing `text` and `language`
- Response: MP3 or audio blob written locally via `react-native-fs`
- Used by: `src/screens/SlokaDetailScreen.js`, `src/screens/ManomitraScreen.js`

## AI Chat APIs

### Geet AI
- File: `src/screens/GeetAIScreen.js`
- Endpoint: `https://pacifist-varsity-probe.ngrok-free.dev/chat`
- Request payload: `{ question }`
- Response fields expected: `answer` or `response`
- This is a custom chat backend, not a standard public API.

### Manomitra
- File: `src/screens/ManomitraScreen.js`
- Endpoint: `https://affection-unspoiled-gatherer.ngrok-free.dev/chatbot`
- Request payload: `{ message }`
- Response fields expected: `reply`, `response`, or `message`

## Notification API

- File: `src/services/notificationService.js`
- Uses `@notifee/react-native`

### requestNotificationPermission()
- Requests permissions from the OS

### createNotificationChannel()
- Creates Android notification channel

### scheduleNotification(hour, minute)
- Schedules a daily notification reminder

### cancelNotifications()
- Cancels scheduled reminders

## Local Storage API

### storageService keys
- `@dharma_theme`
- `@dharma_language`
- `@dharma_notification_time`
- `@dharma_notification_enabled`
- `@dharma_last_read`
- `@dharma_user_id`
- `@daily_sloka`
- `@last_sloka_update`
- `@font_size_numeric`

### getDeviceId()
- Generates and persists a local device identifier used for bookmarks

## Notes

- No auth headers or tokens are sent with these requests.
- Supabase is used anonymously via `SUPABASE_ANON_KEY`.
- Most endpoints are currently hard-coded in source and should be refactored to use environment variables.
- No server-side API documentation is present for the custom chat or TTS services.
