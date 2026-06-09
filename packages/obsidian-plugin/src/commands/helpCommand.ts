import type { TFunction } from "i18next";

import type { SlashCommandContext, SlashCommandDefinition, SlashCommandResult } from "./slashCommandTypes";

/**
 * Creates translated markdown documentation for the registered slash commands.
 */
export const generateHelpMarkdown = (
  commands: Readonly<Record<string, Pick<SlashCommandDefinition, "descriptionKey" | "name" | "nameKey">>>,
  t: TFunction
): string => {
  const commandLines = Object.values(commands).map((command) => {
    const name = t(command.nameKey);
    const description = t(command.descriptionKey);

    return `- \`${command.name}\` - **${name}**: ${description}`;
  });

  return [
    `## ${t("slashCommands.help.markdownTitle")}`,
    "",
    t("slashCommands.help.markdownIntro"),
    "",
    ...commandLines
  ].join("\n");
};

/**
 * Executes the `/help` slash command as markdown or an Obsidian modal.
 */
export const executeHelpCommand = async (
  context: SlashCommandContext
): Promise<SlashCommandResult | undefined> => {
  const { slashCommands } = await import("./slashCommands");
  const markdown = generateHelpMarkdown(slashCommands, context.t);

  if (context.showModal === true) {
    const { openHelpModal } = await import("../ui/help/HelpModal");
    openHelpModal(context.app, markdown);
    return undefined;
  }

  return {
    kind: "markdown",
    markdown
  };
};
