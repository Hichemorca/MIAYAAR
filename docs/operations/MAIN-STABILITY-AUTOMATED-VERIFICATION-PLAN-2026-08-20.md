# MIAYAAR — Main Stability Automated Verification Plan

**Date:** 2026-08-20
**Status:** APPROVED — Option A selected by the owner; implementation in progress
**Baseline:** `main` at `5681ca16208f197388fb8c4696fcbdc2ece2e817` after PR #45
**Authority:** Project owner approval required before any automation, secret, workflow, schedule, endpoint, or notification is added.

## 1. Purpose and boundaries

This plan defines a conservative verification model for confirming that a merged `main` commit remains buildable, tested, deployable, and identifiable in production. It supplements the existing pre-merge controls; it does not change MIAYAAR valuation behaviour or turn a deployment observation into a valuation decision.

> **Non-negotiable boundary:** automated stability checks must be read-only against production. They must not call a request path that can write a valuation audit event, mutate DLD evidence, create a property record, or change any runtime configuration. They must not trigger an automatic rollback.

The plan protects the frozen Core Types boundary and leaves `core/types`, `core/results`, `core/contracts`, valuation methodology v1.2, weights, coefficients, comparable selection, Market Intelligence, Evidence Integrity, API semantics, and UI behaviour unchanged.

## 2. Verified baseline

The existing pipeline already runs for pull requests targeting `main` and for pushes to `main`. Its single verification job installs locked dependencies and executes TypeScript checking, the Vitest suite, the production build, changed-file formatting, and whitespace validation.[1] The successful post-merge CI run for `5681ca1` provides the current baseline.[2]

| Verification layer         | Existing control                                                                                                                           | Current implication                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| Dependency reproducibility | `pnpm install --frozen-lockfile`                                                                                                           | The pipeline rejects an unlocked dependency graph.[1]                    |
| Static correctness         | `pnpm check`                                                                                                                               | TypeScript must pass before a change is accepted.[1]                     |
| Behavioural regression     | `pnpm test`                                                                                                                                | The current suite comprises 28 test files and 92 tests at this baseline. |
| Production buildability    | `pnpm build`                                                                                                                               | Vite client output and bundled server output must build.[1] [3]          |
| Change hygiene             | `pnpm format:check` and `git diff --check`                                                                                                 | Changed-file formatting and whitespace defects are rejected.[1]          |
| Deploy configuration       | Netlify uses `pnpm build`, Node 22, pnpm 10, static publishing, and functions from the repository configuration.[4]                        |
| Provenance observation     | `GET /_miayaar/build` returns a minimal, non-secret build stamp and only permits `GET`.[5]                                                 |
| Load testing               | A k6 test exists but is explicitly limited to a separately provisioned, isolated deployment and database; it is not a production check.[6] |

## 3. Stability verification model

The target model has three layers. Each layer has a narrow purpose, a defined trigger, and no implicit recovery action.

| Layer                              | Trigger                                               | Required evidence                                                                                                          | Production interaction             | Failure handling                                                                  |
| ---------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------- |
| A — Change admission               | Pull request to `main`                                | Existing CI and Netlify Deploy Preview statuses are successful                                                             | None beyond the preview deployment | Keep the pull request unmerged; diagnose through the relevant logs.               |
| B — Post-merge release attestation | A successful production deployment of a `main` commit | The public build stamp has the expected schema, exact deployed commit reference, `branch: main`, and `context: production` | `GET /_miayaar/build` only         | Publish a visible failure record or notification. Do not roll back automatically. |
| C — Periodic integrity observation | Optional, owner-approved low-frequency run            | Repeats Layer B and records the observation time and result                                                                | `GET /_miayaar/build` only         | Report a mismatch for owner review; do not change production automatically.       |

Layer B is an **identity attestation**, not a latency, availability, data-quality, or valuation-quality measurement. It compares exact deployment identity; it does not introduce any new numerical threshold, benchmark, confidence score, fallback, or pricing rule.

## 4. Required test coverage

The implementation phase should add only the following test classes, each in an isolated pull request after owner approval.

| Test class                     | Assertions                                                                                                               | Placement                                                                                           | Explicit exclusions                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| CI contract regression         | The required `main` triggers and commands remain present and execute in the documented order.                            | Repository tests or workflow validation.                                                            | No assertion about pricing outputs or methodology changes.                              |
| Build-stamp contract           | Schema version, `GET`-only method, `no-store`, non-secret fields, and generated build metadata remain covered.           | Existing `tests/operations/netlify-build-stamp.test.ts` is extended only when its contract changes. | No secrets, database URL, or environment values may be exposed.                         |
| Production release attestation | The production stamp equals the commit reported by the selected deployment event and states `main`/`production`.         | A dedicated verifier with a testable pure comparison function.                                      | No write request, valuation request, DLD read/write operation, or audit-event creation. |
| Notification authenticity      | Netlify verifies the JWS before it invokes an event function; the module accepts only the typed post-verification event. | Platform JWS gate plus direct handler-contract tests.                                               | Do not expose a public webhook endpoint or fabricate an application signing scheme.     |
| Negative-path evidence         | Missing, malformed, mismatched, or non-production build stamps produce an explicit failed observation.                   | The verifier test suite.                                                                            | No retry, rollback, or fallback target is invented without owner approval.              |

The existing k6 scenario remains a separately approved operational acceptance exercise. It must not be run in GitHub CI, against `miayaar.netlify.app`, or against the shared Supabase/DLD environment because the scenario writes valuation requests and audit events.[6]

## 5. Deployment-event options requiring owner selection

Netlify documents `Deploy succeeded` as a deploy event and supports authenticated outgoing HTTP POST notifications. It also documents GitHub commit statuses and commit checks for deployments.[7] The event source is therefore available, but the project must select a delivery and evidence path before implementation.

| Option                                                | How it works                                                                                                                                                                                                               | Advantages                                                                                                   | Trade-offs and prerequisites                                                                                                                                                |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Authenticated event-driven attestation**        | **Selected.** A Netlify typed `deploySucceeded` event reaches an event function only after platform JWS verification. The handler compares the production stamp with the signed event's site, commit, branch, and context. | Timely, platform-authenticated, and tied to an actual deploy completion without an exposed inbound endpoint. | Uses the platform event contract and Netlify logs only. It does not store a duplicate application signing secret or add retry, rollback, or notification logic.             |
| **B — Owner-approved periodic read-only observation** | A low-frequency background job retrieves the GitHub `main` revision and the production build stamp, then records whether they match.                                                                                       | Does not require an inbound public webhook; uses only read-only observations.                                | Not immediate after each merge, needs a token only if the repository revision cannot be obtained anonymously, and requires an approved schedule plus an idempotent handler. |
| **C — Retain current admission controls only**        | Keep GitHub CI, Deploy Preview checks, and owner-initiated production stamp verification after material merges.                                                                                                            | Lowest implementation and credential surface; current controls are already successful.                       | No automatic post-merge production attestation.                                                                                                                             |

The owner selected **Option A** on 2026-08-20. Options B and C remain out of scope. The selected implementation uses Netlify's documented typed event handler, whose JWS is verified by the platform before invocation; therefore a custom HTTP receiver and duplicate signing secret are neither required nor introduced.[7]

## 6. Proposed implementation sequence after approval

| Stage                                 | Deliverable                                                                                              | Gate to proceed                                                                                  |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 0 — Contract review                   | Confirm the selected event fields, production identity source, record destination, and error visibility. | Owner selected Option A and Netlify's typed event contract has been verified.                    |
| 1 — Pure verification core            | Add a deterministic comparison module and tests for exact identity match, malformed data, and mismatch.  | TypeScript, Vitest, build, formatting, and diff checks pass.                                     |
| 2 — Delivery adapter                  | Add the Netlify typed `deploySucceeded` handler with no automatic remediation.                           | Handler-contract and negative-path tests pass; platform JWS remains the authentication boundary. |
| 3 — CI/CD integration                 | Wire the verifier to the selected source and expose a concise, auditable success/failure record.         | A deploy-preview test demonstrates that only the read-only stamp path is called.                 |
| 4 — Controlled production observation | Observe the first approved `main` deployment and compare its recorded identity to the production stamp.  | Owner reviews the result; automatic rollback remains disabled.                                   |

## 7. Acceptance conditions for the implementation phase

Implementation is acceptable only if all of the following are demonstrated:

1. Existing CI gates remain intact and successful on a pull request and on the resulting `main` push.
2. The verifier makes only the permitted read-only request to `/_miayaar/build` when it touches production.
3. A matching commit creates a successful, auditable observation; malformed or mismatched identity creates an explicit failed observation.
4. No production mutation, audit event, valuation request, DLD operation, automatic rollback, invented retry rule, or pricing-policy change is introduced.
5. The Option A handler is invoked only through Netlify's JWS-verified event mechanism; it exposes no public route and neither stores nor logs a duplicate signing secret.
6. Any schedule, if Option B is selected, is platform-managed, authenticated, idempotent, and disabled until the post-deploy version is published.

## 8. Owner decision required

The owner selected Option A and approved Netlify function logs as the initial operational record. A future decision is required before adding any external notification, GitHub status/check, database retention, retry sequence, or rollback rule.

## References

[1]: ../../.github/workflows/ci.yml "MIAYAAR CI workflow"
[2]: https://github.com/Hichemorca/MIAYAAR/actions/runs/32385560125 "Post-merge CI run for commit 5681ca1"
[3]: ../../package.json "Build, test, type-check, and load-test scripts"
[4]: ../../netlify.toml "Netlify build configuration"
[5]: ../../tests/operations/netlify-build-stamp.test.ts "Build stamp contract tests"
[6]: ../../tests/performance/README.md "Isolated load-test restrictions"
[7]: https://docs.netlify.com/build/functions/trigger-on-events/ "Netlify event-triggered functions and JWS verification"
[8]: /home/ubuntu/skills/webdev-periodic-updates/SKILL.md "Platform-managed periodic work requirements"
