# System view

This is a simple public view of the evaluation flow. It is not the private production architecture.

```text
forecast request
-> clear forecast contract
-> forecast + evidence trail
-> real outcome
-> held-out / calibration checks
-> decision support
```

## 1. Forecast meaning

The forecast needs a clear definition before anyone knows the outcome.

## 2. Evidence trail

The system should preserve enough context to show which forecast is being evaluated, which inputs were used, and under what conditions.

## 3. Outcome

A forecast can only be judged after the relevant real-world outcome exists.

## 4. Held-out evaluation

A good demo is not strong evidence of a general advantage. The approach should also be tested on evidence that was not used to shape the result.

## 5. Alternatives

Any claimed advantage should be compared with simpler and cheaper alternatives when possible.

## 6. Economics

Accuracy is not the only thing that matters. Cost and latency can make a technically stronger forecast less useful in practice.

## Why this is public

This view shows the reasoning behind the system without publishing private contracts, benchmark code, ledgers, prompts, or commercial implementation details.
