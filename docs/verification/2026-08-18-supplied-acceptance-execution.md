# Supplied acceptance-suite execution record

**Execution date:** 2026-08-18  
**Branch:** `agent/canonical-engine-v1_2`  
**Methodology:** `MIAYAAR-METH-001 v1.2`

## Executed checks

| Check | Result | Evidence |
| --- | --- | --- |
| TypeScript contracts | Passed | `npm run check` completed with no diagnostics. |
| Full unit and acceptance suite | Passed | Vitest completed 11 files and 36 tests successfully. |
| Supplied-suite executable subset | Passed | `tests/acceptance/supplied-acceptance.test.ts` completed 12 tests. |
| Production build | Passed with advisory | `npm run build` succeeded; the largest client bundle remains 686.50 kB minified, producing Vite's advisory chunk-size warning. |
| Browser preview | Passed | The English MIAYAAR form loaded on the PR-branch preview; the form exposes its required validation constraints before submission. |
| Live valuation path | Passed | The tRPC valuation path produced an auditable partial result from local DLD evidence, retaining unavailable-method warnings rather than inventing inputs. |
| Malicious-shape input validation | Passed | SQL-injection- and XSS-shaped `propertyType` inputs are rejected at the public tRPC validation boundary. |
| DLD source verification | Passed with data-fixture discrepancy | The supplied file has 30,325 records, 30,306 unique transaction IDs, 26,764 eligible records, 3,561 rejected records, and no normalization skips. |

## Important non-passing / non-applicable supplied expectations

The suite is **not represented as 60/60 passed**. Its exact placeholder imports and several expectations are not executable against the actual tRPC/React repository. The governing reasons are documented in `2026-08-18-supplied-acceptance-suite-mapping.md`.

In particular, the supplied 30,475-row target does not match the actual source file. Nineteen duplicate source transaction identifiers explain the difference between 30,325 input rows and 30,306 unique evidence records; no synthetic rows were inserted to satisfy that expectation.

The anonymous `401`/`403` expectations are also not accepted as passing criteria because `valuation.run` is a deliberately public procedure. Schema validation, server-side calculation, evidence governance, and audit recording remain active. Introducing authentication or rate limiting requires an explicit product-policy change rather than silently changing acceptance behavior.

The requested 1,000-request load test is deferred. The current request path writes auditable valuation-request records to the shared evidence environment, so synthetic load must be run against an isolated environment with an agreed latency/error budget; it must not create artificial production audit history.

## Conclusion

The executable, architecture-aligned acceptance cases pass. The remaining supplied cases are recorded as **invalid for this architecture**, **data-fixture discrepancies**, or **deferred operational tests** rather than being converted into fabricated tests, mock abstractions, or claims of success.
