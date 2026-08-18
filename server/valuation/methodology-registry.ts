import { createHash } from "node:crypto";
import { getMethodologyVersion, upsertMethodologyVersion } from "../db";
import { methodologyV11, validateMethodology } from "@shared/valuation/methodology-v1_1";
import type { MethodologyConfiguration } from "@shared/valuation/contracts";

const FROZEN_CHANGE_SUMMARY = "Initial frozen production configuration for MIAYAAR-METH-001 v1.1.";

function checksum(configuration: MethodologyConfiguration): string {
  return createHash("sha256").update(JSON.stringify(configuration)).digest("hex");
}

/**
 * Ensures that the immutable v1.1 configuration is persisted before a
 * valuation can run. A mismatched stored checksum is a governance failure,
 * not a value-engine fallback condition.
 */
export async function resolveProductionMethodology(): Promise<MethodologyConfiguration> {
  const errors = validateMethodology(methodologyV11);
  if (errors.length) throw new Error(`Frozen methodology is invalid: ${errors.join("; ")}`);

  const expectedChecksum = checksum(methodologyV11);
  const stored = await getMethodologyVersion(methodologyV11.version);
  if (!stored) {
    await upsertMethodologyVersion({
      version: methodologyV11.version,
      status: "production",
      documentId: methodologyV11.documentId,
      checksum: expectedChecksum,
      configuration: methodologyV11,
      changeSummary: FROZEN_CHANGE_SUMMARY,
      approvedBy: "system:methodology-registry",
      approvedAt: new Date(),
    });
    return methodologyV11;
  }
  if (stored.checksum !== expectedChecksum) {
    throw new Error(`Stored methodology checksum for v${methodologyV11.version} does not match the frozen release.`);
  }
  return methodologyV11;
}

export const frozenMethodologyChecksum = checksum(methodologyV11);
