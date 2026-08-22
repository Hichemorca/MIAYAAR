# UI Methodology Explanation Verification — 2026-08-22

## Scope

This record verifies that the Phase 4 methodology explanation surface presents policy applicability separately from a calculation outcome. It does not create a value, calculation reason, or result status in the client.

## Local interaction observation

The local development page was run with an Apartment, `Dubai Marina`, and `100 sqm`. The valuation request did not yield a report, and the existing form displayed its generic failure notice. No methodology report, approach result, or synthetic `Success`/`Partial`/`Error` explanation was rendered in this state.

This is expected for an absent report: the Phase 4 panel is bound to the existing server report contract and must not manufacture result content from a failed request.

## Contract-bound rendering coverage

The component-level regression coverage renders a report-shaped test fixture solely to verify presentation against the existing report contract. It confirms all of the following without invoking a live valuation or creating a client-side result:

| Concern                   | Expected presentation                                                                    | Verification result |
| ------------------------- | ---------------------------------------------------------------------------------------- | ------------------- |
| Report outcome            | A server `partial` status renders as `Partial`                                           | PASS                |
| Used method               | An approach result returned as `Sales Comparison` is presented as used                   | PASS                |
| Applicable without result | An applicable method without a matching result renders `Applicable · no result returned` | PASS                |
| Calculation reason        | Only a warning that names the relevant method is shown for that method                   | PASS                |
| General warning           | A general server warning is not assigned to a particular method                          | PASS                |
| Policy non-applicability  | Apartment shows Cost Approach as not applicable with a policy-derived explanation        | PASS                |

## Seven-type policy coverage

The policy-derived explanation helper is covered for Apartment, Villa, Townhouse, Office, Retail, Land, and Warehouse. The test suite verifies that each non-applicable method uses the governed form `Method is not applicable to Property Type under the governed method policy.`; applicable methods do not receive that explanation.

## Boundary confirmation

The client takes the `Success`, `Partial`, or `Error` label only from the server report status mapping. A client with no report renders no result explanation. The client does not derive a calculation failure reason: it may display only a server warning that explicitly names the corresponding method; otherwise it states that no method-specific reason was returned by the server. `NOT_APPLICABLE` remains a policy state and is not represented as insufficient evidence.
