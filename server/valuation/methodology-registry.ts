import { createHash } from "node:crypto";
import { getMethodologyVersion, upsertMethodologyVersion } from "../db";
import { frozenMethodologyV12, validateFrozenMethodology } from "../../engines/valuation/methodology-v1_2";

const FROZEN_CHANGE_SUMMARY = "Canonical taxonomy and Warehouse-policy release for MIAYAAR-METH-001 v1.2; v1.1 remains immutable.";

function checksum(configuration: typeof frozenMethodologyV12): string {
  return createHash("sha256").update(JSON.stringify(configuration)).digest("hex");
}

/**
 * Ensures that the immutable active configuration is persisted before a
 * valuation can run. A mismatched stored checksum is a governance failure,
 * not a value-engine fallback condition.
 */
export async function resolveProductionMethodology(): Promise<typeof frozenMethodologyV12> {
  const errors = validateFrozenMethodology();
  if (errors.length) throw new Error(`Frozen methodology is invalid: ${errors.join("; ")}`);

  const expectedChecksum = checksum(frozenMethodologyV12);
  const stored = await getMethodologyVersion(frozenMethodologyV12.version);
  if (!stored) {
    await upsertMethodologyVersion({
      version: frozenMethodologyV12.version,
      status: "production",
      documentId: frozenMethodologyV12.documentId,
      checksum: expectedChecksum,
      configuration: frozenMethodologyV12,
      changeSummary: FROZEN_CHANGE_SUMMARY,
      approvedBy: "system:methodology-registry",
      approvedAt: new Date(),
    });
    return frozenMethodologyV12;
  }
  if (stored.checksum !== expectedChecksum) {
    throw new Error(`Stored methodology checksum for v${frozenMethodologyV12.version} does not match the frozen release.`);
  }
  return frozenMethodologyV12;
}

export const frozenMethodologyChecksum = checksum(frozenMethodologyV12);
