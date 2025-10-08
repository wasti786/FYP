import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

export default function ChatWindow() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "👋 Hi! I’m your Travel Assistant. Ready to explore the world?" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const messagesEndRef = useRef(null);
  const controllerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const quickSuggestions = ["✈️ Popular Destinations", "💰 Budget Trips", "🏨 Hotels Nearby"];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const stopTyping = () => {
    if (controllerRef.current) controllerRef.current.abort();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setIsTyping(false);
  };

  const handleSend = async (customMsg) => {
    const userMessage = customMsg || input;
    if (!userMessage.trim()) return;

    // Stop previous typing if any
    stopTyping();

    // Show user message
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setInput("");
    setShowSuggestions(false);
    setIsTyping(true);

    // Empty bot bubble for typing
    setMessages((prev) => [...prev, { sender: "bot", text: "" }]);

    try {
      const controller = new AbortController();
      controllerRef.current = controller;

      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
        signal: controller.signal,
      });
      const data = await res.json();

      let reply = data.reply;
      let index = 0;
      let botMessage = "";

      const typeChar = () => {
        if (index < reply.length) {
          botMessage += reply[index];
          setMessages((prev) => {
            const msgs = [...prev];
            msgs[msgs.length - 1].text = botMessage;
            return msgs;
          });
          index++;
          typingTimeoutRef.current = setTimeout(typeChar, 20);
        } else {
          setIsTyping(false);
          setShowSuggestions(true);
        }
      };

      typeChar();
    } catch (error) {
      if (error.name !== "AbortError") {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "⚠️ Sorry, something went wrong. Please try again." },
        ]);
      }
      setIsTyping(false);
      setShowSuggestions(true);
    }
  };

  return (
    <div>
      {/* Floating Chat Icon */}
      <button
        style={{
          background: "linear-gradient(135deg, #6366f1, #06b6d4)",
          color: "white",
          width: "70px",
          height: "70px",
          borderRadius: "50%",
          position: "fixed",
          bottom: "20px",
          right: "20px",
          boxShadow: "0px 8px 20px rgba(0,0,0,0.25)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.3s ease",
        }}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.15)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="white" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.03 2 11c0 2.39 1.05 4.54 2.77 6.16L4 22l4.62-2.2C9.5 20.6 10.73 21 12 21c5.52 0 10-4.03 10-9s-4.48-10-10-10zm-3 9a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm6 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
        </svg>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            width: "380px",
            height: "520px",
            backgroundColor: "white",
            borderRadius: "18px",
            position: "fixed",
            bottom: "100px",
            right: "20px",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0px 12px 28px rgba(0,0,0,0.25)",
            overflow: "hidden",
            border: "1px solid #e5e7eb",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #6366f1, #06b6d4)",
              color: "white",
              padding: "16px",
              fontWeight: "bold",
              fontSize: "17px",
              textAlign: "center",
              letterSpacing: "0.5px",
            }}
          >
            🤖 Travel Assistant
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              padding: "14px",
              overflowY: "auto",
              backgroundColor: "#f9fafb",
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                  marginBottom: "10px",
                }}
              >
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: "16px",
                    background:
                      msg.sender === "user"
                        ? "linear-gradient(135deg, #6366f1, #06b6d4)"
                        : "#e5e7eb",
                    color: msg.sender === "user" ? "white" : "black",
                    maxWidth: "75%",
                    fontSize: "14px",
                    lineHeight: "1.4",
                    boxShadow:
                      msg.sender === "user"
                        ? "0px 3px 10px rgba(99,102,241,0.3)"
                        : "0px 2px 6px rgba(0,0,0,0.1)",
                  }}
                >
                  {msg.sender === "bot" ? <ReactMarkdown>{msg.text}</ReactMarkdown> : msg.text}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "10px" }}>
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "16px",
                    background: "#e5e7eb",
                    display: "flex",
                    gap: "4px",
                    alignItems: "center",
                    width: "50px",
                    justifyContent: "center",
                  }}
                >
                  <span style={dotStyle}></span>
                  <span style={{ ...dotStyle, animationDelay: "0.2s" }}></span>
                  <span style={{ ...dotStyle, animationDelay: "0.4s" }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              borderTop: "1px solid #e5e5e5",
              backgroundColor: "white",
            }}
          >
            {showSuggestions && (
              <div style={{ display: "flex", gap: "8px", padding: "8px", overflowX: "auto" }}>
                {quickSuggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(s)}
                    style={{
                      background: "#f3f4f6",
                      border: "1px solid #e5e7eb",
                      borderRadius: "20px",
                      padding: "6px 12px",
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div style={{ display: "flex", padding: "10px", gap: "8px" }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your message..."
                style={{
                  flex: 1,
                  padding: "12px",
                  border: "1px solid #ccc",
                  borderRadius: "10px",
                  outline: "none",
                  fontSize: "14px",
                }}
              />

              {/* Stop Button */}
              {isTyping && (
                <button
                  onClick={stopTyping}
                  style={{
                    background: "#f87171",
                    border: "none",
                    borderRadius: "50%",
                    width: "40px",
                    height: "40px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      backgroundColor: "white",
                      borderRadius: "2px",
                    }}
                  />
                </button>
              )}

              {/* Send Button */}
              <button
                onClick={() => handleSend()}
                style={{
                  background: "linear-gradient(135deg, #6366f1, #06b6d4)",
                  color: "white",
                  padding: "10px 18px",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.opacity = "0.85")}
                onMouseLeave={(e) => (e.target.style.opacity = "1")}
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const dotStyle = {
  width: "6px",
  height: "6px",
  backgroundColor: "#6b7280",
  borderRadius: "50%",
  display: "inline-block",
  animation: "blink 1.4s infinite both",
};
