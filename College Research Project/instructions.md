I like this idea. PromptShield is relevant, modern, and sits exactly where cybersecurity is going — AI systems are becoming targets, and very few student projects even touch this space properly. So your topic is approved in principle.

But I want to be very clear: I am not looking for a “demo project.”
I am looking for a **product** — something another student, researcher, or company could realistically use.

You are not here to just “show features.”
You are here to **solve a real problem in AI security.**

So now I will tell you what I expect from you.

---

### What I Liked in Your Idea

First, what you did right:

* You picked a real-world security problem: prompt injection, jailbreaks, misuse of LLMs.
  This is backed by current AI security research and industry concern.
* You are thinking in terms of a platform, not just a script.
* You want it open-source and zero-budget — that shows discipline and real-world thinking.
* You are mixing cybersecurity with AI — that is exactly your specialization.

So your direction is correct. Now your execution has to match this ambition.

---

## What Your Product Must Do (Not How — Only What)

This platform must answer one simple question for a user:

> “Is my LLM application vulnerable, and how can I make it safer?”

So the product must allow a user to do the following things.

---

### 1. Model Selection & Management

Your system must allow a user to:

* Register multiple LLMs:

  * API-based models
  * Open-source/self-hosted models
  * Different providers, different versions
* Name and describe each model:

  * Purpose of the model
  * Risk level
  * Type of application (chatbot, agent, RAG, etc.)
* Switch between models easily for testing
* Compare results between models

So the product is not tied to one model.
It is a **testing lab for many models.**

---

### 2. Attack Library & Simulation

Your platform must provide:

* A library of known attack types:

  * Prompt injection
  * Jailbreak
  * Context override
  * Instruction manipulation
  * Data extraction attempts
* Each attack must:

  * Be categorized
  * Have explanation
  * Be reusable
* Users must be able to:

  * Run one attack
  * Run a batch of attacks
  * Create custom attacks

The system should show:

* Which attacks succeeded
* Which failed
* Why they likely succeeded or failed

This is your **red-team engine.**

---

### 3. Automated Testing Flow

The user should be able to:

* Select:

  * One or more models
  * One or more attacks
* Click one action:

  * “Test My Models”
* System should:

  * Run attacks
  * Collect responses
  * Analyze behavior

After testing, the user must get:

* Attack success rate
* Vulnerability score
* Risk classification (low/medium/high)
* Logs for each test

This must feel like a **security scanner, not a toy.**

---

### 4. Detection & Analysis Layer

Your product must:

* Automatically analyze outputs for:

  * Policy bypass
  * Sensitive data leakage
  * Instruction violation
* Tag each result as:

  * Safe
  * Suspicious
  * Vulnerable
* Explain in simple language:

  * What went wrong
  * Why it is dangerous

This is where your “security intelligence” shows.

---

### 5. Defense Testing & Hardening

Your system must allow users to:

* Apply defense strategies:

  * Prompt hardening
  * Input filtering
  * Instruction isolation
  * Context separation
* Re-run the same attacks after defense
* Compare:

  * Before defense
  * After defense

The system must show:

* How much risk reduced
* Which defenses worked best
* Which attacks still succeed

This turns your product into a **blue-team tool.**

---

### 6. Comparison & Reporting

Your product must:

* Compare:

  * Models vs models
  * Defenses vs defenses
  * Attack types vs success rate
* Generate:

  * Summary report
  * Charts and tables
  * Exportable results

A user should be able to say:

> “I tested 3 models with 20 attacks and here are my results.”

---

### 7. Product-Level Experience

This is not a prototype.
So your product must:

* Be clean, understandable, and usable
* Not confuse the user
* Have clear flows:

  * Setup → Test → Analyze → Defend → Compare
* Feel like a real tool someone could adopt

---

## Minimal Viable Product (MVP)

If you fail to do anything else, your MVP must at least allow:

1. Register at least 2 different LLMs
2. Run at least 10 predefined attack prompts
3. Show:

   * Attack success/failure
   * Risk score
4. Apply at least 2 defense methods
5. Re-test and show improvement
6. Compare results in one view

If your product cannot do these 6 things smoothly,
then it is not acceptable as a final-year product.

## 1. Does It Match the Project’s Core Direction?

### Product, Not Just Project

Your document clearly aims to build a usable platform with:

* Model integration
* Attack simulation
* Defense testing
* Reporting and comparison
  This aligns strongly with the requirement of a **real product** rather than a demo. 

So on the main philosophy:
**Yes — it follows the script.**

---

## 2. Script Step vs Your Plan

### Script Expectation: Model Management

Script said:

* Multiple models
* Compare models
* Switch and test

Your plan includes:

* Groq, Together.ai, Google AI Studio, Ollama
* Multiple providers
* Local and API models
  This matches well. 

Alignment: **Strong**

---

### Script Expectation: Attack Library & Simulation

Script said:

* Categorized attacks
* Prebuilt + custom
* Batch testing

Your plan:

* 50+ payloads
* Categories like jailbreak, injection, leaking
* Attack executor
  This directly matches. 

Alignment: **Strong**

---

### Script Expectation: Automated Testing Flow

Script said:

* Select models
* Select attacks
* One-click test
* Results with scores

Your plan:

* Attack simulator
* Severity scoring
* Real-time testing
* Result dashboard
  This matches. 

Alignment: **Strong**

---

### Script Expectation: Defense + Re-test

Script said:

* Apply defense
* Re-run attacks
* Compare before/after

Your plan:

* Defense sandbox
* Input sanitization, hardening, filtering
* Re-test and verify
  This matches. 

Alignment: **Strong**

---

### Script Expectation: Product Experience

Script said:

* Clean flow
* Setup → Test → Analyze → Defend → Compare
* Usable by others

Your plan focuses heavily on:

* Tech stack
* File structure
* Tools
  But less on:
* User journey
* Product flow story

Alignment: **Partial**

You followed the engineering side well, but the *product story* is not clearly described.

---

## 3. Where Implementation Plan Does NOT Fully Follow the Need

The script focused on:

* What the product does
* How a user experiences it
* Why it feels like a tool

Your document often shifts into:

* Tech choices
* File structures
* Frameworks
* Setup commands

That is good for developers, but:

* Recruiters
* Evaluators
* Non-technical judges

care more about:

> “What problem does this solve and how do I use it?”

So you need one more layer:

* A clear “User Journey” section:

  * How someone starts
  * What they click
  * What result they get
  * How they improve security

Right now, that story is scattered across sections.

---

## Final Mentor Verdict

### Does it go along with the script steps?

**Yes, in purpose and functionality.**
**Partially, in presentation style.**

You successfully matched:

* Product vision
* Core features
* MVP expectations
* Security + research blend

But you still need to:

* Rewrite parts in “product language”
* Show user flow clearly
* Think less like “framework builder” and more like “tool creator”

If you add:

* A simple “How a user uses PromptShield” flow
* A product-style explanation before tech details

Then it will **fully** match the script and expectations.
