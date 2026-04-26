import { StateGraph, START, END } from '@langchain/langgraph';
import OpenAI from 'openai';
import { 
  buildStrategistPrompt, 
  buildSkepticPrompt, 
  buildOperatorPrompt, 
  buildSynthesizerPrompt 
} from './prompts';
import { DecisionBlueprint } from './types';

// Define the state shape
interface AgentState {
  problem: string;
  strategistAnalysis: string;
  skepticAnalysis: string;
  operatorAnalysis: string;
  finalBlueprint: DecisionBlueprint | null;
}

const openai = new OpenAI();

// Node functions
async function strategistNode(state: AgentState): Promise<Partial<AgentState>> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: buildStrategistPrompt(state.problem) }],
    temperature: 0.7,
  });
  return { strategistAnalysis: response.choices[0]?.message?.content || '' };
}

async function skepticNode(state: AgentState): Promise<Partial<AgentState>> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: buildSkepticPrompt(state.problem, state.strategistAnalysis) }],
    temperature: 0.7,
  });
  return { skepticAnalysis: response.choices[0]?.message?.content || '' };
}

async function operatorNode(state: AgentState): Promise<Partial<AgentState>> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: buildOperatorPrompt(state.problem, state.strategistAnalysis, state.skepticAnalysis) }],
    temperature: 0.7,
  });
  return { operatorAnalysis: response.choices[0]?.message?.content || '' };
}

async function synthesizerNode(state: AgentState): Promise<Partial<AgentState>> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [{ 
      role: 'user', 
      content: buildSynthesizerPrompt(
        state.problem, 
        state.strategistAnalysis, 
        state.skepticAnalysis, 
        state.operatorAnalysis
      ) 
    }],
    temperature: 0.5,
  });
  
  const rawContent = response.choices[0]?.message?.content || '{}';
  return { finalBlueprint: JSON.parse(rawContent) };
}

// Build the graph
const workflow = new StateGraph<AgentState>({
  channels: {
    problem: { value: (a, b) => b, default: () => '' },
    strategistAnalysis: { value: (a, b) => b, default: () => '' },
    skepticAnalysis: { value: (a, b) => b, default: () => '' },
    operatorAnalysis: { value: (a, b) => b, default: () => '' },
    finalBlueprint: { value: (a, b) => b, default: () => null },
  }
})
  .addNode('strategist', strategistNode)
  .addNode('skeptic', skepticNode)
  .addNode('operator', operatorNode)
  .addNode('synthesizer', synthesizerNode)
  .addEdge(START, 'strategist')
  .addEdge('strategist', 'skeptic')
  .addEdge('skeptic', 'operator')
  .addEdge('operator', 'synthesizer')
  .addEdge('synthesizer', END);

export const engine = workflow.compile();

export async function solveDecision(problem: string): Promise<DecisionBlueprint> {
  const result = await engine.invoke({ 
    problem,
    strategistAnalysis: '',
    skepticAnalysis: '',
    operatorAnalysis: '',
    finalBlueprint: null
  });
  
  if (!result.finalBlueprint) {
    throw new Error('Engine failed to generate a final blueprint.');
  }
  
  return result.finalBlueprint;
}
