import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, AlertTriangle, Settings, ShieldCheck, Activity } from 'lucide-react';

interface AgentEngineProps {
  problem: string;
  initialSolution: Record<string, unknown>;
}

interface DebateTurn {
  agent: string;
  role: string;
  content: string;
  icon: React.ReactNode;
  color: string;
  isRevision?: boolean;
}

export default function AgentEngine({ problem, initialSolution }: AgentEngineProps) {
  const [step, setStep] = useState(0);
  const [showVerdict, setShowVerdict] = useState(false);

  // Simulation timeline
  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 3000), // Skeptic starts
      setTimeout(() => setStep(2), 7000), // Strategist revises
      setTimeout(() => setStep(3), 11000), // Operator concludes
      setTimeout(() => {
        setTimeout(() => setShowVerdict(true), 1500);
      }, 15000),
    ];

    return () => timers.forEach(clearTimeout);
  }, [problem]);

  const debateTurns: DebateTurn[] = [
    {
      agent: 'Strategist',
      role: 'Initial Proposal',
      content: `I propose we move immediately into the "${String(initialSolution.recommendation).substring(0, 50)}..." phase. The market window is open, and our first-mover advantage in the data layer is the only thing that matters right now. We should burn capital early to secure the moat.`,
      icon: <Brain className="w-5 h-5 text-emerald-400" />,
      color: 'emerald'
    },
    {
      agent: 'Skeptic',
      role: 'Assumptions Attack',
      content: "Wait. You're assuming market liquidity that doesn't exist yet. If we burn capital now as proposed, we have zero runway if customer acquisition cost (CAC) doubles—which it usually does in this sector. This plan is blind to the 40% churn risk I identified. It's a suicide mission without validated feedback.",
      icon: <AlertTriangle className="w-5 h-5 text-rose-500" />,
      color: 'rose'
    },
    {
      agent: 'Strategist',
      role: 'Strategic Revision',
      content: "Valid critique. I will revise: We scale in two phases. Phase 1 is a 'Thin-Layer' MVP to validate the CAC and churn assumptions the Skeptic raised. We cap the burn at 20% of the initial budget. If the unit economics hold after 45 days, only then do we commit to the full moat-building burn.",
      icon: <ShieldCheck className="w-5 h-5 text-purple-400" />,
      color: 'purple',
      isRevision: true
    },
    {
      agent: 'Operator',
      role: 'Execution Blueprint',
      content: "I've processed the revised strategy. We can execute this 'Thin-Layer' approach using 30% of our current engineering bandwidth by repurposing the existing legacy API. We launch in 14 days, focus purely on retention metrics, and freeze all other non-essential feature dev to protect the validation window.",
      icon: <Settings className="w-5 h-5 text-blue-400" />,
      color: 'blue'
    }
  ];

  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  };

  return (
    <div className="w-full max-w-5xl mt-12 flex flex-col space-y-10 relative pb-32">
      {/* Background glow enhancement */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-purple-500/5 blur-[150px] pointer-events-none rounded-full" />

      {/* Header: War Room Metrics */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-8 relative z-20">
        <div className="space-y-1 mb-6 md:mb-0">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-4xl font-black tracking-tighter text-white">Decision War Room</h2>
          </div>
          <p className="text-neutral-500 font-medium uppercase tracking-widest text-xs">Simulated Multi-Agent Dialectic</p>
        </div>

        <div className="flex items-center space-x-8">
          {/* Confidence Score */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest mb-2">Confidence</span>
            <div className="relative flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-neutral-800" />
                <motion.circle 
                  cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" 
                  strokeDasharray={176}
                  initial={{ strokeDashoffset: 176 }}
                  animate={{ strokeDashoffset: 176 - (176 * (showVerdict ? 87 : (step + 1) * 20)) / 100 }}
                  className="text-purple-500"
                />
              </svg>
              <span className="absolute text-sm font-bold text-white">{showVerdict ? 87 : (step + 1) * 20}%</span>
            </div>
          </div>

          {/* Risk Meter */}
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest mb-2">Risk Factor</span>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0.3 }}
                  animate={{ 
                    opacity: idx <= (step === 1 ? 4 : step === 2 ? 3 : 2) ? 1 : 0.3,
                    backgroundColor: idx <= 2 ? '#10b981' : idx <= 3 ? '#f59e0b' : '#ef4444'
                  }}
                  className="w-4 h-8 rounded-sm"
                />
              ))}
            </div>
            <span className="text-[10px] font-bold mt-1 text-neutral-400 capitalize">
              {step === 1 ? 'Critical' : step === 2 ? 'Calculated' : 'Optimized'}
            </span>
          </div>

          {showVerdict && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              className="bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-xl flex items-center space-x-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-tight">Recommended Decision</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* The Debate Timeline */}
      <div className="grid grid-cols-1 gap-4 relative z-10">
        <AnimatePresence>
          {debateTurns.map((turn, idx) => (
            idx <= step && (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
                className={`relative group bg-neutral-900/40 backdrop-blur-xl border ${idx === step && !showVerdict ? 'border-purple-500/40' : 'border-white/5'} rounded-2xl p-6 hover:bg-neutral-900/60 transition-all shadow-xl`}
              >
                {/* Connection line for timeline feel */}
                {idx < step && (
                  <div className="absolute -bottom-4 left-10 w-[1px] h-4 bg-white/10" />
                )}

                <div className="flex items-start space-x-4">
                  <div className={`p-2.5 rounded-xl ${colorMap[turn.color].bg} border ${colorMap[turn.color].border} shadow-inner shrink-0`}>
                    {turn.icon}
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-bold text-white tracking-tight">{turn.agent}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${colorMap[turn.color].bg} ${colorMap[turn.color].text} border ${colorMap[turn.color].border}`}>
                          {turn.role}
                        </span>
                      </div>
                      {idx === step && !showVerdict && (
                        <div className="flex items-center space-x-2">
                           <Activity className="w-3 h-3 text-purple-400 animate-pulse" />
                           <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">Processing...</span>
                        </div>
                      )}
                    </div>
                    <p className="text-neutral-300 text-sm leading-relaxed antialiased font-light max-w-3xl">
                      {turn.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          ))}
        </AnimatePresence>
      </div>

      {/* Final Verdict / Consensus */}
      {showVerdict && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-20 pt-8"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-purple-500/20 to-blue-500/20 rounded-3xl blur-xl opacity-50" />
          <div className="bg-neutral-950/90 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 md:p-10 relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 w-full h-[1px] left-0 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-40" />
             
             <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 flex items-center justify-center shadow-inner relative group">
                  <div className="absolute inset-0 bg-emerald-500/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <ShieldCheck className="w-10 h-10 text-emerald-400 relative z-10" />
                </div>

                <div className="flex-grow space-y-4 text-center md:text-left">
                  <div>
                    <h3 className="text-3xl font-black text-white tracking-tighter mb-1 uppercase italic">WAR ROOM VERDICT</h3>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Validated Path</span>
                      <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Iterative Risk-Cap</span>
                    </div>
                  </div>

                  <p className="text-neutral-200 text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto md:mx-0">
                    Entering the space immediately is strategic suicide. However, the revised <span className="text-white font-medium">&ldquo;Thin-Layer&rdquo; Execution Plan</span> allows us to validate high-churn risk via a 14-day Sprint with zero new tech debt. We commit only after CAC proves sustainable.
                  </p>
                  
                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                    <button className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-neutral-200 transition-all scale-100 hover:scale-[1.02] active:scale-95 shadow-xl">
                      Export Execution Blueprint
                    </button>
                    <button className="px-8 py-3 bg-neutral-900 border border-white/10 text-white font-medium rounded-xl hover:bg-neutral-800 transition-all shadow-xl">
                      View Audit Log
                    </button>
                  </div>
                </div>
             </div>
          </div>
        </motion.div>
      )}

      {/* Progress Footer */}
      {!showVerdict && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-50">
          <div className="bg-neutral-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Debate Intensity</span>
              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">Phase {step + 1} / 4</span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
               <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(step + 1) * 25}%` }}
                  className="h-full bg-gradient-to-r from-emerald-500 via-purple-500 to-blue-500"
               />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
