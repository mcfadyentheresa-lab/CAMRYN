import { Bot } from "lucide-react";

export default function TypingIndicator() {
  return (
    <div className="message message--assistant">
      <div className="message__avatar">
        <Bot size={18} />
      </div>
      <div className="message__body">
        <div className="message__header">
          <span className="message__role">Claude</span>
        </div>
        <div className="typing-indicator">
          <span className="typing-indicator__dot" />
          <span className="typing-indicator__dot" />
          <span className="typing-indicator__dot" />
        </div>
      </div>
    </div>
  );
}
