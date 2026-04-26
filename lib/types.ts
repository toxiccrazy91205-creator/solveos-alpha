export interface SolveRequest {
  problem: string;
}

export interface AgentAnalysis {
  persona: string;
  content: string;
  riskLevel?: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface DecisionBlueprint {
  verdict: string;
  confidenceScore: number;
  riskMeter: 'Low' | 'Medium' | 'High' | 'Critical';
  strategistAnalysis: string;
  skepticAnalysis: string;
  operatorAnalysis: string;
  actionItems: string[];
}

export interface SolveResponse {
  result: DecisionBlueprint | any;
  error?: string;
}

export interface DecisionMemoryEntry {
  id: string;
  timestamp: string;
  problem: string;
  blueprint: DecisionBlueprint;
}
