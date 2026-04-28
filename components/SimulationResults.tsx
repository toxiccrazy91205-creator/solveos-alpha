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
  decisionAccuracy?: number;
  calibrationScore?: number;
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
  decisionAccuracy,
  calibrationScore,
}: SimulationResultsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('blueprint');
  const [showBoard, setShowBoard] = useState(initialShowBoard);

  const verdictMetrics = useMemo(() => [
    { label: 'Success', value: intelligence.successProbability, tone: 'text-emerald-400' },
    { label: 'Downside', value: intelligence.downsideRisk, tone: 'text-rose-400' },
    { label: 'Black Swan', value: intelligence.blackSwanExposure, tone: 'text-amber-400' }
  ], [intelligence.blackSwanExposure, intelligence.downsideRisk, intelligence.successProbability]);

  const counterfactualPaths = useMemo(() => {
    if (result.counterfactualPaths && result.counterfactualPaths.length > 0) {
      return result.counterfactualPaths.map((path, index) => ({
        label: `${index + 1}. ${path.name}`,
        probability: path.probability,
        impact: Math.min(10, Math.max(1, Math.round(path.impact || 6))),
        confidence: Math.min(100, Math.max(0, Math.round(path.confidence || result.score || 68))),
        points: [
          { label: index === 1 ? 'Reduced risk' : index === 2 ? 'Probable downside' : 'Likely upside', value: path.reducedRisk || path.probableDownside || path.likelyUpside },
          { label: index === 1 ? 'Opportunity cost' : index === 2 ? 'Hidden risk accumulation' : 'Key failure mode', value: path.opportunityCost || path.hiddenRiskAccumulation || path.keyFailureMode },
        ],
      }));
    }

    const score = Math.round(result.score || 0);
    const downside = Math.round(intelligence.downsideRisk || 0);
    const blackSwan = Math.round(intelligence.blackSwanExposure || 0);
    const proceedProbability = score >= 75 ? 'High' : score >= 45 ? 'Medium' : 'Low';
    const delayProbability = downside >= 45 ? 'High' : 'Medium';
    const doNothingProbability = downside + blackSwan >= 95 ? 'High' : 'Medium';
    const proceedImpact = Math.min(10, Math.max(1, Math.round(score / 12)));
    const delayImpact = Math.min(10, Math.max(1, Math.round((100 - downside / 2) / 14)));
    const doNothingImpact = Math.min(10, Math.max(1, Math.round((downside + blackSwan) / 18)));
    const proceedConfidence = Math.min(95, Math.max(35, score));
    const delayConfidence = Math.min(90, Math.max(40, Math.round(100 - downside / 2)));
    const doNothingConfidence = Math.min(92, Math.max(45, Math.round((downside + blackSwan) / 2)));

    return [
      {
        label: '1. Proceed Now',
        probability: proceedProbability,
        impact: proceedImpact,
        confidence: proceedConfidence,
        points: [
          { label: 'Likely upside', value: result.paths?.bold?.pros?.[0] || result.futureSimulation?.threeMonths },
          { label: 'Key failure mode', value: result.paths?.bold?.cons?.[0] || result.diagnosis?.keyRisks },
        ],
      },
      {
        label: '2. Delay',
        probability: delayProbability,
        impact: delayImpact,
        confidence: delayConfidence,
        points: [
          { label: 'Reduced risk', value: result.paths?.safe?.pros?.[0] || result.diagnosis?.blindSpots },
          { label: 'Opportunity cost', value: result.paths?.safe?.cons?.[0] || result.contrarianInsight?.hiddenOpportunity },
        ],
      },
      {
        label: '3. Do Nothing',
        probability: doNothingProbability,
        impact: doNothingImpact,
        confidence: doNothingConfidence,
        points: [
          { label: 'Probable downside', value: result.paths?.balanced?.cons?.[0] || result.futureSimulation?.twelveMonths },
          { label: 'Hidden risk accumulation', value: result.contrarianInsight?.uncomfortableTruth || result.diagnosis?.blindSpots },
        ],
      },
    ];
  }, [intelligence.blackSwanExposure, intelligence.downsideRisk, result]);

  const preMortemFailureMap = useMemo(() => (
    result.preMortemRisks && result.preMortemRisks.length > 0
      ? result.preMortemRisks.map((risk, index) => ({
          label: `${index + 1}. ${risk.mode}`,
          trigger: risk.riskTrigger,
          warning: risk.earlyWarningSignal,
          mitigation: risk.mitigationMove,
        }))
      : [
          {
            label: '1. Execution Failure',
            trigger: result.actionPlan?.thisWeek || result.paths?.balanced?.cons?.[0],
            warning: result.actionPlan?.today || 'Key owner, budget, or timeline remains undefined.',
            mitigation: result.actionPlan?.thirtyDays || 'Convert the decision into a short operating sprint with clear owners.',
          },
          {
            label: '2. Market Assumption Failure',
            trigger: result.diagnosis?.blindSpots || result.paths?.bold?.cons?.[0],
            warning: result.contrarianInsight?.perspective || 'Customer demand, timing, or willingness to pay does not match the model.',
            mitigation: result.paths?.safe?.description || 'Validate the riskiest assumption before scaling commitment.',
          },
          {
            label: '3. Hidden Second-Order Risk',
            trigger: result.contrarianInsight?.uncomfortableTruth || result.diagnosis?.keyRisks,
            warning: result.futureSimulation?.threeMonths || 'A secondary dependency starts compounding after the first move.',
            mitigation: result.contrarianInsight?.hiddenOpportunity || 'Create a kill-switch and review cadence before the risk compounds.',
          },
        ]
  ), [result]);

  const secondOrderEffects = useMemo(() => (
    result.secondOrderEffects && result.secondOrderEffects.length > 0
      ? result.secondOrderEffects.map((effect) => ({
          label: effect.scenario,
          immediate: effect.immediateEffect,
          downstream: effect.downstreamConsequence,
          longTerm: effect.hiddenLongTermEffect,
        }))
      : [
          {
            label: 'Hiring now',
            immediate: result.paths?.bold?.pros?.[0] || 'Faster growth',
            downstream: result.paths?.bold?.cons?.[0] || 'Burn increases',
            longTerm: result.futureSimulation?.twelveMonths || 'Financing pressure',
          },
          {
            label: 'Delay hiring',
            immediate: result.paths?.safe?.pros?.[0] || 'Lower burn',
            downstream: result.paths?.safe?.cons?.[0] || 'Slower growth',
            longTerm: result.contrarianInsight?.hiddenOpportunity || 'Possible missed market window',
          },
        ]
  ), [result]);

  const advisorCouncil = useMemo(() => [
    {
      label: 'Strategist',
      points: [
        { label: 'Biggest upside', value: result.strategistView?.biggestUpside || result.paths?.bold?.pros?.[0] || result.contrarianInsight?.hiddenOpportunity },
        { label: 'Leverage move', value: result.strategistView?.leverageMove || result.paths?.bold?.description || result.actionPlan?.thirtyDays },
      ],
    },
    {
      label: 'Skeptic',
      points: [
        { label: 'Hidden flaw', value: result.skepticView?.hiddenFlaw || result.diagnosis?.blindSpots || result.contrarianInsight?.uncomfortableTruth },
        { label: 'What could break', value: result.skepticView?.whatCouldBreak || result.diagnosis?.keyRisks || result.paths?.bold?.cons?.[0] },
      ],
    },
    {
      label: 'Operator',
      points: [
        { label: 'Execution next steps', value: result.operatorNextSteps?.join(' ') || result.actionPlan?.today || result.actionPlan?.thisWeek },
      ],
    },
    {
      label: 'Red Team',
      points: [
        { label: 'Strongest attack', value: result.redTeamCritique || result.contrarianInsight?.perspective || result.paths?.balanced?.cons?.[0] },
      ],
    },
    {
      label: 'Economist',
      points: [
        { label: 'Resource / timing / opportunity cost', value: result.economistView || result.paths?.safe?.cons?.[0] || result.futureSimulation?.twelveMonths },
      ],
    },
  ], [result]);

  const relatedDecisionMemories = useMemo(() => [
    {
      case: 'Hire too early',
      decided: result.paths?.bold?.description || 'Committed before evidence was strong enough.',
      outcome: 'Burn increased',
      lesson: 'Stage hiring in phases',
    },
    {
      case: 'Delayed hiring',
      decided: result.paths?.safe?.description || 'Waited for more certainty before adding capacity.',
      outcome: 'Missed market window',
      lesson: 'Delay has opportunity cost',
    },
    {
      case: 'Phased rollout',
      decided: result.paths?.balanced?.description || 'Validated demand before scaling the plan.',
      outcome: 'Downside stayed contained',
      lesson: 'Use staged commitments before full execution',
    },
  ], [result]);

  const decisionConfidence = useMemo(() => {
    const strategicUpside = Math.round(result.confidenceScore || intelligence.successProbability || result.score || 0);
    const riskExposure = Math.round(100 - Math.min(100, intelligence.downsideRisk || 0));
    const reversibility = Math.round(
      result.paths?.safe?.pros?.length
        ? Math.min(95, 55 + result.paths.safe.pros.length * 10)
        : 60
    );
    const evidenceStrength = Math.round(
      result.confidenceDrivers?.sampleSize
        ? Math.min(95, 55 + result.confidenceDrivers.sampleSize * 8)
        : result.confidenceScore || result.score || 0
    );
    const score = Math.round(
      strategicUpside * 0.35 +
      riskExposure * 0.25 +
      reversibility * 0.2 +
      evidenceStrength * 0.2
    );

    return {
      score: Math.min(100, Math.max(0, Math.round(result.confidenceScore || score))),
      factors: [
        { label: 'Strategic Upside', value: strategicUpside },
        { label: 'Risk Exposure', value: 100 - riskExposure },
        { label: 'Reversibility', value: reversibility },
        { label: 'Evidence Strength', value: evidenceStrength },
      ],
    };
  }, [intelligence.downsideRisk, intelligence.successProbability, result]);

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
            <div className="mt-5 rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.025] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-emerald-300">Decision Confidence</div>
                  <div className="mt-1 text-2xl font-black text-[#F8FAFF]">{decisionConfidence.score}/100</div>
                </div>
                <div className="w-full sm:max-w-[260px]">
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.45)]"
                      style={{ width: `${decisionConfidence.score}%` }}
                    />
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-1 text-[8px] font-bold uppercase text-slate-500">
                    <span>Reconsider &lt;50</span>
                    <span className="text-center">Caution 50-70</span>
                    <span className="text-right">Proceed &gt;70</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
                {decisionConfidence.factors.map((factor) => (
                  <div key={factor.label} className="rounded-lg border border-white/5 bg-[#0B1020]/45 px-2 py-1.5">
                    <div className="text-[8px] font-bold uppercase text-slate-600">{factor.label}</div>
                    <div className="mt-0.5 text-[11px] font-black text-slate-200">{factor.value}/100</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-blue-500/15 bg-blue-500/[0.025] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-blue-300">Outcome Logging</div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-300">What happened after execution?</p>
                </div>
                <button
                  type="button"
                  className="rounded-lg border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-blue-200 transition-colors hover:bg-blue-400/15"
                >
                  Record Outcome
                </button>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {['Outcome better', 'Outcome expected', 'Outcome worse'].map((label) => (
                  <div key={label} className="rounded-lg border border-white/5 bg-[#0B1020]/45 px-3 py-2 text-[10px] font-bold uppercase text-slate-300">
                    {label}
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-lg border border-white/5 bg-[#0B1020]/45 px-3 py-2">
                <div className="text-[8px] font-bold uppercase text-slate-600">Key lesson learned</div>
                <div className="mt-1 text-xs text-slate-400">{result.outcomeLessonPrompt || 'Save lesson to decision memory'}</div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {['+ Strategy worked', '+ Risk missed', '+ Assumption wrong'].map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[9px] font-bold uppercase text-slate-400">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-cyan-500/15 bg-cyan-500/[0.025] p-4">
              <div className="mb-3 text-[10px] font-black uppercase tracking-widest text-cyan-300">Advisor Council</div>
              <div className="grid gap-3 md:grid-cols-5">
                {advisorCouncil.map((advisor) => (
                  <div key={advisor.label} className="rounded-xl border border-white/5 bg-[#0B1020]/55 p-3">
                    <div className="mb-2 text-[9px] font-black uppercase tracking-widest text-slate-300">{advisor.label}</div>
                    <div className="space-y-2">
                      {advisor.points.map((point) => (
                        <div key={point.label}>
                          <div className="text-[9px] font-bold uppercase text-slate-500">{point.label}</div>
                          <p className="mt-0.5 text-xs leading-relaxed text-slate-300">{point.value || 'Not enough signal yet.'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-violet-500/15 bg-violet-500/[0.025] p-4">
              <div className="mb-3 text-[10px] font-black uppercase tracking-widest text-violet-300">Related Past Decisions</div>
              <div className="grid gap-3 md:grid-cols-3">
                {relatedDecisionMemories.map((memory) => (
                  <div key={memory.case} className="rounded-xl border border-white/5 bg-[#0B1020]/55 p-3">
                    <div className="mb-2 text-[9px] font-black uppercase tracking-widest text-slate-300">Case: {memory.case}</div>
                    {[
                      { label: 'What was decided', value: memory.decided },
                      { label: 'Outcome', value: memory.outcome },
                      { label: 'Lesson reused', value: memory.lesson },
                    ].map((item) => (
                      <div key={item.label} className="mt-2">
                        <div className="text-[9px] font-bold uppercase text-slate-500">{item.label}</div>
                        <p className="mt-0.5 text-xs leading-relaxed text-slate-300">{item.value}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-xl border border-violet-400/15 bg-violet-400/[0.06] px-3 py-2">
                <div className="text-[9px] font-black uppercase tracking-widest text-violet-300">Reusable Pattern Detected</div>
                <p className="mt-1 text-xs font-semibold text-slate-200">Phased execution reduces downside.</p>
              </div>
            </div>
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
              <div className="mb-3 text-[10px] font-black uppercase tracking-widest text-purple-300">Counterfactual Paths</div>
              <div className="grid gap-3 md:grid-cols-3">
                {counterfactualPaths.map((path) => (
                  <div key={path.label} className="rounded-xl border border-white/5 bg-[#0B1020]/55 p-3">
                    <div className="mb-2 text-[9px] font-black uppercase tracking-widest text-slate-400">{path.label}</div>
                    <div className="mb-3 grid grid-cols-3 gap-1.5">
                      {[
                        { label: 'Probability', value: path.probability },
                        { label: 'Impact', value: `${path.impact}/10` },
                        { label: 'Confidence', value: `${path.confidence}%` },
                      ].map((signal) => (
                        <div key={signal.label} className="rounded-lg border border-white/5 bg-white/[0.025] px-2 py-1.5">
                          <div className="text-[8px] font-bold uppercase text-slate-600">{signal.label}</div>
                          <div className="mt-0.5 text-[11px] font-black text-slate-200">{signal.value}</div>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      {path.points.map((point) => (
                        <div key={point.label}>
                          <div className="text-[9px] font-bold uppercase text-slate-500">{point.label}</div>
                          <p className="mt-0.5 text-xs leading-relaxed text-slate-300">{point.value || 'Not enough signal yet.'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-rose-500/15 bg-rose-500/[0.025] p-4">
              <div className="mb-3 text-[10px] font-black uppercase tracking-widest text-rose-300">How This Decision Could Fail</div>
              <div className="grid gap-3 md:grid-cols-3">
                {preMortemFailureMap.map((failure) => (
                  <div key={failure.label} className="rounded-xl border border-white/5 bg-[#0B1020]/55 p-3">
                    <div className="mb-2 text-[9px] font-black uppercase tracking-widest text-slate-400">{failure.label}</div>
                    {[
                      { label: 'Risk trigger', value: failure.trigger },
                      { label: 'Early warning signal', value: failure.warning },
                      { label: 'Mitigation move', value: failure.mitigation },
                    ].map((item) => (
                      <div key={item.label} className="mt-2">
                        <div className="text-[9px] font-bold uppercase text-slate-500">{item.label}</div>
                        <p className="mt-0.5 text-xs leading-relaxed text-slate-300">{item.value || 'Not enough signal yet.'}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-amber-500/15 bg-amber-500/[0.025] p-4">
              <div className="mb-3 text-[10px] font-black uppercase tracking-widest text-amber-300">Second-Order Effects</div>
              <div className="grid gap-3 md:grid-cols-2">
                {secondOrderEffects.map((effect) => (
                  <div key={effect.label} className="rounded-xl border border-white/5 bg-[#0B1020]/55 p-3">
                    <div className="mb-2 text-[9px] font-black uppercase tracking-widest text-slate-400">{effect.label}</div>
                    {[
                      { label: 'Immediate effect', value: effect.immediate },
                      { label: 'Downstream consequence', value: effect.downstream },
                      { label: 'Hidden long-term effect', value: effect.longTerm },
                    ].map((item) => (
                      <div key={item.label} className="mt-2">
                        <div className="text-[9px] font-bold uppercase text-slate-500">{item.label}</div>
                        <p className="mt-0.5 text-xs leading-relaxed text-slate-300">{item.value || 'Not enough signal yet.'}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
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
            <DecisionBlueprintBoard data={result} t={t} decisionAccuracy={decisionAccuracy} calibrationScore={calibrationScore} />
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
