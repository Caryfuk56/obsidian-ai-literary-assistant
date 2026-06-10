# Architecture

This monorepo contains the Obsidian Literary Assistant plugin and shared utility packages.

## Packages

- `packages/obsidian-plugin`: Obsidian plugin entrypoint, lifecycle integration, React views, and i18n.
- `packages/core-utils`: Shared framework-agnostic utilities for future literary analysis logic.

## Obsidian Plugin UI

The plugin sidebar is owned by `LiteraryAssistantView`, which is responsible for the Obsidian `ItemView` lifecycle and React root cleanup. The mounted React shell renders plugin-level navigation definitions, the chat panel, quick actions, and file attachment UI.

Plugin-specific definitions live inside `packages/obsidian-plugin/src/definitions`. Slash commands live inside `packages/obsidian-plugin/src/commands` and are treated as declarative workflow primitives. The slash command registry is the single source of truth for command names, ids, descriptions, prompt recipes, input/output shape, and safety policy; TypeScript command name/id types are inferred from that registry.

Quick Actions are thin aliases or presets over slash commands. They may override display text for UX, but command-backed actions inherit command metadata by default and execute through the same slash command path as chat input.

Attachment state is in-memory draft UI state only. It does not persist files, read file contents, or send context to an AI provider in the current iteration.

Sidebar styling is authored as modular CSS under `packages/obsidian-plugin/src/ui/styles` and bundled by esbuild to `dist/styles.css`. The React shell does not inject a large TypeScript stylesheet at runtime.

## AI Settings and Routing

The plugin stores `AureliusSettings` with Obsidian plugin data via `plugin.loadData()` and `plugin.saveData()`. API keys are edited through a native Obsidian settings tab and are stored as plugin data, not in an encrypted OS keychain.

Model selection is organized into three tiers: `thoughtful`, `basic`, and `local`. Each tier resolves to a provider and model id through the LLM settings layer before any provider call is made.

`ChatRouter` is the boundary between React chat UI and execution. It parses slash commands, delegates registered commands to the command registry, and sends ordinary chat text to the default configured model tier. React UI components do not import AI SDK packages directly.

`LLMClientFactory` owns provider-specific AI SDK setup for OpenAI, Google Gemini, OpenRouter, and Ollama. OpenRouter and Ollama use the OpenAI-compatible AI SDK provider; Ollama has a configurable local endpoint URL, while OpenRouter uses its hosted API endpoint. The current chat adapter uses non-streaming text generation only; advanced orchestration, file-content injection, persistent chat history, tools, embeddings, and memory are intentionally out of scope.

Runtime prompt files live under `packages/obsidian-plugin/src/core/ai/prompts`. `PromptFactory` is the pure boundary that loads declared soul and task prompts, composes them in stable order, runs prompt lint for JSON/data-agent workflows, and combines them with runtime user input. It does not call models, import Obsidian APIs, validate model responses, or write files.

Provider JSON mode is treated as transport guidance only. LLM output remains untrusted input. Domain validators and normalizers own application truth before data reaches UI or write services.

## Chapter Metadata Workflow

Chapter metadata extraction is owned by `packages/obsidian-plugin/src/chapter-metadata`. The `/chapter_metadata` slash command and the matching Quick Action share the same command registry path. The workflow operates only on the active Markdown file, removes leading YAML frontmatter from the prompt text, calls the configured default model tier with a dedicated runtime prompt from `src/core/ai/prompts`, validates strict JSON, and returns interactive review state.

AI suggestions are never written directly. `ToolOutputPanel` renders reusable workflow output in the sidebar, including `MetadataReviewForm`. The author must approve the pending metadata before any vault write occurs. Approved writes use `app.fileManager.processFrontMatter`, update `metadata_updated`, preserve unrelated frontmatter keys, and do not modify chapter body text.

Before frontmatter modification, the plugin creates a physical backup in `.aurelius/backups/`. Successful writes verify the file can be read and then delete the backup. Failed writes attempt to restore the original content from backup. Crash recovery for leftover backup files is deferred.

The chapter metadata contract stores linked entities as plain Obsidian wiki-link strings only. This iteration does not create linked entity files, validate target existence, maintain an entity registry, compile manuscripts, add review comments, or rewrite chapters.
