import { check, sleep } from "k6";
import httpClient from "k6/http";

const baseUrl = __ENV.LOAD_TEST_BASE_URL;
const confirmation = __ENV.LOAD_TEST_CONFIRMATION;
const isolated = __ENV.MIAYAAR_ISOLATED_LOAD_TEST;

if (!baseUrl) throw new Error("LOAD_TEST_BASE_URL is required and must target an isolated MIAYAAR deployment.");
if (isolated !== "1" || confirmation !== "I_UNDERSTAND_THIS_TARGET_IS_ISOLATED") {
  throw new Error("Refusing to run: set MIAYAAR_ISOLATED_LOAD_TEST=1 and the explicit isolation confirmation.");
}

export const options = {
  summaryTrendStats: ["min", "avg", "med", "max", "p(90)", "p(95)", "p(99)"],
  stages: [
    { duration: "30s", target: 10 },
    { duration: "1m", target: 50 },
    { duration: "2m", target: 100 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000"],
    http_req_failed: ["rate<0.01"],
  },
};

const submission = {
  propertyType: "apartment",
  district: "JUMEIRAH VILLAGE CIRCLE",
  areaSqm: 100,
  bedrooms: 1,
  yearBuilt: 2020,
  condition: "good",
  buildingCondition: "well_maintained",
  views: ["city"],
  finish: "normal",
  furnished: "semi_furnished",
  floor: "high",
  annualRentAed: 120000,
};

export default function () {
  const payload = JSON.stringify({ 0: { json: submission } });
  const response = httpClient.post(`${baseUrl}/api/trpc/valuation.run?batch=1`, payload, {
    headers: {
      "Content-Type": "application/json",
      "X-MIAYAAR-Load-Test": "isolated-load-test",
      // RFC 2544 benchmark range; each virtual user remains below the public per-IP limit.
      "X-Forwarded-For": `198.18.0.${__VU}`,
    },
    tags: { endpoint: "valuation.run" },
  });

  check(response, {
    "returns HTTP 200": item => item.status === 200,
    "returns a tRPC result": item => {
      try {
        const parsed = JSON.parse(item.body);
        return Array.isArray(parsed) && parsed[0]?.result?.data?.json?.report !== undefined;
      } catch {
        return false;
      }
    },
  });
  sleep(1);
}
