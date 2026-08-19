import {
  EVIDENCE_INTEGRITY_MINIMUM_ELIGIBLE_RECORDS,
  EVIDENCE_INTEGRITY_POLICY_VERSION,
  EVIDENCE_INTEGRITY_WINDOW_DAYS,
  type EvidenceIntegrityEvidenceProvider,
  type EvidenceIntegrityEvidenceRecord,
  type EvidenceIntegrityFilters,
  type EvidenceIntegrityObservation,
  type EvidenceIntegrityProvenance,
  type EvidenceIntegrityRecordProvenance,
  type EvidenceIntegrityRequest,
  type EvidenceIntegrityResult,
  type EvidenceIntegrityScope,
  type EvidenceIntegritySummary,
} from "../../contracts/evidence-integrity.contracts";

function copyDate(value: Date): Date {
  return new Date(value.getTime());
}

function subtractCalendarDays(asOf: Date, days: number): Date {
  const result = copyDate(asOf);
  result.setUTCDate(result.getUTCDate() - days);
  return result;
}

function assertRequest(request: EvidenceIntegrityRequest): void {
  if (!request.district.trim())
    throw new Error("Evidence integrity district is required.");
  if (Number.isNaN(request.asOf.getTime()))
    throw new Error("Evidence integrity asOf must be a valid date.");
}

function belongsToScope(
  record: EvidenceIntegrityEvidenceRecord,
  scope: EvidenceIntegrityScope
): boolean {
  return (
    record.source === scope.source &&
    record.district === scope.district &&
    record.propertyType === scope.propertyType
  );
}

function ordered(
  records: readonly EvidenceIntegrityEvidenceRecord[]
): EvidenceIntegrityEvidenceRecord[] {
  return [...records].sort((left, right) => {
    const dateDifference =
      left.transactionDate.getTime() - right.transactionDate.getTime();
    return dateDifference !== 0
      ? dateDifference
      : left.sourceTransactionId.localeCompare(right.sourceTransactionId);
  });
}

function recordProvenance(
  records: readonly EvidenceIntegrityEvidenceRecord[]
): EvidenceIntegrityRecordProvenance[] {
  return records.map(record => ({
    sourceTransactionId: record.sourceTransactionId,
    sourceChecksum: record.sourceChecksum,
    transactionDate: copyDate(record.transactionDate),
    ingestedAt: copyDate(record.ingestedAt),
    evidenceStatus: record.evidenceStatus,
    rejectionReason: record.rejectionReason,
  }));
}

function buildProvenance(
  filters: EvidenceIntegrityFilters,
  records: readonly EvidenceIntegrityEvidenceRecord[]
): EvidenceIntegrityProvenance {
  const provenanceRecords = recordProvenance(records);
  return {
    source: "DLD",
    policyVersion: EVIDENCE_INTEGRITY_POLICY_VERSION,
    asOf: copyDate(filters.asOf),
    filters: {
      ...filters,
      from: copyDate(filters.from),
      asOf: copyDate(filters.asOf),
    },
    recordCount: provenanceRecords.length,
    records: provenanceRecords,
    sourceTransactionIds: provenanceRecords.map(
      record => record.sourceTransactionId
    ),
    sourceChecksums: provenanceRecords.map(record => record.sourceChecksum),
  };
}

function observation(
  code: EvidenceIntegrityObservation["code"],
  records: readonly EvidenceIntegrityEvidenceRecord[]
): EvidenceIntegrityObservation {
  return {
    code,
    recordCount: records.length,
    records: recordProvenance(records),
  };
}

/**
 * Facts-only Evidence Integrity v1.0 service.
 *
 * This service emits DLD eligibility and temporal-observation facts only. It
 * has no dependency on valuation, confidence, comparable selection, or price
 * classification modules.
 */
export class EvidenceIntegrityService {
  constructor(
    private readonly evidenceProvider: EvidenceIntegrityEvidenceProvider
  ) {}

  async inspect(
    request: EvidenceIntegrityRequest
  ): Promise<EvidenceIntegrityResult> {
    assertRequest(request);

    const asOf = copyDate(request.asOf);
    const scope: EvidenceIntegrityScope = {
      source: "DLD",
      district: request.district,
      propertyType: request.propertyType,
    };
    const filters: EvidenceIntegrityFilters = {
      ...scope,
      from: subtractCalendarDays(asOf, EVIDENCE_INTEGRITY_WINDOW_DAYS),
      asOf,
    };

    const scopedRecords = ordered(
      (await this.evidenceProvider.listDldEvidence(scope)).filter(record =>
        belongsToScope(record, scope)
      )
    );
    const futureRecords = scopedRecords.filter(
      record => record.transactionDate.getTime() > filters.asOf.getTime()
    );
    const nonFutureRecords = scopedRecords.filter(
      record => record.transactionDate.getTime() <= filters.asOf.getTime()
    );
    const outsideWindowRecords = nonFutureRecords.filter(
      record => record.transactionDate.getTime() < filters.from.getTime()
    );
    const inWindowRecords = nonFutureRecords.filter(
      record => record.transactionDate.getTime() >= filters.from.getTime()
    );
    const eligibleRecords = inWindowRecords.filter(
      record => record.evidenceStatus === "eligible"
    );
    const rejectedRecords = inWindowRecords.filter(
      record => record.evidenceStatus === "rejected"
    );
    const isAvailable =
      eligibleRecords.length >= EVIDENCE_INTEGRITY_MINIMUM_ELIGIBLE_RECORDS;
    const observations: EvidenceIntegrityObservation[] = [
      observation(
        isAvailable
          ? "eligible_evidence_available"
          : "insufficient_local_evidence",
        eligibleRecords
      ),
    ];

    if (futureRecords.length)
      observations.push(
        observation("future_dated_evidence_excluded", futureRecords)
      );
    if (outsideWindowRecords.length)
      observations.push(
        observation("outside_window_evidence_excluded", outsideWindowRecords)
      );
    if (rejectedRecords.length)
      observations.push(
        observation("rejected_evidence_observed", rejectedRecords)
      );

    const summary: EvidenceIntegritySummary = {
      eligibleRecordCount: eligibleRecords.length,
      requiredEligibleRecordCount: EVIDENCE_INTEGRITY_MINIMUM_ELIGIBLE_RECORDS,
      rejectedRecordCount: rejectedRecords.length,
      futureExcludedRecordCount: futureRecords.length,
      outsideWindowExcludedRecordCount: outsideWindowRecords.length,
    };
    const provenance = buildProvenance(filters, scopedRecords);

    return isAvailable
      ? { status: "available", observations, summary, provenance }
      : {
          status: "unavailable",
          reason: "insufficient_local_evidence",
          observations,
          summary,
          provenance,
        };
  }
}
