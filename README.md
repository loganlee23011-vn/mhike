# M-Hike (MHikeRN)

M-Hike is a mobile app for logging and managing hiking trips, built with **React Native + Expo**, using **Firebase** as the backend (Authentication + Firestore).

## Key Features

- **Login / Register** with Firebase Authentication, including "remember me" support.
- **Hike management**: create a new hike through a multi-step flow (basic info → location → route → confirm), view the hike list, view details, and edit.
- **Location tracking**: uses the device's location to record where a hike takes place and displays it on a map (`MapScreen`).
- **Weather**: fetches weather information for the hike's location (`weatherService`).
- **Observations**: add detailed notes/observations to each hike, with community moderation.
- **Search**: search hikes by criteria (`SearchScreen`).

## Tech Stack

- [Expo](https://expo.dev/) (SDK 54) + React Native 0.81
- React Navigation (bottom tabs + native stack)
- Firebase (`firebase` JS SDK) — Authentication & Firestore
- `expo-location`, `expo-secure-store`, `@react-native-async-storage/async-storage`

## Project Structure

```
src/
├── components/      # Shared components (header, step indicator...)
├── constants/        # Theme, terrain images...
├── context/           # FirebaseContext, HikeFormContext
├── navigation/        # Auth/Main/Root navigator
├── screens/            # Screens (Login, Hikes, Detail, Map, Search...)
└── services/           # authService, hikeService, observationService, weatherService...
```

## Getting Started

### Prerequisites

- Node.js
- Expo CLI (`npx expo`)
- A Firebase project with Authentication and Firestore enabled

### Install

```bash
npm install
```

### Configure Firebase

Update your Firebase project settings in `src/services/firebaseConfig.js` and the security rules in `firestore.rules`.

### Run

```bash
npm start        # open Expo Dev Tools
npm run android  # run on Android
npm run ios      # run on iOS
npm run web      # run on web
```

## License

See the [LICENSE](./LICENSE) file.
