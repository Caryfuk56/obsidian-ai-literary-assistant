import {
  testHelpMarkdownContainsAvailableCommands,
  testSlashCommandRegistryContainsHelp
} from "./commands/__tests__/slashCommands.test";
import { testMainMenuContainsInitialViews } from "./definitions/__tests__/mainMenuItems.test";
import { testQuickActionPrefersSlashCommand } from "./definitions/__tests__/quickActions.test";
import { testAttachmentStateAddRemove } from "./ui/__tests__/attachmentState.test";
import { testChatSubmissionExecutesHelpSlashCommand } from "./ui/__tests__/chatSubmission.test";

type TestCase = () => Promise<unknown>;

const toAsync = (test: () => unknown): TestCase => () => Promise.resolve().then(test);

const tests: TestCase[] = [
  toAsync(testSlashCommandRegistryContainsHelp),
  toAsync(testHelpMarkdownContainsAvailableCommands),
  toAsync(testMainMenuContainsInitialViews),
  testQuickActionPrefersSlashCommand,
  toAsync(testAttachmentStateAddRemove),
  testChatSubmissionExecutesHelpSlashCommand
];

const runTests = async (): Promise<void> => {
  for (const test of tests) {
    await test();
  }
};

void runTests();
