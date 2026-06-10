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
- Implemented Iteration 03 chapter metadata extraction with `/chapter_metadata`, a Quick Action, strict AI JSON validation, protected metadata merge rules, interactive review UI, and approval-only frontmatter writes.
- Added physical backup creation under `.aurelius/backups/` with restore handling for failed metadata writes.
- Added reusable `ToolOutputPanel` infrastructure for non-chat workflow output.
- Added logic tests for chapter metadata validation, merge/default rules, chapter text extraction, backup path generation, workflow review creation, and tool output state.
- Refactored Iteration 03 as Iteration 03.1: slash command definitions now carry declarative workflow metadata and command name/id types are inferred from the registry.
- Refactored Quick Actions into slash command aliases/presets with inherited command display metadata.
- Added `PromptFactory`, typed prompt recipes, soul/task prompt loading, and JSON workflow prompt lint before model calls.
- Moved chapter metadata prompt files to the soul/task prompt structure and kept model output validation as the programmatic domain truth.
- Replaced runtime TypeScript stylesheet injection with modular CSS files bundled by esbuild into `styles.css`.
