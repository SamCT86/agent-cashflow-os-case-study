# Agent Forecast Foundry - a small reference for safer AI agent runs

[![Public Agent Runtime Reference](https://github.com/SamCT86/agent-forecast-foundry-case-study/actions/workflows/reference-tests.yml/badge.svg)](https://github.com/SamCT86/agent-forecast-foundry-case-study/actions/workflows/reference-tests.yml)

**Status:** runnable public engineering reference  
**Portfolio:** https://sarmadtawfeek.se/

I built this repository to show one practical idea: a model returning an answer does not mean the whole agent run should be trusted.

A run can still be unsafe or unusable if it uses the wrong evidence, exceeds a cost or latency limit, returns incomplete provider state, or stores data that should not be persisted. This reference makes those checks visible in code.

## How a run moves through the system

```text
request + allowed evidence
-> runId + request-fingerprint replay guard
-> OpenAI Responses API adapter
-> strict JSON Schema output
-> provider status + token/cost/latency data
-> deterministic verification
-> ACCEPTED / ABSTAINED / fail closed
-> sanitized JSONL journal
```

The provider adapter calls `POST /v1/responses`, sets `store: false`, asks for strict structured output, applies a timeout, and converts provider usage into a caller-supplied cost estimate.

## Try it

Prerequisite: Node.js 22.

```bash
npm test
npm run eval
```

`npm test` runs the reference test suite. `npm run eval` runs a small synthetic fixture set and reports a result for each case.

The default test and CI paths do **not** make a live model call or spend API budget. The provider boundary is injected so request shape, schema handling, telemetry, and failure behavior remain deterministic in CI.

## What to inspect

- [`src/runtime-gate.mjs`](src/runtime-gate.mjs) - provider adapter, runtime checks, cost/latency accounting, sanitized journaling, and eval logic.
- [`test/execution-path.test.mjs`](test/execution-path.test.mjs) - request boundary, persistence, and transport-failure tests.
- [`test/runtime-gate.test.mjs`](test/runtime-gate.test.mjs) - post-model safety checks.
- [`eval/fixtures.mjs`](eval/fixtures.mjs) - synthetic eval cases.
- [`tools/run-eval.mjs`](tools/run-eval.mjs) - reviewer-facing eval command.
- [`PUBLIC_BOUNDARY.md`](PUBLIC_BOUNDARY.md) - what is public and what stays private.

If you want to review the flow, start at `executeVerifiedRun`, follow the provider call into `createOpenAIResponsesProvider`, then inspect the verification gate and the journal record that is allowed to survive it.

## Failure cases this reference handles

The run fails closed when:

- output cites evidence that was not bound to the run;
- provider input tries to use an unbound reference;
- provider status is not `completed`;
- the provider request fails;
- latency or estimated cost exceeds the declared limit;
- a probability is invalid for the chosen decision state;
- hidden reasoning or secret-bearing fields would be persisted;
- structured output cannot be parsed under the expected contract;
- a persisted `runId` is reused with a different request fingerprint.

An incomplete provider run is rejected **before** the JSONL journal is written. An exact sequential retry of an already-persisted `runId` returns the prior verified record without calling the provider again.

## What the eval proves - and what it does not

The included fixtures test accepted, abstained, and fail-closed behavior against synthetic records. They are useful regression tests for the runtime.

They do **not** prove that the underlying forecasts are accurate, better than alternatives, production-scale, commercially adopted, or running with live-provider cost/latency measurements in public CI. The persisted replay guard is a sequential journal-level safety mechanism; it is **not** a distributed exactly-once guarantee for concurrent workers.

## Public and private boundary

This repository is a standalone reference for the engineering pattern. It is not a copy of the private product runtime, prompts, benchmark logic, live evidence, orchestration, or commercial controls.

No credential is stored by the adapter. Raw evidence is sent only to the configured provider call and is intentionally left out of the persisted run record. Persisted provider usage is allowlisted to input/output token counts; extra provider telemetry fields are discarded before journaling.

See [`PUBLIC_BOUNDARY.md`](PUBLIC_BOUNDARY.md) for the exact disclosure boundary.

## Related work

- [MachineOutcome](https://github.com/SamCT86/machineoutcome-case-study) - reconcile observed state before retrying a mutation.
- [Billable Meetings](https://github.com/SamCT86/billable-meetings-os-case-study) - turn contract rules and meeting evidence into billability decisions.
- [ReleaseProof](https://github.com/SamCT86/releaseproof-case-study) - verify that evidence belongs to the exact artifact being released.
- [PriceBriefs](https://github.com/SamCT86/pricebriefs-case-study) - qualify market evidence before using it in a pricing decision.

## Engineering accountability

I use AI tools as part of my implementation workflow. I remain responsible for the problem framing, architecture, acceptance criteria, verification design, debugging, tests, and release decisions.
