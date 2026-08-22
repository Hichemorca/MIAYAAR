import {
  AlertTriangle,
  BadgeCheck,
  CircleDashed,
  FileWarning,
} from "lucide-react";
import type { ValuationReport as ValuationReportData } from "../../../server/engines/reporting/valuation-report";
import type { PropertySubmission } from "@shared/valuation/contracts";
import {
  findServerApproachResult,
  getApplicableMethodPresentation,
  getServerApproachLabel,
  publicMethodFieldLabels,
} from "@/pages/home-form-config";
import "./method-applicability-panel.css";

type MethodApplicabilityPanelProps = {
  propertyType: PropertySubmission["propertyType"];
  report?: ValuationReportData;
};

const formatAED = (value: number) =>
  new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
  }).format(value);

/**
 * A policy and response presentation only. It neither selects approaches nor
 * creates missing results, evidence states, fields, or valuation values.
 */
export default function MethodApplicabilityPanel({
  propertyType,
  report,
}: MethodApplicabilityPanelProps) {
  const resultPropertyType = report?.property.propertyType ?? propertyType;
  const presentation = getApplicableMethodPresentation(resultPropertyType);
  const approachResults = report?.valuation?.result.approachResults ?? [];
  const evidenceAvailable = report?.evidence.status === "available";

  return (
    <section
      className="mi-method-panel"
      aria-labelledby="method-applicability-heading"
    >
      <div className="mi-method-panel-heading">
        <div>
          <p className="mi-eyebrow">Step 03 · Applicable approaches</p>
          <h2 id="method-applicability-heading">
            Method status, inputs, and returned values.
          </h2>
          <p>
            Only policy-applicable approaches appear. A result is shown only
            when the valuation response includes that approach.
          </p>
        </div>
        <span className="mi-method-panel-count">
          {presentation.length} of 4 applicable
        </span>
      </div>

      <div
        className="mi-method-panel-grid"
        role="list"
        aria-label="Applicable valuation approaches"
      >
        {presentation.map(({ method, fieldKeys }) => {
          const approachResult = findServerApproachResult(
            approachResults,
            method
          );

          return (
            <article className="mi-method-card" key={method} role="listitem">
              <div className="mi-method-card-topline">
                <span className="mi-method-applicable">
                  <BadgeCheck size={15} />
                  Applicable
                </span>
                {report && (
                  <span
                    className={
                      evidenceAvailable
                        ? "mi-method-evidence available"
                        : "mi-method-evidence insufficient"
                    }
                  >
                    {evidenceAvailable ? (
                      <BadgeCheck size={14} />
                    ) : (
                      <FileWarning size={14} />
                    )}
                    {evidenceAvailable
                      ? "Evidence available"
                      : "Insufficient evidence"}
                  </span>
                )}
              </div>
              <h3>{getServerApproachLabel(method)}</h3>
              <div className="mi-method-fields">
                <span>Required public fields</span>
                {fieldKeys.length > 0 ? (
                  <ul>
                    {fieldKeys.map(fieldKey => (
                      <li key={fieldKey}>
                        {publicMethodFieldLabels[fieldKey]}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No public submission fields</p>
                )}
              </div>
              {approachResult && (
                <div className="mi-method-returned-result">
                  <span>Server-returned result</span>
                  <strong>{formatAED(approachResult.value.amount)}</strong>
                  <small>
                    {Math.round(approachResult.weight * 100)}% applied weight
                  </small>
                </div>
              )}
              {!report && (
                <p className="mi-method-awaiting">
                  <CircleDashed size={15} />
                  Run valuation to obtain the server evidence status and any
                  returned result.
                </p>
              )}
            </article>
          );
        })}
      </div>
      {report && !evidenceAvailable && (
        <p className="mi-method-panel-note">
          <AlertTriangle size={16} />
          Insufficient evidence concerns the server-returned local evidence set.
          It does not make an applicable approach not applicable.
        </p>
      )}
    </section>
  );
}
