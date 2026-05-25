# Dharma Setup Guide

## Prerequisites

- Node.js 22.11.0 or newer
- npm 10+ (installed with Node.js)
- Java JDK 17
- Android Studio with SDK 36
- Xcode 15+ (for iOS development)
- CocoaPods (for iOS native dependencies)
- Watchman is optional but recommended on macOS

## Install Dependencies

```bash
cd c:/dharma_app/Dharma
npm install
```

## Android Setup

1. Open Android Studio.
2. Install SDK Platform 36 and Android SDK Build-Tools 36.
3. Ensure `ANDROID_HOME` or `ANDROID_SDK_ROOT` points to your Android SDK.
4. Open a terminal and run:

```bash
npm run android
```

### Android emulator

- Create a Pixel or Android device image using Android Studio AVD Manager.
- Start the emulator and confirm it is available with:

```bash
adb devices
```

## iOS Setup

1. Install CocoaPods:

```bash
sudo gem install cocoapods
```

2. Install pods from the project root:

```bash
npx pod-install
```

3. Open the workspace in Xcode:

```bash
open ios/Dharma.xcworkspace
```

4. Configure signing in Xcode for the `Dharma` target.

5. Run in the simulator:

```bash
npm run ios
```

## Running the App

### Start Metro

```bash
npm start
```

### Run on Android

```bash
npm run android
```

### Run on iOS

```bash
npm run ios
```

## Production Build

### Android release APK

```bash
cd android
./gradlew assembleRelease
```

APK output location:

- `android/app/build/outputs/apk/release/app-release.apk`

### iOS release

- Open `ios/Dharma.xcworkspace`
- Select a generic iOS device or archive target
- Use Xcode Archive to create an IPA

## Native Configuration Notes

- `android/app/build.gradle` uses `debug.keystore` for both debug and release builds.
- In production, replace debug signing config with a secure release keystore.
- `react-native.config.js` disables autolinking for `react-native-sound` on Android.

## Troubleshooting

### `npm install` fails
- Ensure Node 22+ is installed.
- Remove `node_modules` and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

### `npx pod-install` fails
- Make sure CocoaPods is installed.
- Run in the project root.

### Android build fails
- Confirm SDK 36 is installed in Android Studio.
- Confirm `ANDROID_HOME` / `ANDROID_SDK_ROOT` is configured.

### iOS build fails
- Open `ios/Dharma.xcworkspace` not `ios/Dharma.xcodeproj`.
- Run `pod install` after any dependency changes.

## Recommended Improvements

- Externalize hard-coded service endpoints to environment variables.
- Add a real production signing keystore for Android.
- Add App Store / Play Store metadata and submission process.
- Replace ngrok endpoint references with stable production API endpoints.
