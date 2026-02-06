# Family Expense Tracker

A web application that enables families to track shared expenses, identify spending patterns, and understand where their money goes each month.

## Features

- 🔐 **User Authentication** - Secure email/password authentication with Firebase
- 👨‍👩‍👧‍👦 **Family Management** - Create families, invite members, share expenses
- 💰 **Expense Tracking** - Log expenses with categories, tags, and receipt photos
- 📊 **Dashboard & Analytics** - Monthly summaries and category breakdowns
- ⚠️ **Anomaly Detection** - Automatic alerts for unusual spending patterns
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

## Tech Stack

- **Frontend**: Web Components (Lit), TypeScript, Vite
- **Backend**: Firebase (Auth, Firestore, Storage, Functions)
- **Deployment**: Vercel
- **Testing**: Vitest

## Multi-Environment Architecture

This project uses a multi-environment setup with isolated Firestore data paths:

| Environment | Purpose | Firestore Path | Emulators |
|------------|---------|----------------|-----------|
| **Local** | Development | Root level | ✅ Yes (Auth: 9099, Firestore: 8080) |
| **Preview** | PR previews | `/environments/preview/` | ❌ No |
| **Production** | Live app | `/environments/production/` | ❌ No |

### How It Works

The `getCollectionPath()` utility dynamically prefixes Firestore paths based on the current environment:

```typescript
import { getCollectionPath } from '@/utils/environment';

// In local environment (with emulators)
getCollectionPath('users');    // Returns: 'users'

// In preview environment
getCollectionPath('users');    // Returns: 'environments/preview/users'

// In production environment
getCollectionPath('users');    // Returns: 'environments/production/users'
```

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 8+
- Firebase CLI (`npm install -g firebase-tools`)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd family-expense-tracker

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env.local
```

### Local Development (with Emulators)

1. **Start Firebase Emulators**:
   ```bash
   pnpm firebase:emulators
   ```
   This starts:
   - Auth Emulator: http://localhost:9099
   - Firestore Emulator: http://localhost:8080
   - Storage Emulator: http://localhost:9199
   - Emulator UI: http://localhost:4000

2. **Start Development Server**:
   ```bash
   pnpm dev:emulator
   ```
   App runs at http://localhost:5173

### Configuration

Create `.env.local` with your Firebase configuration:

```env
VITE_APP_ENV=local

# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Emulator Configuration
VITE_USE_EMULATORS=true
VITE_EMULATOR_AUTH_PORT=9099
VITE_EMULATOR_FIRESTORE_PORT=8080
VITE_EMULATOR_STORAGE_PORT=9199

# Firestore Root Path (empty for local)
VITE_FIRESTORE_ROOT_PATH=
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm dev:emulator` | Start with local environment |
| `pnpm build` | Build for production |
| `pnpm build:preview` | Build for preview environment |
| `pnpm build:production` | Build for production environment |
| `pnpm test` | Run tests |
| `pnpm test:ui` | Run tests with UI |
| `pnpm test:coverage` | Run tests with coverage |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Fix ESLint issues |
| `pnpm format` | Format code with Prettier |
| `pnpm firebase:emulators` | Start Firebase emulators |
| `pnpm analyze` | Analyze bundle size |

## Project Structure

```
family-expense-tracker/
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # GitHub Actions CI/CD
├── src/
│   ├── components/
│   │   ├── auth/              # Login, Signup components
│   │   ├── layout/            # Header, Sidebar
│   │   ├── expense/           # Expense CRUD components
│   │   ├── dashboard/         # Dashboard components
│   │   └── shared/            # Reusable components
│   ├── services/
│   │   ├── firebase.ts        # Firebase initialization
│   │   ├── auth-service.ts    # Authentication
│   │   └── family-service.ts  # Family management
│   ├── utils/
│   │   ├── environment.ts     # Environment utilities
│   │   └── helpers.ts         # Helper functions
│   ├── types/
│   │   └── index.ts           # TypeScript types
│   ├── styles/
│   │   ├── global.css
│   │   ├── variables.css
│   │   └── responsive.css
│   ├── test/
│   │   └── setup.ts           # Test setup
│   └── app.ts                 # Main app shell
├── .env.example               # Environment template
├── .env.local                 # Local environment (git-ignored)
├── .env.preview               # Preview environment
├── .env.production            # Production environment
├── firebase.json              # Firebase configuration
├── firestore.rules            # Firestore security rules
├── storage.rules              # Storage security rules
├── vercel.json                # Vercel configuration
├── vite.config.ts             # Vite configuration
└── vitest.config.ts           # Vitest configuration
```

## Deployment

### Vercel Setup

1. **Connect Repository**: Link your GitHub repo to Vercel

2. **Configure Environment Variables** in Vercel dashboard:
   
   For **Preview** deployments:
   ```
   VITE_APP_ENV=preview
   VITE_FIRESTORE_ROOT_PATH=environments/preview
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```
   
   For **Production** deployments:
   ```
   VITE_APP_ENV=production
   VITE_FIRESTORE_ROOT_PATH=environments/production
   VITE_FIREBASE_API_KEY=...
   (same Firebase config)
   ```

3. **Deploy**: Push to `main` for production, create PRs for preview

### GitHub Actions

The CI/CD pipeline automatically:
- Runs linting and tests on all pushes
- Builds for preview on PRs
- Deploys to Vercel preview on PRs
- Deploys to Vercel production on main branch merges
- Updates Firebase security rules on production deploys

Required GitHub Secrets:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `FIREBASE_TOKEN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`

## Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com

2. Enable services:
   - Authentication (Email/Password provider)
   - Firestore Database
   - Cloud Storage

3. Deploy security rules:
   ```bash
   firebase deploy --only firestore:rules,storage:rules
   ```

4. Deploy indexes:
   ```bash
   firebase deploy --only firestore:indexes
   ```

## Testing

```bash
# Run all tests
pnpm test

# Run with UI
pnpm test:ui

# Run with coverage
pnpm test:coverage
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.
