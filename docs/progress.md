# Progress

## 2026-06-09

- Initialized the pnpm workspace.
- Added the Obsidian plugin package.
- Added strict TypeScript and ESLint configuration.
- Added React and i18n wiring for a sidebar Hello World view.
- Added the first Literary Assistant sidebar UI foundation with Chat and Quick Actions views.
- Added plugin-level slash command registry with `/help` markdown and modal support.
- Added in-memory file attachment selection UI for vault files.
- Added logic tests for slash commands, quick action execution, menu definitions, and attachment state.
- Replaced deprecated `baseUrl` usage in the Obsidian plugin TypeScript config.
- Planned Iteration 02 in `docs/blueprints/02-ai-routing-settings.md`.
- Added AI provider settings, configurable model tiers, an AI SDK provider factory, and chat routing.
- Added `/test-llm [tier]` for provider connectivity checks while preserving `/help`.
- Replaced mocked chat startup data with an empty functional chat that routes submissions to commands or configured LLM providers.
- Added logic tests for settings defaults, model resolution, provider validation, chat routing, chat submission state, and the UI/AI SDK import boundary.
- Added OpenRouter as a configurable provider and hardened settings normalization/chat request cleanup.
