import {
  testHelpMarkdownContainsAvailableCommands,
  testSlashCommandRegistryContainsHelp,
  testTestLlmBypassesDefaultTier,
  testTestLlmValidatesTierArgument
} from "./commands/__tests__/slashCommands.test";
import {
  testGenericChatUsesDefaultTier,
  testSlashCommandParsing,
  testUnknownSlashCommandHandling
} from "./chat/__tests__/ChatRouter.test";
import { testMainMenuContainsInitialViews } from "./definitions/__tests__/mainMenuItems.test";
import { testQuickActionPrefersSlashCommand } from "./definitions/__tests__/quickActions.test";
import {
  testMissingApiKeyValidation,
  testMissingOllamaEndpointValidation
} from "./llm/__tests__/llmClientFactory.test";
import {
  testCustomModelResolution,
  testRecommendedModelResolution
} from "./llm/__tests__/modelTierResolution.test";
import {
  testDefaultSettingsContainModelTiers,
  testMergeSettingsNormalizesMalformedValues,
  testMergeSettingsPreservesDefaults
} from "./settings/__tests__/defaultSettings.test";
import { testAttachmentStateAddRemove } from "./ui/__tests__/attachmentState.test";
import {
  testChatRouteResultCreatesProgrammaticMarkdown,
  testChatSubmissionCreatesUserAndLoadingMessages
} from "./ui/__tests__/chatSubmission.test";
import { testUiDoesNotImportAiSdk } from "./ui/__tests__/uiBoundary.test";

type TestCase = () => Promise<unknown>;

const toAsync = (test: () => unknown): TestCase => () => Promise.resolve().then(test);

const tests: TestCase[] = [
  toAsync(testSlashCommandRegistryContainsHelp),
  toAsync(testHelpMarkdownContainsAvailableCommands),
  testTestLlmValidatesTierArgument,
  testTestLlmBypassesDefaultTier,
  toAsync(testDefaultSettingsContainModelTiers),
  toAsync(testMergeSettingsPreservesDefaults),
  toAsync(testMergeSettingsNormalizesMalformedValues),
  toAsync(testRecommendedModelResolution),
  toAsync(testCustomModelResolution),
  toAsync(testMissingApiKeyValidation),
  toAsync(testMissingOllamaEndpointValidation),
  toAsync(testSlashCommandParsing),
  testUnknownSlashCommandHandling,
  testGenericChatUsesDefaultTier,
  toAsync(testMainMenuContainsInitialViews),
  testQuickActionPrefersSlashCommand,
  toAsync(testAttachmentStateAddRemove),
  toAsync(testChatSubmissionCreatesUserAndLoadingMessages),
  toAsync(testChatRouteResultCreatesProgrammaticMarkdown),
  toAsync(testUiDoesNotImportAiSdk)
];

const runTests = async (): Promise<void> => {
  for (const test of tests) {
    await test();
  }
};

void runTests();
