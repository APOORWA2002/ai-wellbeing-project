import React, { useState, useEffect } from 'react';
import {
  History,
  Download,
  Trash2,
  Bookmark,
  Calendar,
  MessageSquare,
  Activity,
  AlertCircle,
  Eye,
  CheckCircle,
  Lock,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  CopingRecommendation,
  InferenceResult,
  SavedAssessment,
  SavedConversation,
  SavedGameSession,
  StressCategory,
  UserAccount,
} from '../../types';
import { store } from '../../storage/store';

interface HistoryTabProps {
  currentUser: UserAccount | null;
  lastAssessment?: {
    inference: InferenceResult;
    category: StressCategory;
    recommendation: CopingRecommendation;
  } | null;
  onOpenAuthModal?: () => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  currentUser,
  lastAssessment,
  onOpenAuthModal,
}) => {
  const [assessments, setAssessments] = useState<SavedAssessment[]>([]);
  const [conversations, setConversations] = useState<SavedConversation[]>([]);
  const [games, setGames] = useState<SavedGameSession[]>([]);
  const [selectedConv, setSelectedConv] = useState<SavedConversation | null>(null);
  const [notification, setNotification] = useState<string>('');

  // Date filters
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const loadData = () => {
    if (!currentUser) return;
    const aList = store.listAssessments(currentUser.id);
    const cList = store.listConversations(currentUser.id);
    const gList = store.listGameSessions(currentUser.id);

    setAssessments(aList);
    setConversations(cList);
    setGames(gList);

    if (aList.length > 0 && !startDate) {
      const dates = aList.map((a) => a.created_at.slice(0, 10));
      dates.sort();
      setStartDate(dates[0]);
      setEndDate(new Date().toISOString().slice(0, 10));
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  // Login Protection Guard
  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto py-8">
        <div className="glass-panel-glow rounded-3xl p-8 sm:p-10 text-center space-y-5 relative overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.25)]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(6,182,212,0.35)]">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1.5 relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
              Protected Wellness Vault
            </span>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Sign In to Access Private History
            </h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
              To protect your confidential health indicators, longitudinal stress trend curves, past chat dialogues, and relaxation records are secured behind profile authentication.
            </p>
          </div>

          <div className="pt-2 relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            {onOpenAuthModal && (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="w-full sm:w-auto glass-button-primary px-7 py-3 rounded-xl text-xs font-bold tracking-wide uppercase cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.4)]"
              >
                Sign In or Register
              </button>
            )}
          </div>

          <div className="pt-4 border-t border-cyan-500/15 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Zero cloud analytics · 100% Private Client-Side Storage</span>
          </div>
        </div>
      </div>
    );
  }

  const prefs = store.getPreferences(currentUser.id);

  // Filter assessments by date
  const filteredAssessments = assessments.filter((a) => {
    const aDate = a.created_at.slice(0, 10);
    if (startDate && aDate < startDate) return false;
    if (endDate && aDate > endDate) return false;
    return true;
  });

  const handleSaveLatest = () => {
    if (!lastAssessment) return;
    if (!prefs.save_assessments) {
      setNotification('Turn on "Save my stress assessments" in Account & Settings first.');
      setTimeout(() => setNotification(''), 4000);
      return;
    }

    const { inference, category, recommendation } = lastAssessment;
    store.saveAssessment(
      currentUser.id,
      inference.inputs.hrv,
      inference.inputs.screen_time,
      inference.inputs.sleep_duration,
      inference.crisp_stress_index,
      category,
      recommendation.title
    );
    loadData();
    setNotification('Latest assessment saved to your private history.');
    setTimeout(() => setNotification(''), 4000);
  };

  const handleDeleteAssessment = (id: string) => {
    store.deleteAssessment(currentUser.id, id);
    loadData();
    setNotification('Assessment deleted.');
    setTimeout(() => setNotification(''), 3000);
  };

  const handleDeleteConversation = (id: string) => {
    store.deleteConversation(currentUser.id, id);
    if (selectedConv?.id === id) setSelectedConv(null);
    loadData();
  };

  const handleDeleteAllConversations = () => {
    if (confirm('Delete all saved conversations? This cannot be undone.')) {
      store.deleteAllConversations(currentUser.id);
      setSelectedConv(null);
      loadData();
    }
  };

  const exportCSV = () => {
    if (filteredAssessments.length === 0) return;
    const headers = ['created_at', 'stress_index', 'category', 'hrv', 'screen_time', 'sleep', 'recommendation'];
    const rows = filteredAssessments.map((a) => [
      `"${a.created_at}"`,
      a.stress_index.toFixed(1),
      `"${a.category}"`,
      a.hrv.toFixed(0),
      a.screen_time.toFixed(1),
      a.sleep.toFixed(1),
      `"${a.recommendation.replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `my_wellbeing_history_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
            Account Records
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            My Wellbeing Timeline
          </h3>
          <p className="text-xs text-slate-300">
            Secure longitudinal history for <span className="text-cyan-300 font-semibold">{currentUser.display_name}</span>.
          </p>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-cyan-950/60 border border-cyan-400/40 text-cyan-200 text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
          <CheckCircle className="w-4 h-4 text-cyan-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Save Latest Banner if available */}
      {lastAssessment && (
        <div className="glass-panel-glow rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-cyan-400 font-semibold">Active Assessment Ready:</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-400/30 text-cyan-300 font-mono">
                {lastAssessment.category} Stress ({lastAssessment.inference.crisp_stress_index.toFixed(1)}/100)
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Action Plan: <strong className="text-white">{lastAssessment.recommendation.title}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={handleSaveLatest}
            className="glass-button-primary px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Save to History</span>
          </button>
        </div>
      )}

      {/* Stress Assessments List & Trend */}
      <div className="glass-panel rounded-2xl p-6 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-white">Saved Stress Assessments</h4>
            <p className="text-xs text-slate-400">
              Longitudinal fuzzy model evaluations across sessions.
            </p>
          </div>
          {filteredAssessments.length > 0 && (
            <button
              type="button"
              onClick={exportCSV}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-cyan-200 hover:text-white glass-panel-interactive border-cyan-500/30 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export CSV</span>
            </button>
          )}
        </div>

        {/* Date Filters */}
        {assessments.length > 0 && (
          <div className="flex flex-wrap items-center gap-4 text-xs bg-slate-950/60 p-3 rounded-xl border border-cyan-500/20">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="glass-input rounded-lg px-2.5 py-1 text-white text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="glass-input rounded-lg px-2.5 py-1 text-white text-xs"
              />
            </div>
            <span className="text-slate-400 text-[11px] ml-auto font-mono">
              Showing {filteredAssessments.length} of {assessments.length} logs
            </span>
          </div>
        )}

        {/* Trend Chart (SVG Sparkline / Trend line) */}
        {filteredAssessments.length > 1 && (
          <div className="p-5 glass-panel-glow rounded-xl space-y-2">
            <span className="text-[11px] font-semibold uppercase text-cyan-400 tracking-wider">
              Autonomic Stress Index Curve
            </span>
            <div className="h-32 w-full flex items-end pt-4">
              <svg viewBox="0 0 500 85" className="w-full h-full overflow-visible">
                {/* Reference lines */}
                <line x1="0" y1="52" x2="500" y2="52" stroke="rgba(34, 211, 238, 0.15)" strokeDasharray="3 3" />
                <line x1="0" y1="26" x2="500" y2="26" stroke="rgba(34, 211, 238, 0.15)" strokeDasharray="3 3" />

                {/* Draw points & line */}
                {(() => {
                  const sorted = [...filteredAssessments].reverse();
                  const points = sorted.map((item, idx) => {
                    const x = (idx / Math.max(sorted.length - 1, 1)) * 480 + 10;
                    const y = 80 - (item.stress_index / 100) * 70 - 5;
                    return { x, y, val: item.stress_index, cat: item.category };
                  });

                  const pathD = points.reduce(
                    (acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
                    ''
                  );

                  return (
                    <>
                      <path d={pathD} fill="none" stroke="#22d3ee" strokeWidth="2.5" />
                      {points.map((pt, i) => (
                        <circle
                          key={i}
                          cx={pt.x}
                          cy={pt.y}
                          r="4"
                          fill="#050b14"
                          stroke="#22d3ee"
                          strokeWidth="2"
                        />
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 pt-1 font-mono">
              <span>Low Stress (&lt; 40)</span>
              <span>Medium (40 - 70)</span>
              <span>High Stress (&gt; 70)</span>
            </div>
          </div>
        )}

        {/* Assessment Entries List */}
        {filteredAssessments.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No assessments recorded yet. Run an assessment and click &quot;Save to History&quot;.
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredAssessments.map((a) => {
              const categoryColor =
                a.category === 'High'
                  ? 'text-rose-400 border-rose-500/30 bg-rose-950/20'
                  : a.category === 'Medium'
                  ? 'text-amber-400 border-amber-500/30 bg-amber-950/20'
                  : 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20';

              return (
                <div
                  key={a.id}
                  className="p-4 rounded-xl glass-panel-interactive flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full border text-[11px] font-bold ${categoryColor}`}>
                        {a.category} Stress
                      </span>
                      <span className="text-white font-mono font-bold">
                        {a.stress_index.toFixed(1)} / 100
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        {new Date(a.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-slate-300">
                      Recommendation: <strong className="text-white">{a.recommendation}</strong>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Inputs: HRV {a.hrv.toFixed(0)} ms · Screen {a.screen_time.toFixed(1)}h · Sleep {a.sleep.toFixed(1)}h
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteAssessment(a.id)}
                    className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-950/30 transition-colors cursor-pointer self-end sm:self-auto"
                    title="Delete entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Saved Activities (Breathing & Grounding) */}
      <div className="glass-panel rounded-2xl p-6 sm:p-7 space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>Relaxation Sessions Log</span>
        </h4>
        <p className="text-xs text-slate-400">
          Completed guided breathing, 5-4-3-2-1 grounding, and mindful check-ins.
        </p>

        {games.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">
            No relaxation sessions completed yet. Try a guided breathing exercise in the Relax & Play tab.
          </p>
        ) : (
          <div className="space-y-2">
            {games.map((g) => (
              <div
                key={g.id}
                className="p-3.5 rounded-xl glass-panel-interactive flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-white">{g.game_name}</div>
                  <div className="text-[11px] text-slate-400">{g.reflection || 'Session completed'}</div>
                </div>
                <div className="text-right text-[11px] text-slate-400 font-mono">
                  <div>{Math.round(g.duration_seconds / 60)} min</div>
                  <div>{new Date(g.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
