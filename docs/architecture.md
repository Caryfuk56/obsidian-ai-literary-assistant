# Architecture

This monorepo contains the Obsidian Literary Assistant plugin and shared utility packages.

## Packages

- `packages/obsidian-plugin`: Obsidian plugin entrypoint, lifecycle integration, React views, and i18n.
- `packages/core-utils`: Shared framework-agnostic utilities for future literary analysis logic.

## Obsidian Plugin UI

The plugin sidebar is owned by `LiteraryAssistantView`, which is responsible for the Obsidian `ItemView` lifecycle and React root cleanup. The mounted React shell renders plugin-level navigation definitions, the chat panel, quick actions, and file attachment UI.

Plugin-specific definitions live inside `packages/obsidian-plugin/src/definitions`. Slash commands live inside `packages/obsidian-plugin/src/commands`; `/help` is the initial command and is the source for both chat/programmatic markdown output and modal help.

Attachment state is in-memory draft UI state only. It does not persist files, read file contents, or send context to an AI provider in the current iteration.

## AI Settings and Routing

The plugin stores `AureliusSettings` with Obsidian plugin data via `plugin.loadData()` and `plugin.saveData()`. API keys are edited through a native Obsidian settings tab and are stored as plugin data, not in an encrypted OS keychain.

Model selection is organized into three tiers: `thoughtful`, `basic`, and `local`. Each tier resolves to a provider and model id through the LLM settings layer before any provider call is made.

`ChatRouter` is the boundary between React chat UI and execution. It parses slash commands, delegates registered commands to the command registry, and sends ordinary chat text to the default configured model tier. React UI components do not import AI SDK packages directly.

`LLMClientFactory` owns provider-specific AI SDK setup for OpenAI, Google Gemini, OpenRouter, and Ollama. OpenRouter and Ollama use the OpenAI-compatible AI SDK provider; Ollama has a configurable local endpoint URL, while OpenRouter uses its hosted API endpoint. The current chat adapter uses non-streaming text generation only; advanced orchestration, file-content injection, persistent chat history, tools, embeddings, and memory are intentionally out of scope.
