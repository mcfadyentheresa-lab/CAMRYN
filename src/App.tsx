import { useState, useEffect, useRef, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import ChatMessage from "./components/ChatMessage";
import ChatInput from "./components/ChatInput";
import TypingIndicator from "./components/TypingIndicator";
import WelcomeScreen from "./components/WelcomeScreen";
import {
  sendMessage,
  createConversation,
  updateConversationTitle,
  getConversations,
  getMessages,
  saveMessage,
  deleteConversation,
  generateTitle,
} from "./lib/api";
import type { Conversation, Message } from "./lib/supabase";
import "./App.css";

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getConversations().then(setConversations).catch(console.error);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const loadConversation = useCallback(async (id: string) => {
    setActiveId(id);
    setError(null);
    const msgs = await getMessages(id);
    setMessages(msgs);
  }, []);

  const handleNew = useCallback(() => {
    setActiveId(null);
    setMessages([]);
    setError(null);
    setInput("");
  }, []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setError(null);
    setLoading(true);

    try {
      let convId = activeId;

      // Create a new conversation if needed
      if (!convId) {
        const title = generateTitle(text);
        const conv = await createConversation(title);
        convId = conv.id;
        setActiveId(convId);
        setConversations((prev) => [conv, ...prev]);
      }

      // Save user message
      const userMsg = await saveMessage(convId, "user", text);
      setMessages((prev) => [...prev, userMsg]);

      // Build history for the API
      const history = [...messages, userMsg].map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      // Call Claude
      const reply = await sendMessage(history);

      // Save assistant message
      const assistantMsg = await saveMessage(convId, "assistant", reply);
      setMessages((prev) => [...prev, assistantMsg]);

      // Update conversation title if it's the first exchange
      if (messages.length === 0) {
        const newTitle = generateTitle(text);
        await updateConversationTitle(convId, newTitle);
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? { ...c, title: newTitle, updated_at: new Date().toISOString() }
              : c
          )
        );
      } else {
        // Bump updated_at order
        setConversations((prev) => {
          const conv = prev.find((c) => c.id === convId);
          if (!conv) return prev;
          return [
            { ...conv, updated_at: new Date().toISOString() },
            ...prev.filter((c) => c.id !== convId),
          ];
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [input, loading, activeId, messages]);

  const handleDelete = useCallback(async (id: string) => {
    await deleteConversation(id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) {
      setActiveId(null);
      setMessages([]);
    }
  }, [activeId]);

  const handleSuggestion = useCallback((text: string) => {
    setInput(text);
  }, []);

  const showWelcome = !activeId && messages.length === 0;

  return (
    <div className="app">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={loadConversation}
        onNew={handleNew}
        onDelete={handleDelete}
      />

      <main className="main">
        <div className="chat">
          {showWelcome ? (
            <div className="chat__scroll">
              <WelcomeScreen onSuggestion={handleSuggestion} />
            </div>
          ) : (
            <div className="chat__scroll">
              <div className="chat__messages">
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}
                {loading && <TypingIndicator />}
                {error && (
                  <div className="chat__error">
                    <span>{error}</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}

          <div className="chat__footer">
            <ChatInput
              value={input}
              onChange={setInput}
              onSend={handleSend}
              disabled={loading}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
