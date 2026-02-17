'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { X, Send, Minimize2, MessageCircle, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatbotWidgetProps {
  currentStep?: number;
}

export default function ChatbotWidget({ currentStep }: ChatbotWidgetProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [sessionId] = useState(() => `chatbot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  
  // Get user role
  const userRole = session?.user?.role || 'customer';
  // Get role-specific welcome message
  const getWelcomeMessage = () => {
    if (userRole === 'customer') {
      return 'Hi! I\'m your AI assistant. I can help you with your loan application, explain form fields, track your application status, and answer questions about LoanTicks. What can I help you with?';
    } else if (userRole === 'employee') {
      return 'Hi! I\'m your AI assistant. I can help you review applications, use the verification checklist, send emails to customers, and navigate the employee dashboard. How can I assist you?';
    } else if (userRole === 'admin') {
      return 'Hi! I\'m your AI assistant. I can help you manage employees, configure system settings, view analytics, access chatbot logs, and navigate the admin dashboard. What do you need help with?';
    }
    return 'Hi! I\'m here to help you with LoanTicks. Ask me anything about the platform!';
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: getWelcomeMessage(),
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Build conversation history (exclude system message)
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory: conversationHistory,
          currentStep: currentStep,
          sessionId: sessionId,
          userRole: userRole,
        }),
      });

      const data = await response.json();

      if (data.success && data.response) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // Show API error in chat instead of throwing (avoids error overlay)
        const errorContent = data.error === 'Chatbot service is not configured. Please contact support.'
          ? 'The chatbot is not set up yet. An admin can add an OpenAI API key in environment variables (OPENAI_API_KEY or OpenAIKey) to enable it. You can still use the rest of the site.'
          : (data.error || 'Sorry, I could not get a response. Please try again.');
        const errorMessage: Message = {
          role: 'assistant',
          content: errorContent,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again in a moment.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Always Visible Chat Bubble - Bottom Left (AI chatbot style) */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-white border-2 border-yellow-500 rounded-2xl pl-2 pr-4 py-2 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl touch-manipulation group"
          aria-label="Open LOANATICKS AI chatbot"
        >
          {/* Logo in a small circle */}
          <div className="relative w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-yellow-400 group-hover:ring-yellow-500 transition">
            <Image
              src="/logo.jpg"
              alt="LOANATICKS"
              width={36}
              height={36}
              className="object-contain"
            />
          </div>
          <div className="flex flex-col items-start min-w-0">
            <span className="font-bold text-slate-800 text-sm leading-tight flex items-center gap-1">
              LOANATICKS <Sparkles className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <MessageCircle className="w-3 h-3 flex-shrink-0" />
              AI Assistant
            </span>
          </div>
        </button>
      )}

      {/* Chat Window - Bottom Left */}
      {isOpen && (
        <div
          className={`fixed bottom-6 left-6 z-50 bg-white rounded-2xl shadow-2xl transition-all duration-300 ${
            isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
          } flex flex-col border-2 border-gray-200`}
        >
          {/* Header */}
          <div className="bg-yellow-500 rounded-t-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.jpg"
                alt="LOANATICKS"
                width={32}
                height={32}
                className="rounded-full object-contain"
              />
              <h3 className="text-white font-bold text-lg">LOANATICKS AI</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-yellow-600 rounded-full p-1 transition"
                aria-label={isMinimized ? 'Expand' : 'Minimize'}
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-yellow-600 rounded-full p-1 transition"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-xl p-3 ${
                        message.role === 'user'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-white text-gray-800 border border-gray-200'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 rounded-xl p-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-gray-200 p-4 bg-white rounded-b-2xl">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about the form..."
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition text-gray-900"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputMessage.trim() || isLoading}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl px-6 py-3 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center touch-manipulation min-w-[60px]"
                    aria-label="Send message"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
