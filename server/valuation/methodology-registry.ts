import { createHash } from "node:crypto";
import { getMethodologyVersion, upsertMethodologyVersion } from "../db";
import { frozenMethodologyV11, validateFrozenMethodology } from "../../engines/valuation/methodology-v1_1";

const FROZEN_CHANGE_SUMMARY = "Initial frozen production configuration for MIAYAAR-METH-001 v1.1.";

function checksum(configuration: typeof frozenMethodologyV11): string {
  return createHash("sha256").update(JSON.stringify(configuration)).digest("hex");
}

/**
 * Ensures that the immutable v1.1 configuration is persisted before a
 * valuation can run. A mismatched stored checksum is a governance failure,
 * not a value-engine fallback condition.
 */
export async function resolveProductionMethodology(): Promise<typeof frozenMethodologyV11> {
  const errors = validateFrozenMethodology();
  if (errors.length) throw new Error(`Frozen methodology is invalid: ${errors.join("; ")}`);

  const expectedChecksum = checksum(frozenMethodologyV11);
  const stored = await getMethodologyVersion(frozenMethodologyV11.version);
  if (!stored) {
    await upsertMethodologyVersion({
      version: frozenMethodologyV11.version,
      status: "production",
      documentId: frozenMethodologyV11.documentId,
      checksum: expectedChecksum,
      configuration: frozenMethodologyV11,
      changeSummary: FROZEN_CHANGE_SUMMARY,
      approvedBy: "system:methodology-registry",
      approvedAt: new Date(),
    });
    return frozenMethodologyV11;
  }
  if (stored.checksum !== expectedChecksum) {
    throw new Error(`Stored methodology checksum for v${frozenMethodologyV11.version} does not match the frozen release.`);
  }
  return frozenMethodologyV11;
}

export const frozenMethodologyChecksum = checksum(frozenMethodologyV11);
