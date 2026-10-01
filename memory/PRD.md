# ODAYA - Railway Companion App (v1)

Expo React Native mobile app for Indian Railways-style travel companion. Dark-first UI with neon green accents on black.

## Features (all screens)
- **Home**: Dashboard with 7 modules, hero header, FAB for Assistant.
- **Train Search**: From/To/Date form, demo train results, class chips, navigate to detail.
- **Train Detail**: Summary card, classes, quick actions (Live/Avail/Route).
- **PNR Status**: 10-digit input, demo PNR result card with coach/seat/status.
- **Live Train Status**: Train chip picker, delay banner, current/next station, progress bar. Sample data.
- **Seat Availability**: Train + class chips, 5-day availability tags (AVL/RAC/WL). Sample data.
- **Fare Calculator**: Total fare + people split, receipt card with per-person total.
- **Train Route**: Visual station timeline with passed/current/upcoming nodes.
- **ODAYA Assistant**: Chatbot powered by Groq (`openai/gpt-oss-20b`) via `/api/chat` backend endpoint.

## Stack
- Frontend: Expo SDK 57, Expo Router, react-native-safe-area-context, @react-native-vector-icons/material-design-icons, expo-linear-gradient.
- Backend: FastAPI + Motor + Groq SDK.
- Theme: tokens in `src/theme.ts` (dark-only, neon green brand).

## Env
- `GROQ_API_KEY` + `GROQ_MODEL` in `/app/backend/.env`.
- Frontend reads `EXPO_PUBLIC_BACKEND_URL` for `/api/chat`.
