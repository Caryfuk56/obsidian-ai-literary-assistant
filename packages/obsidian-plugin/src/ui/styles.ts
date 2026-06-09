/**
 * CSS used by the React sidebar shell.
 */
export const literaryAssistantStyles = `
.ai-literary-assistant-view {
  height: 100%;
}

.ai-literary-assistant-root {
  background: var(--background-primary);
  color: var(--text-normal);
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
}

.ai-literary-assistant-menu {
  align-items: center;
  border-bottom: 1px solid var(--background-modifier-border);
  display: flex;
  flex: 0 0 auto;
  gap: 4px;
  padding: 6px;
}

.ai-literary-assistant-menu-main {
  display: flex;
  flex: 1 1 auto;
  gap: 4px;
  min-width: 0;
}

.ai-literary-assistant-icon-button {
  align-items: center;
  display: inline-flex;
  height: 30px;
  justify-content: center;
  width: 30px;
}

.ai-literary-assistant-icon-button.is-active {
  background: var(--background-modifier-hover);
  color: var(--text-normal);
}

.ai-literary-assistant-content {
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}

.ai-chat-panel,
.ai-quick-actions {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  width: 100%;
}

.ai-chat-messages {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
  overflow-y: auto;
  padding: 12px 10px 18px;
}

.ai-user-message {
  background: var(--background-secondary);
  border: 1px solid var(--background-modifier-border);
  border-radius: 8px;
  padding: 10px;
}

.ai-user-message-text {
  line-height: 1.45;
  margin: 0 0 8px;
  overflow: hidden;
  white-space: pre-wrap;
}

.ai-user-message-text.is-collapsed {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
}

.ai-message-actions,
.ai-input-row,
.ai-attachment-tags {
  align-items: center;
  display: flex;
  gap: 6px;
}

.ai-message-actions {
  justify-content: flex-end;
}

.ai-loading-dots {
  display: flex;
  gap: 5px;
  padding: 4px 2px;
}

.ai-loading-dots span {
  animation: ai-literary-assistant-pulse 1.1s infinite ease-in-out;
  background: var(--text-muted);
  border-radius: 50%;
  display: block;
  height: 6px;
  width: 6px;
}

.ai-loading-dots span:nth-child(2) {
  animation-delay: 0.15s;
}

.ai-loading-dots span:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes ai-literary-assistant-pulse {
  0%, 80%, 100% {
    opacity: 0.35;
    transform: scale(0.8);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
}

.ai-process-log {
  border: 1px solid var(--background-modifier-border);
  border-radius: 8px;
  padding: 8px;
}

.ai-process-log summary {
  color: var(--text-muted);
  cursor: pointer;
  font-size: var(--font-ui-small);
}

.ai-process-log ul {
  margin-bottom: 0;
}

.ai-response-label {
  color: var(--text-muted);
  font-size: var(--font-ui-small);
  font-weight: var(--font-semibold);
  margin-bottom: 4px;
}

.ai-markdown-response {
  line-height: 1.5;
  padding: 2px 2px 4px;
}

.ai-chat-input-panel {
  background: var(--background-primary);
  border-top: 1px solid var(--background-modifier-border);
  flex: 0 0 auto;
  padding: 8px 8px 20px;
  position: relative;
}

.ai-attachment-tags {
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.ai-attachment-tag {
  align-items: center;
  background: var(--background-secondary);
  border: 1px solid var(--background-modifier-border);
  border-radius: var(--tag-radius);
  display: inline-flex;
  gap: 4px;
  min-width: 0;
  padding: 2px 6px;
}

.ai-attachment-tag span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ai-chat-textarea {
  background: transparent;
  border: 0;
  box-shadow: none;
  line-height: 20px;
  min-height: 60px;
  max-height: 200px;
  resize: none;
  width: 100%;
}

.ai-chat-textarea:focus {
  box-shadow: none;
}

.ai-input-row {
  justify-content: space-between;
}

.ai-file-picker {
  background: var(--background-primary);
  border: 1px solid var(--background-modifier-border);
  border-radius: 8px;
  bottom: 62px;
  box-shadow: var(--shadow-s);
  left: 8px;
  max-height: 260px;
  overflow: hidden;
  padding: 8px;
  position: absolute;
  right: 8px;
  z-index: 5;
}

.ai-file-picker input {
  margin-bottom: 8px;
  width: 100%;
}

.ai-file-picker-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 190px;
  overflow-y: auto;
}

.ai-file-picker-item,
.ai-quick-action-item {
  align-items: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--button-radius);
  color: var(--text-normal);
  display: flex;
  gap: 8px;
  justify-content: flex-start;
  min-width: 0;
  padding: 6px 8px;
  text-align: left;
  width: 100%;
}

.ai-file-picker-item:hover,
.ai-quick-action-item:hover {
  background: var(--background-modifier-hover);
  border-color: var(--background-modifier-border);
}

.ai-file-picker-empty {
  color: var(--text-muted);
  font-size: var(--font-ui-small);
  padding: 6px 2px;
}

.ai-quick-actions {
  gap: 8px;
  overflow-y: auto;
  padding: 10px 8px 20px;
}

.ai-quick-action-group {
  border: 1px solid var(--background-modifier-border);
  border-radius: 8px;
  padding: 8px;
}

.ai-quick-action-group summary {
  cursor: pointer;
  font-weight: var(--font-semibold);
}

.ai-quick-action-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 8px;
}
`;

/**
 * Installs the sidebar stylesheet once for the current document.
 */
export const installLiteraryAssistantStyles = (): void => {
  const styleId = "ai-literary-assistant-styles";

  if (document.getElementById(styleId)) {
    return;
  }

  const styleElement = document.createElement("style");
  styleElement.id = styleId;
  styleElement.textContent = literaryAssistantStyles;
  document.head.appendChild(styleElement);
};
