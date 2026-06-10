import type {
  SlashCommandContext,
  SlashCommandExecutionInput,
  SlashCommandName,
  SlashCommandResult
} from "./slashCommandTypes";
import { slashCommands } from "./slashCommands";

/**
 * Executes a registered slash command and safely ignores unknown command names.
 */
export const executeSlashCommand = async (
  commandName: SlashCommandName,
  context: SlashCommandContext,
  input: SlashCommandExecutionInput = {
    args: "",
    rawInput: commandName
  }
): Promise<SlashCommandResult | undefined> => {
  const command = slashCommands[commandName];
  const commandContext = "promptRecipe" in command
    ? {
      ...context,
      commandDefinition: {
        promptRecipe: command.promptRecipe
      }
    }
    : context;

  return command.execute(commandContext, input);
};
