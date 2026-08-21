import type { DeploySucceededEvent } from "@netlify/functions";
import { afterEach, describe, expect, test, vi } from "vitest";
import eventFunction, {
  MIAYAAR_NETLIFY_SITE_ID,
  PRODUCTION_BUILD_STAMP_URL,
  attestProductionDeploy,
  observeProductionServerConnectionRole,
} from "../../netlify/functions/deploy-attestation";

const productionStamp = {
  schemaVersion: "MIAYAAR-BUILD-STAMP-1" as const,
  commitRef: "5681ca16208f197388fb8c4696fcbdc2ece2e817",
  branch: "main",
  context: "production",
};

function deployEvent(
  overrides: Partial<DeploySucceededEvent["deploy"]> = {},
  siteId = MIAYAAR_NETLIFY_SITE_ID
): DeploySucceededEvent {
  return {
    site: {
      id: siteId,
      name: "miayaar",
      url: "https://miayaar.netlify.app",
      adminUrl: "https://app.netlify.com/projects/miayaar",
    },
    deploy: {
      id: "deploy-123",
      siteId,
      buildId: "build-123",
      state: "ready",
      errorMessage: null,
      url: "https://miayaar.netlify.app",
      sslUrl: "https://miayaar.netlify.app",
      permalinkUrl: "https://deploy-123--miayaar.netlify.app",
      adminUrl: "https://app.netlify.com/projects/miayaar/deploys/deploy-123",
      context: "production",
      branch: "main",
      commitRef: productionStamp.commitRef,
      commitUrl: null,
      commitMessage: "docs(governance): close Core Types Freeze",
      committer: "MIAYAAR",
      title: "deploy attestation test",
      createdAt: "2026-08-20T00:00:00.000Z",
      publishedAt: "2026-08-20T00:01:00.000Z",
      time: 1000,
      manual: false,
      framework: "vite",
      ...overrides,
    },
  };
}

function stampResponse(
  value: unknown = productionStamp,
  ok = true
): Pick<Response, "ok" | "json"> {
  return {
    ok,
    json: async () => value,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("MIAYAAR Netlify deploy attestation event", () => {
  test("records a match only when the production build stamp identifies the signed main deployment", async () => {
    const fetchBuildStamp = vi.fn(async () => stampResponse());

    const result = await attestProductionDeploy(deployEvent(), fetchBuildStamp);

    expect(result).toEqual({
      schemaVersion: "MIAYAAR-DEPLOY-ATTESTATION-1",
      outcome: "MATCH",
      deployId: "deploy-123",
      siteId: MIAYAAR_NETLIFY_SITE_ID,
      expectedCommitRef: productionStamp.commitRef,
      observedCommitRef: productionStamp.commitRef,
      observedBranch: "main",
      observedContext: "production",
    });
    expect(fetchBuildStamp).toHaveBeenCalledTimes(1);
    expect(fetchBuildStamp).toHaveBeenCalledWith(PRODUCTION_BUILD_STAMP_URL);
  });

  test("records an explicit mismatch when the current production stamp names another commit", async () => {
    const result = await attestProductionDeploy(deployEvent(), async () =>
      stampResponse({ ...productionStamp, commitRef: "another-commit" })
    );

    expect(result.outcome).toBe("MISMATCH");
    expect(result.expectedCommitRef).toBe(productionStamp.commitRef);
    expect(result.observedCommitRef).toBe("another-commit");
  });

  test("records an explicit mismatch when the stamp is not the production main artifact", async () => {
    const result = await attestProductionDeploy(deployEvent(), async () =>
      stampResponse({ ...productionStamp, context: "deploy-preview" })
    );

    expect(result.outcome).toBe("MISMATCH");
    expect(result.observedContext).toBe("deploy-preview");
  });

  test("does not read production for another Netlify site", async () => {
    const fetchBuildStamp = vi.fn(async () => stampResponse());

    const result = await attestProductionDeploy(
      deployEvent({}, "another-site"),
      fetchBuildStamp
    );

    expect(result.outcome).toBe("IGNORED_UNEXPECTED_SITE");
    expect(fetchBuildStamp).not.toHaveBeenCalled();
  });

  test("does not read production for a preview or a non-main deployment", async () => {
    const fetchBuildStamp = vi.fn(async () => stampResponse());

    const preview = await attestProductionDeploy(
      deployEvent({ context: "deploy-preview", branch: "feature/attestation" }),
      fetchBuildStamp
    );
    const branch = await attestProductionDeploy(
      deployEvent({ branch: "release" }),
      fetchBuildStamp
    );

    expect(preview.outcome).toBe("IGNORED_NON_PRODUCTION_MAIN");
    expect(branch.outcome).toBe("IGNORED_NON_PRODUCTION_MAIN");
    expect(fetchBuildStamp).not.toHaveBeenCalled();
  });

  test("records invalid eligible event identity without reading production", async () => {
    const fetchBuildStamp = vi.fn(async () => stampResponse());

    const result = await attestProductionDeploy(
      deployEvent({ commitRef: null }),
      fetchBuildStamp
    );

    expect(result.outcome).toBe("INVALID_EVENT");
    expect(result.expectedCommitRef).toBeNull();
    expect(fetchBuildStamp).not.toHaveBeenCalled();
  });

  test("records unavailable and malformed build-stamp responses explicitly", async () => {
    const unavailable = await attestProductionDeploy(
      deployEvent(),
      async () => {
        throw new Error("network unavailable");
      }
    );
    const malformedJson = await attestProductionDeploy(
      deployEvent(),
      async () => ({
        ok: true,
        json: async () => {
          throw new Error("invalid JSON");
        },
      })
    );
    const malformedContract = await attestProductionDeploy(
      deployEvent(),
      async () => stampResponse({ commitRef: productionStamp.commitRef })
    );

    expect(unavailable.outcome).toBe("STAMP_UNAVAILABLE");
    expect(malformedJson.outcome).toBe("MALFORMED_STAMP");
    expect(malformedContract.outcome).toBe("MALFORMED_STAMP");
  });

  test("observes only non-secret runtime role attributes for a production-main deployment", async () => {
    const observeRole = vi.fn().mockResolvedValue({
      status: "OBSERVED" as const,
      effectiveRole: "service_role",
      sessionRole: "service_role",
      effectiveRoleMatchesSessionRole: true,
      isSuperuser: false,
      bypassesRls: true,
    });

    const result = await observeProductionServerConnectionRole(
      deployEvent(),
      observeRole
    );

    expect(result).toEqual({
      schemaVersion: "MIAYAAR-SERVER-CONNECTION-ROLE-1",
      outcome: "OBSERVED",
      deployId: "deploy-123",
      siteId: MIAYAAR_NETLIFY_SITE_ID,
      expectedCommitRef: productionStamp.commitRef,
      effectiveRole: "service_role",
      sessionRole: "service_role",
      effectiveRoleMatchesSessionRole: true,
      isSuperuser: false,
      bypassesRls: true,
    });
    expect(JSON.stringify(result)).not.toContain("DATABASE_URL");
    expect(JSON.stringify(result)).not.toContain("postgresql://");
  });

  test("does not observe the runtime role outside a signed production-main deployment", async () => {
    const observeRole = vi.fn();

    const result = await observeProductionServerConnectionRole(
      deployEvent({ context: "deploy-preview" }),
      observeRole
    );

    expect(result.outcome).toBe("IGNORED_NON_PRODUCTION_MAIN");
    expect(observeRole).not.toHaveBeenCalled();
  });

  test("records an unavailable role observation without leaking the query failure", async () => {
    const result = await observeProductionServerConnectionRole(
      deployEvent(),
      async () => {
        throw new Error("connection unavailable");
      }
    );

    expect(result).toMatchObject({
      outcome: "UNAVAILABLE",
      effectiveRole: null,
      sessionRole: null,
      isSuperuser: null,
      bypassesRls: null,
    });
    expect(JSON.stringify(result)).not.toContain("connection unavailable");
  });

  test("writes one non-secret operational record when Netlify invokes the verified event handler", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(stampResponse() as Response);
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);

    await eventFunction.deploySucceeded(deployEvent());

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(PRODUCTION_BUILD_STAMP_URL);
    expect(info).toHaveBeenCalledTimes(2);
    expect(info.mock.calls[0]?.[0]).toBe("[Deploy attestation]");
    expect(info.mock.calls[0]?.[1]).toContain('"outcome":"MATCH"');
    expect(info.mock.calls[0]?.[1]).not.toContain("DATABASE_URL");
    expect(info.mock.calls[1]?.[0]).toBe("[Server connection role evidence]");
    expect(info.mock.calls[1]?.[1]).toContain('"outcome":"UNAVAILABLE"');
    expect(info.mock.calls[1]?.[1]).not.toContain("DATABASE_URL");
  });
});
