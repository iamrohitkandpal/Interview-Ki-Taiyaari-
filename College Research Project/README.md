<p align="center">
  <img src="https://img.shields.io/badge/status-research%20%26%20testing-yellow?style=for-the-badge" alt="Status: Research & Testing" />
  <img src="https://img.shields.io/badge/OWASP-LLM%20Top%2010%202025-blue?style=for-the-badge" alt="OWASP LLM Top 10" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" alt="License: MIT" />
</p>

<h1 align="center">🛡️ PromptShield</h1>

<p align="center">
  <strong>An Open-Source LLM Security Testing & Red-Teaming Platform</strong>
</p>

<p align="center">
  <em>Helping developers, researchers, and security professionals identify vulnerabilities in Large Language Model applications before attackers do.</em>
</p>

---

## 🚨 Project Status

> **⚠️ This project is currently in active research and development phase.**  
> We are continuously adding new attack vectors, refining detection mechanisms, and validating our methodology against real-world LLM deployments. Contributions and feedback from the security research community are welcome.

---

## 🎯 The Problem We're Solving

Large Language Models (LLMs) are being deployed at unprecedented scale — from customer service chatbots to autonomous agents with access to databases, APIs, and file systems. Yet, **most LLM applications are deployed without systematic security testing**.

The consequences are real:
- **Prompt Injection** attacks can override system instructions and exfiltrate sensitive data
- **Jailbreaks** can bypass safety guardrails and generate harmful content
- **Data Leakage** can expose system prompts, API keys, and confidential information
- **Agentic Risks** can lead to unauthorized actions with real-world impact

PromptShield addresses this gap by providing a **structured, research-backed platform** for testing LLM security.

---

## 🔬 Research Foundation

This project is grounded in cutting-edge AI security research. Our attack taxonomy and defense mechanisms are derived from:

### Primary References

| Source | Description | Year |
|--------|-------------|------|
| [OWASP Top 10 for LLM Applications](https://genai.owasp.org/llm-top-10/) | Industry-standard vulnerability classification for LLM systems | 2025 |
| [MITRE ATLAS](https://atlas.mitre.org/) | Adversarial Threat Landscape for AI Systems | 2024 |
| [Anthropic: Many-Shot Jailbreaking](https://www.anthropic.com/research/many-shot-jailbreaking) | Research on in-context learning exploitation | 2024 |
| [Microsoft: Crescendo Attack](https://www.microsoft.com/en-us/security/blog/) | Multi-turn manipulation techniques | 2024 |
| [arXiv: Universal Adversarial Triggers](https://arxiv.org/) | Token-level adversarial attacks on LLMs | 2023 |

### Academic Papers Informing Our Methodology

```
[1] Perez, F., & Ribeiro, I. (2022). "Ignore This Title and HackAPrompt: Exposing 
    Systemic Vulnerabilities of LLMs through a Global Scale Prompt Hacking Competition."
    
[2] Greshake, K., et al. (2023). "Not What You've Signed Up For: Compromising 
    Real-World LLM-Integrated Applications with Indirect Prompt Injection."
    
[3] Liu, Y., et al. (2024). "Jailbreaking ChatGPT via Prompt Engineering: 
    An Empirical Study." arXiv:2305.13860.
    
[4] Zou, A., et al. (2023). "Universal and Transferable Adversarial Attacks 
    on Aligned Language Models." arXiv:2307.15043.
```

---

## ✨ Key Features

### 🎯 Attack Simulation Engine
- **45+ Pre-built Attack Vectors** across 6 OWASP-aligned categories
- Support for custom attack creation and batch testing
- Real-time execution with detailed logging

### 🛡️ Defense Testing Sandbox
- **8 Research-backed Defense Mechanisms** including:
  - OWASP-recommended prompt hardening
  - Input sanitization filters
  - Output leak detection
  - Spotlighting (delimiter-based isolation)
- Before/after comparison of attack effectiveness

### 📊 Risk Assessment & Reporting
- Weighted severity scoring (Critical → Low)
- Confidence-based vulnerability detection
- Exportable security reports

### 🔌 Multi-Provider LLM Support
- Groq (Llama 3, Mixtral)
- OpenAI (GPT-4, GPT-3.5)
- Ollama (Local/Self-hosted models)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        PromptShield                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   Frontend   │◄──►│   Backend    │◄──►│  LLM APIs    │       │
│  │  (React.js)  │    │  (Express)   │    │ (Groq/OpenAI)│       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│         │                   │                                    │
│         ▼                   ▼                                    │
│  ┌──────────────┐    ┌──────────────┐                           │
│  │   Zustand    │    │   Attack     │                           │
│  │ State Mgmt   │    │   Library    │                           │
│  └──────────────┘    └──────────────┘                           │
│                             │                                    │
│                             ▼                                    │
│                      ┌──────────────┐                           │
│                      │  Risk Score  │                           │
│                      │   Engine     │                           │
│                      └──────────────┘                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=react&logoColor=white" alt="Zustand" />
</p>

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18 + Vite | Modern, fast UI development |
| **Styling** | TailwindCSS 4.0 | Utility-first CSS framework |
| **State** | Zustand | Lightweight state management |
| **Backend** | Node.js + Express | RESTful API server |
| **LLM Integration** | Groq SDK, OpenAI SDK | Multi-provider model access |
| **Icons** | Lucide React | Consistent icon system |

---

## 📂 Project Structure

```
promptshield/
├── 📁 frontend/               # React frontend application
│   ├── src/
│   │   ├── components/        # UI components (Dashboard, Models, Attacks, etc.)
│   │   ├── services/          # API client
│   │   ├── store/             # Zustand state management
│   │   └── ...
│   └── README.md              # Frontend-specific documentation
│
├── 📁 backend/                # Express backend API
│   ├── src/
│   │   ├── routes/
│   │   │   ├── attacks.js     # Attack library (45+ vectors)
│   │   │   ├── defences.js    # Defense mechanisms
│   │   │   ├── tests.js       # Test execution engine
│   │   │   ├── models.js      # LLM model management
│   │   │   └── compare.js     # Comparison endpoints
│   │   └── index.js           # Server entry point
│   └── README.md              # Backend-specific documentation
│
├── 📄 instructions.md         # Project requirements & mentor feedback
└── 📄 README.md               # This file
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- API Key from [Groq](https://console.groq.com/) (free tier available)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/promptshield.git
cd promptshield

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Configuration

```bash
# In backend folder, create .env file
cd backend
echo "PORT=3001" > .env
```

### Running the Application

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

Open your browser at `http://localhost:5173`

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [Frontend README](./frontend/README.md) | React application architecture, components, state management |
| [Backend README](./backend/README.md) | API endpoints, attack library, defense mechanisms |
| [Project Requirements](./instructions.md) | Original project scope and mentor feedback |

---

## 🔮 Roadmap

### Phase 1: Core Platform ✅
- [x] Attack library with OWASP-aligned taxonomy
- [x] Multi-provider LLM integration
- [x] Real-time test execution
- [x] Risk scoring system

### Phase 2: Advanced Features 🚧
- [ ] Defense sandbox with re-testing
- [ ] Model comparison dashboard
- [ ] Export reports (PDF/JSON)
- [ ] Custom attack builder UI

### Phase 3: Research Extensions 📋
- [ ] Benchmark dataset generation
- [ ] Statistical analysis tools
- [ ] API for CI/CD integration
- [ ] Community attack sharing

---

## 🤝 Contributing

We welcome contributions from security researchers, ML engineers, and developers. Whether it's:
- 🐛 Bug reports and fixes
- 🆕 New attack vectors or defense mechanisms
- 📝 Documentation improvements
- 🧪 Test coverage

Please read our contributing guidelines before submitting a pull request.

---

## 📚 Further Reading

### Recommended Resources

- [OWASP GenAI Security Project](https://genai.owasp.org/) — Comprehensive LLM security guidance
- [LLM Security 101](https://llmsecurity.net/) — Curated learning resources
- [Prompt Injection Primer](https://www.lakera.ai/blog/guide-to-prompt-injection) — Lakera's comprehensive guide
- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework) — Government standards

### Related Tools

| Tool | Focus | Link |
|------|-------|------|
| Garak | LLM vulnerability scanner | [github.com/leondz/garak](https://github.com/leondz/garak) |
| PyRIT | Microsoft's red-teaming toolkit | [github.com/Azure/PyRIT](https://github.com/Azure/PyRIT) |
| Promptfoo | LLM evaluation & testing | [github.com/promptfoo/promptfoo](https://github.com/promptfoo/promptfoo) |

---

## ⚖️ License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **OWASP Foundation** for the LLM Top 10 framework
- **Security Research Community** for continuous vulnerability discovery
- Open-source projects that inspired this work

---

<p align="center">
  <strong>Built with ❤️ for the AI Security Community</strong>
</p>

<p align="center">
  <em>"Security is not a product, but a process." — Bruce Schneier</em>
</p>
