import { randomUUID } from "node:crypto";
import type { PropertySubmission } from "@shared/valuation/contracts";
import { appendValuationAuditEvent, createValuationRequest, updateValuationRequestStatus } from "../../db";
import { findComparableEvidence } from "../../valuation/comparable-search";
import { resolveProductionMethodology } from "../../valuation/methodology-registry";
import { assessConfidence } from "../confidence/confidence";
import { assembleReport, type ValuationReport } from "../reporting/valuation-report";
import { evaluatePropertyRules } from "../rules/property-adjustments";
import { calculateDeterministicValuation } from "../valuation/deterministic";

function validationErrors(property: PropertySubmission): string[] {
  const errors: string[] = [];
  if (!property.district.trim()) errors.push("District is required.");
  if (!Number.isFinite(property.areaSqm) || property.areaSqm <= 0) errors.push("Area must be a positive number.");
  if (property.annualRentAed !== undefined && property.annualRentAed < 0) errors.push("Annual rent cannot be negative.");
  return errors;
}

async function audit(requestId: string, stage: "validation" | "data" | "gis" | "rules" | "valuation" | "confidence" | "reporting", eventType: string, payload: Record<string, unknown>) {
  await appendValuationAuditEvent({ valuationRequestId: requestId, stage, eventType, payload });
}

/** Coordinates engines in the mandated order; it contains no valuation calculations. */
export async function executeValuation(input: { property: PropertySubmission; userId?: number | null }): Promise<{ requestId: string; report: ValuationReport }> {
  const configuration = await resolveProductionMethodology();
  const requestId = `val_${randomUUID()}`;
  await createValuationRequest({ id: requestId, userId: input.userId ?? null, methodologyVersion: configuration.version, propertyInput: input.property, status: "received" });

  const errors = validationErrors(input.property);
  await audit(requestId, "validation", errors.length ? "rejected" : "accepted", { errors });
  if (errors.length) {
    await updateValuationRequestStatus(requestId, "rejected");
    return { requestId, report: assembleReport({ status: "rejected", configuration, property: input.property, evidence: { status: "unavailable", reason: "insufficient_local_comparables", availableCount: 0, requiredCount: 5, search: { district: input.property.district, propertyType: input.property.propertyType, windowDays: 0, asOf: new Date() } }, warnings: errors }) };
  }

  const evidence = await findComparableEvidence({ district: input.property.district, propertyType: input.property.propertyType }, configuration.assumptions);
  await audit(requestId, "data", evidence.status, evidence.status === "available" ? { count: evidence.comparables.length, search: evidence.search } : { availableCount: evidence.availableCount, search: evidence.search });
  await audit(requestId, "gis", "not_requested", { reason: "No validated GIS input was supplied; no location adjustment was fabricated." });
  if (evidence.status === "unavailable") {
    const warning = `No certified valuation: ${evidence.availableCount} eligible local comparables found; ${evidence.requiredCount} are required.`;
    await audit(requestId, "reporting", "rejected", { warning });
    await updateValuationRequestStatus(requestId, "rejected");
    return { requestId, report: assembleReport({ status: "rejected", configuration, property: input.property, evidence, warnings: [warning] }) };
  }

  const rules = evaluatePropertyRules(input.property, configuration);
  await audit(requestId, "rules", "evaluated", { multipliers: rules.multipliers });
  const valuation = calculateDeterministicValuation({ property: input.property, comparables: evidence.comparables, configuration, scenarioMultipliers: rules.multipliers });
  await audit(requestId, "valuation", "completed", { baselineValue: valuation.scenarios.baseline.value, activeApproaches: valuation.scenarios.baseline.approaches.map(item => item.key) });
  const confidence = assessConfidence({ lowerValue: valuation.scenarios.lower.value, baselineValue: valuation.scenarios.baseline.value, upperValue: valuation.scenarios.upper.value, comparables: evidence.comparables });
  await audit(requestId, "confidence", "assessed", confidence);
  const status = valuation.warnings.length ? "partial" : "completed";
  const report = assembleReport({ status, configuration, property: input.property, evidence, rules, valuation, confidence, warnings: valuation.warnings });
  await audit(requestId, "reporting", "assembled", { status, warningCount: report.warnings.length });
  await updateValuationRequestStatus(requestId, status);
  return { requestId, report };
}
