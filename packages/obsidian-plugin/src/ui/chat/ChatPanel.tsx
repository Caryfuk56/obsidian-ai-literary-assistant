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

import { ObsidianIcon } from "../ObsidianIcon";
import { MarkdownBlock } from "../MarkdownBlock";
import { VaultFilePicker } from "../files/VaultFilePicker";
import { addAttachedFile, removeAttachedFile, type AttachedFile } from "./attachmentState";
import { createMockChatMessages, type ChatMessage } from "./chatState";
import {
  CHAT_TEXTAREA_MAX_ROWS,
  CHAT_TEXTAREA_MIN_ROWS,
  CHAT_TEXTAREA_ROW_HEIGHT,
  resolveChatSubmission
} from "./chatSubmission";

/**
 * Chat panel containing mock messages, programmatic outputs, and draft input state.
 */
export const ChatPanel = ({
  app,
  programmaticMarkdown
}: {
  readonly app: App;
  readonly programmaticMarkdown: readonly string[];
}): ReactElement => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>(() => createMockChatMessages(t));
  const [draft, setDraft] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setMessages((currentMessages) => currentMessages.map((message) => (
        message.type === "process-log"
          ? {
            ...message,
            collapsed: true
          }
          : message
      )));
    }, 1400);

    return () => {
      window.clearTimeout(timeoutId);
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
    const result = await resolveChatSubmission({
      attachedFiles,
      attachmentOnlyMessage: t("chat.input.attachmentOnlyMessage"),
      content: draft,
      context: {
        app,
        showModal: false,
        t
      },
      id: `message-${String(Date.now())}`
    });

    if (result.messages.length > 0) {
      setMessages((currentMessages) => [...currentMessages, ...result.messages]);
    }

    if (result.clearDraft) {
      setDraft("");
      setAttachedFiles([]);
      setIsPickerOpen(false);
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
