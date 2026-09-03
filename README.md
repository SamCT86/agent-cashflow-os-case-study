# Agent Cashflow OS — forecast evidence, not forecast theater

**Sarmad Tawfeek · AI systems · technical implementation · automation**  
**Status:** Research / Building  
**Current hypothesis:** Agent Forecast Evidence  
**Portfolio:** https://sarmadtawfeek.se/

## My role in this build

I researched the product/research direction, chose the problem to pursue, defined the high-level blueprint and quality expectations, and used specialist AI personas/agents to drive implementation, critique and iteration.

The implementation is heavily AI-assisted. I do **not** claim that I personally hand-wrote every line of code or independently selected every low-level technical mechanism. My direct ownership is the product hypothesis, system requirements, expert/persona orchestration, acceptance criteria and quality gates.

The current question is deliberately empirical:

> **Can an agent forecast be defined before the outcome, tied to provenance, and later evaluated against adequate alternatives strongly enough to earn decision weight?**

This repository does not present forecast superiority as already proven.

## What actually exists today

The private implementation contains a preserved machine-native substrate with:

- request / payment / work / outcome / settlement flow;
- idempotency and replay-safety mechanisms;
- deterministic schemas;
- provenance handling;
- traffic classification;
- an economic ledger;
- an x402 / Base Sepolia proof path.

The **forecast-specific product edge is still a hypothesis**. The current direction is to make forecast semantics, forecast/outcome identity, calibration state and held-out benchmark rules explicit before claiming advantage.

**Start with the evidence layer:** [PROOF.md](PROOF.md)

## Research boundary

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

These are current research/system requirements; they are not a claim that I personally originated every low-level mechanism used to implement them.

## A failure mode the research direction must avoid

If the meaning of a forecast can move after the outcome is known, or development examples leak into evaluation, a good-looking result can measure familiarity rather than forecasting value.

The research direction therefore requires contract/evaluation semantics to be frozen before stronger performance claims are accepted.

## How AI fits

AI agents/models are used heavily for implementation, hypothesis exploration, evaluation critique, test ideas, review and iteration.

My role is to define the product/research question, blueprint the required system behavior, structure the expert/persona workflow, set the quality bar and refuse stronger claims until the evidence gate is met.

More detail: [docs/HOW_I_BUILD_WITH_AI.md](docs/HOW_I_BUILD_WITH_AI.md)

## Technical context

`Node.js` · `deterministic contracts` · `SHA-256 provenance concepts` · `automated tests` · `held-out evaluation design` · `idempotency / replay safety`

Technology is implementation context, not a claim that I personally selected or hand-authored every component.

## Inspect the case study

- [Observable proof](PROOF.md)
- [Sanitized forecast record](examples/sanitized-forecast-record.json)
- [System view](docs/SYSTEM_VIEW.md)
- [System requirements & trade-offs](docs/DECISIONS.md)
- [Verification approach](docs/VERIFICATION.md)
- [Public / private boundary](PUBLIC_BOUNDARY.md)

## Not claimed

- a finished forecast engine;
- a qualified real held-out corpus;
- measured forecast advantage;
- an external forecast buyer;
- paid forecast repeat use;
- production forecast deployment;
- product-market fit;
- personal authorship of every implementation detail.

The point of this project today is to show how I direct and quality-gate an AI-assisted technical/research build while keeping implemented substrate separate from an unproven product advantage.

## Related engineering case studies

- [MachineOutcome](https://github.com/SamCT86/machineoutcome-case-study) — outcome verification before reliability and delegation claims.
- [ReleaseProof](https://github.com/SamCT86/releaseproof-case-study) — exact-artifact evidence and reproducible rechecks.
- [PriceBriefs](https://github.com/SamCT86/pricebriefs-case-study) — deterministic decision support with evidence-bound refusal states.
