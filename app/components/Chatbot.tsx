'use client';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `You are a tech news assistant. Only answer questions about the Tech news. If the user asks about anything else, politely respond: 'Sorry, I can only provide information about the latest tech news.'`;

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface Message {
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: 'Hi! 👋 I am your AI Tech News Assistant. Ask me for the latest tech news or anything else!', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage: Message = { sender: 'user', text: input, timestamp: now };
    setMessages((msgs) => [...msgs, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/groq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3-70b-8192',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...[...messages, userMessage].map((m) => ({
              role: m.sender === 'user' ? 'user' : 'assistant',
              content: m.text,
            })),
          ],
          max_tokens: 512,
        }),
      });
      const data = await response.json();
      const botText = data.choices?.[0]?.message?.content?.trim() || 'Sorry, I could not fetch a response.';
      const botMessage: Message = { sender: 'bot', text: botText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setMessages((msgs) => [...msgs, botMessage]);
    } catch (err) {
      const errorMessage: Message = { sender: 'bot', text: 'Sorry, there was an error fetching the news.', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setMessages((msgs) => [...msgs, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto  dark:bg-black/60 rounded-2xl shadow-2xl p-4 sm:p-8 flex flex-col h-[70vh] border border-gray-200 dark:border-gray-800">
      <div className="flex-1 overflow-y-auto pr-2 mb-2">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={classNames(
                'my-2 flex',
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={classNames(
                  'px-4 py-2 rounded-xl max-w-[80%] whitespace-pre-line break-words shadow relative',
                  msg.sender === 'user'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none'
                )}
              >
                <span>{msg.text}</span>
                <span className="block text-xs text-gray-400 mt-1 text-right">{msg.timestamp}</span>
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="my-2 flex justify-start"
            >
              <div className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none flex items-center gap-2">
                <span className="animate-spin inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></span>
                Thinking...
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={sendMessage}
        className="flex flex-nowrap sm:flex-nowrap gap-2 mt-2 w-full items-center flex-wrap"
      >
        <input
          type="text"
          className="flex-1 min-w-0 rounded-xl border border-gray-300 dark:border-gray-700 px-3 py-2 sm:px-4 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-black/80 shadow text-sm sm:text-base"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          autoFocus
        />
        <button
          type="submit"
          className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-xl font-semibold transition-colors disabled:opacity-50 shadow flex-shrink-0"
          disabled={loading || !input.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
} 