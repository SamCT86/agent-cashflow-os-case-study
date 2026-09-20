# Agent Forecast Foundry — bounded Applied AI runtime reference

[![Public Agent Runtime Reference](https://github.com/SamCT86/agent-cashflow-os-case-study/actions/workflows/reference-tests.yml/badge.svg)](https://github.com/SamCT86/agent-cashflow-os-case-study/actions/workflows/reference-tests.yml)

**Public status:** Runnable engineering reference  
**Private system:** broader forecast / evaluation implementation remains private  
**Portfolio:** https://sarmadtawfeek.se/

This repository now exposes one narrow mechanism from a larger private Applied AI system: **accept an agent result only when its evidence references, uncertainty state, latency and cost stay inside predeclared runtime bounds.**

It is intentionally small. The point is not to publish a product or claim forecasting edge. The point is to make an important AI-systems invariant inspectable in code.

## Run it

```bash
npm test
```

The public reference has zero runtime dependencies and uses synthetic inputs only.

## What the runnable reference proves

`src/runtime-gate.mjs` demonstrates a bounded post-model verification layer:

- every output reference must resolve to an input explicitly bound to the run;
- probability values are range checked;
- abstention is preserved instead of converted into fake confidence;
- latency and cost are checked against predeclared limits;
- incomplete provider status fails closed;
- hidden reasoning / raw secret persistence fields are rejected;
- accepted output is reduced to a small auditable result surface.

The tests include both accepted and adversarial cases.

## Why this matters for agentic systems

A model response is not the same thing as a trustworthy system outcome.

```text
bounded inputs
→ model / agent execution
→ structured output
→ reference + state + cost + latency verification
→ ACCEPTED / ABSTAINED / failed closed
```

That separation lets an application use models aggressively without treating provider success as proof that the surrounding system stayed inside its contract.

## Relation to the private implementation

The corresponding private implementation goes further and includes a real OpenAI Responses-based execution path, strict structured outputs, specialist-role orchestration, adversarial / meta / calibration stages, input provenance, timeout and spend controls, provider response verification and held-out evaluation machinery.

Those product internals, prompts, live provider evidence and operational controls are intentionally not copied here. This repository publishes only a bounded reference sufficient to inspect the engineering pattern.

## Forecast research boundary

The larger project also investigates whether forecasts frozen before outcomes can earn decision weight after held-out comparison against reasonable alternatives.

That **research hypothesis remains unproven**. This public runtime reference does not claim:

- measured forecast superiority;
- production forecast deployment;
- a qualified commercial benchmark corpus;
- external buyer adoption;
- product-market fit.

## Repository map

- [`src/runtime-gate.mjs`](src/runtime-gate.mjs) — bounded post-model verification logic
- [`test/runtime-gate.test.mjs`](test/runtime-gate.test.mjs) — executable adversarial cases
- [`PROOF.md`](PROOF.md) — preserved forecast-evidence work
- [`docs/SYSTEM_VIEW.md`](docs/SYSTEM_VIEW.md) — broader system view
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — requirements and trade-offs
- [`PUBLIC_BOUNDARY.md`](PUBLIC_BOUNDARY.md) — public/private boundary

## Engineering accountability

AI tools are part of my implementation workflow. I remain accountable for problem framing, architecture constraints, acceptance criteria, verification design, debugging and release decisions.

## Related references

- [MachineOutcome](https://github.com/SamCT86/machineoutcome-case-study) — agent mutation verification and reconciliation.
- [Billable Meetings](https://github.com/SamCT86/billable-meetings-os-case-study) — deterministic evidence-to-settlement decisions.
- [ReleaseProof](https://github.com/SamCT86/releaseproof-case-study) — exact-artifact release evidence.
- [PriceBriefs](https://github.com/SamCT86/pricebriefs-case-study) — evidence-bound market intelligence.
