# Android Build Status & Instructions

## 🚀 Build in Progress

We have migrated to **`expo-speech-recognition`** to resolve compatibility issues with the previous library. The new build is currently running on EAS.

**Track Build:** [EAS Dashboard](https://expo.dev/accounts/magic-deck-ai/projects/magic-deck-ai/builds/3c47576f-8471-40fc-9c63-4a6300b76ef8)

## ✅ Next Steps (When Build Finishes)

1. **Download APK**: Look for the `Install` button or download link on the build page.
2. **Install on Device**:

   ```bash
   adb install app-development.apk
   ```

   _Or transfer the APK to your phone directly._

3. **Test Microphone**:
   - Open the app.
   - Go to "Create card with AI".
   - Tap the microphone icon.
   - **Grant Permission**: You should see a system prompt.
   - Speak clearly. The text should appear in the input box.

## ℹ️ Changes Made

- **Library**: Switched from `@react-native-voice/voice` to `expo-speech-recognition`.
- **Logic**: Updated `app/deck/[id].tsx` to use the new Expo-native hooks (`useSpeechRecognitionEvent`).
- **Config**: Cleaned up `app.json` and regenerated native directories.

## 🌐 Web Fallback

The microphone is also configured to work on Web. If you need to test logic immediately:

- Run `npx expo start --web`
- Open in Chrome/Safari (requires HTTPS or localhost).
