import { createHash, randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import mysql from "mysql2/promise";
import { cleanDldRecords } from "./lib/dld-evidence-cleaning.mjs";

const inputPath = process.env.DLD_SOURCE_PATH ?? "/home/ubuntu/webdev-static-assets/miayaar-dld-comparables.json";
const issueBatchSize = 250;

function chunksOf(items, size) {
  const chunks = [];
  for (let offset = 0; offset < items.length; offset += size) chunks.push(items.slice(offset, offset + size));
  return chunks;
}

const dataset = JSON.parse(await readFile(inputPath, "utf8"));
const checksum = createHash("sha256").update(JSON.stringify(dataset.records)).digest("hex");
const cleaned = cleanDldRecords(dataset.records);
const summary = {
  source: dataset.source ?? "DLD",
  checksum,
  ...cleaned.summary,
};

if (process.env.VERIFY_ONLY === "1") {
  console.log(JSON.stringify(summary, null, 2));
  process.exit(0);
}

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required for import mode.");
const connection = await mysql.createConnection(process.env.DATABASE_URL);
const runId = `dld_${randomUUID()}`;

try {
  await connection.query(
    `INSERT INTO dldImportRuns
      (id, sourceLabel, sourceChecksum, recordsRead, normalizedRecords, uniqueTransactionIds, duplicateTransactionIds, eligibleRecords, rejectedRecords, skippedRecords, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'running')`,
    [runId, summary.source, checksum, summary.recordsRead, summary.normalized, summary.uniqueTransactionIds, summary.duplicateTransactionIds, summary.eligible, summary.rejected, summary.skipped]
  );

  await connection.beginTransaction();
  const columns = [
    "sourceTransactionId", "source", "sourceChecksum", "transactionDate", "district", "propertyType", "rawType", "rawSubType",
    "areaSqm", "salePriceAed", "pricePerSqm", "evidenceStatus", "rejectionReason",
  ];
  for (const chunk of chunksOf(cleaned.cleanedRecords, issueBatchSize)) {
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

  for (const chunk of chunksOf(cleaned.issues, issueBatchSize)) {
    const values = chunk.map(issue => [
      runId, issue.recordIndex, issue.issueType, issue.reason, issue.sourceTransactionId, issue.recordFingerprint,
    ]);
    await connection.query(
      "INSERT INTO dldImportIssues (importRunId, recordIndex, issueType, reason, sourceTransactionId, recordFingerprint) VALUES ?",
      [values]
    );
  }

  await connection.query(
    "UPDATE dldImportRuns SET status = 'completed', completedAt = NOW() WHERE id = ?",
    [runId]
  );
  await connection.commit();
  console.log(JSON.stringify({ ...summary, runId, importStatus: "completed" }, null, 2));
} catch (error) {
  await connection.rollback();
  await connection.query("UPDATE dldImportRuns SET status = 'failed', completedAt = NOW() WHERE id = ?", [runId]);
  throw error;
} finally {
  await connection.end();
}
