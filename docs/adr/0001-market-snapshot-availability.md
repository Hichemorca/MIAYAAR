# ADR 0001: Explicit Availability for Market Indicators

**Status:** Accepted on 2026-08-18  
**Decision owner:** Repository owner, through the approved option B decision

## Context

The canonical `ValuationEngine` requires a `MarketSnapshot`. The operational evidence service supplies verified local DLD transactions, but it does not supply validated measures of supply, demand, liquidity, or price trend. Treating missing indicators as numeric zeroes would turn missing evidence into fabricated market facts.

## Decision

`core/types/market.ts` represents supply, demand, liquidity, and price trend as an explicit availability union. The DLD adapter provides observable transaction statistics and marks each unavailable indicator with its source, reason, and observation time. It does not substitute a numerical default.

## Consequences

The valuation engine can receive a structurally valid, auditable market snapshot while downstream consumers can distinguish an unavailable market indicator from a measured zero. The adapter retains transaction-level evidence outside the snapshot and only maps approach inputs that are present in the submission or validated DLD data. Any valuation method requiring an absent input remains unavailable rather than receiving a synthetic value.
