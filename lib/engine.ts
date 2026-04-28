import { StateGraph, START, END } from '@langchain/langgraph';
import OpenAI from 'openai';
import {
  buildStrategistPrompt,
  buildSkepticPrompt,
  buildOperatorPrompt,
  buildSynthesizerPrompt,
  buildReviewSynthesizerPrompt,
  buildModeSystemPrompt,
} from './prompts';
import { DecisionBlueprint, CouncilMetrics, ScenarioBranch } from './types';
import { getMockBlueprint } from './mocks';
import { semanticVerdictForQuestion, shouldRejectDecisionOutput } from './semantic-guards';

// Define the state shape
interface AgentState {
  problem: string;
  language: string;
  memoryContext: string;
  conversationContext: string; // injected from prior conversation thread
  mode: string;
  strategistAnalysis: string;
  skepticAnalysis: string;
  operatorAnalysis: string;
  finalBlueprint: DecisionBlueprint | null;
}

function logPrompt(label: string, prompt: string): void {
  if (process.env.NODE_ENV !== 'development') return;
  console.info(`[SolveOS prompt:${label}]`, prompt);
}

function blueprintOutputText(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return '';
  }
}

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured.');
  }

  openaiClient ??= new OpenAI({ apiKey });
  return openaiClient;
}

function normalizeLanguage(language?: string): string {
  const value = typeof language === 'string' ? language.trim() : '';
  const lower = value.toLowerCase();

  if (!value || lower === 'auto' || lower === 'en' || lower === 'english') return 'English';
  if (lower === 'ru' || lower === 'russian') return 'Russian';
  if (lower === 'de' || lower === 'german') return 'German';
  if (lower === 'es' || lower === 'spanish') return 'Spanish';
  if (lower === 'ar' || lower === 'arabic') return 'Arabic';
  if (lower === 'zh' || lower === 'chinese') return 'Chinese';

  return value;
}

/**
 * Calculate council metrics from agent analyses
 * Measures confidence, agreement, feasibility, and debate intensity
 */
function calculateCouncilMetrics(
  strategistAnalysis: string,
  skepticAnalysis: string,
  operatorAnalysis: string
): CouncilMetrics {
  // Heuristic scoring: longer, more confident analyses score higher
  const strategistConfidence = Math.min(100, 40 + (strategistAnalysis.length / 50));
  
  // Agreement: measure of skeptic challenging strategist (simulated)
  const disagreementIndicators = ['but', 'however', 'risk', 'problem', 'fail', 'unlikely'];
  const disagreementCount = disagreementIndicators.filter(
    word => skepticAnalysis.toLowerCase().includes(word)
  ).length;
  const skepticAgreement = Math.max(-50, 50 - disagreementCount * 10);
  
  // Feasibility: measure of operator confidence in execution
  const feasibilityIndicators = ['can', 'achieve', 'implement', 'deliver', 'execute', 'timeline'];
  const feasibilityCount = feasibilityIndicators.filter(
    word => operatorAnalysis.toLowerCase().includes(word)
  ).length;
  const operatorFeasibility = Math.min(100, 30 + feasibilityCount * 15);
  
  // Consensus: average of above (normalized to 0-100)
  const consensusScore = Math.round(
    (strategistConfidence + Math.max(0, skepticAgreement) + operatorFeasibility) / 3
  );
  
  // Debate intensity: based on skeptic's pushback
  const debateIntensity = Math.min(100, Math.abs(skepticAgreement) * 2);
  
  // Extract key disagreements
  const keyDisagreements: string[] = [];
  if (skepticAgreement < -20) {
    keyDisagreements.push('Skeptic questions core assumptions');
  }
  if (operatorFeasibility < 40) {
    keyDisagreements.push('Operator flags execution complexity');
  }
  if (debateIntensity > 60) {
    keyDisagreements.push('Significant debate on risk/reward');
  }

  return {
    strategistConfidence: Math.round(strategistConfidence),
    skepticAgreement: Math.round(skepticAgreement),
    operatorFeasibility: Math.round(operatorFeasibility),
    consensusScore,
    debateIntensity: Math.round(debateIntensity),
    keyDisagreements,
    resolutionPath: buildResolutionPath(consensusScore, debateIntensity),
  };
}

/**
 * Build a resolution path based on council metrics
 */
function buildResolutionPath(consensus: number, intensity: number): string {
  if (consensus > 75) {
    return 'Strong agreement across council: Proceed with confidence.';
  } else if (consensus > 50 && intensity < 50) {
    return 'Moderate agreement with manageable risks: Pilot with safeguards.';
  } else if (consensus > 50 && intensity > 50) {
    return 'Consensus exists but significant debate: Require explicit risk acknowledgment.';
  } else {
    return 'Weak consensus: Recommend extended deliberation before commitment.';
  }
}

/**
 * Generate scenario branches for risk mapping and planning
 */
function generateScenarioBranches(score: number): ScenarioBranch[] {
  const branches: ScenarioBranch[] = [
    {
      id: 'scenario-bull',
      name: 'Bull Case (Best Execution)',
      probability: Math.round((score / 100) * 40),
      upside: 500, // 5% upside in basis points
      downside: -50,
      timeline: '6-12 months',
      description: 'Everything goes right: team executes perfectly, market tailwinds, first-mover advantage',
    },
    {
      id: 'scenario-base',
      name: 'Base Case (Plan)',
      probability: 40,
      upside: 150,
      downside: -100,
      timeline: '3-6 months',
      description: 'Normal execution with expected challenges and market headwinds',
    },
    {
      id: 'scenario-bear',
      name: 'Bear Case (Stress Test)',
      probability: 20 - Math.round((score / 100) * 15),
      upside: -200,
      downside: -800,
      timeline: '1-3 months',
      description: 'Key assumption breaks: market rejects solution, team churn, competitive response',
    },
    {
      id: 'scenario-tail',
      name: 'Tail Risk (Black Swan)',
      probability: Math.max(1, 10 - Math.round((score / 100) * 8)),
      upside: -1000,
      downside: -5000,
      timeline: 'Immediate',
      description: 'Catastrophic failure: regulatory ban, security breach, founder departure',
    },
  ];

  return branches.filter(b => b.probability > 0);
}

/**
 * Calculate risk map coordinates (opportunity vs risk)
 */
function calculateRiskMap(score: number, skepticAgreement: number): { opportunity: number; risk: number } {
  const opportunity = Math.round((score / 100) * 100); // 0-100 based on score
  const risk = Math.round(Math.max(0, 100 - (skepticAgreement + 100) / 2)); // 0-100 based on skeptic
  return { opportunity, risk };
}

// Node functions
async function detectionNode(state: AgentState): Promise<Partial<AgentState>> {
  const currentLanguage = normalizeLanguage(state.language);
  if (currentLanguage && currentLanguage !== 'English') {
    return { language: currentLanguage };
  }

  const response = await getOpenAIClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ 
      role: 'system', 
      content: 'Identify the language of the user input. Respond with ONLY the language name in English (e.g., "Russian", "English", "Spanish", "German").' 
    }, { 
      role: 'user', 
      content: state.problem 
    }],
    temperature: 0,
  });
  const language = normalizeLanguage(response.choices[0]?.message?.content?.trim());
  return { language };
}

async function strategistNode(state: AgentState): Promise<Partial<AgentState>> {
  const language = normalizeLanguage(state.language);
  const systemPrompt = buildModeSystemPrompt(state.mode);
  const userPrompt = buildStrategistPrompt(state.problem || '', language, state.memoryContext || undefined);
  logPrompt(`strategist:${state.mode}`, `${systemPrompt}\n\n${userPrompt}`);
  const response = await getOpenAIClient().chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.9,
    top_p: 0.95,
  });
  return { strategistAnalysis: response.choices[0]?.message?.content || '' };
}

async function skepticNode(state: AgentState): Promise<Partial<AgentState>> {
  const language = normalizeLanguage(state.language);
  const systemPrompt = buildModeSystemPrompt(state.mode);
  const userPrompt = buildSkepticPrompt(state.problem || '', state.strategistAnalysis || '', language);
  logPrompt(`skeptic:${state.mode}`, `${systemPrompt}\n\n${userPrompt}`);
  const response = await getOpenAIClient().chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.9,
    top_p: 0.95,
  });
  return { skepticAnalysis: response.choices[0]?.message?.content || '' };
}

async function operatorNode(state: AgentState): Promise<Partial<AgentState>> {
  const language = normalizeLanguage(state.language);
  const systemPrompt = buildModeSystemPrompt(state.mode);
  const userPrompt = buildOperatorPrompt(state.problem || '', state.strategistAnalysis || '', state.skepticAnalysis || '', language);
  logPrompt(`operator:${state.mode}`, `${systemPrompt}\n\n${userPrompt}`);
  const response = await getOpenAIClient().chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.85,
    top_p: 0.95,
  });
  return { operatorAnalysis: response.choices[0]?.message?.content || '' };
}

async function synthesizerNode(state: AgentState): Promise<Partial<AgentState>> {
  const language = normalizeLanguage(state.language);
  const systemPrompt = buildModeSystemPrompt(state.mode);
  const isReview = state.mode === 'Review';
  const basePrompt = isReview
    ? buildReviewSynthesizerPrompt(
        state.problem || '',
        state.strategistAnalysis || '',
        state.skepticAnalysis || '',
        state.operatorAnalysis || '',
        language,
        state.memoryContext || undefined,
        state.conversationContext || undefined,
      )
    : buildSynthesizerPrompt(
        state.problem || '',
        state.strategistAnalysis || '',
        state.skepticAnalysis || '',
        state.operatorAnalysis || '',
        language,
        state.memoryContext || undefined,
        state.conversationContext || undefined,
        state.mode || 'Strategy',
      );

  const createBlueprint = async (prompt: string) => {
    logPrompt(`synthesizer:${state.mode}`, `${systemPrompt}\n\n${prompt}`);
    const response = await getOpenAIClient().chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
      top_p: 0.95,
    });

    return JSON.parse(response.choices[0]?.message?.content || '{}');
  };

  let blueprint = await createBlueprint(basePrompt);

  if (isReview) {
    // Enforce: review output must NOT contain a verdict class in the recommendation field.
    const rec = String(blueprint.recommendation || '');
    const hasVerdictClass = ['Full Commit', 'Reversible Experiment', 'Delay', 'Kill The Idea']
      .some(cls => rec.includes(cls));
    const hasMilestoneTable = Array.isArray(blueprint.milestoneTable) && blueprint.milestoneTable.length > 0;
    if (hasVerdictClass || !hasMilestoneTable) {
      blueprint = await createBlueprint(`${basePrompt}

REGENERATE ONCE:
Your prior response violated REVIEW MODE rules.
${hasVerdictClass ? 'The recommendation field MUST NOT contain "Full Commit", "Reversible Experiment", "Delay", or "Kill The Idea". It MUST start with "Review:".' : ''}
${!hasMilestoneTable ? 'The milestoneTable array was missing or empty. You MUST return milestoneTable with exactly 3 rows: 30 days, 60 days, 90 days.' : ''}
Return ONLY the JSON object. No verdict classes anywhere.`);
    }
  } else if (shouldRejectDecisionOutput(state.problem || '', blueprintOutputText(blueprint))) {
    blueprint = await createBlueprint(`${basePrompt}

REGENERATE ONCE:
The prior JSON was rejected because it was generic or contradicted the user's question.
The new recommendation must be derived from the exact decision question.
The recommendation must start with exactly one verdict class: Full Commit, Reversible Experiment, Delay, or Kill The Idea.
If the question mentions quitting a job, discuss employment and runway risk.
If the question mentions shutting down a product, discuss shutting down or winding down the product.
Never output the old repeated generic verdict or any "measured/phased/balanced" compromise language.`);
  }

  blueprint.language = language;
  if (isReview) {
    blueprint.isReviewMode = true;
    // Final safety: if recommendation still contains a verdict class after retry, replace it.
    const finalRec = String(blueprint.recommendation || '');
    const stillHasVerdict = ['Full Commit', 'Reversible Experiment', 'Delay', 'Kill The Idea']
      .some(cls => finalRec.includes(cls));
    if (stillHasVerdict || !finalRec.startsWith('Review:')) {
      blueprint.recommendation = 'Review: Milestone assessment — see scorecard below for 30/60/90-day checkpoint analysis.';
    }
  }

  // Add enterprise features
  const council = calculateCouncilMetrics(
    state.strategistAnalysis,
    state.skepticAnalysis,
    state.operatorAnalysis
  );

  blueprint.council = council;
  blueprint.score = Math.min(100, Math.max(0, Number(blueprint.confidenceScore ?? blueprint.score) || 68));
  blueprint.confidenceScore = blueprint.score;
  if (!isReview && shouldRejectDecisionOutput(state.problem || '', blueprintOutputText(blueprint))) {
    blueprint.recommendation = semanticVerdictForQuestion(state.problem || '', state.mode);
  }
  blueprint.scenarioBranches = generateScenarioBranches(blueprint.score);
  blueprint.riskMap = calculateRiskMap(blueprint.score, council.skepticAgreement);
  
  return { finalBlueprint: blueprint };
}

let compiledEngine: ReturnType<ReturnType<typeof buildWorkflow>['compile']> | null = null;

function buildWorkflow() {
  return new StateGraph<AgentState>({
    channels: {
      problem: { value: (_a, b) => b, default: () => '' },
      language: { value: (_a, b) => b, default: () => 'English' },
      memoryContext: { value: (_a, b) => b, default: () => '' },
      conversationContext: { value: (_a, b) => b, default: () => '' },
      mode: { value: (_a, b) => b, default: () => 'Strategy' },
      strategistAnalysis: { value: (_a, b) => b, default: () => '' },
      skepticAnalysis: { value: (_a, b) => b, default: () => '' },
      operatorAnalysis: { value: (_a, b) => b, default: () => '' },
      finalBlueprint: { value: (_a, b) => b, default: () => null },
    }
  })
    .addNode('detect', detectionNode)
    .addNode('strategist', strategistNode)
    .addNode('skeptic', skepticNode)
    .addNode('operator', operatorNode)
    .addNode('synthesizer', synthesizerNode)
    .addEdge(START, 'detect')
    .addEdge('detect', 'strategist')
    .addEdge('strategist', 'skeptic')
    .addEdge('skeptic', 'operator')
    .addEdge('operator', 'synthesizer')
    .addEdge('synthesizer', END);
}

function getEngine() {
  compiledEngine ??= buildWorkflow().compile();
  return compiledEngine;
}

export async function solveDecision(
  problem: string,
  overrideLanguage?: string,
  memoryContext?: string,
  conversationContext?: string,
  mode: string = 'Strategy'
): Promise<DecisionBlueprint> {
  try {
    const startLanguage = normalizeLanguage(overrideLanguage || 'en');
    const safeProblem = typeof problem === 'string' ? problem : '';

    const result = await getEngine().invoke({
      problem: safeProblem,
      language: startLanguage,
      memoryContext: memoryContext || '',
      conversationContext: conversationContext || '',
      mode,
      strategistAnalysis: '',
      skepticAnalysis: '',
      operatorAnalysis: '',
      finalBlueprint: null
    }) as unknown as AgentState;

    if (result.finalBlueprint) {
      result.finalBlueprint.language = normalizeLanguage(result.finalBlueprint.language || startLanguage);
    }
    
    if (!result.finalBlueprint) {
      throw new Error('Engine failed to generate a final blueprint.');
    }
    
    return result.finalBlueprint;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Real Engine failed, falling back to Demo Mode:', errorMessage);
    
    if (errorMessage.includes('429') || errorMessage.includes('quota')) {
      console.warn('OPENAI QUOTA EXCEEDED: Engaging Demo Simulation Mode.');
    }
    
    const finalLanguage = normalizeLanguage(overrideLanguage || 'en');
    const safeProblem = typeof problem === 'string' ? problem : '';
    return getMockBlueprint(safeProblem, finalLanguage, mode);
  }
}
