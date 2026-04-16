import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { askLocalAiClient } from '../utils/aiClient';

const IconBot = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8V4H8" />
    <rect width="16" height="12" x="4" y="8" rx="2" />
    <path d="M2 14h2" />
    <path d="M20 14h2" />
    <path d="M15 13v2" />
    <path d="M9 13v2" />
  </svg>
);

const IconClose = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const IconSend = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const IconLoader = () => (
  <svg className="ai-spinner" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export function AiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Сәлеметсіз бе! Мен EduPredict ЖИ менторымын. Сынып немесе оқушы үлгерімі туралы сұрағыңызды жазыңыз.' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [isOpen, messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((previous) => [...previous, { role: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await askLocalAiClient(userMessage, null, null, true);
      setMessages((previous) => [...previous, { role: 'ai', text: response }]);
    } catch (error) {
      setMessages((previous) => [...previous, { role: 'ai', text: `Қате кетті: ${error.message}`, isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button className="ai-chat-trigger" onClick={() => setIsOpen(!isOpen)} title="ЖИ ментормен сөйлесу">
        <span className="ai-chat-trigger__icon"><IconBot /></span>
        <span className="ai-chat-trigger__label">ЖИ ментор</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="ai-chat-window glass-card"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
          >
            <div className="ai-chat__header">
              <div className="ai-chat__title">
                <IconBot /> ЖИ ментор
              </div>
              <button className="ai-chat__close" onClick={() => setIsOpen(false)}><IconClose /></button>
            </div>

            <div className="ai-chat__warning" style={{ background: 'var(--primary-soft)', color: 'var(--primary)', borderColor: 'var(--primary-glow)' }}>
              Жергілікті ЖИ моделі браузерде офлайн жұмыс істейді.
            </div>

            <div className="ai-chat__messages">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`ai-msg ${message.role === 'user' ? 'ai-msg--user' : 'ai-msg--ai'} ${message.isError ? 'ai-msg--error' : ''}`}>
                  {message.text}
                </div>
              ))}

              {isLoading && (
                <div className="ai-msg ai-msg--ai ai-msg--loading">
                  <IconLoader /> ЖИ талдау жасап жатыр...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="ai-chat__input-area">
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && handleSend()}
                placeholder="Сұрағыңызды жазыңыз..."
                disabled={isLoading}
                className="ai-chat__input"
              />
              <button className="ai-chat__send-btn" onClick={handleSend} disabled={!input.trim() || isLoading}>
                <IconSend />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
