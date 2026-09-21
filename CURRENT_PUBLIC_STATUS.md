# Current public status - 2026-09-20

**Public reference: active. Commercial product claims: not made.**

Agent Forecast Foundry is maintained as a public engineering reference for how I approach forecast evidence, agent verification, and evaluation. It is useful as proof of engineering and product reasoning, but it should not be read as a claim that a forecasting product is launched, commercially validated, or proven to outperform alternatives.

## What is real today

- The public runtime reference is runnable and tested.
- Concurrent attempts for one `runId` are coordinated with a single-host filesystem claim; a two-process test verifies one provider execution and one journal record.
- The broader private work includes request, payment, work, outcome, and settlement mechanics.
- Forecast identity, provenance, calibration, and held-out evaluation remain important proof requirements.
- Measured forecast advantage, a qualified external buyer, paid repeat use, and production forecast deployment are not proven here.

## Why this file exists

I want a reviewer to be able to tell the difference between **what has been built** and **what is still a hypothesis** without reading between the lines.

This repository is evidence of system design, implementation, and verification discipline. It is not an active launch announcement.

## Fast review path

1. [`README.md`](README.md) - what the public reference does and how to run it.
2. [`PROOF.md`](PROOF.md) - what is implemented and what remains unproven.
3. [`examples/sanitized-forecast-record.json`](examples/sanitized-forecast-record.json) - a synthetic sequencing example.
4. [`docs/VERIFICATION.md`](docs/VERIFICATION.md) - how stronger claims would need to be tested.
5. [`PUBLIC_BOUNDARY.md`](PUBLIC_BOUNDARY.md) - what stays public and what stays private.
