import { doublePrecision, index, integer, jsonb, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

/**
 * PostgreSQL/Supabase persistence schema for MIAYAAR. Table and column names
 * intentionally retain the existing quoted camelCase identifiers so imported
 * evidence and the application layer remain auditable without renaming.
 */
export const userRole = pgEnum("user_role", ["user", "admin"]);
export const methodologyStatus = pgEnum("methodology_status", ["draft", "testing", "review", "approved", "production"]);
export const valuationRequestStatus = pgEnum("valuation_request_status", ["received", "completed", "partial", "rejected", "failed"]);
export const valuationAuditStage = pgEnum("valuation_audit_stage", ["validation", "data", "gis", "rules", "valuation", "confidence", "reporting"]);
export const propertyType = pgEnum("property_type", ["apartment", "villa", "townhouse", "office", "retail", "land", "warehouse"]);
export const evidenceStatus = pgEnum("evidence_status", ["eligible", "rejected"]);
export const dldImportStatus = pgEnum("dld_import_status", ["running", "completed", "failed"]);
export const dldImportIssueType = pgEnum("dld_import_issue_type", ["duplicate", "rejected", "invalid"]);

/** Core user table backing the optional OAuth flow. */
export const users = pgTable("users", {
  id: integer("id").generatedByDefaultAsIdentity().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: userRole("role").default("user").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn", { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/** Immutable methodology releases referenced by reproducible valuation decisions. */
export const methodologyVersions = pgTable("methodologyVersions", {
  id: integer("id").generatedByDefaultAsIdentity().primaryKey(),
  version: varchar("version", { length: 32 }).notNull().unique(),
  status: methodologyStatus("status").notNull().default("draft"),
  documentId: varchar("documentId", { length: 64 }).notNull(),
  checksum: varchar("checksum", { length: 128 }).notNull(),
  configuration: jsonb("configuration").notNull(),
  changeSummary: text("changeSummary").notNull(),
  approvedBy: varchar("approvedBy", { length: 64 }),
  approvedAt: timestamp("approvedAt", { withTimezone: true }),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

/** A valuation request persists its exact input and chosen methodology version. */
export const valuationRequests = pgTable("valuationRequests", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: integer("userId"),
  methodologyVersion: varchar("methodologyVersion", { length: 32 }).notNull(),
  propertyInput: jsonb("propertyInput").notNull(),
  status: valuationRequestStatus("status").notNull().default("received"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp("completedAt", { withTimezone: true }),
});

/** Append-only evidence of each canonical orchestration stage. */
export const valuationAuditEvents = pgTable("valuationAuditEvents", {
  id: integer("id").generatedByDefaultAsIdentity().primaryKey(),
  valuationRequestId: varchar("valuationRequestId", { length: 64 }).notNull(),
  stage: valuationAuditStage("stage").notNull(),
  eventType: varchar("eventType", { length: 64 }).notNull(),
  payload: jsonb("payload").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

/** Validated DLD market evidence used by comparable search. */
export const marketTransactions = pgTable(
  "marketTransactions",
  {
    id: integer("id").generatedByDefaultAsIdentity().primaryKey(),
    sourceTransactionId: varchar("sourceTransactionId", { length: 128 }).notNull().unique(),
    source: varchar("source", { length: 64 }).notNull().default("DLD"),
    sourceChecksum: varchar("sourceChecksum", { length: 128 }).notNull(),
    transactionDate: timestamp("transactionDate", { withTimezone: true }).notNull(),
    district: varchar("district", { length: 160 }).notNull(),
    propertyType: propertyType("propertyType").notNull(),
    rawType: varchar("rawType", { length: 160 }).notNull(),
    rawSubType: varchar("rawSubType", { length: 160 }),
    areaSqm: doublePrecision("areaSqm").notNull(),
    salePriceAed: doublePrecision("salePriceAed").notNull(),
    pricePerSqm: doublePrecision("pricePerSqm").notNull(),
    evidenceStatus: evidenceStatus("evidenceStatus").notNull().default("eligible"),
    rejectionReason: varchar("rejectionReason", { length: 255 }),
    ingestedAt: timestamp("ingestedAt", { withTimezone: true }).defaultNow().notNull(),
  },
  table => [
    index("marketTransactions_district_type_date_idx").on(table.district, table.propertyType, table.transactionDate),
    index("marketTransactions_type_date_idx").on(table.propertyType, table.transactionDate),
  ]
);

/** Immutable run-level provenance for a DLD import. */
export const dldImportRuns = pgTable(
  "dldImportRuns",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    sourceLabel: varchar("sourceLabel", { length: 255 }).notNull(),
    sourceChecksum: varchar("sourceChecksum", { length: 128 }).notNull(),
    recordsRead: integer("recordsRead").notNull(),
    normalizedRecords: integer("normalizedRecords").notNull(),
    uniqueTransactionIds: integer("uniqueTransactionIds").notNull(),
    duplicateTransactionIds: integer("duplicateTransactionIds").notNull(),
    eligibleRecords: integer("eligibleRecords").notNull(),
    rejectedRecords: integer("rejectedRecords").notNull(),
    skippedRecords: integer("skippedRecords").notNull(),
    status: dldImportStatus("status").notNull(),
    startedAt: timestamp("startedAt", { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp("completedAt", { withTimezone: true }),
  },
  table => [index("dldImportRuns_source_checksum_idx").on(table.sourceChecksum)]
);

/** Append-only duplicate, invalid, and policy-rejected source observations. */
export const dldImportIssues = pgTable(
  "dldImportIssues",
  {
    id: integer("id").generatedByDefaultAsIdentity().primaryKey(),
    importRunId: varchar("importRunId", { length: 64 }).notNull(),
    recordIndex: integer("recordIndex").notNull(),
    issueType: dldImportIssueType("issueType").notNull(),
    reason: varchar("reason", { length: 255 }).notNull(),
    sourceTransactionId: varchar("sourceTransactionId", { length: 128 }),
    recordFingerprint: varchar("recordFingerprint", { length: 128 }).notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  },
  table => [index("dldImportIssues_run_type_idx").on(table.importRunId, table.issueType)]
);

/** HMAC-keyed, shared rate-limit windows; raw client IP addresses are never persisted. */
export const valuationRateLimitWindows = pgTable(
  "valuationRateLimitWindows",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    windowStart: timestamp("windowStart", { withTimezone: true }).notNull(),
    requestCount: integer("requestCount").notNull(),
    expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
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
