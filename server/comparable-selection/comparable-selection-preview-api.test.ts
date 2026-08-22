import type { TrpcContext } from "../_core/context";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { preview } = vi.hoisted(() => ({ preview: vi.fn() }));

vi.mock("./dld-comparable-selection-preview", () => ({
  DldComparableSelectionPreviewService: class {
    preview = preview;
  },
}));

import { appRouter } from "../routers";

const AS_OF = new Date("2026-08-20T00:00:00.000Z");

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("comparableSelection.preview", () => {
  beforeEach(() => vi.clearAllMocks());

  it("admits only the approved read-only DLD preview input and returns the server preview", async () => {
    preview.mockResolvedValue({
      status: "selected",
      comparables: [],
      excluded: [],
      search: {
        district: "Business Bay",
        propertyType: "apartment",
        asOf: AS_OF,
        windowDays: 365,
        candidateCount: 0,
        eligibleLocalCount: 0,
      },
    });

    const result = await appRouter
      .createCaller(createPublicContext())
      .comparableSelection.preview({
        district: "Business Bay",
        propertyType: "apartment",
        areaSqm: 100,
        asOf: AS_OF,
      });

    expect(preview).toHaveBeenCalledWith({
      district: "Business Bay",
      propertyType: "apartment",
      areaSqm: 100,
      asOf: AS_OF,
    });
    expect(result.status).toBe("selected");
    expect(result).not.toHaveProperty("valuation");
    expect(result).not.toHaveProperty("confidence");
  });

  it("rejects a candidate-source scope expansion not admitted by the preview contract", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(
      caller.comparableSelection.preview({
        district: "Business Bay",
        propertyType: "apartment",
        areaSqm: 100,
        asOf: AS_OF,
        windowDays: 90,
      } as never)
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
