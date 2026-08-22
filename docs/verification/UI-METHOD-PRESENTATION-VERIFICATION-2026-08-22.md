# UI Method Presentation Verification — 2026-08-22

## Scope

This record verifies the Phase 3 presentation layer. It reads the existing method-applicability policy and the existing server report only. It does not change methodology, approach selection, core types, API contracts, coefficients, weights, comparable selection, or the valuation engine.

## Presentation rule

| State                          | UI treatment                                                                                                                                 |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Applicable method              | Shown with its existing public policy fields.                                                                                                |
| Not applicable method          | Not rendered in the method panel. It is not represented as an evidence failure.                                                              |
| Returned approach result       | Shown only when an approach with the engine's existing label is present in `report.valuation.result.approachResults`.                        |
| No returned result             | No value is invented. The panel retains the applicable method and awaits a server evaluation.                                                |
| `evidence.status = available`  | Shows **Evidence available** on each displayed applicable method after a server report exists.                                               |
| `evidence.status != available` | Shows **Insufficient evidence** on each displayed applicable method after a server report exists. This does not change method applicability. |

## Seven-type applicability matrix

| Property type | Rendered applicable approaches                                               | Explicitly absent approaches                               |
| ------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Apartment     | Sales Comparison; Income Capitalization; Discounted Cash Flow                | Cost Approach                                              |
| Villa         | Sales Comparison; Income Capitalization; Cost Approach; Discounted Cash Flow | None                                                       |
| Townhouse     | Sales Comparison; Income Capitalization; Cost Approach; Discounted Cash Flow | None                                                       |
| Office        | Sales Comparison; Income Capitalization; Cost Approach; Discounted Cash Flow | None                                                       |
| Retail        | Sales Comparison; Income Capitalization; Cost Approach; Discounted Cash Flow | None                                                       |
| Land          | Sales Comparison; Discounted Cash Flow                                       | Income Capitalization; Cost Approach                       |
| Warehouse     | Sales Comparison                                                             | Income Capitalization; Cost Approach; Discounted Cash Flow |

## Field and result boundaries

| Approach              | Public policy fields displayed        | Result source                                                 |
| --------------------- | ------------------------------------- | ------------------------------------------------------------- |
| Sales Comparison      | District; Internal area               | Server report approach labelled `Sales Comparison` only.      |
| Income Capitalization | Annual rent                           | Server report approach labelled `Income Capitalization` only. |
| Cost Approach         | Replacement cost; Depreciation factor | Server report approach labelled `Cost Approach` only.         |
| Discounted Cash Flow  | No public submission fields           | Server report approach labelled `Discounted Cash Flow` only.  |

`landValueAed` remains excluded from the display because the policy maps it to no public method input. It is neither created as a Cost field nor treated as missing evidence.

## Evidence captured

| Verification activity         | Outcome                                                                                                                                                                                       |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Visual inspection — Apartment | Three applicable cards were visible: Sales Comparison, Income Capitalization, and Discounted Cash Flow. Cost Approach was absent. With no report, no evidence state or result was fabricated. |
| Visual inspection — Land      | Two applicable cards were visible: Sales Comparison and Discounted Cash Flow. Income Capitalization and Cost Approach were absent.                                                            |
| Visual inspection — Warehouse | One applicable card was visible: Sales Comparison. Income Capitalization, Cost Approach, and Discounted Cash Flow were absent.                                                                |
| Visual inspection — Villa     | Four applicable cards were visible: Sales Comparison, Income Capitalization, Cost Approach, and Discounted Cash Flow. The Cost card showed Replacement Cost and Depreciation Factor only.     |
| Automated matrix test         | Asserts the applicable method list for all seven governed property types.                                                                                                                     |
| Server-result matching test   | Asserts that a label-matching returned approach is found and that absent Cost or DCF results resolve to `undefined`, not a fabricated result.                                                 |

## Quality-gate status

- **TypeScript:** PASS.
- **Vitest:** PASS — 36 files / 151 tests.
- **Production build:** PASS; Vite emitted its existing chunk-size warning only.
- **Formatting:** PASS.
- **`git diff --check`:** PASS.
