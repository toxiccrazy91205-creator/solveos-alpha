export interface SolveRequest {
  problem: string;
}

export interface SolveResponse {
  result: any;
  error?: string;
}
