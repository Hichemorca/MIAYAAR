import type { Context } from "@netlify/functions";
import { describe, expect, test } from "vitest";
import handler, { clientIp } from "../../netlify/functions/api";

describe("MIAYAAR Netlify tRPC function", () => {
  test("prefers Netlify's client-IP header and normalizes forwarded values", () => {
    expect(clientIp(new Request("https://miayaar.example/api/trpc/auth.me", {
      headers: { "x-nf-client-connection-ip": " 203.0.113.8 " },
    }))).toBe("203.0.113.8");

    expect(clientIp(new Request("https://miayaar.example/api/trpc/auth.me", {
      headers: { "x-forwarded-for": "198.51.100.12, 10.0.0.1" },
    }))).toBe("198.51.100.12");
  });

  test("keeps the public auth-state endpoint reachable through the Netlify function", async () => {
    const response = await handler(
      new Request("https://miayaar.example/api/trpc/auth.me?input=%7B%22json%22%3Anull%7D"),
      {} as Context,
    );
    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toContain("null");
  });
});
