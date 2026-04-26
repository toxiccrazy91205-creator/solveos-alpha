import { NextResponse } from 'next/server';
import { solveDecision } from '@/lib/engine';
import { saveDecision } from '@/lib/memory';
import { SolveRequest, SolveResponse } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const body: SolveRequest = await req.json();
    
    if (!body.problem || body.problem.trim().length < 10) {
      return NextResponse.json(
        { error: 'Problem description must be at least 10 characters long.' },
        { status: 400 }
      );
    }

    // Run the multi-agent engine
    const blueprint = await solveDecision(body.problem.trim(), body.language);

    // Save to memory foundation
    await saveDecision({
      problem: body.problem.trim(),
      blueprint
    });

    return NextResponse.json({ result: blueprint } as SolveResponse);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred while processing your decision.';
    console.error('API /api/solve error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
