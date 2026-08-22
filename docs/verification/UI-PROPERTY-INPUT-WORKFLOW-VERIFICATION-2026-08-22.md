# UI Property Input Workflow — Verification Record

**Date:** 2026-08-22  
**Scope:** Phase 2 — Property Valuation Workflow input surface  
**Source of truth:** `shared/valuation/method-applicability.policy.ts` and the existing `PropertySubmission` contract

## Verification boundary

The input surface was reorganized into **Property identification**, **Property characteristics**, and **Economic inputs**. This is a UI-only implementation. It neither adds a submission field nor changes the valuation engine, methodology configuration, API contract, method selection, comparable selection, or server validation.
`NOT_APPLICABLE` is represented by omission from the form. It is not represented as a blank required control and is not translated into `MISSING_DATA`.

## Contract representation

| Requested concept   | Rendered contract field | Verification outcome                                                        |
| ------------------- | ----------------------- | --------------------------------------------------------------------------- |
| Property type       | `propertyType`          | Rendered from the seven governed choices.                                   |
| Location / District | `district`              | Rendered as a text entry.                                                   |
| Area / Size         | `areaSqm`               | Rendered once as **Area**; no duplicate `size` field was created.           |
| Condition           | `condition`             | Rendered as the existing controlled vocabulary.                             |
| Building condition  | `buildingCondition`     | Rendered as the existing controlled vocabulary.                             |
| View                | `views`                 | Rendered as the existing capped view selector.                              |
| Floor               | `floor`                 | Rendered as optional existing input.                                        |
| Street position     | `streetPosition`        | Rendered as optional existing input.                                        |
| Finish              | `finish`                | Rendered as the existing controlled vocabulary.                             |
| Furnished status    | `furnished`             | Rendered as optional existing input.                                        |
| Age                 | `yearBuilt`             | Rendered as **Year built**; no derived `age` field was created.             |
| GIS                 | None                    | Not rendered because no GIS field exists in the public submission contract. |

## Property type × economic input matrix

| Property type | Applicable methods                                 | Visible economic inputs                            | Hidden economic inputs                                         | Result |
| ------------- | -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------------------- | ------ |
| Apartment     | Sales Comparison, Income Capitalization, DCF       | Annual Rent                                        | Replacement Cost, Depreciation Factor, Land Value              | PASS   |
| Villa         | Sales Comparison, Income Capitalization, Cost, DCF | Annual Rent, Replacement Cost, Depreciation Factor | Land Value                                                     | PASS   |
| Townhouse     | Sales Comparison, Income Capitalization, Cost, DCF | Annual Rent, Replacement Cost, Depreciation Factor | Land Value                                                     | PASS   |
| Office        | Sales Comparison, Income Capitalization, Cost, DCF | Annual Rent, Replacement Cost, Depreciation Factor | Land Value                                                     | PASS   |
| Retail        | Sales Comparison, Income Capitalization, Cost, DCF | Annual Rent, Replacement Cost, Depreciation Factor | Land Value                                                     | PASS   |
| Land          | Sales Comparison, DCF                              | None                                               | Annual Rent, Replacement Cost, Depreciation Factor, Land Value | PASS   |
| Warehouse     | Sales Comparison                                   | None                                               | Annual Rent, Replacement Cost, Depreciation Factor, Land Value | PASS   |

`landValueAed` remains in the pre-existing public contract but is intentionally omitted for every property type. The governing method policy does not assign it to a supported public method field, so rendering it as a Cost input would invent a mapping. This omission is `NOT_APPLICABLE`, not missing evidence.

## Automated and visual checks

| Check                                       | Evidence                                                                              | Result |
| ------------------------------------------- | ------------------------------------------------------------------------------------- | ------ |
| Seven-type economic visibility              | `tests/ui-reference-rebuild.test.ts` enumerates every property type.                  | PASS   |
| Non-applicable economic values are cleared  | The same test asserts Villa → Apartment, Villa → Land, and Villa → Villa transitions. | PASS   |
| Existing characteristic facts remain intact | The clear-input test asserts retained district, area, and floor values.               | PASS   |
| Apartment presentation                      | Browser review confirmed Annual Rent only.                                            | PASS   |
| Villa presentation                          | Browser review confirmed Annual Rent, Replacement Cost, and Depreciation Factor.      | PASS   |
| Land presentation                           | Browser review confirmed no Income or Cost public inputs.                             | PASS   |

## Result

Phase 2 is verified within the approved boundary. The UI shows only existing contract fields and only method-driven economic inputs supported by the applicable method policy. No fallback field, type mapping, or input value was manufactured.
