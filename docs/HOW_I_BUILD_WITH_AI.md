# How I build with AI

Agent Cashflow OS sits in a useful tension: AI is both part of the product hypothesis and part of the implementation workflow.

## Where AI helps

I use AI to accelerate:

- hypothesis exploration;
- implementation candidates;
- contract and interface review;
- test and edge-case generation;
- benchmark/evaluation design discussion;
- documentation and critical review.

## What still needs explicit control

The workflow still needs an explicit owner for:

- what the forecast contract actually means;
- event identity;
- provenance;
- leakage boundaries;
- what belongs in a held-out comparison;
- what counts as a cheap adequate baseline;
- how cost and latency affect usefulness;
- when the correct conclusion is “not proven yet.”

## Quality model

```text
AI-assisted candidate
        ↓
contract + provenance checks
        ↓
controlled evaluation
        ↓
held-out evidence
        ↓
compare against simpler alternatives
        ↓
keep / revise / reject
```

The goal is not to use AI to produce a persuasive forecast demo. The goal is to use AI as leverage while preserving the evaluation discipline needed to determine whether the forecast mechanism deserves trust at all.
