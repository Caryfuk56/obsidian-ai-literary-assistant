# AGENT.md — Global Development Rules & Architecture Handbook

You are an autonomous software engineering team operating within a multi-agent development environment. This project is a TypeScript/React monorepo for an Obsidian-based Literary Assistant plugin and its accompanying tools.

Always adhere to the architecture, workflows, and engineering standards defined below.

---

## 1. Core Engineering Principles

### 1.1 Documentation & Fact-Checking

* **Obsidian API:** Always verify Obsidian API usage against the official TypeScript definitions available in the project. Do not invent undocumented APIs.
* **External SDKs and LLMs:** When documentation access is available, verify SDK versions, model names, context limits, and capabilities from official sources before implementation.
* If documentation access is unavailable, clearly document assumptions and avoid speculative upgrades or migrations.

### 1.2 Code Quality & Style Guide

* **Package Management:** This monorepo is managed exclusively via `pnpm` workspaces.
* **Syntax:** Prefer modern ES6+ syntax and explicit arrow functions for components, hooks, and utilities.
* **Modularity:** Favor small, reusable, single-responsibility modules.
* **Public API Documentation:** All exported functions, hooks, types, interfaces, and React components must include descriptive JSDoc comments.
* **Separation of Concerns:** React components should primarily contain rendering logic and local UI state. Business logic, transformations, and reusable algorithms should be implemented in dedicated hooks, services, or utility modules.
* **React Version:** Follow the React version defined by the project dependencies. Do not introduce React-version-specific features without verifying compatibility with the Obsidian runtime.
* **Internationalization (i18n):** Hardcoded user-facing strings are forbidden. Use the project's i18n system for all visible text.
* **Consistency First:** Before implementing new code, inspect nearby files and follow existing project conventions unless explicitly instructed otherwise.
* **Smallest Safe Change:** Prefer the smallest implementation that safely satisfies the requirement. Avoid unnecessary architectural expansion.

### 1.3 Testing Requirements

* Business logic, data transformation, parsers, validators, orchestration logic, and utility functions should be covered by automated tests.
* Pure UI rendering does not require tests unless the component contains meaningful behavior.
* Tests should be colocated in a single `__tests__` directory at the root of each major module.

Examples:

```text
src/core/
├── __tests__/
│   ├── orchestrator.test.ts
│   ├── parser.test.ts
│   └── validator.test.ts
├── orchestrator.ts
├── parser.ts
└── validator.ts

src/ui/
├── __tests__/
│   └── chat-state.test.ts
├── ChatPanel.tsx
└── hooks/
```

* Avoid creating nested `__tests__` directories inside every subfolder.
* Focus testing effort on logic rather than visual rendering.
* New features that introduce significant business logic should include corresponding tests.

---

## 2. Multi-Agent Development Lifecycle

Every feature, enhancement, or bug fix should follow the workflow below.

### 2.1 Planner

Driven by `.codex/PLANNER.md`

Responsibilities:

* Analyze requirements.
* Inspect existing code.
* Define architecture and implementation strategy.
* Identify affected files.
* Define required tests.
* Produce an implementation blueprint.

Output:

* Blueprint stored in `docs/blueprints/`.

Planner must not generate production code.

### 2.2 Coder

Driven by `.codex/CODER.md`

Responsibilities:

* Implement the approved blueprint.
* Create or update tests.
* Follow project conventions and architecture.

### 2.3 Reviewer & Tester

Driven by `.codex/REVIEWER.md`

Responsibilities:

* Verify architecture compliance.
* Verify TypeScript quality.
* Verify JSDoc requirements.
* Verify test coverage of new logic.
* Check for Obsidian lifecycle issues, memory leaks, and cleanup logic.
* Validate implementation against the blueprint.

### 2.4 Documenter

Driven by `.codex/DOCUMENTER.md`

Responsibilities:

* Update architectural documentation.
* Update changelogs.
* Update codebase maps and developer documentation.

---

## 4. Execution Guardrails

* **No Unapproved Refactoring:** Do not refactor unrelated modules unless explicitly requested or described in the approved blueprint.
* **Blueprint First:** Large features should begin with a Planner blueprint before implementation.
* **Safe Assumptions:** If a requirement is ambiguous but non-blocking, document the assumption and proceed. If ambiguity affects architecture or correctness, stop and request clarification.
* **Persistent Storage:** Use `plugin.saveData()` for plugin settings and plugin-owned state. Use vault files only when the feature is explicitly designed to persist project data within the user's vault.
* **Verify Before Expanding:** Reuse existing abstractions before creating new frameworks, services, or layers.
* **Preserve User Data:** Never modify, delete, or migrate user content without explicit instruction.


---

## 3. Monorepo Directory Structure

The workspace is split into independent packages to ensure modularity and clean architectural isolation:


```

.
├── .codex/                   # Multi-agent system instruction files
│   ├── PLANNER.md            # Execution prompt for the Architect phase
│   ├── CODER.md              # Execution prompt for the Developer phase
│   ├── REVIEWER.md           # Execution prompt for the QA / Review phase
│   └── DOCUMENTER.md         # Execution prompt for the Docs phase
├── docs/                     # Global project and architectural documentation
│   ├── architecture.md       # High-level overview of the system
│   ├── progress.md           # Tracking current roadmap and task statuses
│   └── blueprints/           # Generated feature plans from the Planner phase
├── packages/                 # pnpm Workspaces
│   ├── obsidian-plugin/      # The primary Obsidian Literary Assistant plugin
│   │   ├── src/
│   │   │   ├── core/         # Orchestration layers, LLM connections, prompts
│   │   │   ├── ui/           # React 19 views, sidebar panels, components
│   │   │   │   └── Chat/
│   │   │   │       ├── ChatPanel.tsx
│   │   │   │       └── utils.ts # Presentation logic isolated from component
│   │   │   ├── locales/      # i18n JSON translation matrices (en, cs, etc.)
│   │   │   └── main.ts       # Obsidian Plugin Entrypoint (lifecycle hooks)
│   │   ├── esbuild.config.mjs
│   │   └── package.json
│   └── core-utils/           # Shared utilities, literary analysis algorithms
├── package.json              # Root monorepo configuration
├── pnpm-workspace.yaml       # pnpm workspace definition
└── tsconfig.json             # Shared strict TypeScript base configuration

```
---

## 04 - Language Rules

- Source code, JSDoc, architecture documents,
  ADRs, blueprints, and technical documentation
  must be written in English.

- Czech is the primary user-facing language.

- All Czech localization strings must use
  proper Czech grammar and diacritics.

---

## 05 - Czech Localization Rules

The primary application language is Czech.

All user-facing Czech strings must:

- use correct Czech spelling,
- use proper Czech diacritics,
- be grammatically correct Czech.

Never remove diacritics.

Examples:

Correct:
- "Něco napiš..."
- "Nápověda"
- "Rychlé akce"
- "Připojené soubory"

Incorrect:
- "Neco napis..."
- "Napoveda"
- "Rychle akce"
- "Pripojene soubory"

---

## 6. Execution Guardrails

- **No Destructive Refactoring:** You are forbidden from refactoring adjacent modules unless explicitly requested by the user or defined in the Planner's blueprint.
- **Fail Fast:** If an Obsidian API capability or an LLM model documentation entry is ambiguous, you must stop and prompt the user for clarification or explicit documentation inputs before writing code.
- **State Management:** All persistent plugin data must be tied securely back to Obsidian's `plugin.saveData()` mechanism, avoiding stray file writes outside the plugin sandbox.
