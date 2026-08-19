# Netlify build provenance

## Purpose

The public `GET /_miayaar/build` endpoint exposes a minimal, non-secret build stamp so an operator can identify the Git source reference of the artifact currently responding in a Netlify deployment. A build lifecycle script captures Netlify's `COMMIT_REF`, `BRANCH`, and `CONTEXT` while Netlify is building the artifact; the serverless function serves that generated immutable module and does not rely on runtime environment lookup.

## Response contract

```json
{
  "schemaVersion": "MIAYAAR-BUILD-STAMP-1",
  "commitRef": "<Netlify COMMIT_REF or unknown>",
  "branch": "<Netlify BRANCH or unknown>",
  "context": "<Netlify CONTEXT or unknown>"
}
```

The endpoint accepts `GET` only, uses `Cache-Control: no-store`, and never exposes database URLs, tokens, deployment identifiers, request data, valuation evidence, or user data.

## Operating procedure

1. Read the production endpoint: `curl --fail --silent https://miayaar.netlify.app/_miayaar/build`.
2. Confirm `branch` is `main` and `context` is `production`.
3. Compare `commitRef` with the GitHub commit that Netlify was expected to deploy. To prove that a named pull request is included, verify it is an ancestor of `commitRef` with `git merge-base --is-ancestor <required-commit> <commitRef>`.
4. Treat `unknown` as an unavailable provenance signal, not as evidence of a successful deployment.

## Scope boundary

This endpoint is deployment observability only. It does not participate in the valuation API, evidence selection, canonical methodology, rate limiting, user authentication, or decision records.
