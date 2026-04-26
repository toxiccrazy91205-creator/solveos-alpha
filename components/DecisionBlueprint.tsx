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
}

export default function DecisionBlueprint({ data }: DecisionBlueprintProps) {
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
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      dir={data?.language === 'Arabic' ? 'rtl' : 'ltr'}
      className={`w-full max-w-5xl mt-12 md:mt-16 space-y-6 md:space-y-8 relative font-sans ${data?.language === 'Arabic' ? 'text-right' : 'text-left'}`}
    >
      <div className="absolute top-0 w-full h-full bg-gradient-to-b from-blue-500/5 via-purple-500/5 to-transparent blur-3xl pointer-events-none rounded-[100px]" />

      {/* Card 6: Decision Confidence Score (Top right badge style) */}
      <motion.div variants={item} className="flex justify-between items-end border-b border-white/10 pb-6 mb-8">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400 tracking-tight">
            {t.decision_blueprint}
          </h2>
          <div className="flex items-center mt-1">
            <p className="text-neutral-500">{t.synthesized_strategic_breakdown || 'Synthesized strategic breakdown'}</p>
            {data?.isDemo && (
              <span className="ml-3 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] uppercase tracking-tighter text-amber-500 font-bold animate-pulse">
                {t.demo_mode}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end">
           <span className="text-xs text-neutral-500 uppercase tracking-widest mb-1 font-medium">{t.confidence_score}</span>
           <div className="flex items-center space-x-2 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 px-4 py-2 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.15)]">
             <span className="text-3xl font-semibold text-emerald-400">{data?.score || 0}</span>
             <span className="text-lg text-emerald-500/50">/100</span>
           </div>
        </div>
      </motion.div>

      {/* Card 1: Diagnosis */}
      <motion.div variants={item} className="bg-neutral-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-5 md:p-8 relative overflow-hidden group hover:bg-neutral-900/60 transition-colors">
        <h3 className="text-xl font-medium text-white mb-6 flex items-center"><Anchor className="w-5 h-5 mr-3 text-blue-400" /> {t.diagnosis}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div>
             <h4 className="text-xs uppercase text-neutral-500 tracking-wider mb-2 font-medium">{t.core_problem}</h4>
             <p className="text-neutral-300 text-sm leading-relaxed">{data?.diagnosis?.coreProblem || '...'}</p>
          </div>
          <div>
             <h4 className="text-xs uppercase text-neutral-500 tracking-wider mb-2 font-medium">{t.blind_spots}</h4>
             <p className="text-neutral-300 text-sm leading-relaxed">{data?.diagnosis?.blindSpots || '...'}</p>
          </div>
          <div>
             <h4 className="text-xs uppercase text-neutral-500 tracking-wider mb-2 font-medium">{t.key_risks}</h4>
             <p className="text-neutral-300 text-sm leading-relaxed">{data?.diagnosis?.keyRisks || '...'}</p>
          </div>
        </div>
      </motion.div>

      {/* Card 2: Decision Paths */}
      <motion.div variants={item}>
        <h3 className="text-xl font-medium text-white mb-6 flex items-center ml-2"><Shuffle className="w-5 h-5 mr-3 text-purple-400" /> {t.decision_paths}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-neutral-900/30 backdrop-blur-md border border-emerald-500/10 rounded-3xl p-6 hover:border-emerald-500/30 transition-colors shadow-lg">
             <div className="flex items-center space-x-2 mb-4"><Shield className="w-5 h-5 text-emerald-400" /><h4 className="text-white font-medium">{t.safe_path}</h4></div>
             <p className="text-neutral-400 text-sm mb-4">{data?.paths?.safe?.description || '...'}</p>
             <ul className="text-xs text-neutral-500 space-y-2">
               {data?.paths?.safe?.pros?.map((p: string, i: number) => <li key={i}>+ {p}</li>)}
               {data?.paths?.safe?.cons?.map((p: string, i: number) => <li key={i}>- {p}</li>)}
             </ul>
           </div>
           
           <div className="bg-gradient-to-br from-neutral-900/50 to-neutral-800/50 backdrop-blur-md border border-purple-500/20 rounded-3xl p-6 hover:border-purple-500/40 transition-colors shadow-[0_0_40px_rgba(168,85,247,0.05)] relative overflow-hidden">
             <div className="absolute top-0 w-full h-[1px] left-0 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />
             <div className="flex items-center space-x-2 mb-4"><Zap className="w-5 h-5 text-purple-400" /><h4 className="text-white font-medium">{t.balanced_path}</h4></div>
             <p className="text-neutral-300 text-sm mb-4 line-clamp-3">{data?.paths?.balanced?.description || '...'}</p>
             <ul className="text-xs text-purple-200/50 space-y-2">
               {data?.paths?.balanced?.pros?.map((p: string, i: number) => <li key={i} className="text-purple-300/80">+ {p}</li>)}
               {data?.paths?.balanced?.cons?.map((p: string, i: number) => <li key={i}>- {p}</li>)}
             </ul>
           </div>
           
           <div className="bg-neutral-900/30 backdrop-blur-md border border-rose-500/10 rounded-3xl p-6 hover:border-rose-500/30 transition-colors shadow-lg">
             <div className="flex items-center space-x-2 mb-4"><AlertOctagon className="w-5 h-5 text-rose-500" /><h4 className="text-white font-medium">{t.bold_path}</h4></div>
             <p className="text-neutral-400 text-sm mb-4">{data?.paths?.bold?.description || '...'}</p>
             <ul className="text-xs text-neutral-500 space-y-2">
               {data?.paths?.bold?.pros?.map((p: string, i: number) => <li key={i}>+ {p}</li>)}
               {data?.paths?.bold?.cons?.map((p: string, i: number) => <li key={i}>- {p}</li>)}
             </ul>
           </div>
        </div>
      </motion.div>

      {/* Card 4: Recommendation (Highlighted) */}
      <motion.div variants={item} className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-xl border border-blue-500/30 rounded-3xl p-5 md:p-8 relative overflow-hidden shadow-[0_0_60px_rgba(59,130,246,0.15)]">
        <div className="absolute top-0 w-full h-1 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-80" />
        <h3 className="text-sm font-semibold uppercase tracking-widest text-blue-400 mb-3">{t.recommendation}</h3>
        <p className="text-xl text-white font-light leading-relaxed">
          {data?.recommendation || '...'}
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
      
      {/* Raw Output Accordion (To prove API integration is unchanged) */}
      <motion.div variants={item} className="pt-8">
        <details className="group border border-white/10 bg-neutral-900/20 rounded-2xl p-4 cursor-pointer">
          <summary className="text-neutral-500 text-sm font-medium focus:outline-none user-select-none">View Original AI Raw Output</summary>
          <div className="mt-4 pt-4 border-t border-white/10">
             <div className="prose prose-invert max-w-none text-xs text-neutral-400 font-mono whitespace-pre-wrap">
               {JSON.stringify(data, null, 2)}
             </div>
          </div>
        </details>
      </motion.div>

    </motion.div>
  );
}
