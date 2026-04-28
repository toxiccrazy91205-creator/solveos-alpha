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
  similarSuccessRate?: number;
  evidence?: ConfidenceEvidence[];
}

export interface ConfidenceEvidence {
  decisionId: string;
  problem: string;
  predictedConfidence: number;
  actualOutcome: string;
  actualConfidence: number;
  calibrationOffset: number;
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
  mode?: 'Strategy' | 'Risk' | 'Scenarios' | 'Red Team' | 'Review';
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

export interface CounterfactualPath {
  name: string;
  probability: 'Low' | 'Medium' | 'High';
  impact: number;
  confidence: number;
  likelyUpside?: string;
  keyFailureMode?: string;
  reducedRisk?: string;
  opportunityCost?: string;
  probableDownside?: string;
  hiddenRiskAccumulation?: string;
}

export interface PreMortemRisk {
  mode: string;
  riskTrigger: string;
  earlyWarningSignal: string;
  mitigationMove: string;
}

export interface SecondOrderEffect {
  scenario: string;
  immediateEffect: string;
  downstreamConsequence: string;
  hiddenLongTermEffect: string;
}

export interface WarRoomDebate {
  strategist: string;
  skeptic: string;
  operator: string;
  redTeam: string;
  finalSynthesis: {
    survivesDebate: string;
    breaks: string;
    recommendedMoveAfterDebate: string;
  };
}

export interface ExecutionPlanWeek {
  week: string;
  objective: string;
  experiment: string;
  metric: string;
  killCriteria: string;
  goNoGoThreshold: string;
}

export interface DecisionBlueprint {
  score: number;
  recommendation: string;
  hiddenPain?: string;
  strategistView?: {
    biggestUpside: string;
    leverageMove: string;
  };
  skepticView?: {
    hiddenFlaw: string;
    whatCouldBreak: string;
  };
  operatorNextSteps?: string[];
  redTeamCritique?: string;
  economistView?: string;
  counterfactualPaths?: CounterfactualPath[];
  preMortemRisks?: PreMortemRisk[];
  secondOrderEffects?: SecondOrderEffect[];
  warRoomDebate?: WarRoomDebate;
  executionPlan?: ExecutionPlanWeek[];
  confidenceScore?: number;
  outcomeLessonPrompt?: string;
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
  // Review Mode
  isReviewMode?: boolean;
  milestoneTable?: MilestoneMetric[];
  verdictAccuracy?: number; // 0-100: was the verdict directionally correct?
  // System-level accuracy (populated per-response from historical outcomes)
  decisionAccuracy?: number;
  calibrationScore?: number;
  // Enterprise features
  council?: CouncilMetrics;
  riskMap?: { opportunity: number; risk: number };
  scenarioBranches?: ScenarioBranch[];
  confidenceDrivers?: {
    baseConfidence: number;
    priorOutcomesAdjustment: number;
    similarSuccessRate?: number;
    riskPenalty: number;
    finalConfidence: number;
    sampleSize: number;
    evidence?: ConfidenceEvidence[];
  };
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
  decisionAccuracy?: number;
  calibrationScore?: number;
}

export interface DecisionOutcome {
  decisionId: string;
  actualOutcome: string;
  scoreAccuracy: number; // How accurate was the score? 0-100
  verdictAccuracy?: number; // 0-100: was the verdict CLASS directionally correct?
  timestamp: string;
  lessons: string[];
  recommendations: string[];
}

export interface PendingReview {
  reviewType: '30day' | '60day' | '90day';
  scheduledFor: string; // ISO date string
  createdAt: string;
}

export type MilestoneStatus = 'on_track' | 'behind' | 'exceeded' | 'failed' | 'unknown';

export interface MilestoneMetric {
  horizon: '30 days' | '60 days' | '90 days';
  milestone: string;
  status: MilestoneStatus;
  metric: string;
  evidence: string;
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
