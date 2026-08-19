import { and, asc, eq, gte, lte } from "drizzle-orm";
import type {
  MarketIntelligenceEvidenceProvider,
  MarketIntelligenceEvidenceRecord,
  MarketIntelligenceFilters,
} from "../../contracts/market-intelligence.contracts";
import { marketTransactions } from "../../drizzle/schema";
import { getDb } from "../db";

/**
 * Server-local evidence provider for MI v1.0.
 *
 * The provider reads only documented DLD columns and deliberately has no
 * dependency on valuation, confidence, or comparable-search modules.
 */
export class DldMarketIntelligenceProvider
  implements MarketIntelligenceEvidenceProvider
{
  async listEligibleDldEvidence(
    filters: MarketIntelligenceFilters
  ): Promise<readonly MarketIntelligenceEvidenceRecord[]> {
    const db = await getDb();
    if (!db)
      throw new Error("Market intelligence evidence storage is unavailable.");

    const rows = await db
      .select({
        source: marketTransactions.source,
        sourceTransactionId: marketTransactions.sourceTransactionId,
        sourceChecksum: marketTransactions.sourceChecksum,
        transactionDate: marketTransactions.transactionDate,
        district: marketTransactions.district,
        propertyType: marketTransactions.propertyType,
        pricePerSqm: marketTransactions.pricePerSqm,
        ingestedAt: marketTransactions.ingestedAt,
        evidenceStatus: marketTransactions.evidenceStatus,
      })
      .from(marketTransactions)
      .where(
        and(
          eq(marketTransactions.source, filters.source),
          eq(marketTransactions.evidenceStatus, filters.evidenceStatus),
          eq(marketTransactions.district, filters.district),
          eq(marketTransactions.propertyType, filters.propertyType),
          gte(marketTransactions.transactionDate, filters.from),
          lte(marketTransactions.transactionDate, filters.asOf)
        )
      )
      .orderBy(
        asc(marketTransactions.transactionDate),
        asc(marketTransactions.sourceTransactionId)
      );

    return rows.map(row => ({
      source: "DLD",
      sourceTransactionId: row.sourceTransactionId,
      sourceChecksum: row.sourceChecksum,
      transactionDate: new Date(row.transactionDate),
      district: row.district,
      propertyType: row.propertyType,
      pricePerSqm: row.pricePerSqm,
      ingestedAt: new Date(row.ingestedAt),
      evidenceStatus: "eligible",
    }));
  }
}
