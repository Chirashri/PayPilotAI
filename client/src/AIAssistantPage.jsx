
import { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Send,
  Bot,
  User,
  LoaderCircle,
  RotateCcw,
  TrendingUp,
  Receipt,
  Wallet,
  Clock,
  Copy,
  Check,
  RefreshCw
} from "lucide-react";

import { askFinancialAI } from "./services/api";
import ReactMarkdown from "react-markdown";

function AIAssistantPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! 👋 I'm PayPilot AI, your personal financial assistant.\n\nI can help you understand your revenue, track pending payments, analyse invoices and explore your financial performance.\n\nWhat would you like to know today?"
    }
  ]);

  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);

  // AUTOMATIC CHAT SCROLLING
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end"
    });
  }, [messages, loading]);

  const suggestions = [
    {
      icon: TrendingUp,
      text: "How much revenue have I generated?"
    },
    {
      icon: Receipt,
      text: "How many invoices are pending?"
    },
    {
      icon: Wallet,
      text: "Show my overdue payments."
    },
    {
      icon: Clock,
      text: "Summarize my payment history."
    }
  ];

  // SEND MESSAGE TO PAYPILOT AI
  const handleSend = async (customQuestion) => {
    const userQuestion = (
      customQuestion || question
    ).trim();

    if (!userQuestion || loading) return;

    const conversationHistory = messages.slice(-20).map(
      ({ role, content }) => ({
        role,
        content
      })
    );

    setError("");
    setQuestion("");

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        content: userQuestion
      }
    ]);

    setLoading(true);

    try {
      const response = await askFinancialAI(
        userQuestion,
        conversationHistory
      );

      if (!response.success || !response.answer) {
        throw new Error(
          response.message || "Unable to get an AI response."
        );
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: response.answer
        }
      ]);

    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // COPY AI RESPONSE
  const handleCopy = async (content, index) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIndex(index);

      setTimeout(() => {
        setCopiedIndex((current) =>
          current === index ? null : current
        );
      }, 2000);

    } catch (err) {
      setError("Unable to copy the response. Please try again.");
    }
  };

  // REGENERATE AI RESPONSE
  const handleRegenerate = async (assistantIndex) => {
    if (loading) return;

    // Find the user question before this AI response
    let userIndex = assistantIndex - 1;

    while (
      userIndex >= 0 &&
      messages[userIndex].role !== "user"
    ) {
      userIndex--;
    }

    if (userIndex < 0) return;

    const originalQuestion = messages[userIndex].content;

    // Only include conversation before the original question
    const conversationHistory = messages
      .slice(Math.max(0, userIndex - 20), userIndex)
      .map(({ role, content }) => ({
        role,
        content
      }));

    setError("");
    setLoading(true);

    try {
      const response = await askFinancialAI(
        originalQuestion,
        conversationHistory
      );

      if (!response.success || !response.answer) {
        throw new Error(
          response.message || "Unable to regenerate the response."
        );
      }

      // Replace the old response with the new response
      setMessages((previous) =>
        previous.map((message, index) =>
          index === assistantIndex
            ? {
                ...message,
                content: response.answer
              }
            : message
        )
      );

    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // ERROR HANDLING
  const getErrorMessage = (err) => {
    const status = err.response?.status;

    if (status === 429) {
      return "Gemini request limit reached. Please wait and try again later.";
    }

    if (status === 503) {
      return "Gemini is temporarily experiencing high demand. Please try again later.";
    }

    if (status === 403) {
      return "Gemini API access is currently unavailable. Please check your API access and quota.";
    }

    if (!err.response) {
      return "Cannot connect to PayPilot AI server. Please check your backend.";
    }

    return err.message || "Something went wrong. Please try again.";
  };

  // START NEW CONVERSATION
  const handleReset = () => {
    if (loading) return;

    setMessages([
      {
        role: "assistant",
        content:
          "Hello again! 👋 I'm PayPilot AI. What would you like to know today?"
      }
    ]);

    setError("");
    setQuestion("");
    setCopiedIndex(null);
  };

  return (
    <div className="ai-assistant-page">

      {/* AI HEADER */}
      <div className="ai-header">
        <div className="ai-title-section">
          <div className="ai-icon">
            <Sparkles size={25} />
          </div>

          <div>
            <h2>PayPilot AI Assistant</h2>
            <p>Your intelligent financial companion</p>
          </div>
        </div>

        <button
          className="ai-reset-btn"
          onClick={handleReset}
          disabled={loading}
        >
          <RotateCcw size={16} />
          New Chat
        </button>
      </div>

      {/* AI STATUS */}
      <div className="ai-status">
        <span className="ai-status-dot"></span>
        Gemini AI connected
        <span className="ai-status-divider">•</span>
        Financial data enabled
      </div>

      {/* CHAT CONTAINER */}
      <div className="ai-chat-container">
        <div className="ai-messages">

          {/* CHAT MESSAGES */}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`ai-message ${
                message.role === "user"
                  ? "user-message"
                  : "assistant-message"
              }`}
            >
              <div className="ai-avatar">
                {message.role === "user" ? (
                  <User size={18} />
                ) : (
                  <Bot size={18} />
                )}
              </div>

              <div className="ai-message-content">
                <span className="ai-message-label">
                  {message.role === "user"
                    ? "You"
                    : "PayPilot AI"}
                </span>

                {/* MARKDOWN RESPONSE */}
                <div className="ai-message-text">
                  {message.role === "assistant" ? (
                    <ReactMarkdown>
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    message.content
                  )}
                </div>

                {/* AI MESSAGE ACTIONS */}
                {message.role === "assistant" && index > 0 && (
                  <div className="ai-message-actions">

                    <button
                      className="ai-action-btn"
                      onClick={() => handleCopy(message.content, index)}
                      title="Copy response"
                    >
                      {copiedIndex === index ? (
                        <>
                          <Check size={14} />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          Copy
                        </>
                      )}
                    </button>

                    <button
                      className="ai-action-btn"
                      onClick={() => handleRegenerate(index)}
                      disabled={loading}
                      title="Regenerate response"
                    >
                      <RefreshCw size={14} />
                      Regenerate
                    </button>

                  </div>
                )}
              </div>
            </div>
          ))}

          {/* TYPING INDICATOR */}
          {loading && (
            <div className="ai-message assistant-message">
              <div className="ai-avatar">
                <Bot size={18} />
              </div>

              <div className="ai-message-content">
                <span className="ai-message-label">
                  PayPilot AI
                </span>

                <div className="ai-typing">
                  <LoaderCircle
                    size={17}
                    className="ai-spinner"
                  />
                  Thinking...
                </div>
              </div>
            </div>
          )}

          {/* AUTO SCROLL TARGET */}
          <div ref={messagesEndRef} />

        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="ai-error">
            {error}
          </div>
        )}

        {/* SUGGESTED QUESTIONS */}
        {messages.length === 1 && (
          <div className="ai-suggestions">
            <h4>Try asking</h4>

            <div className="ai-suggestion-grid">
              {suggestions.map((item, index) => {
                const Icon = item.icon;

                return (
                  <button
                    key={index}
                    className="ai-suggestion"
                    onClick={() => handleSend(item.text)}
                    disabled={loading}
                  >
                    <Icon size={17} />
                    {item.text}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* MESSAGE INPUT */}
        <div className="ai-input-container">
          <input
            type="text"
            placeholder="Ask anything..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={loading}
          />

          <button
            className="ai-send-btn"
            onClick={() => handleSend()}
            disabled={!question.trim() || loading}
            title="Send message"
          >
            {loading ? (
              <LoaderCircle
                size={19}
                className="ai-spinner"
              />
            ) : (
              <Send size={19} />
            )}
          </button>
        </div>

        <p className="ai-disclaimer">
          PayPilot AI uses your stored financial records.
          Always verify important financial decisions.
        </p>
      </div>
    </div>
  );
}

export default AIAssistantPage;
