# UI Applicability Matrix Verification — 2026-08-22

## Scope

Visual verification of the public `Property Type × Method × Field` matrix sourced from `shared/valuation/method-applicability.policy.ts`. The UI must omit non-applicable approaches and economic fields; it must not present `NOT_APPLICABLE` as `MISSING_DATA`.

## Captured results

| Property type | Approaches shown                                                             | Policy-specific public fields shown                                                              | Result |
| ------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------ |
| Apartment     | Sales comparison; Income capitalization; Discounted cash flow                | District; Internal area; Annual rent; no public DCF input                                        | Pass   |
| Villa         | Sales comparison; Income capitalization; Cost approach; Discounted cash flow | District; Internal area; Annual rent; Replacement cost; Depreciation factor; no public DCF input | Pass   |
| Townhouse     | Sales comparison; Income capitalization; Cost approach; Discounted cash flow | District; Internal area; Annual rent; Replacement cost; Depreciation factor; no public DCF input | Pass   |
| Office        | Sales comparison; Income capitalization; Cost approach; Discounted cash flow | District; Internal area; Annual rent; Replacement cost; Depreciation factor; no public DCF input | Pass   |
| Retail        | Sales comparison; Income capitalization; Cost approach; Discounted cash flow | District; Internal area; Annual rent; Replacement cost; Depreciation factor; no public DCF input | Pass   |
| Land          | Sales comparison; Discounted cash flow                                       | District; Internal area; no public DCF input                                                     | Pass   |
| Warehouse     | Sales comparison                                                             | District; Internal area                                                                          | Pass   |

The Apartment capture shows three of four approaches, with Cost omitted. It does not show replacement cost, depreciation, or an invented DCF input. Common property facts remain available independently of this method-field matrix.

The property-type control exposes the seven policy identifiers `apartment`, `villa`, `townhouse`, `office`, `retail`, `land`, and `warehouse`. The verification session was then switched to `villa` for the next capture.

The Villa capture shows all four applicable approaches and their supported public fields. The session was then switched to `townhouse` for the next capture.

The Townhouse capture also shows all four applicable approaches and their supported public fields. The session was then switched to `office` for the next capture.

The Office capture shows all four applicable approaches and their supported public fields. The session was then switched to `retail` for the next capture.

The Retail capture shows all four applicable approaches and their supported public fields. The session will next be switched to `land` for the policy-specific two-approach capture.

The Land capture shows exactly Sales comparison and Discounted cash flow. Income capitalization and Cost approach are absent, and no declared economic input is rendered. The session will next be switched to `warehouse` for the final capture.

The Warehouse capture shows exactly Sales comparison with District and Internal area. Income capitalization, Cost approach, Discounted cash flow, and all declared economic inputs are absent. This completes the visual verification sequence for all seven property types.

The final Apartment capture confirms exactly Sales comparison, Income capitalization, and Discounted cash flow. Cost approach is absent; Annual rent is the only declared economic input; and the applicable DCF method presents no invented public submission field.
