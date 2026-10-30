# Pattern Audit

A 10-minute guided session for entrepreneurs and ADHD/neurodivergent people:
**Move → Talk → See your loop → Confirm → Boundary → Runway**, with a scorecard and a check-in.

Promise: *See how you think. Trust what you already know.*

## How it's built

| Part | Where | Notes |
|---|---|---|
| iPhone app | `App.tsx`, `src/` | Expo (React Native). Sessions are stored only on the phone. |
| On-device cues | `src/core/cues.ts` | Repeated words, hedges, absolutes, trailing off. Never leaves the phone. |
| AI reflection server | `netlify/functions/reflect.mts`, `server/prompts.ts` | Holds the Anthropic API key and the coaching prompts. The app never sees the key. |

## App Store readiness

- No accounts, no tracking, no ads. Privacy manifest in `app.json`.
- Session text is sent to the AI server only to generate a reflection; nothing is stored server-side.
- "Not therapy or medical care" notice, crisis screen (988) on self-harm language, and "Delete all my sessions".
- If the AI server is unreachable, the user maps the loop by hand, so the app never dead-ends.

## Run it

```bash
npm install
cp .env.example .env        # set EXPO_PUBLIC_API_URL
npx expo start              # open in Expo Go on your phone
```

## Deploy the AI server (Netlify)

1. Create a Netlify site from this repo.
2. Set the environment variable `ANTHROPIC_API_KEY`.
3. The endpoint is `https://<site>/api/reflect`. Put the site URL in `EXPO_PUBLIC_API_URL`.

## Ship to TestFlight

Needs an Apple Developer account.

```bash
npm install -g eas-cli
eas login
eas build --platform ios --profile production
eas submit --platform ios
```

## Voice examples

`server/prompts.ts` → `VOICE_EXAMPLES` holds **placeholder** exchanges. Replace them with real, anonymized ones to make the app sound like Marquis.
