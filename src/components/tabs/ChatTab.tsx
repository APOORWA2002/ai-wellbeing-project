import React, { useState, useRef, useEffect } from 'react';
import { Send, PlusCircle, Bookmark, Bot, User, Sparkles, Lock } from 'lucide-react';
import { GREETING, QUICK_PROMPTS, getDemoReply, ChatAssessmentContext } from '../../chat/assistant';
import { detectCrisis, crisisMessage } from '../../chat/safety';
import { ChatMessage, UserAccount } from '../../types';
import { store } from '../../storage/store';
<<<<<<< HEAD
import { triggerHaptic } from '../../utils/haptics';
=======
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6

interface ChatTabProps {
  currentUser: UserAccount | null;
  assessmentContext?: ChatAssessmentContext | null;
  initialTopic?: string;
  onClearInitialTopic?: () => void;
  onOpenAuthModal?: () => void;
}

export const ChatTab: React.FC<ChatTabProps> = ({
  currentUser,
  assessmentContext,
  initialTopic,
  onClearInitialTopic,
  onOpenAuthModal,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [shareContext, setShareContext] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle incoming initial topic from other tabs
  useEffect(() => {
    if (initialTopic) {
      handleSendMessage(`Can you give me more details and steps for: "${initialTopic}"?`);
      if (onClearInitialTopic) {
        onClearInitialTopic();
      }
    }
  }, [initialTopic]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text) return;

<<<<<<< HEAD
    triggerHaptic('light');
=======
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
    const userMessage: ChatMessage = {
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    if (!textToSend) setInput('');
    setIsTyping(true);

    // Crisis detection check
    setTimeout(() => {
      let reply: string;
      if (detectCrisis(text)) {
<<<<<<< HEAD
        triggerHaptic('warning');
        reply = crisisMessage();
      } else {
        triggerHaptic('selection');
=======
        reply = crisisMessage();
      } else {
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
        const ctx = shareContext ? assessmentContext : null;
        reply = getDemoReply(newHistory, ctx);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: reply,
          created_at: new Date().toISOString(),
        },
      ]);
      setIsTyping(false);
    }, 450);
  };

  const startNewChat = () => {
<<<<<<< HEAD
    triggerHaptic('medium');
=======
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
    setMessages([]);
    setSaveSuccessMsg('');
  };

  const handleSaveChat = () => {
    if (!currentUser) {
<<<<<<< HEAD
      triggerHaptic('selection');
=======
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }
    const prefs = store.getPreferences(currentUser.id);
    if (!prefs.save_chats) {
<<<<<<< HEAD
      triggerHaptic('warning');
=======
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
      setSaveSuccessMsg('Please enable "Save chat conversations" in Account Settings.');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
      return;
    }
    if (messages.length === 0) return;

<<<<<<< HEAD
    triggerHaptic('success');
=======
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
    const convId = store.saveConversation(currentUser.id, messages);
    if (convId) {
      setSaveSuccessMsg('Conversation saved to your private timeline.');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 glass-panel rounded-2xl p-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
              Wellbeing Companion
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-400/30">
<<<<<<< HEAD
              Private & Confidential
=======
              Liquid Glass · Private
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
            </span>
          </div>
          <h3 className="text-base font-bold text-white tracking-tight">Talk Through Your Day</h3>
          <p className="text-xs text-slate-300">
            A reflective space to decompress, explore breathing methods, and untangle high workloads.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleSaveChat}
              className="text-xs glass-button-primary px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Save Chat</span>
            </button>
          )}
          <button
            type="button"
            onClick={startNewChat}
            disabled={messages.length === 0}
            className={`text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer ${
              messages.length === 0
                ? 'opacity-30 glass-panel text-slate-500 cursor-not-allowed'
                : 'glass-panel-interactive border-cyan-500/30 text-cyan-200 hover:text-white'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>New Chat</span>
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-400/40 text-cyan-200 text-xs shadow-[0_0_15px_rgba(6,182,212,0.2)]">
          {saveSuccessMsg}
        </div>
      )}

      {/* Context sharing toggle */}
      <div className="glass-panel rounded-2xl px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <label className="flex items-center gap-2.5 text-slate-200 cursor-pointer">
          <input
            type="checkbox"
            checked={shareContext}
            onChange={(e) => setShareContext(e.target.checked)}
            className="w-4 h-4 rounded bg-slate-900 border-cyan-500/40 text-cyan-500 focus:ring-0"
          />
          <span>Personalize companion advice using my latest fuzzy stress assessment</span>
        </label>
        {assessmentContext && shareContext && (
          <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-lg border border-cyan-400/30">
            {assessmentContext.category} ({assessmentContext.index.toFixed(1)}/100)
          </span>
        )}
      </div>

      {/* Chat messages viewport */}
      <div className="glass-panel-glow rounded-3xl p-5 sm:p-6 min-h-[460px] max-h-[540px] overflow-y-auto flex flex-col space-y-4 shadow-[0_0_35px_rgba(6,182,212,0.15)] relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Default Assistant Greeting */}
        <div className="flex items-start gap-3 relative z-10">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shrink-0 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            <Bot className="w-4 h-4" />
          </div>
          <div className="glass-panel rounded-2xl rounded-tl-sm px-4 py-3 max-w-xl text-xs text-slate-200 leading-relaxed border-cyan-500/25">
            {GREETING}
          </div>
        </div>

        {/* Quick starter prompts if conversation is empty */}
        {messages.length === 0 && (
          <div className="pt-2 relative z-10">
            <p className="text-[11px] text-cyan-400 mb-2 font-medium">Quick suggestions to explore:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(prompt)}
                  className="text-left p-3 rounded-xl glass-panel-interactive border-cyan-500/20 text-xs text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{prompt}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* User and assistant messages */}
        {messages.map((m, idx) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 relative z-10 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-blue-600/30 border border-blue-400/40 text-blue-200'
                    : 'bg-cyan-500/20 border border-cyan-400/40 text-cyan-300'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div
                className={`rounded-2xl px-4 py-3 max-w-xl text-xs leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? 'glass-button-primary rounded-tr-sm text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'glass-panel rounded-tl-sm text-slate-200 border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                }`}
              >
                {m.content}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-cyan-300/80 italic pl-11 relative z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>Companion is reflecting...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="glass-panel rounded-2xl p-2.5 flex items-center gap-2 border-cyan-500/25">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Ask about breathing, stress alleviation, or share your thoughts..."
          className="flex-1 bg-transparent px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => handleSendMessage()}
          disabled={!input.trim()}
          className="glass-button-primary p-2.5 rounded-xl text-white disabled:opacity-40 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)]"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
