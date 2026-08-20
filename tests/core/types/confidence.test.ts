/**
 * Regression test for the canonical Confidence contract after IMP-001.
 * Technical audit time belongs exclusively to canonical Metadata; the
 * assessment's domain time remains an independent, explicit fact.
 */

import { test } from "vitest";
import assert from "node:assert/strict";
import { Confidence, ConfidenceLevel } from "../../../core/types";

test("the canonical Confidence contract keeps audit and assessment times separate", () => {
  const confidence: Confidence = {
    id: "confidence-001",
    valuationId: "valuation-001",
    assessment: {
      id: "assessment-001",
      valuationId: "valuation-001",
      factors: [],
      assessedAt: "2026-01-15T00:00:00.000Z",
      version: "1.0.0",
    },
    overall: {
      level: ConfidenceLevel.HIGH,
      score: 0.9,
      interpretation: "Evidence coverage is sufficient for this test fixture.",
    },
    metadata: {
      id: "confidence-meta-001",
      timestamps: {
        createdAt: "2026-01-16T00:00:00.000Z",
        updatedAt: "2026-01-16T00:00:00.000Z",
      },
      audit: { createdBy: "test", updatedBy: "test" },
      version: {
        version: "1.0.0",
        versionedAt: "2026-01-16T00:00:00.000Z",
        versionedBy: "test",
      },
      provenance: {
        source: { id: "src-001", name: "Test Source", type: "TEST" },
        acquiredAt: "2026-01-16T00:00:00.000Z",
        acquiredBy: "test",
      },
      status: {
        status: "ACTIVE",
        category: "TEST",
        statusChangedAt: "2026-01-16T00:00:00.000Z",
      },
    },
  };

  assert.equal("createdAt" in confidence, false);
  assert.equal(
    confidence.metadata.timestamps.createdAt,
    "2026-01-16T00:00:00.000Z"
  );
  assert.equal(confidence.assessment.assessedAt, "2026-01-15T00:00:00.000Z");
  assert.notEqual(
    confidence.metadata.timestamps.createdAt,
    confidence.assessment.assessedAt
  );
});
