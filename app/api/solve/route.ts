import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { buildSolvePrompt } from '@/lib/prompts';
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

    const completion = await new OpenAI().chat.completions.create({
      model: 'gpt-4o', 
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You are an expert decision-making AI.' },
        { role: 'user', content: buildSolvePrompt(body.problem.trim()) }
      ],
      temperature: 0.7,
    });

    const rawContent = completion.choices[0]?.message?.content || '{}';
    let result;
    try {
      result = JSON.parse(rawContent);
    } catch (e) {
      result = rawContent;
    }

    return NextResponse.json({ result } as SolveResponse);
  } catch (error: any) {
    console.error('API /api/solve error:', error);
    return NextResponse.json(
      { error: error?.message || 'An unexpected error occurred while processing your decision.' },
      { status: 500 }
    );
  }
}
