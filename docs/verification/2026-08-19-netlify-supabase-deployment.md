# Netlify and Supabase deployment record — 2026-08-19

## Targets

| Item | Identifier / URL |
|---|---|
| Supabase project | `lrfvfbjkojzlrriyjvrz` in `eu-central-1` |
| Netlify site ID | `2b4393c8-233e-4ed7-b315-ba633589fb82` |
| Netlify site | https://miayaar.netlify.app |

## Database migration verification

The PostgreSQL schema and MIAYAAR records were migrated to the dedicated Supabase project. The DLD evidence table contained 30,306 transferred records, including 26,764 records with `evidenceStatus = eligible`, matching the migrated source ledger verification.

## Deployment sequence

The first two Netlify attempts failed during deploy validation because the initial function-test file was inside the function directory and was interpreted as an invalid function name. The test is now at `tests/netlify/api.test.ts`; the only file in `netlify/functions/` is `api.ts`.

Deploy `6a8511134681706f03f04f66` became ready at 2026-08-19T02:13:04Z and deployed one `api` function routed at `/api/trpc/*`. A public `auth.me` request returned HTTP 200 with `{"result":{"data":{"json":null}}}`.

The first public `valuation.run` smoke request returned HTTP 503 with `RATE_LIMIT_UNAVAILABLE`. The likely cause was that the Supabase Transaction Pooler hostname ends in `pooler.supabase.com`, while the code only enabled TLS for URLs containing `supabase.co`. The PostgreSQL connection layer was amended to recognise both `.supabase.co` and `.supabase.com`.

## Final verification

Production deploy `6a8517dc2810fa5577ff9df6` became ready at 2026-08-19T02:42:18Z. After `DATABASE_URL` was updated to the Transaction Pooler URL, the following checks passed:

| Check | Result |
|---|---|
| Public frontend | `https://miayaar.netlify.app` loaded the MIAYAAR property-file interface successfully. |
| Public tRPC valuation | `POST /api/trpc/valuation.run` returned HTTP 200. |
| Evidence access | The returned report was `partial` with `evidence.status = available`, including DLD comparables for JUMEIRAH VILLAGE CIRCLE. |
| Shared rate limiter | Response included `RateLimit-Limit: 100`; the Supabase counter recorded `requestCount = 2` for the active window, proving the deployed function writes through the shared database counter. |
| Secret scanning | Netlify deployment validation reported zero secret matches in 241 scanned files. |
