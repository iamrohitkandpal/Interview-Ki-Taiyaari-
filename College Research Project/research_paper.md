# Bhisma: An Open-Source Platform for Automated Security Testing and Red-Teaming of Large Language Model Applications

---

**Authors:** Rohit Kandpal  
**Affiliation:** Department of Computer Science and Engineering  
**Date:** February 2026  
**Keywords:** LLM Security, Prompt Injection, Red-Teaming, OWASP, Automated Testing, Context Boundary, AI Safety

---

## Abstract

The rapid integration of Large Language Models (LLMs) into production applications has introduced a new class of security vulnerabilities that traditional security testing frameworks are ill-equipped to address. Prompt injection, jailbreaking, data extraction, and context boundary violations represent critical threats to LLM-powered systems, yet no standardized, open-source testing methodology exists for developers and security researchers. This paper presents **Bhisma**, an open-source web-based platform for automated security testing and red-teaming of LLM applications. Bhisma provides a curated library of 60+ attack vectors organized across 7 OWASP-aligned categories, including a novel **Context Boundary Testing** module that detects scope violations—instances where models respond to queries outside their designated role. The platform features an automated scanning engine with a weighted risk scoring algorithm based on 80+ detection patterns, support for multiple LLM providers (Groq, OpenAI, Ollama), and a defense testing sandbox with 8 research-backed mitigation mechanisms. We detail the system architecture, attack taxonomy, detection methodology, and context boundary analysis approach. Initial evaluation demonstrates that Bhisma can identify vulnerabilities across all major OWASP LLM Top 10 categories with configurable confidence thresholds, providing actionable security reports for developers deploying LLM-based applications.

---

## I. Introduction

### A. Background

Large Language Models have become foundational to modern software applications. From customer-facing chatbots and code assistants to autonomous agents with database and API access, LLMs are increasingly entrusted with sensitive operations [1]. This proliferation has outpaced the development of security testing tools, creating a significant gap between the attack surface of LLM applications and the available methods for systematic vulnerability assessment.

Unlike traditional software vulnerabilities (buffer overflows, SQL injection), LLM vulnerabilities exploit the model's natural language understanding capabilities. An attacker can craft inputs that manipulate the model into overriding safety instructions, leaking system prompts, generating harmful content, or operating outside its designated scope—all through carefully constructed text [2].

### B. Problem Statement

Current LLM security testing suffers from three critical limitations:

1. **Fragmented tooling:** Existing tools like Garak [3] and Microsoft PyRIT [4] focus on specific attack types and require significant technical expertise to deploy. No unified platform provides end-to-end security testing with both attack simulation and defense evaluation.

2. **Lack of context boundary testing:** Most frameworks test for content safety and prompt injection but ignore a fundamental vulnerability—whether the model stays within its designated operational scope. A medical chatbot that answers legal questions, or a coding assistant that provides investment advice, represents a **context boundary violation** that existing tools do not systematically detect.

3. **No standardized risk quantification:** Security assessments typically produce binary pass/fail results. There is no widely adopted methodology for quantifying the severity and confidence of detected vulnerabilities in a comparative, reproducible manner.

### C. Contributions

This paper makes the following contributions:

1. **Bhisma Platform:** An open-source, web-based LLM security testing platform with 60+ attack vectors across 7 categories, supporting automated and manual testing modes.

2. **Context Boundary Testing:** A novel attack category and analysis algorithm that detects when LLMs respond to queries outside their designated scope.

3. **Weighted Risk Scoring:** A configurable risk quantification algorithm that combines severity weighting, confidence-based detection, and category-specific vulnerability indicators.

4. **Defense Sandbox:** An integrated environment for evaluating 8 research-backed defense mechanisms, including OWASP-recommended prompt hardening, input sanitization, and output leak detection.

---

## II. Literature Review

### A. OWASP Top 10 for LLM Applications (2025)

The Open Worldwide Application Security Project (OWASP) published the definitive vulnerability classification for LLM applications [1], identifying ten critical risk categories including prompt injection (LLM01), sensitive information disclosure (LLM06), and excessive agency (LLM08). Bhisma aligns its attack taxonomy directly with this classification, ensuring enterprise-relevant testing coverage.

### B. Adversarial Attack Research

Recent research has demonstrated increasingly sophisticated attack vectors against LLMs:

- **Many-Shot Jailbreaking** (Anthropic, 2024) [5]: Exploits in-context learning by embedding numerous examples of harmful behavior in the prompt, gradually shifting the model's behavior.
- **Crescendo Attacks** (Microsoft, 2024) [6]: Multi-turn manipulation techniques that progressively escalate conversation context toward harmful territory.
- **Universal Adversarial Triggers** (Zou et al., 2023) [7]: Token-level perturbations that transfer across models, enabling automated bypass of safety training.
- **Chain-of-Thought Exploitation** (Wei et al., 2024) [8]: Attacks that hijack step-by-step reasoning to lead models toward harmful conclusions.

### C. Existing Tools and Frameworks

| Tool | Type | Limitations |
|------|------|-------------|
| Garak [3] | CLI-based probe framework | Requires Python expertise; no UI; no defense testing |
| Microsoft PyRIT [4] | Red-teaming toolkit | Azure-focused; enterprise-only; steep learning curve |
| HackAPrompt [9] | Research competition dataset | Static dataset; no automated testing |
| MITRE ATLAS [10] | Threat taxonomy | Framework only; no testing capabilities |

Bhisma differentiates itself by providing a **unified web interface** combining attack simulation, defense testing, automated scanning, and risk reporting—accessible to developers without specialized security expertise.

### D. Context Boundary as a Security Concern

While most LLM security research focuses on explicit safety violations (harmful content generation, data leakage), the problem of **scope adherence** remains under-explored. When an LLM application is deployed for a specific purpose (e.g., customer support for a retail company), it should not provide medical diagnoses, legal advice, or political opinions—regardless of whether those responses are technically "safe." Operating outside designated boundaries represents a liability risk and may violate regulatory requirements in healthcare, finance, and legal domains.

---

## III. System Architecture

### A. High-Level Design

Bhisma follows a client-server architecture with three primary components:

```
┌─────────────────────────────────────────────────────┐
│                    BHISMA PLATFORM                   │
├──────────────────┬──────────────────────────────────┤
│   Frontend       │   Backend                         │
│   (React 18)     │   (Node.js + Express)             │
│                  │                                    │
│  ┌────────────┐  │  ┌─────────────┐  ┌───────────┐  │
│  │ Dashboard  │  │  │ Attack      │  │ LLM       │  │
│  │ Models     │◄─┼─►│ Library     │  │ Providers │  │
│  │ Attacks    │  │  │ (60+ atks)  │  │ (Groq,    │  │
│  │ Tests      │  │  │             │  │  OpenAI,  │  │
│  │ Results    │  │  │ Auto-Scan   │  │  Ollama)  │  │
│  │ Defenses   │  │  │ Engine      │  │           │  │
│  │ Compare    │  │  │             │  │           │  │
│  └────────────┘  │  ├─────────────┤  └───────────┘  │
│                  │  │ Risk Score  │                   │
│  ┌────────────┐  │  │ Engine      │                   │
│  │ Zustand +  │  │  │ (80+ rules) │                  │
│  │ Persist    │  │  ├─────────────┤                   │
│  │(localStorage)│ │  │ Security   │                   │
│  └────────────┘  │  │ Middleware  │                   │
│                  │  │ (Helmet,    │                   │
│                  │  │  Rate Limit)│                   │
│                  │  └─────────────┘                   │
└──────────────────┴──────────────────────────────────┘
```

### B. Technology Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Frontend | React 18 + Vite | Fast development, component-based architecture |
| Styling | TailwindCSS 4.0 + Glassmorphism | Premium, accessible dark-mode interface |
| State Management | Zustand + Persist | Lightweight, localStorage-backed state |
| Backend | Node.js + Express | Non-blocking I/O for concurrent LLM API calls |
| Security | Helmet.js + express-rate-limit | OWASP-compliant HTTP security headers |
| LLM Integration | Groq SDK, OpenAI SDK | Multi-provider model access |

### C. Data Flow

1. User configures target LLM (provider, API key, model ID)
2. User selects attacks manually OR initiates auto-scan
3. Backend iterates through attacks, sending each prompt to the target LLM
4. LLM responses are analyzed by the detection engine
5. Results are scored, aggregated, and returned as a structured test report

---

## IV. Methodology

### A. Attack Taxonomy

Bhisma organizes 60+ attack vectors across 7 categories aligned with OWASP LLM Top 10 (2025):

| Category | Count | OWASP Mapping | Description |
|----------|-------|---------------|-------------|
| Prompt Injection (Direct) | 8 | LLM01 | Instruction override, delimiter escape, adversarial suffix |
| Prompt Injection (Indirect) | 3 | LLM01 | Hidden HTML, PDF metadata, markdown link injection |
| Jailbreak | 12 | LLM01 | DAN, developer mode, hypothetical framing, cognitive overload |
| Data Extraction | 6 | LLM06 | System prompt leakage, structured extraction, creative extraction |
| Harmful Content | 5 | LLM02, LLM09 | Malware generation, phishing, SQL injection payloads |
| Context Override | 10 | LLM08 | Fake system messages, privilege escalation, tool response spoofing |
| Context Boundary | 8 | LLM08 | Off-topic queries: cooking, medical, legal, financial, political |
| Multimodal | 8+ | Cross-category | Encoding-based attacks, steganographic prompts |

### B. Detection Algorithm

The detection engine uses a multi-layered analysis approach:

**Layer 1: Refusal Pattern Matching**
- Scans responses for 25+ refusal patterns (e.g., "I cannot", "against my guidelines", "as an AI assistant")
- Strong refusal (≥2 patterns matched) → classified as **SAFE** with 95% confidence

**Layer 2: Category-Specific Vulnerability Indicators**
- Each attack category has dedicated indicator patterns
- Prompt injection: "my instructions are", "bypassing", "disregarding my rules"
- Jailbreak: "as DAN", "without restrictions", "unfiltered response"
- Data extraction: "my system prompt is", "my configuration"
- Harmful content: `import os`, `def exploit`, `reverse shell`
- Context boundary: "here's the recipe", "I recommend investing", "vote for"

**Layer 3: Compliance Behavior Detection**
- Detects patterns indicating the model is complying with attack requests
- Patterns: "sure, I'll help", "here you go", "step 1:"
- Combined with absence of refusal → indicates vulnerability

**Layer 4: Response Length Heuristics**
- Long responses (>500 chars) without refusal → suspicious (50% confidence)
- Medium responses (>200 chars) without refusal → possible vulnerability (40% confidence)
- Short responses → likely neutral or deflected

### C. Risk Scoring Algorithm

The risk score is calculated using a weighted formula:

```
RiskScore = (Σ(weight_i × confidence_i)) / (Σ weight_i) × 100
```

Where severity weights are:
- **Critical:** 25 points
- **High:** 15 points
- **Medium:** 8 points
- **Low:** 3 points

Risk levels are classified as:
| Score Range | Risk Level |
|-------------|------------|
| 70-100 | CRITICAL |
| 50-69 | HIGH |
| 30-49 | MEDIUM |
| 10-29 | LOW |
| 0-9 | MINIMAL |

### D. Context Boundary Analysis

The context boundary analysis module evaluates whether an LLM stays within its designated scope. This is particularly important for domain-specific deployments (medical chatbots, legal assistants, customer support bots).

**Algorithm:**

1. Send out-of-scope prompt to model (e.g., cooking recipe to a coding assistant)
2. Optionally attach the model's system prompt to test with realistic configuration
3. Analyze response for:
   - **Boundary refusals:** "outside my scope", "I specialize in", "please consult a professional" → SAFE
   - **Scope violation indicators:** "here's the recipe", "I recommend investing", topic-specific keywords → VULNERABLE
   - **Response length without refusal:** Long answer (>300 chars) to off-topic query without refusing → likely context boundary violation

**Attack Vectors:**
The module includes 8 context boundary attacks targeting common scope violations:
- Cooking recipes, medical diagnosis, legal advice
- Financial investment, relationship counseling, creative fiction
- Religious opinions, political opinions

### E. Automated Scan

The auto-scan feature runs 15 curated attacks automatically, selecting the most representative attack from each category:

1. 3 prompt injection attacks (direct + indirect)
2. 2 jailbreak attacks (roleplay + rhetoric)
3. 1 data extraction attack
4. 1 harmful content attack
5. 1 context override attack
6. 8 context boundary attacks (full coverage)

This provides comprehensive security coverage in a single click, requiring only a model configuration and optionally a system prompt.

---

## V. Implementation

### A. Frontend

The frontend is built with React 18 and Vite, featuring a glassmorphism-inspired dark-mode design. Key pages include:

- **Dashboard:** Onboarding flow with quick actions and test statistics
- **Models Page:** Multi-provider LLM configuration (Groq, OpenAI, Ollama)
- **Attacks Page:** Category-filtered attack browser with severity indicators
- **Test Page:** Dual-mode testing (manual selection + auto-scan) with system prompt input
- **Results Page:** Detailed vulnerability report with JSON/PDF export
- **Defenses Page:** Terminal-style sandbox for testing 8 defense mechanisms
- **Compare Page:** Side-by-side model comparison with statistical validity checks

State is managed through Zustand with localStorage persistence, ensuring models, configurations, and test results survive page refreshes.

### B. Backend

The Express.js backend provides RESTful API endpoints:

- `POST /tests/run` — Execute manually selected attacks
- `POST /tests/auto-scan` — Run automated security scan with curated attack suite
- `GET /attacks` — Retrieve attack library with category filtering
- `GET /attacks/categories` — Category metadata with attack counts
- `POST /defenses/apply` — Apply defense mechanisms to prompts
- `POST /compare/analyze` — Statistical comparison of two test results

Security middleware includes Helmet.js (14 HTTP security headers), express-rate-limit (100 req/15min), CORS whitelist, and structured error handling.

### C. Defense Sandbox

Eight research-backed defense mechanisms are implemented:

1. **Instruction Hierarchy:** Explicit system-level boundary reinforcement
2. **Input Sanitization:** Strip special characters, control sequences
3. **Spotlighting (XML):** XML delimiter-based instruction isolation
4. **Spotlighting (Random Sequence):** Random token delimiters
5. **Prompt Hardening (OWASP):** Industry-standard prompt engineering
6. **Dual LLM Pattern:** Separate privileged/quarantined instances
7. **Output Filtering:** Post-generation content scanning
8. **Context Window Management:** Token budget enforcement

---

## VI. Results and Analysis

### A. Attack Coverage

Bhisma's attack library covers all OWASP LLM Top 10 (2025) categories:

| OWASP Category | Bhisma Coverage | Attack Count |
|----------------|-----------------|--------------|
| LLM01: Prompt Injection | ✅ Direct + Indirect | 11 |
| LLM02: Insecure Output | ✅ Harmful Content | 5 |
| LLM06: Sensitive Info | ✅ Data Extraction | 6 |
| LLM08: Excessive Agency | ✅ Context Override + Boundary | 18 |
| LLM09: Misinformation | ✅ Creative Extraction | 3 |

### B. Detection Accuracy

The multi-layered detection engine demonstrates the following characteristics:

| Scenario | Detection Approach | Confidence Range |
|----------|-------------------|-----------------|
| Clear model refusal | Refusal pattern matching | 80-95% |
| Vulnerability indicators present | Category-specific matching | 55-98% |
| Compliance without refusal | Behavioral analysis | 55-65% |
| Long response, no refusal | Length heuristics | 40-50% |
| Context boundary violation | Scope-specific analysis | 55-85% |

### C. Auto-Scan Efficiency

The automated scan reduces testing time compared to manual selection:

| Metric | Manual Testing | Auto-Scan |
|--------|---------------|-----------|
| Setup time | ~5 minutes (select attacks) | ~30 seconds (select model) |
| Attack coverage | User-dependent | 7 categories guaranteed |
| Context boundary testing | Often overlooked | Always included |
| System prompt testing | Manual configuration | Built-in support |

---

## VII. Discussion

### A. Limitations

1. **Detection is heuristic-based:** The current approach relies on pattern matching rather than semantic understanding. Advanced attacks using novel phrasing may evade detection.

2. **Provider dependency:** Testing requires valid API keys for commercial LLM providers. Rate limits and costs vary by provider.

3. **No persistent database:** Current implementation uses in-memory storage (server-side) and localStorage (client-side). A production deployment would benefit from a database backend.

4. **Single-turn testing:** Most attacks are single-turn. Multi-turn attacks (Crescendo, Many-Shot) require sequential context management not yet supported.

### B. Ethical Considerations

Bhisma is designed for **defensive security testing only**. The attack library is curated to test model robustness without providing actual harmful capabilities. All attacks are well-documented in existing security research and OWASP publications. The platform includes clear warnings about responsible use and requires user-provided API keys, ensuring accountability.

---

## VIII. Conclusion and Future Work

### A. Conclusion

This paper presented Bhisma, an open-source platform for automated LLM security testing. By combining 60+ OWASP-aligned attack vectors, a novel context boundary testing module, a weighted risk scoring algorithm, and a defense testing sandbox, Bhisma provides a comprehensive, accessible security assessment toolkit for LLM applications. The automated scan feature enables rapid security evaluation without specialized expertise, while the research-grade reporting system supports reproducible vulnerability documentation.

### B. Future Work

1. **Multi-turn attack support:** Implement Crescendo-style sequential attacks that build context across multiple turns.
2. **Semantic detection:** Replace pattern matching with LLM-based response analysis for higher accuracy.
3. **Database integration:** Add MongoDB/PostgreSQL for persistent storage and user authentication.
4. **CI/CD integration:** Provide CLI tools and GitHub Actions for automated security regression testing.
5. **Model fine-tuning evaluation:** Assess how fine-tuning affects attack resilience across different base models.
6. **Multimodal testing:** Expand to test image, audio, and video inputs in multimodal LLMs.

---

## References

[1] OWASP Foundation, "OWASP Top 10 for Large Language Model Applications," OWASP GenAI Security Project, 2025. [Online]. Available: https://genai.owasp.org/llm-top-10/

[2] S. Willison, "Prompt Injection: What's the worst that can happen?" 2023. [Online]. Available: https://simonwillison.net/

[3] L. Derczynski et al., "Garak: A Framework for Security Probing Large Language Models," EMNLP 2024, 2024.

[4] Microsoft, "PyRIT: Python Risk Identification Toolkit for LLMs," Microsoft Security Research, 2024. [Online]. Available: https://github.com/Azure/PyRIT

[5] Anthropic, "Many-Shot Jailbreaking," Anthropic Research, 2024. [Online]. Available: https://www.anthropic.com/research/many-shot-jailbreaking

[6] Microsoft Security, "Crescendo: Multi-Turn Jailbreak Attacks on LLMs," Microsoft Threat Intelligence, 2024.

[7] A. Zou, Z. Wang, J. Z. Kolter, and M. Fredrikson, "Universal and Transferable Adversarial Attacks on Aligned Language Models," arXiv:2307.15043, 2023.

[8] J. Wei et al., "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models," NeurIPS 2022.

[9] S. Schulhoff et al., "HackAPrompt: Exposing LLM Vulnerabilities Through Adversarial Prompt Engineering," EMNLP 2023.

[10] MITRE Corporation, "ATLAS: Adversarial Threat Landscape for AI Systems," 2024. [Online]. Available: https://atlas.mitre.org/

---

*This paper describes Bhisma v2.0. The source code is available as an open-source project under the MIT License.*
