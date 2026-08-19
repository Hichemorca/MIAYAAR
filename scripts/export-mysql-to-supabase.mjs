import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

const sourceUrl = process.env.SOURCE_DATABASE_URL;
const outputDir = process.env.MIGRATION_OUTPUT_DIR;
const projectId = process.env.SUPABASE_PROJECT_ID;
const batchSize = Number.parseInt(process.env.MIGRATION_BATCH_SIZE ?? "1000", 10);

if (!sourceUrl || !outputDir || !projectId || !Number.isInteger(batchSize) || batchSize < 1) {
  throw new Error("SOURCE_DATABASE_URL, MIGRATION_OUTPUT_DIR, SUPABASE_PROJECT_ID, and a positive MIGRATION_BATCH_SIZE are required.");
}

const tablePlans = [
  { table: "users", columns: ["id", "openId", "name", "email", "loginMethod", "role", "createdAt", "updatedAt", "lastSignedIn"], conflict: "id" },
  { table: "methodologyVersions", columns: ["id", "version", "status", "documentId", "checksum", "configuration", "changeSummary", "approvedBy", "approvedAt", "createdAt"], conflict: "id", json: ["configuration"] },
  { table: "valuationRequests", columns: ["id", "userId", "methodologyVersion", "propertyInput", "status", "createdAt", "completedAt"], conflict: "id", json: ["propertyInput"] },
  { table: "valuationAuditEvents", columns: ["id", "valuationRequestId", "stage", "eventType", "payload", "createdAt"], conflict: "id", json: ["payload"] },
  { table: "marketTransactions", columns: ["id", "sourceTransactionId", "source", "sourceChecksum", "transactionDate", "district", "propertyType", "rawType", "rawSubType", "areaSqm", "salePriceAed", "pricePerSqm", "evidenceStatus", "rejectionReason", "ingestedAt"], conflict: "id" },
  { table: "dldImportRuns", columns: ["id", "sourceLabel", "sourceChecksum", "recordsRead", "normalizedRecords", "uniqueTransactionIds", "duplicateTransactionIds", "eligibleRecords", "rejectedRecords", "skippedRecords", "status", "startedAt", "completedAt"], conflict: "id" },
  { table: "dldImportIssues", columns: ["id", "importRunId", "recordIndex", "issueType", "reason", "sourceTransactionId", "recordFingerprint", "createdAt"], conflict: "id" },
  { table: "valuationRateLimitWindows", columns: ["id", "windowStart", "requestCount", "expiresAt", "updatedAt"], conflict: "id" },
];

const quoted = value => `"${value.replaceAll('"', '""')}"`;
const mysqlQuoted = value => `\`${value.replaceAll("`", "``")}\``;
const sqlString = value => `'${value.replaceAll("'", "''")}'`;
const isTimestampColumn = column => /(?:At|Date)$/.test(column);

function timestampLiteral(value) {
  if (value instanceof Date) return sqlString(value.toISOString());
  const source = String(value).trim();
  if (!source) return "NULL";
  const iso = source.includes("T") ? source : `${source.replace(" ", "T")}Z`;
  return sqlString(iso);
}

function literal(value, column, jsonColumns) {
  if (value === null || value === undefined) return "NULL";
  if (jsonColumns?.includes(column)) {
    const normalized = typeof value === "string" ? JSON.stringify(JSON.parse(value)) : JSON.stringify(value);
    return `${sqlString(normalized)}::jsonb`;
  }
  if (isTimestampColumn(column)) return timestampLiteral(value);
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error(`Non-finite numeric value in ${column}`);
    return String(value);
  }
  if (typeof value === "bigint") return value.toString();
  return sqlString(String(value));
}

function batchSql(plan, rows) {
  const columns = plan.columns.map(quoted).join(", ");
  const values = rows
    .map(row => `(${plan.columns.map(column => literal(row[column], column, plan.json)).join(", ")})`)
    .join(",\n");
  return `INSERT INTO ${quoted(plan.table)} (${columns}) VALUES\n${values}\nON CONFLICT (${quoted(plan.conflict)}) DO NOTHING;`;
}

await fs.rm(outputDir, { recursive: true, force: true });
await fs.mkdir(outputDir, { recursive: true });
const connection = await mysql.createConnection({ uri: sourceUrl, dateStrings: true });
const manifest = { source: "MIAYAAR MySQL", projectId, batchSize, tables: [], files: [] };
let fileNumber = 0;

try {
  for (const plan of tablePlans) {
    const [[countRow]] = await connection.query(`SELECT COUNT(*) AS total FROM ${mysqlQuoted(plan.table)}`);
    const total = Number(countRow.total);
    const tableManifest = { table: plan.table, total, batches: 0 };
    for (let offset = 0; offset < total; offset += batchSize) {
      const [rows] = await connection.query(`SELECT ${plan.columns.map(mysqlQuoted).join(", ")} FROM ${mysqlQuoted(plan.table)} ORDER BY ${mysqlQuoted(plan.conflict)} LIMIT ? OFFSET ?`, [batchSize, offset]);
      const query = batchSql(plan, rows);
      const filename = `${String(fileNumber).padStart(4, "0")}-${plan.table}-${String(Math.floor(offset / batchSize) + 1).padStart(3, "0")}.json`;
      await fs.writeFile(path.join(outputDir, filename), JSON.stringify({ project_id: projectId, query }, null, 2));
      manifest.files.push({ filename, table: plan.table, rows: rows.length });
      tableManifest.batches += 1;
      fileNumber += 1;
    }
    manifest.tables.push(tableManifest);
  }
} finally {
  await connection.end();
}

await fs.writeFile(path.join(outputDir, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log(JSON.stringify(manifest));
