# Engineering decisions and trade-offs

This file explains the main requirements behind Agent Forecast Foundry in plain language.

I use AI tools heavily during implementation, but I remain responsible for the product boundary, architecture constraints, review, debugging, acceptance criteria, and quality bar.

## 1. Define the forecast before measuring it

A forecast needs a clear meaning before the outcome is known.

**Trade-off:** more work up front, but less room to reinterpret a prediction after the fact.

## 2. Keep the evidence trail

A result is much weaker if we cannot tell where it came from, what inputs it used, or which run produced it.

**Trade-off:** more metadata, but much better auditability.

## 3. Prefer held-out evidence over impressive demos

A polished example can be useful for demonstration, but it is weak evidence of a real forecasting advantage.

**Trade-off:** harder to produce flattering results, easier to tell whether the idea actually works.

## 4. Compare against simple alternatives

The useful question is not whether a sophisticated forecast beats nothing. It is whether it beats a simpler and cheaper alternative by enough to matter.

**Trade-off:** a higher bar for the product thesis.

## 5. Count cost and latency

A more accurate forecast can still be a worse product if it is too expensive or too slow for the decision it supports.

**Trade-off:** technical performance is judged together with operational usefulness.

## 6. Keep unknowns visible

A working implementation, synthetic tests, or a strong-looking demo do not prove real forecast advantage or market demand.

**Trade-off:** less hype, more credible claims.

## Questions I expect a reviewer to ask

- What is the actual forecasting hypothesis?
- What evidence would be strong enough to support it?
- What would make me reject it?
- Why are simple baselines important?
- Which requirements did I set, and which low-level choices came from the AI-assisted implementation process?
