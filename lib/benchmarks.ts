import {
  DecisionContext,
  DecisionMemoryEntry,
  ConfidenceEvidence,
  DomainBenchmark,
  CalibrationBucket,
  NetworkIntelligence,
  CalibrationResult,
  TrendPoint,
} from './types';

// ─── Calibration Buckets ──────────────────────────────────────────────────────

const BUCKETS: [number, number][] = [
  [0, 20],
  [20, 40],
  [40, 60],
  [60, 80],
  [80, 101], // 101 to include score=100
];

function bucketFor(score: number): number {
  for (let i = 0; i < BUCKETS.length; i++) {
    if (score >= BUCKETS[i][0] && score < BUCKETS[i][1]) return i;
  }
  return BUCKETS.length - 1;
}

function learningEntries(history: DecisionMemoryEntry[]): DecisionMemoryEntry[] {
  return history.filter(e => !e.blueprint.isDemo || e.outcome);
}

function problemTokens(problem: string): Set<string> {
  return new Set(
    problem
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length >= 4)
  );
}

function similarityScore(
  entry: DecisionMemoryEntry,
  problem?: string,
  domain?: string,
  context?: DecisionContext
): number {
  let score = 0;
  const entryDomain = entry.context?.domain || inferDomain(entry.tags);
  const requestedDomain = context?.domain || domain;

  if (requestedDomain && entryDomain === requestedDomain) score += 0.45;

  const contextTags = [
    requestedDomain,
    context?.timeHorizon ? `horizon:${context.timeHorizon}` : undefined,
    ...(context?.stakeholders || []).map(s => `stakeholder:${s}`),
  ].filter((tag): tag is string => Boolean(tag));
  if (contextTags.length > 0) {
    const overlap = contextTags.filter(tag => entry.tags.includes(tag)).length;
    score += (overlap / contextTags.length) * 0.25;
  }

  if (problem) {
    const incoming = problemTokens(problem);
    const existing = problemTokens(entry.problem);
    if (incoming.size > 0 && existing.size > 0) {
      const overlap = [...incoming].filter(token => existing.has(token)).length;
      score += (overlap / Math.max(incoming.size, existing.size)) * 0.3;
    }
  }

  return Math.min(1, score);
}

function evidenceFromEntries(entries: DecisionMemoryEntry[]): ConfidenceEvidence[] {
  return entries
    .filter(entry => entry.outcome)
    .slice(0, 4)
    .map(entry => ({
      decisionId: entry.id,
      problem: entry.problem,
      predictedConfidence: entry.blueprint.score,
      actualOutcome: entry.outcome!.actualOutcome,
      actualConfidence: entry.outcome!.scoreAccuracy,
      calibrationOffset: Math.round(entry.outcome!.scoreAccuracy - entry.blueprint.score),
    }));
}

// ─── Domain Benchmarks ────────────────────────────────────────────────────────

function computeDomainBenchmarks(history: DecisionMemoryEntry[]): DomainBenchmark[] {
  const byDomain: Record<string, DecisionMemoryEntry[]> = {};
  history.forEach(e => {
    const d = e.context?.domain || inferDomain(e.tags);
    (byDomain[d] = byDomain[d] || []).push(e);
  });

  return Object.entries(byDomain)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([domain, decisions]) => {
      const withOutcomes = decisions.filter(d => d.outcome);
      const avgConf = avg(decisions.map(d => d.blueprint.score));
      const avgAcc =
        withOutcomes.length > 0
          ? avg(withOutcomes.map(d => d.outcome!.scoreAccuracy))
          : -1;
      const successRate =
        withOutcomes.length > 0
          ? (withOutcomes.filter(d => d.outcome!.scoreAccuracy >= 70).length / withOutcomes.length) * 100
          : -1;
      const calibrationOffset =
        withOutcomes.length > 0
          ? avg(withOutcomes.map(d => d.outcome!.scoreAccuracy - d.blueprint.score))
          : 0;

      return {
        domain,
        totalDecisions: decisions.length,
        avgConfidence: Math.round(avgConf),
        avgOutcomeAccuracy: avgAcc >= 0 ? Math.round(avgAcc) : -1,
        successRate: successRate >= 0 ? Math.round(successRate) : -1,
        calibrationOffset: Math.round(calibrationOffset),
      };
    });
}

// ─── Calibration Buckets ──────────────────────────────────────────────────────

function computeCalibrationBuckets(history: DecisionMemoryEntry[]): CalibrationBucket[] {
  const withOutcomes = history.filter(e => e.outcome);

  return BUCKETS.map(([lo, hi]) => {
    const inBucket = withOutcomes.filter(
      e => e.blueprint.score >= lo && e.blueprint.score < hi
    );
    const avgPred =
      inBucket.length > 0 ? avg(inBucket.map(e => e.blueprint.score)) : (lo + hi) / 2;
    const avgActual =
      inBucket.length > 0 ? avg(inBucket.map(e => e.outcome!.scoreAccuracy)) : -1;
    const offset = avgActual >= 0 ? avgActual - avgPred : 0;

    return {
      scoreRange: [lo, Math.min(hi, 100)] as [number, number],
      sampleCount: inBucket.length,
      avgPredicted: Math.round(avgPred),
      avgActual: avgActual >= 0 ? Math.round(avgActual) : -1,
      offset: Math.round(offset),
    };
  });
}

// ─── Volume Trend (last 12 weeks) ─────────────────────────────────────────────

function computeVolumeTrend(history: DecisionMemoryEntry[]): TrendPoint[] {
  const now = Date.now();
  const WEEK_MS = 7 * 86_400_000;
  const WEEKS = 12;

  return Array.from({ length: WEEKS }, (_, i) => {
    const weekStart = now - (WEEKS - i) * WEEK_MS;
    const weekEnd = weekStart + WEEK_MS;
    const count = history.filter(e => {
      const t = new Date(e.timestamp).getTime();
      return t >= weekStart && t < weekEnd;
    }).length;
    const date = new Date(weekStart);
    const label = `W${String(date.getMonth() + 1).padStart(2, '0')}/${String(
      date.getDate()
    ).padStart(2, '0')}`;
    return { label, value: count };
  });
}

// ─── Accuracy Trend (last 6 months) ──────────────────────────────────────────

function computeAccuracyTrend(history: DecisionMemoryEntry[]): TrendPoint[] {
  const withOutcomes = history.filter(e => e.outcome);
  const MONTHS = 6;
  const now = new Date();

  return Array.from({ length: MONTHS }, (_, i) => {
    const month = new Date(now.getFullYear(), now.getMonth() - (MONTHS - 1 - i), 1);
    const nextMonth = new Date(month.getFullYear(), month.getMonth() + 1, 1);
    const inMonth = withOutcomes.filter(e => {
      const t = new Date(e.timestamp);
      return t >= month && t < nextMonth;
    });
    const value = inMonth.length > 0 ? avg(inMonth.map(e => e.outcome!.scoreAccuracy)) : 0;
    const label = month.toLocaleString('default', { month: 'short' });
    return { label, value: Math.round(value) };
  });
}

// ─── Prediction Improvement ───────────────────────────────────────────────────

function computePredictionImprovement(history: DecisionMemoryEntry[]): number {
  const withOutcomes = history
    .filter(e => e.outcome)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  if (withOutcomes.length < 4) return 0;

  const mid = Math.floor(withOutcomes.length / 2);
  const firstHalf = withOutcomes.slice(0, mid);
  const secondHalf = withOutcomes.slice(mid);

  const drift = (half: typeof firstHalf) =>
    avg(half.map(e => Math.abs(e.outcome!.scoreAccuracy - e.blueprint.score)));

  const firstDrift = drift(firstHalf);
  const secondDrift = drift(secondHalf);

  if (firstDrift === 0) return 0;
  return Math.round(Math.max(0, ((firstDrift - secondDrift) / firstDrift) * 100));
}

// ─── Network Score ────────────────────────────────────────────────────────────

function computeNetworkScore(
  history: DecisionMemoryEntry[],
  calibrationBuckets: CalibrationBucket[],
): number {
  if (history.length === 0) return 0;

  const withOutcomes = history.filter(e => e.outcome);

  // Breadth: grows with data volume, plateaus at 30
  const breadth = Math.min(30, history.length * 1.5);

  // Coverage: ratio of outcomes to total decisions
  const coverage = (withOutcomes.length / history.length) * 30;

  // Diversity: unique domains
  const domains = new Set(history.map(e => e.context?.domain || 'general'));
  const diversity = Math.min(20, domains.size * 5);

  // Calibration quality: lower drift = higher quality
  const bucketsWithData = calibrationBuckets.filter(b => b.avgActual >= 0);
  const avgDrift =
    bucketsWithData.length > 0
      ? avg(bucketsWithData.map(b => Math.abs(b.offset)))
      : 50;
  const calibQuality = Math.max(0, 20 - avgDrift * 0.4);

  return Math.round(Math.min(100, breadth + coverage + diversity + calibQuality));
}

// ─── Top Network Insights ─────────────────────────────────────────────────────

function deriveTopInsights(
  benchmarks: DomainBenchmark[],
  buckets: CalibrationBucket[],
  predictionImprovement: number
): string[] {
  const insights: string[] = [];

  // Domain with highest calibration offset (most overconfident)
  const withOffset = benchmarks.filter(b => b.avgOutcomeAccuracy >= 0 && b.totalDecisions >= 2);
  if (withOffset.length > 0) {
    const mostOverconf = withOffset.reduce((a, b) =>
      a.calibrationOffset < b.calibrationOffset ? a : b
    );
    if (mostOverconf.calibrationOffset < -5) {
      insights.push(
        `${capitalize(mostOverconf.domain)} decisions are systematically overconfident by ${Math.abs(
          mostOverconf.calibrationOffset
        )} points — confidence scores in this domain should be discounted.`
      );
    } else if (mostOverconf.calibrationOffset > 5) {
      insights.push(
        `${capitalize(mostOverconf.domain)} decisions are consistently underestimated by ${mostOverconf.calibrationOffset} points — the system is being too conservative here.`
      );
    }
  }

  // Best-calibrated bucket
  const calibrated = buckets.filter(b => b.sampleCount >= 2 && b.avgActual >= 0);
  if (calibrated.length > 0) {
    const bestBucket = calibrated.reduce((a, b) =>
      Math.abs(a.offset) < Math.abs(b.offset) ? a : b
    );
    insights.push(
      `Decisions scored ${bestBucket.scoreRange[0]}–${bestBucket.scoreRange[1]} are the most accurately predicted — ${bestBucket.sampleCount} outcomes validate a ${Math.abs(bestBucket.offset)}-point calibration error.`
    );
  }

  // Prediction improvement
  if (predictionImprovement > 0) {
    insights.push(
      `Prediction accuracy has improved ${predictionImprovement}% as the dataset grows — the calibration flywheel is working.`
    );
  } else if (predictionImprovement === 0 && buckets.some(b => b.sampleCount > 0)) {
    insights.push(
      `At least four recorded outcomes are needed before prediction improvement is reported.`
    );
  }

  // High-confidence domain
  const highConf = benchmarks
    .filter(b => b.avgConfidence > 75 && b.totalDecisions >= 2)
    .sort((a, b) => b.totalDecisions - a.totalDecisions);
  if (highConf.length > 0) {
    insights.push(
      `${capitalize(highConf[0].domain)} is your highest-confidence domain at avg ${highConf[0].avgConfidence}/100 across ${highConf[0].totalDecisions} decision${highConf[0].totalDecisions !== 1 ? 's' : ''}.`
    );
  }

  // Default if empty
  if (insights.length === 0) {
    insights.push(
      'Record outcomes on completed decisions to activate the calibration model and unlock network intelligence insights.'
    );
  }

  return insights.slice(0, 4);
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function computeNetworkIntelligence(history: DecisionMemoryEntry[]): NetworkIntelligence {
  // Demo seeds do not count unless the user has recorded a real outcome on them.
  const real = learningEntries(history);

  const domainBenchmarks = computeDomainBenchmarks(real);
  const calibrationBuckets = computeCalibrationBuckets(real);
  const predictionImprovement = computePredictionImprovement(real);
  const networkScore = computeNetworkScore(real, calibrationBuckets);
  const topInsights = deriveTopInsights(domainBenchmarks, calibrationBuckets, predictionImprovement);
  const volumeTrend = computeVolumeTrend(real);
  const accuracyTrend = computeAccuracyTrend(real);

  const withOutcomes = real.filter(e => e.outcome);
  const bucketsWithData = calibrationBuckets.filter(b => b.avgActual >= 0);
  const calibrationDrift =
    bucketsWithData.length > 0
      ? Math.round(avg(bucketsWithData.map(b => Math.abs(b.offset))))
      : 0;

  return {
    totalDecisions: real.length,
    totalOutcomes: withOutcomes.length,
    networkScore,
    domainBenchmarks,
    calibrationBuckets,
    volumeTrend,
    accuracyTrend,
    topInsights,
    calibrationDrift,
    predictionImprovement,
  };
}

/**
 * Calibrate a raw confidence score against historical outcome data.
 * Returns the adjusted score and metadata about calibration confidence.
 * Requires at least 2 real (non-demo) outcome samples to apply any adjustment.
 */
export function calibrateScore(
  rawScore: number,
  history: DecisionMemoryEntry[],
  domain?: string,
  problem?: string,
  context?: DecisionContext
): CalibrationResult {
  const real = learningEntries(history);

  // Prefer domain-specific calibration; fall back to global bucket calibration
  const domainEntries = domain
    ? real.filter(e => e.outcome && (e.context?.domain || inferDomain(e.tags)) === domain)
    : [];
  const similarEntries = real
    .filter(e => e.outcome)
    .map(entry => ({ entry, similarity: similarityScore(entry, problem, domain, context) }))
    .filter(item => item.similarity >= 0.25)
    .sort((a, b) => b.similarity - a.similarity);

  const bucketIdx = bucketFor(rawScore);
  const [lo, hi] = BUCKETS[bucketIdx];
  const globalBucketEntries = real.filter(
    e => e.outcome && e.blueprint.score >= lo && e.blueprint.score < hi
  );

  if (similarEntries.length > 0) {
    const weightedOffset =
      similarEntries.reduce(
        (sum, item) =>
          sum + (item.entry.outcome!.scoreAccuracy - item.entry.blueprint.score) * item.similarity,
        0
      ) / similarEntries.reduce((sum, item) => sum + item.similarity, 0);
    const cap = similarEntries.length >= 5 ? 30 : similarEntries.length >= 2 ? 20 : 12;
    const offset = Math.round(Math.min(cap, Math.max(-cap, weightedOffset)));
    return {
      calibratedScore: Math.round(Math.min(100, Math.max(0, rawScore + offset))),
      rawScore,
      offset,
      sampleSize: similarEntries.length,
      confidence: similarEntries.length >= 5 ? 'high' : similarEntries.length >= 2 ? 'medium' : 'low',
      similarSuccessRate: Math.round(
        similarEntries.reduce((sum, item) => sum + item.entry.outcome!.scoreAccuracy, 0) /
          similarEntries.length
      ),
      evidence: evidenceFromEntries(similarEntries.map(item => item.entry)),
    };
  }

  // Use domain entries if enough, otherwise fall back to global bucket.
  const entries = domainEntries.length >= 3 ? domainEntries : globalBucketEntries;

  // Single-sample adjustments are noise — require at least 2 real outcomes
  if (entries.length < 2) {
    return { calibratedScore: rawScore, rawScore, offset: 0, sampleSize: entries.length, confidence: 'none' };
  }

  const avgActual = avg(entries.map(e => e.outcome!.scoreAccuracy));
  const avgPred = avg(entries.map(e => e.blueprint.score));
  const offset = Math.round(avgActual - avgPred);
  const calibratedScore = Math.round(Math.min(100, Math.max(0, rawScore + offset)));

  return {
    calibratedScore,
    rawScore,
    offset,
    sampleSize: entries.length,
    confidence: entries.length >= 5 ? 'high' : entries.length >= 3 ? 'medium' : 'low',
    similarSuccessRate: Math.round(avgActual),
    evidence: evidenceFromEntries(entries),
  };
}

/**
 * Build a calibration note for agent injection — tells the synthesizer how
 * confident to be based on historical data for this decision type.
 */
export function buildCalibrationContext(
  history: DecisionMemoryEntry[],
  domain?: string
): string {
  const real = learningEntries(history);
  const buckets = computeCalibrationBuckets(real);
  const bucketsWithData = buckets.filter(b => b.sampleCount >= 2);
  if (bucketsWithData.length === 0) return '';

  const lines = ['CALIBRATION INTELLIGENCE (based on historical outcome data):'];
  bucketsWithData.forEach(b => {
    const dir = b.offset > 0 ? 'underestimated' : b.offset < 0 ? 'overestimated' : 'accurate';
    const mag = Math.abs(b.offset);
    lines.push(
      `- Decisions scored ${b.scoreRange[0]}–${b.scoreRange[1]}: historically ${dir} by ${mag} points (n=${b.sampleCount})`
    );
  });

  if (domain) {
    const domainEntries = real.filter(e => e.outcome && (e.context?.domain || '') === domain);
    if (domainEntries.length >= 2) {
      const domainOffset = Math.round(
        avg(domainEntries.map(e => e.outcome!.scoreAccuracy - e.blueprint.score))
      );
      lines.push(
        `- ${capitalize(domain)} domain specifically: ${domainOffset > 0 ? '+' : ''}${domainOffset} points calibration offset (n=${domainEntries.length})`
      );
    }
  }

  lines.push(
    'Adjust your confidence score accordingly. Overconfidence is the most common failure mode.'
  );
  return lines.join('\n');
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((s, n) => s + n, 0) / nums.length;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function inferDomain(tags: string[]): string {
  const domainTags = ['business', 'career', 'financial', 'strategic'];
  const found = tags.find(t => domainTags.includes(t));
  return found || 'general';
}
