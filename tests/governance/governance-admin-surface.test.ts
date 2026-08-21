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
  };
});

import { appRouter } from "../../server/routers";
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
});
