import { createHash } from "node:crypto";

export const DLD_EVIDENCE_LIMITS = Object.freeze({
  maxUnitPriceAed: 50_000,
  maxPriceAed: 50_000_000,
  minimumAreaSqm: 10,
});

const classifications = [
  ["apartment", ["APARTMENT", "UNIT", "FLAT"]],
  ["villa", ["VILLA"]],
  ["townhouse", ["TOWNHOUSE"]],
  ["office", ["OFFICE"]],
  ["retail", ["RETAIL", "SHOP"]],
  ["warehouse", ["WAREHOUSE"]],
  ["land", ["LAND", "PLOT"]],
];

function text(...parts) {
  return parts.filter(Boolean).join(" ").trim().toUpperCase();
}

function classify(rawType, rawSubType) {
  const primary = text(rawType);
  const primaryMatch = classifications.find(([, terms]) => terms.some(term => primary.includes(term)));
  if (primaryMatch) return primaryMatch[0];
  const fallback = text(rawType, rawSubType);
  return classifications.find(([, terms]) => terms.some(term => fallback.includes(term)))?.[0];
}

function sourceTransactionId(record) {
  const sourceId = String(record?.id ?? "").trim();
  return sourceId ? `dld:${sourceId}` : undefined;
}

function recordFingerprint(record) {
  return createHash("sha256").update(JSON.stringify(record)).digest("hex");
}

function invalidReason(record) {
  if (!sourceTransactionId(record)) return "missing_source_transaction_id";
  if (!classify(record.t, record.s)) return "unsupported_property_type";
  const date = new Date(record.d);
  if (Number.isNaN(date.getTime())) return "invalid_transaction_date";
  const areaSqm = Number(record.a);
  if (!Number.isFinite(areaSqm) || areaSqm <= DLD_EVIDENCE_LIMITS.minimumAreaSqm) return "invalid_area_sqm";
  const salePriceAed = Number(record.p);
  if (!Number.isFinite(salePriceAed) || salePriceAed <= 0) return "invalid_sale_price_aed";
  const district = String(record.x ?? "").trim();
  if (!district) return "missing_district";
  return undefined;
}

export function normalizeDldRecord(record) {
  const reason = invalidReason(record);
  if (reason) return { record: undefined, invalidReason: reason };

  const propertyType = classify(record.t, record.s);
  const areaSqm = Number(record.a);
  const salePriceAed = Number(record.p);
  const rawText = text(record.t, record.s);
  let rejectionReason = null;
  if (propertyType === "land" && /(COMMERCIAL|GENERAL USE)/.test(rawText)) rejectionReason = "commercial_land";
  if (salePriceAed > DLD_EVIDENCE_LIMITS.maxPriceAed || salePriceAed / areaSqm > DLD_EVIDENCE_LIMITS.maxUnitPriceAed) rejectionReason = "ultra_luxury";

  return {
    record: {
      sourceTransactionId: sourceTransactionId(record),
      transactionDate: new Date(record.d),
      district: String(record.x).trim().replace(/\s+/g, " ").toUpperCase(),
      propertyType,
      rawType: String(record.t ?? "Unknown"),
      rawSubType: record.s ? String(record.s) : null,
      areaSqm,
      salePriceAed,
      pricePerSqm: salePriceAed / areaSqm,
      evidenceStatus: rejectionReason ? "rejected" : "eligible",
      rejectionReason,
    },
    invalidReason: undefined,
  };
}

/**
 * Creates a normalized import set without changing or overwriting the supplied raw records.
 * Invalid source records are omitted from the import set but retained in the issue ledger.
 */
export function cleanDldRecords(records) {
  if (!Array.isArray(records)) throw new TypeError("DLD records must be an array.");

  const cleanedRecords = [];
  const issues = [];
  const firstSeenAt = new Map();

  records.forEach((record, recordIndex) => {
    const fingerprint = recordFingerprint(record);
    const transactionId = sourceTransactionId(record);
    if (transactionId && firstSeenAt.has(transactionId)) {
      issues.push({
        recordIndex,
        issueType: "duplicate",
        reason: `duplicate_source_transaction_id:first_seen_at_index=${firstSeenAt.get(transactionId)}`,
        sourceTransactionId: transactionId,
        recordFingerprint: fingerprint,
      });
      return;
    }
    if (transactionId) firstSeenAt.set(transactionId, recordIndex);

    const normalized = normalizeDldRecord(record);
    if (!normalized.record) {
      issues.push({
        recordIndex,
        issueType: "invalid",
        reason: normalized.invalidReason,
        sourceTransactionId: transactionId ?? null,
        recordFingerprint: fingerprint,
      });
      return;
    }

    cleanedRecords.push(normalized.record);
    if (normalized.record.evidenceStatus === "rejected") {
      issues.push({
        recordIndex,
        issueType: "rejected",
        reason: normalized.record.rejectionReason,
        sourceTransactionId: normalized.record.sourceTransactionId,
        recordFingerprint: fingerprint,
      });
    }
  });

  const eligible = cleanedRecords.filter(record => record.evidenceStatus === "eligible").length;
  const issueCounts = Object.freeze({
    duplicates: issues.filter(issue => issue.issueType === "duplicate").length,
    rejected: issues.filter(issue => issue.issueType === "rejected").length,
    invalid: issues.filter(issue => issue.issueType === "invalid").length,
  });

  return Object.freeze({
    cleanedRecords: Object.freeze(cleanedRecords),
    issues: Object.freeze(issues),
    summary: Object.freeze({
      recordsRead: records.length,
      normalized: cleanedRecords.length,
      uniqueTransactionIds: cleanedRecords.length,
      duplicateTransactionIds: issueCounts.duplicates,
      eligible,
      rejected: issueCounts.rejected,
      skipped: issueCounts.invalid,
      issueCounts,
    }),
  });
}
