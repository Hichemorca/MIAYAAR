import type { TRPCDefaultErrorShape } from "@trpc/server";
import { describe, expect, test } from "vitest";
import { redactPublicErrorStack } from "./trpc";

function errorShape(): TRPCDefaultErrorShape {
  return {
    message: "Validation failed",
    code: -32600,
    data: {
      code: "BAD_REQUEST",
      httpStatus: 400,
      path: "evidenceIntegrity.report",
      stack: "TRPCError: Validation failed\n    at internal/server.ts:42:9",
    },
  };
}

describe("redactPublicErrorStack", () => {
  test("removes internal stack details while retaining the public error semantics", () => {
    expect(redactPublicErrorStack(errorShape())).toEqual({
      message: "Validation failed",
      code: -32600,
      data: {
        code: "BAD_REQUEST",
        httpStatus: 400,
        path: "evidenceIntegrity.report",
      },
    });
  });

  test("does not mutate the original diagnostic shape", () => {
    const shape = errorShape();
    redactPublicErrorStack(shape);
    expect(shape.data.stack).toContain("internal/server.ts");
  });
});
