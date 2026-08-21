# UI Reference Rebuild — Compatibility Map

**Status:** Approved UI-only implementation boundary  
**Date:** 2026-08-21  
**Reference use:** AQAR Valuation and the owner-provided attachment are functional and experience references only. They are not a source of code, valuation methodology, factors, weights, coefficients, market assumptions, API contracts, or policy decisions.

## 1. Governing rule

This map permits MIAYAAR to improve the usability, ordering, visibility, and presentation of its existing valuation workflow. It does not permit the interface to manufacture a field, property type, conditional rule, calculation, evidence source, result, or API capability that is not already governed by MIAYAAR.

> The interface may explain a governed state, but it must not turn an unavailable policy decision into a client-side fallback.

## 2. Functional reference reconciliation

| Reference-oriented user need                                                                      | MIAYAAR governed source                                                                    | UI decision                                                                                                                                            | Status                 |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- |
| A clear valuation workspace with a progress-oriented form                                         | Existing `valuation.run` input and server validation                                       | Rebuild the single-page workflow around property identity, physical facts, market inputs, and a clear submit/review action.                            | Implementable          |
| Property-type selector                                                                            | `PropertySubmission.propertyType` union                                                    | Render only the seven current contract values: apartment, villa, townhouse, office, retail, land, and warehouse.                                       | Implementable          |
| Apartment, villa, office, retail, land, and industrial-style journeys                             | Existing contract values cover apartment, villa, office, retail, land, and warehouse only. | Make existing type choices legible; do not relabel `warehouse` as `industrial` or imply an equivalence.                                                | Partial                |
| Hotel or hospitality journey                                                                      | No current `PropertyType` value or approved mapping                                        | Do not show a selectable hotel or hospitality type.                                                                                                    | `UNRESOLVED_UI_POLICY` |
| Type-aware field visibility                                                                       | Optional property fields exist, but there is no owner-approved type-to-field matrix        | Group fields by their existing semantic role and label optional inputs. Do not hide, require, map, or prefill a contract field based on property type. | `UNRESOLVED_UI_POLICY` |
| District, area, condition, finish, view, year, rent, cost, and land facts                         | Existing `PropertySubmission` fields and server schema                                     | Render only existing fields with the existing controlled values where the contract supplies them.                                                      | Implementable          |
| Property details such as project, legal rights, zoning, hotel attributes, and operational metrics | No approved UI input contract or source-native field surface                               | Do not add inputs, chips, defaults, calculated values, or placeholders that suggest collection.                                                        | `UNRESOLVED_UI_POLICY` |
| Four-method presentation                                                                          | Server-provided `approachResults` in the canonical report                                  | Present only server-returned applicable approaches, their existing metadata, output amounts, and applied weights.                                      | Implementable          |
| Method-specific assumptions or editable weights                                                   | Frozen methodology and result contract                                                     | Show no editor, override, inferred coefficient, or input for methodology assumptions, weights, or factors.                                             | Prohibited             |
| Evidence and comparable details                                                                   | Canonical report evidence and Evidence Integrity v1.0 public query                         | Preserve report evidence, insufficient-evidence state, provenance, and the bounded Evidence Integrity panel.                                           | Implementable          |
| Market Intelligence, Comparable Selection, Forensic, or temporal-study screens                    | Current governance excludes their API/UI exposure                                          | Do not expose a new panel, route, score, result, action, or client call for these services.                                                            | Prohibited             |
| Completed, partial, rejected, loading, validation, and request-error states                       | Existing report status and client request lifecycle                                        | Make every current state explicit in the rebuilt workflow.                                                                                             | Implementable          |
| Audit/reference identifier and methodology record                                                 | Canonical report fields                                                                    | Preserve the returned request identifier and methodology document/version as read-only decision context.                                               | Implementable          |

## 3. Contract-bound input matrix

| UI group                          | Existing field(s)                                                              | Presentation rule                                                                               | Constraint                                                                                   |
| --------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Identity                          | `propertyType`, `district`                                                     | Render as the opening group; district remains a user-entered string.                            | No district catalogue, auto-complete, normalization, or fallback is added.                   |
| Scale and age                     | `areaSqm`, `bedrooms`, `yearBuilt`                                             | Make area prominent and label bedrooms/year as optional where applicable.                       | UI does not decide applicability by type.                                                    |
| Physical state                    | `condition`, `buildingCondition`, `finish`, `furnished`                        | Use only existing controlled values and explain that no UI value alters the frozen methodology. | No new option, alias, or default is introduced.                                              |
| Position and outlook              | `views`, `floor`, `streetPosition`                                             | Use existing controlled values; views remain a multi-select contract value.                     | No client-side scoring or feature inference is added.                                        |
| Declared economic and cost inputs | `annualRentAed`, `replacementCostPerSqm`, `landValueAed`, `depreciationFactor` | Keep optional numeric inputs distinct from DLD evidence.                                        | No derived calculation, validation rule, or requirement is added beyond the server contract. |

## 4. Results and evidence matrix

| Result state                                | Governed data available to UI                                                                                                        | Required presentation boundary                                                                                           |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Completed                                   | Baseline value, lower/upper range where present, applicable approaches, evidence, confidence where supplied, warnings, audit context | Present returned values and labels only; do not recalculate a value, score, range, or method contribution in the client. |
| Partial                                     | Report status, warnings, applicable result fields if supplied                                                                        | Explain partial evidence using the server response; do not promote partial output into an unsupported certainty claim.   |
| Rejected / insufficient evidence            | Evidence counts, required count, warnings, decision context                                                                          | State that no substitute evidence or synthetic value was used.                                                           |
| Evidence Integrity available or unavailable | Existing bounded EID input and result contract                                                                                       | Retain the facts-only diagnostic panel; do not add a price classification or confidence score.                           |
| Pending / request error                     | Existing client mutation lifecycle                                                                                                   | Explain the request state without exposing an internal stack, retry policy, or server diagnostic.                        |

## 5. Explicit exclusions

The rebuild must not copy AQAR code, markup, visual assets, calculation formulas, coefficients, thresholds, property mappings, data assumptions, market vocabulary, or business rules. It must not modify `methodology v1.2`, weights, coefficients, Comparable Selection, Market Intelligence, Core Types, API contracts, rate limiting, evidence policy, or server execution.

No route, UI control, or report section is authorized for hotel/hospitality, a general industrial classification, project, legal rights, zoning, secondary-attribute inference, Market Intelligence, Comparable Selection, Forensic Diagnostics, Temporal Backtesting, client-side valuation, or a methodology editor.

## 6. Required implementation record

The implementation report must identify each screen and state rebuilt, each property type rendered from the current union, each method/result/evidence surface connected to a current server response, every intentionally unavailable reference capability, every modified file, and the complete verification result. It must distinguish **implemented**, **not applicable to the current contract**, and **unresolved by governance**.

## References

[1]: ../../shared/valuation/contracts.ts "MIAYAAR shared property submission contract"
[2]: ../../server/engines/reporting/valuation-report.ts "Canonical valuation report presentation shape"
[3]: ../../client/src/components/ValuationReport.tsx "Current server-backed valuation report UI"
[4]: ../policies/EVIDENCE-INTEGRITY-DIAGNOSTICS-POLICY.md "Evidence Integrity Diagnostics v1.0"
[5]: ../policies/MARKET-INTELLIGENCE-POLICY.md "Market Intelligence Policy v1.0"
[6]: ../policies/COMPARABLE-SELECTION-POLICY.md "Comparable Selection Policy — CS-v1.0"
[7]: ../governance/FORENSIC-DIAGNOSTICS-POLICY-GATE-2026-08-21.md "Forensic Diagnostics policy gate"
[8]: ../governance/TEMPORAL-BACKTESTING-GOVERNANCE-RECONCILIATION-2026-08-21.md "Temporal Backtesting governance reconciliation"
