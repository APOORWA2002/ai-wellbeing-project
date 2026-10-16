import React, { useState, useEffect } from 'react';
import {
  Clock,
  MapPin,
  RefreshCw,
  Download,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Heart,
  Monitor,
  Moon,
  Sparkles,
  Bookmark,
  CheckCircle2,
  Lock,
<<<<<<< HEAD
  Trophy,
  ArrowRight,
  Wind,
} from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';
=======
} from 'lucide-react';
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
import {
  AVAILABLE_TIME_OPTIONS,
  CONTEXT_OPTIONS,
  UNIVERSE_CONFIG,
} from '../../engine/fuzzyConfig';
import { runFuzzyInference } from '../../engine/inference';
import { classifyStress, getCategoryBadgeInfo } from '../../engine/classifier';
import { selectCopingRecommendation } from '../../recommendation/recommendationEngine';
import { generateExplanation } from '../../explanation/explanationEngine';
import { ALL_RULES_DATA } from '../../engine/rules';
import {
  CopingRecommendation,
  ExplanationPayload,
  InferenceResult,
  StressCategory,
  UserAccount,
} from '../../types';
import { store } from '../../storage/store';

interface AssessmentTabProps {
  hrv: number;
  setHrv: (v: number) => void;
  screenTime: number;
  setScreenTime: (v: number) => void;
  sleep: number;
  setSleep: (v: number) => void;
  timeOption: string;
  setTimeOption: (v: string) => void;
  contextOption: string;
  setContextOption: (v: string) => void;
  currentUser?: UserAccount | null;
  onOpenAuthModal?: () => void;
  onAssessmentCompleted?: (result: {
    inference: InferenceResult;
    category: StressCategory;
    recommendation: CopingRecommendation;
    explanation: ExplanationPayload;
  }) => void;
  onOpenChatWithTopic?: (topic: string) => void;
<<<<<<< HEAD
  onNavigateToTab?: (tab: string) => void;
=======
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
}

export const AssessmentTab: React.FC<AssessmentTabProps> = ({
  hrv,
  setHrv,
  screenTime,
  setScreenTime,
  sleep,
  setSleep,
  timeOption,
  setTimeOption,
  contextOption,
  setContextOption,
  currentUser,
  onOpenAuthModal,
  onAssessmentCompleted,
  onOpenChatWithTopic,
<<<<<<< HEAD
  onNavigateToTab,
=======
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
}) => {
  const [continuousMode, setContinuousMode] = useState<boolean>(true);
  const [inferenceResult, setInferenceResult] = useState<InferenceResult | null>(null);
  const [category, setCategory] = useState<StressCategory>('Medium');
  const [recommendation, setRecommendation] = useState<CopingRecommendation | null>(null);
  const [explanation, setExplanation] = useState<ExplanationPayload | null>(null);

  // Save state
  const [saveStatus, setSaveStatus] = useState<string>('');

  // Accordion states
  const [showHowCalculated, setShowHowCalculated] = useState<boolean>(false);
  const [showTransparency, setShowTransparency] = useState<boolean>(false);
  const [showAllRules, setShowAllRules] = useState<boolean>(false);

  // Validation
  const validate = () => {
    if (hrv < UNIVERSE_CONFIG.hrv.min || hrv > UNIVERSE_CONFIG.hrv.max) {
      return `HRV value ${hrv} ms is out of valid range [${UNIVERSE_CONFIG.hrv.min}, ${UNIVERSE_CONFIG.hrv.max}] ms.`;
    }
    if (screenTime < UNIVERSE_CONFIG.screen_time.min || screenTime > UNIVERSE_CONFIG.screen_time.max) {
      return `Screen Time ${screenTime} h is out of valid range [${UNIVERSE_CONFIG.screen_time.min}, ${UNIVERSE_CONFIG.screen_time.max}] h.`;
    }
    if (sleep < UNIVERSE_CONFIG.sleep_duration.min || sleep > UNIVERSE_CONFIG.sleep_duration.max) {
      return `Sleep Duration ${sleep} h is out of valid range [${UNIVERSE_CONFIG.sleep_duration.min}, ${UNIVERSE_CONFIG.sleep_duration.max}] h.`;
    }
    return null;
  };

  const validationError = validate();

  // Run calculation
  const executeAnalysis = () => {
<<<<<<< HEAD
    if (validationError) {
      triggerHaptic('warning');
      return;
    }
    triggerHaptic('medium');
=======
    if (validationError) return;
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6

    const res = runFuzzyInference(hrv, screenTime, sleep);
    const cat = classifyStress(res.crisp_stress_index);

    let stressorHint: string | undefined = undefined;
    if (res.memberships.sleep_duration.inadequate >= 0.4) {
      stressorHint = 'sleep';
    } else if (res.memberships.screen_time.prolonged >= 0.4) {
      stressorHint = 'screen';
    } else if (res.memberships.hrv.low >= 0.5) {
      stressorHint = 'breathing';
    }

    const rec = selectCopingRecommendation(cat, timeOption, contextOption, stressorHint);
    const exp = generateExplanation(res, cat, rec);

    setInferenceResult(res);
    setCategory(cat);
    setRecommendation(rec);
    setExplanation(exp);
    setSaveStatus('');

    if (onAssessmentCompleted) {
      onAssessmentCompleted({
        inference: res,
        category: cat,
        recommendation: rec,
        explanation: exp,
      });
    }
  };

  // Re-run on slider changes if continuous mode is enabled
  useEffect(() => {
    if (continuousMode && !validationError) {
      executeAnalysis();
    }
  }, [hrv, screenTime, sleep, timeOption, contextOption, continuousMode]);

  const resetDefaults = () => {
<<<<<<< HEAD
    triggerHaptic('medium');
=======
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
    setHrv(UNIVERSE_CONFIG.hrv.default);
    setScreenTime(UNIVERSE_CONFIG.screen_time.default);
    setSleep(UNIVERSE_CONFIG.sleep_duration.default);
    setTimeOption(AVAILABLE_TIME_OPTIONS[0]);
    setContextOption(CONTEXT_OPTIONS[0]);
  };

  const downloadReport = () => {
    if (!explanation) return;
<<<<<<< HEAD
    triggerHaptic('light');
=======
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
    const blob = new Blob([explanation.formatted_text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `stress_assessment_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveAssessment = () => {
    if (!inferenceResult || !recommendation) return;
    if (!currentUser) {
<<<<<<< HEAD
      triggerHaptic('selection');
=======
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }

    const prefs = store.getPreferences(currentUser.id);
    if (!prefs.save_assessments) {
<<<<<<< HEAD
      triggerHaptic('warning');
=======
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
      setSaveStatus('Please enable "Save assessments" in Account Settings.');
      setTimeout(() => setSaveStatus(''), 4000);
      return;
    }

<<<<<<< HEAD
    triggerHaptic('success');
=======
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
    store.saveAssessment(
      currentUser.id,
      hrv,
      screenTime,
      sleep,
      inferenceResult.crisp_stress_index,
      category,
      recommendation.title
    );
    setSaveStatus('Saved to your private timeline!');
    setTimeout(() => setSaveStatus(''), 4000);
  };

  const badge = getCategoryBadgeInfo(category);

  return (
    <div className="space-y-6">
      {/* Steps Strip */}
      <div className="flex items-center justify-between border-b border-cyan-500/15 pb-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center text-[10px] border border-cyan-400/30">
            1
          </span>
          <span className="text-slate-200 font-medium">Physiological Inputs</span>
        </div>
        <div className="h-px w-10 bg-cyan-500/20" />
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center text-[10px] border border-cyan-400/30">
            2
          </span>
          <span className="text-slate-200 font-medium">Fuzzy Defuzzification</span>
        </div>
        <div className="h-px w-10 bg-cyan-500/20" />
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center text-[10px] border border-cyan-400/30">
            3
          </span>
          <span className="text-slate-200 font-medium">Adaptive Action Plan</span>
        </div>
      </div>

      {/* Input Parameters Card */}
      <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.15)]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 relative z-10">
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-cyan-400">
              Step 1 · Input Universe
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Autonomic & Behavioral Indicators
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={continuousMode}
                onChange={(e) => setContinuousMode(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-900 border-cyan-500/40 text-cyan-500 focus:ring-0"
              />
              <span>Live Re-evaluation</span>
            </label>
            <button
              type="button"
              onClick={resetDefaults}
              className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-panel-interactive border-cyan-500/30 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {validationError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6 relative z-10">
          {/* HRV */}
          <div className="space-y-3 glass-panel p-4 sm:p-5 rounded-2xl border-cyan-500/20">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-cyan-400" />
                <span>HRV (RMSSD)</span>
              </label>
              <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/80 px-2.5 py-0.5 rounded-lg border border-cyan-400/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                {hrv.toFixed(0)} ms
              </span>
            </div>
            <input
              type="range"
              min={UNIVERSE_CONFIG.hrv.min}
              max={UNIVERSE_CONFIG.hrv.max}
              step={UNIVERSE_CONFIG.hrv.step}
              value={hrv}
              onChange={(e) => setHrv(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-900/80 rounded-lg appearance-none cursor-pointer accent-cyan-400 border border-cyan-500/20"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>20 ms (Depressed)</span>
              <span>120 ms (Resilient)</span>
            </div>
            <p className="text-[11px] text-slate-300 pt-1 leading-snug">
              Higher values represent flexible parasympathetic modulation and cardiovascular recovery.
            </p>
          </div>

          {/* Screen Time */}
          <div className="space-y-3 glass-panel p-4 sm:p-5 rounded-2xl border-cyan-500/20">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Monitor className="w-4 h-4 text-cyan-400" />
                <span>Daily Screen Exposure</span>
              </label>
              <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/80 px-2.5 py-0.5 rounded-lg border border-cyan-400/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                {screenTime.toFixed(1)} h
              </span>
            </div>
            <input
              type="range"
              min={UNIVERSE_CONFIG.screen_time.min}
              max={UNIVERSE_CONFIG.screen_time.max}
              step={UNIVERSE_CONFIG.screen_time.step}
              value={screenTime}
              onChange={(e) => setScreenTime(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-900/80 rounded-lg appearance-none cursor-pointer accent-cyan-400 border border-cyan-500/20"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0 h (Rest)</span>
              <span>16 h (Overload)</span>
            </div>
            <p className="text-[11px] text-slate-300 pt-1 leading-snug">
              Prolonged digital sensory exposure drives retinal fatigue and sympathetic vigilance.
            </p>
          </div>

          {/* Sleep Duration */}
          <div className="space-y-3 glass-panel p-4 sm:p-5 rounded-2xl border-cyan-500/20">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Moon className="w-4 h-4 text-cyan-400" />
                <span>Sleep Duration</span>
              </label>
              <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/80 px-2.5 py-0.5 rounded-lg border border-cyan-400/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                {sleep.toFixed(1)} h
              </span>
            </div>
            <input
              type="range"
              min={UNIVERSE_CONFIG.sleep_duration.min}
              max={UNIVERSE_CONFIG.sleep_duration.max}
              step={UNIVERSE_CONFIG.sleep_duration.step}
              value={sleep}
              onChange={(e) => setSleep(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-900/80 rounded-lg appearance-none cursor-pointer accent-cyan-400 border border-cyan-500/20"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>2 h (Acute debt)</span>
              <span>10 h (Optimal)</span>
            </div>
            <p className="text-[11px] text-slate-300 pt-1 leading-snug">
              Slow-wave and REM sleep restore neurotransmitter balance and biological resilience.
            </p>
          </div>
        </div>

        {/* Context Preferences */}
        <div className="border-t border-cyan-500/15 pt-5 relative z-10">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400 mb-3">
            Contextual Filters (Coping Tailoring)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div>
              <label className="block text-xs text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Available Break Window:</span>
              </label>
              <select
                value={timeOption}
                onChange={(e) => setTimeOption(e.target.value)}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs cursor-pointer"
              >
                {AVAILABLE_TIME_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="bg-slate-900 text-white">
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>Physical Setting:</span>
              </label>
              <select
                value={contextOption}
                onChange={(e) => setContextOption(e.target.value)}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs cursor-pointer"
              >
                {CONTEXT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="bg-slate-900 text-white">
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:self-end">
              <button
                type="button"
                onClick={executeAnalysis}
                className="w-full glass-button-primary py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.35)]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Compute Stress Index</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment Results Section */}
      {inferenceResult && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-cyan-400">
                Step 2 · Results & Classification
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Mamdani Inference Output
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={downloadReport}
                className="text-xs text-slate-200 hover:text-white glass-panel-interactive border-cyan-500/30 px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export Report (.txt)</span>
              </button>
            </div>
          </div>

          {/* Metrics row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Stress Index Gauge Card */}
            <div className="glass-panel-glow rounded-3xl p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.2)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  Defuzzified Stress Index
                </span>
                <span className="text-xs text-cyan-400 font-mono">Centroid Method</span>
              </div>

              <div className="flex items-baseline gap-3 my-3">
                <span className="text-5xl sm:text-6xl font-black text-white font-mono tracking-tight drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                  {inferenceResult.crisp_stress_index.toFixed(1)}
                </span>
                <span className="text-sm font-semibold text-slate-400">/ 100 points</span>
              </div>

              {/* Progress bar with boundary indicators */}
              <div className="space-y-2">
                <div className="w-full bg-slate-900/80 border border-cyan-500/20 h-3 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-cyan-500 via-sky-400 to-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.6)]"
                    style={{
                      width: `${inferenceResult.crisp_stress_index}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>0.0 (Low)</span>
                  <span>40.0 (Medium)</span>
                  <span>70.0 (High)</span>
                  <span>100.0</span>
                </div>
              </div>
            </div>

            {/* Category Status Card */}
            <div className="glass-panel-glow rounded-3xl p-6 sm:p-7 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  Linguistic Category
                </span>
                <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${badge.badgeClass}`}>
                  {badge.label}
                </span>
              </div>

              <div className="my-2">
                <h4 className="text-2xl font-bold text-white mb-1.5">{category} Stress State</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{badge.description}</p>
              </div>

              <div className="text-[11px] text-slate-400 border-t border-cyan-500/15 pt-3">
                Mamdani Boundaries: [0, 40) Low | [40, 70) Medium | [70, 100] High
              </div>
            </div>
          </div>

          {/* Coping Recommendation Card */}
          {recommendation && (
            <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 space-y-4 shadow-[0_0_35px_rgba(6,182,212,0.25)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                      Step 3 · Tailored Coping Action
                    </span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-400/30 font-medium">
                      {recommendation.duration}
                    </span>
                  </div>
                  <h4 className="text-xl font-bold text-white tracking-tight">
                    {recommendation.title}
                  </h4>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {/* Save to History Button with Auth Protection Check */}
                  <button
                    type="button"
                    onClick={handleSaveAssessment}
                    className="glass-button-primary px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Save to Timeline</span>
                  </button>

                  {onOpenChatWithTopic && (
                    <button
                      type="button"
                      onClick={() => onOpenChatWithTopic(recommendation.title)}
                      className="text-xs px-3.5 py-2 rounded-xl text-cyan-200 hover:text-white glass-panel-interactive border-cyan-500/30 font-medium transition-colors cursor-pointer"
                    >
                      Discuss in Chat
                    </button>
                  )}
                </div>
              </div>

              {saveStatus && (
                <div className="p-3 rounded-xl bg-cyan-950/70 border border-cyan-400/40 text-cyan-200 text-xs flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>{saveStatus}</span>
                </div>
              )}

              {!currentUser && (
<<<<<<< HEAD
                <div className="p-3 rounded-xl bg-cyan-950/50 border border-cyan-400/30 text-xs text-cyan-200 flex items-center justify-between gap-3 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-300 shrink-0 animate-pulse" />
                    <span>Register first to store this assessment, start daily stress quests, and claim +50 bonus marks.</span>
=======
                <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-xs text-cyan-300 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Sign in to store this assessment and unlock longitudinal stress analytics.</span>
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
                  </div>
                  {onOpenAuthModal && (
                    <button
                      type="button"
                      onClick={onOpenAuthModal}
<<<<<<< HEAD
                      className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all cursor-pointer shrink-0 shadow-[0_0_12px_rgba(34,211,238,0.5)] ios-tactile-button"
                    >
                      Register First
=======
                      className="px-3 py-1 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      Sign In
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
                    </button>
                  )}
                </div>
              )}

              <p className="text-sm text-slate-200 leading-relaxed">
                {recommendation.description}
              </p>

              <div className="p-4 rounded-2xl glass-panel text-xs text-slate-300 border-cyan-500/20">
                <strong className="text-cyan-300">Physiological Rationale: </strong>
                {recommendation.selection_rationale || recommendation.reason}
              </div>
<<<<<<< HEAD

              {/* Immediate Quick Actions: Breathing Exercises & Stress Crush */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {onNavigateToTab && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('medium');
                        onNavigateToTab('breathing');
                      }}
                      className="p-3 rounded-2xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-400/40 text-left flex items-center justify-between group transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.15)] ios-tactile-button"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-400/30 shrink-0">
                          <Wind className="w-4 h-4 text-cyan-300" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-cyan-200">
                            Start Breathing Exercise
                          </div>
                          <div className="text-[10px] text-slate-400">
                            2-min guided parasympathetic pacing
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('medium');
                        onNavigateToTab('candy_crush');
                      }}
                      className="p-3 rounded-2xl bg-pink-950/40 hover:bg-pink-900/40 border border-pink-400/30 text-left flex items-center justify-between group transition-all cursor-pointer shadow-[0_0_15px_rgba(236,72,153,0.15)] ios-tactile-button"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-300 flex items-center justify-center border border-pink-400/30 shrink-0">
                          <Sparkles className="w-4 h-4 text-pink-300" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-pink-200">
                            Play Stress Crush Mini-Game
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Match-3 candy puzzle for instant stress relief
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-pink-400 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </>
                )}
              </div>

              {/* Daily Quests Integration Teaser */}
              <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-400/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0 border border-cyan-400/30">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Manage Stress with Daily Tasks & Earn Marks
                    </span>
                    <span className="text-[11px] text-slate-300">
                      Reading 30 min, Gym workouts, Yoga, Cooking & Gardening (+15 to +30 marks each).
                    </span>
                  </div>
                </div>
                {onNavigateToTab && (
                  <button
                    type="button"
                    onClick={() => onNavigateToTab('quests')}
                    className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ios-tactile-button shrink-0 cursor-pointer"
                  >
                    <span>View Daily Quests</span>
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                  </button>
                )}
              </div>
=======
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
            </div>
          )}

          {/* Expanders for Transparency */}
          <div className="space-y-3">
            {/* 1. How was this calculated? */}
            <div className="glass-panel rounded-2xl overflow-hidden border-cyan-500/20">
              <button
                type="button"
                onClick={() => setShowHowCalculated(!showHowCalculated)}
                className="w-full px-5 py-4 text-left flex items-center justify-between text-xs font-semibold text-white hover:bg-cyan-500/5 transition-colors cursor-pointer"
              >
                <span>How was this calculated? (Membership Degrees & Contributing Stressors)</span>
                {showHowCalculated ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4 text-cyan-400" />}
              </button>
              {showHowCalculated && (
                <div className="p-5 border-t border-cyan-500/15 space-y-4">
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
                      Fuzzification Breakdown
                    </h5>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-cyan-500/20 text-slate-400">
                            <th className="py-2 pr-4">Input Variable</th>
                            <th className="py-2 pr-4">Low / Short / Inadequate</th>
                            <th className="py-2 pr-4">Normal / Moderate / Marginal</th>
                            <th className="py-2 pr-4">High / Prolonged / Optimal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-cyan-500/10 font-mono text-slate-200">
                          <tr>
                            <td className="py-2 pr-4 font-sans font-medium text-white">
                              HRV ({hrv.toFixed(0)} ms)
                            </td>
                            <td className="py-2 pr-4">{inferenceResult.memberships.hrv.low.toFixed(2)}</td>
                            <td className="py-2 pr-4">{inferenceResult.memberships.hrv.normal.toFixed(2)}</td>
                            <td className="py-2 pr-4">{inferenceResult.memberships.hrv.high.toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td className="py-2 pr-4 font-sans font-medium text-white">
                              Screen Time ({screenTime.toFixed(1)} h)
                            </td>
                            <td className="py-2 pr-4">{inferenceResult.memberships.screen_time.short.toFixed(2)}</td>
                            <td className="py-2 pr-4">{inferenceResult.memberships.screen_time.moderate.toFixed(2)}</td>
                            <td className="py-2 pr-4">{inferenceResult.memberships.screen_time.prolonged.toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td className="py-2 pr-4 font-sans font-medium text-white">
                              Sleep ({sleep.toFixed(1)} h)
                            </td>
                            <td className="py-2 pr-4">{inferenceResult.memberships.sleep_duration.inadequate.toFixed(2)}</td>
                            <td className="py-2 pr-4">{inferenceResult.memberships.sleep_duration.marginal.toFixed(2)}</td>
                            <td className="py-2 pr-4">{inferenceResult.memberships.sleep_duration.optimal.toFixed(2)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
                      Dominant Stress Drivers
                    </h5>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {explanation?.stress_drivers.map((driver, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          <span>{driver}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Transparency Panel */}
            <div className="glass-panel rounded-2xl overflow-hidden border-cyan-500/20">
              <button
                type="button"
                onClick={() => setShowTransparency(!showTransparency)}
                className="w-full px-5 py-4 text-left flex items-center justify-between text-xs font-semibold text-white hover:bg-cyan-500/5 transition-colors cursor-pointer"
              >
                <span>Transparency Panel — Active Rules & Firing Strengths</span>
                {showTransparency ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4 text-cyan-400" />}
              </button>
              {showTransparency && (
                <div className="p-5 border-t border-cyan-500/15 space-y-4">
                  <p className="text-xs text-slate-400">
                    Shows all fuzzy rules where firing strength (α = min(antecedent degrees)) &gt; 0.0, sorted in descending order of activation strength.
                  </p>
                  {inferenceResult.active_rules.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-cyan-500/20 text-slate-400">
                            <th className="py-2 pr-3">Rule ID</th>
                            <th className="py-2 pr-3">Condition (Antecedents)</th>
                            <th className="py-2 pr-3">Consequent</th>
                            <th className="py-2 pr-3">Strength (α)</th>
                            <th className="py-2">Design Rationale</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-cyan-500/10 text-slate-200">
                          {inferenceResult.active_rules.map((r) => (
                            <tr key={r.rule_id} className="hover:bg-cyan-500/5">
                              <td className="py-2 pr-3 font-mono font-bold text-cyan-400">
                                {r.rule_id} {r.doc_id !== r.rule_id ? `(${r.doc_id})` : ''}
                              </td>
                              <td className="py-2 pr-3 text-xs">{r.condition_text}</td>
                              <td className="py-2 pr-3">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                    r.consequent === 'High'
                                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                      : r.consequent === 'Low'
                                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                  }`}
                                >
                                  {r.consequent}
                                </span>
                              </td>
                              <td className="py-2 pr-3 font-mono font-bold">{r.firing_strength.toFixed(4)}</td>
                              <td className="py-2 text-[11px] text-slate-400 max-w-xs">{r.rationale}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic">
                      No active rules exceeded activation threshold.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. Complete Knowledge Base Reference */}
            <div className="glass-panel rounded-2xl overflow-hidden border-cyan-500/20">
              <button
                type="button"
                onClick={() => setShowAllRules(!showAllRules)}
                className="w-full px-5 py-4 text-left flex items-center justify-between text-xs font-semibold text-white hover:bg-cyan-500/5 transition-colors cursor-pointer"
              >
                <span>Complete Fuzzy Rule Base Reference (31 Rules Total)</span>
                {showAllRules ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4 text-cyan-400" />}
              </button>
              {showAllRules && (
                <div className="p-5 border-t border-cyan-500/15 space-y-3">
                  <p className="text-xs text-slate-400">
                    Layer A: 27 exhaustive 3-input combinations covering the full Cartesian product (HRV × Screen × Sleep).
                    Layer B: 4 supplementary 2-input rules (R4, R5, R6, R7).
                  </p>
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="sticky top-0 bg-slate-950 border-b border-cyan-500/20 text-slate-400">
                        <tr>
                          <th className="py-2 pr-2">ID</th>
                          <th className="py-2 pr-2">Alias</th>
                          <th className="py-2 pr-2">Layer</th>
                          <th className="py-2 pr-3">Antecedents</th>
                          <th className="py-2 pr-2">Consequent</th>
                          <th className="py-2">Design Rationale</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-cyan-500/10 text-slate-200">
                        {ALL_RULES_DATA.map((r) => {
                          const antStr = Object.entries(r.antecedent)
                            .map(([k, v]) => `${k.replace('_', ' ')}: ${v}`)
                            .join(' AND ');
                          return (
                            <tr key={r.id} className="hover:bg-cyan-500/5">
                              <td className="py-2 pr-2 font-mono font-bold text-white">{r.id}</td>
                              <td className="py-2 pr-2 text-slate-400">{r.report_id || '-'}</td>
                              <td className="py-2 pr-2 capitalize text-cyan-400">{r.type}</td>
                              <td className="py-2 pr-3 font-mono text-[11px]">{antStr}</td>
                              <td className="py-2 pr-2">
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
                                    r.consequent === 'High'
                                      ? 'text-rose-400 border-rose-500/30'
                                      : r.consequent === 'Low'
                                      ? 'text-emerald-400 border-emerald-500/30'
                                      : 'text-amber-400 border-amber-500/30'
                                  }`}
                                >
                                  {r.consequent}
                                </span>
                              </td>
                              <td className="py-2 text-[11px] text-slate-400 max-w-sm">{r.rationale}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
