import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Trash2, Bot, Sparkles, ChevronDown } from 'lucide-react';
import { getDemoReply } from '../chat/assistant';
import { detectCrisis, crisisMessage } from '../chat/safety';
import { ChatMessage } from '../types';
import { StressinaLogo } from './common/StressinaLogo';
<<<<<<< HEAD
import { triggerHaptic } from '../utils/haptics';
=======
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6

interface FloatingChatProps {
  onNavigateToTab?: (tab: string) => void;
  isOpenControlled?: boolean;
  onToggleOpen?: (open: boolean) => void;
}

export const FloatingChat: React.FC<FloatingChatProps> = ({
  onNavigateToTab,
  isOpenControlled,
  onToggleOpen,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isChatOpen = isOpenControlled !== undefined ? isOpenControlled : internalOpen;

  const setChatOpen = (open: boolean) => {
<<<<<<< HEAD
    triggerHaptic('selection');
=======
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
    if (onToggleOpen) {
      onToggleOpen(open);
    }
    setInternalOpen(open);
  };

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = ['Help me relax', 'Exam stress', "I can't sleep", 'Breathing exercise'];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [messages, isChatOpen]);

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text) return;

<<<<<<< HEAD
    triggerHaptic('light');
=======
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
    const userMsg: ChatMessage = { role: 'user', content: text };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    if (!textToSend) setInput('');

    setTimeout(() => {
      let reply: string;
      if (detectCrisis(text)) {
<<<<<<< HEAD
        triggerHaptic('warning');
        reply = crisisMessage();
      } else if (text === 'Breathing exercise') {
        triggerHaptic('medium');
        reply =
          'You can switch to the "Breathing Exercises" tab for our guided breathing pacer. Inhale slowly as the orb expands, hold gently, and exhale as it settles.';
        if (onNavigateToTab) {
          onNavigateToTab('breathing');
        }
      } else {
        triggerHaptic('selection');
=======
        reply = crisisMessage();
      } else if (text === 'Breathing exercise') {
        reply =
          'You can switch to the "Relax & Breathing" tab for our interactive Liquid Glass breathing orb. Inhale slowly as it expands, hold gently, and exhale as it settles.';
        if (onNavigateToTab) {
          onNavigateToTab('games');
        }
      } else {
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
        reply = getDemoReply(nextHistory, null);
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    }, 300);
  };

  return (
    <>
      {/* Mobile backdrop dimming when open for clear focus */}
      {isChatOpen && (
        <div
          className="fixed inset-0 bg-[#050B14]/60 backdrop-blur-xs z-[75] sm:hidden transition-opacity duration-200"
          onClick={() => setChatOpen(false)}
        />
      )}

      {/* Floating Widget Container */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[80] pointer-events-none">
        {/* Floating Launcher Button with prominent mobile visibility */}
        {!isChatOpen && (
          <button
            type="button"
            onClick={() => setChatOpen(true)}
            aria-label="Open stressina.AI Companion"
            className="pointer-events-auto glass-button-primary rounded-full px-4 py-3 sm:px-5 sm:py-3.5 shadow-[0_0_30px_rgba(6,182,212,0.65)] flex items-center gap-2.5 font-bold text-xs border border-cyan-300/70 transition-all hover:scale-105 active:scale-95 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center">
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping opacity-75" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-300 rounded-full shadow-[0_0_8px_#22d3ee]" />
              <StressinaLogo variant="emblem" size="xs" />
            </div>
            <span className="tracking-wide text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
              <span className="inline sm:hidden">AI Companion</span>
              <span className="hidden sm:inline">stressina.AI Companion</span>
            </span>
          </button>
        )}
      </div>

      {/* Responsive Floating Popup Window */}
      {isChatOpen && (
        <div className="fixed inset-x-3 bottom-3 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-96 max-w-sm w-auto glass-panel-glow rounded-3xl shadow-[0_0_60px_rgba(6,182,212,0.4)] overflow-hidden flex flex-col h-[510px] max-h-[85vh] border border-cyan-400/50 z-[80] animate-fade-in">
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="glass-card-header px-4 py-3.5 flex items-center justify-between relative z-10 border-b border-cyan-500/20">
            <div className="flex items-center gap-2.5">
              <StressinaLogo variant="emblem" size="sm" />
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>stressina<span className="text-cyan-300">.Ai</span> Companion</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
                </div>
                <p className="text-[10px] text-cyan-300/80">Support & Calming Guidance</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setChatOpen(false)}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-cyan-500/15 transition-colors cursor-pointer"
              title="Close Companion"
            >
              <X className="w-5 h-5 text-cyan-400" />
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="p-2.5 bg-slate-950/50 border-b border-cyan-500/15 flex flex-wrap gap-1.5 relative z-10">
            {quickPrompts.map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(q)}
                className="text-[11px] font-medium glass-panel-interactive border-cyan-500/25 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Message History */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 text-xs relative z-10 scrollbar-thin">
            {messages.length === 0 ? (
              <div className="text-center py-10 text-slate-400 space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(6,182,212,0.25)]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <p className="font-semibold text-white">How can I support you right now?</p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Ask about breathing exercises, stress management, exams, or grounding.
                </p>
              </div>
            ) : (
              messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl whitespace-pre-wrap leading-relaxed ${
                    m.role === 'user'
                      ? 'glass-button-primary text-white ml-6 rounded-tr-xs shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                      : 'glass-panel text-slate-200 mr-6 rounded-tl-xs border-cyan-500/30'
                  }`}
                >
                  {m.content}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input & Footer */}
          <div className="p-3 bg-slate-950/70 border-t border-cyan-500/15 space-y-2 relative z-10">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Share your thoughts or questions..."
                className="flex-1 glass-input rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="glass-button-primary p-2.5 rounded-xl text-white disabled:opacity-40 cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.3)] shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
              <span>National Crisis Helpline: 1926</span>
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={() => setMessages([])}
                  className="text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
