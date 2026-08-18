# Canonical Valuation Engine v1.2 — Live Verification

**Date:** 2026-08-18  
**Execution path:** `POST /api/trpc/valuation.run` on the pull-request branch  
**Methodology:** `MIAYAAR-METH-001` version `1.2`

## Submitted evidence-led property file

| Field | Value |
|---|---:|
| Asset type | Apartment |
| District | JUMEIRAH VILLAGE CIRCLE |
| Internal area | 100 sqm |
| Bedrooms | 1 |
| Annual rent | AED 120,000 |

## Observed result

The server completed the valuation through the canonical `ValuationEngine` with **12 eligible local DLD comparables** in a 90-day search window. It returned a **partial** result because the documented inputs supported sales comparison and income capitalization only; the cost and DCF approaches were explicitly unavailable rather than inferred.

| Result field | Observed value |
|---|---:|
| Baseline value | AED 1,580,755.15 |
| Lower bound | AED 1,469,730.91 |
| Upper bound | AED 1,698,070.22 |
| Methodology version in result | 1.2 |
| Active approaches | Sales Comparison; Income Capitalization |

## Audit and integrity outcomes

The persisted methodology registry accepted the new immutable v1.2 release without mutating the frozen v1.1 record. The response retained the DLD transaction evidence, approach-level metadata, the correlation identifier, and explicit warnings for unavailable approaches and provisional calculation rules. Market supply, demand, liquidity, and price-trend indicators were represented as unavailable under the approved contract and were not synthesized.

