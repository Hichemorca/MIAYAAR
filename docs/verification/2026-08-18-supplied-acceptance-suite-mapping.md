# Supplied Acceptance Suite — Scope and Contract Mapping

## Source

The user supplied a sixty-case acceptance outline. It requests ten named suites covering contracts, methodology, data flow, API/orchestration, UI/API, versioning, edge cases, performance, security, documentation, and end-to-end flow. Its stated target is 60/60 tests passing.

## Executable, source-aligned intent

The suite's core intent is valid and has been mapped to the canonical repository: methodology identity and weights; the `LAND` / `WAREHOUSE` policy; public input validation; absence of synthetic values; ordered lower/baseline/upper scenarios; explicit unavailable-approach warnings; immutable methodology metadata; the DLD adapter; orchestrator delegation; and rendered UI form availability. These are implemented through executable Vitest acceptance coverage, the existing core tests, type checking, production build, direct API verification, and a running-browser observation.

## Expectations that cannot be represented as passing assertions without contradicting the governing architecture

| Supplied case(s) | Reason for non-adoption as a passing test |
| --- | --- |
| Test 10 expects a partial valuation with fewer than five local comparables | MIAYAAR's governing no-value-without-local-evidence rule requires unavailable evidence rather than a valuation when the minimum evidence threshold is not met. |
| Test 11 fixes a 180-day search window | The implemented methodology uses a staged local search window and must not be replaced by a hard-coded 180-day policy without a governed methodology release. |
| Tests 51–52 expect anonymous requests to be `401` / invalid bearer tokens to be `403` | `valuation.run` is intentionally a public tRPC procedure; its controls are schema validation, server-side calculation, evidence governance, and audit recording. Enforcing authentication is a product-policy change, not a test-only correction. |
| Tests 48–49 require every request to return `success` | MIAYAAR deliberately returns partial or unavailable results whenever evidence or approach inputs are missing; a success-only assertion violates the explicit disclosure policy. |
| Tests 14–20 and 27–32 reference placeholder APIs/classes (`api/types`, `PropertyForm`, `ResultView`) that do not exist in the tRPC/React architecture | Equivalent behavior is tested against actual repository boundaries and the live UI; the supplied imports cannot compile as written. |
| Tests 56–60 call undocumented placeholder functions such as `getAPIDocs()` | Documentation is checked through repository documents and source contracts, not invented runtime helpers. |
| The E2E command names a file but supplies no executable case code | The equivalent live valuation journey is executed and recorded separately. |

## Acceptance principle

No suite is counted as "60/60 passed" merely by writing tests around made-up abstractions or weakening evidence, public-access, or methodology policy. The final report distinguishes passed executable cases, observed live behavior, deferred load/security work, and invalid expectations with the governing reason.

## DLD ledger verification

The read-only source verification completed against the supplied Dubai Land Department file (SHA-256 `5dfd59e6f99c3c3f00945c9c52a393134a3b5a2ec44e925f761754bd059070a2`). It contains 30,325 source records: 26,764 eligible, 3,561 rejected, and zero records skipped by normalization. Nineteen source records share a transaction identifier, so the evidence ledger correctly contains 30,306 unique `marketTransactions` rows rather than manufacturing duplicate evidence rows. The supplied 30,475-row expectation is therefore not met by the available source file and is recorded as a data-fixture discrepancy, not a defect to conceal by inserting synthetic rows.
