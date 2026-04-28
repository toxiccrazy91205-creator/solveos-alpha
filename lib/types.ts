export const TYPES_STABLE = true;

// ─── Memory Graph ───────────────────────────────────────────────────────────

export interface DecisionEdge {
  targetId: string;
  weight: number; // 0–1 connection strength
  type: 'similar_problem' | 'same_domain' | 'outcome_correlated' | 'pattern_member';
}

export interface StrategicPattern {
  id: string;
  name: string;
  description: string;
  frequency: number;
  avgScore: number;
  avgOutcomeAccuracy: number;
  decisionIds: string[];
  signal: 'positive' | 'negative' | 'neutral';
  lesson: string;
  dominantTags: string[];
}

export interface MemoryGraphNode {
  id: string;
  problem: string;
  timestamp: string;
  score: number;
  domain: string;
  hasOutcome: boolean;
  outcomeAccuracy?: number;
  edges: DecisionEdge[];
  strategicScore: number;
  tags: string[];
}

export interface MemoryGraph {
  nodes: MemoryGraphNode[];
  patterns: StrategicPattern[];
  totalDecisions: number;
  strategicMemoryScore: number; // 0–100 compound intelligence score
  topDomains: Record<string, number>;
  accuracyTrend: number[];
  lessonsLearned: string[];
  predictionImprovement: number; // % accuracy gain: first half vs second half of outcomes
}

export interface MemoryIntelligence {
  relevantDecisions: DecisionMemoryEntry[];
  applicablePatterns: StrategicPattern[];
  lessons: string[];
  warningFlags: string[];
  strategicContext: string; // formatted string for agent prompt injection
  memoryScore: number;
}

// ─── Network Intelligence (cross-decision aggregate layer) ────────────────────

export interface DomainBenchmark {
  domain: string;
  totalDecisions: number;
  avgConfidence: number;
  avgOutcomeAccuracy: number; // -1 when no outcomes recorded
  successRate: number; // % of recorded outcomes at or above 70; -1 when no outcomes recorded
  calibrationOffset: number; // avg(outcomeAccuracy - confidence) — negative = overconfident
}

export interface CalibrationBucket {
  scoreRange: [number, number];
  sampleCount: number; // decisions with outcomes in this range
  avgPredicted: number;
  avgActual: number; // -1 when no outcomes
  offset: number; // avgActual - avgPredicted
}

export interface TrendPoint {
  label: string; // ISO week or month label
  value: number;
}

export interface NetworkIntelligence {
  totalDecisions: number;
  totalOutcomes: number;
  networkScore: number; // 0–100 compound network intelligence
  domainBenchmarks: DomainBenchmark[];
  calibrationBuckets: CalibrationBucket[];
  volumeTrend: TrendPoint[]; // decisions per week, last 12 weeks
  accuracyTrend: TrendPoint[]; // avg outcome accuracy per month, last 6
  topInsights: string[];
  calibrationDrift: number; // avg absolute offset across all buckets with data
  predictionImprovement: number; // % improvement: earlier half vs later half of outcomes
}

export interface CalibrationResult {
  calibratedScore: number;
  rawScore: number;
  offset: number;
  sampleSize: number;
  confidence: 'high' | 'medium' | 'low' | 'none';
}

export interface ConversationTurn {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  blueprint?: DecisionBlueprint;
  isError?: boolean;
  timestamp: number;
}

export interface SolveRequest {
  problem: string;
  language?: string;
  context?: DecisionContext;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface DecisionContext {
  domain: string; // e.g., 'business', 'career', 'strategic'
  stakeholders: string[];
  timeHorizon: string; // e.g., 'immediate', 'quarterly', 'annual'
  constraints: string[];
}

export interface AgentAnalysis {
  persona: string;
  content: string;
  riskLevel?: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface CouncilMetrics {
  strategistConfidence: number; // 0-100
  skepticAgreement: number; // -100 (strong disagreement) to 100 (strong agreement)
  operatorFeasibility: number; // 0-100
  consensusScore: number; // Average of above
  debateIntensity: number; // 0-100
  keyDisagreements: string[];
  resolutionPath: string;
}

export interface DecisionBlueprint {
  score: number;
  recommendation: string;
  diagnosis: {
    coreProblem: string;
    blindSpots: string;
    keyRisks: string;
  };
  paths: {
    safe: { description: string; pros: string[]; cons: string[] };
    balanced: { description: string; pros: string[]; cons: string[] };
    bold: { description: string; pros: string[]; cons: string[] };
  };
  contrarianInsight: {
    perspective: string;
    hiddenOpportunity: string;
    uncomfortableTruth: string;
  };
  futureSimulation: {
    threeMonths: string;
    twelveMonths: string;
  };
  actionPlan: {
    today: string;
    thisWeek: string;
    thirtyDays: string;
  };
  language?: string;
  isDemo?: boolean;
  // Enterprise features
  council?: CouncilMetrics;
  riskMap?: { opportunity: number; risk: number };
  scenarioBranches?: ScenarioBranch[];
}

export interface ScenarioBranch {
  id: string;
  name: string;
  probability: number;
  upside: number; // potential upside in basis points
  downside: number; // potential downside in basis points
  timeline: string;
  description: string;
}

export interface SolveResponse {
  result: DecisionBlueprint | null;
  error?: string;
  decisionId?: string;
  memoryScore?: number;
  networkScore?: number;
  calibratedScore?: number;
  calibrationOffset?: number;
  calibrationSampleSize?: number;
  calibrationConfidence?: 'high' | 'medium' | 'low' | 'none';
}

export interface DecisionOutcome {
  decisionId: string;
  actualOutcome: string;
  scoreAccuracy: number; // How accurate was the score? 0-100
  timestamp: string;
  lessons: string[];
  recommendations: string[];
}

export interface PendingReview {
  reviewType: '7day' | '30day';
  scheduledFor: string; // ISO date string
  createdAt: string;
}

export interface DecisionMemoryEntry {
  id: string;
  timestamp: string;
  problem: string;
  blueprint: DecisionBlueprint;
  context?: DecisionContext;
  outcome?: DecisionOutcome;
  pendingReview?: PendingReview;
  tags: string[]; // For domain/category classification
  similarity?: number; // Similarity to current problem (0-100)
}
