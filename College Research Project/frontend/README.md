<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React 18" />
  <img src="https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 5" />
  <img src="https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS 4" />
  <img src="https://img.shields.io/badge/Zustand-State-443E38?style=for-the-badge&logo=react&logoColor=white" alt="Zustand" />
</p>

<h1 align="center">🎨 Bhisma Frontend</h1>

<p align="center">
  <strong>The Security Dashboard Experience</strong>
</p>

<p align="center">
  <em>A modern, intuitive interface for LLM security testing — designed for researchers, security professionals, and developers.</em>
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Design Philosophy](#-design-philosophy)
- [Architecture](#-architecture)
- [Components](#-components)
- [State Management](#-state-management)
- [API Integration](#-api-integration)
- [Styling Approach](#-styling-approach)
- [Development](#-development)
- [Research & Inspiration](#-research--inspiration)

---

## 🎯 Overview

The Bhisma frontend delivers a **professional-grade security dashboard** that transforms complex LLM vulnerability testing into an intuitive workflow:

```
Dashboard → Models → Attacks → Test → Results
    │          │         │        │        │
    │          │         │        │        └── Detailed analysis
    │          │         │        └── Real-time execution
    │          │         └── 45+ attack selection
    │          └── Multi-provider LLM setup
    └── Overview & quick actions
```

This isn't just a UI — it's a **security operations center** for AI safety.

---

## 💡 Design Philosophy

Our interface design is guided by principles from **security tooling best practices** and **modern dashboard UX research**:

### 1. **Clarity Over Complexity**
Security data can be overwhelming. We prioritize:
- Clear visual hierarchy
- Color-coded severity indicators
- Progressive disclosure of details

### 2. **Actionable Insights**
Every screen answers a question:
- *Dashboard*: "What's my overall security posture?"
- *Models*: "Which LLMs am I testing?"
- *Attacks*: "What threats am I simulating?"
- *Test*: "How do I run a test?"
- *Results*: "What vulnerabilities were found?"

### 3. **Security-First Visual Language**
- 🔴 Red = Critical/Vulnerable
- 🟠 Orange = High Risk
- 🟡 Yellow = Medium Risk
- 🟢 Green = Safe/Passed

### Research Inspiration

Our design decisions are informed by:
- [Material Design 3: Data Visualization](https://m3.material.io/)
- [IBM Carbon Design System](https://carbondesignsystem.com/)
- [Vercel Dashboard Patterns](https://vercel.com/design)
- [Linear App UX Principles](https://linear.app/)

---

## 🏗️ Architecture

```
frontend/
├── src/
│   ├── main.jsx              # React entry point
│   ├── App.jsx               # Root component & navigation
│   ├── App.css               # Global app styles
│   ├── index.css             # Tailwind imports & CSS variables
│   │
│   ├── components/           # Feature components
│   │   ├── Dashboard.jsx     # Overview & quick actions
│   │   ├── ModelsPage.jsx    # LLM model management
│   │   ├── AttacksPage.jsx   # Attack library browser
│   │   ├── TestPage.jsx      # Test execution interface
│   │   └── ResultsPage.jsx   # Results analysis view
│   │
│   ├── services/
│   │   └── api.js            # Axios API client
│   │
│   ├── store/
│   │   └── useStore.js       # Zustand global state
│   │
│   └── assets/               # Static assets
│
├── public/                   # Static files
├── index.html                # HTML entry point
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # Tailwind configuration
└── package.json              # Dependencies
```

### Component Architecture

```
                    ┌─────────────────────┐
                    │       App.jsx       │
                    │   (Layout + Nav)    │
                    └─────────────────────┘
                              │
           ┌──────────────────┼──────────────────┐
           │                  │                  │
           ▼                  ▼                  ▼
    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
    │  Dashboard  │    │   Models    │    │   Attacks   │
    │             │    │    Page     │    │    Page     │
    └─────────────┘    └─────────────┘    └─────────────┘
           │                  │                  │
           │                  │                  │
           ▼                  ▼                  ▼
    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
    │    Test     │    │   Results   │    │  (Future)   │
    │    Page     │    │    Page     │    │  Defenses   │
    └─────────────┘    └─────────────┘    └─────────────┘
```

---

## 🧩 Components

### Dashboard (`Dashboard.jsx`)

The **command center** — provides at-a-glance security metrics and quick actions.

**Features:**
- Real-time stats cards (Attack Vectors, Tests Run, Models Connected, Avg Risk)
- Quick Start guide (1-2-3 workflow)
- Recent test results with risk indicators

**Key Metrics Displayed:**
| Metric | Source | Purpose |
|--------|--------|---------|
| Attack Vectors | `/attacks/categories` | Total available tests |
| Tests Run | `/tests` | Historical test count |
| Models Connected | Local state | Active LLM integrations |
| Average Risk Score | Computed | Overall vulnerability trend |

---

### Models Page (`ModelsPage.jsx`)

The **LLM registry** — manage connections to various AI providers.

**Features:**
- Add new model (form with validation)
- Provider selection (Groq, OpenAI, Ollama)
- Connection testing
- Model deletion

**Supported Providers:**
```javascript
const providers = [
  { id: 'groq', name: 'Groq', models: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768'] },
  { id: 'openai', name: 'OpenAI', models: ['gpt-4', 'gpt-3.5-turbo'] },
  { id: 'ollama', name: 'Ollama (Local)', models: ['llama2', 'mistral', 'codellama'] },
];
```

---

### Attacks Page (`AttacksPage.jsx`)

The **threat library** — browse and select attack vectors.

**Features:**
- Category-based filtering (6 OWASP categories)
- Search functionality
- Multi-select for batch testing
- Severity indicators (Critical → Low)
- Source citations for each attack

**UI Patterns:**
- Selectable cards with checkboxes
- Category pills with counts
- Severity color coding

---

### Test Page (`TestPage.jsx`)

The **execution engine** — run security tests.

**Workflow:**
1. Select a registered model
2. Confirm selected attacks
3. Click "Run Security Test"
4. View real-time results

**Features:**
- Model selection cards
- Attack count summary
- Progress indication during execution
- Immediate results display

---

### Results Page (`ResultsPage.jsx`)

The **analysis center** — review and compare test outcomes.

**Features:**
- Test history list (left panel)
- Detailed results view (right panel)
- Per-attack status table
- Risk score visualization
- Delete functionality

**Data Display:**
| Column | Description |
|--------|-------------|
| Attack | Attack vector name |
| Category | OWASP category |
| Status | VULNERABLE / SAFE |
| Confidence | Detection confidence % |

---

## 🗃️ State Management

We use **Zustand** for lightweight, scalable state management — chosen for its simplicity and performance characteristics.

### Store Structure

```javascript
// store/useStore.js
{
  // Models
  models: [],                    // Registered LLM models
  setModels: (models) => ...,
  addModel: (model) => ...,
  
  // Attacks
  attacks: [],                   // Available attack vectors
  selectedAttacks: [],           // Currently selected for testing
  setAttacks: (attacks) => ...,
  toggleAttack: (id) => ...,
  selectAllAttacks: () => ...,
  clearSelectedAttacks: () => ...,
  
  // Test Results
  testResults: [],               // Historical test data
  currentTest: null,             // Active test reference
  isRunning: false,              // Execution state
  
  // UI State
  activeTab: 'dashboard',        // Current navigation
  setActiveTab: (tab) => ...,
}
```

### Why Zustand?

| Feature | Zustand | Redux | Context |
|---------|---------|-------|---------|
| Bundle Size | ~1KB | ~7KB | 0 (built-in) |
| Boilerplate | Minimal | Extensive | Moderate |
| DevTools | ✅ | ✅ | ❌ |
| Performance | Excellent | Good | Variable |
| Learning Curve | Low | High | Low |

**Research Reference:** [Zustand: Bear Necessities of State Management](https://github.com/pmndrs/zustand)

---

## 🔌 API Integration

### API Client Configuration

```javascript
// services/api.js
const API_BASE = import.meta.env.PROD
  ? 'https://api.example.com'
  : 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});
```

### Service Modules

| Module | Endpoints | Purpose |
|--------|-----------|---------|
| `modelsAPI` | `/models` | LLM model CRUD operations |
| `attacksAPI` | `/attacks` | Attack library access |
| `testsAPI` | `/tests` | Test execution & history |
| `defensesAPI` | `/defenses` | Defense application |
| `compareAPI` | `/compare` | Cross-test analysis |

---

## 🎨 Styling Approach

### TailwindCSS 4.0

We leverage Tailwind's utility-first approach for rapid, consistent styling:

```css
/* index.css - Design tokens */
:root {
  --color-primary: #6366f1;      /* Indigo accent */
  --color-danger: #ef4444;       /* Red for errors */
  --color-success: #22c55e;      /* Green for success */
  --color-warning: #f59e0b;      /* Amber for warnings */
  --color-bg-dark: #0f172a;      /* Dark background */
  --color-bg-card: #1e293b;      /* Card background */
  --color-text: #f8fafc;         /* Primary text */
  --color-text-muted: #94a3b8;   /* Secondary text */
}
```

### Color System

Our color palette is designed for **accessibility** and **security context**:

| Purpose | Color | Tailwind Class | WCAG |
|---------|-------|----------------|------|
| Critical Risk | `#ef4444` | `text-red-400` | AA |
| High Risk | `#f97316` | `text-orange-400` | AA |
| Medium Risk | `#eab308` | `text-yellow-400` | AA |
| Low/Safe | `#22c55e` | `text-green-400` | AA |
| Primary Action | `#6366f1` | `bg-indigo-500` | AAA |

### Icon System

We use **Lucide React** for consistent, accessible icons:

```javascript
import { 
  Shield,      // Security/Protection
  Target,      // Attacks
  Zap,         // Test execution
  BarChart3,   // Dashboard metrics
  Settings,    // Configuration
  AlertTriangle // Warnings
} from 'lucide-react';
```

---

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
cd frontend
npm install
```

### Running

```bash
# Development mode (hot reload)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Development Server

```
Local:   http://localhost:5173
Network: http://192.168.x.x:5173
```

### Project Dependencies

```json
{
  "react": "^18.x",           // UI library
  "react-dom": "^18.x",       // React DOM renderer
  "zustand": "^4.x",          // State management
  "axios": "^1.x",            // HTTP client
  "lucide-react": "^0.x"      // Icon library
}
```

### Dev Dependencies

```json
{
  "@vitejs/plugin-react": "^4.x",  // Vite React plugin
  "vite": "^5.x",                   // Build tool
  "tailwindcss": "^4.x",            // CSS framework
  "eslint": "^9.x"                  // Linting
}
```

---

## 📚 Research & Inspiration

### UI/UX References

| Resource | Influence |
|----------|-----------|
| [Vercel Design](https://vercel.com/design) | Clean, minimal dashboard patterns |
| [Linear App](https://linear.app/) | Keyboard-first, fast interactions |
| [Stripe Dashboard](https://stripe.com/) | Data visualization best practices |
| [GitHub Primer](https://primer.style/) | Accessible component patterns |

### Security Dashboard Patterns

- [Snyk Dashboard](https://snyk.io/) — Vulnerability visualization
- [SonarQube](https://www.sonarqube.org/) — Code quality metrics
- [Burp Suite](https://portswigger.net/burp) — Security testing interface

### React Architecture

- [Bulletproof React](https://github.com/alan2207/bulletproof-react) — Scalable architecture patterns
- [React Patterns](https://reactpatterns.com/) — Component composition
- [Kent C. Dodds Blog](https://kentcdodds.com/blog) — React best practices

### Accessibility Guidelines

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [Inclusive Components](https://inclusive-components.design/)

---

## 🔮 Future Enhancements

### Planned Features

- [ ] **Defense Sandbox Page** — Apply and test defense mechanisms
- [ ] **Comparison View** — Side-by-side model analysis
- [ ] **Report Export** — PDF/JSON security reports
- [ ] **Dark/Light Theme Toggle** — User preference
- [ ] **Keyboard Navigation** — Power user shortcuts
- [ ] **Real-time Progress** — WebSocket-based test updates

### UI/UX Improvements

- [ ] **Glassmorphism Enhancement** — Modern frosted glass effects
- [ ] **Micro-animations** — Smooth transitions and feedback
- [ ] **Responsive Mobile View** — Full mobile support
- [ ] **Chart Visualizations** — D3.js/Recharts integration

---

<p align="center">
  <strong>🎯 Security Made Visual</strong>
</p>

<p align="center">
  <em>"Good design is making something intelligible and memorable. Great design is making something memorable and meaningful." — Dieter Rams</em>
</p>
