import type { App } from "obsidian";
import {
  type KeyboardEvent,
  type ReactElement,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { useTranslation } from "react-i18next";

import { ChatRouter } from "../../chat/ChatRouter";
import type LiteraryAssistantPlugin from "../../main";
import { ObsidianIcon } from "../ObsidianIcon";
import { MarkdownBlock } from "../MarkdownBlock";
import { VaultFilePicker } from "../files/VaultFilePicker";
import { addAttachedFile, removeAttachedFile, type AttachedFile } from "./attachmentState";
import type { ChatMessage } from "./chatState";
import {
  CHAT_TEXTAREA_MAX_ROWS,
  CHAT_TEXTAREA_MIN_ROWS,
  CHAT_TEXTAREA_ROW_HEIGHT,
  chatRouteResultToMessage,
  resolveChatSubmission
} from "./chatSubmission";

/**
 * Chat panel containing mock messages, programmatic outputs, and draft input state.
 */
export const ChatPanel = ({
  app,
  plugin,
  programmaticMarkdown
}: {
  readonly app: App;
  readonly plugin: LiteraryAssistantPlugin;
  readonly programmaticMarkdown: readonly string[];
}): ReactElement => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const isMountedRef = useRef(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const displayMessages = useMemo<ChatMessage[]>(
    () => [
      ...messages,
      ...programmaticMarkdown.map((markdown, index) => ({
        id: `programmatic-${String(index)}`,
        markdown,
        type: "programmatic-markdown" as const
      }))
    ],
    [messages, programmaticMarkdown]
  );

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    const minHeight = CHAT_TEXTAREA_MIN_ROWS * CHAT_TEXTAREA_ROW_HEIGHT;
    const maxHeight = CHAT_TEXTAREA_MAX_ROWS * CHAT_TEXTAREA_ROW_HEIGHT;
    textarea.style.height = `${String(minHeight)}px`;
    textarea.style.height = `${String(Math.min(textarea.scrollHeight, maxHeight))}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [draft]);

  const submitDraft = async (): Promise<void> => {
    if (isSubmitting) {
      return;
    }

    const messageId = `message-${String(Date.now())}`;
    const result = resolveChatSubmission({
      attachedFiles,
      attachmentOnlyMessage: t("chat.input.attachmentOnlyMessage"),
      content: draft,
      id: messageId
    });

    if (result.messages.length > 0) {
      setMessages((currentMessages) => [...currentMessages, ...result.messages]);
    }

    if (result.clearDraft) {
      setDraft("");
      setAttachedFiles([]);
      setIsPickerOpen(false);
    }

    if (!result.inputForRouter) {
      return;
    }

    setIsSubmitting(true);

    try {
      const router = new ChatRouter({
        app,
        settings: plugin.settings,
        t
      });
      const routeResult = await router.route(result.inputForRouter);

      if (!isMountedRef.current) {
        return;
      }

      const responseMessage = chatRouteResultToMessage(routeResult, `${messageId}-response`);
      setMessages((currentMessages) => [
        ...currentMessages.filter((message) => message.id !== `${messageId}-loading`),
        responseMessage
      ]);
    } catch {
      if (!isMountedRef.current) {
        return;
      }

      const responseMessage = chatRouteResultToMessage({
        kind: "error-markdown",
        message: t("chat.errors.genericLlmFailure")
      }, `${messageId}-response`);
      setMessages((currentMessages) => [
        ...currentMessages.filter((message) => message.id !== `${messageId}-loading`),
        responseMessage
      ]);
    } finally {
      if (isMountedRef.current) {
        setIsSubmitting(false);
      }
    }
  };

  const handleTextareaKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (event.altKey && (event.key === "Enter" || event.code === "Enter")) {
      event.preventDefault();
      void submitDraft();
    }
  };

  return (
    <section aria-label={t("chat.ariaLabel")} className="ai-chat-panel">
      <div className="ai-chat-messages">
        {displayMessages.map((message) => (
          <ChatMessageItem app={app} key={message.id} message={message} />
        ))}
      </div>
      <div className="ai-chat-input-panel">
        {attachedFiles.length > 0 && (
          <div className="ai-attachment-tags">
            {attachedFiles.map((file) => (
              <span className="ai-attachment-tag" key={file.path}>
                <span>{file.name}</span>
                <button
                  aria-label={t("chat.attachments.removeLabel", { name: file.name })}
                  className="clickable-icon"
                  onClick={() => {
                    setAttachedFiles((currentFiles) => removeAttachedFile(currentFiles, file.path));
                  }}
                  type="button"
                >
                  <ObsidianIcon icon="x" />
                </button>
              </span>
            ))}
          </div>
        )}
        <textarea
          aria-label={t("chat.input.label")}
          className="ai-chat-textarea"
          onChange={(event) => {
            setDraft(event.target.value);
          }}
          onKeyDown={handleTextareaKeyDown}
          placeholder={t("chat.input.placeholder")}
          ref={textareaRef}
          rows={3}
          value={draft}
        />
        <div className="ai-input-row">
          <button
            aria-label={t("chat.attachments.attachLabel")}
            className="clickable-icon ai-literary-assistant-icon-button"
            onClick={() => {
              setIsPickerOpen((currentValue) => !currentValue);
            }}
            type="button"
          >
            <ObsidianIcon icon="plus" />
          </button>
          <button
            aria-label={t("chat.input.sendLabel")}
            className="clickable-icon ai-literary-assistant-icon-button"
            onClick={() => {
              void submitDraft();
            }}
            disabled={isSubmitting}
            type="button"
          >
            <ObsidianIcon icon="send" />
          </button>
        </div>
        {isPickerOpen && (
          <VaultFilePicker
            app={app}
            onAttach={(file) => {
              setAttachedFiles((currentFiles) => addAttachedFile(currentFiles, file));
              setIsPickerOpen(false);
            }}
          />
        )}
      </div>
    </section>
  );
};

const ChatMessageItem = ({
  app,
  message
}: {
  readonly app: App;
  readonly message: ChatMessage;
}): ReactElement => {
  switch (message.type) {
    case "user":
      return <UserMessage message={message} />;
    case "ai-loading":
      return <LoadingMessage />;
    case "process-log":
      return <ProcessLog message={message} />;
    case "ai-response":
      return <AiResponse app={app} markdown={message.markdown} />;
    case "programmatic-markdown":
      return <MarkdownBlock app={app} markdown={message.markdown} />;
    case "error":
      return <MarkdownBlock app={app} markdown={message.markdown} />;
  }
};

const UserMessage = ({
  message
}: {
  readonly message: Extract<ChatMessage, { type: "user" }>;
}): ReactElement => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <article className="ai-user-message">
      <p className={`ai-user-message-text${isExpanded ? "" : " is-collapsed"}`}>{message.content}</p>
      {message.attachments.length > 0 && (
        <div className="ai-attachment-tags">
          {message.attachments.map((file) => (
            <span className="ai-attachment-tag" key={file.path}>{file.name}</span>
          ))}
        </div>
      )}
      <div className="ai-message-actions">
        <button
          className="clickable-icon"
          aria-label={isExpanded ? t("chat.messages.collapse") : t("chat.messages.expand")}
          onClick={() => {
            setIsExpanded((currentValue) => !currentValue);
          }}
          type="button"
        >
          <ObsidianIcon icon={isExpanded ? "chevrons-up" : "chevrons-down"} />
        </button>
        <button
          aria-label={t("chat.messages.copy")}
          className="clickable-icon"
          onClick={() => {
            void navigator.clipboard.writeText(message.content);
          }}
          type="button"
        >
          <ObsidianIcon icon="copy" />
        </button>
      </div>
    </article>
  );
};

const LoadingMessage = (): ReactElement => {
  const { t } = useTranslation();

  return (
    <div aria-label={t("chat.messages.loading")} className="ai-loading-dots">
      <span />
      <span />
      <span />
    </div>
  );
};

const ProcessLog = ({
  message
}: {
  readonly message: Extract<ChatMessage, { type: "process-log" }>;
}): ReactElement => {
  const { t } = useTranslation();

  return (
    <details className="ai-process-log" open={!message.collapsed}>
      <summary>{t("chat.processLog.title")}</summary>
      <ul>
        {message.entries.map((entry) => (
          <li key={entry}>{entry}</li>
        ))}
      </ul>
    </details>
  );
};

const AiResponse = ({
  app,
  markdown
}: {
  readonly app: App;
  readonly markdown: string;
}): ReactElement => {
  const { t } = useTranslation();

  return (
    <article>
      <div className="ai-response-label">{t("chat.messages.assistantName")}</div>
      <MarkdownBlock app={app} markdown={markdown} />
    </article>
  );
};
