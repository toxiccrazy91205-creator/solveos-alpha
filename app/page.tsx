import SolveOSSymbol from '@/components/SolveOSSymbol';
import DeferredHomeExperience from '@/components/DeferredHomeExperience';

const solveLetters = 'SOLVE'.split('');
const osLetters = 'OS'.split('');

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[#F8FAFF] selection:bg-purple-500/30 flex flex-col items-center py-6 sm:py-10 px-6 font-sans bg-terminal-notes overflow-x-hidden relative">
      <div className="absolute inset-0 neural-grid opacity-20 pointer-events-none" />
      <div className="absolute inset-0 neural-constellation opacity-30 pointer-events-none" />

      <div className="w-full max-w-5xl flex flex-col items-center relative z-10">
        <div className="text-center mb-16 mt-20 w-full">
          <div className="inline-flex items-center space-x-2 mb-10 bg-[#0B1020]/70 border border-white/10 px-4 py-1.5 rounded-full shadow-[0_0_32px_rgba(168,85,247,0.08)]">
            <span className="text-[10px] text-slate-300 font-bold uppercase">ALPHA DECISION OS</span>
          </div>

          <h1
            aria-label="SolveOS"
            className="flex items-center justify-center gap-3 sm:gap-5 lg:gap-7 text-6xl sm:text-8xl lg:text-[8rem] font-semibold text-[#F8FAFF] brand-wordmark mb-5"
          >
            <span className="brand-wordmark-side" aria-hidden="true">
              {solveLetters.map((letter, index) => (
                <span className="brand-wordmark-letter" key={`${letter}-${index}`}>{letter}</span>
              ))}
            </span>
            <SolveOSSymbol className="logo-core-mark" />
            <span className="brand-wordmark-side brand-wordmark-side--tight" aria-hidden="true">
              {osLetters.map((letter, index) => (
                <span className="brand-wordmark-letter" key={`${letter}-${index}`}>{letter}</span>
              ))}
            </span>
          </h1>

          <p className="text-xl sm:text-3xl text-[#F8FAFF] font-semibold mb-3">
            The Operating System for Strategic Decisions
          </p>

          <div className="flex flex-col items-center mt-6">
            <div className="w-16 h-[1px] bg-purple-400/30 mb-5 shadow-[0_0_18px_rgba(168,85,247,0.5)]" />
            <p className="text-sm sm:text-base text-slate-300 font-medium">
              Simulate outcomes. Expose risk. Decide with conviction.
            </p>
          </div>
        </div>
      </div>

      <DeferredHomeExperience />
    </main>
  );
}
