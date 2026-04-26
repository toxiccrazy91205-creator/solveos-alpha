import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, AlertTriangle, Settings, ShieldCheck, Activity, Share2 } from 'lucide-react';
import ShareCard from './ShareCard';

interface AgentEngineProps {
  problem: string;
  initialSolution: Record<string, unknown>;
}

const DIALECTIC_LOCALES: Record<string, any> = {
  English: {
    strategist: "Strategist",
    skeptic: "Skeptic",
    operator: "Operator",
    role_initial: "Initial Proposal",
    role_attack: "Assumptions Attack",
    role_revision: "Strategic Revision",
    role_execution: "Execution Blueprint",
    proposal_content: (rec: string) => `I propose we move immediately into the "${rec.substring(0, 50)}..." phase. The market window is open, and our first-mover advantage in the data layer is the only thing that matters right now. We should burn capital early to secure the moat.`,
    attack_content: "Wait. You're assuming market liquidity that doesn't exist yet. If we burn capital now as proposed, we have zero runway if customer acquisition cost (CAC) doubles—which it usually does in this sector. This plan is blind to the 40% churn risk I identified. It's a suicide mission without validated feedback.",
    revision_content: "Valid critique. I will revise: We scale in two phases. Phase 1 is a 'Thin-Layer' MVP to validate the CAC and churn assumptions the Skeptic raised. We cap the burn at 20% of the initial budget. If the unit economics hold after 45 days, only then do we commit to the full moat-building burn.",
    execution_content: "I've processed the revised strategy. We can execute this 'Thin-Layer' approach using 30% of our current engineering bandwidth by repurposing the existing legacy API. We launch in 14 days, focus purely on retention metrics, and freeze all other non-essential feature dev to protect the validation window.",
    verdict_title: "WAR ROOM VERDICT",
    verdict_content: "Entering the space immediately is strategic suicide. However, the revised \"Thin-Layer\" Execution Plan allows us to validate high-churn risk via a 14-day Sprint with zero new tech debt. We commit only after CAC proves sustainable.",
    recommended_decision: "Recommended Decision",
    share_snapshot: "Share Decision Snapshot",
    audit_log: "View Audit Log",
    processing: "Processing...",
    confidence: "Confidence",
    risk_factor: "Risk Factor",
    intensity: "Debate Intensity",
    phase: "Phase",
    risk_critical: "Critical",
    risk_calculated: "Calculated",
    risk_optimized: "Optimized"
  },
  Russian: {
    strategist: "Стратег",
    skeptic: "Скептик",
    operator: "Оператор",
    role_initial: "Базовый сценарий",
    role_attack: "Стресс-тест",
    role_revision: "Оптимизация",
    role_execution: "План действий",
    proposal_content: (rec: string) => `Я предлагаю немедленно перейти к этапу "${rec.substring(0, 50)}...". Рыночное окно открыто, и наше преимущество первого игрока в слое данных — единственное, что имеет значение сейчас. Мы должны инвестировать капитал на раннем этапе, чтобы создать защитный ров.`,
    attack_content: "Подождите. Вы предполагаете рыночную ликвидность, которой еще нет. Если мы потратим капитал сейчас, как предложено, у нас будет нулевой запас прочности, если стоимость привлечения клиента (CAC) удвоится — что обычно и происходит в этом секторе. Этот план игнорирует 40% риск оттока, который я выявил. Это самоубийственная миссия без подтвержденной обратной связи.",
    revision_content: "Справедливая критика. Я пересмотрю стратегию: мы масштабируемся в два этапа. Этап 1 — это MVP 'тонкого слоя' для проверки CAC и предположений об оттоке, которые поднял Скептик. Мы ограничиваем расходы на уровне 20% от первоначального бюджета. Если экономика юнита подтвердится через 45 дней, только тогда мы перейдем к полноценному этапу развития.",
    execution_content: "Я обработал пересмотренную стратегию. Мы можем реализовать этот подход 'тонкого слоя', используя 30% нашей текущей инженерной мощности путем переиспользования существующего API. Мы запускаемся через 14 дней, фокусируемся исключительно на метриках удержания и замораживаем разработку всех второстепенных функций для защиты окна валидации.",
    verdict_title: "ВЕРДИКТ СОВЕТА",
    verdict_content: "Немедленный вход в этот сегмент — стратегическое самоубийство. Однако пересмотренный план реализации 'Тонкого слоя' позволяет нам проверить риск высокого оттока через 14-дневный спринт без накопления нового технического долга. Мы принимаем окончательное решение только после подтверждения устойчивости CAC.",
    recommended_decision: "Рекомендуемый сценарий",
    share_snapshot: "Экспорт стратегии",
    audit_log: "Лог аудита",
    processing: "Анализ...",
    confidence: "Уверенность",
    risk_factor: "Риск",
    intensity: "Интенсивность",
    phase: "Фаза",
    risk_critical: "Критический",
    risk_calculated: "Взвешенный",
    risk_optimized: "Оптимизирован"
  }
};

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
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const lang = (initialSolution.language as string) || 'English';
  const lt = DIALECTIC_LOCALES[lang] || DIALECTIC_LOCALES.English;

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
      agent: lt.strategist,
      role: lt.role_initial,
      content: lt.proposal_content(String(initialSolution.recommendation)),
      icon: <Brain className="w-5 h-5 text-emerald-400" />,
      color: 'emerald'
    },
    {
      agent: lt.skeptic,
      role: lt.role_attack,
      content: lt.attack_content,
      icon: <AlertTriangle className="w-5 h-5 text-rose-500" />,
      color: 'rose'
    },
    {
      agent: lt.strategist,
      role: lt.role_revision,
      content: lt.revision_content,
      icon: <ShieldCheck className="w-5 h-5 text-purple-400" />,
      color: 'purple',
      isRevision: true
    },
    {
      agent: lt.operator,
      role: lt.role_execution,
      content: lt.execution_content,
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
      {/* Header with Terminal Metrics */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 space-y-6 md:space-y-0 px-2">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
            <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">{lt.war_room_title || 'War Room'}</h2>
          </div>
          <p className="text-neutral-600 font-bold uppercase tracking-[0.3em] text-[10px]">{lt.dialectic_subtitle || 'Simulated Multi-Agent Dialectic'}</p>
        </div>

        <div className="flex items-center space-x-10">
          {/* Confidence Score */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-neutral-600 uppercase tracking-widest mb-2 font-black">{lt.confidence}</span>
            <div className="text-3xl font-black text-white tracking-tighter">
              {showVerdict ? 87 : (step + 1) * 20}%
            </div>
          </div>

          {/* Risk Meter (Bloomberg Style) */}
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-neutral-600 uppercase tracking-widest mb-2 font-black">{lt.risk_factor}</span>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0.1 }}
                  animate={{ 
                    opacity: idx <= (step === 1 ? 7 : step === 2 ? 5 : 3) ? 1 : 0.1,
                    backgroundColor: idx <= 3 ? '#10b981' : idx <= 5 ? '#f59e0b' : '#ef4444'
                  }}
                  className="w-1.5 h-6 rounded-full"
                />
              ))}
            </div>
            <span className="text-[9px] font-black mt-1 text-neutral-500 uppercase tracking-widest">
              {step === 1 ? lt.risk_critical : step === 2 ? lt.risk_calculated : lt.risk_optimized}
            </span>
          </div>

          {showVerdict && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full flex items-center space-x-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{lt.recommended_decision}</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* The Debate: Apple Notes Structured List */}
      <div className="space-y-4 relative z-10">
        <AnimatePresence>
          {debateTurns.map((turn, idx) => (
            idx <= step && (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className={`relative glass-note rounded-3xl p-8 transition-all ${idx === step && !showVerdict ? 'border-purple-500/30 ring-1 ring-purple-500/20' : 'border-white/5'}`}
              >
                <div className="flex items-start space-x-6">
                  <div className={`p-3 rounded-2xl ${colorMap[turn.color].bg} border ${colorMap[turn.color].border} shrink-0`}>
                    {turn.icon}
                  </div>
                  
                  <div className="flex-grow space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-xs font-black text-white uppercase tracking-widest">{turn.agent}</span>
                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${colorMap[turn.color].bg} ${colorMap[turn.color].text} border ${colorMap[turn.color].border}`}>
                          {turn.role}
                        </span>
                      </div>
                      {idx === step && !showVerdict && (
                        <div className="flex items-center space-x-2">
                           <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping" />
                           <span className="text-[9px] text-purple-400 font-black uppercase tracking-widest">{lt.processing}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-neutral-300 text-base leading-relaxed font-medium antialiased">
                      {turn.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          ))}
        </AnimatePresence>
      </div>

      {/* Final Verdict: The Note Conclusion */}
      {showVerdict && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-20 pt-12"
        >
          <div className="glass-note rounded-[40px] p-10 relative overflow-hidden border-emerald-500/20 shadow-[0_40px_120px_rgba(0,0,0,0.6)]">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
             
             <div className="flex flex-col md:flex-row items-center md:items-start space-y-8 md:space-y-0 md:space-x-10">
                <div className="w-24 h-24 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-12 h-12 text-emerald-400" />
                </div>

                <div className="flex-grow space-y-6 text-center md:text-left">
                  <div>
                    <h3 className="text-4xl font-black text-white tracking-tighter mb-2 uppercase italic">{lt.verdict_title}</h3>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                      <span className="bg-white/[0.03] text-neutral-400 border border-white/10 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Validated Path</span>
                      <span className="bg-white/[0.03] text-neutral-400 border border-white/10 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Iterative Risk-Cap</span>
                    </div>
                  </div>

                  <p className="text-neutral-200 text-xl font-light leading-relaxed max-w-2xl mx-auto md:mx-0">
                    {lt.verdict_content}
                  </p>
                  
                  <div className="pt-6 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                    <button 
                      onClick={() => setIsShareModalOpen(true)}
                      className="px-10 py-4 bg-white text-black font-black rounded-full hover:bg-neutral-200 transition-all scale-100 hover:scale-[1.02] active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.1)] flex items-center space-x-3"
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="text-sm uppercase tracking-widest">{lt.share_snapshot}</span>
                    </button>
                    <button className="px-10 py-4 bg-transparent border border-white/10 text-neutral-400 font-bold rounded-full hover:bg-white/[0.03] transition-all text-sm uppercase tracking-widest">
                      {lt.audit_log}
                    </button>
                  </div>
                </div>
             </div>
          </div>
        </motion.div>
      )}

      {/* Progress Footer: Minimal Note Progress */}
      {!showVerdict && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-full max-w-sm px-6 z-50">
          <div className="glass-note rounded-full px-6 py-3 border-white/10 shadow-2xl flex items-center justify-between">
            <span className="text-[9px] text-neutral-500 font-black uppercase tracking-widest">{lt.phase} {step + 1} / 4</span>
            <div className="flex-grow mx-6 h-[2px] bg-white/5 rounded-full overflow-hidden">
               <motion.div 
                 className="h-full bg-white"
                 initial={{ width: '0%' }}
                 animate={{ width: `${(step + 1) * 25}%` }}
               />
            </div>
            <Activity className="w-3 h-3 text-white animate-pulse" />
          </div>
        </div>
      )}
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
      {/* Share Modal */}
      <ShareCard 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        problem={problem}
        recommendation="Initiate 'Thin-Layer' Pivot with 14-day validation Sprint."
        confidence={87}
      />
    </div>
  );
}
