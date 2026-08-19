import { and, asc, eq } from "drizzle-orm";
import type {
  EvidenceIntegrityEvidenceProvider,
  EvidenceIntegrityEvidenceRecord,
  EvidenceIntegrityScope,
} from "../../contracts/evidence-integrity.contracts";
import { marketTransactions } from "../../drizzle/schema";
import { getDb } from "../db";

/**
 * Read-only DLD provider for Evidence Integrity v1.0.
 *
 * Time-window classification belongs to the policy service so it can record
 * factual future and outside-window exclusions in its provenance.
 */
export class DldEvidenceIntegrityProvider
  implements EvidenceIntegrityEvidenceProvider
{
  async listDldEvidence(
    scope: EvidenceIntegrityScope
  ): Promise<readonly EvidenceIntegrityEvidenceRecord[]> {
    const db = await getDb();
    if (!db)
      throw new Error("Evidence integrity evidence storage is unavailable.");

    const rows = await db
      .select({
        source: marketTransactions.source,
        sourceTransactionId: marketTransactions.sourceTransactionId,
        sourceChecksum: marketTransactions.sourceChecksum,
        transactionDate: marketTransactions.transactionDate,
        district: marketTransactions.district,
        propertyType: marketTransactions.propertyType,
        evidenceStatus: marketTransactions.evidenceStatus,
        rejectionReason: marketTransactions.rejectionReason,
        ingestedAt: marketTransactions.ingestedAt,
      })
      .from(marketTransactions)
      .where(
        and(
          eq(marketTransactions.source, scope.source),
          eq(marketTransactions.district, scope.district),
          eq(marketTransactions.propertyType, scope.propertyType)
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
      evidenceStatus: row.evidenceStatus,
      rejectionReason: row.rejectionReason,
      ingestedAt: new Date(row.ingestedAt),
    }));
  }
}
