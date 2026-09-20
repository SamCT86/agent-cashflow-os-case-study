# Verification approach

Agent Forecast Foundry treats forecast quality as something that must be measured, not inferred from how convincing an answer looks.

## What needs to be true

### 1. Clear forecast meaning
The forecast must be defined before the outcome is known.

### 2. Stable identity and evidence
The system needs enough provenance to connect the right forecast with the right later outcome.

### 3. A real outcome
A forecast cannot be evaluated until the relevant outcome exists.

### 4. Held-out testing
Performance should be checked on evidence that was not used to shape the result.

### 5. Simple baselines
A more complex method should be compared with cheaper, simpler alternatives when that comparison is possible.

### 6. Calibration
Confidence should be tested against what actually happens, not just displayed as a number.

### 7. Cost and latency
A technical advantage only matters if it remains useful after cost and response time are included.

## Questions the implementation must survive

- Was the forecast meaning fixed before the outcome?
- Can we prove which evidence belonged to the run?
- Is the evaluation protected from obvious leakage?
- Does the approach beat a reasonable baseline?
- Does any advantage survive cost and latency?
- Do we still say "not proven" when the evidence is incomplete?

## Public limit

The exact private forecast contracts, benchmark implementation, ledger structures, and evaluation code are intentionally not published here.
