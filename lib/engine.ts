import { StateGraph, START, END } from '@langchain/langgraph';
import OpenAI from 'openai';
import { 
  buildStrategistPrompt, 
  buildSkepticPrompt, 
  buildOperatorPrompt, 
  buildSynthesizerPrompt 
} from './prompts';
import { DecisionBlueprint } from './types';
import { getMockBlueprint } from './mocks';

// Define the state shape
// Define the state shape
interface AgentState {
  problem: string;
  language: string;
  strategistAnalysis: string;
  skepticAnalysis: string;
  operatorAnalysis: string;
  finalBlueprint: DecisionBlueprint | null;
}

const openai = new OpenAI();

// Node functions
async function detectionNode(state: AgentState): Promise<Partial<AgentState>> {
  // If language was already forced/provided as an override (not default 'English'), skip detection
  if (state.language && state.language !== 'English') {
    return { language: state.language };
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini', // Lightweight model for detection
    messages: [{ 
      role: 'system', 
      content: 'Identify the language of the user input. Respond with ONLY the language name in English (e.g., "Russian", "English", "Spanish", "German").' 
    }, { 
      role: 'user', 
      content: state.problem 
    }],
    temperature: 0,
  });
  const language = response.choices[0]?.message?.content?.trim() || 'English';
  return { language };
}

async function strategistNode(state: AgentState): Promise<Partial<AgentState>> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: buildStrategistPrompt(state.problem, state.language) }],
    temperature: 0.7,
  });
  return { strategistAnalysis: response.choices[0]?.message?.content || '' };
}

async function skepticNode(state: AgentState): Promise<Partial<AgentState>> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: buildSkepticPrompt(state.problem, state.strategistAnalysis, state.language) }],
    temperature: 0.7,
  });
  return { skepticAnalysis: response.choices[0]?.message?.content || '' };
}

async function operatorNode(state: AgentState): Promise<Partial<AgentState>> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: buildOperatorPrompt(state.problem, state.strategistAnalysis, state.skepticAnalysis, state.language) }],
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
        state.operatorAnalysis,
        state.language
      ) 
    }],
    temperature: 0.5,
  });
  
  const rawContent = response.choices[0]?.message?.content || '{}';
  const blueprint = JSON.parse(rawContent);
  blueprint.language = state.language;
  return { finalBlueprint: blueprint };
}

// Build the graph
const workflow = new StateGraph<AgentState>({
  channels: {
    problem: { value: (a, b) => b, default: () => '' },
    language: { value: (a, b) => b, default: () => 'English' },
    strategistAnalysis: { value: (a, b) => b, default: () => '' },
    skepticAnalysis: { value: (a, b) => b, default: () => '' },
    operatorAnalysis: { value: (a, b) => b, default: () => '' },
    finalBlueprint: { value: (a, b) => b, default: () => null },
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

export const engine = workflow.compile();

export async function solveDecision(problem: string, overrideLanguage?: string): Promise<DecisionBlueprint> {
  try {
    // If language is provided and not 'auto', we can skip detection or force it
    const startLanguage = (overrideLanguage && overrideLanguage !== 'auto') ? overrideLanguage : 'English';
    
    const result = await engine.invoke({ 
      problem,
      language: startLanguage,
      strategistAnalysis: '',
      skepticAnalysis: '',
      operatorAnalysis: '',
      finalBlueprint: null
    }, {
      // If we have an override, we could technically skip the 'detect' node
      // but for simplicity and robustness we'll just let it run or force the state
    });

    // Force the override language if it was explicitly selected by user
    if (overrideLanguage && overrideLanguage !== 'auto' && result.finalBlueprint) {
      result.finalBlueprint.language = overrideLanguage;
    }
    
    if (!result.finalBlueprint) {
      throw new Error('Engine failed to generate a final blueprint.');
    }
    
    return result.finalBlueprint;
  } catch (error: any) {
    console.error('Real Engine failed, falling back to Demo Mode:', error.message);
    
    // Check if it's a quota/API error to provide a specific log
    if (error.message?.includes('429') || error.message?.includes('quota')) {
      console.warn('OPENAI QUOTA EXCEEDED: Engaging Demo Simulation Mode.');
    }
    
    return getMockBlueprint(problem);
  }
}
