import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import mysql from "mysql2/promise";

const inputPath = "/home/ubuntu/webdev-static-assets/miayaar-dld-comparables.json";
const maxUnitPriceAed = 50_000;
const maxPriceAed = 50_000_000;
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

function normalize(record) {
  const propertyType = classify(record.t, record.s);
  const date = new Date(record.d);
  const areaSqm = Number(record.a);
  const salePriceAed = Number(record.p);
  if (!propertyType || Number.isNaN(date.getTime()) || !Number.isFinite(areaSqm) || areaSqm <= 10 || !Number.isFinite(salePriceAed) || salePriceAed <= 0) return undefined;

  const rawText = text(record.t, record.s);
  let rejectionReason = null;
  if (propertyType === "land" && /(COMMERCIAL|GENERAL USE)/.test(rawText)) rejectionReason = "commercial_land";
  if (salePriceAed > maxPriceAed || salePriceAed / areaSqm > maxUnitPriceAed) rejectionReason = "ultra_luxury";
  return {
    sourceTransactionId: `dld:${record.id}`,
    transactionDate: date,
    district: String(record.x || "").trim().replace(/\s+/g, " ").toUpperCase(),
    propertyType,
    rawType: String(record.t || "Unknown"),
    rawSubType: record.s ? String(record.s) : null,
    areaSqm,
    salePriceAed,
    pricePerSqm: salePriceAed / areaSqm,
    evidenceStatus: rejectionReason ? "rejected" : "eligible",
    rejectionReason,
  };
}

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");

const dataset = JSON.parse(await readFile(inputPath, "utf8"));
const checksum = createHash("sha256").update(JSON.stringify(dataset.records)).digest("hex");
const normalized = dataset.records.map(normalize).filter(Boolean);
const skippedCount = dataset.records.length - normalized.length;
const uniqueTransactionIds = new Set(normalized.map(record => record.sourceTransactionId));

if (process.env.VERIFY_ONLY === "1") {
  const eligibleCount = normalized.filter(item => item.evidenceStatus === "eligible").length;
  console.log(JSON.stringify({
    source: dataset.source,
    checksum,
    recordsRead: dataset.records.length,
    normalized: normalized.length,
    uniqueTransactionIds: uniqueTransactionIds.size,
    duplicateTransactionIds: normalized.length - uniqueTransactionIds.size,
    eligible: eligibleCount,
    rejected: normalized.length - eligibleCount,
    skipped: skippedCount,
  }, null, 2));
  process.exit(0);
}

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required for import mode.");
const connection = await mysql.createConnection(process.env.DATABASE_URL);

try {
  const columns = [
    "sourceTransactionId", "source", "sourceChecksum", "transactionDate", "district", "propertyType", "rawType", "rawSubType",
    "areaSqm", "salePriceAed", "pricePerSqm", "evidenceStatus", "rejectionReason",
  ];
  const chunks = [];
  for (let offset = 0; offset < normalized.length; offset += 250) chunks.push(normalized.slice(offset, offset + 250));
  for (const chunk of chunks) {
    const values = chunk.map(item => [
      item.sourceTransactionId, "DLD", checksum, item.transactionDate, item.district, item.propertyType, item.rawType, item.rawSubType,
      item.areaSqm, item.salePriceAed, item.pricePerSqm, item.evidenceStatus, item.rejectionReason,
    ]);
    await connection.query(
      `INSERT INTO marketTransactions (${columns.map(column => `\`${column}\``).join(", ")}) VALUES ?
       ON DUPLICATE KEY UPDATE
         sourceChecksum = VALUES(sourceChecksum), transactionDate = VALUES(transactionDate), district = VALUES(district),
         propertyType = VALUES(propertyType), rawType = VALUES(rawType), rawSubType = VALUES(rawSubType), areaSqm = VALUES(areaSqm),
         salePriceAed = VALUES(salePriceAed), pricePerSqm = VALUES(pricePerSqm), evidenceStatus = VALUES(evidenceStatus),
         rejectionReason = VALUES(rejectionReason)`,
      [values]
    );
  }
  const eligibleCount = normalized.filter(item => item.evidenceStatus === "eligible").length;
  console.log(JSON.stringify({ source: dataset.source, checksum, recordsRead: dataset.records.length, imported: normalized.length, eligible: eligibleCount, rejected: normalized.length - eligibleCount, skipped: skippedCount }, null, 2));
} finally {
  await connection.end();
  process.exit(0);
}
