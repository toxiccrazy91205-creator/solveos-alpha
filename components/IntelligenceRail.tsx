import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Target, Cpu, Zap, ShieldAlert, GitBranch, Users } from 'lucide-react';

export default function IntelligenceRail() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="hidden xl:flex flex-col w-72 space-y-4 ml-6"
    >
      {/* Probability Engine */}
      <div className="glass-module p-5 rounded-3xl border border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity">
           <Zap className="w-3 h-3 text-purple-400 animate-telemetry" />
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-3 h-3 text-purple-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Probability Engine</span>
          </div>
          <div className="text-[10px] font-mono text-emerald-500 animate-pulse">SYNCED</div>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Market Vectors', value: '98.2%', color: 'text-emerald-500' },
            { label: 'Risk Index', value: 'Low', color: 'text-emerald-500' },
            { label: 'Confidence', value: 'High', color: 'text-purple-400' }
          ].map((stat, i) => (
            <div key={i} className="flex justify-between items-center border-b border-white/[0.03] pb-2 last:border-0">
              <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider">{stat.label}</span>
              <span className={`text-[10px] font-mono font-black ${stat.color}`}>{stat.value}</span>
            </div>
          ))}
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-2">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '85%' }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-purple-600 to-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Risk Exposure */}
      <div className="glass-module p-5 rounded-3xl border border-white/5 bg-red-500/5">
        <div className="flex items-center space-x-2 mb-4">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Risk Exposure</span>
        </div>
        <div className="flex items-center justify-between">
           <div className="space-y-1">
              <p className="text-xl font-black text-white tracking-tighter">14.2%</p>
              <p className="text-[9px] text-rose-500 font-bold uppercase tracking-widest">Minimal Threat</p>
           </div>
           <div className="flex space-x-1">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`w-1.5 h-6 rounded-full ${i === 0 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-white/5'}`} />
              ))}
           </div>
        </div>
      </div>

      {/* Scenario Branches */}
      <div className="glass-module p-5 rounded-3xl border border-white/5">
        <div className="flex items-center space-x-2 mb-4">
          <GitBranch className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Scenario Branches</span>
        </div>
        <div className="space-y-2">
          {['Alpha Path', 'Beta Variance', 'Gamma Core'].map((path, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-[10px] font-bold text-neutral-500 uppercase">{path}</span>
              <div className="w-8 h-1 bg-white/10 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-500 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agent Consensus */}
      <div className="glass-module p-5 rounded-3xl border border-white/5">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Agent Consensus</span>
        </div>
        <div className="flex -space-x-2">
           {[0, 1, 2, 3, 4].map((i) => (
             <div key={i} className="w-7 h-7 rounded-full border-2 border-neutral-900 bg-neutral-800 flex items-center justify-center">
                <div className={`w-2 h-2 rounded-full ${i < 4 ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'}`} />
             </div>
           ))}
        </div>
        <p className="text-[9px] text-neutral-600 mt-3 font-bold uppercase tracking-widest">80% Dialectic Alignment</p>
      </div>

      {/* Decision Score */}
      <div className="glass-module p-5 rounded-3xl border border-white/10 bg-gradient-to-br from-purple-500/10 to-transparent relative overflow-hidden group">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(168,85,247,0.1),transparent)]" />
        <div className="flex items-center space-x-2 mb-4 relative z-10">
          <Target className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Decision Score</span>
        </div>
        <div className="flex items-end space-x-2 relative z-10">
          <span className="text-5xl font-black text-white tracking-tighter">87</span>
          <span className="text-base text-neutral-500 mb-2">/100</span>
        </div>
        <div className="mt-4 flex items-center space-x-2 relative z-10">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Optimal Threshold</span>
        </div>
      </div>

      {/* Telemetry Footer */}
      <div className="mt-auto px-5 pb-2">
        <div className="flex items-center justify-between opacity-30">
          <Cpu className="w-3.5 h-3.5 text-neutral-500" />
          <div className="flex space-x-1 items-end h-4">
            {[0.4, 0.7, 0.5, 0.9, 0.6].map((h, i) => (
              <motion.div 
                key={i} 
                animate={{ height: [`${h*100}%`, `${(1-h)*100}%`, `${h*100}%`] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                className="w-1 bg-neutral-500 rounded-full" 
              />
            ))}
          </div>
          <span className="text-[8px] font-mono text-neutral-500">RX-400 ACTIVE</span>
        </div>
      </div>
    </motion.div>
  );
}
