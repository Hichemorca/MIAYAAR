# Supplied acceptance-suite mapping — individual 60-case ledger

**Source:** `/home/ubuntu/upload/pasted_content_3.txt`
**Repository branch:** `agent/canonical-valuation-engine-v1-1`
**Governing implementation:** core contracts, canonical valuation engine, `MIAYAAR-METH-001 v1.2`

## Status vocabulary

`Passed` means that the requested invariant was demonstrated by a repository test or a recorded live check at the real boundary. `Passed (equivalent)` means that the supplied code cannot compile unchanged but its intended behaviour was demonstrated at the real tRPC/React/canonical-engine boundary. `Invalid` means that its requested assertion conflicts with the governing architecture or invents a non-existent repository API. `Deferred` means that a valid operational concern requires an isolated environment or an agreed policy before it can be exercised. `Failed (fixture discrepancy)` means that the supplied data fixture does not match the verified source and was not altered to make the assertion pass.

## Individual case ledger

| Case | Supplied intent | Status | Execution evidence | Governing reason |
| --- | --- | --- | --- | --- |
| 1 | Property core versus API submission | Passed (equivalent) | Canonical adapter and public `valuation.run` input boundary; full type check passes. | `api/types` does not exist; the actual submission schema is the tRPC router input and is adapted server-side. |
| 2 | Valuation core versus API response | Passed (equivalent) | Live `valuation.run` verification returned canonical valuation/result data. | `ValuationResponse` is a placeholder; the real tRPC response is the canonical result/report shape. |
| 3 | Result core versus engine output | Passed (equivalent) | Full Vitest suite plus canonical-engine tests pass. | The engine returns `ResultStatus` and canonical valuation data rather than the placeholder `ValuationOutcome` import. |
| 4 | Money core versus fixture | Passed (equivalent) | Type check and canonical valuation scenarios in `AC-08`. | Money is exercised through real AED valuation bounds rather than an untracked fixture-only assertion. |
| 5 | MarketSnapshot core versus DLD adapter | Passed (equivalent) | Adapter acceptance coverage and no-fabricated-market-indicator checks. | The adapter records market-indicator availability explicitly under ADR-0001. |
| 6 | Apartment weights match methodology | Passed | `AC-03` asserts 0.50/0.35/0.10/0.05. | Frozen v1.2 baseline allocation is the current governed configuration. |
| 7 | Baseline adjustments match placeholder configuration | Invalid | Reviewed against frozen v1.2 configuration. | The supplied `config.adjustments.baseline` API and its blanket 1.0 assertion are not a canonical v1.2 contract. |
| 8 | Assumptions match placeholder configuration | Invalid | Reviewed against frozen v1.2 configuration. | The supplied `config.assumptions` API and two hard-coded assumptions are not the current contract. |
| 9 | `getApplicableApproaches()` matches methodology | Passed (equivalent) | `AC-09` verifies unavailable approaches are disclosed; live valuation records active approaches. | The private placeholder method is not the public engine API; canonical results expose actual approach applicability. |
| 10 | Fewer than five comparables yields partial valuation | Invalid | `AC-07` passes by returning unavailable/no valuation when evidence is absent. | The no-value-without-local-evidence policy forbids a valuation from fewer than the minimum evidence threshold. |
| 11 | Search window fixed at 180 days | Invalid | Comparable-search implementation and methodology review. | Search is staged/local; a fixed 180-day rule would be an ungoverned methodology change. |
| 12 | LAND is supported and has DCF | Passed | `AC-04` asserts LAND baseline weights with DCF 0.20. | LAND is canonical in frozen v1.2. |
| 13 | WAREHOUSE is not supported | Passed | `AC-04` and `AC-10` assert no configuration and explicit unsupported outcome. | No dedicated frozen warehouse methodology has been approved. |
| 14 | DLD record converts to Property | Passed (equivalent) | `core-valuation-adapter` coverage and full type check pass. | The supplied `convertDLDToProperty` function does not exist; the real adapter creates core property contracts. |
| 15 | DLD record converts to MarketSnapshot | Passed (equivalent) | Adapter acceptance coverage and ADR-0001 availability representation. | The real adapter does not invent a snapshot from one record; unavailable indicators stay auditable. |
| 16 | Property converts to ValuationRequest | Passed (equivalent) | Live tRPC valuation path and core adapter coverage. | The request is constructed by the server orchestrator rather than a public `createValuationRequest` helper. |
| 17 | ValuationResult converts to Report | Passed (equivalent) | Live valuation report and UI output verification. | Report assembly is internal to the canonical/orchestration path, not `convertToReport`. |
| 18 | Metadata is preserved through layers | Passed (equivalent) | Canonical scenario execution carries methodology identity/version and request metadata. | Actual metadata is structured by canonical contracts, not the supplied ad-hoc object. |
| 19 | Warnings are preserved through layers | Passed | `AC-09` asserts `VAL_WARN_APPROACH_UNAVAILABLE`; live result retains warnings. | Missing inputs must be disclosed, not suppressed. |
| 20 | Errors are preserved through layers | Passed (equivalent) | Invalid public inputs are rejected at the tRPC boundary; unavailable engine results include reason codes. | The supplied `errors` array is not the canonical error representation. |
| 21 | API delegates to ValuationEngine | Passed (equivalent) | Live `valuation.run` record and orchestration/canonical-engine tests pass. | The supplied `api` object is absent; tRPC caller is the actual boundary. |
| 22 | API returns Result shape | Passed (equivalent) | Live `valuation.run` verification returned status and canonical data. | The real shape is a typed tRPC output, not the supplied `data` placeholder shape. |
| 23 | Missing data returns partial | Passed (equivalent) | Recorded live valuation returned partial with unavailable-approach disclosures. | Partial is valid when at least one evidence-led approach is available. |
| 24 | Invalid input returns `status: error` | Invalid | `AC-05`, `AC-05a`, and `AC-05b` pass by rejecting input at validation. | Invalid transport input is rejected before an engine result is created, so it cannot truthfully return the requested result shape. |
| 25 | Orchestrator performs no calculation | Passed (equivalent) | Orchestrator delegates through the core adapter to `ValuationEngine`; full suite passes. | The supplied class/method inspection is not the repository API, but calculation remains in the canonical engine. |
| 26 | Adapter preserves all fields | Passed (equivalent) | Adapter coverage and live request/report trace. | Preservation is verified through canonical contracts, not the non-existent `adaptProperty` helper. |
| 27 | UI sends correct PropertySubmission | Passed (equivalent) | Browser preview and live valuation path from the English form. | `PropertyForm` is not a class; `Home.tsx` submits a typed tRPC payload. |
| 28 | UI displays result correctly | Passed (equivalent) | Browser/live valuation verification shows returned valuation report. | `ResultView` is not a class; the real React report component renders canonical output. |
| 29 | UI displays warnings | Passed (equivalent) | Live partial result retained unavailable-approach warnings in the report. | Warning rendering is React output, not a `ResultView` mutable field. |
| 30 | UI displays errors | Passed (equivalent) | Required-field validation was observed before submission. | The supplied error-view API is invented; validation and engine reason rendering use real UI paths. |
| 31 | UI displays partial status | Passed (equivalent) | Live partial valuation path observed in the English report. | Partial is represented by the report/status presentation, not a `ResultView.status` field. |
| 32 | UI performs no calculation | Passed (equivalent) | All valuation calls run through `valuation.run`; client contains no valuation engine invocation. | The supplied `ResultView.calculate` inspection is not applicable to React. |
| 33 | v1.2 SHA-256 matches expected SHA | Invalid | `AC-01` verifies document identity/version/frozen state. | No governed expected methodology SHA fixture exists; inventing one would create a parallel source of truth. |
| 34 | v1.1 cannot be modified | Passed (equivalent) | Frozen v1.1 source remains separate; current engine resolves frozen v1.2. | No runtime `modifyMethodology` API exists; immutability is enforced by governed source/release control. |
| 35 | DCF-LAND decision is logged | Passed (equivalent) | Frozen LAND configuration and canonical decision/ADR documentation. | Decision evidence is repository documentation/configuration, not a runtime `decisionLog` string. |
| 36 | Result contains methodology version | Passed | `AC-08` asserts `methodologyVersion === '1.2'`. | Every available canonical valuation identifies its methodology release. |
| 37 | Report contains methodology version | Passed (equivalent) | Live English report exposes methodology v1.2. | Report is rendered from canonical output rather than `createReport`. |
| 38 | Property without area returns error | Passed (equivalent) | `AC-06` rejects zero area at public input validation. | The actual boundary rejects the request before engine execution instead of emitting the supplied error result. |
| 39 | Property without type returns error | Passed (equivalent) | `AC-05` rejects unknown type; schema requires valid type. | `undefined` never reaches the engine through the public schema. |
| 40 | Property without district returns error | Passed (equivalent) | Browser validation requires district before submission. | The public form/router owns required-field validation; the supplied direct engine mutation is not supported. |
| 41 | Cross-district comparables return partial | Invalid | Comparable search selects governed local evidence. | Arbitrary cross-district comparables are not a public engine input and would weaken locality policy. |
| 42 | Comparables older than 730 days warn | Invalid | Comparable-search methodology review. | The fixed 730-day threshold and warning text are not frozen v1.2 rules. |
| 43 | Comparables newer than 30 days return success | Invalid | Result status policy reviewed. | Freshness alone cannot require success; missing approach inputs can correctly yield partial. |
| 44 | Zero gross rent returns partial | Passed (equivalent) | `AC-09` verifies unavailable income approach is disclosed without synthetic value. | Gross rent is not a public direct engine payload; missing/zero income is represented through unavailable approach evidence. |
| 45 | Vacancy rate 0% returns success | Invalid | Frozen methodology inputs reviewed. | The supplied raw income payload and mandatory success assertion are not public contracts. |
| 46 | Vacancy rate 100% returns success | Invalid | Frozen methodology inputs reviewed. | A 100% vacancy cannot mandate success; available approaches/evidence govern result status. |
| 47 | Missing USD exchange rate returns error | Invalid | DLD evidence/market contracts use AED and availability states. | USD currency injection is not a supported public market input for this Dubai DLD valuation path. |
| 48 | 100 concurrent requests all succeed | Deferred | No synthetic concurrent run was made against shared audit storage. | Each request writes an audit record; test requires isolated environment and accepts partial/unavailable outcomes. |
| 49 | 1,000 requests per minute | Deferred | No synthetic load run was made against shared audit storage. | Requires isolated environment plus agreed latency/error budget; sequential test code also does not measure concurrency. |
| 50 | 30,325 DLD records processed | Passed | Read-only importer verification reports 30,325 source rows, 26,764 eligible, 3,561 rejected, zero skipped. | The ledger deduplicates 19 repeated transaction IDs to 30,306 evidence rows; it does not fabricate duplicates. |
| 51 | Anonymous API is 401 | Invalid | Router policy reviewed. | `valuation.run` is deliberately public; making it authenticated is a product-policy change. |
| 52 | Invalid bearer token is 403 | Invalid | Router policy reviewed. | The procedure is public and does not claim bearer-token authorization semantics. |
| 53 | SQL injection protection | Passed | `AC-05a` rejects the SQL-shaped `propertyType` at the tRPC schema boundary. | Input cannot reach evidence queries. |
| 54 | XSS protection | Passed | `AC-05b` rejects the XSS-shaped `propertyType` before report rendering. | Input cannot reach report rendering. |
| 55 | No sensitive data in logs | Deferred | No synthetic log scraping was run. | Requires a controlled security/audit-log review that avoids exposing or creating secrets in test artefacts. |
| 56 | API documentation helper is complete | Invalid | Router contracts and verification docs reviewed. | `getAPIDocs()` is a placeholder; documentation is repository-based, not a runtime endpoint. |
| 57 | Engine documentation helper is complete | Invalid | Canonical engine source/docs reviewed. | `getEngineDocs()` is a placeholder; no invented runtime documentation API was added. |
| 58 | Methodology documentation helper is complete | Invalid | v1.2 methodology and ADR records reviewed. | `getMethodologyDocs()` is a placeholder; governed documentation is static/versioned. |
| 59 | Model documentation helper is complete | Invalid | `core/types` and `core/results` contracts reviewed. | `getModelDocs()` is a placeholder; contracts are the model source of truth. |
| 60 | Test documentation helper is complete | Invalid | Acceptance test and verification records reviewed. | `getTestDocs()` is a placeholder; test evidence is repository documentation. |

## DLD source verification

Read-only verification completed on the supplied DLD input (SHA-256 `5dfd59e6f99c3c3f00945c9c52a393134a3b5a2ec44e925f761754bd059070a2`). It found 30,325 source records: 26,764 eligible, 3,561 rejected, and zero normalization skips. Nineteen source records share a transaction identifier, so `marketTransactions` correctly contains 30,306 unique evidence records. Any requested 30,475-row assertion is a **Failed (fixture discrepancy)**, not a condition to satisfy by inserting synthetic records.

## Acceptance conclusion

No outcome is reported as “60/60 passed.” The executable, architecture-aligned checks pass; the remainder is individually classified above as invalid, deferred, or a source-fixture discrepancy. This preserves the evidence, methodology, and server-only calculation policies rather than weakening them merely to satisfy placeholder tests.
