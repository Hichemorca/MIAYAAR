import React from "react";
import type { ValuationReport } from "../../../server/engines/reporting/valuation-report";
import type { PropertySubmission } from "@shared/valuation/contracts";
import {
  allValuationMethods,
  findServerApproachResult,
  getMethodNotApplicableExplanation,
  getPresentationReportStatus,
  getServerApproachLabel,
  propertyTypeChoices,
  serverApproachLabels,
} from "@/pages/home-form-config";
import "./methodology-explanation-panel.css";

type MethodologyExplanationPanelProps = {
  propertyType: PropertySubmission["propertyType"];
  report: ValuationReport;
};

type MethodPresentationState = "used" | "available" | "not-applicable";

function getServerReason(
  report: ValuationReport,
  method: keyof typeof serverApproachLabels
): string | undefined {
  const keySpecificWarning = report.warnings.find(warning =>
    warning.includes(`${method} is unavailable because`)
  );

  return keySpecificWarning;
}

function formatAED(value: number): string {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
  }).format(value);
}

function stateCopy(
  state: MethodPresentationState,
  serverReason?: string
): { label: string; description: string } {
  if (state === "used") {
    return {
      label: "Used in this valuation",
      description: "The server returned an approach result for this method.",
    };
  }

  if (state === "not-applicable") {
    return {
      label: "Not applicable",
      description:
        "This method is outside the governed applicability policy for the selected property type.",
    };
  }

  return {
    label: "Applicable · no result returned",
    description:
      serverReason ?? "No method-specific reason was returned by the server.",
  };
}

/**
 * Presentation-only explanation of the governed methods. It does not choose a
 * method, calculate a value, or translate an absent server outcome into a new
 * reason.
 */
export default function MethodologyExplanationPanel({
  propertyType,
  report,
}: MethodologyExplanationPanelProps) {
  const approachResults = report.valuation?.result.approachResults ?? [];
  const propertyTypeLabel = propertyTypeChoices.find(
    choice => choice.value === propertyType
  )?.label;
  const reportStatus = getPresentationReportStatus(report.status);

  return (
    <section
      className="mi-methodology-explanation"
      aria-labelledby="methodology-explanation-heading"
    >
      <div className="section-lead">
        <span>02</span>
        <div>
          <h3 id="methodology-explanation-heading">Methodology explanation</h3>
          <p>
            Used methods and outcomes come from the returned server report.
            Applicability follows the governed method policy.
          </p>
        </div>
      </div>

      <div
        className={`methodology-outcome methodology-outcome--${reportStatus.tone}`}
      >
        <span>Valuation outcome</span>
        <b>{reportStatus.label}</b>
        <p>{reportStatus.description}</p>
      </div>

      <div className="methodology-explanation-grid">
        {allValuationMethods.map(method => {
          const result = findServerApproachResult(approachResults, method);
          const notApplicableExplanation = getMethodNotApplicableExplanation(
            propertyType,
            method
          );
          const state: MethodPresentationState = notApplicableExplanation
            ? "not-applicable"
            : result
              ? "used"
              : "available";
          const serverReason =
            state === "available" ? getServerReason(report, method) : undefined;
          const copy = stateCopy(state, serverReason);

          return (
            <article
              className={`methodology-method methodology-method--${state}`}
              data-method={method}
              data-state={state}
              key={method}
            >
              <div className="methodology-method-heading">
                <span>{copy.label}</span>
                <b>{getServerApproachLabel(method)}</b>
              </div>

              {state === "used" && result ? (
                <p className="methodology-method-value">
                  Server result:{" "}
                  <strong>{formatAED(result.value.amount)}</strong>
                </p>
              ) : null}

              <p className="methodology-method-reason">
                {state === "not-applicable" && propertyTypeLabel
                  ? notApplicableExplanation
                  : copy.description}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
