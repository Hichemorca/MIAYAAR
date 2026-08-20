# Netlify deploy attestation

**Status:** IMPLEMENTED — pending deployment observation
**Scope:** Post-deploy production identity observation only
**Record destination:** Netlify function logs only; no database persistence

## Purpose

This function produces an operational attestation after Netlify reports a successful deployment. It confirms whether the production artifact currently served by `https://miayaar.netlify.app` identifies itself as the same `main` commit that Netlify reported. It is an identity check, not a valuation, evidence, data-quality, performance, or availability decision.

Netlify's typed `deploySucceeded` event includes the deployment `siteId`, `context`, `branch`, and `commitRef`. Netlify verifies a JSON web signature before it invokes an event function, so this implementation uses the platform event handler rather than exposing an externally callable webhook endpoint or storing a duplicate signing secret.[1]

## Contract

| Item                         | Rule                                                                                                                                     |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Event source                 | Netlify typed `deploySucceeded` event only.                                                                                              |
| Platform authentication      | Netlify JWS verification occurs before the function runs.[1]                                                                             |
| Site binding                 | The received `siteId` must equal MIAYAAR's Netlify site ID.                                                                              |
| Eligible deploy              | `context` must be `production`, `branch` must be `main`, and `deployId` plus `commitRef` must be present.                                |
| Permitted production request | `GET https://miayaar.netlify.app/_miayaar/build` only.                                                                                   |
| Identity match               | The build stamp must have schema `MIAYAAR-BUILD-STAMP-1`, the exact event `commitRef`, `branch: main`, and `context: production`.        |
| Operational record           | One structured `console.info` record containing outcome and non-secret identifiers only.                                                 |
| Prohibited behaviour         | No valuation API request, DLD operation, database write, audit-record write, retry loop, rollback, UI change, or configuration mutation. |

## Outcomes

| Outcome                       | Meaning                                                                                            | Production side effect                           |
| ----------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `MATCH`                       | The signed Netlify event and public production stamp identify the same eligible `main` deployment. | A log record only.                               |
| `MISMATCH`                    | The production stamp exists but its identity is not the notified deployment identity.              | A log record only; owner investigation required. |
| `INVALID_EVENT`               | An otherwise eligible event omits its required deployment ID or commit reference.                  | A log record only.                               |
| `STAMP_UNAVAILABLE`           | The public stamp request failed or returned a non-success response.                                | A log record only.                               |
| `MALFORMED_STAMP`             | The stamp response is not the governed build-stamp contract.                                       | A log record only.                               |
| `IGNORED_UNEXPECTED_SITE`     | The event is not from MIAYAAR's bound Netlify site.                                                | A log record only.                               |
| `IGNORED_NON_PRODUCTION_MAIN` | The deployment is not the production deployment of `main`.                                         | A log record only.                               |

> **Security boundary:** direct event functions are invoked by Netlify after platform-side JWS verification. The code has no public route, does not parse an external request body, does not contain a secret, and does not emulate a signing algorithm.

## Test evidence

The dedicated unit suite covers eligible matching events, identity mismatches, unavailable and malformed stamps, missing deployment identity, unexpected sites, non-production events, the fixed read-only URL, and operational logging. Signature rejection is a Netlify platform gate that occurs before this module is invoked; unit tests do not fabricate or bypass that gate.

## References

[1]: https://docs.netlify.com/build/functions/trigger-on-events/ "Netlify event-triggered functions: deploy event fields and platform JWS verification"
