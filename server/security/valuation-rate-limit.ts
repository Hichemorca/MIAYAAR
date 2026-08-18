import { createHmac } from "node:crypto";

export const VALUATION_REQUESTS_PER_MINUTE = 100;
export const VALUATION_RATE_LIMIT_WINDOW_MS = 60_000;

type Bucket = { count: number; resetAt: number; lastSeenAt: number };

export type RateLimitDecision = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

/**
 * A bounded, in-memory fixed-window limiter for the public valuation endpoint.
 * Deployments with more than one server instance should replace this adapter with a shared store.
 */
export class FixedWindowRateLimiter {
  private readonly buckets = new Map<string, Bucket>();

  constructor(
    private readonly limit = VALUATION_REQUESTS_PER_MINUTE,
    private readonly windowMs = VALUATION_RATE_LIMIT_WINDOW_MS,
    private readonly maxBuckets = 10_000,
  ) {}

  consume(key: string, now = Date.now()): RateLimitDecision {
    this.prune(now);
    const existing = this.buckets.get(key);
    const bucket = !existing || existing.resetAt <= now
      ? { count: 0, resetAt: now + this.windowMs, lastSeenAt: now }
      : existing;

    bucket.lastSeenAt = now;
    if (bucket.count >= this.limit) {
      this.buckets.set(key, bucket);
      return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
    }

    bucket.count += 1;
    this.buckets.set(key, bucket);
    return { allowed: true, remaining: this.limit - bucket.count, resetAt: bucket.resetAt };
  }

  private prune(now: number) {
    this.buckets.forEach((bucket, key) => {
      if (bucket.resetAt <= now) this.buckets.delete(key);
    });
    if (this.buckets.size < this.maxBuckets) return;
    const oldest = Array.from(this.buckets.entries()).sort(([, left], [, right]) => left.lastSeenAt - right.lastSeenAt);
    for (const [key] of oldest.slice(0, Math.ceil(this.maxBuckets / 10))) this.buckets.delete(key);
  }
}

export function normalizeClientIp(value: string | undefined): string {
  const candidate = value?.trim();
  return candidate && candidate.length <= 128 ? candidate : "unknown";
}

export function rateLimitWindowStart(now = Date.now()): number {
  return Math.floor(now / VALUATION_RATE_LIMIT_WINDOW_MS) * VALUATION_RATE_LIMIT_WINDOW_MS;
}

/** A stable, non-reversible database key that prevents storing raw IP addresses. */
export function createRateLimitWindowKey(clientIp: string, windowStart: number): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is required to create the shared rate-limit key.");
  return createHmac("sha256", secret).update(`${clientIp}:${windowStart}`).digest("hex");
}

export function canRunMarkedLoadTest(isIsolatedEnvironment: boolean): boolean {
  return isIsolatedEnvironment;
}
