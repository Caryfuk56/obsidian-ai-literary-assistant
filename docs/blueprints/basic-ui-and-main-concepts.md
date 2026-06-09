# Basic UI and Main Concepts Blueprint

## Architectural Overview

This feature creates the first usable UI foundation for the Obsidian Literary Assistant plugin. It replaces the current `HelloWorldPanel` sidebar placeholder with a narrow-sidebar friendly React application shell containing top navigation, chat UI, quick actions, file attachment state, mocked chat messages, and one programmatic slash command: `/help`.

The feature integrates with the existing architecture as follows:

- `packages/obsidian-plugin` owns all Obsidian-specific behavior, React UI, i18n keys, slash command definitions, quick action definitions, menu definitions, file listing from the vault, and modal rendering.
- `packages/core-utils` is not affected. The requested slash command registry depends on plugin i18n and Obsidian UI behavior, so it must remain inside `packages/obsidian-plugin`.
- Existing i18n wiring in `packages/obsidian-plugin/src/locales/i18n.ts` and the `I18nextProvider` in `LiteraryAssistantView` should be reused.
- Existing Obsidian view lifecycle ownership in `packages/obsidian-plugin/src/ui/LiteraryAssistantView.tsx` should be preserved.
- The current `HelloWorldPanel` can be replaced by a new plugin sidebar component. It may remain unused or be removed in the implementation if no project convention requires retaining placeholders.

Affected packages:

- `packages/obsidian-plugin`

Unaffected packages:

- `packages/core-utils`

Architectural assumptions:

- The UI should be implemented with React 19, matching the package dependency.
- Obsidian UI integration should use APIs from the installed `obsidian` package. The Coder must verify `Menu`, `Modal`, `MarkdownRenderer`, and file APIs against local TypeScript definitions before implementation.
- No persistent storage is required for this iteration. Attachment state and mock chat messages are in-memory view state only.
- Tests can use Node-focused unit tests for pure logic. Because no test runner is currently configured, the implementation should add a minimal test setup before adding required tests.

Reused systems and abstractions:

- `LiteraryAssistantView` for Obsidian ItemView lifecycle and React root mounting.
- `react-i18next` for UI translation.
- Existing locale JSON files in `src/locales`.
- Obsidian CSS variables and native classes where practical.

## Data Models & TypeScript Interfaces

The implementation should finalize these contracts in plugin-level modules.

Suggested new files:

- `packages/obsidian-plugin/src/commands/slashCommands.ts`
- `packages/obsidian-plugin/src/commands/helpCommand.ts`
- `packages/obsidian-plugin/src/commands/executeSlashCommand.ts`
- `packages/obsidian-plugin/src/definitions/mainMenuItems.ts`
- `packages/obsidian-plugin/src/definitions/overflowMenuItems.ts`
- `packages/obsidian-plugin/src/definitions/quickActions.ts`
- `packages/obsidian-plugin/src/ui/AppShell.tsx`
- `packages/obsidian-plugin/src/ui/chat/ChatPanel.tsx`
- `packages/obsidian-plugin/src/ui/chat/chatState.ts`
- `packages/obsidian-plugin/src/ui/chat/attachmentState.ts`
- `packages/obsidian-plugin/src/ui/quick-actions/QuickActionsView.tsx`
- `packages/obsidian-plugin/src/ui/files/VaultFilePicker.tsx`
- `packages/obsidian-plugin/src/ui/help/HelpModal.ts`
- `packages/obsidian-plugin/src/ui/styles.css` or an equivalent package-local stylesheet if the existing build supports CSS imports.

If the current build does not support CSS imports, the Coder should adapt by adding a plugin stylesheet emitted to `dist/styles.css` using the existing build convention, or by updating the build minimally.

Illustrative contracts:

```ts
export type SlashCommandId = "help";
export type SlashCommandName = "/help";

export interface SlashCommandContext {
  app: App;
  t: TFunction;
  showModal?: boolean;
}

export interface SlashCommandResult {
  kind: "markdown";
  markdown: string;
}

export interface SlashCommandDefinition {
  id: SlashCommandId;
  name: SlashCommandName;
  nameKey: string;
  descriptionKey: string;
  execute: (context: SlashCommandContext) => Promise<SlashCommandResult | void> | SlashCommandResult | void;
}
```

The slash command registry should use a typed constant shape:

```ts
export const slashCommands = {
  "/help": {
    id: "help",
    name: "/help",
    nameKey: "slashCommands.help.name",
    descriptionKey: "slashCommands.help.description",
    execute: executeHelpCommand
  }
} as const;
```

Main navigation contract:

```ts
export type MainViewId = "chat" | "quickActions";

export interface MainMenuItem {
  id: string;
  nameKey: string;
  descriptionKey: string;
  icon: string;
  view: MainViewId;
}
```

Quick action contract:

```ts
export interface QuickActionItem {
  id: string;
  nameKey: string;
  descriptionKey: string;
  icon: string;
  slashCommand?: SlashCommandName;
  command?: () => void | Promise<void>;
}

export interface QuickActionGroup {
  id: string;
  nameKey: string;
  openByDefault: boolean;
  items: QuickActionItem[];
}
```

Chat and attachment contracts:

```ts
export interface AttachedFile {
  path: string;
  name: string;
}

export type ChatMessage =
  | { id: string; type: "user"; content: string; attachments: AttachedFile[] }
  | { id: string; type: "ai-loading" }
  | { id: string; type: "process-log"; entries: string[]; collapsed: boolean }
  | { id: string; type: "ai-response"; markdown: string }
  | { id: string; type: "programmatic-markdown"; markdown: string };
```

No persistence format changes are required.

## Step-by-Step Implementation Checklist

### Architecture

- [ ] Verify installed Obsidian TypeScript definitions for `Menu`, `Modal`, `MarkdownRenderer`, `TFile`, `Vault#getFiles`, and icon helpers.
- [ ] Add or confirm a package-level styling path for plugin UI styles.
- [ ] Replace the `HelloWorldPanel` render in `LiteraryAssistantView` with a new `AppShell` component.
- [ ] Pass required Obsidian dependencies into React from `LiteraryAssistantView`, at minimum `app`, and optionally the plugin instance if needed for Obsidian helper APIs.
- [ ] Keep `LiteraryAssistantView` responsible only for ItemView lifecycle, React root creation, provider setup, and cleanup.

### Slash Commands

- [ ] Create `src/commands/helpCommand.ts` with `executeHelpCommand` and `generateHelpMarkdown`.
- [ ] Create `src/commands/slashCommands.ts` as the central registry and source of truth.
- [ ] Create `src/commands/executeSlashCommand.ts` for safe lookup and execution.
- [ ] Ensure command definitions contain i18n keys, not translated display strings.
- [ ] Implement `/help` with `showModal: true` support through an Obsidian modal and `showModal: false` support returning markdown.
- [ ] Add JSDoc to exported command functions, types, and registry helpers.

### Main Menu and Overflow Menu

- [ ] Create `src/definitions/mainMenuItems.ts` with initial `chat` and `quickActions` views.
- [ ] Create `src/definitions/overflowMenuItems.ts` with a minimal typed structure for future overflow actions.
- [ ] Render main view buttons by looping over `mainMenuItems`.
- [ ] Use Obsidian-compatible icon rendering for button icons after verifying the local API.
- [ ] Use translated name or description for tooltips and accessible labels.
- [ ] Highlight the active view with Obsidian-native style variables/classes.
- [ ] Implement the vertical three-dot overflow button using Obsidian `Menu`.

### App Shell and Content Area

- [ ] Create `src/ui/AppShell.tsx` to own active main view state.
- [ ] Render selected content from `mainMenuItems` view IDs.
- [ ] Ensure the content area is scroll-safe and works in a narrow sidebar.
- [ ] Add bottom spacing for Obsidian status/info area using CSS variables or conservative padding.

### Chat UI

- [ ] Create `src/ui/chat/ChatPanel.tsx`.
- [ ] Create mock chat message data that includes user message, loading indicator, process log, AI response, and programmatic markdown response.
- [ ] Create presentational subcomponents as needed, keeping them small and package-local.
- [ ] Render user messages in highlighted panels with collapsed long text, expand/collapse control, and copy button.
- [ ] Render animated AI loading dots.
- [ ] Render process logs in an accordion that collapses after mocked processing completes.
- [ ] Render AI response markdown introduced by translated or configured assistant name `Aurelius`.
- [ ] Render programmatic markdown without the `Aurelius` label.
- [ ] Use Obsidian markdown rendering APIs for markdown if practical inside React; otherwise isolate markdown rendering in a component with explicit cleanup behavior.

### Input and Attachments

- [ ] Create `src/ui/chat/attachmentState.ts` with pure add/remove helpers for attached files.
- [ ] Create a draft input area component containing attached file tags, textarea, and bottom action row.
- [ ] Use i18n for placeholder text, including Czech `Něco napiš...` in `cs.json`.
- [ ] Support `Alt + Enter` submit.
- [ ] Add a `+` attach button that opens a file picker popover/panel.
- [ ] Create `src/ui/files/VaultFilePicker.tsx` using `app.vault.getFiles()` and `TFile` metadata.
- [ ] Implement search filtering over available vault files.
- [ ] Implement click-to-attach behavior and duplicate-safe attachment state.
- [ ] Implement remove buttons for attached file tags.
- [ ] Keep attachments in draft state only; do not send them to AI or persist them.

### Quick Actions

- [ ] Create `src/definitions/quickActions.ts` with a `general` group and `help` item.
- [ ] Create `src/ui/quick-actions/QuickActionsView.tsx`.
- [ ] Render groups as accordions with initial state controlled by `openByDefault`.
- [ ] Render items as vertical buttons with icon and translated name.
- [ ] Implement execution logic so `slashCommand` takes precedence over custom `command`.
- [ ] Disable or safely ignore items that have neither `slashCommand` nor `command`.
- [ ] Wire Help quick action to execute `/help` and display returned markdown in the chat programmatic response area, or route back to chat with the response if the UX requires visible output.

### Internationalization

- [ ] Add translation keys to `packages/obsidian-plugin/src/locales/en.json`.
- [ ] Add translation keys to `packages/obsidian-plugin/src/locales/cs.json`.
- [ ] Include keys for main menu names/descriptions.
- [ ] Include keys for overflow menu item names/descriptions.
- [ ] Include keys for slash command names/descriptions and generated help headings.
- [ ] Include keys for quick action groups/items.
- [ ] Include keys for chat labels, buttons, aria labels, placeholder text, copy, expand/collapse, attach, send, remove attachment, search, empty states, and process log.
- [ ] Ensure all user-facing text in React and command output comes from i18n.

### Testing

- [ ] Add a minimal test runner setup to the root workspace if none exists.
- [ ] Add test scripts at root and/or package level consistent with pnpm workspace conventions.
- [ ] Create `packages/obsidian-plugin/src/commands/__tests__/slashCommands.test.ts`.
- [ ] Test that the slash command registry contains `/help`.
- [ ] Test that `/help` generated markdown contains available command names and descriptions.
- [ ] Create `packages/obsidian-plugin/src/definitions/__tests__/mainMenuItems.test.ts`.
- [ ] Test that menu definitions contain required initial views.
- [ ] Create `packages/obsidian-plugin/src/definitions/__tests__/quickActions.test.ts` or a logic-level executor test.
- [ ] Test that quick action execution resolves `slashCommand` before custom `command`.
- [ ] Create `packages/obsidian-plugin/src/ui/__tests__/attachmentState.test.ts` or place this in a root `__tests__` under the relevant module.
- [ ] Test add/remove attachment behavior, duplicate handling, and missing-path removal.

### Documentation

- [ ] Add JSDoc to all exported functions, hooks, React components, types, and interfaces.
- [ ] Update `docs/architecture.md` to mention plugin-level UI definitions and slash command registry.
- [ ] Update `docs/progress.md` after implementation.
- [ ] Document any implementation deviation from this blueprint during Coder or Reviewer phases.

## Test Strategy

### Unit Tests

Slash command registry:

- Verify `/help` exists in `slashCommands`.
- Verify command metadata uses expected i18n keys.
- Verify registry lookup rejects or safely handles unknown commands.

Help command generation:

- Verify generated markdown includes a heading, available slash commands, each command name, and each command description.
- Verify generation uses the provided translation function and does not hardcode translated strings in command definitions.
- Verify `showModal: false` returns markdown.
- Modal behavior can be unit tested through a thin adapter or left to integration/manual verification if Obsidian DOM APIs are difficult to mock.

Quick action execution:

- Verify a quick action with both `slashCommand` and `command` executes the slash command path first.
- Verify an action with only `command` executes the custom command.
- Verify an action with neither execution path is disabled or ignored safely.

Attachment state:

- Verify adding a file creates an attached file entry.
- Verify adding the same path twice does not duplicate it.
- Verify removing an attached file by path removes only that file.
- Verify removing an unknown path leaves state unchanged.

Main menu definitions:

- Verify required views `chat` and `quickActions` exist.
- Verify required metadata keys exist for names, descriptions, icons, and view IDs.

### Integration Tests

- Verify `AppShell` can switch active view state between Chat and Quick Actions through handler-level tests if UI test tooling is added.
- Verify Quick Actions can execute `/help` and produce a programmatic markdown response through shared execution logic.
- Verify file picker maps Obsidian `TFile` objects to `AttachedFile` draft state through a mock file list.

### Edge Cases

- Empty vault file list should show a translated empty state.
- Search with no matches should show a translated empty state.
- Long user input should remain collapsed by default and expand on user action.
- Very narrow sidebar widths should keep buttons icon-only and avoid text overflow.
- Programmatic markdown should render without assistant label.
- Unknown slash command should fail safely with a translated message or no-op behavior, depending on chosen command executor contract.

### Error Scenarios

- Markdown rendering failures should not crash the whole sidebar; render plain text fallback or an error boundary if introduced locally.
- Clipboard copy failure should be handled with a translated notice or silent fallback.
- Obsidian `getRightLeaf(false)` can return `null`; existing behavior already handles this and should remain unchanged.
- File listing should tolerate an empty or unavailable vault list in tests through dependency injection.

## Documentation Impact

Affected documentation:

- `docs/architecture.md`: add the UI shell, plugin-level definition files, slash command registry, and attachment-state boundaries.
- `docs/progress.md`: record implementation completion, test setup, and known out-of-scope items.
- `README.md`: optional short update only if the implementation changes how to run, build, test, or open the plugin.

No new user-facing docs are required for this iteration because the UI is still foundational and mock-based.

## Architectural Decision Record (ADR)

ADR required: No.

Reasoning:

This feature follows constraints already stated in the task and `AGENT.md`: plugin-specific commands and UI definitions stay inside `packages/obsidian-plugin`, while `core-utils` remains framework-agnostic. It does not introduce persistence, external AI providers, prompt orchestration, or cross-package API changes.

If implementation uncovers a need to add a larger UI state framework, persistent command architecture, or shared plugin API, the Coder should stop and return for architectural review before proceeding.

## Impact Analysis

Skills:

- No Codex skill changes required.

Workflows:

- Adds a Planner-approved implementation path for the Coder and Reviewer phases.
- Adds expected test execution to the development workflow once a test runner is configured.

Bootstrap Context:

- No bootstrap context changes required.

Validation:

- Adds logic-level validation through unit tests for command registry, quick action execution, attachments, and menu definitions.

Settings:

- No settings impact. Settings screen remains out of scope.

Project Structure:

- Expands `packages/obsidian-plugin/src` with `commands`, `definitions`, and feature-oriented UI folders.
- Does not alter workspace boundaries.

Prompts:

- No prompt or AI orchestration impact. Real AI provider integration remains out of scope.

UI:

- Replaces the placeholder sidebar with a real app shell, chat panel, quick actions view, input panel, and file picker.
- Must use Obsidian-native styling variables and narrow-sidebar responsive behavior.

Storage:

- No persistent storage. All chat, process log, draft, and attachment state is in memory.

Testing Infrastructure:

- Current root/package scripts do not include tests. The Coder should add a minimal test runner and scripts before adding required tests.

Documentation:

- Architecture and progress docs should be updated after implementation.

