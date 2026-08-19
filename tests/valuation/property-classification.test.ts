import { describe, expect, test } from "vitest";
import { classifyPropertyType } from "../../server/valuation/property-classification";

describe("canonical property classification", () => {
  test.each([
    ["Flat", null, "apartment"],
    ["unknown source label", "Hotel Apartment", "apartment"],
    ["Shop", null, "retail"],
    ["Office", null, "office"],
    ["Plot", null, "land"],
    ["Warehouse", null, "warehouse"],
  ] as const)("maps source label %s and subtype %s to %s", (rawType, rawSubtype, expected) => {
    expect(classifyPropertyType(rawType, rawSubtype)).toBe(expected);
  });

  test("keeps the primary source type authoritative when subtype text conflicts", () => {
    expect(classifyPropertyType("Villa", "Office")).toBe("villa");
  });

  test("does not fabricate a type for unmapped source values", () => {
    expect(classifyPropertyType("Special purpose asset", null)).toBeUndefined();
  });
});
