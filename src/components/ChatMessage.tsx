import { Bot, User, Copy, Check } from "lucide-react";
import { useState } from "react";
import type { Message } from "../lib/supabase";

interface ChatMessageProps {
  message: Message;
}

function formatContent(content: string): string {
  // Very simple markdown-like formatting for code blocks and inline code
  return content
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) =>
      `<pre class="code-block"><code class="lang-${lang || "text"}">${escapeHtml(code.trimEnd())}</code></pre>`
    )
    .replace(/`([^`]+)`/g, (_, code) => `<code class="inline-code">${escapeHtml(code)}</code>`)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br />");
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`message message--${isUser ? "user" : "assistant"}`}>
      <div className="message__avatar">
        {isUser ? <User size={18} /> : <Bot size={18} />}
      </div>
      <div className="message__body">
        <div className="message__header">
          <span className="message__role">{isUser ? "You" : "Claude"}</span>
          <button className="message__copy" onClick={handleCopy} title="Copy message">
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
        <div
          className="message__content"
          dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
        />
      </div>
    </div>
  );
}
