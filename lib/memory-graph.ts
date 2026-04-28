import {
  DecisionMemoryEntry,
  DecisionContext,
  DecisionEdge,
  StrategicPattern,
  MemoryGraph,
  MemoryGraphNode,
  MemoryIntelligence,
} from './types';

// ─── Edge Computation ─────────────────────────────────────────────────────────

function computeEdgeWeight(a: DecisionMemoryEntry, b: DecisionMemoryEntry): number {
  let weight = 0;

  // Tag overlap — max 0.5
  const sharedTags = a.tags.filter(t => b.tags.includes(t));
  const tagSim =
    a.tags.length > 0
      ? (sharedTags.length / Math.max(a.tags.length, b.tags.length)) * 0.5
      : 0;
  weight += tagSim;

  // Domain match — 0.3
  if (a.context?.domain && b.context?.domain && a.context.domain === b.context.domain) {
    weight += 0.3;
  }

  // Time proximity — 0.2
  const daysDiff =
    Math.abs(new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) /
    86_400_000;
  if (daysDiff < 7) weight += 0.2;
  else if (daysDiff < 30) weight += 0.1;

  return Math.min(1, weight);
}

function edgeType(
  a: DecisionMemoryEntry,
  b: DecisionMemoryEntry,
  weight: number
): DecisionEdge['type'] {
  if (a.outcome && b.outcome) return 'outcome_correlated';
  if (a.context?.domain === b.context?.domain && a.context?.domain) return 'same_domain';
  if (weight > 0.4) return 'similar_problem';
  return 'same_domain';
}

// ─── Node Strategic Score ─────────────────────────────────────────────────────

function nodeStrategicScore(entry: DecisionMemoryEntry, connectionCount: number): number {
  let s = entry.blueprint.score * 0.4;
  if (entry.outcome) {
    s += entry.outcome.scoreAccuracy * 0.3;
    s += 10; // bonus for tracking outcome
  }
  s += Math.min(20, connectionCount * 5); // network value
  return Math.round(Math.min(100, s));
}

// ─── Graph Build ──────────────────────────────────────────────────────────────

export function buildGraph(history: DecisionMemoryEntry[]): MemoryGraphNode[] {
  if (history.length === 0) return [];

  const EDGE_THRESHOLD = 0.2;

  const nodes: MemoryGraphNode[] = history.map(e => ({
    id: e.id,
    problem: e.problem,
    timestamp: e.timestamp,
    score: e.blueprint.score,
    domain: e.context?.domain || 'general',
    hasOutcome: !!e.outcome,
    outcomeAccuracy: e.outcome?.scoreAccuracy,
    edges: [],
    strategicScore: 0,
    tags: e.tags,
  }));

  for (let i = 0; i < history.length; i++) {
    for (let j = i + 1; j < history.length; j++) {
      const w = computeEdgeWeight(history[i], history[j]);
      if (w >= EDGE_THRESHOLD) {
        const type = edgeType(history[i], history[j], w);
        nodes[i].edges.push({ targetId: history[j].id, weight: w, type });
        nodes[j].edges.push({ targetId: history[i].id, weight: w, type });
      }
    }
  }

  nodes.forEach((node, idx) => {
    node.strategicScore = nodeStrategicScore(history[idx], node.edges.length);
  });

  return nodes;
}

// ─── Pattern Detection ────────────────────────────────────────────────────────

export function detectPatterns(history: DecisionMemoryEntry[]): StrategicPattern[] {
  if (history.length < 2) return [];

  const patterns: StrategicPattern[] = [];

  // Pattern: domain clustering
  const byDomain: Record<string, DecisionMemoryEntry[]> = {};
  history.forEach(e => {
    const d = e.context?.domain || 'general';
    (byDomain[d] = byDomain[d] || []).push(e);
  });

  Object.entries(byDomain).forEach(([domain, decisions]) => {
    if (decisions.length < 2) return;
    const avgScore =
      decisions.reduce((s, d) => s + d.blueprint.score, 0) / decisions.length;
    const withOutcomes = decisions.filter(d => d.outcome);
    const avgAccuracy =
      withOutcomes.length > 0
        ? withOutcomes.reduce((s, d) => s + (d.outcome?.scoreAccuracy || 0), 0) /
          withOutcomes.length
        : -1;
    const signal: StrategicPattern['signal'] =
      withOutcomes.length >= 2
        ? avgAccuracy >= avgScore - 5
          ? 'positive'
          : avgAccuracy < avgScore - 15
          ? 'negative'
          : 'neutral'
        : 'neutral';
    const domainLabel = domain.charAt(0).toUpperCase() + domain.slice(1);

    patterns.push({
      id: `domain-${domain}`,
      name: `${domainLabel} Domain Cluster`,
      description: `${decisions.length} decisions in the ${domain} domain`,
      frequency: decisions.length,
      avgScore: Math.round(avgScore),
      avgOutcomeAccuracy: avgAccuracy >= 0 ? Math.round(avgAccuracy) : -1,
      decisionIds: decisions.map(d => d.id),
      signal,
      lesson:
        signal === 'positive'
          ? `Strong track record in ${domain} decisions. Domain expertise is compounding.`
          : signal === 'negative'
          ? `${domainLabel} outcomes are underperforming confidence. Validate core assumptions before committing.`
          : withOutcomes.length > 0
          ? `Sparse ${domain} outcome data. Record more outcomes before treating this as a pattern.`
          : `No ${domain} outcomes recorded yet. This is a cluster, not a performance signal.`,
      dominantTags: [domain],
    });
  });

  // Pattern: high-confidence cluster
  const highConf = history.filter(d => d.blueprint.score > 75);
  if (highConf.length >= 2) {
    const withBadOutcomes = highConf.filter(
      d => d.outcome && d.outcome.scoreAccuracy < 50
    );
    const withOutcomes = highConf.filter(d => d.outcome);
    const avgAccuracy =
      withOutcomes.length > 0
        ? withOutcomes.reduce((s, d) => s + (d.outcome?.scoreAccuracy || 0), 0) /
          withOutcomes.length
        : -1;
    const overconfident = withOutcomes.length >= 2 && withBadOutcomes.length > withOutcomes.length * 0.3;

    patterns.push({
      id: 'high-confidence-cluster',
      name: 'High-Confidence Decisions',
      description: `${highConf.length} decisions with confidence > 75`,
      frequency: highConf.length,
      avgScore: Math.round(
        highConf.reduce((s, d) => s + d.blueprint.score, 0) / highConf.length
      ),
      avgOutcomeAccuracy: avgAccuracy >= 0 ? Math.round(avgAccuracy) : -1,
      decisionIds: highConf.map(d => d.id),
      signal: withOutcomes.length >= 2 ? (overconfident ? 'negative' : 'positive') : 'neutral',
      lesson: overconfident
        ? 'Overconfidence detected: high-confidence calls have underperformed. Stress-test assumptions harder.'
        : withOutcomes.length >= 2
        ? 'High-confidence decisions with outcomes are tracking within expected calibration.'
        : 'High-confidence cluster detected, but outcomes are too sparse to judge calibration.',
      dominantTags: [],
    });
  }

  // Pattern: decision velocity
  const recentMs = 30 * 86_400_000;
  const recent = history.filter(
    d => Date.now() - new Date(d.timestamp).getTime() < recentMs
  );
  if (recent.length >= 3) {
    patterns.push({
      id: 'decision-velocity',
      name: 'High Decision Velocity',
      description: `${recent.length} decisions in the last 30 days`,
      frequency: recent.length,
      avgScore: Math.round(
        recent.reduce((s, d) => s + d.blueprint.score, 0) / recent.length
      ),
      avgOutcomeAccuracy: -1,
      decisionIds: recent.map(d => d.id),
      signal: 'neutral',
      lesson:
        'High decision velocity detected. Ensure each decision has adequate deliberation time. Speed without depth creates risk.',
      dominantTags: [],
    });
  }

  return patterns;
}

// ─── Strategic Memory Score ───────────────────────────────────────────────────

export function computeStrategicMemoryScore(
  history: DecisionMemoryEntry[],
  patterns: StrategicPattern[]
): number {
  if (history.length === 0) return 0;

  const breadth = Math.min(40, history.length * 4); // 0–40

  const withOutcomes = history.filter(e => e.outcome);
  const quality =
    withOutcomes.length > 0
      ? (withOutcomes.reduce((s, e) => s + (e.outcome?.scoreAccuracy || 0), 0) /
          withOutcomes.length /
          100) *
        30
      : 0; // 0–30

  const domains = new Set(history.map(e => e.context?.domain || 'general'));
  const diversity = Math.min(20, domains.size * 5); // 0–20

  const posPatterns = patterns.filter(p => p.signal === 'positive').length;
  const consistency = Math.min(10, posPatterns * 3); // 0–10

  return Math.round(breadth + quality + diversity + consistency);
}

// ─── Prediction Improvement ───────────────────────────────────────────────────

function computePredictionImprovement(history: DecisionMemoryEntry[]): number {
  const withOutcomes = history
    .filter(e => e.outcome)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  if (withOutcomes.length < 4) return 0;

  const mid = Math.floor(withOutcomes.length / 2);
  const mae = (half: DecisionMemoryEntry[]) =>
    half.reduce((s, e) => s + Math.abs(e.outcome!.scoreAccuracy - e.blueprint.score), 0) / half.length;

  const firstMAE = mae(withOutcomes.slice(0, mid));
  const secondMAE = mae(withOutcomes.slice(mid));

  if (firstMAE === 0) return 0;
  return Math.round(Math.max(0, ((firstMAE - secondMAE) / firstMAE) * 100));
}

// ─── Accuracy Trend ───────────────────────────────────────────────────────────

function accuracyTrend(history: DecisionMemoryEntry[]): number[] {
  return history
    .filter(e => e.outcome)
    .slice(0, 10)
    .map(e => e.outcome!.scoreAccuracy)
    .reverse();
}

// ─── Lesson Extraction ────────────────────────────────────────────────────────

function extractLessons(subset: DecisionMemoryEntry[]): string[] {
  const lessons: string[] = [];
  subset
    .filter(e => e.outcome?.lessons?.length)
    .slice(0, 5)
    .forEach(e => {
      e.outcome!.lessons.slice(0, 2).forEach(l => {
        if (l && !lessons.includes(l)) lessons.push(l);
      });
    });
  return lessons.slice(0, 5);
}

// ─── Full Graph ───────────────────────────────────────────────────────────────

export function buildMemoryGraph(history: DecisionMemoryEntry[]): MemoryGraph {
  // Demo seeds stay excluded until the user records a real outcome on them.
  const real = history.filter(e => !e.blueprint.isDemo || e.outcome);

  const nodes = buildGraph(real);
  const patterns = detectPatterns(real);
  const strategicMemoryScore = computeStrategicMemoryScore(real, patterns);
  const lessonsLearned = extractLessons(real);
  const trend = accuracyTrend(real);
  const predictionImprovement = computePredictionImprovement(real);

  const topDomains: Record<string, number> = {};
  real.forEach(e => {
    const d = e.context?.domain || 'general';
    topDomains[d] = (topDomains[d] || 0) + 1;
  });

  return {
    nodes,
    patterns,
    totalDecisions: real.length,
    strategicMemoryScore,
    topDomains,
    accuracyTrend: trend,
    lessonsLearned,
    predictionImprovement,
  };
}

// ─── Tag Extraction (local copy to avoid circular import) ─────────────────────

function localExtractTags(problem: string, context?: DecisionContext): string[] {
  const tags: Set<string> = new Set();
  if (context?.domain) tags.add(context.domain);

  const lower = problem.toLowerCase();
  const kw: Record<string, string[]> = {
    business: ['business', 'company', 'startup', 'product', 'market', 'revenue'],
    career: ['career', 'job', 'role', 'promotion', 'switch', 'hire'],
    financial: ['invest', 'capital', 'fund', 'loan', 'budget', 'cost'],
    strategic: ['strategy', 'pivot', 'expand', 'merge', 'acquire'],
  };
  Object.entries(kw).forEach(([domain, words]) => {
    if (words.some(w => lower.includes(w))) tags.add(domain);
  });

  if (context?.timeHorizon) tags.add(`horizon:${context.timeHorizon}`);
  return Array.from(tags);
}

// ─── Strategic Context String for Agent Injection ─────────────────────────────

function buildStrategicContextString(
  relevant: DecisionMemoryEntry[],
  patterns: StrategicPattern[],
  lessons: string[],
  warnings: string[],
  memoryScore: number
): string {
  if (relevant.length === 0 && patterns.length === 0) return '';

  const lines: string[] = [
    `=== STRATEGIC MEMORY CONTEXT (Memory Score: ${memoryScore}/100) ===`,
  ];

  if (relevant.length > 0) {
    lines.push('\nRELATED PAST DECISIONS:');
    relevant.forEach((d, i) => {
      const summary = d.problem.length > 100 ? d.problem.slice(0, 100) + '...' : d.problem;
      const outcomeNote = d.outcome
        ? `Outcome accuracy: ${d.outcome.scoreAccuracy}%`
        : 'No outcome recorded yet';
      lines.push(`${i + 1}. "${summary}" — Confidence: ${d.blueprint.score}/100, ${outcomeNote}`);
      if (d.outcome?.lessons?.[0]) {
        lines.push(`   Lesson: ${d.outcome.lessons[0]}`);
      }
    });
  }

  if (lessons.length > 0) {
    lines.push('\nACCUMULATED LESSONS FROM PAST DECISIONS:');
    lessons.forEach(l => lines.push(`- ${l}`));
  }

  if (warnings.length > 0) {
    lines.push('\nWARNING FLAGS FROM PATTERN ANALYSIS:');
    warnings.forEach(w => lines.push(`⚠ ${w}`));
  }

  const signalPatterns = patterns.filter(p => p.signal !== 'neutral');
  if (signalPatterns.length > 0) {
    lines.push('\nSTRATEGIC SIGNAL PATTERNS:');
    signalPatterns.forEach(p => {
      lines.push(`${p.signal === 'positive' ? '✓' : '!'} ${p.name}: ${p.lesson}`);
    });
  }

  lines.push('\nUse this context to improve the quality of your analysis. Reference past patterns where relevant.');
  return lines.join('\n');
}

// ─── Memory Intelligence for a New Problem ────────────────────────────────────

export function getMemoryIntelligenceFromHistory(
  problem: string,
  history: DecisionMemoryEntry[],
  context?: DecisionContext,
  limit = 3
): MemoryIntelligence {
  const real = history.filter(e => !e.blueprint.isDemo || e.outcome);

  if (real.length === 0) {
    return {
      relevantDecisions: [],
      applicablePatterns: [],
      lessons: [],
      warningFlags: [],
      strategicContext: '',
      memoryScore: 0,
    };
  }

  const patterns = detectPatterns(real);
  const memoryScore = computeStrategicMemoryScore(real, patterns);
  const problemTags = localExtractTags(problem, context);

  // Score each real historical decision for relevance
  const scored = real.map(entry => {
    const overlap = problemTags.filter(t => entry.tags.includes(t)).length;
    const tagScore = problemTags.length > 0 ? overlap / problemTags.length : 0;
    const domainBonus =
      context?.domain && entry.context?.domain === context.domain ? 0.3 : 0;
    return { entry, score: tagScore + domainBonus };
  });

  const relevantDecisions = scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.entry);

  // Patterns applicable to this domain/context
  const applicablePatterns = patterns
    .filter(p => {
      if (!context?.domain) return true;
      return p.dominantTags.includes(context.domain) || p.id.includes(context.domain);
    })
    .slice(0, 3);

  const lessons = extractLessons(relevantDecisions);

  const warningFlags: string[] = [];
  patterns
    .filter(p => p.signal === 'negative')
    .slice(0, 2)
    .forEach(p => warningFlags.push(p.lesson));

  // High weekly velocity warning (real decisions only)
  const weekMs = 7 * 86_400_000;
  const recentWeek = real.filter(
    d => Date.now() - new Date(d.timestamp).getTime() < weekMs
  );
  if (recentWeek.length >= 3) {
    warningFlags.push(
      'High decision velocity this week — ensure adequate deliberation time.'
    );
  }

  const strategicContext = buildStrategicContextString(
    relevantDecisions,
    applicablePatterns,
    lessons,
    warningFlags,
    memoryScore
  );

  return {
    relevantDecisions,
    applicablePatterns,
    lessons,
    warningFlags,
    strategicContext,
    memoryScore,
  };
}
