# 🏥 MediTriage AI — Web App: Complete Development-Ready Specification
### SKITECH INNOTHON 3.0 | Track 10: AI-Powered Smart Medical Diagnostics

---

> **Read this fully before writing a single line of code.**
> This document is the single source of truth for the web app.
> Every decision here is deliberate — do not deviate without reason.

---

## 🧠 WHAT YOU ARE BUILDING

MediTriage AI is a **cross-platform medical triage system** with two separate apps sharing one backend:

- **Mobile App (React Native/Expo)** → Patient-facing → Symptom input, AI triage, report generation
- **Web App (React/Vite)** → Doctor-facing → Real-time case monitoring, AI review, feedback

**This document covers only the Web App.**

The web app is NOT a patient portal. NOT a chat system. NOT a booking system.

It is a **real-time clinical command center** for doctors — think of it as a live ICU monitor, but for AI-triaged cases coming in from patients' phones.

### The Data Flow (sacred — never break this)
```
Patient opens mobile app
      ↓
Speaks / types / uploads symptoms
      ↓
Gemini AI analyzes via Supabase Edge Function
      ↓
Triage result saved to Supabase DB
      ↓ (Supabase Realtime fires instantly)
Doctor's web dashboard updates live
      ↓
Doctor reviews the AI output
      ↓
Doctor submits feedback (rating + notes)
      ↓
ai_confidence score updates in DB
      ↓
System learns over time
```

---

## 🔧 TECH STACK (FINAL — DO NOT SUBSTITUTE)

| Layer | Technology | Why |
|---|---|---|
| Framework | React 18 + Vite | Fast dev, HMR, tree-shaking |
| Language | JavaScript only | No TypeScript — hackathon speed |
| State | Zustand | Lightweight, no boilerplate vs Redux |
| Backend | Supabase (Free tier) | Auth + DB + Realtime + Storage + Edge Functions |
| Animations | Framer Motion | UI transitions, page animations |
| Special FX | GSAP | ONLY for alert pulse + HIGH risk glow effects |
| Scrolling | Lenis | Smooth scroll on dashboard and case detail |
| PDF | jsPDF + html2canvas | Doctor report download |
| Charts | Recharts | Analytics charts (lightweight, React-native) |
| Icons | Lucide React | Consistent, lightweight icon set |
| Routing | React Router v6 | Standard SPA routing |

### Absolute Rules
- ❌ NO Redux, NO Redux Toolkit
- ❌ NO LangChain on frontend
- ❌ NO direct AI API calls from any React component
- ❌ NO TypeScript
- ❌ NO animation libraries beyond Framer Motion + GSAP
- ❌ NO `useEffect` chains that re-fetch repeatedly (use Realtime)
- ✅ ALL AI calls go through Supabase Edge Functions only
- ✅ ALL API keys live in `.env.local` only, never committed

---

## 📁 FOLDER STRUCTURE (EXACT — AI MUST FOLLOW THIS)

```
web/
├── .cursorrules                      ← AI context file (see Phase 0)
├── .env.local                        ← Never committed
├── .gitignore
├── index.html
├── vite.config.js
├── package.json
│
└── src/
    ├── main.jsx                      ← Entry: Lenis init, Zustand provider
    ├── App.jsx                       ← Router, auth guard, layout wrapper
    │
    ├── config/
    │   ├── supabase.js               ← Supabase client (singleton)
    │   └── constants.js              ← Risk levels, table names, app config
    │
    ├── features/
    │   ├── auth/
    │   │   ├── pages/
    │   │   │   └── LoginPage.jsx
    │   │   ├── hooks/
    │   │   │   └── useAuth.js
    │   │   └── services/
    │   │       └── auth.service.js
    │   │
    │   ├── triage/
    │   │   ├── pages/
    │   │   │   ├── DashboardPage.jsx   ← Main screen (live queue)
    │   │   │   └── CaseDetailPage.jsx  ← Full case view
    │   │   ├── components/
    │   │   │   ├── CaseCard.jsx
    │   │   │   ├── RiskBadge.jsx
    │   │   │   ├── PriorityIndicator.jsx
    │   │   │   ├── FeedbackForm.jsx
    │   │   │   ├── CaseQueue.jsx       ← The live list container
    │   │   │   ├── CaseSkeleton.jsx    ← Loading skeleton
    │   │   │   └── NewCaseToast.jsx    ← Realtime new case notification
    │   │   ├── hooks/
    │   │   │   ├── useRealtimeCases.js ← Supabase Realtime subscription
    │   │   │   └── useTriage.js        ← Fetch, update, filter cases
    │   │   └── services/
    │   │       ├── triage.service.js   ← DB operations for cases
    │   │       └── feedback.service.js ← DB operations for feedback
    │   │
    │   └── analytics/
    │       ├── pages/
    │       │   └── AnalyticsPage.jsx
    │       └── components/
    │           ├── RiskDistributionChart.jsx
    │           ├── SymptomFrequencyChart.jsx
    │           └── ActivityTimelineChart.jsx
    │
    ├── components/
    │   ├── layout/
    │   │   ├── Sidebar.jsx             ← Navigation sidebar
    │   │   ├── Header.jsx              ← Top bar (doctor info + live indicator)
    │   │   └── AppLayout.jsx           ← Sidebar + Header wrapper
    │   └── ui/
    │       ├── Button.jsx
    │       ├── Badge.jsx
    │       ├── Card.jsx
    │       ├── Modal.jsx
    │       ├── Skeleton.jsx
    │       ├── StarRating.jsx
    │       └── LiveDot.jsx             ← Animated green pulsing dot
    │
    ├── hooks/
    │   ├── useKeyboardShortcut.js      ← J/K nav between cases, R to review
    │   └── useSound.js                 ← Alert sound for HIGH risk (Howler.js)
    │
    ├── store/
    │   ├── auth.store.js               ← Zustand: user, role, session
    │   └── triage.store.js             ← Zustand: cases, selectedCase, filters
    │
    ├── services/
    │   └── supabase.service.js         ← Generic Supabase helpers
    │
    ├── animations/
    │   ├── variants.js                 ← Framer Motion reusable variants
    │   └── gsap.timelines.js           ← GSAP for HIGH risk pulse + alerts
    │
    ├── utils/
    │   ├── formatters.js               ← Date, risk level, confidence %
    │   ├── risk.helpers.js             ← Risk color, label, priority sort
    │   └── pdf.generator.js            ← jsPDF report generation
    │
    └── styles/
        ├── globals.css                 ← CSS reset, base styles
        ├── variables.css               ← CSS custom properties (design tokens)
        └── animations.css              ← CSS-only animations (keyframes)
```

---

## 🗄️ SUPABASE SCHEMA (EXACT — MATCH MOBILE APP)

### Table: `users`
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
email       text UNIQUE NOT NULL
role        text CHECK (role IN ('patient', 'doctor')) NOT NULL
created_at  timestamptz DEFAULT now()
```

### Table: `doctor_profiles`
```sql
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id             uuid REFERENCES users(id) ON DELETE CASCADE
full_name           text NOT NULL
specialization      text
medical_reg_number  text
hospital_name       text
city                text
years_experience    int
created_at          timestamptz DEFAULT now()
```

### Table: `patient_profiles`
```sql
id                uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id           uuid REFERENCES users(id) ON DELETE CASCADE
full_name         text NOT NULL
age               int
gender            text
blood_group       text
known_conditions  text[]        ← Array of condition strings
allergies         text
emergency_contact_name  text
emergency_contact_phone text
created_at        timestamptz DEFAULT now()
```

### Table: `triage_cases` (THE CORE TABLE)
```sql
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
patient_id          uuid REFERENCES patient_profiles(id)
messages            jsonb         ← Full conversation: [{role, content, timestamp}]
symptom_image_url   text          ← Supabase Storage URL (nullable)
risk_level          text CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')) NOT NULL
ai_summary          text          ← AI-generated plain-language summary
ai_recommendation   text          ← What patient should do next
ai_explanation      text          ← Why AI gave this risk level
ai_confidence       numeric(5,2)  ← 0-100, updated after doctor feedback
detected_symptoms   text[]        ← Array of symptom keywords
language            text DEFAULT 'en'
status              text CHECK (status IN ('pending', 'reviewed', 'escalated', 'closed'))
  DEFAULT 'pending'
verified_by_doctor  boolean DEFAULT false
doctor_id           uuid REFERENCES doctor_profiles(id) (nullable)
created_at          timestamptz DEFAULT now()
updated_at          timestamptz DEFAULT now()
```

### Table: `ai_feedback`
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
case_id         uuid REFERENCES triage_cases(id) ON DELETE CASCADE
doctor_id       uuid REFERENCES doctor_profiles(id)
rating          int CHECK (rating BETWEEN 1 AND 5)
feedback_text   text
risk_override   text CHECK (risk_override IN ('LOW', 'MEDIUM', 'HIGH')) (nullable)
doctor_note     text            ← Doctor's clinical assessment
created_at      timestamptz DEFAULT now()
```

### Supabase Realtime (ENABLE ON):
- `triage_cases` → INSERT, UPDATE events
- `ai_feedback` → INSERT events

### Row Level Security (RLS):
```sql
-- Doctors can see all cases
CREATE POLICY "doctors_read_cases" ON triage_cases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM doctor_profiles
      WHERE user_id = auth.uid()
    )
  );

-- Doctors can update cases
CREATE POLICY "doctors_update_cases" ON triage_cases
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM doctor_profiles
      WHERE user_id = auth.uid()
    )
  );
```

### Supabase Edge Functions (AI calls live here — NOT in frontend):
```
supabase/functions/
  analyze-symptoms/     ← Gemini API: process messages → risk + summary
  analyze-image/        ← Gemini Vision: image → visual symptoms
  generate-report/      ← Gemini: full structured report generation
  calculate-risk/       ← Rule engine + AI hybrid risk scoring
```

---

## 🎨 DESIGN SYSTEM (EXACT VALUES — USE CSS VARIABLES)

### `styles/variables.css`
```css
:root {
  /* === BACKGROUNDS === */
  --bg-base:        #F7F8FC;    /* App background — NOT pure white */
  --bg-surface:     #FFFFFF;    /* Cards, modals */
  --bg-surface-2:   #F0F4FF;    /* AI confidence panels, info sections */
  --bg-doctor:      #FAF8FF;    /* Doctor-specific subtle purple tint */

  /* === BRAND COLORS === */
  --color-primary:      #7C3AED;  /* Purple — doctor authority */
  --color-primary-deep: #5B21B6;  /* Pressed states, headings accent */
  --color-primary-light:#EDE9FE;  /* Light purple backgrounds */
  --color-accent:       #8B5CF6;  /* Hover states */

  /* === TRIAGE SYSTEM (SACRED — never use for decoration) === */
  --risk-high:        #DC2626;
  --risk-high-bg:     #FEF2F2;
  --risk-high-border: #FECACA;
  --risk-high-glow:   rgba(220, 38, 38, 0.20);

  --risk-medium:        #D97706;
  --risk-medium-bg:     #FFFBEB;
  --risk-medium-border: #FDE68A;

  --risk-low:        #16A34A;
  --risk-low-bg:     #F0FDF4;
  --risk-low-border: #BBF7D0;

  /* === NEUTRALS === */
  --text-primary:   #0F172A;
  --text-secondary: #64748B;
  --text-tertiary:  #94A3B8;
  --border:         #E2E8F0;
  --divider:        #F1F5F9;

  /* === STATUS === */
  --color-live:     #16A34A;   /* The green LIVE dot */
  --color-verified: #7C3AED;   /* Doctor-verified badge */

  /* === SHADOWS === */
  --shadow-sm:  0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06);
  --shadow-md:  0 4px 16px rgba(0,0,0,0.10), 0 2px 4px rgba(0,0,0,0.06);
  --shadow-lg:  0 8px 32px rgba(0,0,0,0.12);
  --shadow-high-risk: 0 0 0 3px rgba(220,38,38,0.15),
                      0 8px 32px rgba(220,38,38,0.20);

  /* === SPACING (8px base grid) === */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;

  /* === BORDER RADIUS === */
  --radius-sm:   6px;
  --radius-md:   10px;
  --radius-lg:   14px;
  --radius-xl:   20px;
  --radius-pill: 999px;

  /* === TYPOGRAPHY === */
  --font-sans: 'DM Sans', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;  /* For confidence %, timestamps */
}
```

### Typography Scale
| Token | Size | Weight | Use |
|---|---|---|---|
| Display | 36px | 700 | Hero stats, empty states |
| H1 | 28px | 700 | Page titles |
| H2 | 22px | 600 | Section headings |
| H3 | 18px | 600 | Card titles, patient names |
| Body-lg | 17px / lh 26px | 400 | Primary content, AI summaries |
| Body | 15px / lh 22px | 400 | Secondary content |
| Label | 13px | 500 | Tags, badges, timestamps |
| Caption | 12px | 400 | Metadata, disclaimers |
| Mono | 14px | 500 | Confidence %, case IDs |

**Font import** (add to `index.html`):
```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
```

---

## 🔐 AUTHENTICATION

### What it does:
- **Doctor-only login** (no patient sign-up on web)
- Supabase Auth with email + password
- On login: check `doctor_profiles` table for profile
- If no profile → redirect to onboarding
- Protected routes: ALL routes except `/login`

### `useAuth.js` contract:
```javascript
const { user, doctorProfile, loading, signIn, signOut } = useAuth()
```

### Route guard in `App.jsx`:
```javascript
// If not authenticated → /login
// If authenticated but no doctor profile → /onboarding
// If fully set up → /dashboard
```

### Auth store shape (`auth.store.js`):
```javascript
{
  user: null,               // Supabase auth user object
  doctorProfile: null,      // From doctor_profiles table
  isAuthenticated: false,
  isLoading: true,
  actions: {
    setUser,
    setDoctorProfile,
    clearAuth,
  }
}
```

---

---

# 📦 PHASE 0: PROJECT FOUNDATION
**Time estimate: 45 minutes**

## Tasks:

### 1. Initialize Project
```bash
npm create vite@latest web -- --template react
cd web
npm install
```

### 2. Install All Dependencies
```bash
npm install @supabase/supabase-js zustand framer-motion gsap lenis
npm install react-router-dom recharts lucide-react
npm install jspdf html2canvas
npm install howler  # for HIGH risk alert sound
```

### 3. Create `.cursorrules` (CRITICAL — do this before any other file)
```markdown
# .cursorrules

## Project: MediTriage AI — Web App (Doctor Dashboard)
## Stack: React 18 + Vite, JavaScript only, Zustand, Supabase

## Purpose
Real-time doctor dashboard that receives patient triage cases from a
mobile app (React Native/Expo), displays them live using Supabase
Realtime, and lets doctors review AI output + submit feedback.

## Architecture Rules
- ALL Supabase calls go through services/ files only
- NO direct fetch() or supabase calls inside components
- ALL AI calls go through Supabase Edge Functions (never from frontend)
- State: Zustand only (auth.store.js + triage.store.js)
- Animations: Framer Motion for UI, GSAP only for HIGH risk effects

## Folder Mapping
- Pages: src/features/[feature]/pages/
- Components: src/features/[feature]/components/ (feature-specific)
             src/components/ (shared/global)
- Hooks: src/features/[feature]/hooks/
- Services: src/features/[feature]/services/
- Store: src/store/
- Utils: src/utils/
- Animations: src/animations/

## Naming
- Components: PascalCase (CaseCard.jsx)
- Hooks: camelCase with "use" (useRealtimeCases.js)
- Services: camelCase with ".service" (triage.service.js)
- Stores: camelCase with ".store" (triage.store.js)

## Supabase Tables
- triage_cases: main case table (subscribe to INSERT, UPDATE)
- ai_feedback: doctor feedback (INSERT after review)
- doctor_profiles: doctor info (read on login)
- patient_profiles: patient info (read on case detail)

## Risk Levels (EXACT strings — must match mobile)
- "HIGH" → red, urgent, GSAP pulse animation
- "MEDIUM" → amber, moderate
- "LOW" → green, safe

## Case Statuses
- "pending" → not yet reviewed
- "reviewed" → doctor submitted feedback
- "escalated" → doctor flagged emergency
- "closed" → resolved

## Env Variables
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

## DO NOT
- Use Redux
- Use TypeScript
- Call AI APIs from any component
- Hardcode any API keys
- Re-fetch data repeatedly (use Realtime subscription)
```

### 4. Create `config/supabase.js`
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})
```

### 5. Create `config/constants.js`
```javascript
export const RISK_LEVELS = {
  HIGH:   'HIGH',
  MEDIUM: 'MEDIUM',
  LOW:    'LOW',
}

export const CASE_STATUS = {
  PENDING:   'pending',
  REVIEWED:  'reviewed',
  ESCALATED: 'escalated',
  CLOSED:    'closed',
}

export const TABLES = {
  USERS:            'users',
  DOCTOR_PROFILES:  'doctor_profiles',
  PATIENT_PROFILES: 'patient_profiles',
  TRIAGE_CASES:     'triage_cases',
  AI_FEEDBACK:      'ai_feedback',
}

export const RISK_CONFIG = {
  HIGH: {
    label:   'HIGH RISK',
    color:   '#DC2626',
    bg:      '#FEF2F2',
    border:  '#FECACA',
    glow:    true,
    sound:   true,
    sortOrder: 0,
  },
  MEDIUM: {
    label:   'MODERATE',
    color:   '#D97706',
    bg:      '#FFFBEB',
    border:  '#FDE68A',
    glow:    false,
    sound:   false,
    sortOrder: 1,
  },
  LOW: {
    label:   'LOW RISK',
    color:   '#16A34A',
    bg:      '#F0FDF4',
    border:  '#BBF7D0',
    glow:    false,
    sound:   false,
    sortOrder: 2,
  },
}
```

### 6. Create `.env.local`
```
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 7. Set up CSS foundation (`styles/variables.css` + `styles/globals.css`)
Apply full design system from the Design System section above.

```css
/* globals.css */
@import url('./variables.css');

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-family: var(--font-sans);
  background: var(--bg-base);
  color: var(--text-primary);
  -webkit-font-smoothing: antialiased;
}

body {
  overflow-x: hidden;
}

/* Lenis smooth scroll */
html.lenis {
  height: auto;
}
.lenis.lenis-smooth {
  scroll-behavior: auto;
}
```

### 8. Initialize Lenis in `main.jsx`
```javascript
import Lenis from 'lenis'

const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
})

function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}
requestAnimationFrame(raf)
```

### ✅ Phase 0 Output:
- Project runs (`npm run dev`)
- Supabase connects
- Design tokens loaded
- `.cursorrules` ready for AI assistance
- Folder structure created (empty files with comments)

---

# 🔐 PHASE 1: AUTHENTICATION
**Time estimate: 1.5 hours**

## What to build:
Doctor-only login system. Clean, minimal. No registration on web
(doctors are added by admin or register on a separate onboarding flow).

## Files to build:

### `features/auth/services/auth.service.js`
```javascript
import { supabase } from '../../../config/supabase'
import { TABLES } from '../../../config/constants'

export const authService = {
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getDoctorProfile(userId) {
    const { data, error } = await supabase
      .from(TABLES.DOCTOR_PROFILES)
      .select('*')
      .eq('user_id', userId)
      .single()
    if (error) throw error
    return data
  },

  async getSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  },
}
```

### `store/auth.store.js`
```javascript
import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user:            null,
  doctorProfile:   null,
  isAuthenticated: false,
  isLoading:       true,

  setUser:          (user) => set({ user, isAuthenticated: !!user }),
  setDoctorProfile: (profile) => set({ doctorProfile: profile }),
  setLoading:       (isLoading) => set({ isLoading }),
  clearAuth: () => set({
    user:            null,
    doctorProfile:   null,
    isAuthenticated: false,
  }),
}))
```

### `features/auth/hooks/useAuth.js`
```javascript
import { useEffect } from 'react'
import { useAuthStore } from '../../../store/auth.store'
import { authService } from '../services/auth.service'

export function useAuth() {
  const {
    user, doctorProfile, isAuthenticated, isLoading,
    setUser, setDoctorProfile, setLoading, clearAuth,
  } = useAuthStore()

  useEffect(() => {
    // Initialize session on mount
    authService.getSession().then(async (session) => {
      if (session?.user) {
        setUser(session.user)
        try {
          const profile = await authService.getDoctorProfile(session.user.id)
          setDoctorProfile(profile)
        } catch {
          // No profile yet → redirect handled in App.jsx
        }
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setUser(session.user)
          const profile = await authService.getDoctorProfile(session.user.id)
          setDoctorProfile(profile)
        } else if (event === 'SIGNED_OUT') {
          clearAuth()
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    setLoading(true)
    try {
      await authService.signIn(email, password)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    await authService.signOut()
    clearAuth()
  }

  return { user, doctorProfile, isAuthenticated, isLoading, signIn, signOut }
}
```

### `features/auth/pages/LoginPage.jsx`
**Design spec:**
- Full screen, centered card (400px max-width)
- Background: `var(--bg-base)` with very subtle grid pattern
- Card: white, `var(--shadow-md)`, `var(--radius-xl)`, 40px padding
- Top of card: MediTriage logo + "AI" badge + "Doctor Portal" subtitle
- Fields: Email + Password with floating labels
- Submit button: `var(--color-primary)` (purple — doctor color)
- Error state: red border on fields + error message below
- On success: Framer Motion fade-out → navigate to `/dashboard`
- Loading state: button shows spinner, disabled

**Framer Motion:**
- Card enters: `y: 20, opacity: 0` → `y: 0, opacity: 1` (spring)
- Error message: `x: -10, 0, 10, 0` shake animation on wrong password

### `App.jsx` — Route Guard Logic
```javascript
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading, doctorProfile } = useAuthStore()

  if (isLoading) return <FullPageLoader />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!doctorProfile) return <Navigate to="/onboarding" replace />

  return children
}

// Routes:
// /login → LoginPage (public)
// /onboarding → DoctorOnboardingPage (auth required, no profile)
// /dashboard → DashboardPage (protected)
// /cases/:id → CaseDetailPage (protected)
// /analytics → AnalyticsPage (protected)
// /* → Navigate to /dashboard
```

### ✅ Phase 1 Output:
- Doctor can log in with email + password
- Session persists on page refresh
- Protected routes working
- Auth state in Zustand

---

# 📊 PHASE 2: DASHBOARD (STATIC FIRST)
**Time estimate: 2.5 hours**

Build the full dashboard UI with hardcoded mock data first.
Real-time data comes in Phase 3. This order is intentional —
get the UI perfect before wiring live data.

## Layout Architecture

```
┌─────────────────────────────────────────────────────┐
│                    AppLayout                         │
│  ┌──────────┐  ┌──────────────────────────────────┐ │
│  │          │  │           Header                   │ │
│  │ Sidebar  │  ├──────────────────────────────────┤ │
│  │          │  │                                    │ │
│  │  Nav     │  │         Page Content               │ │
│  │  links   │  │         (scrollable)               │ │
│  │          │  │                                    │ │
│  │  Doctor  │  │                                    │ │
│  │  info    │  │                                    │ │
│  └──────────┘  └──────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

## Files to build:

### `components/layout/Sidebar.jsx`
**Design spec (240px wide, fixed left):**
- Background: white, 1px right border `var(--border)`
- Top: MediTriage logo (24px) + "AI" badge
- Nav links: Dashboard, Analytics, Profile
  - Active: `var(--color-primary-light)` bg, `var(--color-primary)` text + left indicator bar (3px)
  - Hover: `var(--bg-base)` bg
  - Each link: icon (Lucide, 18px) + label (15px/500)
- Bottom: Doctor avatar (40px, purple ring) + Name + "Sign out" link

### `components/layout/Header.jsx`
**Design spec (full width, 64px tall):**
- Background: white, 1px bottom border `var(--border)`
- Left: Page title (dynamic) + breadcrumb if in sub-page
- Center: Realtime live indicator
  - Animated green dot + "LIVE" text (13px/700, `#16A34A`)
  - Shows when Supabase Realtime is connected
  - Shows "OFFLINE" in gray when disconnected
- Right: 
  - New cases badge (purple pill with count, animates when new case arrives)
  - Notification bell icon
  - Doctor avatar (32px)

### `components/ui/LiveDot.jsx`
```javascript
// Animated pulsing green dot
// CSS: scale 1→1.5→1, opacity 1→0→1, 2s loop
// Used in Header + Doctor Queue
```

### `features/triage/components/RiskBadge.jsx`
```javascript
// Props: risk ('HIGH' | 'MEDIUM' | 'LOW'), size ('sm' | 'md' | 'lg')
// Uses RISK_CONFIG from constants.js
// Pill shape, colored bg, dot + label
// HIGH: pulse animation (Framer Motion, scale 1→1.05→1, 2s loop)
```

### `features/triage/components/PriorityIndicator.jsx`
```javascript
// 4px vertical bar on left edge of each CaseCard
// Color matches risk level
// HEIGHT fills full card height
// HIGH: subtle glow using var(--risk-high-glow)
```

### `features/triage/components/CaseCard.jsx`
**This is the most important component. Build it perfectly.**

**Design spec:**
- White card, `var(--shadow-sm)`, `var(--radius-lg)` (14px)
- Left edge: `PriorityIndicator` (4px colored bar, full height)
- Total padding: 16px right + top + bottom
- Clickable → navigates to `/cases/:id`
- Hover: `box-shadow` transitions to `var(--shadow-md)`, `translateY(-1px)` (Framer Motion)

**Card content layout:**
```
┌──────────────────────────────────────────────┐
│ ▌ ← priority bar (4px, risk color)           │
│   [Patient Name, Age]    [Risk Badge]  [Time] │
│   Symptom summary (2 lines max, truncated...) │
│   [Symptom chip] [Symptom chip] [+2 more]     │
│   [AI Confidence: 87%]   [Status badge]       │
└──────────────────────────────────────────────┘
```

**HIGH RISK card additional styling:**
```javascript
// Box shadow: var(--shadow-high-risk)
// Left priority bar: animated brightness pulse (GSAP)
// Background: very subtle #FEF2F2 tint (2% opacity)
// On mount: trigger GSAP alert animation (see animations phase)
```

**Prop shape:**
```javascript
{
  id, patient_name, patient_age, patient_gender,
  risk_level, ai_summary, detected_symptoms,
  ai_confidence, status, created_at,
  verified_by_doctor
}
```

### `features/triage/components/CaseSkeleton.jsx`
Loading skeleton that matches CaseCard layout.
Use CSS animation (`background: linear-gradient(...)` shimmer effect).
Show 5 skeleton cards on initial load.

### `features/triage/components/CaseQueue.jsx`
Container for the live case list.

**Sections:**
```javascript
// 1. Summary stat pills row (top):
//    [🔴 X Urgent] [🟡 X Moderate] [🟢 X Safe] [✅ X Reviewed]
//    Each tappable → filters the list below

// 2. Filter tabs: [All] [🔴 Urgent] [🟡 Moderate] [🟢 Safe] [✅ Reviewed]
//    Underline style, purple active

// 3. Sort options (right): [Newest] [Priority] [Patient Name]

// 4. Case list (AnimatePresence from Framer Motion):
//    Cases sorted by risk (HIGH first, then MEDIUM, then LOW)
//    Staggered entrance: each card stagger 60ms
//    Layout animation: cards reorder smoothly when filtered
```

### `features/triage/pages/DashboardPage.jsx`
**Overall layout:**
```
┌────────────────────────────────────────────────────┐
│ "Good morning, Dr. [Name] 👋"   [today's date]     │
│ "3 urgent cases need your attention"                │
├─────────────────────┬──────────────────────────────┤
│                     │                              │
│   STAT CARDS ROW    │                              │
│  (4 cards, 1 row)   │                              │
│                     │                              │
├─────────────────────┘                              │
│                                                    │
│         CASE QUEUE (full width)                    │
│         (CaseQueue component)                      │
│                                                    │
└────────────────────────────────────────────────────┘
```

**Stat cards (4 cards, horizontal row):**
Each card: white, shadow-sm, radius-lg
```
[Total Today: 24]  [🔴 High: 3]  [✅ Reviewed: 18]  [⏱ Avg: 4.2m]
```
- Numbers: 36px/700 (count-up animation on mount, 800ms)
- Label: 13px/400, `var(--text-secondary)`

**Mock data for Phase 2 (hardcode in DashboardPage.jsx):**
```javascript
const MOCK_CASES = [
  {
    id: '1',
    patient_name: 'Rahul Sharma',
    patient_age: 45,
    patient_gender: 'Male',
    risk_level: 'HIGH',
    ai_summary: 'Patient reports severe chest pain radiating to left arm, shortness of breath, and cold sweats for the past 2 hours.',
    detected_symptoms: ['chest pain', 'shortness of breath', 'cold sweats', 'nausea'],
    ai_confidence: 92,
    status: 'pending',
    verified_by_doctor: false,
    created_at: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  // ... add 6 more cases with mix of HIGH/MEDIUM/LOW
]
```

### ✅ Phase 2 Output:
- Full dashboard UI visible with mock data
- Sidebar navigation working (routes but pages may be empty)
- All card styles correct (HIGH risk styling, badges, priority bars)
- Filter/sort working on mock data
- Stat cards with count-up animation
- No real data yet — that's Phase 3

---

# ⚡ PHASE 3: REAL-TIME INTEGRATION
**Time estimate: 2 hours**

**This is the most technically critical phase.** The entire value of the web app is that doctors see cases the moment patients submit them. Build this carefully.

## Files to build:

### `store/triage.store.js`
```javascript
import { create } from 'zustand'
import { RISK_LEVELS } from '../config/constants'

export const useTriageStore = create((set, get) => ({
  cases:         [],
  selectedCase:  null,
  isLoading:     true,
  filter:        'ALL',      // 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'REVIEWED'
  sortBy:        'priority', // 'priority' | 'newest' | 'name'
  newCaseAlert:  null,       // Case object for toast notification

  // Actions
  setCases:       (cases) => set({ cases, isLoading: false }),
  setLoading:     (isLoading) => set({ isLoading }),
  setFilter:      (filter) => set({ filter }),
  setSortBy:      (sortBy) => set({ sortBy }),
  setSelectedCase: (selectedCase) => set({ selectedCase }),
  setNewCaseAlert: (newCaseAlert) => set({ newCaseAlert }),

  // Insert new case from Realtime
  addCase: (newCase) => set((state) => ({
    cases: [newCase, ...state.cases],
    newCaseAlert: newCase,
  })),

  // Update existing case (e.g., after doctor feedback)
  updateCase: (updatedCase) => set((state) => ({
    cases: state.cases.map((c) =>
      c.id === updatedCase.id ? { ...c, ...updatedCase } : c
    ),
  })),

  // Derived: filtered + sorted cases
  getFilteredCases: () => {
    const { cases, filter, sortBy } = get()

    let filtered = cases
    if (filter !== 'ALL') {
      if (filter === 'REVIEWED') {
        filtered = cases.filter((c) => c.status === 'reviewed')
      } else {
        filtered = cases.filter((c) => c.risk_level === filter)
      }
    }

    const SORT_ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2 }
    if (sortBy === 'priority') {
      filtered = [...filtered].sort(
        (a, b) => SORT_ORDER[a.risk_level] - SORT_ORDER[b.risk_level]
      )
    } else if (sortBy === 'newest') {
      filtered = [...filtered].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      )
    }

    return filtered
  },
}))
```

### `features/triage/services/triage.service.js`
```javascript
import { supabase } from '../../../config/supabase'
import { TABLES } from '../../../config/constants'

export const triageService = {
  // Fetch all cases for today (initial load)
  async getCases() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from(TABLES.TRIAGE_CASES)
      .select(`
        *,
        patient_profiles (
          full_name,
          age,
          gender,
          blood_group,
          known_conditions
        )
      `)
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Fetch single case with full details
  async getCaseById(id) {
    const { data, error } = await supabase
      .from(TABLES.TRIAGE_CASES)
      .select(`
        *,
        patient_profiles (
          full_name, age, gender, blood_group,
          known_conditions, allergies,
          emergency_contact_name, emergency_contact_phone
        ),
        ai_feedback (
          rating, feedback_text, risk_override, doctor_note,
          created_at,
          doctor_profiles ( full_name, specialization )
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Update case status
  async updateCaseStatus(id, status) {
    const { error } = await supabase
      .from(TABLES.TRIAGE_CASES)
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
  },

  // Subscribe to Realtime (returns unsubscribe fn)
  subscribeToNewCases(onInsert, onUpdate) {
    const channel = supabase
      .channel('triage-cases-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: TABLES.TRIAGE_CASES },
        (payload) => onInsert(payload.new)
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: TABLES.TRIAGE_CASES },
        (payload) => onUpdate(payload.new)
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  },
}
```

### `features/triage/hooks/useRealtimeCases.js`
```javascript
import { useEffect } from 'react'
import { useTriageStore } from '../../../store/triage.store'
import { triageService } from '../services/triage.service'
import { useSound } from '../../../hooks/useSound'

export function useRealtimeCases() {
  const { setCases, setLoading, addCase, updateCase } = useTriageStore()
  const { playAlert } = useSound()

  useEffect(() => {
    // 1. Initial fetch
    setLoading(true)
    triageService.getCases()
      .then(setCases)
      .catch(console.error)

    // 2. Subscribe to Realtime
    const unsubscribe = triageService.subscribeToNewCases(
      // On INSERT: new case from mobile app
      (newCase) => {
        addCase(newCase)
        if (newCase.risk_level === 'HIGH') {
          playAlert()  // Howler.js alert sound
        }
      },
      // On UPDATE: case status changed
      (updatedCase) => {
        updateCase(updatedCase)
      }
    )

    return unsubscribe
  }, [])
}
```

### `features/triage/components/NewCaseToast.jsx`
**Design spec:**
- Slides DOWN from top of screen (below header)
- Position: fixed, top: 72px (below header), right: 24px
- Width: 340px
- Background: risk-colored (`var(--risk-high-bg)` for HIGH)
- Border: 1px left colored border (4px, risk color)
- Content: Patient name + risk badge + "New case" label + time
- Auto-dismisses after 5 seconds
- Progress bar inside toast (depletes over 5s)
- Click → navigates to case detail

```javascript
// Framer Motion:
// Enter: x: 360 → x: 0, opacity: 0→1 (spring)
// Exit: x: 360, opacity: 0 (100ms)
// AnimatePresence wraps the toast
```

**Wire to store:** Watch `newCaseAlert` in triage.store.js.
When it appears, show toast. After 5s, set `newCaseAlert: null`.

### Update `DashboardPage.jsx`
Replace MOCK_CASES with `useRealtimeCases()` hook.
Use `useTriageStore((s) => s.getFilteredCases())` for the list.

### `hooks/useSound.js`
```javascript
import { Howl } from 'howler'

const alertSound = new Howl({
  src: ['/sounds/alert.mp3'],  // Add a subtle medical alert sound to /public/sounds/
  volume: 0.4,
})

export function useSound() {
  return {
    playAlert: () => alertSound.play(),
  }
}
```

### ✅ Phase 3 Output:
- Dashboard shows real cases from Supabase
- New case arrives → appears at top of list instantly (no refresh)
- HIGH risk → toast notification + alert sound
- Live dot in header shows Realtime connection status
- Cases persist across page refresh (initial fetch on mount)

---

# 🔍 PHASE 4: CASE DETAIL PAGE
**Time estimate: 2 hours**

When doctor clicks a case → full detail view.
This is where AI output is displayed and reviewed.

### `features/triage/pages/CaseDetailPage.jsx`

**Layout:**
```
┌──────────────────────────────────────────────────┐
│  ← Back   "Patient Case"    [Escalate] [Actions] │
├──────────────────────────┬───────────────────────┤
│                          │                       │
│   LEFT PANEL (60%)       │  RIGHT PANEL (40%)    │
│                          │                       │
│   Patient Info Header    │  AI Analysis Card     │
│   ─────────────────      │  ──────────────────   │
│   Symptom Transcript     │  Risk Badge (large)   │
│   (chat bubbles,         │  Confidence display   │
│    read-only)            │  Recommendation       │
│   ─────────────────      │  Explanation          │
│   Symptom Image          │  ─────────────────── │
│   (if uploaded)          │  FEEDBACK FORM        │
│                          │  (star rating +       │
│                          │   notes + submit)     │
└──────────────────────────┴───────────────────────┘
```

**Left panel components:**

**Patient Info Header:**
```
[Avatar 48px, purple ring] Dr. reviewing: Rahul Sharma
Age: 45 · Male · Blood: B+ · Known: Diabetes, BP
Emergency contact: [name] [phone]
```

**Symptom Transcript:**
- Read-only chat bubbles (same visual style as mobile)
- Patient messages: right-aligned, white bubble
- AI messages: left-aligned, `var(--bg-surface-2)` bubble
- Timestamps between messages
- Smooth scroll (Lenis active here)
- If voice message: show waveform icon + "Voice message" label

**Symptom Image (if `symptom_image_url` exists):**
- Full-width image, rounded (14px radius)
- Click → lightbox modal (Framer Motion scale animation)
- Below image: "Analyzed by Gemini Vision" caption

**Right panel components:**

**AI Analysis Card:**
```
AI Confidence: [large number, monospace font, purple]%
[Confidence bar: full-width, purple fill, animated on mount]
```

Risk badge (large, `size="lg"`)

"AI Summary": body text, bordered left `var(--color-primary)`
"Recommendation": numbered list
"AI Explanation": italic, `var(--text-secondary)`

Below AI card: always visible disclaimer:
```
⚠️ "This is an AI-assisted triage result. Not a medical diagnosis.
   Clinical judgment is required."
```
13px, `var(--text-tertiary)`, italic

**Feedback Form** (`FeedbackForm.jsx` — see below)

**URL pattern:** `/cases/:id`
**Data fetch:** `triageService.getCaseById(id)` on mount

---

### `features/triage/components/FeedbackForm.jsx`
**This is the second most important component.**

**Design spec:**
Card with purple left border (3px), inside right panel.

**Fields:**
1. **Star Rating** (1-5)
   - 5 stars, default: unselected
   - Hover: stars fill left-to-right (Framer Motion)
   - Selected: filled purple stars, scale 1.1 bounce

2. **Risk Override** (optional)
   - Toggle: "Agree with AI assessment" (default ON)
   - If toggled OFF: 3 risk pills appear: [🟢 LOW] [🟡 MEDIUM] [🔴 HIGH]
   - Doctor selects actual risk

3. **Doctor's Clinical Note** (textarea)
   - Placeholder: "Write your clinical assessment..."
   - 4 rows min, grows with content
   - Character count: bottom right

4. **Submit button**
   - "Submit Assessment" — purple, full width
   - Loading state: "Submitting..." with spinner
   - Success state: green checkmark + "Assessment saved"
   - On submit: Framer Motion collapse animation, success message replaces form

**On submit behavior:**
```javascript
// 1. Insert into ai_feedback table
// 2. Update triage_cases: verified_by_doctor=true, status='reviewed'
// 3. If risk_override: update triage_cases.risk_level
// 4. Realtime fires → other doctors see updated case
```

---

### `features/triage/services/feedback.service.js`
```javascript
import { supabase } from '../../../config/supabase'
import { TABLES } from '../../../config/constants'

export const feedbackService = {
  async submitFeedback({ caseId, doctorId, rating, feedbackText, riskOverride, doctorNote }) {
    // 1. Insert feedback
    const { error: feedbackError } = await supabase
      .from(TABLES.AI_FEEDBACK)
      .insert({
        case_id:       caseId,
        doctor_id:     doctorId,
        rating,
        feedback_text: feedbackText,
        risk_override: riskOverride || null,
        doctor_note:   doctorNote,
      })

    if (feedbackError) throw feedbackError

    // 2. Update case
    const updatePayload = {
      verified_by_doctor: true,
      status:             'reviewed',
      updated_at:         new Date().toISOString(),
    }

    if (riskOverride) {
      updatePayload.risk_level = riskOverride
    }

    const { error: caseError } = await supabase
      .from(TABLES.TRIAGE_CASES)
      .update(updatePayload)
      .eq('id', caseId)

    if (caseError) throw caseError
  },
}
```

### ✅ Phase 4 Output:
- Click any case → opens full detail view
- Full AI analysis visible (summary, recommendation, explanation)
- Patient profile visible (conditions, allergies)
- Symptom image displayed (if uploaded)
- Feedback form functional (submits to DB)
- After feedback: case updates live across all connected doctors

---

# 🎨 PHASE 5: ANIMATIONS & POLISH
**Time estimate: 1.5 hours**

Only build these animations — do not add more.

## `animations/variants.js` (Framer Motion)
```javascript
export const fadeSlideUp = {
  initial:  { opacity: 0, y: 16 },
  animate:  { opacity: 1, y: 0,
    transition: { type: 'spring', damping: 20, stiffness: 200 }
  },
  exit:     { opacity: 0, y: -8, transition: { duration: 0.15 } },
}

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.06,
    }
  }
}

export const cardHover = {
  rest:  { y: 0, boxShadow: 'var(--shadow-sm)' },
  hover: {
    y: -2,
    boxShadow: 'var(--shadow-md)',
    transition: { type: 'spring', damping: 15, stiffness: 300 }
  },
}

export const riskBadgePulse = {
  animate: {
    scale: [1, 1.05, 1],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
  }
}

export const toastSlide = {
  initial:  { x: 360, opacity: 0 },
  animate:  { x: 0, opacity: 1,
    transition: { type: 'spring', damping: 20, stiffness: 200 }
  },
  exit:     { x: 360, opacity: 0, transition: { duration: 0.1 } },
}

export const countUp = (from, to, duration = 0.8) => ({
  // Use with useMotionValue + useTransform
  // Counts from 0 to value on mount
})

export const feedbackStarHover = {
  rest:   { scale: 1 },
  hover:  { scale: 1.15, transition: { type: 'spring', damping: 10 } },
  tap:    { scale: 0.95 },
}
```

## `animations/gsap.timelines.js` (GSAP only for these 2 effects)

```javascript
import gsap from 'gsap'

// HIGH RISK card alert — runs once when HIGH risk card mounts
export function pulseHighRiskCard(element) {
  gsap.fromTo(
    element,
    { boxShadow: '0 0 0 0px rgba(220,38,38,0)' },
    {
      boxShadow: '0 0 0 6px rgba(220,38,38,0.3), 0 8px 32px rgba(220,38,38,0.20)',
      duration: 0.8,
      ease: 'power2.out',
      yoyo: true,
      repeat: 2,
    }
  )
}

// Header alert: brief screen edge flash when HIGH risk arrives
export function flashScreenEdge() {
  const overlay = document.createElement('div')
  overlay.style.cssText = `
    position: fixed; inset: 0;
    border: 3px solid #DC2626;
    pointer-events: none; z-index: 9999;
    border-radius: 0;
  `
  document.body.appendChild(overlay)

  gsap.fromTo(
    overlay,
    { opacity: 0.8 },
    {
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out',
      onComplete: () => document.body.removeChild(overlay),
    }
  )
}
```

## Apply animations in components:

**CaseCard.jsx:**
- Wrap with `motion.div` using `cardHover` variants
- HIGH risk cards: call `pulseHighRiskCard` on mount via `useEffect`
- List: wrap parent with `motion.div staggerContainer`

**DashboardPage.jsx:**
- Stat numbers: count-up animation on mount
- Page enter: `fadeSlideUp` with stagger

**NewCaseToast.jsx:**
- `AnimatePresence` + `toastSlide` variants
- HIGH risk: call `flashScreenEdge()` when toast appears

**CaseDetailPage.jsx:**
- Right panel slides in from right on mount
- FeedbackForm: collapses on success with `AnimatePresence`

**RiskBadge.jsx (HIGH only):**
- Continuous `riskBadgePulse` animation

### ✅ Phase 5 Output:
- Dashboard feels alive without being distracting
- HIGH risk cases visually demand attention
- Smooth page transitions
- No janky or looping animations that distract doctors

---

# 📈 PHASE 6: ANALYTICS PAGE
**Time estimate: 1 hour**

Secondary page — build after core is working.

### `features/analytics/pages/AnalyticsPage.jsx`

**Header section:**
- "Today's Overview" — 28px/700
- Date range selector (today / this week / this month)

**Hero stat:**
```
[Total Reviewed Today]
Large number (64px/700, purple)
"cases reviewed"
Count-up animation on mount
```

**Stat grid (2×2):**
```
[🔴 HIGH Risk: 3]  [✅ Reviewed: 18]
[⏱ Avg: 4.2min]  [📈 Rate: 94%]
```
Each card: white, shadow-sm, count-up animation

**Charts (all from Recharts):**

1. **Risk Distribution** (BarChart, horizontal):
   - X axis: count, Y axis: LOW / MEDIUM / HIGH
   - Each bar: risk color (green/amber/red)
   - Tooltip: count + % of total

2. **Symptom Frequency** (horizontal BarChart):
   - Top 8 symptoms this week
   - Primary purple bars
   - Animated: bars grow from 0 on mount (Recharts animationDuration)

3. **Hourly Activity** (LineChart):
   - X axis: hours (6am–10pm)
   - Y axis: number of cases
   - Purple line, area fill (low opacity purple)

4. **Feedback Rating Distribution** (RadialBarChart):
   - Stars 1-5, how many cases got each rating
   - Purple gradient

**Data source:**
- Query `triage_cases` grouped by risk_level, created_at hour
- Query `ai_feedback` grouped by rating
- No Realtime needed on this page — fetch on mount, add refresh button

### ✅ Phase 6 Output:
- Analytics page with 4 charts
- Real data from Supabase
- Counts animate on mount

---

# 🚨 PHASE 7: EDGE CASES & ERROR HANDLING
**Time estimate: 45 minutes**

These are NOT optional. Judges will test edge cases.

## States to handle everywhere:

### Empty State (No Cases)
**DashboardPage.jsx** when `cases.length === 0`:
```
Centered content:
✅ Checkmark illustration (SVG, not stock photo)
"You're all caught up!"     [28px/600]
"No pending cases right now" [15px/400, var(--text-secondary)]
[Refresh] outlined button
```

### Loading State
- Show 5 `CaseSkeleton` components on initial load
- Show in CaseDetailPage while fetching case by ID
- No full-page spinners — skeleton loading only

### Error State
- Supabase connection error → Banner at top: "Connection issue — retrying..."
- Case not found → "Case not found" with back button
- Feedback submit error → Inline error below form, button resets to active

### Realtime Disconnection
- Header `LiveDot` turns gray + "OFFLINE" text
- Detect via `channel.subscribe()` status callback
- Auto-reconnect: Supabase handles this, but show status

### No Internet
- Service Worker not needed for hackathon
- But show a top banner: "No internet connection. Cases may not update."

### Empty Analytics
- If no cases today: show "No data for today yet"
- Charts show empty state instead of broken charts

---

# 🔑 KEYBOARD SHORTCUTS (BONUS — HIGH IMPACT, LOW EFFORT)
**Time estimate: 30 minutes**

Judges LOVE this. Makes the product feel professional.

### `hooks/useKeyboardShortcut.js`
```javascript
// J → next case in list
// K → previous case in list
// Enter → open selected case
// Backspace → back to dashboard
// R → mark selected case as reviewed
// Escape → close modals / back to dashboard
// 1-5 → quick rating in feedback form
```

Add a keyboard shortcut legend:
- Small `?` icon in sidebar footer
- Click → modal showing all shortcuts
- Each shortcut: monospace key chip + description

---

# 📱 RESPONSIVENESS
**Time estimate: 30 minutes**

Web app is primarily desktop (doctors use monitors).
But mobile-responsive is still needed.

### Breakpoints:
- `>= 1200px`: Full sidebar + content layout
- `960-1199px`: Sidebar collapses to icons only (tooltips on hover)
- `< 960px`: Sidebar becomes bottom sheet / hamburger menu
- `< 640px`: Single column, hide right panel in case detail (tabs instead)

### Case Detail on mobile:
Replace left/right panel layout with tabs:
`[📋 Case] [🤖 AI Analysis] [💬 Feedback]`

---

# 🔗 API CONTRACT WITH MOBILE APP
**CRITICAL — Must match exactly. Both teams agree on this.**

### `triage_cases` INSERT from Mobile (what doctor receives):
```javascript
{
  patient_id:        "uuid",
  messages:          [
    { role: "user",      content: "I have fever...", timestamp: "ISO8601" },
    { role: "assistant", content: "How long?",       timestamp: "ISO8601" },
  ],
  symptom_image_url: "https://... or null",
  risk_level:        "HIGH" | "MEDIUM" | "LOW",
  ai_summary:        "Brief plain-language summary of patient condition",
  ai_recommendation: "What the patient should do next",
  ai_explanation:    "Why AI gave this risk level",
  ai_confidence:     87.5,
  detected_symptoms: ["fever", "headache", "body ache"],
  language:          "en" | "hi",
  status:            "pending",
  verified_by_doctor: false,
}
```

### `ai_feedback` INSERT from Web (what doctor submits):
```javascript
{
  case_id:       "uuid",
  doctor_id:     "uuid",
  rating:        4,            // 1-5
  feedback_text: "Accurate assessment...",
  risk_override: "HIGH" | null,
  doctor_note:   "Clinical assessment...",
}
```

---

# ✅ FINAL PRE-DEMO CHECKLIST

## Technical:
```
□ Supabase Realtime is enabled on triage_cases table
□ RLS policies are correct (doctors can read/update cases)
□ Edge Functions are deployed (not just local)
□ .env.local is set, never committed
□ No console errors in production build
□ npm run build completes without errors
□ All 3 risk levels display correctly (test with mock inserts)
□ Feedback submits and updates case status correctly
□ Realtime: insert a row in Supabase → verify dashboard updates
□ Keyboard shortcuts all working
□ Empty states all display correctly
```

## Demo Flow (Practice this 5 times):
```
1. Open web app → Doctor logs in (10 seconds)
2. Dashboard shows 3-5 pre-seeded cases
3. HIGH risk case is visible at top with red glow
4. Simulate mobile: insert a new HIGH case in Supabase
   → Toast slides in, sound plays, case appears at top
5. Click the HIGH risk case
6. Show: full transcript, patient profile, AI analysis
7. Submit feedback: 4 stars + clinical note
8. Go back → case shows "Reviewed" badge
9. Open Analytics → show charts
10. Total demo: under 3 minutes
```

## What to say to judges:
```
"We're not building a chatbot or a telemedicine clone.

We're building the infrastructure layer that India's 
rural healthcare system is missing — a real-time bridge 
between AI-triaged patients on mobile and doctors reviewing 
from anywhere.

When a patient in a village submits symptoms on their phone,
a doctor in a hospital sees it instantly — with AI analysis, 
confidence scores, and a full triage report.

The doctor's feedback then improves the AI's confidence 
scoring over time. It gets smarter with every review."
```

---

# 🗓️ BUILD ORDER SUMMARY

| Phase | Feature | Time | Priority |
|---|---|---|---|
| 0 | Foundation (Vite, Supabase, design tokens) | 45 min | 🔴 Must |
| 1 | Authentication (login, session, guard) | 1.5 hr | 🔴 Must |
| 2 | Dashboard UI (static, mock data) | 2.5 hr | 🔴 Must |
| 3 | Realtime integration (live cases) | 2 hr | 🔴 Must |
| 4 | Case detail + feedback form | 2 hr | 🔴 Must |
| 5 | Animations & polish | 1.5 hr | 🟡 High |
| 6 | Analytics page | 1 hr | 🟡 High |
| 7 | Edge cases & error handling | 45 min | 🟡 High |
| + | Keyboard shortcuts | 30 min | 🟢 Bonus |
| + | Full responsiveness | 30 min | 🟢 Bonus |

**Total: ~12.5 hours for full build**
**Minimum viable demo: Phases 0-4 = ~9 hours**

---

*Last updated: MediTriage AI / SKITECH INNOTHON 3.0*
*Web app spec — Doctor Dashboard*
*Companion: Mobile App spec (React Native/Expo) — separate document*