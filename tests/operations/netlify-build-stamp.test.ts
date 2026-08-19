import { afterEach, describe, expect, it, vi } from "vitest";
import buildStampHandler, { createBuildStamp } from "../../netlify/functions/build-stamp";

describe("Netlify production build stamp", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("publishes only the Git commit reference and non-secret deployment context", () => {
    expect(
      createBuildStamp({
        commitRef: "81f02ca2d66db6fa1a9fa9dc3e2f94cc8cbfd39d",
        branch: "main",
        context: "production",
      }),
    ).toEqual({
      schemaVersion: "MIAYAAR-BUILD-STAMP-1",
      commitRef: "81f02ca2d66db6fa1a9fa9dc3e2f94cc8cbfd39d",
      branch: "main",
      context: "production",
    });
  });

  it("uses explicit non-secret unknown markers when Netlify metadata is unavailable", () => {
    expect(createBuildStamp({ commitRef: " ", branch: undefined, context: "" })).toEqual({
      schemaVersion: "MIAYAAR-BUILD-STAMP-1",
      commitRef: "unknown",
      branch: "unknown",
      context: "unknown",
    });
  });

  it("serves the minimal non-cacheable stamp from Netlify metadata through GET", async () => {
    const get = vi.fn((key: string) =>
      ({ COMMIT_REF: "81f02ca2d66db6fa1a9fa9dc3e2f94cc8cbfd39d", BRANCH: "main", CONTEXT: "production" })[key],
    );
    vi.stubGlobal("Netlify", { env: { get } });

    const response = await buildStampHandler(new Request("https://miayaar.netlify.app/_miayaar/build"));

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({
      schemaVersion: "MIAYAAR-BUILD-STAMP-1",
      commitRef: "81f02ca2d66db6fa1a9fa9dc3e2f94cc8cbfd39d",
      branch: "main",
      context: "production",
    });
    expect(get).toHaveBeenCalledTimes(3);
    expect(get.mock.calls.map(([key]) => key)).toEqual(["COMMIT_REF", "BRANCH", "CONTEXT"]);
  });

  it("rejects methods other than GET without reading Netlify metadata", async () => {
    const get = vi.fn();
    vi.stubGlobal("Netlify", { env: { get } });

    const response = await buildStampHandler(new Request("https://miayaar.netlify.app/_miayaar/build", { method: "POST" }));

    expect(response.status).toBe(405);
    expect(response.headers.get("allow")).toBe("GET");
    expect(await response.json()).toEqual({ error: { code: "METHOD_NOT_ALLOWED", message: "GET is required." } });
    expect(get).not.toHaveBeenCalled();
  });
});
