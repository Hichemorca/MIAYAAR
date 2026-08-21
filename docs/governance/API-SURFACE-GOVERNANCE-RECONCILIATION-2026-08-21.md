# API Surface Governance Reconciliation — Phase 9

**Status:** Documentation-only governance review; no API change authorized  
**Date:** 2026-08-21  
**Scope:** Reconcile repository-defined HTTP and tRPC surfaces with approved valuation, Evidence Integrity, Market Intelligence, Comparable Selection, Forensic Diagnostics, and Temporal Backtesting boundaries.  
**Authority:** Owner-approved Phase 9 review scope of 2026-08-21.  
**Non-claim:** This record does not create a route, alter a response, change an authorization or rate-limit rule, publish a dormant service, or assert production reachability beyond the paths declared by the repository and deployment configuration.

## 1. Governing conclusion

MIAYAAR has one deployed tRPC function family at `/api/trpc/*`, a narrow public build-identity endpoint at `/_miayaar/build`, and a non-HTTP Netlify deploy event handler. The governed domain procedures currently exposed through the tRPC router are the public canonical valuation mutation `valuation.run` and the public, facts-only Evidence Integrity query `evidenceIntegrity.report`.[1] [2]

`valuation.run` remains the only procedure with a deployed endpoint-specific rate limit: **100 requests per minute per client IP**. The limit is enforced before tRPC handling in the Netlify function and fails closed when shared protection is unavailable.[3] [4] This record neither broadens that protection nor treats the absence of an endpoint-specific policy for another procedure as permission to add one.

Market Intelligence, Comparable Selection, Forensic Diagnostics, and Temporal Backtesting do not have an approved API exposure in the current policies or governance records. No new endpoint, integration, report field, client call, or public claim is authorized for any of them by this review.[5] [6] [7] [8]

## 2. Repository-defined surface inventory

The table records current repository facts. `Public` means that the relevant procedure is built from `publicProcedure`; it does not create a new owner approval, expand a response contract, or imply that every local-development path is deployed on Netlify.

| Surface                                                            | Current access posture                                                           | Current purpose and bounded fact                                                                                                                                                       | Governing reconciliation                                                                                                                                                                                             |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/api/trpc/valuation.run`                                          | Public mutation. The Netlify context intentionally contains no browser identity. | Invokes the canonical valuation orchestrator with the existing property-submission input. It is the sole tRPC path intercepted by the shared 100-request-per-minute client-IP limiter. | **Approved existing surface; unchanged.** It remains public, server-only, and rate-limited exactly as currently implemented.                                                                                         |
| `/api/trpc/evidenceIntegrity.report`                               | Public query.                                                                    | Reads the existing DLD-only Evidence Integrity v1.0 result for one district, property type, and explicit `asOf`; the router rejects unsupported request scope.                         | **Approved existing surface; unchanged.** The policy authorizes no price, area, candidate-property, confidence, or valuation input and no report persistence.                                                        |
| `/api/trpc/system.health`                                          | Public technical query.                                                          | Returns only the framework health acknowledgement for a non-negative timestamp input.                                                                                                  | **Technical surface, not a valuation-domain capability.** No new monitoring or exposure policy is created here.                                                                                                      |
| `/api/trpc/auth.me` and `/api/trpc/auth.logout`                    | Declared as public procedures.                                                   | They are framework session helpers. In the Netlify tRPC context, `user` is set to `null` and no Express response object is available.                                                  | **Outside this phase’s valuation-policy scope.** This review neither changes their contract nor converts them into an authentication requirement.                                                                    |
| `/api/trpc/system.notifyOwner`                                     | Admin procedure, not public.                                                     | Delivers an owner notification only after the existing `adminProcedure` guard.                                                                                                         | **Not a public endpoint.** This record adds no notification use, role policy, or deployment behavior.                                                                                                                |
| `/_miayaar/build`                                                  | Public GET-only Netlify function.                                                | Returns build identity (`commitRef`, `branch`, `context`) with `no-store`; non-GET requests receive `405`.                                                                             | **Operational identity surface, distinct from valuation.** Its existing purpose is deploy attestation, not property evidence or valuation output.                                                                    |
| Netlify `deploySucceeded` handler                                  | Typed Netlify event handler; no HTTP path.                                       | After platform JWS verification, compares the production build stamp with the deployment event and writes only a sanitized operational log.                                            | **Not an application API endpoint.** It makes no valuation, DLD, audit, or user-data request.                                                                                                                        |
| Express `/api/oauth/callback` and `/manus-storage/*` registrations | Defined in the non-Netlify Express runtime.                                      | The first handles OAuth callback state; the second redirects a storage key to a server-obtained presigned URL.                                                                         | **Runtime-specific infrastructure routes.** The Netlify function configuration does not declare either path; this record makes no assertion that they are published in production and authorizes no exposure change. |

## 3. Policy alignment by domain layer

| Layer                     | Approved API position                                                                                                     | Current router/deployment fact                                                          | Outcome of this reconciliation                                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Canonical valuation       | `valuation.run` is intentionally public, server-executed, and subject to the existing 100-request-per-minute-per-IP rule. | The route exists and is the only tRPC path with the deployed endpoint-specific limiter. | **Aligned.** No input, output, authentication, or limit change is authorized.                                                        |
| Evidence Integrity v1.0   | The public `evidenceIntegrity.report` query may expose only its bounded DLD facts, availability, summary, and provenance. | The route exists as a public query with the policy’s three input dimensions.            | **Aligned.** No broader observation, field, fallback, persistence, consumer, UI, or endpoint-specific rate-limit policy is approved. |
| Market Intelligence v1.0  | The service is server-side and read-only; its policy includes no endpoint.                                                | No Market Intelligence procedure appears in the public tRPC router.                     | **Aligned.** The service remains outside API exposure.                                                                               |
| Comparable Selection v1.0 | The standalone deterministic service explicitly includes no API change.                                                   | No Comparable Selection procedure appears in the public tRPC router.                    | **Aligned.** Selection and exclusion explanations remain in-memory service outputs only.                                             |
| Forensic Diagnostics      | No diagnostic service, API, report surface, storage, alert, or UI is authorized.                                          | No forensic procedure appears in the public tRPC router.                                | **Aligned.** Evidence Integrity remains the sole approved diagnostic-adjacent API surface.                                           |
| Temporal Backtesting      | No rerun, integration, performance claim, or result exposure is authorized.                                               | No temporal-backtesting procedure appears in the public tRPC router.                    | **Aligned.** Historical-study outputs remain outside application API exposure.                                                       |

## 4. Authorization and response boundary

The tRPC framework permits unauthenticated calls only where a router chooses `publicProcedure`; its protected and administrator procedures enforce identity at the procedure boundary.[9] The Netlify adapter creates a deliberately anonymous context for the standalone public deployment, so the documented public procedures must be judged by their own contracts rather than by optional browser-session state.[3]

Public tRPC error shapes are configured to remove internal stack diagnostics before responding. This is an existing error-boundary safeguard, not an authorization, evidence, confidence, or valuation rule.[10]

Nothing in this review changes the fact that the public valuation mutation and the public Evidence Integrity query execute on the server. No browser-side evidence access, direct DLD query, synthetic fallback, or public exposure of a standalone service is introduced.

## 5. Unresolved policy decisions

Every item below is `UNRESOLVED_POLICY`. The list is not an implementation backlog and does not permit a default, new endpoint, audience, access rule, response field, rate limit, or service integration.

| ID       | Owner decision required                                                                                                                                             | Why the present record cannot decide it                                                                                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `API-01` | Whether any endpoint-specific rate-limit policy is needed for `evidenceIntegrity.report` or another already public technical procedure.                             | EID-v1.0 requires a separately approved access-control or endpoint-specific rate-limit policy for any future change; the existing valuation limit cannot be copied by inference.                |
| `API-02` | Whether a future Market Intelligence API surface is needed, including its audience, request contract, response contract, provenance, and non-interference controls. | MI-v1.0 explicitly includes no endpoint and no downstream valuation use.                                                                                                                        |
| `API-03` | Whether a future Comparable Selection API surface is needed and, if so, how its evidence and exclusion trace may be exposed.                                        | CS-v1.0 explicitly includes no API change; no exposure contract or consumer is approved.                                                                                                        |
| `API-04` | Whether any future forensic-diagnostics API, audience, authorization, retention, accessibility, or audit behavior is needed.                                        | The Forensic Diagnostics gate prohibits a surface until its separate policy decisions are resolved.                                                                                             |
| `API-05` | Whether an authorized future temporal study may expose a result through an API, UI, or report surface.                                                              | Temporal Backtesting governance preserves that question as `TB-06`; no new performance claim or result surface is approved.                                                                     |
| `API-06` | Whether the runtime-specific OAuth and storage-proxy route families require an independent deployment-parity and public-exposure decision.                          | They are registered in the Express runtime but are not declared by the present Netlify function configuration; this review must not infer production availability or change deployment routing. |
| `API-07` | Whether the operational build-identity endpoint needs a policy change to its audience or disclosed fields.                                                          | Its existing deploy-attestation use is bounded and operational; no valuation-domain policy governs a changed use.                                                                               |

## 6. Non-interference attestation

This review changes no executable code, test, Netlify function, route registration, deployment configuration, environment variable, database schema or row, Core Type, contract, procedure, response shape, authentication rule, rate-limit rule, valuation engine, methodology v1.2, weight, coefficient, comparable-selection rule, Market Intelligence calculation, Evidence Integrity fact, confidence output, historical-study result, UI, or audit record.

It does not call a valuation path, query DLD evidence, produce a value, classify a price, create a benchmark, infer an attribute, publish a protected capability, or create an endpoint where policy has not approved one.

## 7. Required gate before further work

No API implementation, route change, exposure change, rate-limit extension, authorization change, response-contract revision, or service integration is authorized by this document. A separately owner-approved scope must resolve the applicable `API-*` decisions before any such work begins.

## References

[1]: ../../server/routers.ts "Application tRPC router"
[2]: ../../netlify/functions/api.ts "Netlify tRPC entrypoint"
[3]: ../../server/security/valuation-rate-limit.ts "Valuation rate-limit constants and helpers"
[4]: ../../netlify/functions/api.ts "Netlify valuation rate-limit enforcement"
[5]: ../policies/MARKET-INTELLIGENCE-POLICY.md "Market Intelligence Policy v1.0"
[6]: ../policies/COMPARABLE-SELECTION-POLICY.md "Comparable Selection Policy — CS-v1.0"
[7]: FORENSIC-DIAGNOSTICS-POLICY-GATE-2026-08-21.md "Forensic Diagnostics Policy Gate — Phase 7"
[8]: TEMPORAL-BACKTESTING-GOVERNANCE-RECONCILIATION-2026-08-21.md "Temporal Backtesting Governance Reconciliation — Phase 8"
[9]: ../../server/_core/trpc.ts "tRPC authorization primitives"
[10]: ../../server/_core/trpc.ts "Public error-stack redaction"
