import { marketTransactions } from "../../drizzle/schema";
import type { MarketAssumptions } from "../../shared/valuation/contracts";
import { getLatestEligibleEvidenceDate, listEligibleComparableTransactions } from "../db";
import { normalizeDistrict } from "./evidence-validation";
import type { ComparableEvidence, ComparableSearchResult } from "./evidence.contracts";

const minimumComparableCount = 5;
const maximumComparableCount = 12;
const searchWindowsDays = [90, 180, 365, 730] as const;
const dayMs = 86_400_000;

function daysAgo(asOf: Date, days: number) {
  return new Date(asOf.getTime() - days * dayMs);
}

function ageInDays(transactionDate: Date, asOf: Date) {
  return Math.max(0, Math.floor((asOf.getTime() - transactionDate.getTime()) / dayMs));
}

function toComparable(row: typeof marketTransactions.$inferSelect, asOf: Date, valueGrowthRate: number): ComparableEvidence {
  const ageDays = ageInDays(row.transactionDate, asOf);
  return {
    sourceTransactionId: row.sourceTransactionId,
    transactionDate: row.transactionDate,
    district: row.district,
    propertyType: row.propertyType,
    areaSqm: row.areaSqm,
    salePriceAed: row.salePriceAed,
    pricePerSqm: row.pricePerSqm,
    ageDays,
    timeAdjustedPricePerSqm: row.pricePerSqm * Math.pow(1 + valueGrowthRate, ageDays / 365.25),
  };
}

/**
 * Returns only same-district, same-type eligible DLD evidence. It deliberately
 * does not broaden to city-wide records; an insufficient local sample is an
 * unavailable result under MIAYAAR's minimum-five-comparables policy.
 */
export async function findComparableEvidence(input: { district: string; propertyType: typeof marketTransactions.$inferSelect["propertyType"] }, assumptions: Pick<MarketAssumptions, "valueGrowthRate">, asOf?: Date): Promise<ComparableSearchResult> {
  const effectiveAsOf = asOf ?? await getLatestEligibleEvidenceDate();
  if (!effectiveAsOf) throw new Error("No eligible market evidence is available.");
  const district = normalizeDistrict(input.district);

  for (const windowDays of searchWindowsDays) {
    const rows = await listEligibleComparableTransactions({ district, propertyType: input.propertyType, from: daysAgo(effectiveAsOf, windowDays) });

    if (rows.length >= minimumComparableCount) {
      return {
        status: "available",
        comparables: rows.slice(0, maximumComparableCount).map(row => toComparable(row, effectiveAsOf, assumptions.valueGrowthRate)),
        search: { district, propertyType: input.propertyType, windowDays, asOf: effectiveAsOf },
      };
    }
  }

  const oldestWindow = searchWindowsDays.at(-1)!;
  const rows = await listEligibleComparableTransactions({ district, propertyType: input.propertyType, from: daysAgo(effectiveAsOf, oldestWindow) });
  return {
    status: "unavailable",
    reason: "insufficient_local_comparables",
    availableCount: rows.length,
    requiredCount: minimumComparableCount,
    search: { district, propertyType: input.propertyType, windowDays: oldestWindow, asOf: effectiveAsOf },
  };
}
