# Architecture

This monorepo contains the Obsidian Literary Assistant plugin and shared utility packages.

## Packages

- `packages/obsidian-plugin`: Obsidian plugin entrypoint, lifecycle integration, React views, and i18n.
- `packages/core-utils`: Shared framework-agnostic utilities for future literary analysis logic.

## Obsidian Plugin UI

The plugin sidebar is owned by `LiteraryAssistantView`, which is responsible for the Obsidian `ItemView` lifecycle and React root cleanup. The mounted React shell renders plugin-level navigation definitions, the chat panel, quick actions, and file attachment UI.

Plugin-specific definitions live inside `packages/obsidian-plugin/src/definitions`. Slash commands live inside `packages/obsidian-plugin/src/commands`; `/help` is the initial command and is the source for both chat/programmatic markdown output and modal help.

Attachment state is in-memory draft UI state only. It does not persist files, read file contents, or send context to an AI provider in the current iteration.
