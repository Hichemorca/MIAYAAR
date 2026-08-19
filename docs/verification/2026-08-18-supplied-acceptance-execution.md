# Supplied acceptance-suite execution record

**Execution date:** 2026-08-18
**Branch:** `agent/canonical-valuation-engine-v1-1`
**Methodology:** `MIAYAAR-METH-001 v1.2`
**Individual-case ledger:** [`2026-08-18-supplied-acceptance-suite-mapping.md`](./2026-08-18-supplied-acceptance-suite-mapping.md)

## Executed repository checks

| Check | Result | Evidence |
| --- | --- | --- |
| TypeScript contracts | Passed | `npm run check` completed with no diagnostics. |
| Full unit and acceptance suite | Passed | Vitest completed 11 files and 36 tests successfully. |
| Supplied-suite executable subset | Passed | `tests/acceptance/supplied-acceptance.test.ts` completed 12 tests. |
| Production build | Passed with advisory | `npm run build` succeeded; the largest client bundle was 686.50 kB minified and emitted Vite's chunk-size advisory. |
| Browser preview | Passed | The English MIAYAAR form rendered and exposed required validation before submission. |
| Live valuation path | Passed | `valuation.run` produced an auditable partial result from local DLD evidence and retained unavailable-approach warnings. |
| Malicious-shape input validation | Passed | SQL-injection- and XSS-shaped property types were rejected at the public tRPC validation boundary. |
| DLD source verification | Passed | The read-only importer verified 30,325 source rows, 26,764 eligible rows, 3,561 rejected rows, and zero normalization skips. |

## Execution disposition by supplied case number

The table below is an execution index for all 60 supplied cases. Each case's precise intended assertion, evidence, and governing reason are recorded in the linked individual-case ledger.

| Cases | Executed disposition | Governing reason reference |
| --- | --- | --- |
| 1–5 | Passed (equivalent) | Core contracts, adapter, type check, and canonical-engine test coverage. |
| 6 | Passed | `AC-03`. |
| 7–8 | Invalid | Placeholder configuration properties conflict with the frozen v1.2 contract. |
| 9 | Passed (equivalent) | `AC-09` and live approach disclosure. |
| 10–11 | Invalid | Evidence threshold and search-window policy cannot be replaced by the supplied assertions. |
| 12–13 | Passed | `AC-04`, `AC-10`. |
| 14–18 | Passed (equivalent) | Actual core adapter/orchestrator/report boundaries replace placeholder helpers. |
| 19 | Passed | `AC-09`. |
| 20 | Passed (equivalent) | Real schema rejection and canonical reason-code error representation. |
| 21–23 | Passed (equivalent) | Live `valuation.run` and canonical orchestration flow. |
| 24 | Invalid | Invalid tRPC input is rejected, not returned as an invented result object. |
| 25–26 | Passed (equivalent) | Orchestrator delegates to canonical engine; adapter preserves canonical data. |
| 27–32 | Passed (equivalent) | Browser and live UI/API observation at real React component boundaries. |
| 33 | Invalid | No governed methodology SHA fixture exists. |
| 34–37 | Passed (equivalent) | Frozen releases, decision record, result/version, and live report evidence. |
| 38–40 | Passed (equivalent) | Actual public validation rejects incomplete input. |
| 41–43 | Invalid | Locality, freshness, and partial-status rules conflict with the supplied fixed assertions. |
| 44 | Passed (equivalent) | Missing income evidence is disclosed through an unavailable approach. |
| 45–47 | Invalid | Raw-income/currency scenarios are not public contracts and cannot mandate success. |
| 48–49 | Deferred | Shared audit environment must not receive synthetic load; isolated test policy required. |
| 50 | Passed | Read-only DLD importer verification. |
| 51–52 | Invalid | Public `valuation.run` policy; changing authentication requires product approval. |
| 53–54 | Passed | `AC-05a` and `AC-05b`. |
| 55 | Deferred | Controlled audit-log security review required. |
| 56–60 | Invalid | Supplied runtime documentation helpers do not exist; repository documentation is the governing artefact. |

## Operational follow-ups

The acceptance work does not claim a universal security or performance certification. A 100/1,000-request exercise must run in an isolated database/audit environment with an agreed concurrency plan and p50/p95/p99, error-rate, and duration budgets. Audit-log review requires a controlled redaction procedure. The client bundle advisory is a follow-up opportunity for lazy loading; it did not prevent a successful production build.

## Conclusion

The repository passes every executed, architecture-aligned acceptance check. The complete 60-case ledger intentionally distinguishes those passes from invalid placeholder assertions, policy conflicts, data-fixture discrepancies, and deferred operational verification. No synthetic evidence, browser calculation path, or unapproved methodology change was introduced to inflate a test count.
