import { describe, expect, test } from "vitest";
import {
  FixedWindowRateLimiter,
  VALUATION_REQUESTS_PER_MINUTE,
  canRunMarkedLoadTest,
  createRateLimitWindowKey,
  normalizeClientIp,
  rateLimitWindowStart,
} from "./valuation-rate-limit";

describe("public valuation rate limiting", () => {
  test("allows exactly 100 requests per IP in a minute and rejects the next request", () => {
    const limiter = new FixedWindowRateLimiter();
    const now = 1_000_000;
    for (let index = 0; index < VALUATION_REQUESTS_PER_MINUTE; index += 1) {
      expect(limiter.consume("203.0.113.5", now).allowed).toBe(true);
    }
    const blocked = limiter.consume("203.0.113.5", now);
    expect(blocked).toMatchObject({ allowed: false, remaining: 0 });
  });

  test("separates clients and opens a fresh window after reset", () => {
    const limiter = new FixedWindowRateLimiter(1, 60_000);
    expect(limiter.consume("198.51.100.1", 0).allowed).toBe(true);
    expect(limiter.consume("198.51.100.2", 0).allowed).toBe(true);
    expect(limiter.consume("198.51.100.1", 60_000).allowed).toBe(true);
  });

  test("keeps marked load-test requests out of shared environments", () => {
    expect(canRunMarkedLoadTest(false)).toBe(false);
    expect(canRunMarkedLoadTest(true)).toBe(true);
    expect(normalizeClientIp(undefined)).toBe("unknown");
    expect(normalizeClientIp(" 203.0.113.4 ")).toBe("203.0.113.4");
  });

  test("uses minute-aligned HMAC keys without persisting the raw client address", () => {
    const previousSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = "test-only-rate-limit-secret";
    const windowStart = rateLimitWindowStart(121_234);
    const key = createRateLimitWindowKey("203.0.113.17", windowStart);

    expect(windowStart).toBe(120_000);
    expect(key).toMatch(/^[a-f0-9]{64}$/);
    expect(key).not.toContain("203.0.113.17");
    expect(key).toBe(createRateLimitWindowKey("203.0.113.17", windowStart));

    process.env.JWT_SECRET = previousSecret;
  });
});
