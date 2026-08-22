# UI Valuation Results Verification — 2026-08-22

## Scope

This record verifies Phase 5 presentation behavior for the valuation result report. The report must render only server-returned information and must keep `FACT`, `ASSESSMENT`, `UNAVAILABLE`, and `NOT_APPLICABLE` distinct.

## Local UI observation

The Phase 5 local application was inspected at `http://localhost:3002/` with an Apartment, `Dubai Marina`, and `100 sqm` supplied through the public workflow. The local evaluation did not return a completed valuation report. The interface displayed the existing failure notice, **“We could not complete this valuation. Review the supplied data and try again.”**
No final valuation, confidence value, evidence state, comparable, decision trace, warning, limitation, or method result was rendered in place of the absent server report. This is a pass for the no-fabrication boundary: a missing response did not create synthetic report content or a synthetic `Error` report status.

## Presentation assertions

| Concern                                                                      | Source of truth                                       | Expected presentation                                                                         |
| ---------------------------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Property summary                                                             | Submitted property facts carried in the server report | `FACT` only when returned or otherwise supplied in the report context.                        |
| Applicable and not-applicable methods                                        | Central method-applicability policy                   | Applicable methods are separate from policy-derived `NOT_APPLICABLE` methods.                 |
| Method and final values                                                      | Server valuation response                             | `ASSESSMENT` only when a result is explicitly returned.                                       |
| Confidence, evidence, comparables, decision trace, warnings, and limitations | Server valuation report                               | Render returned values as facts or mark the section `UNAVAILABLE`; do not infer a substitute. |
| Server-report absence                                                        | Server response                                       | Do not render a valuation report or manufacture result data.                                  |

## Automated verification

The presentation test suite covers the report sections and classifications, including policy-derived method matrices across Apartment, Villa, Townhouse, Office, Retail, Land, and Warehouse; `UNAVAILABLE` handling for missing server report data; and the distinction between policy `NOT_APPLICABLE` and evidence insufficiency. Final quality-gate commands and their results are recorded before the pull request is opened.
| Quality gate | Result |
| ----------------------- | ---------------------------------------------------------- |
| `pnpm run check` | PASS |
| `pnpm test` | PASS — 36 files / 156 tests |
| `pnpm run build` | PASS — Vite reported the existing bundle-size warning only |
| `pnpm run format:check` | PASS |
| `git diff --check` | PASS |

## Result

**PASS — no report content was fabricated when the local workflow had no completed server report.**
