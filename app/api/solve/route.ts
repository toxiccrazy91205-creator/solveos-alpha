import { NextResponse } from 'next/server';
import { solveDecision } from '@/lib/engine';
import { saveDecision, getDecisionHistory } from '@/lib/memory';
import { getMemoryIntelligenceFromHistory } from '@/lib/memory-graph';
import { computeNetworkIntelligence, calibrateScore, buildCalibrationContext } from '@/lib/benchmarks';
import { SolveRequest, SolveResponse } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const body: SolveRequest = await req.json();

    if (!body.problem || !body.problem.trim()) {
      return NextResponse.json(
        { error: 'Decision description is required.' },
        { status: 400 }
      );
    }

    if (body.problem.trim().length < 20) {
      return NextResponse.json(
        { error: `Decision details must be at least 20 characters. Current: ${body.problem.trim().length} characters.` },
        { status: 400 }
      );
    }

    const problem = body.problem.trim();
    const domain = body.context?.domain;

    // Format conversation history into a context string for the synthesizer
    let conversationContext = '';
    if (body.conversationHistory && body.conversationHistory.length > 0) {
      conversationContext = body.conversationHistory
        .map((t, i) => `${i % 2 === 0 ? 'User' : 'Prior analysis'}: ${t.content}`)
        .join('\n');
    }

    // Read history once — used for both memory intelligence and calibration
    const history = await getDecisionHistory();

    // Build memory intelligence + calibration context from history
    let memoryContext = '';
    let memoryScore = 0;
    let networkScore = 0;
    let calibrationNote = '';

    try {
      const intel = getMemoryIntelligenceFromHistory(problem, history, body.context);
      memoryScore = intel.memoryScore;
      memoryContext = intel.strategicContext;

      const netIntel = computeNetworkIntelligence(history);
      networkScore = netIntel.networkScore;

      calibrationNote = buildCalibrationContext(history, domain);
    } catch {
      // degrade gracefully — proceed without enrichment
    }

    // Combine memory context + calibration note for agent injection
    const fullContext = [memoryContext, calibrationNote].filter(Boolean).join('\n\n');

    // Run the multi-agent engine
    const blueprint = await solveDecision(problem, body.language, fullContext, conversationContext);

    // Calibrate the raw confidence score against historical outcomes
    // Re-read history after potential updates — but use the pre-run snapshot for calibration
    const calibration = calibrateScore(blueprint.score, history, domain, problem, body.context);
    if (calibration.offset !== 0) {
      blueprint.score = calibration.calibratedScore;
      if (blueprint.riskMap) {
        blueprint.riskMap = {
          ...blueprint.riskMap,
          opportunity: calibration.calibratedScore,
        };
      }
    }

    // Persist to memory
    const saved = await saveDecision({ problem, blueprint, context: body.context });

    const response: SolveResponse = {
      result: blueprint,
      decisionId: saved.id,
      memoryScore,
      networkScore,
      calibratedScore: calibration.calibratedScore,
      calibrationOffset: calibration.offset,
      calibrationSampleSize: calibration.sampleSize,
      calibrationConfidence: calibration.confidence,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'An unexpected error occurred while processing your decision.';
    console.error('API /api/solve error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
