# Agent Cashflow OS — paused forecast-evidence research

**Status:** Paused research / engineering asset  
**Current hypothesis:** Agent Forecast Evidence  
**Portfolio:** https://sarmadtawfeek.se/

This repository preserves a research direction and engineering record. It is **not** presented as an active product launch.

## Current question

> Can an agent forecast be frozen before the outcome, tied to provenance, and later evaluated against adequate alternatives strongly enough to earn decision weight?

This repository does not claim that forecast superiority is already proven.

## What exists

The private implementation contains a preserved machine-native substrate with:

- request / payment / work / outcome / settlement flow;
- idempotency and replay-safety mechanisms;
- deterministic schemas;
- provenance handling;
- traffic classification;
- an economic ledger;
- an x402 / Base Sepolia proof path.

The forecast-specific edge remains a hypothesis. The required proof path is explicit forecast semantics, stable forecast/outcome identity, calibration state and held-out evaluation against reasonable baselines.

## Research contract

```text
forecast contract frozen before outcome
→ forecast + provenance
→ outcome becomes observable
→ held-out comparison
→ adequate baselines
→ calibration + cost + latency
→ advantage proven / not proven
```

A compelling example is insufficient. Evaluation must resist post-outcome reframing and development-set leakage.

## Engineering process

AI tools are part of the implementation workflow. I remain accountable for system boundaries, architecture constraints, code review, debugging, acceptance criteria, tests and release decisions.

## Repository map

- [Current public status](CURRENT_PUBLIC_STATUS.md)
- [Observable proof](PROOF.md)
- [Sanitized forecast record](examples/sanitized-forecast-record.json)
- [System view](docs/SYSTEM_VIEW.md)
- [System requirements & trade-offs](docs/DECISIONS.md)
- [Verification approach](docs/VERIFICATION.md)
- [Public / private boundary](PUBLIC_BOUNDARY.md)

## Scope

Not claimed here:

- an active product launch;
- a finished forecast engine;
- a qualified real held-out corpus;
- measured forecast advantage;
- an external forecast buyer;
- paid repeat use;
- production forecast deployment;
- product-market fit.

## Related public references

- [MachineOutcome](https://github.com/SamCT86/machineoutcome-case-study) — outcome verification before reliability and delegation claims.
- [ReleaseProof](https://github.com/SamCT86/releaseproof-case-study) — exact-artifact evidence and reproducible rechecks.
- [PriceBriefs](https://github.com/SamCT86/pricebriefs-case-study) — deterministic decision support with evidence-bound refusal states.
