import React, { useState, useEffect } from 'react';
import { UserCheck, AlertTriangle, Send, CheckCircle2, Lock, ShieldCheck } from 'lucide-react';
import { CounsellorRequest, UserAccount } from '../../types';
import { store } from '../../storage/store';
<<<<<<< HEAD
import { triggerHaptic } from '../../utils/haptics';
=======
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6

interface CounsellorTabProps {
  currentUser: UserAccount | null;
  onOpenAuthModal?: () => void;
}

export const CounsellorTab: React.FC<CounsellorTabProps> = ({ currentUser, onOpenAuthModal }) => {
  const [contactMethod, setContactMethod] = useState<string>('Email (demo only)');
  const [preferredTime, setPreferredTime] = useState<string>('No preference');
  const [message, setMessage] = useState<string>('');
  const [consent, setConsent] = useState<boolean>(false);
  const [submittedMessage, setSubmittedMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [requests, setRequests] = useState<CounsellorRequest[]>([]);

  const loadRequests = () => {
    if (currentUser) {
      setRequests(store.listCounsellorRequests(currentUser.id));
    }
  };

  useEffect(() => {
    loadRequests();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto py-8">
        <div className="glass-panel-glow rounded-3xl p-8 sm:p-10 text-center space-y-4 shadow-[0_0_40px_rgba(6,182,212,0.2)]">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <Lock className="w-7 h-7" />
          </div>
          <h4 className="text-lg font-bold text-white tracking-tight">Protected Counsellor Workflow</h4>
          <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
            Please sign in to test the local demonstration intake workflow and record private support inquiries.
          </p>
          {onOpenAuthModal && (
            <button
              type="button"
<<<<<<< HEAD
              onClick={() => {
                triggerHaptic('selection');
                onOpenAuthModal();
              }}
=======
              onClick={onOpenAuthModal}
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
              className="glass-button-primary px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
<<<<<<< HEAD
      triggerHaptic('warning');
=======
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
      setErrorMessage('Please confirm the demo limitation checkbox before submitting.');
      return;
    }
    try {
<<<<<<< HEAD
      triggerHaptic('success');
=======
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
      store.createCounsellorRequest(currentUser.id, contactMethod, preferredTime, message, consent);
      setSubmittedMessage('Demo intake saved locally. No external clinician has been contacted.');
      setErrorMessage('');
      setMessage('');
      setConsent(false);
      loadRequests();
      setTimeout(() => setSubmittedMessage(''), 5000);
    } catch (err: any) {
<<<<<<< HEAD
      triggerHaptic('warning');
=======
>>>>>>> 25b70530eec018d5f03c5d11cc8f462a40ee10a6
      setErrorMessage(err.message || 'Failed to submit request');
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 space-y-5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
            Professional Human Connection
          </span>
          <h3 className="text-lg font-bold text-white tracking-tight">
            Talk to a Counsellor (Demonstration Intake)
          </h3>
        </div>

        {/* Clear Educational Disclaimer Banner */}
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs leading-relaxed space-y-2">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Academic Demonstration Workflow Only</span>
          </div>
          <p>
            This prototype is an academic demonstration and is <strong>not connected</strong> to a real medical professional, hospital, or counselling clinic. Submitting this form saves a local record; <strong>nobody will be contacted</strong>.
          </p>
          <p className="text-[11px] text-amber-300/80">
            For urgent psychological distress or crisis, immediately contact emergency helplines: <strong>1926</strong> (National Mental Health Helpline) or <strong>1990</strong> (Emergency Ambulance).
          </p>
        </div>

        {submittedMessage && (
          <div className="p-3.5 rounded-xl bg-cyan-950/60 border border-cyan-400/40 text-cyan-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>{submittedMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Preferred Contact Channel (Demo)</label>
            <select
              value={contactMethod}
              onChange={(e) => setContactMethod(e.target.value)}
              className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs cursor-pointer"
            >
              <option value="Email (demo only)">Email (demo only)</option>
              <option value="Phone call (demo only)">Phone call (demo only)</option>
              <option value="In-person appointment (demo only)">In-person appointment (demo only)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Preferred Time Window</label>
            <select
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
              className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs cursor-pointer"
            >
              <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
              <option value="Afternoon (1 PM - 4 PM)">Afternoon (1 PM - 4 PM)</option>
              <option value="Evening (5 PM - 8 PM)">Evening (5 PM - 8 PM)</option>
              <option value="No preference">No preference</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Brief Context / Message (Optional, 500 characters max)
            </label>
            <textarea
              rows={3}
              maxLength={500}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g., Looking for guidance managing exam anxiety and sleep schedule..."
              className="w-full glass-input p-3.5 rounded-xl text-xs resize-none"
            />
          </div>

          <div className="p-3.5 rounded-xl glass-panel space-y-2 border-cyan-500/20">
            <label className="flex items-start gap-2.5 text-xs text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded bg-slate-900 border-cyan-500/40 text-cyan-500 focus:ring-0"
              />
              <span>
                I understand this is a simulation. No real counsellor will be contacted.
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="glass-button-primary px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.35)]"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Demo Request</span>
          </button>
        </form>
      </div>

      {/* Past demo requests */}
      {requests.length > 0 && (
        <div className="glass-panel rounded-2xl p-6 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            Submitted Demo Requests ({requests.length})
          </h4>
          <div className="space-y-2">
            {requests.map((r) => (
              <div
                key={r.id}
                className="p-3.5 rounded-xl glass-panel-interactive flex items-start justify-between text-xs"
              >
                <div className="space-y-1">
                  <div className="font-semibold text-white">
                    {r.preferred_contact} · {r.preferred_time}
                  </div>
                  {r.message && <div className="text-slate-300">{r.message}</div>}
                  <div className="text-[10px] text-cyan-300/80 font-mono">
                    Status: {r.status} · {new Date(r.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
