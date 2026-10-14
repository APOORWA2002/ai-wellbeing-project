import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Check,
  Wind,
  Eye,
  Sparkles,
  Smile,
  Volume2,
  VolumeX,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { UserAccount } from '../../types';
import { store } from '../../storage/store';

interface RelaxAndPlayTabProps {
  currentUser: UserAccount | null;
  onOpenAuthModal?: () => void;
}

type ActivityType = 'breathing' | 'grounding' | 'matching' | 'checkin';
type BreathingTechnique = 'gentle' | 'box' | 'deep';

interface BreathPhaseConfig {
  name: 'Inhale' | 'Hold' | 'Exhale' | 'Rest';
  duration: number; // seconds
  prompt: string;
  orbScale: number;
  glowIntensity: string;
}

export const RelaxAndPlayTab: React.FC<RelaxAndPlayTabProps> = ({
  currentUser,
  onOpenAuthModal,
}) => {
  const [selectedActivity, setSelectedActivity] = useState<ActivityType>('breathing');
  const [statusMessage, setStatusMessage] = useState<string>('');

  // ==========================================
  // 1. LIQUID GLASS GUIDED BREATHING SANCTUARY
  // ==========================================
  const [technique, setTechnique] = useState<BreathingTechnique>('gentle');
  const [durationMinutes, setDurationMinutes] = useState<number>(2);
  const [breathState, setBreathState] = useState<'stopped' | 'running' | 'paused' | 'completed'>('stopped');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Runtime timing state
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState<number>(0);
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState<number>(4);
  const [totalSecondsLeft, setTotalSecondsLeft] = useState<number>(120);
  const [reflectionText, setReflectionText] = useState<string>('');
  const [reflectionSaved, setReflectionSaved] = useState<boolean>(false);

  // Define techniques and multi-phase rhythms
  const techniqueConfigs: Record<BreathingTechnique, { title: string; subtitle: string; phases: BreathPhaseConfig[] }> = {
    gentle: {
      title: 'Gentle Wave (4-4)',
      subtitle: 'Smooth, continuous rhythmic breathing to stabilize heart rate variability.',
      phases: [
        { name: 'Inhale', duration: 4, prompt: 'Breathe in slowly through your nose...', orbScale: 1.15, glowIntensity: 'rgba(34, 211, 238, 0.7)' },
        { name: 'Exhale', duration: 4, prompt: 'Gently release breath through your mouth...', orbScale: 0.85, glowIntensity: 'rgba(6, 182, 212, 0.3)' },
      ],
    },
    box: {
      title: 'Box Breathing (4-4-4-4)',
      subtitle: 'Navy SEAL grounding technique to calm an overstimulated nervous system.',
      phases: [
        { name: 'Inhale', duration: 4, prompt: 'Inhale deeply and expand your ribs...', orbScale: 1.2, glowIntensity: 'rgba(34, 211, 238, 0.8)' },
        { name: 'Hold', duration: 4, prompt: 'Hold your breath gently. Stay relaxed...', orbScale: 1.2, glowIntensity: 'rgba(56, 189, 248, 0.7)' },
        { name: 'Exhale', duration: 4, prompt: 'Exhale completely and let shoulders drop...', orbScale: 0.8, glowIntensity: 'rgba(6, 182, 212, 0.4)' },
        { name: 'Rest', duration: 4, prompt: 'Rest empty before the next breath begins...', orbScale: 0.8, glowIntensity: 'rgba(14, 165, 233, 0.3)' },
      ],
    },
    deep: {
      title: '4-7-8 Deep Relaxation',
      subtitle: 'Parasympathetic nerve activator formulated for severe anxiety and sleep preparation.',
      phases: [
        { name: 'Inhale', duration: 4, prompt: 'Quiet inhalation through the nose (4s)...', orbScale: 1.25, glowIntensity: 'rgba(34, 211, 238, 0.85)' },
        { name: 'Hold', duration: 7, prompt: 'Hold breath serenely (7s)...', orbScale: 1.25, glowIntensity: 'rgba(56, 189, 248, 0.75)' },
        { name: 'Exhale', duration: 8, prompt: 'Whoosh breath out through parted lips (8s)...', orbScale: 0.78, glowIntensity: 'rgba(6, 182, 212, 0.35)' },
      ],
    },
  };

  const activePhases = techniqueConfigs[technique].phases;
  const currentPhase = activePhases[currentPhaseIndex] || activePhases[0];

  // Soft synthetic chime via native Web Audio API (Zero external audio assets)
  const playCalmTone = (freq = 528) => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.3);
    } catch {
      // Audio autoplay policy fallback
    }
  };

  // Main timer loop
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;

    if (breathState === 'running') {
      timer = setInterval(() => {
        setTotalSecondsLeft((prevTotal) => {
          if (prevTotal <= 1) {
            // Completed!
            setBreathState('completed');
            playCalmTone(639);
            return 0;
          }
          return prevTotal - 1;
        });

        setPhaseSecondsLeft((prevPhaseSec) => {
          if (prevPhaseSec <= 1) {
            // Next phase
            const nextIdx = (currentPhaseIndex + 1) % activePhases.length;
            setCurrentPhaseIndex(nextIdx);
            playCalmTone(nextIdx === 0 ? 528 : 432);
            return activePhases[nextIdx].duration;
          }
          return prevPhaseSec - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [breathState, currentPhaseIndex, activePhases, soundEnabled]);

  const startBreathing = () => {
    if (breathState === 'stopped' || breathState === 'completed') {
      setTotalSecondsLeft(durationMinutes * 60);
      setCurrentPhaseIndex(0);
      setPhaseSecondsLeft(activePhases[0].duration);
      setReflectionText('');
      setReflectionSaved(false);
      playCalmTone(528);
    }
    setBreathState('running');
  };

  const pauseBreathing = () => {
    setBreathState('paused');
  };

  const resetBreathing = () => {
    setBreathState('stopped');
    setTotalSecondsLeft(durationMinutes * 60);
    setCurrentPhaseIndex(0);
    setPhaseSecondsLeft(activePhases[0].duration);
    setReflectionSaved(false);
  };

  const handleFinishAndSave = () => {
    const elapsedSeconds = durationMinutes * 60 - totalSecondsLeft || durationMinutes * 60;
    const desc = `Technique: ${techniqueConfigs[technique].title}. ${reflectionText ? `Note: ${reflectionText}` : ''}`;

    if (currentUser) {
      const prefs = store.getPreferences(currentUser.id);
      if (prefs.save_games) {
        store.saveGameSession(currentUser.id, `Breathing (${technique})`, elapsedSeconds, desc);
        setStatusMessage(`Saved session (${Math.round(elapsedSeconds / 60)} min) to your account timeline.`);
      }
    }
    setReflectionSaved(true);
    setTimeout(() => {
      resetBreathing();
      setStatusMessage('');
    }, 2500);
  };

  // ==========================================
  // 2. 5-4-3-2-1 GROUNDING
  // ==========================================
  const [groundingStep, setGroundingStep] = useState<number>(0);
  const [groundingReflections, setGroundingReflections] = useState<string[]>(['', '', '', '', '']);

  const groundingSteps = [
    { title: '5 things you can see', prompt: 'Look around your surroundings. Notice five distinct visual objects, textures, or colors in this room.' },
    { title: '4 things you can physically feel', prompt: 'Notice four physical points of contact: the weight of your feet on the ground, clothes on skin, or air warmth.' },
    { title: '3 things you can hear', prompt: 'Listen past immediate ambient noise. Pick out three subtle acoustic layers near or outside.' },
    { title: '2 things you can smell', prompt: 'Notice two scents in your environment, or recall two comforting, familiar aromas.' },
    { title: '1 thing you can taste', prompt: 'Notice one taste or the physical sensation resting inside your mouth.' },
  ];

  const handleGroundingNext = () => {
    if (groundingStep < 4) {
      setGroundingStep((prev) => prev + 1);
    } else {
      setGroundingStep(5); // finished
      if (currentUser) {
        const text = groundingReflections.filter(Boolean).join('; ');
        store.saveGameSession(currentUser.id, '5-4-3-2-1 Grounding', 120, text);
        setStatusMessage('Grounding practice saved to your personal history.');
        setTimeout(() => setStatusMessage(''), 4000);
      }
    }
  };

  // ==========================================
  // 3. CALM MATCHING PAIRS
  // ==========================================
  const symbols = ['🌿', '🌙', '🌊', '✨'];
  const [matchingCards, setMatchingCards] = useState<string[]>([]);
  const [openCards, setOpenCards] = useState<number[]>([]);
  const [matchedIndices, setMatchedIndices] = useState<number[]>([]);

  const initMatchingGame = () => {
    const deck = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
    setMatchingCards(deck);
    setOpenCards([]);
    setMatchedIndices([]);
  };

  useEffect(() => {
    initMatchingGame();
  }, []);

  const handleCardClick = (idx: number) => {
    if (matchedIndices.includes(idx) || openCards.includes(idx)) return;

    if (openCards.length === 2) {
      setOpenCards([idx]);
      return;
    }

    const nextOpen = [...openCards, idx];
    setOpenCards(nextOpen);

    if (nextOpen.length === 2) {
      const [first, second] = nextOpen;
      if (matchingCards[first] === matchingCards[second]) {
        const nextMatched = [...matchedIndices, first, second];
        setMatchedIndices(nextMatched);
        setOpenCards([]);
        if (nextMatched.length === 8 && currentUser) {
          store.saveGameSession(currentUser.id, 'Calm Memory Pairs', 60, 'Completed all tranquil matches');
          setStatusMessage('Memory session recorded to history.');
          setTimeout(() => setStatusMessage(''), 3000);
        }
      }
    }
  };

  // ==========================================
  // 4. MINDFUL CHECK-IN
  // ==========================================
  const [mood, setMood] = useState<string>('Calm');
  const [supportActivity, setSupportActivity] = useState<string>('Deep breathing');
  const [helpfulScore, setHelpfulScore] = useState<string>('Very helpful');
  const [checkinComplete, setCheckinComplete] = useState<boolean>(false);

  const handleCheckinSubmit = () => {
    setCheckinComplete(true);
    if (currentUser) {
      const reflection = `Mood: ${mood} · Intervention: ${supportActivity} · Self-rating: ${helpfulScore}`;
      store.saveGameSession(currentUser.id, 'Mindfulness Check-in', 60, reflection);
      setStatusMessage('Check-in logged into your personal records.');
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  const formatMinutesSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6">
      {/* Liquid Glass Header & Activity Switcher */}
      <div className="glass-panel rounded-2xl p-6 sm:p-7 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                Interactive Sanctuary
              </span>
              <span className="text-[10px] text-cyan-300/80 px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/20">
                Liquid Glass Engine
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Relax & Restore
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed mt-0.5">
              Sensory-calming, paced exercises engineered to stimulate parasympathetic vagal response and restore biological equilibrium.
            </p>
          </div>

          {!currentUser && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-xs text-cyan-200 shrink-0">
              <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Login to save breathing sessions to your timeline.</span>
              {onOpenAuthModal && (
                <button
                  type="button"
                  onClick={onOpenAuthModal}
                  className="px-2.5 py-1 text-[11px] font-semibold text-white bg-cyan-600/80 hover:bg-cyan-500 rounded-lg transition-colors cursor-pointer"
                >
                  Sign In
                </button>
              )}
            </div>
          )}
        </div>

        {statusMessage && (
          <div className="mb-4 p-3 rounded-xl bg-cyan-950/70 border border-cyan-400/40 text-cyan-200 text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Liquid Glass Segmented Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { id: 'breathing', label: 'Guided Breathing', icon: Wind },
            { id: 'grounding', label: '5-4-3-2-1 Grounding', icon: Eye },
            { id: 'matching', label: 'Calm Pairs', icon: Sparkles },
            { id: 'checkin', label: 'Mindful Check-in', icon: Smile },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = selectedActivity === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedActivity(item.id as ActivityType)}
                className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'glass-panel-glow text-cyan-200 border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                    : 'glass-panel-interactive text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : ''}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. LIQUID GLASS BREATHING SANCTUARY                           */}
      {/* ============================================================== */}
      {selectedActivity === 'breathing' && (
        <div className="glass-panel-glow rounded-3xl p-6 sm:p-10 relative overflow-hidden">
          {/* Ambient radial blur backlight */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Controls: Technique, Duration, Sound */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-cyan-500/15 pb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Technique:</span>
              {(['gentle', 'box', 'deep'] as BreathingTechnique[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  disabled={breathState === 'running'}
                  onClick={() => {
                    setTechnique(t);
                    setBreathState('stopped');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer disabled:opacity-50 ${
                    technique === t
                      ? 'bg-cyan-500/25 border border-cyan-400/60 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                      : 'bg-slate-900/40 border border-slate-700/50 text-slate-400 hover:text-white'
                  }`}
                >
                  {techniqueConfigs[t].title.split(' (')[0]}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400 font-medium">Session:</span>
                {[1, 2, 3, 5].map((m) => (
                  <button
                    key={m}
                    type="button"
                    disabled={breathState === 'running'}
                    onClick={() => {
                      setDurationMinutes(m);
                      setTotalSecondsLeft(m * 60);
                      setBreathState('stopped');
                    }}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 ${
                      durationMinutes === m
                        ? 'bg-cyan-400 text-slate-950 font-bold'
                        : 'bg-slate-900/50 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {m}m
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  soundEnabled
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                    : 'bg-slate-900/50 border-slate-800 text-slate-500'
                }`}
                title={soundEnabled ? 'Chime sound enabled' : 'Muted'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Subtitle / Technique Explainer */}
          <div className="text-center my-6 relative z-10">
            <h3 className="text-base font-semibold text-white tracking-wide">
              {techniqueConfigs[technique].title}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              {techniqueConfigs[technique].subtitle}
            </p>
          </div>

          {/* Liquid Glass Orb Centerpiece */}
          <div className="relative py-12 sm:py-16 flex flex-col items-center justify-center">
            {/* Outer halo waves */}
            <div
              className="absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full transition-all duration-1000 ease-in-out pointer-events-none"
              style={{
                transform: `scale(${breathState === 'running' ? currentPhase.orbScale * 1.15 : 1})`,
                background: `radial-gradient(circle, ${currentPhase.glowIntensity} 0%, rgba(6, 182, 212, 0.02) 70%, transparent 100%)`,
                filter: 'blur(25px)',
              }}
            />

            {/* Middle glass ripple ring */}
            <div
              className="absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full border border-cyan-400/25 transition-all duration-1000 ease-out pointer-events-none"
              style={{
                transform: `scale(${breathState === 'running' ? currentPhase.orbScale * 1.06 : 1})`,
                boxShadow: `0 0 30px ${currentPhase.glowIntensity}`,
              }}
            />

            {/* Main Interactive Translucent Cyan Glass Orb */}
            <div
              className="relative w-52 h-52 sm:w-60 sm:h-60 rounded-full flex flex-col items-center justify-center text-center p-6 transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1) cursor-pointer select-none"
              style={{
                transform: `scale(${breathState === 'running' ? currentPhase.orbScale : 1})`,
                background: 'radial-gradient(circle at 35% 30%, rgba(103, 232, 249, 0.25) 0%, rgba(6, 182, 212, 0.12) 45%, rgba(10, 24, 46, 0.85) 90%)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1.5px solid rgba(103, 232, 249, 0.45)',
                boxShadow: `0 0 50px rgba(6, 182, 212, 0.35), inset 0 2px 4px 0 rgba(255, 255, 255, 0.35), inset 0 -4px 12px 0 rgba(6, 182, 212, 0.2)`,
              }}
              onClick={() => {
                if (breathState === 'running') pauseBreathing();
                else startBreathing();
              }}
            >
              {/* Internal Refraction Highlight */}
              <div className="absolute top-3 left-6 w-20 h-10 rounded-full bg-gradient-to-b from-white/30 to-transparent transform -rotate-12 blur-[1px] pointer-events-none" />

              {breathState === 'stopped' && (
                <div className="space-y-2">
                  <Play className="w-10 h-10 text-cyan-300 mx-auto fill-cyan-400/30" />
                  <div className="text-sm font-bold text-white tracking-wider uppercase">
                    Begin Sanctuary
                  </div>
                  <div className="text-[11px] text-cyan-300/80 font-mono">
                    {formatMinutesSeconds(durationMinutes * 60)}
                  </div>
                </div>
              )}

              {breathState === 'paused' && (
                <div className="space-y-1.5 z-10 flex flex-col items-center">
                  <Pause className="w-9 h-9 text-amber-300 mx-auto fill-amber-400/30" />
                  <div className="text-sm font-bold text-white tracking-wider uppercase">
                    Session Paused
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-[11px] font-mono font-bold text-cyan-200">
                    <Clock className="w-3.5 h-3.5 text-amber-300" />
                    <span>{formatMinutesSeconds(totalSecondsLeft)} remaining</span>
                  </div>
                  <div className="text-[10px] text-slate-300 mt-1">Tap orb to resume</div>
                </div>
              )}

              {breathState === 'running' && (
                <div className="space-y-1 z-10 animate-fade-in flex flex-col items-center">
                  <div className="text-xs uppercase font-mono font-bold tracking-widest text-cyan-300">
                    {currentPhase.name}
                  </div>
                  <div className="text-4xl sm:text-5xl font-black text-white tracking-tighter tabular-nums drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]">
                    {phaseSecondsLeft}
                  </div>
                  <div className="text-[10px] text-cyan-200/90 font-medium max-w-[150px] leading-tight">
                    {currentPhase.prompt}
                  </div>
                  {/* Real-time Session Countdown Timer Inside Focal Orb */}
                  <div className="mt-2 flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-[11px] font-mono font-bold text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.35)]">
                    <Clock className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    <span>{formatMinutesSeconds(totalSecondsLeft)} remaining</span>
                  </div>
                </div>
              )}

              {breathState === 'completed' && (
                <div className="space-y-2">
                  <Check className="w-10 h-10 text-emerald-300 mx-auto" />
                  <div className="text-sm font-bold text-white">Complete</div>
                  <div className="text-[11px] text-emerald-200">Peaceful Mind</div>
                </div>
              )}
            </div>
          </div>

          {/* Visual Countdown Timer HUD & Session Controls */}
          <div className="relative z-10 max-w-lg mx-auto space-y-4">
            {/* Dedicated Visual Countdown Timer Card */}
            <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-cyan-400/35 bg-slate-950/50 shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Radial SVG Circular Countdown Gauge */}
              <div className="relative flex items-center justify-center shrink-0">
                <svg className="w-24 h-24 transform -rotate-90">
                  {/* Background Track */}
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="rgba(6, 182, 212, 0.15)"
                    strokeWidth="6"
                    className="fill-transparent"
                  />
                  {/* Animated Active Countdown Progress Arc */}
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="url(#sessionCountdownGradient)"
                    strokeWidth="6"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={(2 * Math.PI * 40) * (totalSecondsLeft / (durationMinutes * 60))}
                    strokeLinecap="round"
                    className="fill-transparent transition-all duration-1000 ease-linear"
                  />
                  <defs>
                    <linearGradient id="sessionCountdownGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Center of Gauge: Mini Clock & Percentage */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <Clock
                    className={`w-4 h-4 ${
                      breathState === 'running'
                        ? 'text-cyan-300 animate-pulse'
                        : breathState === 'paused'
                        ? 'text-amber-300'
                        : 'text-slate-400'
                    }`}
                  />
                  <span className="text-[10px] font-mono font-bold text-cyan-200 mt-0.5">
                    {Math.round(((durationMinutes * 60 - totalSecondsLeft) / (durationMinutes * 60)) * 100)}%
                  </span>
                </div>
              </div>

              {/* Digital Countdown Timer Readout & Status */}
              <div className="flex-1 text-center sm:text-left space-y-1 w-full">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                    Session Countdown
                  </span>
                  {breathState === 'running' && (
                    <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-400/40 font-medium shadow-[0_0_8px_rgba(6,182,212,0.3)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                      Active
                    </span>
                  )}
                  {breathState === 'paused' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/40 font-medium">
                      Paused
                    </span>
                  )}
                  {breathState === 'stopped' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-700 font-medium">
                      Ready
                    </span>
                  )}
                  {breathState === 'completed' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-medium">
                      Complete
                    </span>
                  )}
                </div>

                {/* Giant Digital Remaining Time Display */}
                <div className="flex items-baseline justify-center sm:justify-start gap-2">
                  <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                    {formatMinutesSeconds(totalSecondsLeft)}
                  </div>
                  <span className="text-xs text-cyan-300 font-medium uppercase tracking-wider">
                    Remaining
                  </span>
                </div>

                {/* Progress Details Bar */}
                <div className="space-y-1 pt-1">
                  <div className="w-full h-1.5 rounded-full bg-slate-900/80 border border-cyan-500/20 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-cyan-300 transition-all duration-1000 rounded-full"
                      style={{
                        width: `${Math.max(0, 100 - (totalSecondsLeft / (durationMinutes * 60)) * 100)}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Elapsed: {formatMinutesSeconds(durationMinutes * 60 - totalSecondsLeft)}</span>
                    <span>Target: {durationMinutes}m 00s</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
              {breathState === 'running' ? (
                <>
                  <button
                    type="button"
                    onClick={pauseBreathing}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600 transition-all cursor-pointer flex items-center gap-2 shadow-[0_0_10px_rgba(0,0,0,0.3)]"
                  >
                    <Pause className="w-4 h-4 text-amber-300" />
                    <span>Pause</span>
                  </button>
                  <button
                    type="button"
                    onClick={resetBreathing}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleFinishAndSave}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-cyan-300 hover:text-white bg-cyan-950/60 hover:bg-cyan-900/70 border border-cyan-500/30 transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                  >
                    <Check className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Complete Early & Save</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={startBreathing}
                    className="glass-button-primary px-7 py-3 rounded-xl text-xs font-bold tracking-wide uppercase flex items-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(6,182,212,0.45)] hover:scale-105 active:scale-95 transition-all"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>{breathState === 'paused' ? 'Resume Session' : 'Start Breathing Session'}</span>
                  </button>
                  {breathState === 'paused' && (
                    <>
                      <button
                        type="button"
                        onClick={resetBreathing}
                        className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/60 border border-slate-800 cursor-pointer"
                      >
                        Reset
                      </button>
                      <button
                        type="button"
                        onClick={handleFinishAndSave}
                        className="px-4 py-2.5 rounded-xl text-xs font-semibold text-cyan-300 hover:text-white bg-cyan-950/60 border border-cyan-500/30 cursor-pointer flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Finish & Save</span>
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Completion & Reflection Dialog */}
          {breathState === 'completed' && (
            <div className="mt-8 pt-6 border-t border-cyan-500/20 max-w-lg mx-auto text-center space-y-4 animate-fade-in">
              <h4 className="text-sm font-bold text-white flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>How do you feel after this session?</span>
              </h4>
              <p className="text-xs text-slate-300">
                Take a moment to register your physiological state.
              </p>

              <input
                type="text"
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                placeholder="e.g., Shoulders feel lighter, breathing feels deeper..."
                className="w-full glass-input px-4 py-2.5 rounded-xl text-xs"
              />

              <div className="flex items-center justify-center gap-3">
                {currentUser ? (
                  <button
                    type="button"
                    disabled={reflectionSaved}
                    onClick={handleFinishAndSave}
                    className="glass-button-primary px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{reflectionSaved ? 'Saved to Timeline!' : 'Save Reflection'}</span>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[11px] text-cyan-300">
                      Sign in to store this breathing milestone to your wellness profile.
                    </p>
                    {onOpenAuthModal && (
                      <button
                        type="button"
                        onClick={onOpenAuthModal}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 transition-colors cursor-pointer"
                      >
                        Sign In Now
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. 5-4-3-2-1 GROUNDING TECHNIQUE                               */}
      {/* ============================================================== */}
      {selectedActivity === 'grounding' && (
        <div className="glass-panel-glow rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-cyan-500/15 pb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
              Sensory Stabilization
            </span>
            <h3 className="text-base font-bold text-white">5-4-3-2-1 Sensory Grounding</h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Anchor your awareness in the physical environment to disrupt panic and racing thoughts.
            </p>
          </div>

          {groundingStep < 5 ? (
            <div className="space-y-5 max-w-xl mx-auto py-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-cyan-300">
                  Step {groundingStep + 1} of 5
                </span>
                <span className="font-mono">{5 - groundingStep} sensory anchor</span>
              </div>

              <div className="glass-panel p-5 rounded-2xl space-y-3 border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center text-xs font-mono font-bold">
                    {5 - groundingStep}
                  </span>
                  <span>{groundingSteps[groundingStep].title}</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {groundingSteps[groundingStep].prompt}
                </p>

                <textarea
                  rows={2}
                  value={groundingReflections[groundingStep]}
                  onChange={(e) => {
                    const next = [...groundingReflections];
                    next[groundingStep] = e.target.value;
                    setGroundingReflections(next);
                  }}
                  placeholder="Type what you notice here (optional)..."
                  className="w-full glass-input p-3 rounded-xl text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  disabled={groundingStep === 0}
                  onClick={() => setGroundingStep((p) => p - 1)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={handleGroundingNext}
                  className="glass-button-primary px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <span>{groundingStep === 4 ? 'Complete Grounding' : 'Next Sense'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 space-y-4 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">Grounding Completed</h4>
              <p className="text-xs text-slate-300">
                You took mindful control of your attention. Notice how your body feels right now compared to when you started.
              </p>
              <button
                type="button"
                onClick={() => {
                  setGroundingStep(0);
                  setGroundingReflections(['', '', '', '', '']);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/60 border border-slate-700 cursor-pointer"
              >
                Restart Grounding
              </button>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. CALM MATCHING PAIRS                                         */}
      {/* ============================================================== */}
      {selectedActivity === 'matching' && (
        <div className="glass-panel-glow rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-cyan-500/15 pb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                Gentle Cognitive Focus
              </span>
              <h3 className="text-base font-bold text-white">Calm Memory Pairs</h3>
            </div>
            <button
              type="button"
              onClick={initMatchingGame}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-700 cursor-pointer"
            >
              Shuffle
            </button>
          </div>

          <p className="text-xs text-slate-300">
            A quiet 8-card matching exercise to ease cognitive clutter and softly engage working memory.
          </p>

          <div className="grid grid-cols-4 gap-3 max-w-md mx-auto py-4">
            {matchingCards.map((symbol, idx) => {
              const isMatched = matchedIndices.includes(idx);
              const isOpen = openCards.includes(idx);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleCardClick(idx)}
                  className={`h-24 rounded-2xl border flex items-center justify-center text-2xl transition-all cursor-pointer ${
                    isOpen || isMatched
                      ? 'glass-panel-glow border-cyan-400/60 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                      : 'glass-panel-interactive border-slate-700/60 hover:border-cyan-500/40 text-transparent'
                  }`}
                >
                  {isOpen || isMatched ? symbol : '•'}
                </button>
              );
            })}
          </div>

          {matchedIndices.length === 8 && (
            <div className="text-center p-4 rounded-xl bg-cyan-950/40 border border-cyan-400/40 text-cyan-200 text-xs font-semibold animate-fade-in">
              ✨ All peaceful pairs matched! Your mind has settled.
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. MINDFUL CHECK-IN                                            */}
      {/* ============================================================== */}
      {selectedActivity === 'checkin' && (
        <div className="glass-panel-glow rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-cyan-500/15 pb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
              Personal Tracking
            </span>
            <h3 className="text-base font-bold text-white">Daily Wellbeing Check-in</h3>
            <p className="text-xs text-slate-300 mt-0.5">
              A private note on how you are experiencing this moment.
            </p>
          </div>

          {!checkinComplete ? (
            <div className="max-w-md mx-auto space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Current Feeling</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Calm', 'Tense', 'Fatigued', 'Steady', 'Overwhelmed', 'Restless'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMood(m)}
                      className={`p-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                        mood === m
                          ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                          : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Helpful Focus Today</label>
                <select
                  value={supportActivity}
                  onChange={(e) => setSupportActivity(e.target.value)}
                  className="w-full glass-input px-3 py-2 rounded-xl text-xs cursor-pointer"
                >
                  <option value="Deep breathing">Deep breathing break</option>
                  <option value="Step away from screen">Short screen hiatus</option>
                  <option value="Hydration & posture">Hydration and physical stretch</option>
                  <option value="Listening to companion">Talking things through in chat</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleCheckinSubmit}
                className="w-full glass-button-primary py-2.5 rounded-xl text-xs font-bold mt-2 cursor-pointer"
              >
                Log Check-in
              </button>
            </div>
          ) : (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="w-10 h-10 text-cyan-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">Check-in Recorded</h4>
              <p className="text-xs text-slate-300">
                Self-awareness is the first step toward autonomic nervous regulation.
              </p>
              <button
                type="button"
                onClick={() => setCheckinComplete(false)}
                className="text-xs text-cyan-400 hover:underline pt-2 cursor-pointer"
              >
                Log another check-in
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
