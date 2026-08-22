# UI Comparable Selection Verification — 2026-08-22

## Scope

Phase 7 adds a governed, read-only presentation path for Comparable Selection. It introduces `comparableSelection.preview` with only `district`, `propertyType`, `areaSqm`, and `asOf` as inputs. The procedure reads DLD-backed candidates, passes them to the existing deterministic CS-v1.0 service, and returns that service's selected and excluded records.

## Contract boundary

| Boundary            | Implemented behavior                                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Candidate source    | DLD-backed market-transaction records only; no write, import, or fallback path.                                     |
| Selection           | Existing `selectComparables` CS-v1.0 service only; no algorithm, threshold, ranking, or policy change.              |
| Selected output     | Server-returned property reference, district, property type, transaction date, area, sale price, and price per sqm. |
| Excluded output     | The same server-authored transaction facts plus only the CS-v1.0 exclusion reason.                                  |
| Insufficient output | Existing `insufficient` union with the contract-required count; no manufactured replacement comparison.             |
| Presentation        | Read-only report panel; it does not feed valuation, confidence, diagnostics, or Market Intelligence.                |

## Explicit non-goals

- No change to CS-v1.0 selection hierarchy, match criteria, capacity, ranking, or unresolved-policy behaviour.
- No change to valuation methodology v1.2, weights, coefficients, valuation engine, confidence, or public valuation-report contract.
- No new comparable criteria, source, fallback, diagnostics, or confidence calculation.
- No comparison is created, altered, or inferred by the client.

## Automated coverage

The test suite covers the following bounded cases:

1. The DLD adapter passes raw DLD candidates through CS-v1.0 and displays only returned selected facts and exclusion reasons.
2. Rejected and location-mismatched records retain CS-v1.0's existing exclusion reasons.
3. The preview procedure accepts only the approved four inputs and rejects unapproved scope-expansion input.
4. The UI distinguishes selected, excluded, insufficient, and no-preview (`UNAVAILABLE`) states without a replacement comparison, confidence, or fallback.

## Quality-gate record

| Check            | Result                                                                                                                                  |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript       | `pnpm run check` passed.                                                                                                                |
| Vitest           | `pnpm test` passed: 40 files and 166 tests.                                                                                             |
| Production build | `pnpm run build` passed. The existing Vite chunk-size advisory remains unrelated to this change.                                        |
| Formatting       | `pnpm run format:check` passed. It retains the repository's established exclusions for baseline files that predate Prettier compliance. |
| Diff hygiene     | `git diff --check` passed.                                                                                                              |

### Browser boundary check

A local Apartment / Business Bay / 100 sqm submission reached the existing generic valuation failure state. As no valuation report became available, the report-mounted Comparable Selection panel was not rendered. No server preview, comparison, selection, exclusion, or sample was fabricated to force a visual result.
