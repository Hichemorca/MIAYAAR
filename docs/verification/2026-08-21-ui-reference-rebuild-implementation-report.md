# UI Reference Rebuild — Implementation Report

**Status:** Implemented; PR #53 CI and Netlify Deploy Preview passed.
**Date:** 2026-08-21.  
**Scope authority:** Owner-approved UI Reference Rebuild.

AQAR Valuation and the owner-provided attachment were used only to identify functional and experience requirements. No code, visual asset, methodology, factor, weight, coefficient, market assumption, API contract, or policy decision was imported from either reference.

The rebuilt English home experience takes the user from a governed property file to a server-only valuation request and then to the current canonical report. The browser does not calculate an estimate, select comparables, decide methodology applicability, or create a fallback. If local evidence is insufficient, the existing report communicates the withheld-value outcome rather than creating a substitute value.

> The interface may explain a governed state, but it must not turn an unavailable policy decision into a client-side fallback. [1]

## 1. Rebuilt workflow

| Surface                                  | Status      |
| ---------------------------------------- | ----------- |
| Responsive page shell and navigation     | Implemented |
| Evidence-led hero and operating boundary | Implemented |
| Governed property-file workbench         | Implemented |
| Bounded client validation                | Implemented |
| Pending and request-error states         | Implemented |
| Empty decision-report state              | Implemented |
| Completed and partial report states      | Implemented |
| Rejected / insufficient-evidence state   | Implemented |
| Existing Evidence Integrity surface      | Retained    |
| Four-method explanatory section          | Implemented |

The page header and hero establish the DLD transaction evidence context, server-evaluated execution, the four governed approaches, and the no-value-without-local-support rule. The property-file workbench groups the current fields into identity/location, property characteristics, and declared economic inputs. Pending state disables the request action, and request failures have a bounded user-facing message.

Before the first request, the report area explains what a server evaluation can return. After a request, `Home.tsx` lazy-loads the current `ValuationReport`, passing only the returned report and request identifier. That component preserves completed, partial, rejected, evidence, warning, methodology, and audit-context presentation already governed by the canonical report. [3]

## 2. Contract-bound types and fields

| Contract type | UI label  |
| ------------- | --------- |
| `apartment`   | Apartment |
| `villa`       | Villa     |
| `townhouse`   | Townhouse |
| `office`      | Office    |
| `retail`      | Retail    |
| `land`        | Land      |
| `warehouse`   | Warehouse |

The selector renders exactly the seven values of the current property-type union. It does not label `warehouse` as industrial and does not display hotel or hospitality as a selectable type. [1] [2]

| Input group           | Contract fields                                                                  |
| --------------------- | -------------------------------------------------------------------------------- |
| Identity and location | Type, district, area, bedrooms, year built                                       |
| Characteristics       | Condition, building condition, views, finish, furnishing, floor, street position |
| Declared economics    | Annual rent, replacement cost, land value, depreciation factor                   |

District stays as a user-entered string, with no client-side catalogue, normalisation, autocomplete, or fallback. Existing controlled options are used for the other applicable selections. The outlook picker preserves at least one recorded view and caps choices at five; it performs no scoring or inference.

There is no owner-approved type-to-field visibility matrix. `typeSpecificFieldRules` is therefore deliberately empty, and contract fields remain visible for every property type. Optional declared economic inputs remain distinct from DLD evidence and do not create an approach, adjustment, value, or client calculation.

## 3. Server integrations and method boundary

| Integration                   | Result                              |
| ----------------------------- | ----------------------------------- |
| `valuation.run` mutation      | Existing public procedure used      |
| Canonical report rendering    | Existing report component reused    |
| Evidence Integrity panel      | Existing facts-only panel retained  |
| Applicable methods            | Server-returned methods only        |
| Audit and methodology context | Returned values displayed read-only |

`Home.tsx` calls `trpc.valuation.run.useMutation()` after only bounded district and positive-area presence checks, then sends the existing `PropertySubmission` object. The server remains authoritative for contract validation and every valuation decision. The client does not recalculate a baseline, range, weight, evidence count, method contribution, confidence result, or comparable set. [2] [3]

The method section explains market comparison, income capitalization, cost, and DCF as separate server-evaluated approaches. The canonical report displays only methods that the server has returned as applicable; it supplies no editor for methodology assumptions, weights, factors, or coefficients.

## 4. Exclusions and unresolved items

| Capability                                          | Disposition                     |
| --------------------------------------------------- | ------------------------------- |
| Hotel or hospitality type                           | Unresolved UI policy; not shown |
| General industrial type                             | No approved mapping; not shown  |
| Type-specific conditional fields                    | No matrix; not inferred         |
| Project, legal rights, and zoning                   | No UI contract; not shown       |
| Method weight or assumption editor                  | Prohibited; not shown           |
| Market Intelligence and Comparable Selection panels | Not authorized; not shown       |
| Forensic or Temporal Backtesting views              | Not authorized; not shown       |
| Client-side valuation or substitute result          | Prohibited; not implemented     |

The rebuild does not change Core Types, contracts, the public API, valuation engine, methodology v1.2, weights, coefficients, DLD data, Comparable Selection, Market Intelligence, Evidence Integrity policy, Forensic Diagnostics, or Temporal Backtesting. It does not expose any new route, endpoint, or server call.

## 5. Changed files

| File                                                                         | Contribution                                                      |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `client/src/pages/Home.tsx`                                                  | Rebuilt page, form, lifecycle states, and lazy report handoff     |
| `client/src/pages/home-form-config.ts`                                       | Governed type and field configuration with bounded view selection |
| `tests/ui-reference-rebuild.test.ts`                                         | UI-governance regression coverage                                 |
| `docs/verification/2026-08-21-ui-reference-rebuild-compatibility-map.md`     | Functional-reference and governance reconciliation                |
| `docs/verification/2026-08-21-ui-reference-rebuild-implementation-report.md` | This implementation record                                        |
| `todo.md`                                                                    | Completion history                                                |

## 6. Verification record

| Check                  | Current result                      |
| ---------------------- | ----------------------------------- |
| TypeScript             | Passed locally                      |
| Vitest                 | Passed locally: 31 files, 117 tests |
| Production build       | Passed locally                      |
| Incremental formatting | Passed locally                      |
| `git diff --check`     | Passed locally                      |
| Desktop preview        | Passed at 1440 × 1000               |
| Mobile preview         | Passed at 390 × 844                 |
| GitHub CI              | Passed: MIAYAAR CI                  |
| Netlify Deploy Preview | Passed: Deploy Preview              |

The desktop preview showed desktop navigation, the evidence-led hero, and the property-file entry point with a readable hierarchy. The mobile preview showed a readable compact header, hero copy, evidence commitments, and property-file entry point without horizontal overflow in the captured viewport. The captures were used only for local verification and are not product assets.

## References

[1]: `2026-08-21-ui-reference-rebuild-compatibility-map.md` — UI Reference Rebuild Compatibility Map
[2]: `../../shared/valuation/contracts.ts` — MIAYAAR shared property submission contract
[3]: `../../client/src/components/ValuationReport.tsx` — Canonical server-backed valuation report presentation
