"use client";

import { memo, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Crown, Gauge, Sparkles, Activity } from 'lucide-react';
import type { DecisionBlueprint } from '@/lib/types';
import type { IntelligenceSnapshot } from '@/components/IntelligenceRail';
import OutcomeLogger from '@/components/OutcomeLogger';

const ResultSkeleton = ({ label }: { label: string }) => (
  <div className="w-full max-w-5xl mt-8 rounded-3xl border border-white/10 bg-[#0B1020]/60 p-8">
    <div className="h-3 w-32 rounded-full bg-white/10" />
    <div className="mt-6 h-24 rounded-2xl bg-white/[0.04]" />
    <div className="mt-4 h-3 w-48 rounded-full bg-white/10" />
    <span className="sr-only">{label}</span>
  </div>
);

const DecisionBlueprintBoard = dynamic(() => import('@/components/DecisionBlueprint'), {
  loading: () => <ResultSkeleton label="Loading decision blueprint" />
});

const AgentEngine = dynamic(() => import('@/components/AgentEngine'), {
  loading: () => <ResultSkeleton label="Loading AI war room" />
});

const WarRoomDashboard = dynamic(() => import('@/components/WarRoomDashboard'), {
  loading: () => <ResultSkeleton label="Loading strategic dashboard" />
});

const MemoryGraphPanel = dynamic(() => import('@/components/MemoryGraphPanel'), {
  loading: () => <ResultSkeleton label="Loading memory graph" />
});

const EnterpriseDashboard = dynamic(() => import('@/components/EnterpriseDashboard'), {
  loading: () => <ResultSkeleton label="Loading enterprise intelligence" />
});

interface SimulationResultsProps {
  result: DecisionBlueprint;
  intelligence: IntelligenceSnapshot;
  submittedProblem: string;
  initialShowBoard: boolean;
  t: Record<string, string>;
  memoryScore?: number;
  networkScore?: number;
  calibratedScore?: number;
  calibrationOffset?: number;
  calibrationSampleSize?: number;
  decisionId?: string;
}

type TabId = 'blueprint' | 'warroom' | 'debate' | 'action' | 'memory' | 'enterprise';

function SimulationResults({
  result,
  intelligence,
  submittedProblem,
  initialShowBoard,
  t,
  memoryScore,
  networkScore,
  calibratedScore,
  calibrationOffset,
  calibrationSampleSize,
  decisionId,
}: SimulationResultsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('blueprint');
  const [showBoard, setShowBoard] = useState(initialShowBoard);

  const verdictMetrics = useMemo(() => [
    { label: 'Success', value: intelligence.successProbability, tone: 'text-emerald-400' },
    { label: 'Downside', value: intelligence.downsideRisk, tone: 'text-rose-400' },
    { label: 'Black Swan', value: intelligence.blackSwanExposure, tone: 'text-amber-400' }
  ], [intelligence.blackSwanExposure, intelligence.downsideRisk, intelligence.successProbability]);

  const hasCalibration =
    typeof calibratedScore === 'number' &&
    typeof calibrationOffset === 'number' &&
    calibrationOffset !== 0;

  const tabs: { id: TabId; label: string }[] = [
    { id: 'blueprint', label: t.tab_blueprint || 'Blueprint' },
    { id: 'warroom', label: 'War Room' },
    { id: 'debate', label: t.tab_debate || 'Council' },
    { id: 'action', label: t.tab_action || 'Action Plan' },
    { id: 'memory', label: memoryScore && memoryScore > 0 ? `Memory · ${memoryScore}` : 'Memory' },
    { id: 'enterprise', label: networkScore && networkScore > 0 ? `Enterprise · ${networkScore}` : 'Enterprise' },
  ];

  return (
    <>
      <div className="mt-8 w-full rounded-3xl border border-white/10 bg-[#0B1020]/80 p-6 shadow-[0_28px_90px_rgba(0,0,0,0.35),0_0_46px_rgba(168,85,247,0.08)] backdrop-blur-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center space-x-2">
              <Gauge className="h-4 w-4 text-purple-400" />
              <span className="text-[10px] font-black uppercase text-slate-400">Decision Verdict</span>
              {hasCalibration && (
                <span
                  className={`ml-2 inline-flex items-center gap-1 text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                    calibrationOffset! < 0
                      ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                      : 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                  }`}
                  title={`Adjusted by prior outcomes: confidence moved ${calibrationOffset! > 0 ? 'up' : 'down'} ${Math.abs(calibrationOffset!)} points from ${calibrationSampleSize ?? '?'} similar outcome${calibrationSampleSize !== 1 ? 's' : ''}`}
                >
                  <Activity className="w-2.5 h-2.5" />
                  Adjusted by prior outcomes · {calibratedScore} ({calibrationOffset! > 0 ? '+' : ''}{calibrationOffset})
                </span>
              )}
            </div>
            <h2 className="text-2xl font-black text-[#F8FAFF]">{intelligence.recommendedPath}</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">{intelligence.verdict}</p>
          </div>
          <div className="grid min-w-full grid-cols-3 gap-3 sm:min-w-[360px]">
            {verdictMetrics.map((metric) => (
              <div key={metric.label} className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                <div className={`text-2xl font-black ${metric.tone}`}>{Math.round(metric.value)}%</div>
                <div className="mt-1 text-[9px] font-bold uppercase text-slate-500">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>

        {decisionId && (
          <OutcomeLogger
            key={decisionId}
            decisionId={decisionId}
            blueprintScore={result.score}
          />
        )}
      </div>

      <div className="w-full flex flex-col items-center mt-12">
        <div className="flex space-x-1 bg-white/5 p-1 rounded-2xl mb-8 border border-white/10 backdrop-blur-md overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white shadow-xl border border-white/10'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'blueprint' && (
          <div className="w-full flex flex-col items-center">
            <DecisionBlueprintBoard data={result} t={t} />
          </div>
        )}

        {activeTab === 'warroom' && (
          <div className="w-full flex flex-col items-center">
            <WarRoomDashboard blueprint={result} />
          </div>
        )}

        {activeTab === 'debate' && (
          <div className="w-full flex flex-col items-center">
            {!showBoard ? (
              <button
                onClick={() => setShowBoard(true)}
                className="mt-16 px-10 py-5 bg-neutral-900/80 backdrop-blur-md hover:bg-neutral-800 border border-purple-500/30 text-white rounded-2xl font-bold text-lg transition-all duration-150 flex items-center justify-center space-x-3 shadow-[0_0_30px_rgba(168,85,247,0.15)] hover:shadow-[0_0_50px_rgba(168,85,247,0.3)] group"
              >
                <Crown className="w-6 h-6 text-purple-400 group-hover:scale-110 group-hover:-rotate-12 transition-transform" />
                <span>{t.run_ai_board || 'Run AI Board'}</span>
                <span className="bg-purple-500/20 text-purple-300 text-[10px] uppercase px-2 py-0.5 rounded-full ml-2 border border-purple-500/20">{t.premium || 'Premium'}</span>
              </button>
            ) : (
              <AgentEngine problem={submittedProblem} initialSolution={result as unknown as Record<string, unknown>} />
            )}
          </div>
        )}

        {activeTab === 'action' && (
          <div className="w-full flex flex-col items-center">
            <div className="w-full max-w-3xl bg-neutral-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 mt-8">
              <h3 className="text-2xl font-bold text-white mb-8 flex items-center">
                <Sparkles className="w-6 h-6 mr-3 text-amber-400" />
                {t.tab_action || 'Action Plan'}
              </h3>
              <div className="space-y-8">
                {[
                  { label: t.today, content: result.actionPlan?.today },
                  { label: t.this_week, content: result.actionPlan?.thisWeek },
                  { label: t.thirty_days, content: result.actionPlan?.thirtyDays }
                ].map((step, i) => (
                  <div key={i} className="flex space-x-6">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white font-black text-sm">
                        {i + 1}
                      </div>
                      {i < 2 && <div className="w-0.5 h-full bg-white/5 mt-2" />}
                    </div>
                    <div className="pb-8">
                      <h4 className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-2">{step.label}</h4>
                      <p className="text-white text-lg font-light leading-relaxed">{step.content || '...'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'memory' && (
          <div className="w-full flex flex-col items-center">
            <MemoryGraphPanel />
          </div>
        )}

        {activeTab === 'enterprise' && (
          <div className="w-full flex flex-col items-center">
            <EnterpriseDashboard />
          </div>
        )}
      </div>
    </>
  );
}

export default memo(SimulationResults);
