"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Crown, AlertTriangle } from 'lucide-react';
import DecisionBlueprint from '@/components/DecisionBlueprint';
import AgentEngine from '@/components/AgentEngine';
import LanguageSelector from '@/components/LanguageSelector';

const LOADING_MESSAGES = [
  "Analyzing decision...",
  "Running scenario simulations...",
  "Consulting frameworks...",
  "Finalizing blueprint..."
];

export default function Home() {
  const [problem, setProblem] = useState('');
  const [language, setLanguage] = useState('auto');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showBoard, setShowBoard] = useState(false);

  useEffect(() => {
    if (!loading) {
      const reset = setTimeout(() => setLoadingStep(0), 0);
      return () => clearTimeout(reset);
    }
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [loading]);

  const handleSolve = async (overrideProblem?: unknown, autoBoard: boolean = false) => {
    const currentProblem = typeof overrideProblem === 'string' ? overrideProblem : problem;

    if (currentProblem.trim().length < 10) {
      setError('Please provide a bit more detail (at least 10 characters).');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setShowBoard(false);

    try {
      const response = await fetch('/api/solve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ problem: currentProblem, language }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate solution');
      }

      setResult(data.result as Record<string, unknown>);
      if (autoBoard) {
        setShowBoard(true);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white selection:bg-neutral-800 flex flex-col items-center py-20 px-6 font-sans">
      <div className="w-full max-w-3xl flex flex-col items-center">

        {/* Header */}
        <div className="text-center mb-16 mt-8 relative z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-500/10 blur-[100px] pointer-events-none rounded-full" />
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center space-x-2 mb-6 bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)] px-4 py-1.5 rounded-full"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-xs sm:text-sm text-neutral-300 font-medium tracking-wide">Alpha 0.1</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-5xl sm:text-6xl lg:text-8xl font-black mb-4 sm:mb-6 tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white via-neutral-200 to-neutral-600 px-4"
          >
            SolveOS
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-lg sm:text-xl lg:text-3xl text-neutral-400 font-light tracking-tight mb-4 lg:mb-6 px-4"
          >
            ChatGPT is for questions. <span className="text-white font-medium">SolveOS is for decisions.</span>
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xs sm:text-sm lg:text-base text-neutral-500 font-medium tracking-widest uppercase px-4"
          >
            Simulate outcomes. Reduce risk. Decide with clarity.
          </motion.p>
        </div>

        {/* Input Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full relative group z-10 mt-4 sm:mt-0"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-500" />
          <div className="absolute -inset-[1px] bg-gradient-to-b from-white/10 to-transparent rounded-3xl z-0" />
          <div className="relative w-full bg-neutral-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 sm:p-8 shadow-2xl z-10">
            <div className="mb-5 flex items-center space-x-2 px-1">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-purple-400">
                Decision Simulator
              </span>
            </div>
            
            <LanguageSelector currentLanguage={language} onLanguageChange={setLanguage} />

            <textarea
              value={problem}
              onChange={(e) => {
                setProblem(e.target.value);
                if (error) setError(null);
              }}
              placeholder="What major strategic decision are you facing?"
              className="w-full h-32 sm:h-48 bg-transparent text-lg sm:text-xl lg:text-3xl text-white placeholder-neutral-600 focus:outline-none resize-none font-light leading-relaxed px-1"
            />

            <div className="mt-6 flex flex-col space-y-3">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-1">
                Quick Scenarios (Full Simulation)
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { text: "Quit job & start AI startup?", icon: "🚀" },
                  { text: "Move abroad for opportunity?", icon: "🌍" },
                  { text: "Invest savings into business?", icon: "💰" }
                ].map((sample, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setProblem(sample.text);
                      handleSolve(sample.text, true);
                    }}
                    className="flex items-center space-x-2 text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white px-5 py-3 rounded-2xl transition-all duration-300 font-medium text-left hover:scale-[1.02] hover:border-purple-500/30 group/btn"
                  >
                    <span>{sample.icon}</span>
                    <span>{sample.text}</span>
                    <Sparkles className="w-3 h-3 text-purple-400 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row justify-between items-center sm:items-end space-y-6 sm:space-y-0 pt-6 border-t border-white/5">
              <div className="text-neutral-500 text-sm font-medium tracking-wide">
                {problem.length} / 5000 chars
              </div>

              <button
                onClick={handleSolve}
                disabled={loading || problem.trim().length === 0}
                className="w-full sm:w-auto px-10 py-4 sm:py-5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white disabled:from-neutral-800 disabled:via-neutral-800 disabled:to-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed rounded-2xl font-bold text-lg sm:text-xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-[0_0_40px_rgba(168,85,247,0.4)] hover:shadow-[0_0_80px_rgba(168,85,247,0.6)] disabled:shadow-none hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 group"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={loadingStep}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2 }}
                        className="w-48 text-left inline-block"
                      >
                        {LOADING_MESSAGES[loadingStep]}
                      </motion.span>
                    </AnimatePresence>
                  </>
                ) : (
                  <>
                    <span className="text-2xl group-hover:-translate-y-1 transition-transform duration-300">🚀</span>
                    <span>Launch Simulation</span>
                  </>
                )}
              </button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 bg-red-950/40 backdrop-blur-md border border-red-500/20 text-red-200 rounded-2xl text-sm flex items-start space-x-3 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-medium">{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Result Area */}
        {result && (
          <div className="w-full flex flex-col items-center">
            <DecisionBlueprint data={result} />

            {!showBoard ? (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => {
                  setShowBoard(true);
                }}
                className="mt-16 px-10 py-4 bg-neutral-900/80 backdrop-blur-md hover:bg-neutral-800 border border-purple-500/30 text-white rounded-2xl font-medium text-base transition-all duration-300 flex items-center justify-center space-x-3 shadow-[0_0_30px_rgba(168,85,247,0.15)] hover:shadow-[0_0_50px_rgba(168,85,247,0.3)] group"
              >
                <Crown className="w-5 h-5 text-purple-400 group-hover:scale-110 group-hover:-rotate-12 transition-transform" />
                <span>Run AI Board</span>
                <span className="bg-purple-500/20 text-purple-300 text-[10px] uppercase px-2 py-0.5 rounded-full ml-2 border border-purple-500/20">Premium</span>
              </motion.button>
            ) : (
              <AgentEngine problem={problem} initialSolution={result!} />
            )}
          </div>
        )}

      </div>
    </main>
  );
}
