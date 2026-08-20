import type { Context } from "@netlify/functions";
import superjson from "superjson";
import { describe, expect, test, vi } from "vitest";
import handler, { clientIp } from "../../netlify/functions/api";

describe("MIAYAAR Netlify tRPC function", () => {
  test("prefers Netlify's client-IP header and normalizes forwarded values", () => {
    expect(
      clientIp(
        new Request("https://miayaar.example/api/trpc/auth.me", {
          headers: { "x-nf-client-connection-ip": " 203.0.113.8 " },
        })
      )
    ).toBe("203.0.113.8");

    expect(
      clientIp(
        new Request("https://miayaar.example/api/trpc/auth.me", {
          headers: { "x-forwarded-for": "198.51.100.12, 10.0.0.1" },
        })
      )
    ).toBe("198.51.100.12");
  });

  test("keeps the public auth-state endpoint reachable through the Netlify function", async () => {
    const response = await handler(
      new Request(
        "https://miayaar.example/api/trpc/auth.me?input=%7B%22json%22%3Anull%7D"
      ),
      {} as Context
    );
    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toContain("null");
  });

  test("does not expose a stack trace when a public procedure rejects invalid input", async () => {
    const errorLog = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const url = new URL(
      "https://miayaar.example/api/trpc/evidenceIntegrity.report"
    );
    url.searchParams.set(
      "input",
      JSON.stringify(
        superjson.serialize({
          district: "Business Bay",
          propertyType: "apartment",
          asOf: new Date("2026-08-20T00:00:00.000Z"),
          areaSqm: 100,
        })
      )
    );

    try {
      const response = await handler(new Request(url), {} as Context);

      expect(response.status).toBe(400);
      const body = await response.text();
      expect(body).toContain("BAD_REQUEST");
      expect(body).not.toContain('"stack"');
      expect(body).not.toContain("internal/server.ts");
      if (process.env.NODE_ENV === "development") {
        expect(errorLog).toHaveBeenCalledOnce();
      } else {
        expect(errorLog).not.toHaveBeenCalled();
      }
    } finally {
      errorLog.mockRestore();
    }
  });
});
