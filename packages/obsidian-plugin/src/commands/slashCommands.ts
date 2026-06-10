import { executeChapterMetadataCommand } from "./chapterMetadataCommand";
import { defineSlashCommand } from "./commandDefinitionTypes";
import { executeHelpCommand } from "./helpCommand";
import { executeTestLlmCommand } from "./testLlmCommand";
import type { SlashCommandContext } from "./slashCommandTypes";

/**
 * Central plugin-level registry for all available slash commands.
 */
export const slashCommands = {
  "/chapter_metadata": defineSlashCommand({
    descriptionKey: "slashCommands.chapterMetadata.description",
    execute: executeChapterMetadataCommand,
    id: "chapter-metadata",
    input: {
      source: "active-markdown-file"
    },
    name: "/chapter_metadata",
    nameKey: "slashCommands.chapterMetadata.name",
    output: {
      kind: "tool-output",
      renderer: "chapter-metadata-review"
    },
    promptRecipe: {
      outputMode: "json",
      souls: ["Archivist"],
      tasks: ["chapter-metadata"]
    },
    safety: {
      backupBeforeWrite: true,
      requiresApproval: true
    }
  }),
  "/help": defineSlashCommand({
    descriptionKey: "slashCommands.help.description",
    execute: (context: SlashCommandContext) => executeHelpCommand(context),
    id: "help",
    input: {
      source: "none"
    },
    name: "/help",
    nameKey: "slashCommands.help.name",
    output: {
      kind: "markdown"
    }
  }),
  "/test-llm": defineSlashCommand({
    descriptionKey: "slashCommands.testLlm.description",
    execute: executeTestLlmCommand,
    id: "test-llm",
    input: {
      source: "chat-input"
    },
    name: "/test-llm",
    nameKey: "slashCommands.testLlm.name",
    output: {
      kind: "markdown"
    }
  })
} as const;

/**
 * Slash command names currently registered by the plugin.
 */
export type RegisteredSlashCommandName = keyof typeof slashCommands;
