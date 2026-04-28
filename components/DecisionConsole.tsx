"use client";

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, FileText, Play, RotateCcw, Send, ShieldQuestion } from 'lucide-react';
import SolveOSSymbol from '@/components/SolveOSSymbol';
import type { ConversationTurn } from '@/lib/types';

// ─── Streaming hook ──────────────────────────────────────────────────────────

function useStreamingText(text: string, active: boolean, speed = 28): string {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    if (!active) return;
    const words = text.split(' ');
    let i = 0;
    const id = setInterval(() => {
      i++;
      if (i > words.length) { clearInterval(id); return; }
      setDisplayed(words.slice(0, i).join(' '));
    }, speed);
    return () => clearInterval(id);
  }, [text, active, speed]);

  // For historical (non-active) turns, return full text directly without state
  return active ? displayed : text;
}

// ─── Thread message components ───────────────────────────────────────────────

function UserTurn({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] bg-white/[0.04] border border-white/[0.08] rounded-2xl rounded-tr-sm px-5 py-4">
        <div className="text-[9px] font-black uppercase text-slate-500 mb-2 tracking-widest">You</div>
        <p className="text-[#F8FAFF] text-sm leading-relaxed font-medium">{content}</p>
      </div>
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div className="flex items-center space-x-4 py-2">
      <SolveOSSymbol active className="loading-core-mark w-5 h-5 flex-shrink-0" />
      <span className="text-[10px] font-black uppercase text-purple-300 tracking-widest">
        Processing Dialectic Simulation
      </span>
    </div>
  );
}

function AssistantTurn({ turn, isLatest }: { turn: ConversationTurn; isLatest: boolean }) {
  const bp = turn.blueprint;
  const streamedVerdict = useStreamingText(turn.content, isLatest);
  const streamDone = streamedVerdict === turn.content;
  const [showCards, setShowCards] = useState(!isLatest);

  useEffect(() => {
    if (!isLatest || showCards) return;
    if (!streamDone) return;
    const timer = setTimeout(() => setShowCards(true), 180);
    return () => clearTimeout(timer);
  }, [isLatest, streamDone, showCards]);

  if (turn.isError) {
    return (
      <div className="flex items-start space-x-3">
        <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
        <p className="text-rose-400 text-sm leading-relaxed">{turn.content}</p>
      </div>
    );
  }

  const isReviewMode = !!bp?.isReviewMode;
  const milestoneTable = bp?.milestoneTable;

  return (
    <div className="space-y-4 blueprint-enter">
      {/* Status bar */}
      <div className="flex items-center space-x-3">
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isReviewMode ? 'bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.6)]' : 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]'}`} />
        <span className={`text-[9px] font-black uppercase tracking-widest ${isReviewMode ? 'text-blue-300' : 'text-emerald-300'}`}>
          {isReviewMode ? 'Review Complete' : 'Analysis Complete'}
        </span>
        <div className={`h-[1px] flex-1 bg-gradient-to-r ${isReviewMode ? 'from-blue-500/20' : 'from-emerald-500/20'} to-transparent`} />
      </div>

      {/* Verdict / Review summary card */}
      <div className={`rounded-2xl p-5 border ${isReviewMode ? 'bg-gradient-to-br from-blue-500/[0.08] to-slate-500/[0.04] border-blue-500/20' : 'bg-gradient-to-br from-purple-500/[0.08] to-blue-500/[0.04] border-purple-500/20'}`}>
        <div className={`text-[9px] font-black uppercase mb-3 tracking-widest ${isReviewMode ? 'text-blue-400' : 'text-purple-400'}`}>
          {isReviewMode ? 'Review' : 'Verdict'}
        </div>
        <p className="text-[#F8FAFF] text-lg font-semibold leading-relaxed">
          {streamedVerdict}
          {isLatest && !streamDone && (
            <span className="inline-block w-0.5 h-4 bg-purple-400 ml-0.5 animate-pulse align-middle" />
          )}
        </p>
      </div>

      {/* Milestone scorecard preview (review mode) */}
      {showCards && isReviewMode && milestoneTable && milestoneTable.length > 0 && (
        <div className="space-y-2">
          <div className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Milestone Scorecard</div>
          <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]">
            {milestoneTable.slice(0, 3).map((row, i) => {
              const statusColors: Record<string, string> = {
                on_track: 'text-emerald-400', exceeded: 'text-blue-400',
                behind: 'text-amber-400', failed: 'text-rose-400', unknown: 'text-slate-500',
              };
              return (
                <div key={i} className="flex items-start space-x-3 px-4 py-3 border-b border-white/[0.04] last:border-b-0">
                  <span className="text-[9px] font-mono text-slate-500 w-14 flex-shrink-0 pt-0.5">{row.horizon}</span>
                  <span className="text-[11px] text-slate-300 flex-1 leading-snug">{row.milestone}</span>
                  <span className={`text-[9px] font-black uppercase tracking-wider flex-shrink-0 ${statusColors[row.status] || 'text-slate-500'}`}>
                    {row.status.replace('_', ' ')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* "Full Review Below" divider for review mode */}
      {showCards && isReviewMode && (
        <div className="flex items-center justify-center space-x-3 opacity-25 pt-1">
          <div className="h-[1px] flex-1 bg-white/20" />
          <span className="text-[8px] font-black uppercase text-slate-400">Full Review Below</span>
          <div className="h-[1px] flex-1 bg-white/20" />
        </div>
      )}

      {/* Why / Risks / Next Move (non-review mode) */}
      {showCards && bp && !isReviewMode && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white/[0.025] border border-white/[0.06] rounded-xl p-4">
              <div className="text-[9px] font-black uppercase text-slate-500 mb-2 tracking-widest">Why This</div>
              <p className="text-slate-300 text-xs leading-relaxed">{bp.recommendation}</p>
            </div>
            <div className="bg-rose-500/[0.03] border border-rose-500/[0.15] rounded-xl p-4">
              <div className="text-[9px] font-black uppercase text-rose-400 mb-2 tracking-widest">Key Risks</div>
              <p className="text-slate-300 text-xs leading-relaxed">{bp.diagnosis.keyRisks}</p>
            </div>
            <div className="bg-emerald-500/[0.04] border border-emerald-500/20 rounded-xl p-4">
              <div className="text-[9px] font-black uppercase text-emerald-400 mb-2 tracking-widest">Next Move</div>
              <p className="text-slate-300 text-xs leading-relaxed">{bp.actionPlan.today}</p>
            </div>
          </div>

          {/* Agent perspectives */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { label: 'Strategist', color: 'text-emerald-400', dot: 'bg-emerald-500', glow: 'rgba(52,211,153,0.5)', text: bp.paths.bold.description },
              { label: 'Skeptic', color: 'text-rose-400', dot: 'bg-rose-500', glow: 'rgba(239,68,68,0.5)', text: bp.contrarianInsight.perspective },
              { label: 'Operator', color: 'text-blue-400', dot: 'bg-blue-500', glow: 'rgba(59,130,246,0.5)', text: bp.actionPlan.thisWeek },
            ].map(({ label, color, dot, glow, text }) => (
              <div key={label} className="flex items-start space-x-3 bg-white/[0.015] border border-white/[0.04] rounded-xl p-3">
                <div className={`w-1.5 h-1.5 rounded-full ${dot} mt-1.5 flex-shrink-0`}
                  style={{ boxShadow: `0 0 7px ${glow}` }} />
                <div>
                  <div className={`text-[9px] font-black uppercase ${color} mb-1`}>{label}</div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">{text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center space-x-3 opacity-25 pt-1">
            <div className="h-[1px] flex-1 bg-white/20" />
            <span className="text-[8px] font-black uppercase text-slate-400">Full Analysis Below</span>
            <div className="h-[1px] flex-1 bg-white/20" />
          </div>
        </>
      )}
    </div>
  );
}

// ─── Empty-state workflow steps ───────────────────────────────────────────────

const decisionSteps = [
  { label: 'Define', description: 'Clarify the decision, constraints, and stakes.', icon: FileText },
  { label: 'Simulate', description: 'Run safe, balanced, and bold futures.', icon: Play },
  { label: 'Pressure Test', description: 'Expose risk, downside, and fragile assumptions.', icon: ShieldQuestion },
  { label: 'Recommended Move', description: 'Collapse the analysis into a next move.', icon: CheckCircle2 },
];

const quickScenarios = [
  { label: 'Quit job', text: 'Should I quit my job and go all-in on my startup within the next 60 days?' },
  { label: 'Relocate', text: 'Should I relocate to a new city for a role with higher upside but less stability?' },
  { label: 'Invest', text: 'Should I invest more capital into a product launch before the first sales cycle closes?' },
];

// ─── Main component ───────────────────────────────────────────────────────────

interface DecisionConsoleProps {
  thread: ConversationTurn[];
  loading: boolean;
  onSubmit: (message: string, mode?: string) => void;
  onReset: () => void;
}

function DecisionConsole({ thread, loading, onSubmit, onReset }: DecisionConsoleProps) {
  const [input, setInput] = useState('');
  const [decisionIntake, setDecisionIntake] = useState({
    pain: '',
    fear: '',
    desiredOutcome: '',
    timePressure: '',
    inactionCost: '',
    question: '',
    goal: '',
    constraints: '',
    stakes: '',
    horizon: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [terminalTab, setTerminalTab] = useState('Strategy');
  const threadEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const hasThread = thread.length > 0;

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread.length, loading]);

  const updateDecisionIntake = useCallback((field: keyof typeof decisionIntake, value: string) => {
    setDecisionIntake((current) => ({ ...current, [field]: value }));
    if (error) setError(null);
  }, [error]);

  const buildDecisionPrompt = useCallback(() => {
    const fields = [
      ['Core pain/problem', decisionIntake.pain],
      ['Biggest fear', decisionIntake.fear],
      ['Desired outcome', decisionIntake.desiredOutcome],
      ['Time pressure', decisionIntake.timePressure],
      ['What happens if I do nothing', decisionIntake.inactionCost],
      ['Decision question', decisionIntake.question],
      ['Goal', decisionIntake.goal],
      ['Constraints', decisionIntake.constraints],
      ['Stakes', decisionIntake.stakes],
      ['Time horizon', decisionIntake.horizon],
    ];

    return fields
      .filter(([, value]) => value.trim())
      .map(([label, value]) => `${label}: ${value.trim()}`)
      .join('\n');
  }, [decisionIntake]);

  const handleSubmit = useCallback((override?: string) => {
    const text = (override ?? (hasThread ? input : buildDecisionPrompt())).trim();
    if (!text) { setError('Please describe your decision to enable simulation.'); return; }
    if (text.length < 20) {
      setError(`Decision details too brief (${text.length}/20 characters minimum). Provide more context about stakes, constraints, and timeline.`);
      return;
    }
    setError(null);
    setInput('');
    setDecisionIntake({
      pain: '',
      fear: '',
      desiredOutcome: '',
      timePressure: '',
      inactionCost: '',
      question: '',
      goal: '',
      constraints: '',
      stakes: '',
      horizon: '',
    });
    onSubmit(text, terminalTab);
  }, [buildDecisionPrompt, hasThread, input, onSubmit, terminalTab]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  return (
    <div className="flex-1 relative z-10">
      <div className="bg-[#0B1020]/78 backdrop-blur-3xl rounded-[32px] border border-white/10 shadow-[0_40px_120px_rgba(0,0,0,0.45),0_0_80px_rgba(168,85,247,0.08)] overflow-hidden">

        {/* Tab bar */}
        <div className="flex items-center px-10 pt-8 space-x-8 border-b border-white/5">
          {['Strategy', 'Risk', 'Scenarios', 'Red Team'].map((tab) => (
            <button
              key={tab}
              onClick={() => setTerminalTab(tab)}
              className={`pb-4 text-[11px] font-black uppercase transition-all ${
                terminalTab === tab
                  ? 'text-[#F8FAFF] border-b-2 border-purple-400 drop-shadow-[0_0_12px_rgba(168,85,247,0.35)]'
                  : 'text-slate-500 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
          <div className="ml-auto pb-4 flex items-center space-x-2 opacity-80">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_14px_rgba(168,85,247,0.8)]" />
            <span className="text-[9px] font-black uppercase text-purple-200">Decision Core Active</span>
          </div>
        </div>

        <div className="p-6 sm:p-10">

          {/* Header row */}
          <div className="mb-8 flex items-center justify-between border-b border-white/5 pb-6">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full border border-purple-300 bg-purple-500/40 shadow-[0_0_16px_rgba(168,85,247,0.8)]" />
              <span className="text-[9px] font-black uppercase text-slate-300">
                {hasThread ? 'Decision Thread Active' : 'Primary Simulation Interface'}
              </span>
            </div>
            {hasThread && (
              <button
                onClick={onReset}
                className="flex items-center space-x-2 text-[9px] font-black uppercase text-slate-500 hover:text-slate-200 transition-colors group"
              >
                <RotateCcw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-300" />
                <span>New Decision</span>
              </button>
            )}
          </div>

          {/* Empty state: workflow steps */}
          {!hasThread && !loading && (
            <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-4">
              {decisionSteps.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <div
                    key={step.label}
                    className="rounded-xl border border-white/5 bg-white/[0.015] p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <StepIcon className="h-4 w-4 text-slate-500" />
                      <span className="font-mono text-[9px] text-slate-500">0{index + 1}</span>
                    </div>
                    <div className="text-[10px] font-black uppercase text-[#F8FAFF]">{step.label}</div>
                    <p className="mt-2 text-[10px] leading-relaxed text-slate-400">{step.description}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Thread area */}
          {hasThread && (
            <div className="mb-6 max-h-[540px] overflow-y-auto space-y-6 pr-1 scroll-smooth">
              {thread.map((turn, i) => {
                const isLatestAssistant =
                  turn.role === 'assistant' &&
                  i === thread.length - 1;
                return turn.role === 'user'
                  ? <UserTurn key={turn.id} content={turn.content} />
                  : <AssistantTurn key={turn.id} turn={turn} isLatest={isLatestAssistant} />;
              })}
              {loading && <ThinkingBubble />}
              <div ref={threadEndRef} />
            </div>
          )}

          {/* Input textarea */}
          {!hasThread && !loading ? (
            /* Empty state — structured decision intake */
            <div className="space-y-3">
              <div className="rounded-2xl border border-rose-500/15 bg-rose-500/[0.025] px-5 py-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest text-rose-300">Pain Intake</span>
                  <span className="font-mono text-[9px] text-slate-600">PRE-SIMULATION</span>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    { key: 'pain', label: 'Core pain/problem', placeholder: 'Users do not fully trust the product yet' },
                    { key: 'fear', label: 'Biggest fear', placeholder: 'We launch publicly and damage credibility' },
                    { key: 'desiredOutcome', label: 'Desired outcome', placeholder: 'Clear proof that retention and trust are improving' },
                    { key: 'timePressure', label: 'Time pressure', placeholder: 'Need signal before next month' },
                    { key: 'inactionCost', label: 'What happens if I do nothing', placeholder: 'Competitors move faster and the team loses momentum' },
                  ].map((field) => (
                    <div
                      key={field.key}
                      className={field.key === 'inactionCost' ? 'md:col-span-2' : undefined}
                    >
                      <label className="mb-2 block text-[9px] font-black uppercase tracking-widest text-slate-500">{field.label}</label>
                      <input
                        value={decisionIntake[field.key as keyof typeof decisionIntake]}
                        onChange={(e) => updateDecisionIntake(field.key as keyof typeof decisionIntake, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full rounded-xl border border-white/[0.06] bg-[#0B1020]/45 px-4 py-3 text-sm font-medium text-[#F8FAFF] placeholder-slate-600 selection:bg-purple-500/30 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-5 py-4">
                <label className="mb-2 block text-[9px] font-black uppercase tracking-widest text-purple-300">Decision question</label>
                <textarea
                  ref={inputRef}
                  value={decisionIntake.question}
                  onChange={(e) => updateDecisionIntake('question', e.target.value)}
                  placeholder="Should we launch to 300 beta users next month?"
                  rows={3}
                  className="w-full resize-none border-none bg-transparent text-xl font-semibold leading-relaxed text-[#F8FAFF] placeholder-slate-600 selection:bg-purple-500/30 focus:outline-none sm:text-2xl"
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  { key: 'goal', label: 'Goal', placeholder: 'Validate trust and retention' },
                  { key: 'constraints', label: 'Constraints', placeholder: 'Small team, limited budget' },
                  { key: 'stakes', label: 'Stakes', placeholder: 'Reputation, churn, opportunity cost' },
                  { key: 'horizon', label: 'Time horizon', placeholder: '30-90 days' },
                ].map((field) => (
                  <div key={field.key} className="rounded-xl border border-white/[0.06] bg-white/[0.015] px-4 py-3">
                    <label className="mb-2 block text-[9px] font-black uppercase tracking-widest text-slate-500">{field.label}</label>
                    <input
                      value={decisionIntake[field.key as keyof typeof decisionIntake]}
                      onChange={(e) => updateDecisionIntake(field.key as keyof typeof decisionIntake, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full border-none bg-transparent text-sm font-medium text-[#F8FAFF] placeholder-slate-600 selection:bg-purple-500/30 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : hasThread && !loading ? (
            /* Thread state — compact follow-up input */
            <div className="border border-white/[0.08] bg-white/[0.02] rounded-2xl px-5 py-4 mt-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => { setInput(e.target.value); if (error) setError(null); }}
                onKeyDown={handleKeyDown}
                placeholder="Ask a follow-up or explore another angle… (Enter to send)"
                rows={2}
                className="w-full bg-transparent text-sm text-[#F8FAFF] placeholder-slate-600 focus:outline-none resize-none font-medium leading-relaxed border-none selection:bg-purple-500/30"
              />
            </div>
          ) : null}

          {/* Quick scenarios — only in empty state */}
          {!hasThread && !loading && (
            <div className="mt-10 flex flex-col space-y-4">
              <span className="text-[9px] font-black text-slate-400 uppercase">Baseline Scenarios</span>
              <div className="flex flex-wrap gap-2">
                {quickScenarios.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => {
                      setDecisionIntake((current) => ({ ...current, question: s.text }));
                      handleSubmit(s.text);
                    }}
                    disabled={loading}
                    className="flex items-center space-x-3 text-[9px] border px-4 py-2 rounded-xl transition-all duration-300 font-bold uppercase disabled:opacity-50 bg-white/[0.03] hover:bg-white/[0.06] border-white/10 text-slate-300 hover:text-[#F8FAFF]"
                  >
                    <Play className="h-3 w-3" />
                    <span>{s.label}</span>
                    <span className="opacity-40">{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submit / Send button */}
          <div className="mt-8 pt-6 border-t border-white/[0.03]">
            {!hasThread ? (
              /* Primary CTA */
              <button
                onClick={() => handleSubmit()}
                disabled={loading || buildDecisionPrompt().trim().length === 0}
                className="group relative w-full overflow-hidden rounded-2xl p-[1px] transition-all hover:scale-[1.005] active:scale-[0.995] disabled:opacity-30 shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/50 via-white/15 to-purple-500/50" />
                <div className="relative flex h-20 w-full items-center justify-center rounded-[15px] bg-[#0A0F1F] transition-all group-hover:bg-[#101936]">
                  {loading ? (
                    <div className="flex items-center space-x-6 text-white">
                      <SolveOSSymbol active className="loading-core-mark" />
                      <span className="text-[10px] font-black uppercase">Processing Dialectic Simulation</span>
                    </div>
                  ) : (
                    <span className="text-base font-black uppercase text-white group-hover:text-purple-300 transition-colors">
                      RUN DECISION COPILOT →
                    </span>
                  )}
                </div>
              </button>
            ) : (
              /* Thread send button */
              <button
                onClick={() => handleSubmit()}
                disabled={loading || input.trim().length === 0}
                className="group flex items-center justify-center space-x-3 w-full h-12 rounded-2xl border border-purple-500/30 bg-purple-500/[0.06] hover:bg-purple-500/[0.12] disabled:opacity-30 transition-all"
              >
                <Send className="w-4 h-4 text-purple-300" />
                <span className="text-[11px] font-black uppercase text-purple-200">Send</span>
              </button>
            )}

            {!hasThread && (
              <div className="mt-4 flex items-center justify-center space-x-4 opacity-20">
                <div className="h-[1px] flex-1 bg-white" />
                <span className="text-[8px] font-black uppercase">Active Decision Core v2.0</span>
                <div className="h-[1px] flex-1 bg-white" />
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mx-6 mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center">
            <AlertTriangle className="w-4 h-4 mr-3 flex-shrink-0" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(DecisionConsole);
