import { describe, expect, it, vi } from "vitest";

vi.mock("../../server/db", async importOriginal => {
  const actual = await importOriginal<typeof import("../../server/db")>();

  return {
    ...actual,
    getGovernanceStorageSnapshot: vi.fn().mockResolvedValue({
      available: false,
      methodologyVersions: [],
      latestImport: undefined,
      evidence: {
        eligibleRecords: undefined,
        rejectedRecords: undefined,
        latestEligibleTransactionDate: undefined,
      },
    }),
    getServerConnectionRoleEvidence: vi.fn().mockResolvedValue({
      status: "UNAVAILABLE",
      effectiveRole: null,
      sessionRole: null,
      effectiveRoleMatchesSessionRole: null,
      isSuperuser: null,
      bypassesRls: null,
    }),
  };
});

import { appRouter } from "../../server/routers";
import { getServerConnectionRoleEvidence } from "../../server/db";
import { NOT_ADMIN_ERR_MSG } from "../../shared/const";

describe("governance administrative surface", () => {
  it("keeps the overview behind the existing admin authorization gate", async () => {
    const caller = appRouter.createCaller({
      req: {} as never,
      res: undefined,
      user: { id: 7, role: "user" } as never,
    });

    await expect(caller.governance.overview()).rejects.toMatchObject({
      message: NOT_ADMIN_ERR_MSG,
      code: "FORBIDDEN",
    });
  });

  it("returns read-only governance facts to an administrator", async () => {
    const caller = appRouter.createCaller({
      req: {} as never,
      res: undefined,
      user: { id: 8, role: "admin" } as never,
    });

    await expect(caller.governance.overview()).resolves.toMatchObject({
      configuration: {
        mutationStatus: "UNRESOLVED_POLICY",
      },
    });
  });

  it("keeps server connection-role evidence behind the admin authorization gate", async () => {
    const caller = appRouter.createCaller({
      req: {} as never,
      res: undefined,
      user: { id: 9, role: "user" } as never,
    });

    await expect(caller.governance.admin.connectionRole()).rejects.toMatchObject({
      message: NOT_ADMIN_ERR_MSG,
      code: "FORBIDDEN",
    });
  });

  it("returns only the approved unavailable role-evidence shape", async () => {
    const caller = appRouter.createCaller({
      req: {} as never,
      res: undefined,
      user: { id: 10, role: "admin" } as never,
    });

    const result = await caller.governance.admin.connectionRole();

    expect(result).toEqual({
      status: "UNAVAILABLE",
      effectiveRole: null,
      sessionRole: null,
      effectiveRoleMatchesSessionRole: null,
      isSuperuser: null,
      bypassesRls: null,
    });
    expect(result).not.toHaveProperty("databaseUrl");
    expect(result).not.toHaveProperty("connectionString");
    expect(result).not.toHaveProperty("password");
  });

  it("returns a sanitized observed role record to an administrator", async () => {
    vi.mocked(getServerConnectionRoleEvidence).mockResolvedValueOnce({
      status: "OBSERVED",
      effectiveRole: "miayaar_application",
      sessionRole: "miayaar_application",
      effectiveRoleMatchesSessionRole: true,
      isSuperuser: false,
      bypassesRls: false,
    });
    const caller = appRouter.createCaller({
      req: {} as never,
      res: undefined,
      user: { id: 11, role: "admin" } as never,
    });

    await expect(caller.governance.admin.connectionRole()).resolves.toEqual({
      status: "OBSERVED",
      effectiveRole: "miayaar_application",
      sessionRole: "miayaar_application",
      effectiveRoleMatchesSessionRole: true,
      isSuperuser: false,
      bypassesRls: false,
    });
  });
});
