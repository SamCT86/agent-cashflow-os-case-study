# Public disclosure boundary

This repository is a **standalone public engineering reference**, not an open-source release of the private Agent Forecast product and not a mirror of its source tree.

## Intentionally public

- a generic Responses API execution adapter;
- strict structured-output and runtime-verification contracts;
- synthetic fixtures and adversarial tests;
- sanitized run-state journaling;
- token/cost/latency accounting mechanics;
- offline eval mechanics and explicit failure states;
- non-sensitive architecture and decision rationale.

## Intentionally private

- private product/application source code;
- internal prompts, specialist instructions and proprietary orchestration;
- exact private forecast contracts and benchmark semantics;
- private ledgers, corpora, raw evidence and live-provider traces;
- credentials, secrets and environment configuration;
- unpublished endpoints, internal repository identities and immutable evidence refs;
- private economic mechanisms, commercial experiments and roadmap sequencing;
- any implementation detail whose disclosure would materially reproduce the private system.

## Guardrail

Public code must remain reconstructable from the public repository alone. It must not depend on copying private prompts, protected evaluation material, customer/user data, secret provider configuration or unpublished commercial logic.

The engineering claim is limited to what a reviewer can inspect and run here. No license to the private implementation is granted or implied by this case study.
