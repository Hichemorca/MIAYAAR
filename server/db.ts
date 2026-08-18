import { and, desc, eq, gte, max } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertMethodologyVersion,
  InsertUser,
  marketTransactions,
  methodologyVersions,
  users,
  valuationAuditEvents,
  valuationRequests,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getMethodologyVersion(version: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(methodologyVersions).where(eq(methodologyVersions.version, version)).limit(1);
  return result[0];
}

export async function upsertMethodologyVersion(record: InsertMethodologyVersion): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Methodology storage is unavailable.");
  await db.insert(methodologyVersions).values(record).onDuplicateKeyUpdate({
    set: {
      checksum: record.checksum,
      configuration: record.configuration,
      changeSummary: record.changeSummary,
      status: record.status,
      approvedBy: record.approvedBy,
      approvedAt: record.approvedAt,
    },
  });
}

export async function createValuationRequest(record: typeof valuationRequests.$inferInsert): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Valuation request storage is unavailable.");
  await db.insert(valuationRequests).values(record);
}

export async function updateValuationRequestStatus(
  id: string,
  status: "completed" | "partial" | "rejected" | "failed"
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Valuation request storage is unavailable.");
  await db.update(valuationRequests).set({ status, completedAt: new Date() }).where(eq(valuationRequests.id, id));
}

export async function appendValuationAuditEvent(record: typeof valuationAuditEvents.$inferInsert): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Valuation audit storage is unavailable.");
  await db.insert(valuationAuditEvents).values(record);
}

export async function getLatestEligibleEvidenceDate(): Promise<Date | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Market evidence storage is unavailable.");
  const result = await db
    .select({ latest: max(marketTransactions.transactionDate) })
    .from(marketTransactions)
    .where(eq(marketTransactions.evidenceStatus, "eligible"));
  const latest = result[0]?.latest;
  return latest ? new Date(latest) : undefined;
}

export async function listEligibleComparableTransactions(input: {
  district: string;
  propertyType: typeof marketTransactions.$inferSelect["propertyType"];
  from: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Market evidence storage is unavailable.");
  return db
    .select()
    .from(marketTransactions)
    .where(and(
      eq(marketTransactions.evidenceStatus, "eligible"),
      eq(marketTransactions.district, input.district),
      eq(marketTransactions.propertyType, input.propertyType),
      gte(marketTransactions.transactionDate, input.from),
    ))
    .orderBy(desc(marketTransactions.transactionDate));
}
