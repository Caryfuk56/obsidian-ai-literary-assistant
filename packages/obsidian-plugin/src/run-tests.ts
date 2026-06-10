import {
  testSlashCommandDefinitionPreservesLiteralMetadata,
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
import {
  testChapterMetadataBackupPath,
  testChapterMetadataBackupCreationFailurePreventsWrite,
  testChapterMetadataBackupUsesAdapterForHiddenFolder,
  testChapterMetadataCleanupFailureDoesNotRestore,
  testChapterMetadataMergeDefaultsMissingFields,
  testChapterMetadataMergeProtectsFields,
  testChapterMetadataMergePreservesUnknownStatus,
  testChapterMetadataPrepareFrontmatterUpdatesTimestamp,
  testChapterMetadataSchemaRejectsInvalidShape,
  testChapterMetadataStructuredExtraction,
  testChapterMetadataValidation,
  testChapterMetadataWriteFailureRestoresBackup,
  testChapterMetadataWorkflowCreatesReview,
  testChapterTextExtraction
} from "./chapter-metadata/__tests__/chapterMetadata.test";
import {
  testPromptLoaderComposesPrompts,
  testPromptLoaderLoadsMarkdownPrompt,
  testPromptLoaderMissingPromptReturnsError,
  testPromptFactoryBuildsChapterTextInput,
  testPromptLintRejectsMarkdownCodeFences,
  testPromptLintRequiresOutputContract
} from "./core/__tests__/promptLoader.test";
import { testMainMenuContainsInitialViews } from "./definitions/__tests__/mainMenuItems.test";
import {
  testQuickActionMetadataFallsBackToCommand,
  testQuickActionPassesPresetArgs,
  testQuickActionPrefersSlashCommand
} from "./definitions/__tests__/quickActions.test";
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
import { testToolOutputStateSetAndClear } from "./ui/__tests__/toolOutputState.test";
import {
  testPromptFactoryDoesNotImportRuntimeBoundaries,
  testUiDoesNotImportAiSdk,
  testUiStylesUseModularCssBundle
} from "./ui/__tests__/uiBoundary.test";

type TestCase = () => Promise<unknown>;

const toAsync = (test: () => unknown): TestCase => () => Promise.resolve().then(test);

const tests: TestCase[] = [
  toAsync(testSlashCommandRegistryContainsHelp),
  toAsync(testSlashCommandDefinitionPreservesLiteralMetadata),
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
  toAsync(testChapterMetadataMergeProtectsFields),
  toAsync(testChapterMetadataMergeDefaultsMissingFields),
  toAsync(testChapterMetadataMergePreservesUnknownStatus),
  toAsync(testChapterMetadataPrepareFrontmatterUpdatesTimestamp),
  toAsync(testChapterMetadataValidation),
  toAsync(testChapterMetadataSchemaRejectsInvalidShape),
  testChapterMetadataStructuredExtraction,
  toAsync(testChapterTextExtraction),
  toAsync(testChapterMetadataBackupPath),
  testChapterMetadataBackupUsesAdapterForHiddenFolder,
  testChapterMetadataWorkflowCreatesReview,
  testChapterMetadataBackupCreationFailurePreventsWrite,
  testChapterMetadataWriteFailureRestoresBackup,
  testChapterMetadataCleanupFailureDoesNotRestore,
  toAsync(testPromptLoaderLoadsMarkdownPrompt),
  toAsync(testPromptLoaderComposesPrompts),
  toAsync(testPromptLoaderMissingPromptReturnsError),
  toAsync(testPromptFactoryBuildsChapterTextInput),
  toAsync(testPromptLintRejectsMarkdownCodeFences),
  toAsync(testPromptLintRequiresOutputContract),
  toAsync(testMainMenuContainsInitialViews),
  testQuickActionPrefersSlashCommand,
  toAsync(testQuickActionMetadataFallsBackToCommand),
  testQuickActionPassesPresetArgs,
  toAsync(testAttachmentStateAddRemove),
  toAsync(testChatSubmissionCreatesUserAndLoadingMessages),
  toAsync(testChatRouteResultCreatesProgrammaticMarkdown),
  toAsync(testToolOutputStateSetAndClear),
  toAsync(testUiDoesNotImportAiSdk),
  toAsync(testUiStylesUseModularCssBundle),
  toAsync(testPromptFactoryDoesNotImportRuntimeBoundaries)
];

const runTests = async (): Promise<void> => {
  for (const test of tests) {
    await test();
  }
};

void runTests();
