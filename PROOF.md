# Observable proof

This file separates what is already implemented from what is still a forecasting hypothesis.

No private source code, credentials, internal contracts, ledgers, prompts, or benchmark implementation are copied into this public repository.

## What is already implemented

The broader private implementation includes a machine-oriented request, payment, work, outcome, and settlement flow with:

- idempotency and replay safety;
- deterministic schemas;
- provenance handling;
- traffic classification;
- an economic ledger;
- an x402 / Base Sepolia proof path.

Those are real implementation signals. They do **not** prove that the forecasting hypothesis itself is useful or commercially valuable.

## What the forecasting work is trying to prove

The current direction centers on a `forecast_event` operation and the evidence needed to evaluate it fairly.

Before making a stronger performance claim, I would want to see:

- forecast meaning fixed before the outcome is known;
- stable forecast and outcome identity;
- held-out comparison against simple, cheaper alternatives;
- calibration evidence;
- cost and latency included in the evaluation;
- a result that survives leakage checks.

These are proof gates, not completed market proof.

## What would falsify the idea

I would reject the forecasting thesis if the apparent advantage disappears on held-out data, depends on leakage, loses once cost or latency are included, is poorly calibrated, or cannot be tied to a stable forecast/outcome pair.

## Sanitized forecast record

See [examples/sanitized-forecast-record.json](examples/sanitized-forecast-record.json).

The example is synthetic and redacted. Its purpose is to show the sequencing rule: forecast identity and meaning exist before the outcome and before evaluation.

## Implemented vs not yet proven

| Area | Current evidence state |
| --- | --- |
| Request/payment/work/outcome/settlement mechanics | Implemented in private source |
| Idempotency / replay safety | Implemented |
| Deterministic schemas and provenance | Implemented |
| `forecast_event` direction | Active engineering hypothesis |
| Held-out benchmark semantics | Evaluation requirement |
| Measured forecasting advantage | Not proven |
| Qualified real held-out corpus | Not proven |
| External buyer / paid repeat use | Not proven |
| Production forecast deployment | Not claimed |

## What I am accountable for

I use AI heavily during implementation. I remain responsible for the problem choice, system boundaries, architecture constraints, acceptance criteria, review, debugging, tests, and the decision to accept or reject a result.

When a low-level statistical or implementation detail came from the AI-assisted process, I do not present that as manual authorship. I distinguish between **evidence that the implementation exists** and **decisions I personally made and can defend**.
