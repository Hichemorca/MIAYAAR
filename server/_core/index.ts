import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { consumeValuationRateLimitWindow } from "../db";
import { VALUATION_REQUESTS_PER_MINUTE, VALUATION_RATE_LIMIT_WINDOW_MS, canRunMarkedLoadTest, createRateLimitWindowKey, normalizeClientIp, rateLimitWindowStart } from "../security/valuation-rate-limit";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  app.set("trust proxy", 1);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  app.use("/api/trpc/valuation.run", async (req, res, next) => {
    if (req.header("X-MIAYAAR-Load-Test") && !canRunMarkedLoadTest(process.env.MIAYAAR_ISOLATED_LOAD_TEST === "1")) {
      res.status(403).json({ error: { code: "LOAD_TEST_NOT_ALLOWED", message: "Marked load tests require an isolated MIAYAAR environment." } });
      return;
    }

    const now = Date.now();
    const windowStart = rateLimitWindowStart(now);
    const requestCount = await consumeValuationRateLimitWindow({
      key: createRateLimitWindowKey(normalizeClientIp(req.ip), windowStart),
      windowStart: new Date(windowStart),
      expiresAt: new Date(windowStart + VALUATION_RATE_LIMIT_WINDOW_MS),
    });
    if (requestCount === undefined) {
      res.status(503).json({ error: { code: "RATE_LIMIT_UNAVAILABLE", message: "Valuation protection is temporarily unavailable. Please try again shortly." } });
      return;
    }
    const decision = {
      allowed: requestCount <= VALUATION_REQUESTS_PER_MINUTE,
      remaining: Math.max(0, VALUATION_REQUESTS_PER_MINUTE - requestCount),
      resetAt: windowStart + VALUATION_RATE_LIMIT_WINDOW_MS,
    };
    res.setHeader("RateLimit-Limit", VALUATION_REQUESTS_PER_MINUTE.toString());
    res.setHeader("RateLimit-Remaining", decision.remaining.toString());
    res.setHeader("RateLimit-Reset", Math.ceil(decision.resetAt / 1000).toString());
    if (!decision.allowed) {
      res.status(429).json({ error: { code: "RATE_LIMITED", message: "Too many valuation requests. Please try again shortly." } });
      return;
    }
    next();
  });
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
