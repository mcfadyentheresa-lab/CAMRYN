import { Bot, Zap, Code, BookOpen, Lightbulb } from "lucide-react";

const SUGGESTIONS = [
  { icon: <Code size={18} />, text: "Explain how async/await works in JavaScript" },
  { icon: <BookOpen size={18} />, text: "Summarize the key ideas of stoicism" },
  { icon: <Zap size={18} />, text: "Write a Python script to parse a CSV file" },
  { icon: <Lightbulb size={18} />, text: "Give me 5 ideas for a weekend project" },
];

interface WelcomeScreenProps {
  onSuggestion: (text: string) => void;
}

export default function WelcomeScreen({ onSuggestion }: WelcomeScreenProps) {
  return (
    <div className="welcome">
      <div className="welcome__icon">
        <Bot size={48} />
      </div>
      <h1 className="welcome__title">How can I help you today?</h1>
      <p className="welcome__subtitle">
        Start a conversation with Claude — ask anything, explore ideas, or get help with a task.
      </p>
      <div className="welcome__suggestions">
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            className="welcome__suggestion"
            onClick={() => onSuggestion(s.text)}
          >
            <span className="welcome__suggestion-icon">{s.icon}</span>
            <span>{s.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
