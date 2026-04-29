# SolveOS

The Operating System for High-Stakes Decisions.

Every decision makes the next one smarter.

SolveOS helps users simulate outcomes, expose risks, and make better decisions using strategic agents, confidence calibration, and decision memory.

## Product goal

SolveOS helps founders and teams turn confusing, high-stakes choices into clear decision blueprints. The goal is to reduce guesswork by combining AI analysis, risk review, and memory from past outcomes.

## What it does

- Simulates strategic decisions
- Shows success, downside, and black swan risk
- Explains why confidence changed
- Learns from past outcomes
- Builds decision memory over time

## Core features

- Decision Engine: turns user context into a recommendation, risks, and next steps.
- Memory Graph: connects past decisions, lessons, and outcomes.
- Outcome Flywheel: uses real-world results to improve future decisions.
- Multilingual support: lets users ask and receive answers in their preferred language.

## User flow

1. User enters a decision question and important context.
2. SolveOS asks for missing details when needed.
3. AI advisors analyze the decision from strategy, risk, and execution angles.
4. The system returns a clear decision blueprint.
5. The user later records the real outcome so future recommendations improve.

## Technical overview

The project uses Next.js, TypeScript, Tailwind CSS, and planned AI orchestration with OpenAI and LangGraph. The current app focuses on a decision workspace, blueprint output, and a structure that can grow into memory, sharing, and multilingual features.

## Roadmap

1. Stabilize the decision input and blueprint experience.
2. Add stronger AI advisor logic and confidence scoring.
3. Build memory and outcome tracking.
4. Add sharing, exports, and team workflows.

## Core idea

Most AI tools answer once.  
SolveOS improves after every decision.

## Homework specs

Teacher-facing specs are available in the `specs/` folder, with the main work plan in `PLAN.md`.

## Demo

Coming soon: SolveOS v1 demo.

## v1-review-routing-fixed

- Fixed review vs verdict routing
- Added 30/60/90 milestone scorecards
- Added review mode hard routing fallback
- Regression prompts passing

## Status

Alpha v1
