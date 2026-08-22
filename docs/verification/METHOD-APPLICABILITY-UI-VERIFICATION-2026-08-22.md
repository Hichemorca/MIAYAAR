# Method Applicability UI Verification — 2026-08-22

## Scope

Desktop verification of the local implementation of the method-applicability policy derived from `MIAYAAR-METH-001` §§4–5. This check confirms presentation only; valuation calculations remain server-side.

## Observed result

| Check                       | Observed state                                                                                                      |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Initial property type       | Apartment                                                                                                           |
| Displayed approach count    | `3 of 4`                                                                                                            |
| Displayed approaches        | Sales comparison, Income capitalization, Discounted cash flow                                                       |
| Cost Approach for Apartment | Not displayed                                                                                                       |
| Displayed economic input    | Optional Annual rent                                                                                                |
| DCF input treatment         | Explains that public submission does not expose its governed engine inputs and the server will not manufacture them |
| Non-governed inputs         | Explicitly not shown                                                                                                |

The observed initial state is consistent with the §4 Apartment applicability rule. The UI labels the source as frozen methodology and does not expose a client-side valuation calculation or a synthetic input path.

## Additional type checks

| Selected type | Displayed approach count | Displayed approaches                   | Economic inputs shown                                                              |
| ------------- | ------------------------ | -------------------------------------- | ---------------------------------------------------------------------------------- |
| Land          | `2 of 4`                 | Sales comparison, Discounted cash flow | None; governed DCF engine inputs are not exposed by the public submission contract |
| Warehouse     | `1 of 4`                 | Sales comparison                       | None                                                                               |

These observations confirm that Land omits Income Capitalization and Cost, while Warehouse follows its existing v1.2-compatible treatment without introducing an unapproved weight or input set.
