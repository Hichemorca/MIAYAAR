import type { Config, Context } from "@netlify/functions";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../../server/routers";
import type { TrpcContext } from "../../server/_core/context";
import { consumeValuationRateLimitWindow } from "../../server/db";
import {
  VALUATION_RATE_LIMIT_WINDOW_MS,
  VALUATION_REQUESTS_PER_MINUTE,
  canRunMarkedLoadTest,
  createRateLimitWindowKey,
  normalizeClientIp,
  rateLimitWindowStart,
} from "../../server/security/valuation-rate-limit";

const trpcEndpoint = "/api/trpc";

function functionContext(request: Request): TrpcContext {
  return {
    // `valuation.run` is deliberately public. The optional Manus OAuth flow is
    // not exposed on this standalone deployment, so no browser identity is read.
    req: request as unknown as TrpcContext["req"],
    res: null,
    user: null,
  };
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0];
  return normalizeClientIp(request.headers.get("x-nf-client-connection-ip") ?? forwarded ?? undefined);
}

function rateLimitHeaders(remaining: number, resetAt: number): HeadersInit {
  return {
    "RateLimit-Limit": VALUATION_REQUESTS_PER_MINUTE.toString(),
    "RateLimit-Remaining": remaining.toString(),
    "RateLimit-Reset": Math.ceil(resetAt / 1000).toString(),
  };
}

function jsonError(status: number, code: string, message: string, headers?: HeadersInit) {
  return new Response(JSON.stringify({ error: { code, message } }), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

async function enforceValuationRateLimit(request: Request): Promise<Response | undefined> {
  if (request.headers.get("X-MIAYAAR-Load-Test") && !canRunMarkedLoadTest(Netlify.env.get("MIAYAAR_ISOLATED_LOAD_TEST") === "1")) {
    return jsonError(403, "LOAD_TEST_NOT_ALLOWED", "Marked load tests require an isolated MIAYAAR environment.");
  }

  const now = Date.now();
  const windowStart = rateLimitWindowStart(now);
  try {
    const requestCount = await consumeValuationRateLimitWindow({
      key: createRateLimitWindowKey(clientIp(request), windowStart),
      windowStart: new Date(windowStart),
      expiresAt: new Date(windowStart + VALUATION_RATE_LIMIT_WINDOW_MS),
    });
    if (requestCount === undefined) {
      return jsonError(503, "RATE_LIMIT_UNAVAILABLE", "Valuation protection is temporarily unavailable. Please try again shortly.");
    }

    const remaining = Math.max(0, VALUATION_REQUESTS_PER_MINUTE - requestCount);
    const headers = rateLimitHeaders(remaining, windowStart + VALUATION_RATE_LIMIT_WINDOW_MS);
    if (requestCount > VALUATION_REQUESTS_PER_MINUTE) {
      return jsonError(429, "RATE_LIMITED", "Too many valuation requests. Please try again shortly.", headers);
    }
    return undefined;
  } catch (error) {
    console.error("[Rate limit] Netlify request rejected because protection failed", error);
    return jsonError(503, "RATE_LIMIT_UNAVAILABLE", "Valuation protection is temporarily unavailable. Please try again shortly.");
  }
}

export default async (request: Request, _context: Context) => {
  const pathname = new URL(request.url).pathname;
  if (pathname === "/api/trpc/valuation.run") {
    const rateLimitRejection = await enforceValuationRateLimit(request);
    if (rateLimitRejection) return rateLimitRejection;
  }

  const response = await fetchRequestHandler({
    endpoint: trpcEndpoint,
    req: request,
    router: appRouter,
    createContext: () => functionContext(request),
  });

  if (pathname === "/api/trpc/valuation.run") {
    // The limiter ran successfully; preserve the service's normal response and
    // expose its quota metadata without duplicating response body consumption.
    response.headers.set("RateLimit-Limit", VALUATION_REQUESTS_PER_MINUTE.toString());
  }
  return response;
};

export const config: Config = {
  path: "/api/trpc/*",
};
