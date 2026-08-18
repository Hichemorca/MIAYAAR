import { describe, expect, it } from "vitest";
import { frozenMethodologyChecksum } from "./methodology-registry";

describe("methodology registry", () => {
  it("exposes a stable fingerprint for the frozen release", () => {
    expect(frozenMethodologyChecksum).toMatch(/^[a-f0-9]{64}$/);
  });
});
