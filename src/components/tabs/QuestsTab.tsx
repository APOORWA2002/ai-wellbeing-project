import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Flame,
  CheckCircle2,
  Circle,
  Plus,
  BookOpen,
  Dumbbell,
  Sparkles,
  Utensils,
  Flower2,
  Wind,
  Moon,
  Heart,
  Compass,
  ArrowRight,
  TrendingUp,
  Award,
  Calendar,
  X,
  Trash2,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { HabitCategory, StressHabit, UserAccount, UserHabitProfile } from '../../types';
import { getLevelInfo, getTodayKey, habitsStore } from '../../storage/habitsStore';
import { triggerHaptic } from '../../utils/haptics';

interface QuestsTabProps {
  currentUser: UserAccount | null;
  onOpenAuthModal: (mode?: 'login' | 'register') => void;
  onNavigateToTab?: (tab: string) => void;
}

export const QuestsTab: React.FC<QuestsTabProps> = ({
  currentUser,
  onOpenAuthModal,
  onNavigateToTab,
}) => {
  const [profile, setProfile] = useState<UserHabitProfile>(() =>
    habitsStore.getProfile(currentUser?.id)
  );
  const [allHabits, setAllHabits] = useState<StressHabit[]>(() =>
    habitsStore.getAllHabits(currentUser?.id)
  );
  const [activeFilter, setActiveFilter] = useState<'all' | HabitCategory>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Custom task form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<HabitCategory>('activity');
  const [newDuration, setNewDuration] = useState<number>(20);
  const [newMarks, setNewMarks] = useState<number>(20);

  // Floating celebration toast on task check
  const [celebration, setCelebration] = useState<{ message: string; marks: number } | null>(null);

  // Reload habits when currentUser changes
  useEffect(() => {
    setProfile(habitsStore.getProfile(currentUser?.id));
    setAllHabits(habitsStore.getAllHabits(currentUser?.id));
  }, [currentUser]);

  const todayKey = getTodayKey();
  const todayLog = profile.completedDates[todayKey] || {
    date: todayKey,
    completedHabitIds: [],
    dailyMarks: 0,
    bonusMarks: 0,
    updatedAt: '',
  };

  const levelInfo = getLevelInfo(profile.totalMarks);
  const dailyTargetMarks = 80;
  const dailyProgressPercent = Math.min(100, Math.round((todayLog.dailyMarks / dailyTargetMarks) * 100));

  const handleToggleHabit = (habitId: string) => {
    const res = habitsStore.toggleHabit(habitId, currentUser?.id);
    setProfile(habitsStore.getProfile(currentUser?.id));

    if (res.completed) {
      triggerHaptic(res.leveledUp ? 'levelUp' : 'success');
      setCelebration({
        message: res.leveledUp ? `Level Up! You are now a ${res.newTotalMarks >= 250 ? 'Calm Explorer' : 'Zen Seeker'}!` : 'Quest Completed!',
        marks: res.marksDelta,
      });
      setTimeout(() => setCelebration(null), 2500);
    } else {
      triggerHaptic('light');
    }
  };

  const handleAddCustomHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    triggerHaptic('medium');
    habitsStore.addCustomHabit(
      {
        title: newTitle.trim(),
        category: newCategory,
        description: `Custom personal stress reduction practice (${newDuration} mins).`,
        marks: newMarks,
        durationMinutes: newDuration,
        iconName: newCategory === 'body' ? 'dumbbell' : newCategory === 'mind' ? 'book' : 'sprout',
      },
      currentUser?.id
    );

    setAllHabits(habitsStore.getAllHabits(currentUser?.id));
    setProfile(habitsStore.getProfile(currentUser?.id));
    setNewTitle('');
    setShowAddModal(false);
  };

  const handleDeleteCustom = (habitId: string) => {
    triggerHaptic('warning');
    habitsStore.deleteCustomHabit(habitId, currentUser?.id);
    setAllHabits(habitsStore.getAllHabits(currentUser?.id));
    setProfile(habitsStore.getProfile(currentUser?.id));
  };

  // Helper icon renderer
  const renderIcon = (name: string, category: string) => {
    const className = "w-5 h-5";
    switch (name) {
      case 'book':
        return <BookOpen className={className} />;
      case 'dumbbell':
        return <Dumbbell className={className} />;
      case 'sparkles':
        return <Sparkles className={className} />;
      case 'utensils':
        return <Utensils className={className} />;
      case 'sprout':
        return <Flower2 className={className} />;
      case 'wind':
        return <Wind className={className} />;
      case 'moon':
        return <Moon className={className} />;
      default:
        return category === 'body' ? <Dumbbell className={className} /> : <Heart className={className} />;
    }
  };

  const filteredHabits = allHabits.filter((h) => {
    if (activeFilter === 'all') return true;
    return h.category === activeFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Floating Marks Celebration Burst */}
      {celebration && (
        <div className="fixed top-20 right-6 z-50 ios-glass-card rounded-2xl p-4 border-cyan-400/60 shadow-[0_0_35px_rgba(6,182,212,0.6)] animate-haptic-tap flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-400 text-slate-950 font-black flex items-center justify-center text-sm shadow-[0_0_15px_rgba(34,211,238,0.8)]">
            +{celebration.marks}
          </div>
          <div>
            <p className="text-xs font-bold text-white">{celebration.message}</p>
            <p className="text-[10px] text-cyan-300">Marks added to your wellness score!</p>
          </div>
        </div>
      )}

      {/* Guest Banner if not registered */}
      {!currentUser && (
        <div className="ios-glass-card rounded-3xl p-4 sm:p-5 border-cyan-400/40 shadow-[0_0_30px_rgba(6,182,212,0.25)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.5)]">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Register to Claim +50 Bonus Marks</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 font-mono">
                  Welcome Gift
                </span>
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Save your daily habit streaks, book reading, gym, yoga, and cooking progress securely across sessions.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenAuthModal('register')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider ios-tactile-button shadow-[0_0_18px_rgba(6,182,212,0.4)] border border-cyan-200/50 cursor-pointer shrink-0"
          >
            Register Profile
          </button>
        </div>
      )}

      {/* HUD Scoreboard: Total Marks, Current Level, Daily Goal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Marks & Level */}
        <div className="ios-glass-card rounded-3xl p-5 border-cyan-500/25 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-cyan-300" />
              <span>Total Wellness Marks</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300">
              Level {levelInfo.level}
            </span>
          </div>

          <div className="my-3 flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              {profile.totalMarks}
            </span>
            <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">Marks (XP)</span>
          </div>

          {/* Level Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-300 font-medium">
              <span className="text-white font-bold">{levelInfo.title}</span>
              <span className="text-slate-400">{profile.totalMarks} / {levelInfo.nextLevelAt} pts</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-950/80 border border-cyan-500/20 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-teal-300 transition-all duration-500 rounded-full"
                style={{ width: `${levelInfo.progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Daily Progress Goal */}
        <div className="ios-glass-card rounded-3xl p-5 border-cyan-500/25 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-300" />
              <span>Today's Daily Marks</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">Target: {dailyTargetMarks}</span>
          </div>

          <div className="my-3 flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-cyan-200">
                  {todayLog.dailyMarks}
                </span>
                <span className="text-xs text-slate-400">/ {dailyTargetMarks} pts</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1">
                {todayLog.completedHabitIds.length} tasks completed today
              </p>
            </div>

            {/* Circular Progress Indicator */}
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-cyan-400 transition-all duration-700 ease-out"
                  strokeDasharray={`${dailyProgressPercent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[11px] font-bold text-white font-mono">
                {dailyProgressPercent}%
              </span>
            </div>
          </div>

          <p className="text-[10px] text-slate-400">
            {dailyProgressPercent >= 100
              ? '🌟 Daily Target Achieved! Fantastic stress resilience work.'
              : `Complete ${Math.max(1, Math.ceil((dailyTargetMarks - todayLog.dailyMarks) / 25))} more quest(s) to hit today's target.`}
          </p>
        </div>

        {/* Day Streak & Consistency */}
        <div className="ios-glass-card rounded-3xl p-5 border-cyan-500/25 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Wellness Streak</span>
            </span>
            <span className="text-[10px] font-mono text-amber-300/90">Consistency Boost</span>
          </div>

          <div className="my-3 flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black text-amber-300 drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]">
              {profile.currentStreak}
            </span>
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              {profile.currentStreak === 1 ? 'Day Active' : 'Days Streak'}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-400/20 text-[11px] text-amber-200/90 flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Check off at least 1 habit daily to keep your flame blazing!</span>
          </div>
        </div>
      </div>

      {/* Task Filters and Custom Quest Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {[
            { id: 'all', label: 'All Tasks' },
            { id: 'mind', label: 'Mind (Reading & Breath)' },
            { id: 'body', label: 'Body (Gym & Yoga)' },
            { id: 'activity', label: 'Activities (Cook & Garden)' },
            { id: 'lifestyle', label: 'Lifestyle' },
            { id: 'custom', label: 'Custom' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                setActiveFilter(tab.id as 'all' | HabitCategory);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ios-tactile-button cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                  : 'text-slate-400 hover:text-white bg-slate-900/40 border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            triggerHaptic('medium');
            setShowAddModal(true);
          }}
          className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-xs font-bold hover:bg-cyan-500/30 transition-all flex items-center gap-1.5 ios-tactile-button cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.2)]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Custom Quest</span>
        </button>
      </div>

      {/* Habits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredHabits.map((habit) => {
          const isDone = todayLog.completedHabitIds.includes(habit.id);
          return (
            <div
              key={habit.id}
              onClick={() => handleToggleHabit(habit.id)}
              className={`p-4 rounded-3xl border transition-all duration-200 cursor-pointer ios-tactile-button relative overflow-hidden flex items-start justify-between gap-3 ${
                isDone
                  ? 'bg-cyan-950/40 border-cyan-400/60 shadow-[0_0_25px_rgba(6,182,212,0.25)]'
                  : 'bg-slate-900/50 border-cyan-500/15 hover:border-cyan-400/35 hover:bg-slate-900/70'
              }`}
            >
              {/* Category Color Bar */}
              <div
                className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                  isDone
                    ? 'bg-gradient-to-b from-cyan-400 to-teal-400'
                    : habit.category === 'body'
                    ? 'bg-blue-500/40'
                    : habit.category === 'mind'
                    ? 'bg-purple-500/40'
                    : 'bg-emerald-500/40'
                }`}
              />

              <div className="flex items-start gap-3.5 pl-2">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                    isDone
                      ? 'bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.7)]'
                      : 'bg-slate-800/80 text-cyan-300 border border-cyan-500/20'
                  }`}
                >
                  {renderIcon(habit.iconName, habit.category)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4
                      className={`text-sm font-bold transition-colors ${
                        isDone ? 'text-white line-through opacity-85' : 'text-slate-100'
                      }`}
                    >
                      {habit.title}
                    </h4>
                    {habit.isCustom && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        Custom
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed pr-2">
                    {habit.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 font-mono text-cyan-300">
                      <Calendar className="w-3 h-3" />
                      <span>{habit.durationMinutes} mins</span>
                    </span>
                    <span>·</span>
                    <span className="capitalize">{habit.category}</span>

                    {habit.id === 'habit_breathing' && onNavigateToTab && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigateToTab('breathing');
                        }}
                        className="ml-1 px-2 py-0.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 font-semibold text-[10px] flex items-center gap-1 cursor-pointer"
                      >
                        <Wind className="w-3 h-3 text-cyan-400" />
                        <span>Launch Breathing</span>
                      </button>
                    )}

                    {habit.id === 'habit_stress_crush' && onNavigateToTab && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigateToTab('candy_crush');
                        }}
                        className="ml-1 px-2 py-0.5 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 border border-pink-400/40 text-pink-200 font-semibold text-[10px] flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-pink-400" />
                        <span>Play Stress Crush</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Side: Marks Badge & Tactile Check */}
              <div className="flex flex-col items-end justify-between h-full shrink-0 gap-3">
                <span
                  className={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border ${
                    isDone
                      ? 'bg-cyan-400/20 text-cyan-200 border-cyan-400/60 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                      : 'bg-slate-950/80 text-cyan-300 border-cyan-500/30'
                  }`}
                >
                  +{habit.marks} pts
                </span>

                <div className="flex items-center gap-2">
                  {habit.isCustom && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCustom(habit.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete custom quest"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                      isDone
                        ? 'bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(34,211,238,0.8)] scale-110'
                        : 'border-2 border-slate-600 text-transparent hover:border-cyan-400'
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Guided Breathing Integration Banner */}
      <div className="ios-glass-card rounded-3xl p-5 border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-slate-900/80 via-cyan-950/20 to-slate-900/80">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">
            <Wind className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Need an Instant Stress Reset?</h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Launch guided breathing exercises with visual countdown to instantly lower sympathetic arousal and claim +15 marks.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            triggerHaptic('medium');
            if (onNavigateToTab) onNavigateToTab('breathing');
          }}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl glass-button-primary text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 ios-tactile-button cursor-pointer shrink-0"
        >
          <span>Open Breathing</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Custom Quest Creation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md ios-glass-card rounded-[2rem] p-6 border-cyan-400/40 shadow-[0_0_50px_rgba(6,182,212,0.35)]">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setShowAddModal(false);
              }}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>Create Personal Stress Quest</span>
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Design an activity that brings you personal calmness, flow, and restoration.
              </p>
            </div>

            <form onSubmit={handleAddCustomHabit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Quest Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. 20 min acoustic guitar, walk in park"
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as HabitCategory)}
                    className="w-full glass-input px-3 py-2.5 rounded-xl text-xs bg-slate-900 text-slate-100"
                  >
                    <option value="activity">Activity (Hands-on)</option>
                    <option value="mind">Mind (Reading/Calm)</option>
                    <option value="body">Body (Movement/Yoga)</option>
                    <option value="lifestyle">Lifestyle & Sleep</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Duration (mins)</label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full glass-input px-3 py-2.5 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Marks Awarded</span>
                  <span className="font-bold text-cyan-300 font-mono">+{newMarks} Marks</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={newMarks}
                  onChange={(e) => setNewMarks(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider ios-tactile-button cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.4)] mt-2"
              >
                Add Quest to Sanctuary
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
