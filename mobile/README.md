# CiviTest — Mobile (React Native / Expo)

A production-ready React Native port of the CiviTest web app: a French civic-exam
quiz trainer (40 questions, 45 minutes, 80% to pass). **Fully offline** — questions
are bundled, history is stored on-device (expo-sqlite), and the app makes zero
network calls and contains no analytics or tracking.

## Stack

- **Expo SDK 56** + **Expo Router** (file-based navigation, single Stack)
- **NativeWind** (Tailwind for RN) for styling, mobile-first
- **@tanstack/react-store** + **@tanstack/react-query** — domain state & caching
  (ported with minimal change from the web app)
- **expo-sqlite** (`kv-store`, synchronous) — local quiz-history persistence
- **react-native-gifted-charts** — stats charts
- **@gorhom/bottom-sheet**, **react-native-gesture-handler**, **moti/reanimated**,
  **expo-haptics**, **react-native-safe-area-context** — UX
- **zod** — runtime validation of bundled questions and imported history

## Project layout

```
src/
  app/                 # Expo Router routes
    _layout.tsx        # providers (SafeArea, Query, GestureHandler, BottomSheet) + Stack
    index.tsx          # Home
    quiz.tsx           # Timed quiz (swipe nav, timer, progress sheet, dialogs)
    stats.tsx          # Stats dashboard (charts, history, export/import/clear)
    review.tsx         # Review the just-completed quiz
    review/[quizId].tsx# Review a historical quiz
  components/          # Timer, QuestionCard, QuizProgress, ResultsSummary, ReviewScreen
    ui/                # Button, Card, Badge, ConfirmDialog, ProgressBar, Tricolor
    stats/             # StatsSummaryCards, TrendChart, TopicPerformanceChart, QuizResultsList
  stores/quizStore.ts  # quiz state machine + scoring (framework-agnostic)
  utils/               # questions.ts (selection/shuffle/format), storage.ts (expo-sqlite)
  lib/                 # queries.ts (bundled question loading), schemas.ts, questionData.ts
  hooks/               # useQuizTimer, useQuizStats
  services/            # logger, toast, quizExport (share/import JSON)
  theme/tokens.ts      # design tokens (colors, spacing, type scale)
assets/data/           # 12 bundled question JSON files
```

## Run

```bash
npm install
npx expo start        # open in Expo Go, or a dev build
```

Type-check: `npx tsc --noEmit`. Production bundle check:
`npx expo export --platform ios`.
