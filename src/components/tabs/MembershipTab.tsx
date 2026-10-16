import React, { useState } from 'react';
import {
  HRVChart,
  ScreenTimeChart,
  SleepChart,
  StressOutputChart,
} from '../visualizations/MembershipCharts';
import { InferenceResult } from '../../types';
import { triggerHaptic } from '../../utils/haptics';

interface MembershipTabProps {
  hrv: number;
  screenTime: number;
  sleep: number;
  inferenceResult?: InferenceResult | null;
}

export const MembershipTab: React.FC<MembershipTabProps> = ({
  hrv,
  screenTime,
  sleep,
  inferenceResult,
}) => {
  const [activeView, setActiveView] = useState<'All' | 'HRV' | 'Screen' | 'Sleep' | 'Stress'>('All');

  const crispStress = inferenceResult?.crisp_stress_index;
  const aggSet = inferenceResult?.aggregated_fuzzy_set;
  const stressUniverse = inferenceResult?.stress_universe;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel-glow rounded-3xl p-6 sm:p-7">
        <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
          Membership Functions
        </span>
        <h3 className="text-lg font-bold text-white mb-1 tracking-tight">
          Fuzzy Set Visualizations & Dynamic Membership Markers
        </h3>
        <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
          Inspect the mathematical shape of each linguistic term across the universe of discourse. Vertical cyan markers indicate your current active values.
        </p>

        {/* View Switcher */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-cyan-500/15">
          {(['All', 'HRV', 'Screen', 'Sleep', 'Stress'] as const).map((view) => (
            <button
              key={view}
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                setActiveView(view);
              }}
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                activeView === view
                  ? 'bg-cyan-500/25 text-cyan-200 border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                  : 'glass-panel-interactive border-cyan-500/20 text-slate-400 hover:text-white'
              }`}
            >
              {view === 'All' ? 'All Functions' : view === 'Screen' ? 'Screen Time' : view === 'Stress' ? 'Stress Output' : view}
            </button>
          ))}
        </div>
      </div>

      {/* Visualizations Grid */}
      {activeView === 'All' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HRVChart currentVal={hrv} />
          <ScreenTimeChart currentVal={screenTime} />
          <SleepChart currentVal={sleep} />
          <StressOutputChart
            crispStress={crispStress}
            aggregatedSet={aggSet}
            stressUniverse={stressUniverse}
          />
        </div>
      ) : activeView === 'HRV' ? (
        <div className="max-w-3xl mx-auto">
          <HRVChart currentVal={hrv} />
        </div>
      ) : activeView === 'Screen' ? (
        <div className="max-w-3xl mx-auto">
          <ScreenTimeChart currentVal={screenTime} />
        </div>
      ) : activeView === 'Sleep' ? (
        <div className="max-w-3xl mx-auto">
          <SleepChart currentVal={sleep} />
        </div>
      ) : (
        <div className="max-w-3xl mx-auto">
          <StressOutputChart
            crispStress={crispStress}
            aggregatedSet={aggSet}
            stressUniverse={stressUniverse}
          />
        </div>
      )}

      {/* Centroid Defuzzification Explanatory Note */}
      <div className="glass-panel rounded-2xl p-5 text-xs text-slate-300 leading-relaxed border-cyan-500/20">
        <strong className="text-cyan-400">Centroid Defuzzification Mathematics: </strong>
        The shaded area in the Stress Index chart represents the aggregated consequent fuzzy set (Mamdani MAX operator applied across all active rule implications). The vertical cyan marker is the exact center of gravity (centroid) calculated across this continuous shape.
      </div>
    </div>
  );
};
