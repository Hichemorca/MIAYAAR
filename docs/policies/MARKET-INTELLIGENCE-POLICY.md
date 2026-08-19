# Market Intelligence Policy v1.0

**Status:** Approved
**Effective date:** 2026-08-19
**Policy owner:** Architecture Team
**Policy version:** `MI-v1.0`
**Next review:** 2027-02-19

> This policy governs an auditable, read-only Market Intelligence service. It does not alter valuation outputs, actual sale prices, methodology weights or coefficients, confidence thresholds, or comparable-selection rules.

## 1. Evidence source and scope

The sole evidence source for v1.0 is eligible Dubai Land Department (`DLD`) transaction evidence held in `marketTransactions`. The service uses only `district`, `propertyType`, `pricePerSqm`, `transactionDate`, `sourceTransactionId`, `sourceChecksum`, and `ingestedAt` from eligible DLD transactions.

The v1.0 benchmark dimension is exactly **District + Property Type**. Property, project, city, building, community, and size category are explicitly outside this release. Dubai is the DLD source scope, not a transaction-level city field.

## 2. Temporal universe and availability

`asOf` is required for every request. A transaction belongs to the benchmark only when all of the following are true:

| Condition        | Rule                                         |
| ---------------- | -------------------------------------------- |
| Source           | `source = "DLD"`                             |
| Evidence status  | `evidenceStatus = "eligible"`                |
| District         | Exact requested `district`                   |
| Property type    | Exact requested `propertyType`               |
| Lower time bound | `transactionDate >= asOf - 90 calendar days` |
| Upper time bound | `transactionDate <= asOf`                    |

There is one benchmark level and **no fallback**. If fewer than five transactions meet every condition, the service returns `unavailable` with reason `insufficient_benchmark_evidence`. It must not widen geography, property type, period, or evidence criteria, and it must not return a synthetic numeric substitute.

## 3. Statistical output

For an available benchmark, the service returns descriptive statistics for `pricePerSqm` only:

| Statistic           | Definition                                                                |
| ------------------- | ------------------------------------------------------------------------- |
| `mean`              | Arithmetic mean of the selected `pricePerSqm` observations.               |
| `standardDeviation` | Population standard deviation across the complete selected benchmark set. |
| `count`             | Number of selected eligible DLD transactions.                             |
| `min`               | Lowest selected `pricePerSqm`.                                            |
| `max`               | Highest selected `pricePerSqm`.                                           |

Version 1.0 does not accept a candidate price and does not produce an `inconsistent` classification, valuation adjustment, confidence label, recommendation, or threshold-based decision. The descriptive output is independent market context only.

## 4. Provenance

Every result, including an unavailable result, carries the following provenance:

| Field                  | Meaning                                                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `source`               | Constant evidence source: `DLD`.                                                                                          |
| `policyVersion`        | Constant policy identifier: `MI-v1.0`.                                                                                    |
| `asOf`                 | Request cut-off timestamp.                                                                                                |
| `filters`              | The requested district, property type, and inclusive 90-day window.                                                       |
| `recordCount`          | Count of eligible records selected by the policy filters.                                                                 |
| `records`              | One entry per selected transaction, binding `sourceTransactionId`, `sourceChecksum`, `transactionDate`, and `ingestedAt`. |
| `sourceTransactionIds` | Ordered transaction identifiers derived from `records`.                                                                   |
| `sourceChecksums`      | Ordered per-record checksums derived from `records` in the same order.                                                    |

The policy uses `transactionDate`, not `saleDate`; `sourceTransactionId`, not `transactionId`; and `salePriceAed` is not a Market Intelligence v1.0 benchmark metric.

## 5. Architectural boundaries

The Market Intelligence service is server-side and read-only. Its evidence provider may query DLD evidence, but it must not import or invoke the Valuation Engine, Confidence Engine, valuation orchestrator, or comparable-search logic. No dashboard, diagnostics UI, endpoint, database migration, or valuation audit write is included in this policy release.

## 6. Change control

Adding an evidence source, benchmark dimension, fallback level, historical window, metric, classification, or downstream valuation use requires an explicit policy revision and the applicable architecture review. Changes to the frozen valuation methodology remain subject to ADR-011.
