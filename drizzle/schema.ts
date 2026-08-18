import { double, index, int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Immutable methodology releases. The running valuation must reference an
 * approved release so every decision can be reproduced later.
 */
export const methodologyVersions = mysqlTable("methodologyVersions", {
  id: int("id").autoincrement().primaryKey(),
  version: varchar("version", { length: 32 }).notNull().unique(),
  status: mysqlEnum("status", ["draft", "testing", "review", "approved", "production"])
    .notNull()
    .default("draft"),
  documentId: varchar("documentId", { length: 64 }).notNull(),
  checksum: varchar("checksum", { length: 128 }).notNull(),
  configuration: json("configuration").notNull(),
  changeSummary: text("changeSummary").notNull(),
  approvedBy: varchar("approvedBy", { length: 64 }),
  approvedAt: timestamp("approvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/** A valuation request persists its exact input and chosen methodology version. */
export const valuationRequests = mysqlTable("valuationRequests", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId"),
  methodologyVersion: varchar("methodologyVersion", { length: 32 }).notNull(),
  propertyInput: json("propertyInput").notNull(),
  status: mysqlEnum("status", ["received", "completed", "partial", "rejected", "failed"])
    .notNull()
    .default("received"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

/** Append-only evidence of each canonical orchestration stage. */
export const valuationAuditEvents = mysqlTable("valuationAuditEvents", {
  id: int("id").autoincrement().primaryKey(),
  valuationRequestId: varchar("valuationRequestId", { length: 64 }).notNull(),
  stage: mysqlEnum("stage", ["validation", "data", "gis", "rules", "valuation", "confidence", "reporting"])
    .notNull(),
  eventType: varchar("eventType", { length: 64 }).notNull(),
  payload: json("payload").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Validated market evidence only. Raw supplier files stay outside the runtime
 * database; this table stores the normalized, eligible DLD transactions used
 * by comparable search and keeps the source fingerprint for reproducibility.
 */
export const marketTransactions = mysqlTable(
  "marketTransactions",
  {
    id: int("id").autoincrement().primaryKey(),
    sourceTransactionId: varchar("sourceTransactionId", { length: 128 }).notNull().unique(),
    source: varchar("source", { length: 64 }).notNull().default("DLD"),
    sourceChecksum: varchar("sourceChecksum", { length: 128 }).notNull(),
    transactionDate: timestamp("transactionDate").notNull(),
    district: varchar("district", { length: 160 }).notNull(),
    propertyType: mysqlEnum("propertyType", ["apartment", "villa", "townhouse", "office", "retail", "land", "warehouse"])
      .notNull(),
    rawType: varchar("rawType", { length: 160 }).notNull(),
    rawSubType: varchar("rawSubType", { length: 160 }),
    areaSqm: double("areaSqm").notNull(),
    salePriceAed: double("salePriceAed").notNull(),
    pricePerSqm: double("pricePerSqm").notNull(),
    evidenceStatus: mysqlEnum("evidenceStatus", ["eligible", "rejected"]).notNull().default("eligible"),
    rejectionReason: varchar("rejectionReason", { length: 255 }),
    ingestedAt: timestamp("ingestedAt").defaultNow().notNull(),
  },
  table => [
    index("marketTransactions_district_type_date_idx").on(table.district, table.propertyType, table.transactionDate),
    index("marketTransactions_type_date_idx").on(table.propertyType, table.transactionDate),
  ]
);

/** Immutable run-level provenance for each DLD import. Raw supplier data remains outside the runtime database. */
export const dldImportRuns = mysqlTable(
  "dldImportRuns",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    sourceLabel: varchar("sourceLabel", { length: 255 }).notNull(),
    sourceChecksum: varchar("sourceChecksum", { length: 128 }).notNull(),
    recordsRead: int("recordsRead").notNull(),
    normalizedRecords: int("normalizedRecords").notNull(),
    uniqueTransactionIds: int("uniqueTransactionIds").notNull(),
    duplicateTransactionIds: int("duplicateTransactionIds").notNull(),
    eligibleRecords: int("eligibleRecords").notNull(),
    rejectedRecords: int("rejectedRecords").notNull(),
    skippedRecords: int("skippedRecords").notNull(),
    status: mysqlEnum("status", ["running", "completed", "failed"]).notNull(),
    startedAt: timestamp("startedAt").defaultNow().notNull(),
    completedAt: timestamp("completedAt"),
  },
  table => [index("dldImportRuns_source_checksum_idx").on(table.sourceChecksum)]
);

/** Append-only duplicate, invalid, and policy-rejected source-record observations for a DLD import run. */
export const dldImportIssues = mysqlTable(
  "dldImportIssues",
  {
    id: int("id").autoincrement().primaryKey(),
    importRunId: varchar("importRunId", { length: 64 }).notNull(),
    recordIndex: int("recordIndex").notNull(),
    issueType: mysqlEnum("issueType", ["duplicate", "rejected", "invalid"]).notNull(),
    reason: varchar("reason", { length: 255 }).notNull(),
    sourceTransactionId: varchar("sourceTransactionId", { length: 128 }),
    recordFingerprint: varchar("recordFingerprint", { length: 128 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("dldImportIssues_run_type_idx").on(table.importRunId, table.issueType)]
);

/**
 * Short-lived, HMAC-keyed public valuation rate-limit windows. The raw client
 * address is never persisted; the same table is shared by all app instances.
 */
export const valuationRateLimitWindows = mysqlTable(
  "valuationRateLimitWindows",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    windowStart: timestamp("windowStart").notNull(),
    requestCount: int("requestCount").notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("valuationRateLimitWindows_expires_idx").on(table.expiresAt)]
);

export type MethodologyVersion = typeof methodologyVersions.$inferSelect;
export type InsertMethodologyVersion = typeof methodologyVersions.$inferInsert;
export type ValuationRequestRecord = typeof valuationRequests.$inferSelect;
export type ValuationAuditEvent = typeof valuationAuditEvents.$inferSelect;
export type MarketTransaction = typeof marketTransactions.$inferSelect;
export type DldImportRun = typeof dldImportRuns.$inferSelect;
export type DldImportIssue = typeof dldImportIssues.$inferSelect;
export type ValuationRateLimitWindow = typeof valuationRateLimitWindows.$inferSelect;
