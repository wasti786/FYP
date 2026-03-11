import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

export default function ChatWindow() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      sender: "bot", 
      text: "👋 Hello! I'm your AI Travel Assistant. I can help you plan trips, suggest destinations, find hotels, and create amazing itineraries. Where would you like to explore today?" 
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const messagesEndRef = useRef(null);
  const controllerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const chatWindowRef = useRef(null);

  const quickSuggestions = [
    { icon: "✈️", text: "Popular Destinations" },
    { icon: "💰", text: "Budget Travel Tips" },
    { icon: "🏨", text: "Hotel Recommendations" },
    { icon: "🗓️", text: "Plan My Itinerary" },
    { icon: "🍴", text: "Local Food" },
    { icon: "🚗", text: "Transportation" }
  ];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // Close chat when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatWindowRef.current && !chatWindowRef.current.contains(event.target)) {
        const toggleBtn = document.querySelector('.chat-toggle-btn');
        if (toggleBtn && !toggleBtn.contains(event.target)) {
          setIsOpen(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

 
  useEffect(() => {
    if (isOpen && chatWindowRef.current) {
      const chatRect = chatWindowRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      if (chatRect.top < 20) {
        chatWindowRef.current.style.top = "20px";
        chatWindowRef.current.style.bottom = "auto";
      }
    }
  }, [isOpen]);

  const stopTyping = () => {
    if (controllerRef.current) controllerRef.current.abort();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setIsTyping(false);
  };

  const handleSend = async (customMsg) => {
    const userMessage = customMsg || input;
    if (!userMessage.trim()) return;

    stopTyping();

    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setInput("");
    setShowSuggestions(false);
    setIsTyping(true);

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
          { 
            sender: "bot", 
            text: "⚠️ I apologize, but I'm having trouble connecting right now. Please try again in a moment." 
          },
        ]);
      }
      setIsTyping(false);
      setShowSuggestions(true);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      
      <button
        className="chat-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          width: "70px",
          height: "70px",
          borderRadius: "50%",
          position: "fixed",
          bottom: "30px",
          right: "30px",
          boxShadow: "0 8px 32px rgba(102, 126, 234, 0.4)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 10000,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1) rotate(5deg)";
          e.currentTarget.style.boxShadow = "0 12px 40px rgba(102, 126, 234, 0.6)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1) rotate(0deg)";
          e.currentTarget.style.boxShadow = "0 8px 32px rgba(102, 126, 234, 0.4)";
        }}
      >
        <div style={{ position: "relative" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="white" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-3 12H7c-.55 0-1-.45-1-1s.45-1 1-1h10c.55 0 1 .45 1 1s-.45 1-1 1zm0-4H7c-.55 0-1-.45-1-1s.45-1 1-1h10c.55 0 1 .45 1 1s-.45 1-1 1z"/>
          </svg>
          {!isOpen && (
            <div style={{
              position: "absolute",
              top: "-5px",
              right: "-5px",
              width: "12px",
              height: "12px",
              backgroundColor: "#10b981",
              borderRadius: "50%",
              border: "2px solid white",
              animation: "pulse 2s infinite"
            }} />
          )}
        </div>
      </button>

      {/* Enhanced Chat Window with Safe Positioning */}
      {isOpen && (
        <div
          ref={chatWindowRef}
          className="chat-window"
          style={{
            width: "420px",
            height: "650px",
            maxHeight: "calc(100vh - 160px)", 
            backgroundColor: "white",
            borderRadius: "20px",
            position: "fixed",
            bottom: "120px", 
            right: "30px",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.25)",
            overflow: "hidden",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(10px)",
            zIndex: 10000,
          }}
        >
          {/* Enhanced Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              padding: "20px",
              fontWeight: "600",
              fontSize: "18px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
              flexShrink: 0, 
            }}
          >
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(10px)"
            }}>
              🤖
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: "600" }}>Travel Assistant</div>
              <div style={{ fontSize: "12px", opacity: 0.9, fontWeight: "400" }}>Online • Ready to help</div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                marginLeft: "auto",
                background: "rgba(255,255,255,0.2)",
                border: "none",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                color: "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.3)"}
            >
              ×
            </button>
          </div>

          {/* Messages Container */}
          <div
            style={{
              flex: 1,
              padding: "20px",
              overflowY: "auto",
              background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              minHeight: 0, 
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                  alignItems: "flex-start",
                  gap: "8px",
                }}
              >
                {msg.sender === "bot" && (
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    flexShrink: 0
                  }}>
                    🤖
                  </div>
                )}
                <div
                  style={{
                    padding: "16px 20px",
                    borderRadius: "20px",
                    background: msg.sender === "user" 
                      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                      : "white",
                    color: msg.sender === "user" ? "white" : "#2d3748",
                    maxWidth: "80%",
                    fontSize: "14px",
                    lineHeight: "1.5",
                    boxShadow: msg.sender === "user" 
                      ? "0 4px 15px rgba(102, 126, 234, 0.3)"
                      : "0 2px 10px rgba(0, 0, 0, 0.08)",
                    border: msg.sender === "bot" ? "1px solid rgba(0,0,0,0.05)" : "none",
                    wordWrap: "break-word",
                    overflowWrap: "break-word",
                  }}
                >
                  {msg.sender === "bot" ? (
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                </div>
                {msg.sender === "user" && (
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #48bb78 0%, #38a169 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    color: "white",
                    flexShrink: 0
                  }}>
                    👤
                  </div>
                )}
              </div>
            ))}

            {/* Enhanced Typing Indicator */}
            {isTyping && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  flexShrink: 0
                }}>
                  🤖
                </div>
                <div
                  style={{
                    padding: "16px 20px",
                    borderRadius: "20px",
                    background: "white",
                    display: "flex",
                    gap: "6px",
                    alignItems: "center",
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
                  }}
                >
                  <span style={enhancedDotStyle}></span>
                  <span style={{ ...enhancedDotStyle, animationDelay: "0.2s" }}></span>
                  <span style={{ ...enhancedDotStyle, animationDelay: "0.4s" }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Enhanced Input Area */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              borderTop: "1px solid rgba(0,0,0,0.1)",
              backgroundColor: "white",
              padding: "16px",
              flexShrink: 0, 
            }}
          >
            {/* Improved Quick Suggestions */}
            {showSuggestions && (
              <div style={{ 
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "8px",
                padding: "8px 0 16px 0",
                maxHeight: "90px",
                overflow: "hidden"
              }}>
                {quickSuggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(s.text)}
                    style={{
                      background: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "15px",
                      padding: "8px 6px",
                      fontSize: "11px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      justifyContent: "center",
                      minHeight: "32px",
                      wordWrap: "break-word",
                      whiteSpace: "normal",
                      textAlign: "center",
                      lineHeight: "1.2",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#667eea";
                      e.currentTarget.style.color = "white";
                      e.currentTarget.style.borderColor = "#667eea";
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "white";
                      e.currentTarget.style.color = "inherit";
                      e.currentTarget.style.borderColor = "#e2e8f0";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.05)";
                    }}
                  >
                    <span style={{ fontSize: "10px", flexShrink: 0 }}>{s.icon}</span>
                    <span style={{ 
                      fontSize: "10px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}>
                      {s.text}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask about travel destinations, hotels, or itineraries..."
                  style={{
                    width: "100%",
                    padding: "16px 50px 16px 20px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "25px",
                    outline: "none",
                    fontSize: "14px",
                    background: "#f8fafc",
                    transition: "all 0.2s ease",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                  }}
                  onFocus={(e) => {
                    e.target.style.background = "white";
                    e.target.style.borderColor = "#667eea";
                    e.target.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.2)";
                  }}
                  onBlur={(e) => {
                    e.target.style.background = "#f8fafc";
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow = "0 2px 5px rgba(0,0,0,0.05)";
                  }}
                />
              </div>

              {/* Stop Button */}
              {isTyping && (
                <button
                  onClick={stopTyping}
                  style={{
                    background: "#ef4444",
                    border: "none",
                    borderRadius: "50%",
                    width: "44px",
                    height: "44px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s ease",
                    boxShadow: "0 2px 8px rgba(239, 68, 68, 0.3)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.1)";
                    e.currentTarget.style.background = "#dc2626";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.background = "#ef4444";
                  }}
                >
                  <div
                    style={{
                      width: "14px",
                      height: "14px",
                      backgroundColor: "white",
                      borderRadius: "2px",
                    }}
                  />
                </button>
              )}

              {/* Enhanced Send Button */}
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                style={{
                  background: input.trim() 
                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    : "#cbd5e0",
                  color: "white",
                  padding: "16px",
                  border: "none",
                  borderRadius: "50%",
                  cursor: input.trim() ? "pointer" : "not-allowed",
                  fontWeight: "bold",
                  transition: "all 0.3s ease",
                  width: "44px",
                  height: "44px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: input.trim() ? "0 4px 15px rgba(102, 126, 234, 0.4)" : "none",
                }}
                onMouseEnter={(e) => {
                  if (input.trim()) {
                    e.currentTarget.style.transform = "scale(1.1)";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.6)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (input.trim()) {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.4)";
                  }
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="white"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

    <style>{`
  @keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.1); opacity: 0.7; }
    100% { transform: scale(1); opacity: 1; }
  }
  
  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }
`}</style>

    </div>
  );
}

const enhancedDotStyle = {
  width: "8px",
  height: "8px",
  backgroundColor: "#9ca3af",
  borderRadius: "50%",
  display: "inline-block",
  animation: "bounce 1.4s infinite ease-in-out both",
};