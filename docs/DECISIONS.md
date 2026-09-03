# Selected engineering decisions

## 1. Freeze the meaning before measuring performance

A forecast should have explicit semantics before the system evaluates whether it was useful.

**Trade-off:** more upfront contract work, less room to reinterpret a prediction after the outcome is known.

## 2. Preserve provenance

A result without enough context about its origin is weaker evidence.

**Trade-off:** more metadata and discipline, stronger auditability.

## 3. Prefer held-out evidence to impressive examples

The project direction treats leakage-safe held-out comparison as stronger evidence than a curated demonstration.

**Trade-off:** harder to produce flattering results, easier to understand whether an advantage is real.

## 4. Compare against cheap adequate alternatives

The relevant question is not whether a sophisticated forecast beats nothing. It is whether it beats simpler alternatives by enough to matter.

**Trade-off:** raises the bar for the product thesis.

## 5. Include cost and latency in usefulness

A better forecast can still be a worse product if the improvement does not survive variable cost or latency.

**Trade-off:** prevents optimizing a benchmark independently of the operational decision.

## 6. Keep unproven states explicit

The existence of contracts, synthetic tests or a build does not prove real forecast advantage or market demand.

**Trade-off:** less hype, stronger credibility.

## Interview questions this should create

- How would you prevent forecast leakage?
- What baseline would you use and why?
- How do you define event identity?
- What does calibration mean in this system?
- How much advantage is enough once cost and latency are included?
