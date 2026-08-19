# ADR-010 — Explicit Availability for Market Snapshot Indicators

**Status:** Accepted on 2026-08-18
**Date:** 2026-08-18
**Decision owner:** Repository owner, through the approved option B decision

## Context

The canonical `ValuationEngine` requires a `MarketSnapshot`. The operational evidence service supplies verified local DLD transactions, but it does not supply validated measures of supply, demand, liquidity, or price trend. Treating missing indicators as numeric zeroes would turn missing evidence into fabricated market facts.

## Decision

`core/types/market.ts` represents supply, demand, liquidity, and price trend as an explicit availability union. The DLD adapter provides observable transaction statistics and marks each unavailable indicator with its source, reason, and observation time. It does not substitute a numerical default.

## Rationale

An explicit unavailable state preserves the distinction between an observed zero and an unobserved market indicator. This keeps the market snapshot auditable while preventing the evidence service from turning a data gap into a synthetic numeric claim.

## Consequences

The valuation engine can receive a structurally valid, auditable market snapshot while downstream consumers can distinguish an unavailable market indicator from a measured zero. The adapter retains transaction-level evidence outside the snapshot and only maps approach inputs that are present in the submission or validated DLD data. Any valuation method requiring an absent input remains unavailable rather than receiving a synthetic value.

## Alternatives Considered

1. **Represent unavailable indicators as numeric zeroes.** Rejected because zero would be indistinguishable from a measured market fact and would violate the evidence-led methodology.
