# Deploy Attestation Event Diagnostic — 2026-08-21

## Scope and non-governance boundaries

This record diagnoses why no operational `[Server connection role evidence]` log
was observed after the production deployment that introduced the attestation
handler. It does not apply RLS, change Supabase, alter database data, reveal any
secret, modify the valuation path, or authorize a database migration.

## Evidence reviewed

| Evidence                              | Observation                                                                                                                                                                                          | Source                                                                                                          |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Production function page              | `deploy-attestation` is listed as a production function, but its Function log has no `[Server connection role evidence]` entry.                                                                      | Owner-provided Netlify screenshot, 2026-08-21                                                                   |
| Source implementation                 | The function exports a default object with a typed `deploySucceeded` handler and no `fetch` handler.                                                                                                 | `netlify/functions/deploy-attestation.ts`                                                                       |
| Site configuration                    | `netlify.toml` configures build, publish, functions directory, and redirect only; it contains no separate event subscription declaration.                                                            | `netlify.toml`                                                                                                  |
| Netlify event-functions documentation | A default-object export with a `deploySucceeded(event)` method is the supported subscription mechanism. It runs after a successful deploy, and Netlify verifies the platform JWS before invoking it. | [Trigger functions on events](https://docs.netlify.com/build/functions/trigger-on-events/), accessed 2026-08-21 |

## Finding

> **No missing outbound notification/webhook binding has been identified.** The
> deployed function uses Netlify's current typed platform-event subscription
> pattern. It intentionally has no public HTTP route, application webhook
> secret, or client-triggerable execution path.
>
> The missing record therefore cannot be treated as a configuration failure based
> on the current evidence. It only establishes that the screenshot's visible log
> contains no qualifying role-evidence record. The effective database role remains
> unproven.

## Safe verification path

The next minimal test is a **subsequent production deploy** after the handler is
present in the published function set, followed by a read-only review of the
`deploy-attestation` Function log. The test must confirm both records below:

1. `[Deploy attestation]` with `outcome: "MATCH"`.
2. `[Server connection role evidence]` with `outcome: "OBSERVED"` or
   `"UNAVAILABLE"`.
   The role evidence must not be inferred from deployment metadata, session access,
   or the administrative Supabase inspection. If the first record is not `MATCH`, or
   if the second record is absent or `UNAVAILABLE`, the status remains
   **CONDITIONAL NO-GO** for RLS.

## Required decision before test

Replaying or triggering a production deployment changes deployment state even
when no application code, data, database schema, or environment value changes.
It therefore requires an explicit owner decision before execution.
