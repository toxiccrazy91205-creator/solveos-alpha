export const TYPES_STABLE = true;
export interface SolveRequest {
  problem: string;
  language?: string;
}

export interface AgentAnalysis {
  persona: string;
  content: string;
  riskLevel?: 'Low' | 'Medium' | 'High' | 'Critical';
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
}

export interface SolveResponse {
  result: DecisionBlueprint | null;
  error?: string;
}

export interface DecisionMemoryEntry {
  id: string;
  timestamp: string;
  problem: string;
  blueprint: DecisionBlueprint;
}
