# Verification approach

Agent Cashflow OS treats forecast quality as an empirical question rather than a property of how convincing the output looks.

## Verification layers

### 1. Contract
The forecast must have explicit semantics before the outcome is known.

### 2. Identity and provenance
The forecast and later outcome need stable enough identity to be evaluated as the intended pair.

### 3. Outcome
The system needs the relevant real outcome before it can assess forecast performance.

### 4. Held-out comparison
Performance should be evaluated on held-out evidence rather than only on examples used during development.

### 5. Baselines
A forecast mechanism should be compared against cheap adequate alternatives when comparable.

### 6. Calibration
The system direction includes calibration-state concepts so confidence can be evaluated rather than merely displayed.

### 7. Economics
Any technical advantage should still be examined through cost and latency.

## What AI-assisted implementation must survive

- Was the forecast contract frozen before the outcome?
- Is provenance sufficient to connect the forecast and outcome?
- Is the evaluation leakage-safe enough for the claim?
- Does the mechanism beat an adequate baseline?
- Does the advantage survive cost and latency?
- Is the conclusion still “not proven” when the evidence is incomplete?

## Public limit

The private implementation contains the exact forecast contracts, benchmark semantics, ledger structures and evaluation code. Those are intentionally not published here.
