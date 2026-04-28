"use client";

import { useEffect, useRef, useState, memo } from 'react';
import { Brain, TrendingUp, Zap, AlertTriangle, CheckCircle2, Circle, BookOpen } from 'lucide-react';
import type { MemoryGraph, MemoryGraphNode, StrategicPattern } from '@/lib/types';

// ─── Domain Colour Map ────────────────────────────────────────────────────────

const DOMAIN_COLORS: Record<string, string> = {
  business: '#10b981',
  career: '#3b82f6',
  financial: '#f59e0b',
  strategic: '#a855f7',
  general: '#64748b',
};

function domainColor(domain: string): string {
  return DOMAIN_COLORS[domain] || DOMAIN_COLORS.general;
}

// ─── Radial Layout ─────────────────────────────────────────────────────────────

interface PlacedNode extends MemoryGraphNode {
  x: number;
  y: number;
}

function computeLayout(nodes: MemoryGraphNode[], width: number, height: number): PlacedNode[] {
  if (nodes.length === 0) return [];

  const cx = width / 2;
  const cy = height / 2;

  if (nodes.length === 1) {
    return [{ ...nodes[0], x: cx, y: cy }];
  }

  const placed: PlacedNode[] = [];
  // Sort by strategicScore so highest-value nodes are in inner ring
  const sorted = [...nodes].sort((a, b) => b.strategicScore - a.strategicScore);

  const ringCapacities = [1, 6, 10, 14, 18];
  const baseR = Math.min(cx, cy) * 0.22;
  const ringStep = Math.min(cx, cy) * 0.22;

  let idx = 0;
  let ring = 0;

  while (idx < sorted.length && ring < ringCapacities.length) {
    const capacity = ring === 0 ? 1 : ringCapacities[ring];
    const count = Math.min(capacity, sorted.length - idx);
    const radius = ring === 0 ? 0 : baseR + (ring - 1) * ringStep;

    for (let i = 0; i < count; i++) {
      const angle =
        ring === 0
          ? 0
          : (2 * Math.PI * i) / count - Math.PI / 2;
      placed.push({
        ...sorted[idx],
        x: ring === 0 ? cx : cx + radius * Math.cos(angle),
        y: ring === 0 ? cy : cy + radius * Math.sin(angle),
      });
      idx++;
    }
    ring++;
  }

  return placed;
}

// ─── SVG Graph ────────────────────────────────────────────────────────────────

interface GraphSVGProps {
  graph: MemoryGraph;
  width: number;
  height: number;
}

const NODE_R = 8;

function GraphSVG({ graph, width, height }: GraphSVGProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const placed = computeLayout(graph.nodes, width, height);
  const byId = Object.fromEntries(placed.map(n => [n.id, n]));

  // Deduplicate edges (each edge stored on both nodes)
  const edgeSet = new Set<string>();
  const edges: { x1: number; y1: number; x2: number; y2: number; weight: number }[] = [];

  placed.forEach(node => {
    node.edges.forEach(edge => {
      const key = [node.id, edge.targetId].sort().join('|');
      if (edgeSet.has(key)) return;
      edgeSet.add(key);
      const target = byId[edge.targetId];
      if (!target) return;
      edges.push({ x1: node.x, y1: node.y, x2: target.x, y2: target.y, weight: edge.weight });
    });
  });

  const hovered = hoveredId ? byId[hoveredId] : null;

  return (
    <svg width={width} height={height} className="overflow-visible">
      {/* Edges */}
      {edges.map((e, i) => (
        <line
          key={i}
          x1={e.x1} y1={e.y1}
          x2={e.x2} y2={e.y2}
          stroke="rgba(168,85,247,0.25)"
          strokeWidth={Math.max(0.5, e.weight * 2)}
          strokeOpacity={Math.max(0.1, e.weight * 0.6)}
        />
      ))}

      {/* Nodes */}
      {placed.map(node => {
        const color = domainColor(node.domain);
        const isHovered = hoveredId === node.id;
        const r = isHovered ? NODE_R + 3 : NODE_R;
        const glow = node.hasOutcome ? `drop-shadow(0 0 6px ${color})` : 'none';

        return (
          <g
            key={node.id}
            transform={`translate(${node.x},${node.y})`}
            onMouseEnter={() => setHoveredId(node.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{ cursor: 'pointer' }}
          >
            <circle
              r={r}
              fill={color}
              fillOpacity={0.15}
              stroke={color}
              strokeWidth={isHovered ? 2 : 1}
              style={{ filter: glow, transition: 'r 0.15s ease' }}
            />
            {node.hasOutcome && (
              <circle r={2.5} fill={color} fillOpacity={0.9} />
            )}
          </g>
        );
      })}

      {/* Hover tooltip */}
      {hovered && (() => {
        const tx = hovered.x + NODE_R + 10;
        const ty = hovered.y;
        const clampedX = tx + 160 > width ? hovered.x - 170 : tx;
        const clampedY = Math.max(20, Math.min(height - 40, ty));
        const label = hovered.problem.length > 55
          ? hovered.problem.slice(0, 55) + '…'
          : hovered.problem;
        return (
          <g transform={`translate(${clampedX},${clampedY})`}>
            <rect
              x={0} y={-12} width={160} height={42}
              rx={6}
              fill="#0B1020"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth={1}
            />
            <text x={8} y={2} fill="#f8faff" fontSize={9} fontWeight="bold">
              {label}
            </text>
            <text x={8} y={16} fill={domainColor(hovered.domain)} fontSize={8}>
              {hovered.domain} · {hovered.score}/100
              {hovered.hasOutcome ? ` · acc ${hovered.outcomeAccuracy}%` : ''}
            </text>
          </g>
        );
      })()}
    </svg>
  );
}

// ─── Signal Badge ─────────────────────────────────────────────────────────────

function SignalBadge({ signal }: { signal: StrategicPattern['signal'] }) {
  if (signal === 'positive') {
    return <span className="text-[8px] font-black uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">Positive</span>;
  }
  if (signal === 'negative') {
    return <span className="text-[8px] font-black uppercase text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">Warning</span>;
  }
  return <span className="text-[8px] font-black uppercase text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">Neutral</span>;
}

// ─── Pattern Card ─────────────────────────────────────────────────────────────

const PatternCard = memo(function PatternCard({ pattern }: { pattern: StrategicPattern }) {
  const Icon = pattern.signal === 'positive'
    ? CheckCircle2
    : pattern.signal === 'negative'
    ? AlertTriangle
    : Circle;

  const iconColor = pattern.signal === 'positive'
    ? 'text-emerald-400'
    : pattern.signal === 'negative'
    ? 'text-rose-400'
    : 'text-slate-400';

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${iconColor}`} />
          <span className="text-xs font-bold text-[#F8FAFF]">{pattern.name}</span>
        </div>
        <SignalBadge signal={pattern.signal} />
      </div>
      <p className="text-[10px] text-slate-400 leading-relaxed">{pattern.description}</p>
      <p className="text-[10px] text-slate-300 leading-relaxed border-l-2 border-purple-400/30 pl-3 italic">
        {pattern.lesson}
      </p>
      <div className="flex gap-4 pt-1">
        <div>
          <div className="text-[8px] uppercase text-slate-500 font-bold">Avg Score</div>
          <div className="text-sm font-black text-[#F8FAFF]">{pattern.avgScore}</div>
        </div>
        {pattern.avgOutcomeAccuracy >= 0 && (
          <div>
            <div className="text-[8px] uppercase text-slate-500 font-bold">Avg Accuracy</div>
            <div className="text-sm font-black text-[#F8FAFF]">{pattern.avgOutcomeAccuracy}%</div>
          </div>
        )}
        <div>
          <div className="text-[8px] uppercase text-slate-500 font-bold">Decisions</div>
          <div className="text-sm font-black text-[#F8FAFF]">{pattern.frequency}</div>
        </div>
      </div>
    </div>
  );
});

// ─── Accuracy Trend Sparkline ─────────────────────────────────────────────────

function AccuracySparkline({ trend }: { trend: number[] }) {
  if (trend.length < 2) return null;

  const W = 120;
  const H = 28;
  const max = Math.max(...trend, 1);
  const points = trend
    .map((v, i) => {
      const x = (i / (trend.length - 1)) * W;
      const y = H - (v / max) * H;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={W} height={H} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke="#a855f7"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {trend.map((v, i) => {
        const x = (i / (trend.length - 1)) * W;
        const y = H - (v / max) * H;
        return <circle key={i} cx={x} cy={y} r={2} fill="#a855f7" />;
      })}
    </svg>
  );
}

// ─── Strategic Memory Score Gauge ─────────────────────────────────────────────

function MemoryScoreGauge({ score }: { score: number }) {
  const label =
    score === 0 ? 'No Memory' :
    score < 20 ? 'Early Stage' :
    score < 40 ? 'Building' :
    score < 60 ? 'Established' :
    score < 80 ? 'Intelligent' :
    'Compounding';

  const color =
    score < 20 ? 'text-slate-400' :
    score < 40 ? 'text-amber-400' :
    score < 60 ? 'text-blue-400' :
    'text-emerald-400';

  const bgColor =
    score < 20 ? 'bg-slate-500' :
    score < 40 ? 'bg-amber-500' :
    score < 60 ? 'bg-blue-500' :
    'bg-emerald-500';

  return (
    <div className="flex items-center gap-4">
      <div>
        <div className={`text-4xl font-black ${color} font-mono`}>{score}</div>
        <div className="text-[8px] font-black uppercase text-slate-400">{label}</div>
      </div>
      <div className="flex-1">
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full ${bgColor} transition-all duration-700`}
            style={{ width: `${score}%` }}
          />
        </div>
        <div className="text-[8px] text-slate-500 mt-1">Strategic Memory Score / 100</div>
      </div>
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl border border-purple-400/20 bg-purple-500/5 flex items-center justify-center mb-6">
        <Brain className="w-8 h-8 text-purple-300/40" />
      </div>
      <h3 className="text-lg font-black text-[#F8FAFF] mb-3">Memory Graph Initializing</h3>
      <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
        Every decision you run is stored as a node in your strategic memory graph.
        Patterns, lessons, and intelligence compound over time.
      </p>
      <div className="mt-8 grid grid-cols-3 gap-4 text-center max-w-xs">
        {[
          { label: 'Decisions', desc: 'Every problem solved' },
          { label: 'Patterns', desc: 'Strategic signals' },
          { label: 'Lessons', desc: 'Recorded outcomes' },
        ].map(item => (
          <div key={item.label} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <div className="text-[10px] font-black text-slate-400 uppercase">{item.label}</div>
            <div className="text-[9px] text-slate-600 mt-1">{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Domain Legend ────────────────────────────────────────────────────────────

function DomainLegend({ domains }: { domains: Record<string, number> }) {
  const sorted = Object.entries(domains).sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {sorted.map(([domain, count]) => (
        <div key={domain} className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: domainColor(domain) }}
          />
          {domain} ({count})
        </div>
      ))}
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

function MemoryGraphPanel() {
  const [graph, setGraph] = useState<MemoryGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgWidth, setSvgWidth] = useState(600);

  useEffect(() => {
    let cancelled = false;

    async function fetchGraph() {
      setLoading(true);
      try {
        const res = await fetch('/api/memory?action=graph');
        if (!res.ok) throw new Error('Failed to fetch memory graph');
        const data = await res.json();
        if (!cancelled) setGraph(data.graph);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchGraph();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect?.width;
      if (w) setSvgWidth(Math.max(300, w));
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-5xl space-y-4 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 rounded-2xl border border-white/5 bg-white/[0.02]" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-5xl rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 text-rose-400 text-sm">
        Failed to load memory graph: {error}
      </div>
    );
  }

  if (!graph || graph.totalDecisions === 0) {
    return (
      <div className="w-full max-w-5xl rounded-2xl border border-white/10 bg-[#0B1020]/60 p-8">
        <EmptyState />
      </div>
    );
  }

  const SVG_HEIGHT = Math.min(340, Math.max(200, graph.nodes.length * 18));

  return (
    <div className="w-full max-w-5xl space-y-6">

      {/* Header — Memory Score + Stats */}
      <div className="rounded-2xl border border-purple-500/20 bg-purple-500/[0.04] p-6 shadow-[0_0_32px_rgba(168,85,247,0.08)]">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
          <span className="text-[9px] font-black uppercase text-slate-300">Decision Memory Graph</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MemoryScoreGauge score={graph.strategicMemoryScore} />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Decisions', value: graph.totalDecisions, icon: Brain },
              { label: 'Patterns', value: graph.patterns.length, icon: Zap },
              { label: 'Lessons', value: graph.lessonsLearned.length, icon: BookOpen },
              {
                label: 'Prediction ↑',
                value: graph.predictionImprovement > 0 ? `+${graph.predictionImprovement}%` : '—',
                icon: TrendingUp,
              },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
                <Icon className="w-3.5 h-3.5 text-slate-400 mx-auto mb-2" />
                <div className="text-xl font-black text-[#F8FAFF]">{value}</div>
                <div className="text-[8px] font-bold uppercase text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Graph Visualization */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-purple-300" />
            <span className="text-[9px] font-black uppercase text-slate-300">Decision Constellation</span>
          </div>
          {graph.accuracyTrend.length >= 2 && (
            <div className="flex items-center gap-3">
              <span className="text-[8px] text-slate-500 uppercase font-bold">Accuracy Trend</span>
              <AccuracySparkline trend={graph.accuracyTrend} />
            </div>
          )}
        </div>

        <div ref={containerRef} className="w-full">
          <GraphSVG graph={graph} width={svgWidth} height={SVG_HEIGHT} />
        </div>

        <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-x-6 gap-y-2 items-center justify-between">
          <DomainLegend domains={graph.topDomains} />
          <div className="flex items-center gap-3 text-[8px] text-slate-500 uppercase font-bold">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-purple-400/60" />
              Node = Decision
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-purple-400" />
              Filled = Outcome Recorded
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Patterns */}
      {graph.patterns.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[9px] font-black uppercase text-slate-300">Strategic Patterns</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {graph.patterns.map(pattern => (
              <PatternCard key={pattern.id} pattern={pattern} />
            ))}
          </div>
        </div>
      )}

      {/* Accumulated Lessons */}
      {graph.lessonsLearned.length > 0 && (
        <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.03] p-6">
          <div className="flex items-center gap-2 mb-5">
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[9px] font-black uppercase text-emerald-300">Accumulated Intelligence</span>
          </div>
          <ul className="space-y-3">
            {graph.lessonsLearned.map((lesson, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-300 leading-relaxed">
                <span className="text-emerald-400 font-black mt-0.5 flex-shrink-0">{i + 1}.</span>
                <span>{lesson}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Kernel Note */}
      <div className="flex items-center justify-center gap-3 opacity-20">
        <div className="h-px flex-1 bg-white" />
        <span className="text-[8px] font-black uppercase text-slate-500">
          Memory compounds · {graph.totalDecisions} decision{graph.totalDecisions !== 1 ? 's' : ''} stored
        </span>
        <div className="h-px flex-1 bg-white" />
      </div>
    </div>
  );
}

export default memo(MemoryGraphPanel);
