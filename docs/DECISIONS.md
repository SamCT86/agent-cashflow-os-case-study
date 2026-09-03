# System requirements and trade-offs

These are requirements and trade-offs represented by the current Agent Cashflow research/build direction. They explain the product/system boundary without claiming that I personally originated every low-level engineering or statistical choice used to implement it.

My direct ownership is the product/research direction, high-level blueprint, expert/persona orchestration, constraints, acceptance criteria and quality gates. The implementation process is heavily AI-assisted.

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

## Questions this case study is intended to create

- What product/research hypothesis is being tested?
- What proof gate should exist before a forecast is treated as useful?
- Why compare against cheap adequate alternatives?
- Why keep unproven states explicit?
- Which parts of the blueprint were requirements I set, and which low-level technical/statistical choices came from the AI-assisted implementation process?
