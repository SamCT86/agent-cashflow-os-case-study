# Agent Cashflow OS — Public Research / Engineering Case Study

**Status:** Research / Building  
**Current direction:** Forecast evidence for autonomous decision agents  
**Portfolio:** https://sarmadtawfeek.se/

> This repository is a public case study of the current research/build direction. The implementation and evaluation machinery remain private by design.

## The problem

An autonomous agent can produce a confident forecast without giving a downstream system enough reason to know whether that forecast deserves weight.

The useful question is not:

> “Did an AI make a prediction?”

It is closer to:

**Can the forecast be tied to an explicit contract, provenance and later outcome evidence strongly enough to evaluate whether it was actually useful?**

## Current build hypothesis

Agent Cashflow OS is currently exploring **forecast evidence** as its primary build hypothesis.

The public system direction includes:

- explicit forecast contracts;
- stable event identity;
- provenance;
- later outcome recording;
- calibration-state concepts;
- automated testing;
- held-out evaluation concepts against simpler alternatives.

This is a technical build hypothesis, not proven market demand or proven forecast advantage.

## System at a glance

```text
Forecast request
      ↓
Explicit forecast contract
      ↓
Forecast + provenance
      ↓
Outcome observation
      ↓
Held-out / calibration evidence
      ↓
Decision support
```

## What I want a technical reviewer to inspect

- **Contract before performance narrative.** Forecast semantics should be explicit before evaluation.
- **Provenance before confidence.** A prediction without enough context about how it was produced is weak decision evidence.
- **Held-out evidence over demonstration.** A convincing example is not the same as a leakage-safe comparison.
- **Calibration over certainty theater.** The system should preserve uncertainty rather than reward confident presentation.
- **Economics belongs in the evaluation.** A stronger forecast only matters if any advantage survives the cost and latency required to produce it.

## AI-native build approach

This project is deliberately reflexive: AI is both part of the problem space and part of my implementation workflow.

I use AI to accelerate exploration, implementation candidates, evaluation design, edge-case generation and review. The system still needs explicit contracts, provenance and empirical gates before a stronger claim is accepted.

```text
Hypothesis
   ↓
Explicit contract
   ↓
AI-assisted implementation
   ↓
Controlled evaluation
   ↓
Outcome + provenance
   ↓
Keep / revise / reject the hypothesis
```

More detail: [docs/HOW_I_BUILD_WITH_AI.md](docs/HOW_I_BUILD_WITH_AI.md)

## Technical context

Current project evidence supports work with:

`Node.js` · `deterministic contracts` · `SHA-256 provenance concepts` · `automated tests` · `held-out evaluation design`

These are implementation contexts, not self-rated proficiency badges.

## Verification mindset

Forecast quality is treated as an empirical question. Demonstration examples are weaker than held-out comparison, and technical mechanism proof remains separate from commercial validation.

See [docs/VERIFICATION.md](docs/VERIFICATION.md).

## Current truth boundary

This repository does **not** claim:

- proven forecast superiority;
- a qualified real held-out advantage;
- external buyers;
- paid repeat usage;
- product-market fit.

## Public / private boundary

Private source, exact contracts, benchmark implementation, internal ledgers, prompts, fixtures, roadmap sequencing and economic mechanisms are intentionally excluded.

See [PUBLIC_BOUNDARY.md](PUBLIC_BOUNDARY.md).
