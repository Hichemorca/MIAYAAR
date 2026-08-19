import { and, desc, eq, gte, max, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import {
  InsertMethodologyVersion,
  InsertUser,
  marketTransactions,
  methodologyVersions,
  users,
  valuationAuditEvents,
  valuationRateLimitWindows,
  valuationRequests,
} from "../drizzle/schema";
import { ENV } from './_core/env';

function createDatabase(databaseUrl: string) {
  const isSupabaseDatabase = /(?:^|[./])supabase\.(?:co|com)(?::|[/]|$)/i.test(databaseUrl);
  const pool = new Pool({
    connectionString: databaseUrl,
    max: 20,
    idleTimeoutMillis: 60_000,
    // Direct Supabase hosts use `*.supabase.co`; Transaction Pooler hosts use
    // `*.pooler.supabase.com`. Both require TLS from a Netlify function.
    ssl: isSupabaseDatabase ? { rejectUnauthorized: false } : undefined,
  });
  return { pool, db: drizzle({ client: pool }) };
}

let _db: ReturnType<typeof createDatabase>["db"] | null = null;
let _pool: ReturnType<typeof createDatabase>["pool"] | null = null;
let lastRateLimitPruneAt = 0;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const connection = createDatabase(process.env.DATABASE_URL);
      _pool = connection.pool;
      _db = connection.db;
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

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
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
  await db.insert(methodologyVersions).values(record).onConflictDoUpdate({
    target: methodologyVersions.version,
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

/**
 * Atomically increments a rate-limit window shared by all server instances.
 * The caller supplies an HMAC key, never a raw client IP address.
 */
export async function consumeValuationRateLimitWindow(input: {
  key: string;
  windowStart: Date;
  expiresAt: Date;
}): Promise<number | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const now = Date.now();
    if (now - lastRateLimitPruneAt > 5 * 60_000) {
      lastRateLimitPruneAt = now;
      await db.execute(sql`
        DELETE FROM "valuationRateLimitWindows"
        WHERE id IN (
          SELECT id
          FROM "valuationRateLimitWindows"
          WHERE "expiresAt" < ${new Date(now - 60 * 60_000)}
          ORDER BY "expiresAt"
          LIMIT 1000
        )
      `);
    }

    const incrementResult = await db.execute(sql`
      INSERT INTO "valuationRateLimitWindows" (id, "windowStart", "requestCount", "expiresAt", "updatedAt")
      VALUES (${input.key}, ${input.windowStart}, 1, ${input.expiresAt}, NOW())
      ON CONFLICT (id) DO UPDATE SET
        "requestCount" = CASE
          WHEN "valuationRateLimitWindows"."windowStart" = EXCLUDED."windowStart"
            THEN "valuationRateLimitWindows"."requestCount" + 1
          ELSE 1
        END,
        "windowStart" = EXCLUDED."windowStart",
        "expiresAt" = EXCLUDED."expiresAt",
        "updatedAt" = NOW()
      RETURNING "requestCount"
    `);
    const record = incrementResult.rows[0] as { requestCount?: number } | undefined;
    return record?.requestCount;
  } catch (error) {
    console.error("[Rate limit] Failed to consume shared window:", error);
    return undefined;
  }
}
