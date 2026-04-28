# Review Mode Routing Fix - Implementation Summary

## Problem Statement
Three review-focused prompts were incorrectly routing to Verdict Mode instead of Review Mode:
1. "Revisit this decision in 90 days and define success metrics"
2. "What milestones would prove the raise was a mistake?"
3. "Give me a 30-day review scorecard with kill criteria"

These prompts should render **milestone scorecard cards** (Review Mode) but instead were rendering **verdict cards** (Verdict Mode).

## Root Cause Analysis
- ✓ `isReviewModeRequest()` correctly detected all three prompts as review
- ✓ `effectiveMode` was correctly set to `'Review'`
- ✗ The `isReviewMode` flag in the returned blueprint was not consistently being set
- ✗ Even if `isReviewMode` was set, recommendation might still contain verdict classes
- ✗ `milestoneTable` might not be populated if the LLM didn't generate it

## Solution: Hard-Routing Fix

### File: [app/api/solve/route.ts](app/api/solve/route.ts#L484-L510)

Added explicit hard-routing logic that forces review mode for detected review prompts:

```typescript
// HARD ROUTING: Force Review Mode for detected review prompts
if (isReview) {
  blueprint.isReviewMode = true;
  
  // Ensure recommendation starts with "Review:" and has no verdict classes
  const rec = String(blueprint.recommendation || '');
  const hasVerdictClass = ['Full Commit', 'Reversible Experiment', 'Delay', 'Kill The Idea']
    .some(cls => rec.includes(cls));
  if (hasVerdictClass || !rec.startsWith('Review:')) {
    blueprint.recommendation = 'Review: Milestone assessment — see scorecard below for 30/60/90-day checkpoint analysis.';
  }
  
  // Ensure milestoneTable is populated with 30/60/90 day structure
  if (!Array.isArray(blueprint.milestoneTable) || blueprint.milestoneTable.length === 0) {
    blueprint.milestoneTable = [
      {
        horizon: '30 days',
        milestone: 'Initial outcome signal',
        status: 'unknown',
        metric: 'Track against original assumptions',
        evidence: 'Validate if first-order metrics align with plan',
      },
      {
        horizon: '60 days',
        milestone: 'Pattern confirmation',
        status: 'unknown',
        metric: 'Confirm if trajectory holds or diverges',
        evidence: 'Early evidence about hidden assumption failures',
      },
      {
        horizon: '90 days',
        milestone: 'Decision verdict',
        status: 'unknown',
        metric: 'Final go / no-go checkpoint',
        evidence: 'Enough data to confirm or overturn original decision',
      },
    ];
  }
}
```

### What This Fixes
1. **Ensures `isReviewMode = true`**: The frontend component checks this flag to decide between Review or Verdict rendering
2. **Strips verdict classes**: Replaces any "Full Commit", "Reversible Experiment", "Delay", "Kill The Idea" with "Review:" prefix
3. **Guarantees milestoneTable**: Creates a default 30/60/90 day checkpoint structure if missing

## Regression Tests

### Test File: [scripts/test-review-routing.mjs](scripts/test-review-routing.mjs)

Added comprehensive regression tests that verify:
- All 3 failing prompts correctly route to Review Mode ✓
- Control prompts still route to Verdict Mode ✓
- Run with: `npm run test:review`

### Test Results
```
✓ PASS: "Revisit this decision in 90 days and define success metrics"
✓ PASS: "What milestones would prove the raise was a mistake?"
✓ PASS: "Give me a 30-day review scorecard with kill criteria"
✓ PASS: "Should I take this job offer?" (verdict mode control)
✓ PASS: "Is this a good business opportunity?" (verdict mode control)
✓ PASS: "What should we do about this market shift?" (verdict mode control)

📊 RESULTS: 6/6 tests passed ✅
```

## Build & Deployment

### Build Status
- ✓ `npm run build` succeeds
- ✓ TypeScript type checking passes
- ✓ All routes compile correctly

### Deployment Checklist
- [x] Code changes implemented
- [x] Regression tests passing
- [x] Build succeeds
- [ ] Deploy to staging/production
- [ ] Verify in browser that prompts render milestone scorecard (not verdict)
- [ ] Monitor logs for any edge cases

## Verification Steps

After deployment, verify with each prompt:

1. **Prompt**: "Revisit this decision in 90 days and define success metrics"
   - Expected: Blue "Review Complete" indicator
   - Expected: "Milestone Scorecard" section visible
   - Expected: No verdict class in recommendation

2. **Prompt**: "What milestones would prove the raise was a mistake?"
   - Expected: Blue "Review Complete" indicator
   - Expected: 3-row milestone table (30/60/90 days)
   - Expected: Recommendation starts with "Review:"

3. **Prompt**: "Give me a 30-day review scorecard with kill criteria"
   - Expected: Blue "Review Complete" indicator
   - Expected: Milestone metrics with unknown/on_track/behind/failed status
   - Expected: No verdict classes

## Files Modified

1. **[app/api/solve/route.ts](app/api/solve/route.ts#L484-L510)**
   - Added hard-routing fix (27 lines)
   - Placed after normalizeBlueprint call, before other recommendation overrides

2. **[package.json](package.json)**
   - Added `"test:review": "node scripts/test-review-routing.mjs"` script

3. **New Test Files**
   - [scripts/test-review-routing.mjs](scripts/test-review-routing.mjs) - Regression test runner
   - [lib/review-routing-tests.ts](lib/review-routing-tests.ts) - TypeScript test definitions

## Edge Cases Handled

1. **Verdict classes in recommendation**: Replaced with "Review:" + safe text
2. **Missing milestoneTable**: Creates default 30/60/90 structure
3. **Empty milestoneTable**: Replaces with default structure
4. **Review prompts that don't match**: Falls through to normal Verdict Mode
5. **Multiple verdict references**: All stripped, only "Review:" kept

## Performance Impact

- Minimal: Additional string checks only run for detected review prompts
- One additional array creation (milestoneTable) only if missing
- No external API calls or database queries added

## Future Improvements

1. **LLM Refinement**: Update LLM prompts to more reliably generate milestoneTable
2. **Template System**: Consider a milestone template system for consistency
3. **Monitoring**: Add logging to track how often hard-routing engages
4. **Enhanced Triggers**: Monitor if additional review patterns emerge
