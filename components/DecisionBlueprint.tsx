"use client";

import { useState } from 'react';
import { Shield, Zap, CheckCircle, TrendingUp, AlertOctagon, Flame } from 'lucide-react';

import type { DecisionBlueprint } from '../lib/types';

interface DecisionBlueprintProps {
  data: DecisionBlueprint;
  t: Record<string, string>;
}

export default function DecisionBlueprint({ data, t }: DecisionBlueprintProps) {
  const drivers = data?.confidenceDrivers;
  const hasHistoricalAdjustment = !!drivers && drivers.sampleSize > 0;
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const signed = (value: number) => value > 0 ? `+${value}` : String(value);
  const evidence = drivers?.evidence || [];
  const hasEvidence = evidence.length > 0;
  const outcomeLabel = (outcome: string) => {
    const first = outcome.split(':')[0]?.trim() || outcome;
    return first.length > 36 ? `${first.slice(0, 36)}...` : first;
  };
  const decisionLabel = (problem: string) =>
    problem.length > 42 ? `${problem.slice(0, 42)}...` : problem;

  return (
    <div
      dir={data?.language === 'Arabic' ? 'rtl' : 'ltr'}
      className={`w-full max-w-5xl mt-16 space-y-6 md:space-y-10 relative font-sans blueprint-enter ${data?.language === 'Arabic' ? 'text-right' : 'text-left'}`}
    >
      {/* Header Summary */}
      <div className="flex justify-between items-center border-b border-white/[0.03] pb-8 mb-4">
        <div className="space-y-1">
          <h2 className="text-4xl font-black tracking-tighter text-white">
            {t.decision_blueprint}
          </h2>
          <div className="flex items-center space-x-3">
            <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">{t.synthesized_strategic_breakdown || 'Synthesized strategic breakdown'}</span>
            </div>
        </div>
        <div className="flex items-center space-x-6">
           <div className="flex flex-col items-end">
             <span className="text-[9px] text-neutral-600 uppercase tracking-widest mb-1 font-bold">{t.confidence_score}</span>
             <span className="text-4xl font-black text-white tracking-tighter">{data?.score || 0}<span className="text-lg text-neutral-700 ml-0.5">/100</span></span>
             <div className="mt-3 w-56 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-right">
               <div className="mb-2 text-[8px] font-black uppercase tracking-widest text-neutral-500">
                 Confidence Drivers · Why {data?.score || 0}%?
               </div>
               {hasHistoricalAdjustment && drivers ? (
                 <div className="space-y-1 text-[9px] font-mono text-neutral-400">
                   <div className="flex justify-between gap-3">
                     <span>Base confidence</span>
                     <span className="text-neutral-200">{drivers.baseConfidence}</span>
                   </div>
                   <div className="flex justify-between gap-3">
                     <span>Prior outcomes</span>
                     <span className={drivers.priorOutcomesAdjustment >= 0 ? 'text-emerald-300' : 'text-amber-300'}>
                       {signed(drivers.priorOutcomesAdjustment)}
                     </span>
                   </div>
                   <div className="flex justify-between gap-3">
                     <span>Similar success rate</span>
                     <button
                       type="button"
                       onClick={() => hasEvidence && setEvidenceOpen(open => !open)}
                       disabled={!hasEvidence}
                       aria-expanded={evidenceOpen}
                       className={`text-right ${hasEvidence ? 'text-blue-300 underline decoration-blue-400/40 underline-offset-2 hover:text-blue-200' : 'text-neutral-200'}`}
                     >
                       {typeof drivers.similarSuccessRate === 'number' ? `${drivers.similarSuccessRate}%` : '—'}
                     </button>
                   </div>
                   <div className="flex justify-between gap-3">
                     <span>Risk penalty</span>
                     <span className={drivers.riskPenalty < 0 ? 'text-amber-300' : 'text-neutral-500'}>
                       {signed(drivers.riskPenalty)}
                     </span>
                   </div>
                   <div className="mt-2 flex justify-between gap-3 border-t border-white/10 pt-2 font-black text-neutral-200">
                     <span>Final confidence</span>
                     <span>{drivers.finalConfidence}</span>
                   </div>
                   {evidenceOpen && hasEvidence && (
                     <div className="mt-3 space-y-3 rounded-xl border border-white/10 bg-black/20 p-3 text-left font-sans">
                       <div>
                         <div className="text-[8px] font-black uppercase tracking-widest text-neutral-500">
                           Based on {evidence.length} related decision{evidence.length !== 1 ? 's' : ''}
                         </div>
                         <div className="mt-2 space-y-2">
                           {evidence.map(item => (
                             <div key={item.decisionId} className="border-b border-white/5 pb-2 last:border-b-0 last:pb-0">
                               <div className="text-[10px] font-bold leading-snug text-neutral-300">
                                 <span className="text-neutral-600">•</span> {decisionLabel(item.problem)} <span className="text-neutral-600">—</span>{' '}
                                 <span className="text-neutral-200">{outcomeLabel(item.actualOutcome)}</span>
                               </div>
                               <div className="mt-1 text-[8px] font-mono text-neutral-500">
                                 Predicted {item.predictedConfidence} / Actual {item.actualConfidence} /{' '}
                                 <span className={item.calibrationOffset >= 0 ? 'text-emerald-300' : 'text-amber-300'}>
                                   {signed(item.calibrationOffset)} offset
                                 </span>
                               </div>
                             </div>
                           ))}
                         </div>
                         {typeof drivers.similarSuccessRate === 'number' && (
                           <div className="mt-2 border-t border-white/10 pt-2 text-[9px] font-black text-neutral-300">
                             Historical success: {drivers.similarSuccessRate}%
                           </div>
                         )}
                       </div>
                       <div className="border-t border-white/10 pt-3">
                         <div className="text-[8px] font-black uppercase tracking-widest text-neutral-500">
                           What would lower confidence?
                         </div>
                         <ul className="mt-2 space-y-1 text-[9px] leading-relaxed text-neutral-500">
                           <li>resource strain risk</li>
                           <li>execution failure pattern</li>
                           <li>black swan trigger</li>
                         </ul>
                       </div>
                     </div>
                   )}
                 </div>
               ) : (
                 <p className="text-[9px] leading-relaxed text-neutral-500">
                   No historical confidence adjustment yet.
                 </p>
               )}
             </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Diagnosis: Left Column (High Density) */}
        <div className="md:col-span-4 space-y-8 glass-note p-8 rounded-[32px]">
          <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-8 border-l-2 border-white pl-3">{t.diagnosis}</h3>
          
          <div className="space-y-8">
            <div className="group">
               <h4 className="text-[10px] uppercase text-neutral-600 tracking-wider mb-2 font-black">{t.core_problem}</h4>
               <p className="text-neutral-300 text-sm leading-relaxed font-medium">{data?.diagnosis?.coreProblem || '...'}</p>
            </div>
            <div className="group">
               <h4 className="text-[10px] uppercase text-neutral-600 tracking-wider mb-2 font-black">{t.blind_spots}</h4>
               <p className="text-neutral-300 text-sm leading-relaxed font-medium">{data?.diagnosis?.blindSpots || '...'}</p>
            </div>
            <div className="group">
               <h4 className="text-[10px] uppercase text-neutral-600 tracking-wider mb-2 font-black">{t.key_risks}</h4>
               <p className="text-neutral-300 text-sm leading-relaxed font-medium">{data?.diagnosis?.keyRisks || '...'}</p>
            </div>
          </div>
        </div>

        {/* Paths: Right Column (Apple Notes clarity) */}
        <div className="md:col-span-8 space-y-6">
          <div className="glass-note p-8 rounded-[32px] border-emerald-500/10 hover:border-emerald-500/20 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-black text-emerald-400 uppercase tracking-widest">{t.safe_path}</h4>
              <Shield className="w-4 h-4 text-emerald-400/40" />
            </div>
            <p className="text-neutral-300 text-lg font-light leading-relaxed mb-6">{data?.paths?.safe?.description || '...'}</p>
            <div className="flex flex-wrap gap-4">
               {data?.paths?.safe?.pros?.map((p: string, i: number) => <span key={i} className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider bg-white/[0.03] px-3 py-1 rounded-full">+ {p}</span>)}
            </div>
          </div>

          <div className="glass-note p-8 rounded-[32px] border-purple-500/20 bg-gradient-to-br from-white/[0.02] to-transparent shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10"><Zap className="w-12 h-12 text-purple-400" /></div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-black text-purple-400 uppercase tracking-widest">{t.balanced_path}</h4>
            </div>
            <p className="text-neutral-100 text-xl font-medium leading-tight mb-8">{data?.paths?.balanced?.description || '...'}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <span className="text-[9px] text-purple-400/60 uppercase font-black tracking-widest">Efficiency Gains</span>
                 <ul className="text-xs text-neutral-400 space-y-1.5">
                   {data?.paths?.balanced?.pros?.map((p: string, i: number) => <li key={i} className="flex items-center"><span className="w-1 h-1 bg-purple-500 rounded-full mr-2" /> {p}</li>)}
                 </ul>
               </div>
               <div className="space-y-2">
                 <span className="text-[9px] text-rose-400/60 uppercase font-black tracking-widest">Trade-offs</span>
                 <ul className="text-xs text-neutral-400 space-y-1.5">
                   {data?.paths?.balanced?.cons?.map((p: string, i: number) => <li key={i} className="flex items-center opacity-60"><span className="w-1 h-1 bg-neutral-600 rounded-full mr-2" /> {p}</li>)}
                 </ul>
               </div>
            </div>
          </div>

          <div className="glass-note p-8 rounded-[32px] border-rose-500/10 hover:border-rose-500/20 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-black text-rose-400 uppercase tracking-widest">{t.bold_path}</h4>
              <AlertOctagon className="w-4 h-4 text-rose-400/40" />
            </div>
            <p className="text-neutral-400 text-lg font-light leading-relaxed mb-6">{data?.paths?.bold?.description || '...'}</p>
            <div className="flex flex-wrap gap-4">
               {data?.paths?.bold?.pros?.map((p: string, i: number) => <span key={i} className="text-[10px] text-neutral-600 font-bold uppercase tracking-wider bg-white/[0.03] px-3 py-1 rounded-full">+ {p}</span>)}
            </div>
          </div>
        </div>
      </div>

      {/* Card 4: Recommendation (Highlighted) */}
      <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-xl border border-blue-500/30 rounded-3xl p-5 md:p-8 relative overflow-hidden shadow-[0_0_60px_rgba(59,130,246,0.15)]">
        <div className="absolute top-0 w-full h-1 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-80" />
        <h3 className="text-sm font-semibold uppercase tracking-widest text-blue-400 mb-3">{t.recommendation}</h3>
        <p className="text-xl text-white font-light leading-relaxed">
          {data?.recommendation || '...'}
        </p>
      </div>

      {/* Why this recommendation? (Immersion Section) */}
      <div className="bg-neutral-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 hover:bg-neutral-900/60 transition-colors">
         <h3 className="text-lg font-bold text-white mb-4 flex items-center">
           <Zap className="w-5 h-5 mr-3 text-yellow-400" />
           {t.why_this_recommendation || 'Why this recommendation?'}
         </h3>
         <p className="text-neutral-400 text-sm leading-relaxed max-w-3xl">
           {String(data?.recommendation).length > 100 
             ? `This conclusion was reached by synthesizing the ${data?.paths?.balanced?.description ? 'Balanced path' : 'strategic'} trajectory while accounting for the ${data?.diagnosis?.coreProblem || 'core problem'}. By prioritizing the ${data?.paths?.balanced?.pros?.[0] || 'efficiency'}, SolveOS aims to mitigate the ${data?.diagnosis?.keyRisks || 'identified risks'} before committing to a higher burn rate.`
             : t.reasoning_summary_placeholder || 'Our agents have cross-referenced your core problem with multiple strategic frameworks to identify the path with the highest probability of success and lowest resource drain.'
           }
         </p>
      </div>

      {/* Card: Contrarian Insight (New Signature Feature) */}
      <div className="bg-gradient-to-br from-orange-950/40 via-red-950/20 to-neutral-900/40 backdrop-blur-xl border border-orange-500/20 rounded-3xl p-5 md:p-8 relative overflow-hidden shadow-[0_0_60px_rgba(234,88,12,0.1)] group">
        <div className="absolute top-0 w-full h-[2px] left-0 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50" />
        <h3 className="text-xl font-medium text-white mb-6 flex items-center"><Flame className="w-5 h-5 mr-3 text-orange-500 group-hover:animate-pulse" /> {t.contrarian_insight}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 relative z-10">
          <div className="bg-orange-500/5 border border-orange-500/10 rounded-2xl p-6">
             <h4 className="text-xs uppercase text-orange-400/80 tracking-wider mb-3 font-medium">Contrarian Perspective</h4>
             <p className="text-orange-100/90 text-sm leading-relaxed">{data?.contrarianInsight?.perspective || 'What if the obvious choice is completely wrong?'}</p>
          </div>
          <div className="bg-orange-500/5 border border-orange-500/10 rounded-2xl p-6">
             <h4 className="text-xs uppercase text-orange-400/80 tracking-wider mb-3 font-medium">Hidden Opportunity</h4>
             <p className="text-orange-100/90 text-sm leading-relaxed">{data?.contrarianInsight?.hiddenOpportunity || 'There is an angle you are not seeing.'}</p>
          </div>
          <div className="bg-orange-500/5 border border-orange-500/10 rounded-2xl p-6">
             <h4 className="text-xs uppercase text-orange-400/80 tracking-wider mb-3 font-medium">Uncomfortable Truth</h4>
             <p className="text-orange-100/90 text-sm leading-relaxed">{data?.contrarianInsight?.uncomfortableTruth || 'A hard reality you might be avoiding.'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Card 3: Future Simulation */}
        <div className="bg-neutral-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-5 md:p-8 hover:bg-neutral-900/60 transition-colors">
           <h3 className="text-xl font-medium text-white mb-6 flex items-center"><TrendingUp className="w-5 h-5 mr-3 text-pink-400" /> {t.future_simulation}</h3>
           <div className="space-y-6">
             <div className="flex space-x-4">
               <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-white font-medium text-sm">3M</div>
               <div>
                 <h4 className="text-sm text-neutral-300 font-medium mb-1">3 {t.months_out || 'Months Out'}</h4>
                 <p className="text-neutral-500 text-sm">{data?.futureSimulation?.threeMonths || '...'}</p>
               </div>
             </div>
             <div className="flex space-x-4">
               <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-white font-medium text-sm">12M</div>
               <div>
                 <h4 className="text-sm text-neutral-300 font-medium mb-1">12 {t.months_out || 'Months Out'}</h4>
                 <p className="text-neutral-500 text-sm">{data?.futureSimulation?.twelveMonths || '...'}</p>
               </div>
             </div>
           </div>
        </div>

        {/* Card 5: Action Plan */}
        <div className="bg-neutral-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-5 md:p-8 hover:bg-neutral-900/60 transition-colors">
           <h3 className="text-xl font-medium text-white mb-6 flex items-center"><CheckCircle className="w-5 h-5 mr-3 text-amber-400" /> {t.action_plan}</h3>
           <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                 <div className="flex items-center justify-center w-6 h-6 rounded-full border border-white/20 bg-neutral-900 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                   <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                 </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md">
                   <div className="flex items-center justify-between mb-1">
                     <div className="font-semibold text-white text-sm">{t.today}</div>
                   </div>
                   <div className="text-neutral-400 text-xs text-wrap leading-relaxed">{data?.actionPlan?.today || '...'}</div>
                 </div>
              </div>
              
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                 <div className="flex items-center justify-center w-6 h-6 rounded-full border border-white/20 bg-neutral-900 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <div className="w-1.5 h-1.5 bg-white/50 rounded-full"></div>
                 </div>
                 <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md">
                   <div className="flex items-center justify-between mb-1">
                     <div className="font-semibold text-white text-sm">{t.this_week}</div>
                   </div>
                   <div className="text-neutral-400 text-xs leading-relaxed">{data?.actionPlan?.thisWeek || '...'}</div>
                 </div>
              </div>
              
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                 <div className="flex items-center justify-center w-6 h-6 rounded-full border border-white/20 bg-neutral-900 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <div className="w-1.5 h-1.5 bg-white/50 rounded-full"></div>
                 </div>
                 <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md">
                   <div className="flex items-center justify-between mb-1">
                     <div className="font-semibold text-white text-sm">{t.thirty_days}</div>
                   </div>
                   <div className="text-neutral-400 text-xs leading-relaxed">{data?.actionPlan?.thirtyDays || '...'}</div>
                 </div>
              </div>
           </div>
        </div>
      </div>


    </div>
  );
}
