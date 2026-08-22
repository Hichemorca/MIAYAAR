import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { executeValuation } from "./engines/orchestrator/valuation-orchestrator";
import { EvidenceIntegrityService } from "../engines/evidence-integrity/evidence-integrity.service";
import { DldEvidenceIntegrityProvider } from "./evidence-integrity/dld-evidence-integrity-provider";
import { MarketIntelligenceService } from "../engines/market-intelligence/market-intelligence.service";
import { DldMarketIntelligenceProvider } from "./market-intelligence/dld-market-intelligence-provider";
import { DldComparableSelectionPreviewService } from "./comparable-selection/dld-comparable-selection-preview";
import {
  getGovernanceStorageSnapshot,
  getServerConnectionRoleEvidence,
} from "./db";
import { frozenMethodologyV12 } from "../engines/valuation/methodology-v1_2";
import { frozenMethodologyChecksum } from "./valuation/methodology-registry";

const propertySubmission = z.object({
  propertyType: z.enum([
    "apartment",
    "villa",
    "townhouse",
    "office",
    "retail",
    "land",
    "warehouse",
  ]),
  district: z.string().min(1).max(160),
  areaSqm: z.number().positive(),
  bedrooms: z.number().int().min(0).max(20).optional(),
  yearBuilt: z.number().int().min(1800).max(2100).optional(),
  condition: z.enum(["excellent", "good", "fair", "needs_renovation"]),
  buildingCondition: z.enum([
    "excellent",
    "well_maintained",
    "fair",
    "old_needs_renovation",
  ]),
  views: z
    .array(
      z.enum([
        "sea",
        "partial_sea",
        "city",
        "garden",
        "park",
        "street",
        "internal",
        "unknown",
      ])
    )
    .max(5),
  finish: z.enum(["luxury", "good", "normal", "basic", "poor"]),
  furnished: z.enum(["furnished", "semi_furnished", "unfurnished"]).optional(),
  floor: z
    .enum(["penthouse", "very_high", "high", "mid", "low", "ground"])
    .optional(),
  streetPosition: z
    .enum(["main_street", "corner_plot", "secondary_street", "quiet_street"])
    .optional(),
  annualRentAed: z.number().nonnegative().optional(),
  replacementCostPerSqm: z.number().positive().optional(),
  landValueAed: z.number().nonnegative().optional(),
  depreciationFactor: z.number().min(0).lt(1).optional(),
});

/**
 * API input is intentionally limited to the Evidence Integrity v1.0 scope.
 * areaSqm is not accepted because the approved evidence contract has no
 * size dimension or size-based fallback rule.
 */
const evidenceIntegrityReportRequest = z
  .object({
    district: z.string().trim().min(1).max(160),
    propertyType: z.enum([
      "apartment",
      "villa",
      "townhouse",
      "office",
      "retail",
      "land",
      "warehouse",
    ]),
    asOf: z.coerce.date(),
  })
  .strict();

/**
 * Presentation input for the existing read-only MI v1.0 benchmark. The shape
 * intentionally mirrors the governed District + Property Type + asOf scope;
 * it does not accept a candidate price, property size, or valuation inputs.
 */
const marketIntelligenceBenchmarkRequest = z
  .object({
    district: z.string().trim().min(1).max(160),
    propertyType: z.enum([
      "apartment",
      "villa",
      "townhouse",
      "office",
      "retail",
      "land",
      "warehouse",
    ]),
    asOf: z.coerce.date(),
  })
  .strict();

/**
 * Read-only presentation input for the approved DLD candidate adapter. The
 * existing CS-v1.0 service alone determines selection and exclusion outcomes.
 */
const comparableSelectionPreviewRequest = z
  .object({
    district: z.string().trim().min(1).max(160),
    propertyType: z.enum([
      "apartment",
      "villa",
      "townhouse",
      "office",
      "retail",
      "land",
      "warehouse",
    ]),
    areaSqm: z.number().positive(),
    asOf: z.coerce.date(),
  })
  .strict();

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      if (!ctx.res) {
        return { success: true } as const;
      }
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  valuation: router({
    run: publicProcedure
      .input(propertySubmission)
      .mutation(({ input, ctx }) =>
        executeValuation({ property: input, userId: ctx.user?.id ?? null })
      ),
  }),
  evidenceIntegrity: router({
    report: publicProcedure
      .input(evidenceIntegrityReportRequest)
      .query(({ input }) =>
        new EvidenceIntegrityService(
          new DldEvidenceIntegrityProvider()
        ).inspect(input)
      ),
  }),
  marketIntelligence: router({
    /**
     * Read-only presentation access to the independent MI v1.0 service. This
     * procedure forwards the existing contract without invoking valuation,
     * confidence, comparable selection, diagnostics, or a fallback rule.
     */
    benchmark: publicProcedure
      .input(marketIntelligenceBenchmarkRequest)
      .query(({ input }) =>
        new MarketIntelligenceService(
          new DldMarketIntelligenceProvider()
        ).getBenchmark(input)
      ),
  }),
  comparableSelection: router({
    /**
     * Read-only presentation access to the DLD-backed candidate adapter.
     * It calls CS-v1.0 unchanged and neither influences valuation nor applies
     * an ungoverned candidate, ranking, or fallback rule.
     */
    preview: publicProcedure
      .input(comparableSelectionPreviewRequest)
      .query(({ input }) =>
        new DldComparableSelectionPreviewService().preview(input)
      ),
  }),
  governance: router({
    /**
     * Administrative visibility is intentionally constrained to immutable
     * methodology facts, persisted release history, DLD provenance, and the
     * actual property-submission shape. This router has no configuration
     * mutation because no replacement-release policy exists for v1.2.
     */
    overview: adminProcedure.query(async () => ({
      configuration: {
        frozenRelease: frozenMethodologyV12,
        checksum: frozenMethodologyChecksum,
        propertySubmissionFields: Object.keys(propertySubmission.shape),
        mutationStatus: "UNRESOLVED_POLICY" as const,
      },
      storage: await getGovernanceStorageSnapshot(),
    })),
    admin: router({
      /**
       * Runtime role evidence is intentionally read-only and admin-only. The
       * helper returns a constrained shape that excludes connection details,
       * credentials, application data, and query text.
       */
      connectionRole: adminProcedure.query(() =>
        getServerConnectionRoleEvidence()
      ),
    }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
