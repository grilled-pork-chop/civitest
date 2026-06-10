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

---

# Publier sur le Google Play Store

App identity (already configured in `app.json` / `eas.json`):

| Field             | Value                          |
| ----------------- | ------------------------------ |
| App name          | `CiviTest`                     |
| Package           | `com.grilledporkchop.civitest` |
| Version           | `1.0.0`                        |
| EAS owner         | `grilledporkchop`              |
| Category          | Éducation                      |
| Price             | Gratuit (+ pourboires in-app)  |

Follow the steps in order. Each must be done before the next.

---

## Step 0: Pre-flight checks

Run from `mobile/` before building anything:

```bash
npx tsc --noEmit            # type-check clean
npx expo-doctor            # config / dependency sanity (optional but recommended)
```

Confirm the store assets exist (see [Store assets](#store-assets) to regenerate):

- `assets/app-store-icon.png`: 512 × 512, no alpha
- `assets/feature-graphic.png`: 1024 × 500

---

## Step 1: Regenerate the native Android project

```bash
cd mobile
npx expo prebuild --platform android --clean
```

This rewrites `android/` with `com.grilledporkchop.civitest`. Commit the result.

---

## Step 2: Create a Google Play developer account

1. Go to [play.google.com/console](https://play.google.com/console)
2. Sign in and pay the one-time **$25 registration fee**
3. Complete the developer profile and accept the Distribution Agreement

---

## Step 3: Create the app in Play Console

1. **Create app**
2. App name: `CiviTest` · Default language: **Français (France)** · Type: **App** · **Free**
3. Accept the declarations and **Create app**

---

## Step 4: Store listing (French)

**Grow → Store presence → Main store listing.**

### Brief description (≤ 80 characters)

```
Examen civique français : 40 questions, chrono, hors-ligne et gratuit.
```

### Full description (≤ 4000 characters)

```
CiviTest est l’application d’entraînement à l’examen civique français.
Préparez-vous dans les conditions réelles de l’examen : 40 questions,
45 minutes, 80 % de bonnes réponses pour réussir.

100 % hors-ligne, gratuite et sans publicité. Toutes les questions sont
intégrées à l’application et votre historique reste sur votre appareil.
Aucune connexion, aucun compte, aucune donnée collectée.

POURQUOI CIVITEST ?
• Examens chronométrés dans les conditions réelles (40 questions, 45 minutes)
• Plus de 500 questions couvrant l’ensemble du programme
• Correction détaillée, question par question, après chaque examen
• Suivi de votre progression : score moyen, taux de réussite, évolution
• Statistiques par thème pour repérer vos points faibles
• Mode clair et mode sombre
• Entièrement en français

LES THÈMES COUVERTS
• Principes et valeurs de la République
• Système institutionnel et politique
• Droits et devoirs
• Histoire, géographie et culture
• Vivre dans la société française

Deux types de questions, comme à l’examen : questions de connaissance et
mises en situation.

RESPECT DE VOTRE VIE PRIVÉE
CiviTest fonctionne intégralement sur votre appareil. Pas de serveur, pas de
suivi, pas de publicité. Vos résultats vous appartiennent et ne quittent
jamais votre téléphone.

APPLICATION INDÉPENDANTE
CiviTest est une application d’entraînement indépendante. Elle n’est ni
officielle, ni affiliée, ni agréée par le gouvernement français ou une
quelconque autorité publique. Les questions sont fournies à des fins
d’entraînement uniquement et ne constituent pas un document officiel.

Préparez votre examen civique en toute sérénité. Téléchargez CiviTest et
entraînez-vous où que vous soyez, même sans connexion.
```

---

## Store assets

| Asset                 | Size / format             | File                            | Status                          |
| --------------------- | ------------------------- | ------------------------------- | ------------------------------- |
| App icon (hi-res)     | 512 × 512 PNG, no alpha   | `assets/app-store-icon.png`     | ✅ generated                     |
| Feature graphic       | 1024 × 500 PNG (no alpha) | `assets/feature-graphic.png`    | ✅ generated                     |
| Phone screenshots     | min 2, ≥ 1080 × 1920 PNG  | capture from device/emulator    | ⬜ to capture                    |

Suggested screenshots (4 is a good set): **Accueil** (anneau de score), **Examen** (question + chrono), **Correction** (juste/faux détaillé), **Statistiques** (graphique d’évolution).

Capture from an emulator:

```bash
cd mobile
npx expo run:android         # or open a dev/preview build
adb exec-out screencap -p > screen.png
```

Regenerate the icon and feature graphic (requires `inkscape` + ImageMagick `convert`, both used by the asset pipeline):

```bash
cd mobile/assets
inkscape feature-graphic.svg --export-type=png --export-filename=feature-graphic.png -w 1024 -h 500
convert feature-graphic.png -background "#002654" -alpha remove -alpha off -flatten feature-graphic.png
convert images/icon.png -resize 512x512 -background "#002654" -alpha remove -alpha off -flatten app-store-icon.png
```

The launcher/adaptive icons themselves are regenerated by `node scripts/gen-icon.mjs` (needs a no-save `sharp`).

---

## Step 5: Content rating

**Policy → App content → Content rating → Start questionnaire.**

| Question                | Answer        |
| ----------------------- | ------------- |
| Category                | **Éducation** |
| Violence                | Non           |
| Sexual content          | Non           |
| Profanity               | Non           |
| Controlled substances   | Non           |
| User-generated content  | Non           |
| Users can interact      | Non           |

Result: **PEGI 3 / Everyone**.

---

## Step 6: Data safety

**Policy → App content → Data safety → Start.**

| Question                                                  | Answer                                                                  |
| --------------------------------------------------------- | ----------------------------------------------------------------------- |
| Does your app collect or share any required user data?    | **No**: everything is on-device; nothing is collected or transmitted   |
| Is user data encrypted in transit?                        | N/A: no data leaves the device                                         |
| Can users request data deletion?                          | **Yes (on-device)**: uninstalling the app removes all local data       |

Leave every data type as **Not collected**. CiviTest makes zero network calls and has no analytics.

---

## Step 7: Privacy policy (required)

Play requires a hosted privacy-policy URL for every app. Since nothing is collected, a one-page statement is enough. Host it anywhere public (GitHub Pages, a Notion page, etc.) and paste the URL in **App content → Privacy policy**. Suggested text:

```
Politique de confidentialité: CiviTest

CiviTest fonctionne intégralement hors-ligne. L’application ne collecte,
ne stocke sur un serveur, ni ne partage aucune donnée personnelle. Votre
historique d’examens et vos réglages sont enregistrés uniquement sur votre
appareil et sont supprimés lors de la désinstallation. CiviTest n’utilise
aucun service d’analyse ni aucune publicité.

Les achats facultatifs (pourboires) sont traités par Google Play ; CiviTest
ne reçoit ni ne conserve vos informations de paiement.

Contact : <votre-email>
```

---

## Step 8: In-app products (pourboires)

**Monetize → In-app products → Create product** for each item. Type **Consumable** so users can tip more than once. These mirror the in-app “Soutenir CiviTest” sheet.

| Product ID                                       | Price   | Title         | Description                |
| ------------------------------------------------ | ------- | ------------- | -------------------------- |
| `com.grilledporkchop.civitest.tip_coffee`        | 1,99 €  | Un café       | Un geste simple pour continuer |
| `com.grilledporkchop.civitest.tip_lunch`         | 4,99 €  | Un déjeuner   | Pour les prochaines mises à jour |
| `com.grilledporkchop.civitest.tip_restaurant`    | 9,99 €  | Un repas      | Un grand merci sincère     |

Each product must be **Active** before purchases succeed in a build.

---

## Step 9: Build the AAB with EAS

```bash
# First time only
npm install -g eas-cli
eas login

cd mobile
eas build --platform android --profile production
```

`eas.json` is preconfigured: `production` builds an **app-bundle**, `autoIncrement` bumps the version code, and `appVersionSource: remote` tracks it on EAS. EAS creates and stores the signing keystore on first build: **back it up from the EAS dashboard immediately**; losing it means you can never update the app.

---

## Step 10: Upload and release

Option A: automated submit (uses the `submit.production` config in `eas.json`; drop your Play service-account JSON at `mobile/google-services-account.json` first):

```bash
cd mobile
eas submit --platform android --profile production
```

Option B: manual:

1. **Release → Production → Create new release**
2. Upload the `.aab` from the EAS dashboard
3. Add the release notes below, **Save → Review release → Start rollout to Production**

**Recommended:** ship to **Internal testing** first (up to 100 testers, instant review) to verify the three in-app purchases end-to-end on a real signed build.

### Release notes: v1.0.0 (≤ 500 characters)

```
Première version de CiviTest.
• Examens chronométrés dans les conditions réelles (40 questions, 45 minutes, 80 % requis)
• Plus de 500 questions, correction détaillée et statistiques par thème
• 100 % hors-ligne, sans publicité et sans collecte de données
• Mode clair et mode sombre
Bonne préparation et bonne chance pour votre examen !
```

---

## Step 11: Review

- **First submission:** 3–7 business days
- **Subsequent updates:** usually a few hours

You will be emailed when the app is approved or if action is required.

---

## Pre-submission checklist

- [ ] `npx tsc --noEmit` passes
- [ ] `npx expo prebuild -p android --clean` committed
- [ ] App icon (512²) + feature graphic (1024×500) uploaded
- [ ] At least 2 phone screenshots uploaded
- [ ] Brief + full description (French) filled in
- [ ] Content rating questionnaire submitted
- [ ] Data safety form submitted (nothing collected)
- [ ] Privacy-policy URL added
- [ ] Three in-app products created and **Active**
- [ ] Internal-testing build verified (IAP works on signed build)
- [ ] EAS keystore backed up
