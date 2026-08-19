# Isolated load test

This test intentionally writes valuation requests and audit events. Run it only against a separately provisioned application deployment with a separate database, separate DLD sample, and `MIAYAAR_ISOLATED_LOAD_TEST=1` set on that deployment. The shared evidence and audit environment rejects requests carrying the `X-MIAYAAR-Load-Test` marker before tRPC receives them.

Install [k6](https://grafana.com/docs/k6/latest/set-up/install-k6/) outside the production application, then run:

```bash
MIAYAAR_ISOLATED_LOAD_TEST=1 \
LOAD_TEST_CONFIRMATION=I_UNDERSTAND_THIS_TARGET_IS_ISOLATED \
LOAD_TEST_BASE_URL=https://your-isolated-host.example \
k6 run tests/performance/load-test.js
```

The script reports p50, p95, and p99 request-duration metrics. Its pass thresholds are p95 under two seconds and an HTTP failure rate below one percent; they are acceptance targets, not a substitute for monitoring the isolated database.
