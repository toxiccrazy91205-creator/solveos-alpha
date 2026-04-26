import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Shuffle, Zap, CheckCircle, TrendingUp, AlertOctagon, Anchor, Flame } from 'lucide-react';

// Import locales
import en from '../locales/en/common.json';
import ru from '../locales/ru/common.json';
import ar from '../locales/ar/common.json';
import de from '../locales/de/common.json';
import es from '../locales/es/common.json';
import zh from '../locales/zh/common.json';

const locales: Record<string, any> = { 
  English: en, 
  Russian: ru, 
  Arabic: ar, 
  German: de, 
  Spanish: es, 
  Chinese: zh 
};

interface DecisionBlueprintProps {
  data: Record<string, unknown>;
  debugMode?: boolean;
}

export default function DecisionBlueprint({ data, debugMode }: DecisionBlueprintProps) {
  // Select the appropriate locale based on the detected language, default to English
  const t = locales[data?.language as string] || locales.English;
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      dir={data?.language === 'Arabic' ? 'rtl' : 'ltr'}
      className={`w-full max-w-5xl mt-16 space-y-6 md:space-y-10 relative font-sans ${data?.language === 'Arabic' ? 'text-right' : 'text-left'}`}
    >
      {/* Header Summary */}
      <motion.div variants={item} className="flex justify-between items-center border-b border-white/[0.03] pb-8 mb-4">
        <div className="space-y-1">
          <h2 className="text-4xl font-black tracking-tighter text-white">
            {t.decision_blueprint}
          </h2>
          <div className="flex items-center space-x-3">
            <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">{t.synthesized_strategic_breakdown || 'Synthesized strategic breakdown'}</span>
            {data?.isDemo && (
              <span className="px-2 py-0.5 bg-white/[0.03] border border-white/10 rounded-full text-[9px] uppercase tracking-tighter text-neutral-400 font-bold">
                {t.demo_mode}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-6">
           <div className="flex flex-col items-end">
             <span className="text-[9px] text-neutral-600 uppercase tracking-widest mb-1 font-bold">{t.confidence_score}</span>
             <span className="text-4xl font-black text-white tracking-tighter">{data?.score || 0}<span className="text-lg text-neutral-700 ml-0.5">/100</span></span>
           </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Diagnosis: Left Column (High Density) */}
        <motion.div variants={item} className="md:col-span-4 space-y-8 glass-note p-8 rounded-[32px]">
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
        </motion.div>

        {/* Paths: Right Column (Apple Notes clarity) */}
        <div className="md:col-span-8 space-y-6">
          <motion.div variants={item} className="glass-note p-8 rounded-[32px] border-emerald-500/10 hover:border-emerald-500/20 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-black text-emerald-400 uppercase tracking-widest">{t.safe_path}</h4>
              <Shield className="w-4 h-4 text-emerald-400/40" />
            </div>
            <p className="text-neutral-300 text-lg font-light leading-relaxed mb-6">{data?.paths?.safe?.description || '...'}</p>
            <div className="flex flex-wrap gap-4">
               {data?.paths?.safe?.pros?.map((p: string, i: number) => <span key={i} className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider bg-white/[0.03] px-3 py-1 rounded-full">+ {p}</span>)}
            </div>
          </motion.div>

          <motion.div variants={item} className="glass-note p-8 rounded-[32px] border-purple-500/20 bg-gradient-to-br from-white/[0.02] to-transparent shadow-2xl relative overflow-hidden">
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
          </motion.div>

          <motion.div variants={item} className="glass-note p-8 rounded-[32px] border-rose-500/10 hover:border-rose-500/20 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-black text-rose-400 uppercase tracking-widest">{t.bold_path}</h4>
              <AlertOctagon className="w-4 h-4 text-rose-400/40" />
            </div>
            <p className="text-neutral-400 text-lg font-light leading-relaxed mb-6">{data?.paths?.bold?.description || '...'}</p>
            <div className="flex flex-wrap gap-4">
               {data?.paths?.bold?.pros?.map((p: string, i: number) => <span key={i} className="text-[10px] text-neutral-600 font-bold uppercase tracking-wider bg-white/[0.03] px-3 py-1 rounded-full">+ {p}</span>)}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Card 4: Recommendation (Highlighted) */}
      <motion.div variants={item} className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-xl border border-blue-500/30 rounded-3xl p-5 md:p-8 relative overflow-hidden shadow-[0_0_60px_rgba(59,130,246,0.15)]">
        <div className="absolute top-0 w-full h-1 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-80" />
        <h3 className="text-sm font-semibold uppercase tracking-widest text-blue-400 mb-3">{t.recommendation}</h3>
        <p className="text-xl text-white font-light leading-relaxed">
          {data?.recommendation || '...'}
        </p>
      </motion.div>

      {/* Why this recommendation? (Immersion Section) */}
      <motion.div variants={item} className="bg-neutral-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 hover:bg-neutral-900/60 transition-colors">
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
      </motion.div>

      {/* Card: Contrarian Insight (New Signature Feature) */}
      <motion.div variants={item} className="bg-gradient-to-br from-orange-950/40 via-red-950/20 to-neutral-900/40 backdrop-blur-xl border border-orange-500/20 rounded-3xl p-5 md:p-8 relative overflow-hidden shadow-[0_0_60px_rgba(234,88,12,0.1)] group">
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
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Card 3: Future Simulation */}
        <motion.div variants={item} className="bg-neutral-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-5 md:p-8 hover:bg-neutral-900/60 transition-colors">
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
        </motion.div>

        {/* Card 5: Action Plan */}
        <motion.div variants={item} className="bg-neutral-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-5 md:p-8 hover:bg-neutral-900/60 transition-colors">
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
        </motion.div>
      </div>

      {/* Raw Output (Strictly for Developers in Local Dev) */}
      {process.env.NODE_ENV === 'development' && (
        <motion.div variants={item} className="pt-8 opacity-20 hover:opacity-100 transition-opacity">
          <details className="group border border-white/5 bg-neutral-950 rounded-2xl p-4 cursor-pointer">
            <summary className="text-neutral-600 text-xs font-mono focus:outline-none user-select-none">
               [DEV_ONLY] RAW_JSON_PAYLOAD
            </summary>
            <div className="mt-4 pt-4 border-t border-white/5">
               <div className="prose prose-invert max-w-none text-[10px] text-neutral-500 font-mono whitespace-pre-wrap">
                 {JSON.stringify(data, null, 2)}
               </div>
            </div>
          </details>
        </motion.div>
      )}

    </motion.div>
  );
}
