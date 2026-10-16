import React, { useState, useEffect } from 'react';
import {
  LogIn,
  UserPlus,
  LogOut,
  Download,
  Trash2,
  Lock,
  Mail,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Sparkles,
  Trophy,
  Flame,
} from 'lucide-react';
import { PrivacyPreferences, UserAccount } from '../../types';
import { store } from '../../storage/store';
import { getLevelInfo, habitsStore } from '../../storage/habitsStore';
import { triggerHaptic } from '../../utils/haptics';

interface AccountTabProps {
  currentUser: UserAccount | null;
  onUserChanged: (user: UserAccount | null) => void;
}

export const AccountTab: React.FC<AccountTabProps> = ({ currentUser, onUserChanged }) => {
  // Mode when logged out (defaults to register first as requested)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Profile update
  const [profileName, setProfileName] = useState(currentUser?.display_name || '');
  const [profileMessage, setProfileMessage] = useState('');

  // Privacy preferences
  const [prefs, setPrefs] = useState<PrivacyPreferences>({
    save_assessments: true,
    save_chats: true,
    save_games: true,
  });
  const [prefsMessage, setPrefsMessage] = useState('');

  // Account deletion
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.display_name);
      setPrefs(store.getPreferences(currentUser.id));
    }
  }, [currentUser]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const user = store.authenticateUser(loginEmail, loginPassword);
    if (user) {
      triggerHaptic('success');
      onUserChanged(user);
    } else {
      triggerHaptic('warning');
      setLoginError('Email or password was not recognized. Please check your credentials.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (regPassword !== regConfirm) {
      triggerHaptic('warning');
      setRegError('The passwords do not match.');
      return;
    }

    const res = store.registerUser(regEmail, regName, regPassword);
    if (res.ok && res.user) {
      triggerHaptic('levelUp');
      setRegSuccess(res.message);
      onUserChanged(res.user);
    } else {
      triggerHaptic('warning');
      setRegError(res.message);
    }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      store.updateProfile(currentUser.id, profileName);
      triggerHaptic('success');
      onUserChanged({ ...currentUser, display_name: profileName });
      setProfileMessage('Display name updated successfully.');
      setTimeout(() => setProfileMessage(''), 3000);
    } catch (err: any) {
      triggerHaptic('warning');
      setProfileMessage(err.message);
    }
  };

  const handleSavePrefs = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    triggerHaptic('light');
    store.updatePreferences(currentUser.id, prefs);
    setPrefsMessage('Privacy preferences saved.');
    setTimeout(() => setPrefsMessage(''), 3000);
  };

  const handleExportJSON = () => {
    if (!currentUser) return;
    triggerHaptic('light');
    const data = store.exportPersonalData(currentUser.id);
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai_wellbeing_records_${currentUser.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = () => {
    if (!currentUser || !confirmDelete) return;
    triggerHaptic('heavy');
    store.deleteAccount(currentUser.id);
    onUserChanged(null);
  };

  const handleSignOut = () => {
    triggerHaptic('light');
    store.setCurrentUser(null);
    onUserChanged(null);
  };

  // If user is signed in: show Account Management
  if (currentUser) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* User Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-500/15 pb-6">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center font-bold text-lg shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                {currentUser.display_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {currentUser.display_name}
                  </h3>
                  <span className="text-[10px] text-cyan-300 px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30">
                    Active Session
                  </span>
                </div>
                <p className="text-xs text-slate-400">{currentUser.email}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/30 transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Wellness Marks & Habits Overview */}
          {(() => {
            const habitProfile = habitsStore.getProfile(currentUser.id);
            const levelInfo = getLevelInfo(habitProfile.totalMarks);
            return (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-950/60 border border-cyan-500/20">
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-bold text-cyan-400 flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-cyan-300" />
                    <span>Wellness Marks</span>
                  </div>
                  <div className="text-xl font-black text-white font-mono">
                    {habitProfile.totalMarks} <span className="text-xs text-cyan-300 font-sans font-normal">pts</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-bold text-cyan-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-300" />
                    <span>Rank & Level</span>
                  </div>
                  <div className="text-sm font-bold text-slate-100">
                    Lvl {levelInfo.level} · {levelInfo.title}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-400" />
                    <span>Consistency Streak</span>
                  </div>
                  <div className="text-sm font-bold text-amber-300">
                    {habitProfile.currentStreak} {habitProfile.currentStreak === 1 ? 'Day' : 'Days'} Active
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Profile Name Form */}
          <form onSubmit={handleUpdateProfile} className="space-y-3">
            <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
              Profile Identity
            </h4>
            {profileMessage && (
              <div className="text-xs text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{profileMessage}</span>
              </div>
            )}
            <div className="flex gap-2.5 max-w-md">
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                maxLength={80}
                className="flex-1 glass-input px-3.5 py-2.5 rounded-xl text-xs"
                placeholder="Preferred Name"
              />
              <button
                type="submit"
                className="glass-button-primary px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Save
              </button>
            </div>
          </form>

          {/* Privacy & Persistence Preferences */}
          <form onSubmit={handleSavePrefs} className="space-y-4 border-t border-cyan-500/15 pt-6">
            <div>
              <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                Privacy & Data Persistence
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Control which wellness records are saved to your private local encrypted storage.
              </p>
            </div>

            {prefsMessage && (
              <div className="text-xs text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{prefsMessage}</span>
              </div>
            )}

            <div className="space-y-2.5 text-xs">
              <label className="flex items-center gap-3 p-3 rounded-xl glass-panel-interactive cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefs.save_assessments}
                  onChange={(e) => setPrefs({ ...prefs, save_assessments: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-900 border-cyan-500/40 text-cyan-500 focus:ring-0"
                />
                <span className="text-slate-200">
                  Save physiological stress assessments to my longitudinal history
                </span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl glass-panel-interactive cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefs.save_chats}
                  onChange={(e) => setPrefs({ ...prefs, save_chats: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-900 border-cyan-500/40 text-cyan-500 focus:ring-0"
                />
                <span className="text-slate-200">
                  Save wellbeing chat conversations when I explicitly choose to save them
                </span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl glass-panel-interactive cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefs.save_games}
                  onChange={(e) => setPrefs({ ...prefs, save_games: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-900 border-cyan-500/40 text-cyan-500 focus:ring-0"
                />
                <span className="text-slate-200">
                  Save completed relaxation sessions (Breathing, Grounding, Memory Pairs)
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="glass-button-primary px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Update Preferences
            </button>
          </form>

          {/* Export Personal Data */}
          <div className="space-y-3 border-t border-cyan-500/15 pt-6">
            <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
              Data Ownership & Portability
            </h4>
            <p className="text-xs text-slate-300">
              Export all your saved assessments, conversations, and relaxation milestones as a JSON file.
            </p>
            <button
              type="button"
              onClick={handleExportJSON}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-cyan-200 hover:text-white glass-panel-interactive border-cyan-500/30 flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Download My Archive (JSON)</span>
            </button>
          </div>

          {/* Danger Zone: Account Deletion */}
          <div className="space-y-3 border-t border-rose-500/20 pt-6 p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30">
            <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Delete Account & Saved Data</span>
            </h4>
            <p className="text-xs text-slate-400">
              Permanently wipe this profile and erase all associated stress assessments, conversations, and records from this device.
            </p>
            <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={confirmDelete}
                onChange={(e) => setConfirmDelete(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-900 border-rose-500/50 text-rose-500 focus:ring-0"
              />
              <span>I confirm that I want to delete my account and erase all data.</span>
            </label>
            <button
              type="button"
              disabled={!confirmDelete}
              onClick={handleDeleteAccount}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-40 transition-colors cursor-pointer"
            >
              Permanently Erase Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If user is logged out: show Sign-In / Register card
  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="glass-panel-glow rounded-3xl p-6 sm:p-9 relative overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.25)]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="mb-6 relative z-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            {authMode === 'login' ? 'Sign In to Your Sanctuary' : 'Create Wellness Profile'}
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
            {authMode === 'login'
              ? 'Enter your credentials to unlock longitudinal stress trend lines and confidential records.'
              : 'Join to preserve your physiological assessments, breathing milestones, and chat logs.'}
          </p>
        </div>

        {/* Tab switch with Register First prominent */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-950/80 border border-cyan-500/25 mb-6 relative z-10">
          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setRegError('');
            }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              authMode === 'register'
                ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-200 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Register First (+50)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setLoginError('');
            }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              authMode === 'login'
                ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-200 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>2. Sign In</span>
          </button>
        </div>

        {/* Login */}
        {authMode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 relative z-10">
            {loginError && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
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
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Password</span>
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full glass-button-primary py-3 rounded-xl text-xs font-bold tracking-wide uppercase mt-2 cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.4)]"
            >
              Sign In to Sanctuary
            </button>
          </form>
        )}

        {/* Register */}
        {authMode === 'register' && (
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
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs"
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
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs"
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
              Create Account
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-cyan-500/15 flex items-center justify-between text-[11px] text-slate-400 relative z-10">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Private Local Storage</span>
          </div>
          <span className="text-slate-400">Zero Third-Party Tracking</span>
        </div>
      </div>
    </div>
  );
};