import React, { useState } from 'react';
<<<<<<< HEAD
import {
  X,
  Lock,
  Mail,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Eye,
  EyeOff,
  BookOpen,
  Dumbbell,
  Flower2,
  Utensils,
  Flame,
  Award,
} from 'lucide-react';
import { UserAccount } from '../../types';
import { store } from '../../storage/store';
import { StressinaLogo } from '../common/StressinaLogo';
import { triggerHaptic } from '../../utils/haptics';
=======
import { X, Lock, Mail, User, ShieldCheck, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { UserAccount } from '../../types';
import { store } from '../../storage/store';
import { StressinaLogo } from '../common/StressinaLogo';
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserChanged: (user: UserAccount | null) => void;
  initialMode?: 'login' | 'register';
  promptReason?: string;
}

<<<<<<< HEAD
const AVATAR_OPTIONS = [
  { id: 'lotus', label: 'Zen Lotus', emoji: '🪷', bg: 'from-cyan-500/20 to-teal-500/10' },
  { id: 'wave', label: 'Ocean Flow', emoji: '🌊', bg: 'from-blue-500/20 to-cyan-500/10' },
  { id: 'pulse', label: 'Neural Wave', emoji: '✨', bg: 'from-emerald-500/20 to-cyan-500/10' },
  { id: 'garden', label: 'Botanical', emoji: '🌿', bg: 'from-green-500/20 to-emerald-500/10' },
];

const GOAL_OPTIONS = [
  { id: 'reading', label: 'Reading (30m/day)', icon: BookOpen, marks: '+25' },
  { id: 'gym', label: 'Gym & Fitness', icon: Dumbbell, marks: '+30' },
  { id: 'yoga', label: 'Yoga & Somatics', icon: Flower2, marks: '+25' },
  { id: 'cooking', label: 'Mindful Cooking', icon: Utensils, marks: '+20' },
  { id: 'gardening', label: 'Gardening & Flora', icon: Flower2, marks: '+20' },
];

=======
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onUserChanged,
<<<<<<< HEAD
  initialMode = 'register', // Default to asking user to register first
=======
  initialMode = 'login',
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
  promptReason,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

<<<<<<< HEAD
  // Registration state
=======
  // Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
<<<<<<< HEAD
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('lotus');
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['reading', 'gym']);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  if (!isOpen) return null;

  // Real-time password strength calculation (iOS style 4-bar)
  const calculatePasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'Enter passcode', color: 'bg-slate-700' };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd) || /[A-Z]/.test(pwd)) score++;

    if (score === 1) return { score: 1, label: 'Basic', color: 'bg-amber-500' };
    if (score === 2) return { score: 2, label: 'Moderate', color: 'bg-yellow-400' };
    if (score === 3) return { score: 3, label: 'Strong', color: 'bg-cyan-400' };
    return { score: 4, label: 'Fortress Vault', color: 'bg-emerald-400' };
  };

  const strength = calculatePasswordStrength(regPassword);

  const toggleGoal = (goalId: string) => {
    triggerHaptic('selection');
    setSelectedGoals((prev) =>
      prev.includes(goalId) ? prev.filter((g) => g !== goalId) : [...prev, goalId]
    );
=======
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const user = store.authenticateUser(loginEmail, loginPassword);
    if (user) {
      onUserChanged(user);
      onClose();
    } else {
      setLoginError('Email or password was not recognized. Please check your credentials.');
    }
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
<<<<<<< HEAD
    triggerHaptic('medium');
    setRegError('');

    if (regPassword.length < 6) {
      triggerHaptic('warning');
      setRegError('Password must contain at least 6 characters.');
      return;
    }

    if (regPassword !== regConfirm) {
      triggerHaptic('warning');
      setRegError('Passwords do not match. Please verify your passcode.');
=======
    setRegError('');
    setRegSuccess('');

    if (regPassword !== regConfirm) {
      setRegError('The passwords do not match.');
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
      return;
    }

    const res = store.registerUser(regEmail, regName, regPassword);
    if (res.ok && res.user) {
<<<<<<< HEAD
      triggerHaptic('levelUp');
      setRegSuccess(true);
      onUserChanged(res.user);
      setTimeout(() => {
        onClose();
        setRegSuccess(false);
      }, 1500);
    } else {
      triggerHaptic('warning');
=======
      setRegSuccess(res.message);
      onUserChanged(res.user);
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
      setRegError(res.message);
    }
  };

<<<<<<< HEAD
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('medium');
    setLoginError('');
    const user = store.authenticateUser(loginEmail, loginPassword);
    if (user) {
      triggerHaptic('success');
      onUserChanged(user);
      onClose();
    } else {
      triggerHaptic('warning');
      setLoginError('Email or password was not recognized. Please register first if you are new.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-lg ios-glass-card rounded-[2rem] p-5 sm:p-7 overflow-hidden shadow-[0_0_60px_rgba(6,182,212,0.35)] border-cyan-400/30 max-h-[92vh] overflow-y-auto">
        {/* Dynamic iOS Ambient Glow Spots */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button with Tactile Physics */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-2xl text-slate-400 hover:text-white hover:bg-cyan-500/15 border border-transparent hover:border-cyan-500/30 transition-all cursor-pointer ios-tactile-button"
          aria-label="Close dialog"
=======
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md glass-panel-glow rounded-3xl p-6 sm:p-8 overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.35)]">
        {/* Glow backlight element */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/20 transition-all cursor-pointer"
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
        >
          <X className="w-5 h-5" />
        </button>

<<<<<<< HEAD
        {/* Header Branding */}
        <div className="relative z-10 mb-4">
          <div className="flex items-center justify-between gap-3">
            <StressinaLogo size="md" variant="full" />
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-[11px] font-mono text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
              <span>+50 Bonus Marks</span>
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              {mode === 'register' ? (
                <>
                  <span>Create Wellness Profile</span>
                </>
              ) : (
                <span>Sign In to Sanctuary</span>
              )}
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {mode === 'register'
                ? (promptReason || 'Register first to claim your 50 welcome marks, save longitudinal stress timeline, and earn points on daily wellness tasks.')
                : 'Sign in to access your saved timeline, private records, and active habits streak.'}
=======
        {/* Modal Header */}
        <div className="mb-6 relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <StressinaLogo size="md" variant="full" />
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/30 text-[10px] font-mono text-cyan-300">
              <ShieldCheck className="w-3 h-3 text-cyan-400" />
              <span>Encrypted Vault</span>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {mode === 'login' ? 'Welcome Back' : 'Create Wellness Profile'}
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              {promptReason ||
                (mode === 'login'
                  ? 'Sign in to access your saved timeline, private records, and personalized interventions.'
                  : 'Join to save your longitudinal stress scores, chat history, and relaxation progress.')}
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
            </p>
          </div>
        </div>

<<<<<<< HEAD
        {/* Segmented Mode Switcher */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-950/80 border border-cyan-500/25 mb-5 relative z-10">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              setMode('register');
              setRegError('');
            }}
            className={`py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer ios-tactile-button flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-200 border border-cyan-400/60 shadow-[0_0_18px_rgba(6,182,212,0.35)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>1. Register First</span>
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              setMode('login');
              setLoginError('');
            }}
            className={`py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer ios-tactile-button flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-200 border border-cyan-400/60 shadow-[0_0_18px_rgba(6,182,212,0.35)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>2. Existing User</span>
          </button>
        </div>

        {/* REGISTRATION FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4 relative z-10">
            {regError && (
              <div className="p-3 rounded-2xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center gap-2 animate-fade-in shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            {regSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-400/60 text-emerald-200 text-xs flex items-center gap-3 animate-fade-in shadow-[0_0_25px_rgba(52,211,153,0.35)]">
                <div className="w-8 h-8 rounded-full bg-emerald-500/30 border border-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <p className="font-bold text-emerald-100 text-sm">Welcome to stressina.AI!</p>
                  <p className="text-[11px] text-emerald-300">+50 Welcome Marks Awarded · Vault Ready</p>
                </div>
              </div>
            )}

            {/* Avatar Selector with Tactile Feedback */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 block">
                Select Your Avatar
              </label>
              <div className="grid grid-cols-4 gap-2">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection');
                      setSelectedAvatar(av.id);
                    }}
                    className={`py-2 px-1 rounded-2xl border flex flex-col items-center gap-1 transition-all cursor-pointer ios-tactile-button ${
                      selectedAvatar === av.id
                        ? 'bg-cyan-500/25 border-cyan-400 shadow-[0_0_16px_rgba(6,182,212,0.4)] scale-[1.02]'
                        : 'bg-slate-900/40 border-cyan-500/15 hover:border-cyan-500/30 text-slate-400'
                    }`}
                  >
                    <span className="text-xl">{av.emoji}</span>
                    <span className="text-[10px] font-semibold truncate max-w-full text-slate-200">{av.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred Name & Email Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Preferred Name</span>
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Maya"
                  className="w-full glass-input px-3.5 py-2.5 rounded-2xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="maya@example.com"
                  className="w-full glass-input px-3.5 py-2.5 rounded-2xl text-xs"
                />
              </div>
            </div>

            {/* Primary Stress Management Tasks Focus */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center justify-between">
                <span>Your Preferred Stress Tasks</span>
                <span className="text-[10px] text-cyan-300/80">Tap to toggle</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {GOAL_OPTIONS.map((g) => {
                  const Icon = g.icon;
                  const isSelected = selectedGoals.includes(g.id);
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => toggleGoal(g.id)}
                      className={`p-2 rounded-2xl text-left border flex items-center justify-between gap-1.5 transition-all cursor-pointer ios-tactile-button ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                          : 'bg-slate-900/40 border-cyan-500/15 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-cyan-300' : 'text-slate-400'}`} />
                        <span className="text-[11px] font-medium truncate">{g.label}</span>
                      </div>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 shrink-0">
                        {g.marks}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Passwords with Liquid Strength Meter */}
            <div className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Create Password</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setShowPassword(!showPassword);
                      }}
                      className="text-slate-400 hover:text-cyan-300"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full glass-input px-3.5 py-2.5 rounded-2xl text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                    <span>Confirm Password</span>
                    {regConfirm && regPassword === regConfirm && (
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Matched
                      </span>
                    )}
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={regConfirm}
                    onChange={(e) => setRegConfirm(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full glass-input px-3.5 py-2.5 rounded-2xl text-xs"
                  />
                </div>
              </div>

              {/* Password Strength Indicator */}
              {regPassword && (
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Security Strength</span>
                    <span className="font-semibold text-cyan-300">{strength.label}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          step <= strength.score ? strength.color : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tactile Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl text-xs font-black tracking-wider uppercase cursor-pointer ios-tactile-button bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-500 hover:from-cyan-400 hover:to-teal-300 text-slate-950 shadow-[0_0_28px_rgba(6,182,212,0.5)] border border-cyan-200/50 flex items-center justify-center gap-2 mt-2"
            >
              <Award className="w-4 h-4 text-slate-950" />
              <span>Create Profile & Claim 50 Marks</span>
            </button>
          </form>
        )}

        {/* LOGIN FORM (Existing User Flow) */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 relative z-10">
            {loginError && (
              <div className="p-3 rounded-2xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center gap-2 animate-fade-in shadow-[0_0_15px_rgba(239,68,68,0.2)]">
=======
        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-950/60 border border-cyan-500/20 mb-6 relative z-10">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setLoginError('');
            }}
            className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setRegError('');
            }}
            className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            New Account
          </button>
        </div>

        {/* Login Form */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 relative z-10">
            {loginError && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="name@example.com"
<<<<<<< HEAD
                className="w-full glass-input px-3.5 py-2.5 rounded-2xl text-xs"
=======
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs"
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
              />
            </div>

            <div className="space-y-1.5">
<<<<<<< HEAD
              <div className="flex items-center justify-between text-xs font-medium text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Password</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setShowLoginPassword(!showLoginPassword);
                  }}
                  className="text-slate-400 hover:text-cyan-300"
                >
                  {showLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <input
                type={showLoginPassword ? 'text' : 'password'}
=======
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Password</span>
              </label>
              <input
                type="password"
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
<<<<<<< HEAD
                className="w-full glass-input px-3.5 py-2.5 rounded-2xl text-xs"
=======
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs"
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
              />
            </div>

            <button
              type="submit"
<<<<<<< HEAD
              className="w-full py-3.5 rounded-2xl text-xs font-black tracking-wider uppercase cursor-pointer ios-tactile-button bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 shadow-[0_0_24px_rgba(6,182,212,0.45)] border border-cyan-300/40 mt-2"
            >
              Sign In to Sanctuary
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  setMode('register');
                }}
                className="text-xs text-cyan-400 hover:text-cyan-300 underline font-medium cursor-pointer"
              >
                Don't have an account yet? Register here to start
              </button>
            </div>
          </form>
        )}

        {/* Security & Client-Side Privacy Guarantee */}
        <div className="mt-5 pt-3.5 border-t border-cyan-500/15 flex items-center justify-between text-[11px] text-slate-400 relative z-10">
          <div className="flex items-center gap-1.5 text-cyan-300/90 font-mono text-[10px]">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Encrypted Client Storage</span>
          </div>
          <span className="text-slate-500 text-[10px]">Private & Local</span>
=======
              className="w-full glass-button-primary py-3 rounded-xl text-xs font-bold tracking-wide uppercase mt-2 cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.4)]"
            >
              Sign In to Sanctuary
            </button>
          </form>
        )}

        {/* Register Form */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3 relative z-10">
            {regError && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{regError}</span>
              </div>
            )}
            {regSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{regSuccess}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>Preferred Name</span>
              </label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Alex"
                className="w-full glass-input px-3.5 py-2 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full glass-input px-3.5 py-2 rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Password</label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Min 6 chars"
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Confirm</label>
                <input
                  type="password"
                  required
                  value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)}
                  placeholder="Repeat"
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full glass-button-primary py-3 rounded-xl text-xs font-bold tracking-wide uppercase mt-2 cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.4)]"
            >
              Create My Account
            </button>
          </form>
        )}

        {/* Security badge footer */}
        <div className="mt-6 pt-4 border-t border-cyan-500/15 flex items-center justify-between text-[11px] text-slate-400 relative z-10">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Local Cryptographic Storage</span>
          </div>
          <span className="text-slate-500">100% Client-Side Privacy</span>
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
        </div>
      </div>
    </div>
  );
};
