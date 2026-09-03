# System view

This is a public abstraction of the evaluation flow, not the private implementation architecture.

```text
┌────────────────┐
│ Forecast request│
└───────┬────────┘
        ↓
┌────────────────────┐
│ Explicit forecast   │
│ contract            │
└─────────┬──────────┘
          ↓
┌────────────────────┐
│ Forecast +          │
│ provenance          │
└─────────┬──────────┘
          ↓
┌────────────────────┐
│ Outcome observation│
└─────────┬──────────┘
          ↓
┌────────────────────┐
│ Held-out /          │
│ calibration evidence│
└─────────┬──────────┘
          ↓
┌────────────────────┐
│ Decision support   │
└────────────────────┘
```

## Boundary 1 — contract semantics

The forecast needs explicit meaning before its quality can be evaluated.

## Boundary 2 — provenance

The system should preserve enough context to understand which forecast is being evaluated and under what conditions.

## Boundary 3 — outcome

A forecast becomes evaluable only after the relevant outcome exists.

## Boundary 4 — held-out evaluation

Demonstration examples are weak evidence of general advantage. The current research direction emphasizes held-out comparison.

## Boundary 5 — alternatives

Any claimed advantage should be compared against simpler, cheaper alternatives rather than only against failure.

## Boundary 6 — economics

Decision value depends not only on accuracy but also on the cost and latency required to produce the forecast.

## Why this is public

The case study exposes the evaluation logic and product reasoning without publishing exact contracts, benchmark code, ledgers or economic implementation.
