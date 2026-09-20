# Agent Forecast Foundry â€” Applied AI runtime reference

[![Public Agent Runtime Reference](https://github.com/SamCT86/agent-forecast-foundry-case-study/actions/workflows/reference-tests.yml/badge.svg)](https://github.com/SamCT86/agent-forecast-foundry-case-study/actions/workflows/reference-tests.yml)

**Status:** runnable public engineering reference
**Portfolio:** https://sarmadtawfeek.se/

## Problem

A successful model response is not the same thing as a trustworthy system outcome. An agent run can still be unusable because it cited inputs outside the authorized run, exceeded latency or cost bounds, returned incomplete provider state, or persisted data that should never leave the execution boundary.

This repository makes that boundary inspectable in code.

## Execution path

```text
bound request + evidence refs
â†’ OpenAI Responses API adapter
â†’ strict JSON-schema output
â†’ provider status + token/cost/latency telemetry
â†’ deterministic runtime verification
â†’ ACCEPTED / ABSTAINED / fail closed
â†’ sanitized JSONL journal
```

The live-provider adapter targets `POST /v1/responses`, sets `store: false`, requests strict `text.format` JSON Schema output, applies a request timeout, and converts provider usage into an explicit cost estimate supplied by the caller.

## Run the public verification

```bash
npm test
npm run eval
```

`npm test` runs the unit/integration-safe reference suite. `npm run eval` runs a small synthetic fixture set and reports pass/fail per case.

CI and the default test path make **no live model call and spend no API budget**. The OpenAI adapter is exercised with an injected HTTP boundary so request shape, schema binding, telemetry handling and failure semantics are deterministic in CI.

## Inspect the implementation

- [`src/runtime-gate.mjs`](src/runtime-gate.mjs) â€” runtime contract, real Responses API adapter, cost/latency accounting, sanitized journaling and offline eval evaluator.
- [`test/execution-path.test.mjs`](test/execution-path.test.mjs) â€” provider/request boundary, persistence and transport failure tests.
- [`test/runtime-gate.test.mjs`](test/runtime-gate.test.mjs) â€” deterministic post-model guard tests.
- [`eval/fixtures.mjs`](eval/fixtures.mjs) â€” synthetic eval cases.
- [`tools/run-eval.mjs`](tools/run-eval.mjs) â€” reviewer-facing offline eval command.
- [`PUBLIC_BOUNDARY.md`](PUBLIC_BOUNDARY.md) â€” disclosure boundary.

A reviewer can start at `executeVerifiedRun`, follow the provider call into `createOpenAIResponsesProvider`, then inspect the fail-closed gate and the journal record that survives verification.

## Failure cases made explicit

The reference fails closed when:

- an output cites an input ref that was not bound to the run;
- a provider input body attempts to use an unbound ref;
- provider status is not `completed`;
- the provider HTTP request fails;
- latency or estimated cost exceed predeclared bounds;
- a probability is invalid for the selected decision state;
- hidden reasoning or raw secret-bearing persistence fields appear;
- structured provider output cannot be parsed under the expected contract.

An incomplete provider run is rejected **before** the JSONL journal is written.

## What the eval does â€” and does not prove

The included fixture set checks accepted, abstained and fail-closed behaviors against synthetic records. It is an engineering regression surface, not evidence that the underlying forecasts are accurate.

This repository does **not** claim:

- forecast superiority or calibrated advantage over market/cheap alternatives;
- production deployment or production scale;
- a qualified commercial benchmark corpus;
- buyer adoption, product-market fit or revenue;
- live-provider latency/cost from this public CI run.

## Public / private boundary

This code is a standalone public reference written to expose the engineering pattern. It is not a copy of the private product runtime, prompts, benchmark semantics, live evidence, proprietary orchestration or commercial controls.

No credential is stored by the adapter. Raw evidence bodies are sent only to the configured provider call and are deliberately omitted from the persisted run record.

See [`PUBLIC_BOUNDARY.md`](PUBLIC_BOUNDARY.md) for the exact disclosure boundary.

## Related proof

- [MachineOutcome](https://github.com/SamCT86/machineoutcome-case-study) â€” observed-state reconciliation and retry safety.
- [Billable Meetings](https://github.com/SamCT86/billable-meetings-os-case-study) â€” deterministic evidence-to-settlement decisions.
- [ReleaseProof](https://github.com/SamCT86/releaseproof-case-study) â€” exact-artifact provenance.
- [PriceBriefs](https://github.com/SamCT86/pricebriefs-case-study) â€” evidence qualification and refusal states.

## Engineering accountability

AI tools are part of my implementation workflow. I remain accountable for problem framing, architecture constraints, acceptance criteria, verification design, debugging and release decisions.
