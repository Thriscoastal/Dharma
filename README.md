# Dharma - Bhagavad Gita App 🕉️

A beautiful React Native mobile application for reading and listening to the sacred Bhagavad Gita.

## Features

- 📖 **18 Chapters** - Complete Bhagavad Gita with 700 verses
- 🔊 **Audio Recitations** - Listen to Sanskrit verses
- 🌐 **Multiple Languages** - Sanskrit, English, Hindi translations
- 🔖 **Bookmarks** - Save your favorite verses
- 🔔 **Daily Reminders** - Get notified for verse of the day
- 💬 **Geet AI** - AI-powered chat for spiritual guidance
- 🌙 **Dark Mode** - Easy on the eyes
- 📏 **Adjustable Font Size** - Customize reading experience

## Quick Start

### For New Users:
1. See `QUICK_START.md` for 5-minute setup
2. See `SETUP_GUIDE.md` for detailed instructions

### For Developers:
```bash
npm install
npm start
npm run android
```

## Tech Stack

- **React Native** 0.85.3
- **React Navigation** 7.x
- **Supabase** (Backend)
- **AsyncStorage** (Local storage)
- **Notifee** (Notifications)
- **react-native-sound** (Audio)

## Requirements

- Node.js 22.11.0+
- JDK 17
- Android Studio
- Android SDK (API 34+)

## Project Structure

```
src/
├── components/     # Reusable UI components
├── screens/        # App screens
├── navigation/     # Navigation setup
├── services/       # API & storage services
├── config/         # Configuration files
├── constants/      # Colors, spacing
└── context/        # React Context
```

## Configuration

Supabase credentials are in `src/config/supabase.js`. No additional environment variables needed.

## Building

### Debug APK:
```bash
npm run android
```

### Release APK:
```bash
cd android
./gradlew assembleRelease
```

APK location: `android/app/build/outputs/apk/release/app-release.apk`

## Troubleshooting

See `SETUP_GUIDE.md` for common issues and solutions.

## License

Private project - All rights reserved.

## Credits

- Bhagavad Gita content from public domain sources
- Audio recitations from various sources
- Built with ❤️ using React Native
