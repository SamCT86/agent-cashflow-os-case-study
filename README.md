# Agent Cashflow OS — forecast evidence, not forecast theater

**Sarmad Tawfeek · AI systems · technical implementation · automation**  
**Status:** Research / Building  
**Current hypothesis:** Agent Forecast Evidence  
**Portfolio:** https://sarmadtawfeek.se/

The current question is deliberately empirical:

> **Can an agent forecast be defined before the outcome, tied to provenance, and later evaluated against adequate alternatives strongly enough to earn decision weight?**

This repository does not present forecast superiority as already proven.

## What actually exists today

The private implementation already contains a preserved machine-native substrate from earlier work:

- request / payment / work / outcome / settlement flow;
- idempotency and replay-safety mechanisms;
- deterministic schemas;
- provenance handling;
- traffic classification;
- an economic ledger;
- an x402 / Base Sepolia proof path.

The **forecast-specific product edge is still a hypothesis**. The current direction is to make `forecast_event` semantics, forecast/outcome identity, calibration state and held-out benchmark rules explicit before claiming advantage.

**Start with the evidence layer:** [PROOF.md](PROOF.md)

## The research boundary

```text
Forecast contract frozen before outcome
          ↓
Forecast + provenance
          ↓
Outcome becomes observable
          ↓
Held-out comparison
          ↓
Cheap adequate baselines
          ↓
Calibration + cost + latency
          ↓
Advantage proven / not proven
```

A compelling example is not enough. The forecast has to beat a reasonable alternative on evidence that was not shaped after seeing the answer.

## A failure mode I am explicitly designing against

### Outcome leakage / moving semantics

If the meaning of a forecast can change after the outcome is known, evaluation becomes meaningless.

Likewise, if development examples leak into the evaluation set, a good-looking benchmark can measure familiarity rather than forecasting value.

The safer design freezes contract semantics first, preserves provenance and keeps held-out evaluation separate from demonstration examples.

## Where AI fits

AI is useful for hypothesis exploration, implementation candidates, test ideas and evaluation-design critique. It cannot be allowed to grade its own forecast by changing the contract or baseline after the outcome is visible.

More detail: [docs/HOW_I_BUILD_WITH_AI.md](docs/HOW_I_BUILD_WITH_AI.md)

## Technical context

`Node.js` · `deterministic contracts` · `SHA-256 provenance concepts` · `automated tests` · `held-out evaluation design` · `idempotency / replay safety`

## Inspect the proof

- [Observable proof](PROOF.md)
- [Sanitized forecast record](examples/sanitized-forecast-record.json)
- [System view](docs/SYSTEM_VIEW.md)
- [Engineering decisions](docs/DECISIONS.md)
- [Verification approach](docs/VERIFICATION.md)
- [Public / private boundary](PUBLIC_BOUNDARY.md)

## Not claimed

- a finished forecast engine;
- a qualified real held-out corpus;
- measured forecast advantage;
- an external forecast buyer;
- paid forecast repeat use;
- production forecast deployment;
- product-market fit.

The point of this project today is to show **evaluation discipline around an AI hypothesis**, while keeping the difference between an implemented substrate and an unproven product advantage explicit.
