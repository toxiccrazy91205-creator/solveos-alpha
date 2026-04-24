import React from 'react';
import { motion } from 'framer-motion';
import { Brain, AlertTriangle, Settings, Target } from 'lucide-react';

export default function BoardMock() {
  const advisors = [
    {
      name: 'Strategist',
      icon: <Brain className="w-6 h-6 text-emerald-400" />,
      tone: 'Strategic angle & Long-term opportunity',
      perspective: 'Looks purely at future potential, ecosystem plays, and compounding advantages.',
      argument: 'By positioning ourselves here now, we capture early mindshare and create a strong moat against competitors entering the space.',
      recommendation: 'Aggressively invest in this direction, treating it as a primary pillar for the next 24 months.',
    },
    {
      name: 'Skeptic',
      icon: <AlertTriangle className="w-6 h-6 text-rose-500" />,
      tone: 'Risks & Failure modes',
      perspective: 'Identifies massive assumptions, downside scenarios, and resource drains.',
      argument: 'We are assuming market readiness that does not yet exist. The burn rate to educate the market will drain our core reserves within 9 months.',
      recommendation: 'Pivot to a lighter validation phase. Do not commit full capital until customer acquisition cost is proven.',
    },
    {
      name: 'Operator',
      icon: <Settings className="w-6 h-6 text-blue-400" />,
      tone: 'Execution & Next steps',
      perspective: 'Focuses entirely on bandwidth, logistics, and ground-level execution.',
      argument: 'The roadmap is too bloated. The engineering team is already at 90% capacity maintaining legacy systems, meaning this new initiative will drag.',
      recommendation: 'Cut the scope by 50%. Deliver a barebones MVP in 6 weeks using our current infrastructure before scaling.',
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="w-full max-w-5xl mt-12 flex flex-col space-y-8 relative"
    >
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-purple-500/10 blur-[120px] pointer-events-none rounded-full" />

      {/* Grid for Advisors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {advisors.map((adv, idx) => (
          <motion.div 
            variants={item}
            key={idx} 
            className="flex flex-col h-full bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-7 relative overflow-hidden group hover:bg-neutral-900/60 transition-all duration-500 shadow-2xl hover:border-white/10"
          >
            {/* Subtle top border gradient based on index */}
            <div className={`absolute top-0 w-full h-[2px] left-0 opacity-40 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-transparent via-${idx === 0 ? 'emerald' : idx === 1 ? 'rose' : 'blue'}-500 to-transparent`} />
            
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/5 shadow-inner">
                {adv.icon}
              </div>
              <div>
                <h3 className="text-xl font-medium text-white tracking-tight">{adv.name}</h3>
                <p className="text-xs text-neutral-500 uppercase tracking-widest mt-1">{adv.tone}</p>
              </div>
            </div>
            
            <div className="space-y-5 flex-grow">
              <div>
                <strong className="text-neutral-500 font-medium text-xs uppercase tracking-wider block mb-1.5 opacity-80">Perspective</strong>
                <p className="text-neutral-300 text-sm leading-relaxed">{adv.perspective}</p>
              </div>
              <div>
                <strong className="text-neutral-500 font-medium text-xs uppercase tracking-wider block mb-1.5 opacity-80">Argument</strong>
                <p className="text-neutral-300 text-sm leading-relaxed">{adv.argument}</p>
              </div>
              <div>
                <strong className="text-neutral-500 font-medium text-xs uppercase tracking-wider block mb-1.5 opacity-80">Recommendation</strong>
                <p className="text-white font-medium text-sm leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                  {adv.recommendation}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Premium Consensus Card */}
      <motion.div 
        variants={item}
        className="w-full relative z-10"
      >
        <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl opacity-30 blur-sm"></div>
        <div className="bg-neutral-950/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-10 relative overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.15)]">
           <div className="absolute top-0 w-full h-[1px] left-0 bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-50" />
           
           <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6">
             <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30 flex-shrink-0 shadow-inner">
               <Target className="w-8 h-8 text-purple-300" />
             </div>
             
             <div className="flex-col">
               <h3 className="text-2xl font-semibold text-white tracking-tight mb-2">Board Consensus</h3>
               <p className="text-neutral-300 text-base font-light leading-relaxed">
                 Strategically invaluable but operationally hazardous. The board recommends entering the space immediately but through a severely constrained scope. We must cut the feature set by half (Operator), validating market readiness on a shoestring budget (Skeptic) before committing the long-term capital required to build a permanent moat (Strategist).
               </p>
             </div>
           </div>
        </div>
      </motion.div>

    </motion.div>
  );
}
