# AI in the Agent Cashflow workflow

AI is useful for exploring the hypothesis. It cannot be allowed to validate its own advantage.

## Where AI helps

- shaping implementation candidates;
- generating edge cases;
- discussing benchmark and evaluation design;
- reviewing contract semantics;
- accelerating documentation and critique.

## What stays explicit

- the forecast contract before the outcome;
- stable event and provenance identity;
- held-out boundaries;
- adequate cheap baselines;
- calibration;
- cost and latency;
- `not proven yet` as a valid conclusion.

## Working loop

```text
forecast hypothesis
      ↓
freeze contract
      ↓
AI-assisted implementation
      ↓
held-out evaluation
      ↓
compare with adequate baselines
      ↓
keep / revise / reject
```

A convincing demo is not evidence of forecast advantage. AI may help build the mechanism, but the mechanism has to survive an evaluation it does not get to rewrite after seeing the outcome.

For concrete implementation evidence, see [../PROOF.md](../PROOF.md).
