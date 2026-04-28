"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import DecisionConsole from '@/components/DecisionConsole';
import type { IntelligenceSnapshot } from '@/components/IntelligenceRail';
import type { ConversationTurn, DecisionBlueprint, SolveRequest } from '@/lib/types';

import en from '@/locales/en/common.json';

type LocaleDictionary = Record<string, Record<string, string>>;

const initialLocales: LocaleDictionary = {
  auto: en,
  en,
  English: en,
};

const localeLoaders: Record<string, () => Promise<Record<string, string>>> = {
  Russian: () => import('@/locales/ru/common.json').then((m) => m.default),
  Arabic: () => import('@/locales/ar/common.json').then((m) => m.default),
  German: () => import('@/locales/de/common.json').then((m) => m.default),
  Spanish: () => import('@/locales/es/common.json').then((m) => m.default),
  Chinese: () => import('@/locales/zh/common.json').then((m) => m.default),
};

const RailSkeleton = () => (
  <aside className="hidden xl:flex flex-col w-72 space-y-4 ml-6">
    {[0, 1, 2].map((item) => (
      <div key={item} className="rounded-2xl border border-white/10 bg-[#0B1020]/50 p-6">
        <div className="h-3 w-24 rounded-full bg-white/10" />
        <div className="mt-6 h-16 rounded-xl bg-white/[0.04]" />
      </div>
    ))}
  </aside>
);

const ResultsSkeleton = () => (
  <div className="mt-8 w-full rounded-3xl border border-white/10 bg-[#0B1020]/70 p-6">
    <div className="h-3 w-32 rounded-full bg-white/10" />
    <div className="mt-5 grid grid-cols-3 gap-3">
      {[0, 1, 2].map((item) => (
        <div key={item} className="h-20 rounded-2xl bg-white/[0.04]" />
      ))}
    </div>
  </div>
);

const IntelligenceRail = dynamic(() => import('@/components/IntelligenceRail'), {
  loading: () => <RailSkeleton />,
});

const SettingsModal = dynamic(() => import('@/components/SettingsModal'), {
  loading: () => null,
});

const SimulationResults = dynamic(() => import('@/components/SimulationResults'), {
  loading: () => <ResultsSkeleton />,
});

const idleSnapshot: IntelligenceSnapshot = {
  status: 'idle',
  successProbability: 0,
  downsideRisk: 0,
  blackSwanExposure: 0,
  recommendedPath: 'Run a simulation to unlock the recommended path.',
  verdict: 'Awaiting decision input.',
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const normalizeClientLanguage = (value?: string) => {
  const language = typeof value === 'string' && value.trim() ? value.trim() : 'en';
  return language === 'auto' ? 'en' : language;
};

function buildIntelligenceSnapshot(
  blueprint: DecisionBlueprint | null,
  status: IntelligenceSnapshot['status'],
): IntelligenceSnapshot {
  if (!blueprint) {
    return status === 'running'
      ? {
          status,
          successProbability: 42,
          downsideRisk: 34,
          blackSwanExposure: 28,
          recommendedPath: 'Running scenario branches...',
          verdict: 'Simulation is testing the obvious move against harder futures.',
        }
      : idleSnapshot;
  }

  const score = clamp(Number(blueprint.score) || 68, 0, 100);
  const downsideRisk = clamp(100 - score + 12, 8, 82);
  const blackSwanExposure = clamp(
    Math.round((downsideRisk + (blueprint.paths?.bold?.cons?.length || 1) * 9) / 2),
    6,
    76,
  );
  const pathName =
    score >= 82
      ? 'Bold path with staged safeguards'
      : score >= 58
        ? 'Balanced path with explicit kill criteria'
        : 'Safe path until evidence improves';

  return {
    status,
    successProbability: score,
    downsideRisk,
    blackSwanExposure,
    recommendedPath: pathName,
    verdict: blueprint.recommendation || 'Proceed only after validating the core assumption.',
  };
}

export default function HomeExperience() {
  const [thread, setThread] = useState<ConversationTurn[]>([]);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [intelligence, setIntelligence] = useState<IntelligenceSnapshot>(idleSnapshot);
  const [locales, setLocales] = useState<LocaleDictionary>(initialLocales);
  const [memoryScore, setMemoryScore] = useState(0);
  const [networkScore, setNetworkScore] = useState(0);
  const [calibratedScore, setCalibratedScore] = useState<number | undefined>(undefined);
  const [calibrationOffset, setCalibrationOffset] = useState<number | undefined>(undefined);
  const [calibrationSampleSize, setCalibrationSampleSize] = useState<number | undefined>(undefined);
  const [decisionAccuracy, setDecisionAccuracy] = useState<number | undefined>(undefined);
  const [calibrationScore, setCalibrationScore] = useState<number | undefined>(undefined);
  const [latestDecisionId, setLatestDecisionId] = useState<string | undefined>(undefined);

  // Keep a stable ref to thread so handleSubmit always sees the latest value
  const threadRef = useRef<ConversationTurn[]>([]);
  useEffect(() => { threadRef.current = thread; }, [thread]);

  const latestBlueprint = useMemo(() => {
    for (let i = thread.length - 1; i >= 0; i--) {
      if (thread[i].role === 'assistant' && thread[i].blueprint) return thread[i].blueprint!;
    }
    return null;
  }, [thread]);

  const latestUserMessage = useMemo(() => {
    for (let i = thread.length - 1; i >= 0; i--) {
      if (thread[i].role === 'user') return thread[i].content;
    }
    return '';
  }, [thread]);

  const currentLang = latestBlueprint?.language || normalizeClientLanguage(language);
  const t = locales[currentLang as string] || locales.English;

  const ensureLocale = useCallback(
    async (next: string) => {
      const normalized = normalizeClientLanguage(next);
      if (locales[normalized]) return;
      const loader = localeLoaders[next];
      if (!loader) return;
      const dict = await loader();
      setLocales((prev) => (prev[normalized] ? prev : { ...prev, [normalized]: dict }));
    },
    [locales],
  );

  const handleLanguageChange = useCallback(
    async (next: string) => {
      const normalized = normalizeClientLanguage(next);
      await ensureLocale(normalized);
      setLanguage(normalized);
    },
    [ensureLocale],
  );

  const handleReset = useCallback(() => {
    setThread([]);
    setIntelligence(idleSnapshot);
    setMemoryScore(0);
    setNetworkScore(0);
    setCalibratedScore(undefined);
    setCalibrationOffset(undefined);
    setCalibrationSampleSize(undefined);
    setLatestDecisionId(undefined);
  }, []);

  const handleSubmit = useCallback(
    async (message: string, mode = 'Strategy') => {
      // Preload heavy chunks
      void import('@/components/SimulationResults');
      void import('@/components/DecisionBlueprint');
      void import('@/components/AgentEngine');

      const userTurn: ConversationTurn = {
        id: crypto.randomUUID(),
        role: 'user',
        content: message,
        timestamp: Date.now(),
      };

      setThread((prev) => [...prev, userTurn]);
      setLoading(true);
      setIntelligence(buildIntelligenceSnapshot(null, 'running'));

      try {
        const requestLanguage = normalizeClientLanguage(language);
        const body: SolveRequest = {
          problem: message,
          language: requestLanguage,
          mode: mode === 'Risk' || mode === 'Scenarios' || mode === 'Red Team' ? mode : 'Strategy',
          conversationHistory: threadRef.current.map((t) => ({
            role: t.role,
            content: t.role === 'assistant' ? (t.blueprint?.recommendation || t.content) : t.content,
          })),
        };

        const response = await fetch('/api/solve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
          body: JSON.stringify(body),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to generate solution');

        const blueprint = data?.result as DecisionBlueprint | undefined;
        if (!blueprint) throw new Error(data?.error || 'Decision engine returned no result.');
        blueprint.language = blueprint.language || 'English';
        if (typeof data.decisionId === 'string') setLatestDecisionId(data.decisionId);
        if (blueprint.language) void ensureLocale(blueprint.language);

        const assistantTurn: ConversationTurn = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: blueprint.recommendation || 'Decision analysis completed.',
          blueprint,
          timestamp: Date.now(),
        };

        setThread((prev) => [...prev, assistantTurn]);

        const snap = buildIntelligenceSnapshot(blueprint, 'complete');
        if (typeof data.memoryScore === 'number') {
          snap.memoryScore = data.memoryScore;
          setMemoryScore(data.memoryScore);
        }
        if (typeof data.networkScore === 'number') setNetworkScore(data.networkScore);
        if (typeof data.calibratedScore === 'number') setCalibratedScore(data.calibratedScore);
        if (typeof data.calibrationOffset === 'number') setCalibrationOffset(data.calibrationOffset);
        if (typeof data.calibrationSampleSize === 'number') setCalibrationSampleSize(data.calibrationSampleSize);
        if (typeof data.decisionAccuracy === 'number') setDecisionAccuracy(data.decisionAccuracy);
        if (typeof data.calibrationScore === 'number') setCalibrationScore(data.calibrationScore);
        setIntelligence(snap);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
        const errorTurn: ConversationTurn = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: message,
          isError: true,
          timestamp: Date.now(),
        };
        setThread((prev) => [...prev, errorTurn]);
        setIntelligence(idleSnapshot);
      } finally {
        setLoading(false);
      }
    },
    [language, ensureLocale],
  );

  const handleOpenSettings = useCallback(() => {
    void import('@/components/SettingsModal');
    setSettingsOpen(true);
  }, []);

  const resultKey = useMemo(
    () => `${latestUserMessage}-${latestBlueprint?.recommendation || ''}`,
    [latestBlueprint?.recommendation, latestUserMessage],
  );

  return (
    <>
      <Navbar onOpenSettings={handleOpenSettings} isLoading={loading} />

      <div className="w-full max-w-5xl flex flex-col items-center relative z-10">
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-3 mb-16 bg-[#0B1020]/70 border border-white/10 px-8 sm:px-12 py-3 rounded-full backdrop-blur-3xl shadow-[0_24px_80px_rgba(0,0,0,0.35),0_0_40px_rgba(168,85,247,0.06)]">
          {[
            { name: t.agent_strategist, color: 'text-emerald-500', glow: 'bg-emerald-500' },
            { name: t.agent_skeptic, color: 'text-rose-500', glow: 'bg-rose-500' },
            { name: t.agent_operator, color: 'text-blue-500', glow: 'bg-blue-500' },
          ].map((agent, i) => (
            <div key={i} className="flex items-center space-x-3 group">
              <div
                className={`w-1.5 h-1.5 rounded-full ${agent.glow} ${
                  loading
                    ? 'opacity-100 shadow-[0_0_10px_rgba(168,85,247,0.35)]'
                    : 'opacity-40 shadow-[0_0_10px_rgba(255,255,255,0.1)]'
                } transition-all group-hover:opacity-100 group-hover:scale-125`}
              />
              <span
                className={`text-[10px] font-black uppercase ${agent.color} ${
                  loading ? 'opacity-100' : 'opacity-75'
                } transition-all group-hover:opacity-100`}
              >
                {agent.name}
              </span>
            </div>
          ))}
        </div>

        <div className="w-full flex items-start">
          <DecisionConsole
            thread={thread}
            loading={loading}
            onSubmit={handleSubmit}
            onReset={handleReset}
          />
          <IntelligenceRail snapshot={intelligence} />
        </div>

        {latestBlueprint && (
          <SimulationResults
            key={resultKey}
            result={latestBlueprint}
            intelligence={intelligence}
            submittedProblem={latestUserMessage}
            initialShowBoard={false}
            t={t}
            memoryScore={memoryScore}
            networkScore={networkScore}
            calibratedScore={calibratedScore}
            calibrationOffset={calibrationOffset}
            calibrationSampleSize={calibrationSampleSize}
            decisionId={latestDecisionId}
            decisionAccuracy={decisionAccuracy}
            calibrationScore={calibrationScore}
          />
        )}
      </div>

      {settingsOpen && (
        <SettingsModal
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          currentLanguage={language}
          onLanguageChange={handleLanguageChange}
          locales={locales}
        />
      )}
    </>
  );
}
