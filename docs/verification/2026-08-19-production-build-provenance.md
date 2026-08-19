# Production Build-Provenance Verification

**Date:** 2026-08-19 UTC  
**Production URL:** `https://miayaar.netlify.app`  
**Verification mode:** read-only HTTP and Git ancestry checks

## Purpose

This record closes the version-level limitation stated in the post-PR #9 behavioral verification. It verifies that the active Netlify artifact exposes the Git reference captured during its own production build and that this reference contains the PR #9 merge commit. It does not replace the prior evidence-backed valuation-path checks. [1]

## Production observation

At **2026-08-19 19:07:05 GMT**, `GET /_miayaar/build` returned HTTP `200` from the public production domain. The response had `Content-Type: application/json`, `Cache-Control: no-store`, and `X-Content-Type-Options: nosniff`.

| Field | Observed value |
|---|---|
| `schemaVersion` | `MIAYAAR-BUILD-STAMP-1` |
| `commitRef` | `3d3b441b5b2be83f1e8612bfde28d8bbb8e892c2` |
| `branch` | `main` |
| `context` | `production` |

The endpoint publishes only the four fields above. It does not expose database credentials, provider tokens, request headers, or valuation/evidence data. [2]

## Git verification

The observed `commitRef` exactly matched the current `origin/main` ref at verification. Git's ancestry check `git merge-base --is-ancestor 81f02ca 3d3b441b5b2be83f1e8612bfde28d8bbb8e892c2` exited successfully. Therefore, the artifact built from the observed production ref includes PR #9 merge `81f02ca`, as well as the subsequent build-stamp changes merged through PR #10 and PR #11. [3] [4] [5]

| Claim | Evidence | Result |
|---|---|---|
| The active artifact identifies its source ref | Production `GET /_miayaar/build` response | Pass |
| The source ref is the current `main` ref | Exact SHA comparison | Pass |
| PR #9 is included in the source history | Git ancestry check from `81f02ca` to observed SHA | Pass |
| No valuation behavior was changed for this verification | PR #10 and PR #11 scopes and code review | Pass |

## Result and scope boundary

The platform may now claim **version-level production confirmation for PR #9 and all commits through `3d3b441`**. The proof is an operational build-time attestation: Netlify-provided build metadata is captured into the deployed function during the build and is returned without caching. It is not a cryptographic artifact signature and does not alter the frozen methodology, canonical contracts, DLD evidence, valuation calculations, authentication, rate limit, or audit decision records.

## References

[1]: https://github.com/Hichemorca/MIAYAAR/blob/main/docs/verification/2026-08-19-production-post-pr9-verification.md "Post-PR #9 production behavioral verification"
[2]: https://miayaar.netlify.app/_miayaar/build "MIAYAAR production build stamp"
[3]: https://github.com/Hichemorca/MIAYAAR/pull/9 "PR #9: server-side classification and browser-engine removal"
[4]: https://github.com/Hichemorca/MIAYAAR/pull/10 "PR #10: initial Netlify build-stamp endpoint"
[5]: https://github.com/Hichemorca/MIAYAAR/pull/11 "PR #11: build-time Netlify provenance capture"
