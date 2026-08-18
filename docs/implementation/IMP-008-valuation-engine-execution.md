# IMP-008 — Valuation Engine Execution

## Status

**Implemented for deterministic evaluation.** This document records the
runtime behavior of `ValuationEngine` after replacing the former unavailable
stub. It does not change the frozen contracts or MIAYAAR-METH-001 v1.1.

## Scope and non-goals

`ValuationEngine` is an **orchestration and calculation boundary**. It accepts
prepared market evidence, applies the methods and scenario configuration, and
returns an immutable `Valuation`. It deliberately does not select comparables,
scrape or refresh transactions, geocode assets, estimate unsupported inputs,
call a machine-learning model, or manufacture a confidence score.

The data-provider layer must perform all source acquisition, validation,
deduplication, currency normalization, comparable selection, and adjustment
preparation before invoking the engine.

## Calculation behavior

| Approach | Eligibility | Calculation |
|---|---|---|
| Sales comparison | All property types; at least **5 valid comparables** | Arithmetic mean of adjusted comparable price per sqm × subject area |
| Income capitalization | Apartment, villa, townhouse, office, retail | `gross rent × (1 − vacancy) × (1 − operating expenses) ÷ cap rate` |
| Cost | Villa, townhouse, office, retail | `area × replacement cost per sqm × (1 − depreciation) + land value` |
| DCF | Apartment, villa, townhouse, office, retail, land | Discounted annual NOI plus discounted net terminal value |

The DCF terminal value uses the next year's NOI, an exit cap rate, and net exit
costs. All calculations are rounded to two decimal places only at output
boundaries, ensuring repeatable tests while retaining appropriate precision
within an approach.

## Scenarios, weighting, and result status

The engine runs `lower`, `baseline`, and `upper` independently. Each active
approach is adjusted by the product of the configured scenario multipliers and
is then weighted by the matching scenario weight. If an applicable approach is
not supported by usable data, its weight is re-normalized across the active
approaches. The engine returns `PARTIAL` with explicit warnings; it does not
substitute guessed data.

The reported **value** is always the `baseline` scenario result. The lower and
upper bounds are the minimum and maximum of all three scenario results. This
remains correct even if a future configuration does not order its scenario
multipliers monotonically.

| Situation | Output behavior |
|---|---|
| Invalid request, invalid weights, invalid multipliers, or mixed currencies | `ERROR` with a stable reason code |
| No applicable approach with usable evidence | `ERROR`, no numeric valuation |
| One or more applicable approaches unavailable | `PARTIAL`, transparent warnings, re-normalized active weights |
| All applicable approaches available | `SUCCESS` |

The engine verifies that every configured scenario weight vector sums to 1.0,
that rates are finite decimals, and that a single currency applies to prepared
money values. No implicit currency conversion is permitted.

## Determinism and auditability

The valuation identifier, result metadata, and creation time are derived from
the request and market snapshot timestamp. The engine never calls
`Date.now()`, uses random values, or changes any caller-owned input. Its
approach-level output includes count/statistic or input-rate metadata, and its
approach confidence is intentionally `0` rather than a fabricated percentage.

## Required next integration work

1. Implement an evidence-preparation provider that selects DLD comparables
   using explicit temporal, geographical, type, size, and transaction filters.
2. Establish governance for the overlapping per-approach data rates and
   `ValuationConfiguration.assumptions`; retain one approved source of truth
   for each assumption before production calibration.
3. Add currency conversion as a separately versioned provider if multi-currency
   inputs become supported. Never add it implicitly to this engine.
4. Add out-of-sample, date-split calibration tests by district and property
   type before publishing accuracy or confidence claims.
5. Add an explainability adapter that turns the approach metadata and evidence
   provenance into a reviewer-facing report without changing the engine result.

## Verification

The engine test suite verifies invalid request handling, no-data behavior,
applicable approach execution, scenario bounds, partial results and weight
normalization, the five-comparable rule, configuration validation, and
bit-for-bit determinism.
