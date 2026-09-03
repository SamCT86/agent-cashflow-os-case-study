# Observable proof

This file separates what is already implemented in the private Agent Cashflow source from what remains a forecast research hypothesis.

No private source code, payment credentials, internal contracts, ledgers, prompts or benchmark implementation are copied here.

**Ownership note:** the implementation evidence below is not a claim that I personally hand-authored or independently selected every low-level technical mechanism. My direct role is product/research direction, system blueprint and requirements, expert/persona orchestration, acceptance criteria and quality gates; AI is used heavily in implementation.

## Existing engineering substrate

The current private source explicitly preserves a machine-native request/payment/work/outcome/settlement kernel with:

- idempotency / replay safety;
- deterministic schemas;
- provenance handling;
- traffic classification;
- an economic ledger;
- an x402 / Base Sepolia proof path.

That substrate is real implementation evidence. It is **not** the same as proof that the current forecast hypothesis works.

## Current forecast work

The active direction is **Agent Forecast Evidence** around a working operation named `forecast_event`.

The next proof gates are organized around:

- freezing forecast semantics before the outcome;
- freezing forecast/outcome/calibration ledger semantics;
- held-out comparison against cheap adequate alternatives;
- only exposing a forecast capability after the evaluation gate survives.

These are current build/evaluation gates, not completed market proof.

## What would falsify the hypothesis

A forecast mechanism should fail the product thesis if held-out performance does not beat an adequate cheap baseline, the apparent advantage depends on leakage, the advantage disappears once variable cost is included, latency makes the decision unusable, confidence is poorly calibrated, or the result cannot be connected to a stable forecast/outcome identity.

## Sanitized forecast record

See [examples/sanitized-forecast-record.json](examples/sanitized-forecast-record.json).

The example is synthetic/redacted. It illustrates the sequencing rule that contract and forecast identity exist before the outcome and before evaluation.

## Implemented vs not yet proven

| Area | Public evidence state |
|---|---|
| Request/payment/work/outcome/settlement substrate | Implemented / preserved in private source |
| Idempotency / replay safety | Implemented substrate |
| Deterministic schemas + provenance | Implemented substrate |
| `forecast_event` product direction | Current build hypothesis |
| Frozen held-out benchmark semantics | Current gate / work direction |
| Measured forecast advantage | Not proven |
| Qualified real held-out corpus | Not proven |
| External forecast buyer / paid repeat | Not proven |
| Production forecast deployment | Not claimed |

## What I personally own and can explain

- why I chose to explore forecast evidence as the current product/research direction;
- the high-level blueprint and proof gates I require before treating a forecast advantage as real;
- how I structure specialist AI personas/agents to research, build, critique and revise the system;
- why I require explicit unproven states rather than turning a build into a performance claim;
- what the current implementation evidence establishes and what remains hypothesis;
- how I direct further iteration or rejection when AI-generated work does not meet the quality/evidence bar.

For a specific benchmark implementation, statistical technique, contract shape, provenance mechanism or code path, I distinguish between **implementation evidence** and **a decision I personally made**.
