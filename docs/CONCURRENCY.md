# Single-host concurrency boundary

This reference coordinates concurrent attempts for the same `runId` before a provider call is made.

The mechanism is intentionally small and inspectable:

1. Hash the `runId` into a claim-file path next to the journal.
2. Acquire the claim with atomic `open(..., 'wx')` semantics.
3. Store an owner token and the canonical request fingerprint in the claim.
4. Re-read the journal after winning the claim; replay if another worker already persisted the run.
5. Execute the provider only when no verified record exists.
6. Persist the verified record, then release only the claim owned by the current token.

A concurrent request using the same `runId` but a different request fingerprint fails closed. A stale claim is only reclaimable for the same request fingerprint; a stale conflicting fingerprint also fails closed instead of silently reusing the idempotency key for different semantics.

## What the tests prove

The public test suite covers:

- two concurrent calls in one Node process invoke the provider once;
- two separate Node processes sharing the same local filesystem invoke the provider once;
- a conflicting in-flight fingerprint fails closed without a second provider call;
- a stale conflicting fingerprint also fails closed before provider execution;
- a stale claim for the same request can be reclaimed;
- a provider failure releases the claim so a later retry can proceed;
- the journal still contains one verified record for the winning run.

## What this does not prove

This is not distributed exactly-once execution. The claim is local-filesystem coordination, not a consensus protocol or distributed lock service.

A crash after an external provider side effect but before journal persistence can still lead to a later retry. That case requires provider-side idempotency or reconciliation against external state.
