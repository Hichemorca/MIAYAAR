import { randomUUID } from "node:crypto";
import type { PropertySubmission } from "@shared/valuation/contracts";
import { appendValuationAuditEvent, createValuationRequest, updateValuationRequestStatus } from "../../db";
import { findComparableEvidence } from "../../valuation/comparable-search";
import { resolveProductionMethodology } from "../../valuation/methodology-registry";
import { assessConfidence } from "../confidence/confidence";
import { assembleReport, type ValuationReport } from "../reporting/valuation-report";
import { ValuationEngine } from "../../../engines/valuation/valuation.engine";
import { resolveValuationConfiguration } from "../../../engines/valuation/methodology-v1_2";
import { toCanonicalMarketSnapshot, toCanonicalProperty, toCanonicalValuationData } from "./core-valuation-adapter";

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

  const property = toCanonicalProperty(input.property, requestId);
  const engineConfiguration = resolveValuationConfiguration(property);
  if (!engineConfiguration) {
    const warning = `No certified valuation: ${property.classification.type} has no formally approved methodology configuration.`;
    await audit(requestId, "valuation", "rejected", { reason: "unsupported_property_type", propertyType: property.classification.type });
    await updateValuationRequestStatus(requestId, "rejected");
    return { requestId, report: assembleReport({ status: "rejected", configuration, property: input.property, evidence, warnings: [warning] }) };
  }
  const market = toCanonicalMarketSnapshot(property, evidence.comparables);
  const data = toCanonicalValuationData(input.property, evidence.comparables, {
    vacancyRate: configuration.assumptions.vacancyRate,
    operatingExpenseRate: configuration.assumptions.operatingExpenseRate,
    residentialCapRate: configuration.assumptions.residentialCapRate,
    commercialCapRate: configuration.assumptions.commercialCapRate,
  });
  const engineResult = await new ValuationEngine().execute({ property, market, data, config: engineConfiguration, requestId });
  await audit(requestId, "rules", "configured", { methodology: configuration.version, propertyType: property.classification.type, adjustments: engineConfiguration.adjustments });
  await audit(requestId, "valuation", engineResult.data.available ? "completed" : "rejected", engineResult.data.available
    ? { baselineValue: engineResult.data.valuation.result.value.amount, activeApproaches: engineResult.data.valuation.result.approachResults.map(item => item.approach) }
    : { reasonCode: engineResult.data.reasonCode, reason: engineResult.data.reason });
  if (!engineResult.data.available) {
    const warnings = [...engineResult.warnings.map(item => item.message), ...engineResult.errors.map(item => item.message), engineResult.data.reason];
    await updateValuationRequestStatus(requestId, "rejected");
    return { requestId, report: assembleReport({ status: "rejected", configuration, property: input.property, evidence, warnings }) };
  }
  const valuation = engineResult.data.valuation;
  const confidence = valuation.result.lowerBound && valuation.result.upperBound
    ? assessConfidence({ lowerValue: valuation.result.lowerBound.amount, baselineValue: valuation.result.value.amount, upperValue: valuation.result.upperBound.amount, comparables: evidence.comparables })
    : undefined;
  if (confidence) await audit(requestId, "confidence", "assessed", confidence);
  const warnings = [...engineResult.warnings.map(item => item.message), ...engineResult.errors.map(item => item.message)];
  const status = engineResult.status === "partial" ? "partial" : "completed";
  const report = assembleReport({ status, configuration, property: input.property, evidence, valuation, confidence, warnings });
  await audit(requestId, "reporting", "assembled", { status, warningCount: report.warnings.length });
  await updateValuationRequestStatus(requestId, status);
  return { requestId, report };
}
