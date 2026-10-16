import React, { useState, useEffect } from 'react';
import {
  Brain,
  Sliders,
  MessageSquare,
  Sparkles,
  History,
  UserCheck,
  Settings,
  LineChart,
  Network,
  Database,
  Flame,
  Coffee,
  Sun,
  Menu,
  X,
  Info,
  Lock,
  Wind,
<<<<<<< HEAD
  Trophy,
=======
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
} from 'lucide-react';
import { APP_METADATA, UNIVERSE_CONFIG } from './engine/fuzzyConfig';
import { StressinaLogo } from './components/common/StressinaLogo';
import { AssessmentTab } from './components/tabs/AssessmentTab';
<<<<<<< HEAD
import { QuestsTab } from './components/tabs/QuestsTab';
import { ChatTab } from './components/tabs/ChatTab';
import { RelaxAndPlayTab } from './components/tabs/RelaxAndPlayTab';
import { StressCrushGame } from './components/games/StressCrushGame';
=======
import { ChatTab } from './components/tabs/ChatTab';
import { RelaxAndPlayTab } from './components/tabs/RelaxAndPlayTab';
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
import { HistoryTab } from './components/tabs/HistoryTab';
import { CounsellorTab } from './components/tabs/CounsellorTab';
import { AccountTab } from './components/tabs/AccountTab';
import { MembershipTab } from './components/tabs/MembershipTab';
import { ArchitectureDiagram } from './components/visualizations/ArchitectureDiagram';
import { DatasetTab } from './components/tabs/DatasetTab';
import { FloatingChat } from './components/FloatingChat';
import { AuthModal } from './components/auth/AuthModal';
<<<<<<< HEAD
import { habitsStore } from './storage/habitsStore';
import { triggerHaptic } from './utils/haptics';
=======
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
import {
  CopingRecommendation,
  ExplanationPayload,
  InferenceResult,
  StressCategory,
  UserAccount,
} from './types';
import { store } from './storage/store';

export const App: React.FC = () => {
  // Navigation
  const [activeTab, setActiveTab] = useState<string>('assessment');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [floatingChatOpen, setFloatingChatOpen] = useState<boolean>(false);

  // User State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

<<<<<<< HEAD
  // Global Auth Modal state (defaults to register first as requested)
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('register');
=======
  // Global Auth Modal state
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
  const [authPromptReason, setAuthPromptReason] = useState<string>('');

  // Physiological inputs
  const [hrv, setHrv] = useState<number>(UNIVERSE_CONFIG.hrv.default);
  const [screenTime, setScreenTime] = useState<number>(UNIVERSE_CONFIG.screen_time.default);
  const [sleep, setSleep] = useState<number>(UNIVERSE_CONFIG.sleep_duration.default);
  const [timeOption, setTimeOption] = useState<string>('5 minutes');
  const [contextOption, setContextOption] = useState<string>('Home');

  // Last Assessment Result
  const [lastAssessment, setLastAssessment] = useState<{
    inference: InferenceResult;
    category: StressCategory;
    recommendation: CopingRecommendation;
    explanation: ExplanationPayload;
  } | null>(null);

  // Chat incoming topic bridge
  const [chatTopic, setChatTopic] = useState<string>('');

  // Toast / notification
  const [toastMessage, setToastMessage] = useState<string>('');

  useEffect(() => {
    setCurrentUser(store.getCurrentUser());
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

<<<<<<< HEAD
  const openAuthWithPrompt = (reason?: string, mode: 'login' | 'register' = 'register') => {
    triggerHaptic('selection');
=======
  const openAuthWithPrompt = (reason?: string, mode: 'login' | 'register' = 'login') => {
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
    setAuthPromptReason(reason || '');
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  // Preset loaders
  const loadPreset = (h: number, sc: number, sl: number, name: string) => {
<<<<<<< HEAD
    triggerHaptic('medium');
=======
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
    setHrv(h);
    setScreenTime(sc);
    setSleep(sl);
    setActiveTab('assessment');
    setSidebarOpen(false);
    showToast(`${name} scenario loaded into sliders`);
  };

  const navItems = [
    { id: 'assessment', label: 'Real-Time Assessment', icon: Sliders },
<<<<<<< HEAD
    { id: 'breathing', label: 'Breathing Exercises', icon: Wind },
    { id: 'candy_crush', label: 'Stress Crush (Candy Game)', icon: Sparkles },
    { id: 'quests', label: 'Daily Quests & Marks', icon: Trophy },
=======
    { id: 'games', label: 'Relax & Breathing', icon: Wind },
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
    { id: 'chat', label: 'Wellbeing Chat', icon: MessageSquare },
    { id: 'history', label: 'My Timeline', icon: History },
    { id: 'account', label: 'Account & Security', icon: Settings },
    { id: 'counsellor', label: 'Support Demo', icon: UserCheck },
    { id: 'visuals', label: 'Membership Curves', icon: LineChart },
    { id: 'arch', label: 'Architecture', icon: Network },
    { id: 'dataset', label: 'Batch Validation', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-[#050B14] text-[#E2E8F0] flex flex-col antialiased relative selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background ambient radial glows */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[400px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-10 w-[500px] h-[500px] bg-sky-500/8 rounded-full blur-[150px] pointer-events-none -z-10" />

<<<<<<< HEAD
      {/* Reusable Auth Modal */}
=======
      {/* Reusable Liquid Glass Auth Modal */}
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        promptReason={authPromptReason}
        onClose={() => setAuthModalOpen(false)}
        onUserChanged={(user) => {
          setCurrentUser(user);
          if (user) showToast(`Welcome, ${user.display_name}!`);
        }}
      />

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 glass-panel-glow text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] border-cyan-400/50 animate-fade-in flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

<<<<<<< HEAD
      {/* Top Header */}
=======
      {/* Liquid Glass Top Header */}
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
      <header className="sticky top-0 z-40 glass-panel border-b border-cyan-500/20 px-4 lg:px-8 py-3.5 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl glass-panel-interactive text-slate-300 hover:text-white"
            >
              {sidebarOpen ? <X className="w-5 h-5 text-cyan-400" /> : <Menu className="w-5 h-5 text-cyan-400" />}
            </button>
            <div className="flex items-center gap-3">
              <StressinaLogo
                size="md"
                variant="full"
                onClick={() => setActiveTab('assessment')}
                className="cursor-pointer transition-transform hover:scale-[1.02]"
              />
              <div className="hidden sm:block border-l border-cyan-500/25 pl-3">
                <p className="text-[10px] text-slate-300 leading-tight font-medium">
                  Mamdani Fuzzy Inference
                </p>
                <p className="text-[9px] text-cyan-400/80 font-mono">
                  Adaptive Stress Regulation
                </p>
              </div>
            </div>
          </div>

<<<<<<< HEAD
          {/* Header Quick Actions: Breathing & Stress Crush */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('medium');
                setActiveTab('breathing');
              }}
              className={`text-xs px-2.5 sm:px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ios-tactile-button ${
                activeTab === 'breathing' || activeTab === 'games'
                  ? 'bg-cyan-500/25 border border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'glass-panel-interactive border-cyan-500/20 text-slate-300 hover:text-white'
              }`}
              title="Launch Guided Breathing Sanctuary"
            >
              <Wind className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="font-semibold hidden sm:inline">Breathing</span>
              <span className="font-semibold sm:hidden">Breathe</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('medium');
                setActiveTab('candy_crush');
              }}
              className={`text-xs px-2.5 sm:px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ios-tactile-button ${
                activeTab === 'candy_crush'
                  ? 'bg-pink-500/25 border border-pink-400 text-pink-200 shadow-[0_0_15px_rgba(236,72,153,0.4)]'
                  : 'glass-panel-interactive border-pink-500/20 text-slate-300 hover:text-white'
              }`}
              title="Play Stress Crush Match-3 Candy Mini-Game"
            >
              <Sparkles className="w-3.5 h-3.5 text-pink-400 shrink-0" />
              <span className="font-semibold hidden sm:inline">Stress Crush 🍬</span>
              <span className="font-semibold sm:hidden">Crush 🍬</span>
            </button>
          </div>

=======
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
          {/* User Session Action & Mobile Companion */}
          <div className="flex items-center gap-2">
            {/* Quick Companion Button on Mobile */}
            <button
              type="button"
<<<<<<< HEAD
              onClick={() => {
                triggerHaptic('light');
                setFloatingChatOpen(true);
              }}
=======
              onClick={() => setFloatingChatOpen(true)}
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
              aria-label="Open AI Companion"
              className="sm:hidden p-2 rounded-xl glass-panel-interactive border-cyan-500/30 text-cyan-300 hover:text-white flex items-center justify-center cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.2)]"
              title="Open AI Companion"
            >
              <MessageSquare className="w-4 h-4 text-cyan-400" />
            </button>

            {currentUser ? (
<<<<<<< HEAD
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('selection');
                    setActiveTab('quests');
                  }}
                  className="text-xs px-2.5 sm:px-3 py-1.5 rounded-xl glass-panel-interactive border-cyan-400/40 text-cyan-200 flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.2)] ios-tactile-button"
                  title="View your marks and daily quests"
                >
                  <Trophy className="w-3.5 h-3.5 text-cyan-300" />
                  <span className="font-mono font-bold text-white">
                    {habitsStore.getProfile(currentUser.id).totalMarks}
                  </span>
                  <span className="hidden sm:inline text-[10px] text-cyan-400">marks</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('selection');
                    setActiveTab('account');
                  }}
                  className="text-xs px-3 py-1.5 rounded-xl glass-panel-interactive border-cyan-500/30 text-white flex items-center gap-2 cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.15)] ios-tactile-button"
                >
                  <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                  <span className="font-semibold truncate max-w-[100px] sm:max-w-none">{currentUser.display_name}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => openAuthWithPrompt('Register your profile to claim +50 welcome marks and track your daily stress tasks.', 'register')}
                  className="glass-button-primary text-xs px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-[0_0_18px_rgba(6,182,212,0.4)] ios-tactile-button border-cyan-300/40"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-200 animate-pulse" />
                  <span>Register (+50)</span>
                </button>
                <button
                  type="button"
                  onClick={() => openAuthWithPrompt('Sign in to access your existing account and private timeline.', 'login')}
                  className="hidden sm:flex text-xs px-2.5 py-1.5 rounded-xl glass-panel-interactive border-cyan-500/25 text-slate-300 hover:text-white items-center gap-1 cursor-pointer ios-tactile-button"
                >
                  <Lock className="w-3 h-3 text-cyan-400" />
                  <span>Sign In</span>
                </button>
              </div>
=======
              <button
                type="button"
                onClick={() => setActiveTab('account')}
                className="text-xs px-3.5 py-1.5 rounded-xl glass-panel-interactive border-cyan-500/30 text-white flex items-center gap-2 cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.15)]"
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                <span className="font-semibold">{currentUser.display_name}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => openAuthWithPrompt('Sign in to unlock personalized history tracking and encrypted records.')}
                className="glass-button-primary text-xs px-3.5 sm:px-4 py-2 rounded-xl font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-[0_0_18px_rgba(6,182,212,0.35)]"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
            )}
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 flex gap-6">
        {/* Sidebar for Presets & Project Metadata */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 glass-panel p-5 flex flex-col justify-between transform transition-transform duration-200 lg:static lg:translate-x-0 lg:w-64 lg:p-0 lg:bg-transparent lg:border-none lg:shadow-none ${
            sidebarOpen ? 'translate-x-0 bg-[#050B14]/95 backdrop-blur-2xl border-r border-cyan-500/20' : '-translate-x-full'
          }`}
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between lg:hidden border-b border-cyan-500/20 pb-3">
              <StressinaLogo size="sm" variant="full" />
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5 text-cyan-400" />
              </button>
            </div>

<<<<<<< HEAD
            {/* Quick Scenarios */}
=======
            {/* Quick Scenarios in Liquid Glass */}
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
            <div className="glass-panel rounded-2xl p-4 space-y-2.5 border-cyan-500/20">
              <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                Preset Scenarios
              </div>
              <p className="text-[11px] text-slate-300">Fast benchmark testing profiles:</p>

              <button
                type="button"
                onClick={() => loadPreset(30.0, 14.0, 3.5, 'High Stress')}
                className="w-full text-left p-2.5 rounded-xl glass-panel-interactive border-rose-500/25 hover:border-rose-400/50 text-xs transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-rose-300 font-semibold mb-0.5">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span>High Stress</span>
                </div>
                <div className="text-[10px] text-slate-400">HRV 30 · Screen 14h · Sleep 3.5h</div>
              </button>

              <button
                type="button"
                onClick={() => loadPreset(65.0, 7.0, 6.0, 'Medium Stress')}
                className="w-full text-left p-2.5 rounded-xl glass-panel-interactive border-amber-500/25 hover:border-amber-400/50 text-xs transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-amber-300 font-semibold mb-0.5">
                  <Coffee className="w-3.5 h-3.5 text-amber-400" />
                  <span>Medium Stress</span>
                </div>
                <div className="text-[10px] text-slate-400">HRV 65 · Screen 7h · Sleep 6.0h</div>
              </button>

              <button
                type="button"
                onClick={() => loadPreset(100.0, 2.0, 9.0, 'Low Stress')}
                className="w-full text-left p-2.5 rounded-xl glass-panel-interactive border-emerald-500/25 hover:border-emerald-400/50 text-xs transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-emerald-300 font-semibold mb-0.5">
                  <Sun className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Low Stress</span>
                </div>
                <div className="text-[10px] text-slate-400">HRV 100 · Screen 2h · Sleep 9.0h</div>
              </button>
            </div>

            {/* System Specification Card */}
            <div className="glass-panel rounded-2xl p-4 text-xs space-y-2 border-cyan-500/15">
              <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>Model Specifications</span>
              </div>
              <div className="space-y-1.5 text-[11px] text-slate-400">
                <div className="flex justify-between border-b border-cyan-500/10 pb-1">
                  <span>Architecture:</span>
                  <span className="text-cyan-300 font-semibold">Mamdani FIS</span>
                </div>
                <div className="flex justify-between border-b border-cyan-500/10 pb-1">
                  <span>Defuzzification:</span>
                  <span className="text-white font-medium">Centroid</span>
                </div>
                <div className="flex justify-between border-b border-cyan-500/10 pb-1">
                  <span>Rule Base:</span>
                  <span className="text-white font-medium">27 Core + 4 Supp.</span>
                </div>
                <div className="flex justify-between">
<<<<<<< HEAD
                  <span>Client Runtime:</span>
                  <span className="text-cyan-300 font-medium">Local TypeScript</span>
=======
                  <span>Design Language:</span>
                  <span className="text-cyan-300 font-medium">Liquid Glass</span>
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
                </div>
              </div>
              <p className="text-[10px] text-slate-400 pt-1 leading-snug">
                IT3182 Essentials of AI · Group 12 · KDU
              </p>
            </div>
          </div>
        </aside>

        {/* Center / Right Content Area */}
        <main className="flex-1 min-w-0 space-y-6">
<<<<<<< HEAD
          {/* Hero Banner */}
=======
          {/* Hero Banner in Liquid Glass */}
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
          <div className="glass-panel-glow rounded-3xl p-6 sm:p-7 relative overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.18)]">
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2 relative z-10">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                {APP_METADATA.course}
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-400/30 font-medium">
                Decision Support Prototype · Educational Science
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-1 relative z-10">
              {APP_METADATA.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed relative z-10">
              {APP_METADATA.subtitle}
            </p>
          </div>

<<<<<<< HEAD
          {/* Main Navigation Tabs */}
=======
          {/* Navigation Tabs Bar in Liquid Glass */}
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
          <div className="glass-panel rounded-2xl p-1.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none border-cyan-500/20">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
<<<<<<< HEAD
                    triggerHaptic('selection');
=======
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'glass-panel-glow text-cyan-200 border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                      : 'text-slate-400 hover:text-white hover:bg-cyan-500/10'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : ''}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab View */}
          <div className="min-h-[500px]">
            {activeTab === 'assessment' && (
              <AssessmentTab
                hrv={hrv}
                setHrv={setHrv}
                screenTime={screenTime}
                setScreenTime={setScreenTime}
                sleep={sleep}
                setSleep={setSleep}
                timeOption={timeOption}
                setTimeOption={setTimeOption}
                contextOption={contextOption}
                setContextOption={setContextOption}
                currentUser={currentUser}
<<<<<<< HEAD
                onOpenAuthModal={() => openAuthWithPrompt('Register your profile to record this assessment to your longitudinal timeline and claim 50 marks.', 'register')}
=======
                onOpenAuthModal={() => openAuthWithPrompt('Sign in to record this assessment to your longitudinal timeline.')}
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
                onAssessmentCompleted={(result) => setLastAssessment(result)}
                onOpenChatWithTopic={(topic) => {
                  setChatTopic(topic);
                  setActiveTab('chat');
                }}
<<<<<<< HEAD
                onNavigateToTab={(t) => setActiveTab(t)}
              />
            )}

            {activeTab === 'quests' && (
              <QuestsTab
                currentUser={currentUser}
                onOpenAuthModal={(m = 'register') =>
                  openAuthWithPrompt('Register your profile to permanently save your daily habit marks, streaks, and achievements.', m)
                }
                onNavigateToTab={(t) => setActiveTab(t)}
              />
            )}

            {(activeTab === 'breathing' || activeTab === 'games') && (
              <RelaxAndPlayTab
                currentUser={currentUser}
                initialActivity="breathing"
=======
              />
            )}

            {activeTab === 'games' && (
              <RelaxAndPlayTab
                currentUser={currentUser}
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
                onOpenAuthModal={() => openAuthWithPrompt('Sign in to store your breathing milestones and reflection logs.')}
              />
            )}

<<<<<<< HEAD
            {activeTab === 'candy_crush' && (
              <StressCrushGame
                currentUser={currentUser}
                onOpenAuthModal={() => openAuthWithPrompt('Register or sign in to save your Stress Crush high score and daily marks.')}
                onNavigateToBreathing={() => setActiveTab('breathing')}
              />
            )}

=======
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
            {activeTab === 'chat' && (
              <ChatTab
                currentUser={currentUser}
                onOpenAuthModal={() => openAuthWithPrompt('Sign in to preserve your wellbeing chat history across sessions.')}
                assessmentContext={
                  lastAssessment
                    ? {
                        index: lastAssessment.inference.crisp_stress_index,
                        category: lastAssessment.category,
                        hrv,
                        screen: screenTime,
                        sleep,
                        action: lastAssessment.recommendation.title,
                      }
                    : null
                }
                initialTopic={chatTopic}
                onClearInitialTopic={() => setChatTopic('')}
              />
            )}

            {activeTab === 'history' && (
              <HistoryTab
                currentUser={currentUser}
                lastAssessment={lastAssessment}
                onOpenAuthModal={() => openAuthWithPrompt('Sign in to unlock your private stress logs and longitudinal trend curves.')}
              />
            )}

            {activeTab === 'account' && (
              <AccountTab currentUser={currentUser} onUserChanged={(u) => setCurrentUser(u)} />
            )}

            {activeTab === 'counsellor' && <CounsellorTab currentUser={currentUser} />}

            {activeTab === 'visuals' && (
              <MembershipTab
                hrv={hrv}
                screenTime={screenTime}
                sleep={sleep}
                inferenceResult={lastAssessment?.inference}
              />
            )}

            {activeTab === 'arch' && (
              <div className="space-y-6">
                <div className="glass-panel rounded-2xl p-6 border-cyan-500/20">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                    System Architecture
                  </span>
                  <h3 className="text-base font-bold text-white mb-1">
                    Eight-Stage End-to-End System Pipeline
                  </h3>
                  <p className="text-xs text-slate-300">
                    Visual representation of the decoupled software architecture, designed for university academic evaluation.
                  </p>
                </div>
                <ArchitectureDiagram />
              </div>
            )}

            {activeTab === 'dataset' && <DatasetTab />}
          </div>
        </main>
      </div>

<<<<<<< HEAD
      {/* Footer */}
=======
      {/* Footer Note in Liquid Glass */}
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
      <footer className="border-t border-cyan-500/15 glass-panel py-7 px-4 text-center text-xs text-slate-400 mt-10">
        <div className="max-w-4xl mx-auto space-y-3 flex flex-col items-center">
          <StressinaLogo size="sm" variant="full" />
          <p className="text-slate-300 max-w-2xl leading-relaxed">{APP_METADATA.disclaimer}</p>
          <p className="text-[11px] text-cyan-400/80 font-mono">
            IT3182 Essentials of AI · Group 12 · General Sir John Kotelawala Defence University
          </p>
        </div>
      </footer>

      {/* App-Wide Floating Chat Popup with mobile-ready visibility */}
      <FloatingChat
        isOpenControlled={floatingChatOpen}
        onToggleOpen={(open) => setFloatingChatOpen(open)}
        onNavigateToTab={(t) => {
          setActiveTab(t);
          setFloatingChatOpen(false);
        }}
      />
    </div>
  );
};
