"use client";

import { useCallback, useEffect, useRef, useState, memo } from 'react';
import {
  BarChart2,
  TrendingUp,
  Zap,
  Database,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Activity,
  Clock,
  ChevronRight,
} from 'lucide-react';
import type { NetworkIntelligence, DomainBenchmark, CalibrationBucket, TrendPoint } from '@/lib/types';

// ─── Pending Review Types ─────────────────────────────────────────────────────

interface DueReview {
  id: string;
  problem: string;
  timestamp: string;
  blueprintScore: number;
  pendingReview: {
    reviewType: '7day' | '30day';
    scheduledFor: string;
    createdAt: string;
  };
}

// ─── Pending Reviews Panel ────────────────────────────────────────────────────

type ReviewOutcome = 'succeeded' | 'partial' | 'failed';

const REVIEW_OUTCOMES: { id: ReviewOutcome; label: string; scoreAccuracy: number; color: string }[] = [
  { id: 'succeeded', label: 'Succeeded', scoreAccuracy: 85, color: 'text-emerald-300' },
  { id: 'partial', label: 'Partial', scoreAccuracy: 50, color: 'text-amber-300' },
  { id: 'failed', label: 'Failed', scoreAccuracy: 15, color: 'text-rose-300' },
];

function PendingReviewCard({
  review,
  onLogged,
}: {
  review: DueReview;
  onLogged: (id: string) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const log = async (outcome: ReviewOutcome) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/outcomes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decisionId: review.id,
          outcome: {
            actualOutcome: outcome,
            scoreAccuracy: REVIEW_OUTCOMES.find(o => o.id === outcome)!.scoreAccuracy,
            lessons: [],
            recommendations: [],
          },
        }),
      });
      if (!res.ok) throw new Error('Failed to log review outcome');
      setDone(true);
      setTimeout(() => onLogged(review.id), 600);
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div className={`rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-opacity ${done ? 'opacity-40' : ''}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2 flex-1">{review.problem}</p>
        <span className="text-[8px] font-mono text-slate-600 whitespace-nowrap flex-shrink-0">
          Score {review.blueprintScore}
        </span>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {REVIEW_OUTCOMES.map(o => (
          <button
            key={o.id}
            disabled={submitting || done}
            onClick={() => void log(o.id)}
            className={`px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-[8px] font-black uppercase tracking-widest ${o.color} disabled:opacity-40 transition-all`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const PendingReviewsPanel = memo(function PendingReviewsPanel() {
  const [reviews, setReviews] = useState<DueReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/reviews')
      .then(r => r.json())
      .then(data => { if (!cancelled) { setReviews(data.reviews || []); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleLogged = useCallback((id: string) => {
    setReviews(prev => prev.filter(r => r.id !== id));
  }, []);

  if (loading || reviews.length === 0) return null;

  return (
    <div className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.04] p-6 shadow-[0_0_24px_rgba(245,158,11,0.06)]">
      <button
        className="w-full flex items-center gap-3 mb-1"
        onClick={() => setExpanded(v => !v)}
      >
        <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
        <span className="text-[9px] font-black uppercase text-slate-300 flex-1 text-left">
          Pending Reviews
        </span>
        <span className="text-[9px] font-black uppercase text-amber-400 bg-amber-500/15 border border-amber-500/25 px-2 py-0.5 rounded-full">
          {reviews.length} due
        </span>
        <ChevronRight
          className={`w-3.5 h-3.5 text-slate-500 transition-transform ${expanded ? 'rotate-90' : ''}`}
        />
      </button>
      <p className="text-[9px] text-slate-500 mb-4 leading-relaxed">
        These decisions reached their scheduled review date. Log outcomes to feed the calibration flywheel.
      </p>

      {expanded && (
        <div className="space-y-3">
          {reviews.map(r => (
            <PendingReviewCard key={r.id} review={r} onLogged={handleLogged} />
          ))}
        </div>
      )}
    </div>
  );
});

// ─── Colour Helpers ───────────────────────────────────────────────────────────

function offsetColor(offset: number): string {
  if (offset < -10) return 'text-rose-400';
  if (offset < -3) return 'text-amber-400';
  if (offset > 10) return 'text-emerald-400';
  if (offset > 3) return 'text-blue-400';
  return 'text-slate-400';
}

function offsetBg(offset: number): string {
  if (offset < -10) return 'bg-rose-500/20';
  if (offset < -3) return 'bg-amber-500/15';
  if (offset > 10) return 'bg-emerald-500/20';
  if (offset > 3) return 'bg-blue-500/15';
  return 'bg-white/5';
}

const DOMAIN_COLORS: Record<string, string> = {
  business: '#10b981',
  career: '#3b82f6',
  financial: '#f59e0b',
  strategic: '#a855f7',
  general: '#64748b',
};

function domainColor(domain: string) {
  return DOMAIN_COLORS[domain] || DOMAIN_COLORS.general;
}

// ─── SVG Line Chart ───────────────────────────────────────────────────────────

function LineChart({
  data,
  color = '#a855f7',
  height = 56,
  showLabels = false,
}: {
  data: TrendPoint[];
  color?: string;
  height?: number;
  showLabels?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(400);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(e => setWidth(e[0].contentRect.width || 400));
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const values = data.map(d => d.value);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const PAD = { t: 6, r: 4, b: showLabels ? 20 : 6, l: 4 };
  const W = width - PAD.l - PAD.r;
  const H = height - PAD.t - PAD.b;

  if (data.length < 2) {
    return (
      <div ref={containerRef} className="text-[9px] text-slate-600 uppercase font-bold py-4 text-center">
        Not enough data
      </div>
    );
  }

  const pts = data.map((d, i) => {
    const x = PAD.l + (i / (data.length - 1)) * W;
    const y = PAD.t + (1 - (d.value - min) / range) * H;
    return { x, y, value: d.value, label: d.label };
  });

  const polyline = pts.map(p => `${p.x},${p.y}`).join(' ');
  // Area under curve
  const area = `M${pts[0].x},${PAD.t + H} ` +
    pts.map(p => `L${p.x},${p.y}`).join(' ') +
    ` L${pts[pts.length - 1].x},${PAD.t + H} Z`;

  return (
    <div ref={containerRef} className="w-full">
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#grad-${color.replace('#', '')})`} />
        <polyline points={polyline} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={2} fill={color} />
        ))}
        {showLabels && pts.map((p, i) => (
          i % Math.ceil(pts.length / 6) === 0 && (
            <text key={i} x={p.x} y={height - 4} textAnchor="middle" fontSize={7} fill="#64748b" fontFamily="monospace">
              {p.label}
            </text>
          )
        ))}
      </svg>
    </div>
  );
}

// ─── SVG Bar Chart (vertical) ─────────────────────────────────────────────────

function BarChart({
  data,
  color = '#a855f7',
  height = 80,
}: {
  data: TrendPoint[];
  color?: string;
  height?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(400);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(e => setWidth(e[0].contentRect.width || 400));
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const max = Math.max(...data.map(d => d.value), 1);
  const PAD = { t: 4, r: 4, b: 18, l: 4 };
  const W = width - PAD.l - PAD.r;
  const H = height - PAD.t - PAD.b;
  const barW = Math.max(2, W / data.length - 2);

  return (
    <div ref={containerRef} className="w-full">
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {data.map((d, i) => {
          const x = PAD.l + (i / data.length) * W + (W / data.length - barW) / 2;
          const barH = (d.value / max) * H;
          const y = PAD.t + H - barH;
          return (
            <g key={i}>
              <rect
                x={x} y={y} width={barW} height={Math.max(1, barH)}
                fill={d.value > 0 ? color : 'rgba(255,255,255,0.05)'}
                fillOpacity={d.value > 0 ? 0.7 : 1}
                rx={1}
              />
              {i % Math.ceil(data.length / 6) === 0 && (
                <text x={x + barW / 2} y={height - 4} textAnchor="middle" fontSize={7} fill="#475569" fontFamily="monospace">
                  {d.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Calibration Matrix ───────────────────────────────────────────────────────

const CalibrationMatrix = memo(function CalibrationMatrix({ buckets }: { buckets: CalibrationBucket[] }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
      <div className="grid grid-cols-5 border-b border-white/10 bg-white/[0.02]">
        {['Score Range', 'Samples', 'Avg Predicted', 'Avg Actual', 'Offset'].map(h => (
          <div key={h} className="px-3 py-2.5 text-[8px] font-black uppercase text-slate-500">
            {h}
          </div>
        ))}
      </div>
      {buckets.map((b, i) => {
        const hasData = b.sampleCount > 0 && b.avgActual >= 0;
        const offsetStr = hasData
          ? `${b.offset > 0 ? '+' : ''}${b.offset}`
          : '—';

        return (
          <div
            key={i}
            className={`grid grid-cols-5 border-b border-white/5 last:border-b-0 transition-colors ${hasData ? offsetBg(b.offset) : ''}`}
          >
            <div className="px-3 py-3 text-[10px] font-mono text-slate-300">
              {b.scoreRange[0]}–{b.scoreRange[1]}
            </div>
            <div className="px-3 py-3 text-[10px] font-mono text-slate-400">
              {b.sampleCount}
            </div>
            <div className="px-3 py-3 text-[10px] font-mono text-slate-300">
              {hasData ? b.avgPredicted : '—'}
            </div>
            <div className="px-3 py-3 text-[10px] font-mono text-slate-300">
              {hasData ? b.avgActual : '—'}
            </div>
            <div className={`px-3 py-3 text-[10px] font-black font-mono ${hasData ? offsetColor(b.offset) : 'text-slate-600'}`}>
              {offsetStr}
            </div>
          </div>
        );
      })}
    </div>
  );
});

// ─── Domain Benchmark Bars ────────────────────────────────────────────────────

const DomainBenchmarkRow = memo(function DomainBenchmarkRow({
  benchmark,
}: {
  benchmark: DomainBenchmark;
}) {
  const color = domainColor(benchmark.domain);
  const hasOutcome = benchmark.avgOutcomeAccuracy >= 0;

  return (
    <div className="space-y-2 py-3 border-b border-white/5 last:border-b-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-xs font-bold text-[#F8FAFF] capitalize">{benchmark.domain}</span>
          <span className="text-[8px] text-slate-500 font-mono uppercase">
            {benchmark.totalDecisions} decision{benchmark.totalDecisions !== 1 ? 's' : ''}
          </span>
        </div>
        {hasOutcome && (
          <span
            className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${offsetBg(benchmark.calibrationOffset)} ${offsetColor(benchmark.calibrationOffset)}`}
          >
            {benchmark.calibrationOffset > 0 ? '+' : ''}{benchmark.calibrationOffset} calibration
          </span>
        )}
      </div>

      {/* Confidence bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[8px] font-mono text-slate-500 uppercase">
          <span>Avg Confidence</span>
          <span className="text-slate-300">{benchmark.avgConfidence}</span>
        </div>
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${benchmark.avgConfidence}%`, backgroundColor: color, opacity: 0.7 }}
          />
        </div>
      </div>

      {/* Accuracy bar (if data) */}
      {hasOutcome && (
        <div className="space-y-1">
          <div className="flex justify-between text-[8px] font-mono text-slate-500 uppercase">
            <span>Avg Outcome Accuracy</span>
            <span className="text-slate-300">{benchmark.avgOutcomeAccuracy}%</span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${benchmark.avgOutcomeAccuracy}%`, backgroundColor: '#10b981', opacity: 0.8 }}
            />
          </div>
        </div>
      )}
    </div>
  );
});

// ─── Network Score Gauge ──────────────────────────────────────────────────────

function NetworkScoreGauge({ score }: { score: number }) {
  const label =
    score === 0 ? 'No Data'
    : score < 15 ? 'Seed Stage'
    : score < 30 ? 'Early Signal'
    : score < 50 ? 'Growing'
    : score < 70 ? 'Established'
    : score < 85 ? 'Intelligence'
    : 'Compounding';

  const color =
    score < 15 ? '#64748b'
    : score < 30 ? '#f59e0b'
    : score < 50 ? '#3b82f6'
    : score < 70 ? '#a855f7'
    : '#10b981';

  return (
    <div className="flex items-center gap-5">
      <div>
        <div
          className="text-5xl font-black font-mono leading-none"
          style={{ color }}
        >
          {score}
        </div>
        <div className="text-[8px] font-black uppercase text-slate-400 mt-1">{label}</div>
      </div>
      <div className="flex-1 space-y-2">
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${score}%`, backgroundColor: color }}
          />
        </div>
        <p className="text-[9px] text-slate-500 leading-relaxed">
          Network Intelligence grows with every decision and recorded outcome.
          The score compounds data breadth, outcome coverage, domain diversity, and calibration quality.
        </p>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl border border-amber-400/20 bg-amber-500/5 flex items-center justify-center mb-6">
        <Database className="w-8 h-8 text-amber-300/40" />
      </div>
      <h3 className="text-lg font-black text-[#F8FAFF] mb-3">Network Intelligence Initializing</h3>
      <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
        Run decisions and record outcomes to activate the calibration flywheel.
        Every outcome logged improves prediction accuracy for every future decision.
      </p>
      <div className="mt-8 grid grid-cols-3 gap-4 max-w-sm">
        {[
          { label: 'Calibration', desc: 'Score adjustment from outcomes' },
          { label: 'Benchmarks', desc: 'Domain-level performance norms' },
          { label: 'Flywheel', desc: 'Accuracy improves with data' },
        ].map(item => (
          <div key={item.label} className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
            <div className="text-[10px] font-black text-slate-400 uppercase">{item.label}</div>
            <div className="text-[9px] text-slate-600 mt-1">{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KPICard({
  label,
  value,
  subvalue,
  tone = 'text-[#F8FAFF]',
  icon: Icon,
}: {
  label: string;
  value: string | number;
  subvalue?: string;
  tone?: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-[8px] font-black uppercase text-slate-500">{label}</span>
      </div>
      <div className={`text-2xl font-black font-mono ${tone}`}>{value}</div>
      {subvalue && <div className="text-[9px] text-slate-500">{subvalue}</div>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function EnterpriseDashboard() {
  const [intel, setIntel] = useState<NetworkIntelligence | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchIntelligence() {
      setLoading(true);
      try {
        const res = await fetch('/api/benchmarks');
        if (!res.ok) throw new Error('Failed to fetch network intelligence');
        const data = await res.json();
        if (!cancelled) setIntel(data.intelligence);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchIntelligence();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-5xl space-y-4 animate-pulse">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-28 rounded-2xl border border-white/5 bg-white/[0.02]" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-5xl rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 text-rose-400 text-sm">
        Failed to load network intelligence: {error}
      </div>
    );
  }

  if (!intel || intel.totalDecisions === 0) {
    return (
      <div className="w-full max-w-5xl rounded-2xl border border-white/10 bg-[#0B1020]/60 p-8">
        <EmptyState />
      </div>
    );
  }

  const hasCalibrationData = intel.calibrationBuckets.some(b => b.sampleCount > 0);
  const hasDomainOutcomes = intel.domainBenchmarks.some(b => b.avgOutcomeAccuracy >= 0);
  const hasVolume = intel.volumeTrend.some(d => d.value > 0);
  const hasAccuracyTrend = intel.accuracyTrend.some(d => d.value > 0);

  return (
    <div className="w-full max-w-5xl space-y-6">

      {/* Due reviews — shown only when there are scheduled reviews past their date */}
      <PendingReviewsPanel />

      {/* Network Intelligence Score */}
      <div className="rounded-2xl border border-amber-500/15 bg-amber-500/[0.03] p-6 shadow-[0_0_32px_rgba(245,158,11,0.06)]">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
          <span className="text-[9px] font-black uppercase text-slate-300">Network Intelligence</span>
          <span className="text-[8px] text-slate-600 font-mono uppercase ml-auto">
            {intel.totalDecisions} decision{intel.totalDecisions !== 1 ? 's' : ''} · {intel.totalOutcomes} outcome{intel.totalOutcomes !== 1 ? 's' : ''}
          </span>
        </div>
        <NetworkScoreGauge score={intel.networkScore} />
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard
          label="Total Decisions"
          value={intel.totalDecisions}
          subvalue="events in dataset"
          icon={Database}
          tone="text-purple-300"
        />
        <KPICard
          label="Outcomes Recorded"
          value={intel.totalOutcomes}
          subvalue={`${Math.round((intel.totalOutcomes / Math.max(1, intel.totalDecisions)) * 100)}% coverage`}
          icon={CheckCircle2}
          tone="text-emerald-400"
        />
        <KPICard
          label="Calibration Drift"
          value={`${intel.calibrationDrift === 0 && !hasCalibrationData ? '—' : intel.calibrationDrift + ' pts'}`}
          subvalue={intel.calibrationDrift === 0 ? 'No outcome data yet' : intel.calibrationDrift < 10 ? 'Well calibrated' : 'Significant bias'}
          icon={Activity}
          tone={intel.calibrationDrift < 10 ? 'text-emerald-400' : 'text-amber-400'}
        />
        <KPICard
          label="Prediction Improvement"
          value={intel.predictionImprovement > 0 ? `+${intel.predictionImprovement}%` : '—'}
          subvalue={intel.predictionImprovement > 0 ? 'flywheel active' : 'needs more outcomes'}
          icon={TrendingUp}
          tone={intel.predictionImprovement > 0 ? 'text-emerald-400' : 'text-slate-400'}
        />
      </div>

      {/* Network Insights */}
      {intel.topInsights.length > 0 && (
        <div className="rounded-2xl border border-purple-500/15 bg-purple-500/[0.03] p-6">
          <div className="flex items-center gap-2 mb-5">
            <Lightbulb className="w-3.5 h-3.5 text-purple-300" />
            <span className="text-[9px] font-black uppercase text-slate-300">Network Insights</span>
          </div>
          <ul className="space-y-4">
            {intel.topInsights.map((insight, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-purple-400 font-black text-sm mt-0.5 flex-shrink-0">{i + 1}</span>
                <p className="text-sm text-slate-300 leading-relaxed">{insight}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Calibration Matrix */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <div className="flex items-center gap-2 mb-2">
          <BarChart2 className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[9px] font-black uppercase text-slate-300">Calibration Matrix</span>
          <span className="text-[8px] text-slate-600 font-mono ml-auto uppercase">
            Offset = Actual − Predicted · negative = overconfident
          </span>
        </div>
        <p className="text-[9px] text-slate-500 mb-4 leading-relaxed">
          The system learns to self-correct its confidence scores by tracking how accurate its predictions are across score ranges.
          {!hasCalibrationData && ' Record outcomes to populate this matrix.'}
        </p>
        <CalibrationMatrix buckets={intel.calibrationBuckets} />
      </div>

      {/* Domain Benchmarks */}
      {intel.domainBenchmarks.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="flex items-center gap-2 mb-5">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[9px] font-black uppercase text-slate-300">Domain Benchmarks</span>
            {!hasDomainOutcomes && (
              <span className="ml-auto text-[8px] text-slate-600 uppercase font-mono">
                Record outcomes to show accuracy vs. confidence
              </span>
            )}
          </div>
          <div className="divide-y divide-white/5">
            {intel.domainBenchmarks.map(b => (
              <DomainBenchmarkRow key={b.domain} benchmark={b} />
            ))}
          </div>
        </div>
      )}

      {/* Trend Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Decision Volume */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-3.5 h-3.5 text-purple-300" />
            <span className="text-[9px] font-black uppercase text-slate-300">Decision Volume</span>
            <span className="ml-auto text-[8px] text-slate-600 font-mono">Last 12 weeks</span>
          </div>
          {hasVolume ? (
            <BarChart data={intel.volumeTrend} color="#a855f7" height={80} />
          ) : (
            <div className="h-20 flex items-center justify-center text-[9px] text-slate-600 uppercase font-bold">
              No data yet
            </div>
          )}
        </div>

        {/* Outcome Accuracy Trend */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[9px] font-black uppercase text-slate-300">Outcome Accuracy</span>
            <span className="ml-auto text-[8px] text-slate-600 font-mono">Last 6 months</span>
          </div>
          {hasAccuracyTrend ? (
            <LineChart data={intel.accuracyTrend} color="#10b981" height={80} showLabels />
          ) : (
            <div className="h-20 flex items-center justify-center text-[9px] text-slate-600 uppercase font-bold">
              Record outcomes to activate
            </div>
          )}
        </div>
      </div>

      {/* Moat Footer */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[9px] font-black uppercase text-slate-500">Why This Is Hard to Replicate</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Calibration Data',
              body: 'The gap between predicted confidence and actual outcome accuracy requires real decision-outcome pairs. It cannot be synthesized.',
            },
            {
              title: 'Domain Benchmarks',
              body: 'Platform-level benchmarks by domain are only possible with sufficient volume across diverse decision types.',
            },
            {
              title: 'Compound Flywheel',
              body: 'Every outcome recorded improves calibration for every future decision. The value of the dataset compounds non-linearly.',
            },
          ].map(item => (
            <div key={item.title} className="space-y-2">
              <div className="text-[9px] font-black uppercase text-slate-400">{item.title}</div>
              <p className="text-[10px] text-slate-600 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default memo(EnterpriseDashboard);
