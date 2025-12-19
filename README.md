# CiviTest 🇫🇷

<div align="center">
  <img src="public/favicon.svg" alt="CiviTest Logo" width="100" height="100">
  <h3>Simulateur d'entraînement pour l'Examen Civique français</h3>
  <p>Préparez-vous efficacement pour l'examen civique requis pour la naturalisation française</p>
</div>

---

## 📋 À propos

CiviTest est une application web de préparation à l'**Examen civique** français, obligatoire pour la naturalisation et certains titres de séjour. L'application simule les conditions réelles de l'examen :

- **40 questions** à choix multiples
- **45 minutes** maximum
- **80% de bonnes réponses** requis (32/40)
- **5 thèmes** officiels couverts

## ✨ Fonctionnalités

### Quiz
- ✅ Génération aléatoire de 40 questions uniques
- ✅ Distribution pondérée par thème (conforme aux proportions officielles)
- ✅ Mélange aléatoire des réponses
- ✅ Chronomètre de 45 minutes avec alertes visuelles
- ✅ Navigation clavier accessible
- ✅ Prévention de la navigation accidentelle

### Résultats & Révision
- ✅ Score détaillé avec indicateur réussite/échec
- ✅ Performance par thème
- ✅ Mode révision avec explications
- ✅ Filtrage des questions (correctes/incorrectes/par thème)

### Statistiques & Progression
- ✅ Historique des quiz persistant
- ✅ Graphiques de progression
- ✅ Analyse par thème
- ✅ Export/Import des données
- ✅ Évitement des questions récemment vues

## 🛠 Technologies

| Catégorie         | Technologies                   |
| ----------------- | ------------------------------ |
| **Framework**     | React avec TypeScript          |
| **Routage**       | TanStack Router                |
| **État**          | TanStack Store                 |
| **Data Fetching** | TanStack Query (React Query)   |
| **Styling**       | Tailwind CSS + shadcn/ui       |
| **Graphiques**    | Recharts                       |
| **Build**         | Vite                           |
| **Tests**         | Vitest + React Testing Library |


## 🚀 Installation

### Prérequis
- Node.js 18+
- pnpm 9+ (`npm install -g pnpm`)

### Étapes

```bash
# Cloner le projet
git clone <repository-url>
cd civitest

# Installer les dépendances
pnpm install

# Lancer en développement
pnpm dev

# Build pour production
pnpm build

# Prévisualiser le build
pnpm preview
```

## 📝 Ajouter des questions

Les questions sont stockées dans `public/questions.json`. Chaque question doit suivre ce schéma :

```json
{
  "id": "unique_id",
  "question": "Texte de la question ?",
  "type": "knowledge",
  "topic": "principes_valeurs",
  "choices": [
    { "label": "Réponse correcte", "isCorrect": true },
    { "label": "Mauvaise réponse 1", "isCorrect": false },
    { "label": "Mauvaise réponse 2", "isCorrect": false },
    { "label": "Mauvaise réponse 3", "isCorrect": false }
  ],
  "explanation": "Explication de la bonne réponse.",
  "difficulty": "easy"
}
```

### Champs obligatoires

| Champ         | Type                               | Description                            |
| ------------- | ---------------------------------- | -------------------------------------- |
| `id`          | string                             | Identifiant unique                     |
| `question`    | string                             | Texte de la question                   |
| `type`        | `"knowledge"` \| `"situational"`   | Type de question                       |
| `topic`       | TopicId                            | Thème de la question                   |
| `choices`     | Choice[]                           | 4 réponses (1 correcte, 3 incorrectes) |
| `explanation` | string                             | Explication pédagogique                |
| `difficulty`  | `"easy"` \| `"medium"` \| `"hard"` | Niveau de difficulté                   |

### Thèmes (TopicId)

| ID                            | Nom                                   | Nb. questions/quiz |
| ----------------------------- | ------------------------------------- | ------------------ |
| `principes_valeurs`           | Principes et valeurs de la République | ~11                |
| `institutions`                | Système institutionnel et politique   | ~6                 |
| `droits_devoirs`              | Droits et devoirs                     | ~11                |
| `histoire_geographie_culture` | Histoire, géographie et culture       | ~8                 |
| `vivre_france`                | Vivre dans la société française       | ~4                 |

## ⌨️ Raccourcis clavier

| Touche       | Action                   |
| ------------ | ------------------------ |
| `1-4`        | Sélectionner une réponse |
| `←` / `p`    | Question précédente      |
| `→` / `n`    | Question suivante        |
| `Ctrl+Enter` | Terminer le quiz         |

## 🔧 Scripts disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run preview      # Prévisualiser le build
npm run test         # Lancer les tests
npm run test:coverage # Tests avec couverture
npm run lint         # Vérifier le code
npm run lint:fix     # Corriger le code
npm run format       # Formater le code
npm run typecheck    # Vérifier les types
```

## 📊 Stockage des données

Les données sont persistées dans le `localStorage` du navigateur :

- **Historique des quiz** : scores, dates, performances par thème
- **Questions utilisées** : pour éviter les répétitions
- **Pas de backend requis** : tout fonctionne côté client

### Export/Import

Les utilisateurs peuvent exporter leur historique au format JSON et l'importer sur un autre appareil via la page Statistiques.

## 🎨 Personnalisation

### Thème de couleurs (Tailwind v4)

Les couleurs sont définies dans `src/styles/globals.css` en utilisant la directive `@theme` de Tailwind v4.
Les couleurs utilisent le thème de la République française :

- **Bleu** : `#002654`
- **Blanc** : `#FFFFFF`
- **Rouge** : `#CE1126`

Pour modifier les couleurs, éditez la section `@theme` dans `globals.css` :

```css
@theme {
  --color-primary: #002654;
  --color-primary-foreground: #f8fafc;
  /* ... autres couleurs */
}
```
### Modifier la durée ou le seuil

Dans `src/types/index.ts`, modifiez `QUIZ_CONFIG` :

```typescript
export const QUIZ_CONFIG = {
  totalQuestions: 40,
  timeLimit: 45 * 60,      // Durée en secondes
  passingScore: 0.8,       // Pourcentage requis (80%)
  passingQuestions: 32,    // Nombre de bonnes réponses
} as const;
```

## 📄 Licence

Ce projet est sous licence MIT.

---

<div align="center">
  <p>Fait avec ❤️ pour tous ceux qui préparent leur examen civique</p>
  <p>🇫🇷 Liberté • Égalité • Fraternité 🇫🇷</p>
</div>
