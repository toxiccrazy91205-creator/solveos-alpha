const GENERIC_FRAGMENTS = [
  'proceed with a measured',
  'measured, phased',
  'measured phased',
  'balanced approach',
  'careful management',
  'proceed with caution',
  'it depends',
];

const VERDICT_CLASSES = [
  'Full Commit',
  'Reversible Experiment',
  'Delay',
  'Kill The Idea',
] as const;

export function containsGenericVerdict(text: string): boolean {
  const normalized = text.toLowerCase();
  return GENERIC_FRAGMENTS.some((fragment) => normalized.includes(fragment));
}

export function isPlanModeRequest(problem: string): boolean {
  const text = problem.toLowerCase();
  return [
    'define step by step',
    'step by step',
    'give plan',
    'roadmap',
    'experiment design',
    'action plan',
    '30-day experiment',
    '30 day experiment',
    'execution plan',
  ].some((trigger) => text.includes(trigger));
}

export function getVerdictClass(output: string): string {
  const normalized = output.trim().toLowerCase();
  return VERDICT_CLASSES.find((verdict) => {
    const lowerVerdict = verdict.toLowerCase();
    return normalized.startsWith(lowerVerdict) || normalized.includes(`"recommendation":"${lowerVerdict}`) || normalized.includes(`"recommendation": "${lowerVerdict}`);
  }) || '';
}

export function extractVerdictClass(text: string): string {
  const normalized = text.trim().toLowerCase();
  return VERDICT_CLASSES.find((v) => normalized.startsWith(v.toLowerCase())) || '';
}

export function detectVerdictLoop(
  conversationHistory: Array<{ role: string; content: string }>
): string | null {
  const assistantVerdicts = conversationHistory
    .filter((t) => t.role === 'assistant')
    .map((t) => extractVerdictClass(t.content))
    .filter(Boolean);

  if (assistantVerdicts.length < 2) return null;

  const last = assistantVerdicts[assistantVerdicts.length - 1];
  const secondLast = assistantVerdicts[assistantVerdicts.length - 2];
  return last === secondLast ? last : null;
}

export function buildForceDiversityInstruction(bannedVerdict: string): string {
  const alternates = (VERDICT_CLASSES as readonly string[]).filter((v) => v !== bannedVerdict);
  return `VERDICT DIVERSITY ENFORCEMENT:
"${bannedVerdict}" has appeared twice in this thread without resolution.
You MUST NOT use "${bannedVerdict}" as the verdict class.
You MUST choose one of: ${alternates.join(', ')}.

CONCRETE THRESHOLD MODE ACTIVE:
Return numeric milestones, not abstract advice.
- Every actionPlan field must include at least one number (e.g. "within 3 days", "10 qualified users", "50% activation rate", "$500 weekly budget cap").
- Every executionPlan goNoGoThreshold must name a specific number or percentage, not a qualitative phrase.
- The recommendation must state an explicit numeric condition for re-evaluation (e.g. "revisit if conversion drops below 20%").
- Do not use phrases like "consider", "may want to", "proceed with caution", or "monitor closely" without attaching a concrete number.`;
}

export function semanticVerdictExcluding(
  problem: string,
  mode: string,
  bannedVerdict: string
): string {
  const natural = semanticVerdictForQuestion(problem, mode);
  const naturalClass = extractVerdictClass(natural);
  if (naturalClass !== bannedVerdict) return natural;

  const alternates = (VERDICT_CLASSES as readonly string[]).filter((v) => v !== bannedVerdict);
  const fallback =
    mode === 'Red Team' || mode === 'Risk'
      ? alternates.find((v) => v === 'Kill The Idea') || alternates[0]
      : alternates[0];

  return `${fallback}: Prior verdict repeated twice without resolution. Define a numeric milestone (measurable users, revenue, or timeline) before returning to the same path.`;
}

export function hasValidVerdictClass(output: string): boolean {
  return getVerdictClass(output) !== '';
}

// ─── Intent classification ────────────────────────────────────────────────────

const CONTRARIAN_TRIGGERS = [
  'strongest argument against',
  'strongest case against',
  'best case against',
  'argue against',
  'argument against',
  'make the case against',
  'case against',
  'reasons not to',
  "why shouldn't i",
  'why should i not',
  'reasons to not',
  'strongest case for not',
  'case for not',
];

const CAPITAL_TRIGGERS = [
  'raise venture capital',
  'raise vc',
  'raise a round',
  'raise funding',
  'raise capital',
  'fundraise',
  'series a',
  'seed round',
  'investor capital',
  'vc round',
  'raise money from',
  'take investor',
];

const CONDITIONAL_TRIGGERS = [
  'under what conditions',
  'what conditions',
  'what would make',
  'when should i',
  'what threshold',
  'what metric',
  'at what point',
  'what criteria',
  'conditions for',
];

export type IntentClass = 'contrarian' | 'capital' | 'conditional' | 'standard';

export function classifyIntent(problem: string): IntentClass {
  const text = problem.toLowerCase();
  if (CONTRARIAN_TRIGGERS.some((t) => text.includes(t))) return 'contrarian';
  if (CAPITAL_TRIGGERS.some((t) => text.includes(t))) return 'capital';
  if (CONDITIONAL_TRIGGERS.some((t) => text.includes(t))) return 'conditional';
  return 'standard';
}

export function semanticVerdictForQuestion(problem: string, mode = 'Strategy'): string {
  const text = problem.toLowerCase();
  const isRedTeam = mode === 'Red Team';
  const intent = classifyIntent(problem);

  // Contrarian intent overrides all other routing — invert the natural direction
  if (intent === 'contrarian') {
    const isAboutStopping =
      text.includes('shut down') || text.includes('shutdown') ||
      text.includes('killing') || text.includes('closing') || text.includes('stopping');
    if (isAboutStopping) {
      return 'Reversible Experiment: the argument against stopping is that a time-boxed experiment to find the salvageable segment has not been run yet — shut down only after that evidence is collected.';
    }
    return isRedTeam
      ? 'Kill The Idea: the core assumption has not survived adversarial scrutiny — every named risk materializes before any upside appears, and the capital cost of being wrong is not survivable.'
      : 'Kill The Idea: construct the adversarial case — name the assumption most likely to fail, the cost most underpriced, and the failure mode that would embarrass the original recommendation.';
  }

  // Capital allocation — must not collapse to Reversible Experiment
  if (intent === 'capital') {
    const isNow =
      text.includes(' now') || text.includes('right now') || text.includes('immediately') ||
      text.includes('this month') || text.includes('this quarter');
    if (isNow) {
      return 'Full Commit: commit to the fundraise only if product-market fit is demonstrable, runway is under 6 months, or a strategic investor sets terms — weaker signal than that makes this a Delay, not a raise.';
    }
    return 'Delay: validate traction metrics — retention, NPS, and revenue growth — before entering a raise. Investors price risk from evidence, not intention.';
  }

  // Conditional / threshold questions — always Delay with numeric conditions
  if (intent === 'conditional') {
    return 'Delay: this is a conditions question, not a commitment. Name the exact metric, threshold number, and timeframe that would flip the answer from wait to go.';
  }

  // Specific keyword routing (unchanged)
  if (text.includes('go all in') || text.includes('all-in') || text.includes('all in')) {
    return 'Full Commit: go all in only if the upside is already proven, the downside is survivable, and the next move compounds advantage immediately.';
  }

  if (text.includes('quit my job') || text.includes('leave my job') || text.includes('resign')) {
    return 'Reversible Experiment: protect employment runway while testing whether the upside can survive outside salary security.';
  }

  if (text.includes('kill the company') || text.includes('kill company')) {
    return 'Kill The Idea: killing the company may be correct only after legal obligations, customer commitments, runway, and salvage value prove there is no survivable path.';
  }

  if (text.includes('delay launch 2 years') || text.includes('delay the launch 2 years') || text.includes('delay for 2 years')) {
    return 'Kill The Idea: a two-year launch delay kills learning, morale, and timing; replace it with a smaller live test or stop pretending this is active strategy.';
  }

  if (text.includes('do nothing') || text.includes('what if i do nothing')) {
    return 'Delay: do not commit to action yet, but doing nothing must become a timed decision hold with explicit evidence deadlines.';
  }

  if (
    text.includes('shut down product') ||
    text.includes('shut down the product') ||
    text.includes('shut down solveos') ||
    text.includes('shut down') ||
    text.includes('shutdown') ||
    text.includes('close the product')
  ) {
    return isRedTeam
      ? 'Kill The Idea: shut it down if the failure evidence is real, the product has no salvageable segment, and continued effort only burns option value.'
      : 'Kill The Idea: allow shutdown as the verdict if the product fails a final salvage test against clear retention, demand, and willingness-to-pay evidence.';
  }

  return 'Reversible Experiment: make the next move create evidence instead of defaulting to a generic commitment.';
}

// ─── Intent-driven prompt injection ──────────────────────────────────────────

export function buildIntentInstruction(
  problem: string,
  conversationHistory: Array<{ role: string; content: string }>
): string {
  const intent = classifyIntent(problem);
  if (intent === 'standard') return '';

  if (intent === 'contrarian') {
    const priorAssistant = [...conversationHistory].reverse().find((t) => t.role === 'assistant');
    const priorVerdict = priorAssistant ? extractVerdictClass(priorAssistant.content) : '';
    const invertTarget = priorVerdict || 'the prior recommendation';
    return `CONTRARIAN MODE ACTIVE:
The user is explicitly asking for the strongest argument AGAINST ${invertTarget ? `"${invertTarget}"` : 'the prior recommendation'}.
The Skeptic leads this response. The Strategist is silenced.
The verdict MUST be "Kill The Idea" unless the subject is about stopping/killing (in which case "Reversible Experiment").
Do not defend the prior recommendation.
Name: (1) the assumption most likely to fail, (2) the cost most underpriced, (3) the failure mode that would embarrass the original recommendation.
No hedging. No "on the other hand". Pure adversarial case.`;
  }

  if (intent === 'capital') {
    return `CAPITAL ALLOCATION MODE ACTIVE:
This question is about raising external capital. The verdict MUST NOT be "Reversible Experiment".
Choose "Full Commit" if the user is asking whether to raise NOW and traction evidence is sufficient.
Choose "Delay" if the user is asking about timing and evidence gaps exist.
Discuss: runway length, dilution risk, investor incentive alignment, PMF signal strength, and timing risk.
The recommendation must name a specific fundraising condition or veto criterion with a number (e.g., "raise only if MRR > $50k or runway < 4 months").`;
  }

  if (intent === 'conditional') {
    return `THRESHOLD MODE ACTIVE:
The user is asking for explicit conditions, not a go/no-go verdict.
The verdict MUST be "Delay" with specific numeric thresholds for reconsideration.
Do not return generic "gather more evidence" advice.
Name the exact metric, number, and timeframe that flips the answer from wait to go.`;
  }

  return '';
}

// ─── Post-normalize intent enforcement ───────────────────────────────────────

export function enforceIntentRouting(
  problem: string,
  mode: string,
  currentRecommendation: string
): string | null {
  const intent = classifyIntent(problem);
  if (intent === 'standard') return null;

  const currentClass = extractVerdictClass(currentRecommendation);

  if (intent === 'contrarian') {
    const text = problem.toLowerCase();
    const isAboutStopping =
      text.includes('shut down') || text.includes('shutdown') ||
      text.includes('killing') || text.includes('closing') || text.includes('stopping');
    const requiredClass = isAboutStopping ? 'Reversible Experiment' : 'Kill The Idea';
    if (currentClass !== requiredClass) return semanticVerdictForQuestion(problem, mode);
  }

  if (intent === 'capital' && currentClass === 'Reversible Experiment') {
    return semanticVerdictForQuestion(problem, mode);
  }

  if (intent === 'conditional' && currentClass !== 'Delay') {
    return semanticVerdictForQuestion(problem, mode);
  }

  return null;
}

// ─── Verdict entropy ──────────────────────────────────────────────────────────

export function computeVerdictEntropy(
  conversationHistory: Array<{ role: string; content: string }>
): number {
  const verdicts = conversationHistory
    .filter((t) => t.role === 'assistant')
    .map((t) => extractVerdictClass(t.content))
    .filter(Boolean);

  if (verdicts.length <= 1) return 1;

  const counts: Record<string, number> = {};
  for (const v of verdicts) counts[v] = (counts[v] || 0) + 1;

  return Object.keys(counts).length / verdicts.length;
}

export function requiredSemanticTerms(problem: string): string[] {
  const text = problem.toLowerCase();

  if (text.includes('quit my job') || text.includes('leave my job') || text.includes('resign')) {
    return ['job', 'employment', 'runway', 'salary'];
  }

  if (
    text.includes('shut down product') ||
    text.includes('shut down the product') ||
    text.includes('shut down solveos') ||
    text.includes('shutdown product') ||
    text.includes('close the product')
  ) {
    return ['shut down', 'shutdown', 'close', 'wind down', 'product'];
  }

  return [];
}

export function outputMatchesQuestion(problem: string, output: string): boolean {
  const requiredTerms = requiredSemanticTerms(problem);
  if (requiredTerms.length === 0) return true;

  const normalized = output.toLowerCase();
  return requiredTerms.some((term) => normalized.includes(term));
}

export function hasQuestionContradiction(problem: string, output: string): boolean {
  const normalizedProblem = problem.toLowerCase();
  const normalizedOutput = output.toLowerCase();
  const shutdownQuestion =
    normalizedProblem.includes('shut down') ||
    normalizedProblem.includes('shutdown') ||
    normalizedProblem.includes('close the product');
  const quitQuestion =
    normalizedProblem.includes('quit my job') ||
    normalizedProblem.includes('leave my job') ||
    normalizedProblem.includes('resign');
  const launchAdvice =
    normalizedOutput.includes('launch-style') ||
    normalizedOutput.includes('public launch') ||
    normalizedOutput.includes('rollout') ||
    normalizedOutput.includes('scale growth') ||
    normalizedOutput.includes('first-mover');

  if (shutdownQuestion && launchAdvice && !normalizedOutput.includes('shut')) {
    return true;
  }

  if (quitQuestion && !outputMatchesQuestion(problem, output)) {
    return true;
  }

  return false;
}

// ─── Review Mode ─────────────────────────────────────────────────────────────

const REVIEW_TRIGGERS = [
  // Explicit review window labels
  '30 day review', '60 day review', '90 day review',
  '30-day review', '60-day review', '90-day review',
  // Retrospective signals
  'revisit', 'looking back', 'how did it go', 'how did this go',
  'what happened after', 'update on the decision', 'decision review',
  'after 30 days', 'after 60 days', 'after 90 days',
  'months later', 'weeks later', 'outcome review',
  'post-decision', 'post decision', 'check in on',
  // Forward-looking review planning (scorecard / milestone / kill criteria requests)
  'scorecard', 'kill criteria', 'success metrics', 'success criteria',
  'was a mistake', 'was the right call', 'was it the right', 'was this the right',
  'define milestones', 'milestone review', 'milestone scorecard',
  'prove the raise', 'prove it was', 'prove this was', 'would prove',
  'review in 30', 'review in 60', 'review in 90',
  'revisit in 30', 'revisit in 60', 'revisit in 90',
];

export function isReviewModeRequest(problem: string): boolean {
  const text = problem.toLowerCase();
  return REVIEW_TRIGGERS.some((t) => text.includes(t));
}

export function computeVerdictAccuracy(originalVerdict: string, outcomeAccuracy: number): number {
  const verdictClass = extractVerdictClass(originalVerdict);
  if (verdictClass === 'Full Commit') {
    if (outcomeAccuracy >= 70) return 100;
    if (outcomeAccuracy >= 50) return 60;
    return 20;
  }
  if (verdictClass === 'Kill The Idea') {
    if (outcomeAccuracy <= 30) return 100;
    if (outcomeAccuracy <= 50) return 60;
    return 20;
  }
  if (verdictClass === 'Delay') {
    if (outcomeAccuracy >= 40 && outcomeAccuracy <= 75) return 100;
    if (outcomeAccuracy > 75) return 70;
    return 30;
  }
  if (verdictClass === 'Reversible Experiment') {
    if (outcomeAccuracy >= 50) return 90;
    if (outcomeAccuracy >= 30) return 60;
    return 30;
  }
  return 50;
}

export function shouldRejectDecisionOutput(problem: string, output: string): boolean {
  if (isPlanModeRequest(problem) || isReviewModeRequest(problem)) {
    return containsGenericVerdict(output) || hasQuestionContradiction(problem, output);
  }

  return containsGenericVerdict(output) || !hasValidVerdictClass(output) || !outputMatchesQuestion(problem, output) || hasQuestionContradiction(problem, output);
}
