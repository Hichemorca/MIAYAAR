import { describe, expect, it } from "vitest";
import { classifyPropertyType, normalizeDldEvidence, normalizeDistrict } from "./evidence-validation";

describe("DLD evidence normalization", () => {
  it("normalizes district spelling and retains an eligible residential apartment", () => {
    const result = normalizeDldEvidence({ id: "dld-1", d: "2026-05-01", t: "Apartment", s: "Unit", x: "  Dubai   Marina ", a: 100, p: 1_500_000, r: null });
    expect(result).toMatchObject({ district: "DUBAI MARINA", propertyType: "apartment", evidenceStatus: "eligible", pricePerSqm: 15_000 });
  });

  it("rejects ultra-luxury and commercial land records before comparable search", () => {
    expect(normalizeDldEvidence({ id: "dld-2", d: "2026-05-01", t: "Villa", s: "", x: "Palm", a: 120, p: 7_000_000, r: null })?.rejectionReason).toBe("ultra_luxury");
    expect(normalizeDldEvidence({ id: "dld-3", d: "2026-05-01", t: "Land", s: "Commercial", x: "Dubai", a: 500, p: 10_000_000, r: null })?.rejectionReason).toBe("commercial_land");
  });

  it("classifies only a documented property family", () => {
    expect(classifyPropertyType("Office", "Unit")).toBe("office");
    expect(classifyPropertyType("Other", "Unknown")).toBeUndefined();
    expect(normalizeDistrict("Jumeirah   Village Circle")).toBe("JUMEIRAH VILLAGE CIRCLE");
  });

  it("does not propagate unsupported secondary attributes from a raw DLD record", () => {
    const normalized = normalizeDldEvidence({
      id: "dld-4",
      d: "2026-05-01",
      t: "Apartment",
      s: "Unit",
      x: "Dubai Marina",
      a: 100,
      p: 1_500_000,
      r: null,
      project: "Unverified project",
      finish: "Unverified finish",
      view: "Unverified view",
      floor: 42,
      rent: 150_000,
    } as never);

    expect(normalized).toBeDefined();
    expect(normalized).not.toHaveProperty("project");
    expect(normalized).not.toHaveProperty("finish");
    expect(normalized).not.toHaveProperty("view");
    expect(normalized).not.toHaveProperty("floor");
    expect(normalized).not.toHaveProperty("rent");
  });
});
