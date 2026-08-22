import { useEffect, useMemo, useState, type FormEvent } from "react";
import React from "react";
import {
  AlertTriangle,
  CalendarClock,
  Database,
  FileWarning,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
import type {
  EvidenceIntegrityPropertyType,
  EvidenceIntegrityResult,
} from "../../../contracts/evidence-integrity.contracts";
import { trpc } from "@/lib/trpc";
import {
  getEvidenceIntegrityHeading,
  getEvidenceIntegrityMetrics,
  getEvidenceIntegritySummary,
  getEvidenceIntegrityUiState,
  parseAsOfDate,
} from "./evidence-integrity-presentation";
import "./EvidenceIntegrityPanel.css";

type EvidenceIntegrityPanelProps = {
  district: string;
  propertyType: EvidenceIntegrityPropertyType;
  asOf?: Date;
  autoRequest?: boolean;
};

const asDateInputValue = (date: Date) => date.toISOString().slice(0, 10);

const titleize = (value: string) =>
  value.replaceAll("_", " ").replace(/\b\w/g, letter => letter.toUpperCase());

const formatDate = (value: Date) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));

function ResultDetails({ result }: { result: EvidenceIntegrityResult }) {
  const metrics = getEvidenceIntegrityMetrics(result.summary);

  return (
    <>
      <p className="ei-summary">{getEvidenceIntegritySummary(result)}</p>
      <div className="ei-scope-facts" aria-label="Evidence scope facts">
        <span>
          <b>Source</b>
          {result.provenance.source}
        </span>
        <span>
          <b>Reporting window</b>
          {formatDate(result.provenance.filters.from)} to{" "}
          {formatDate(result.provenance.asOf)}
        </span>
        <span>
          <b>Policy</b>
          {result.provenance.policyVersion}
        </span>
      </div>
      <div className="ei-metrics" aria-label="Evidence integrity summary">
        {metrics.map(metric => (
          <div key={metric.label}>
            <span>{metric.label}</span>
            <b>{metric.value}</b>
          </div>
        ))}
      </div>

      <div
        className="ei-observations"
        aria-label="Evidence integrity observations"
      >
        {result.observations.map(observation => (
          <p key={observation.code}>
            <ShieldCheck size={14} />
            <span>{titleize(observation.code)}</span>
            <b>{observation.recordCount}</b>
          </p>
        ))}
      </div>

      <details className="ei-provenance">
        <summary>Source provenance and record trace</summary>
        <p>
          DLD · {result.provenance.policyVersion} ·{" "}
          {formatDate(result.provenance.filters.from)} to{" "}
          {formatDate(result.provenance.asOf)} · {result.provenance.recordCount}{" "}
          records examined
        </p>
        {result.provenance.records.length > 0 && (
          <div className="ei-provenance-table">
            <div className="ei-provenance-head">
              <span>Transaction reference</span>
              <span>Date</span>
              <span>Evidence status</span>
            </div>
            {result.provenance.records.slice(0, 8).map(record => (
              <div
                className="ei-provenance-row"
                key={record.sourceTransactionId}
              >
                <span>{record.sourceTransactionId}</span>
                <span>{formatDate(record.transactionDate)}</span>
                <span>{titleize(record.evidenceStatus)}</span>
              </div>
            ))}
          </div>
        )}
      </details>
    </>
  );
}

/**
 * Pure report surface for the factual Evidence Integrity response. It accepts
 * only the existing server contract and deliberately has no valuation,
 * confidence, score, or diagnostic inputs.
 */
export function EvidenceIntegritySnapshot({
  result,
}: {
  result: EvidenceIntegrityResult;
}) {
  const isAvailable = result.status === "available";

  return (
    <div className="ei-result-data">
      <div className="ei-result-title">
        <span className={`status-badge ${isAvailable ? "positive" : "negative"}`}>
          <i />
          {isAvailable
            ? "FACT · Evidence available"
            : "UNAVAILABLE · Evidence insufficient"}
        </span>
        <b>{getEvidenceIntegrityHeading(result.status)}</b>
      </div>
      <ResultDetails result={result} />
      <aside className="ei-limitations" aria-label="Evidence limits">
        <p>Evidence limits</p>
        <span>
          This facts-only DLD record cannot establish value, price fairness, a
          confidence or quality score, or a diagnostic classification.
        </span>
        <ul>
          <li>No valuation or price-per-sqm result is produced.</li>
          <li>No confidence, evidence score, or quality score is produced.</li>
          <li>No fallback source or broader geographic scope is used.</li>
        </ul>
      </aside>
    </div>
  );
}

/** Read-only presentation of the server-authoritative Evidence Integrity v1.0 report. */
export default function EvidenceIntegrityPanel({
  district,
  propertyType,
  asOf: valuationAsOf,
  autoRequest = false,
}: EvidenceIntegrityPanelProps) {
  const suppliedAsOfValue = valuationAsOf
    ? asDateInputValue(valuationAsOf)
    : undefined;
  const [asOfValue, setAsOfValue] = useState(() =>
    suppliedAsOfValue ?? asDateInputValue(new Date())
  );
  const [hasRequested, setHasRequested] = useState(autoRequest);

  useEffect(() => {
    if (!suppliedAsOfValue) return;
    setAsOfValue(suppliedAsOfValue);
    setHasRequested(true);
  }, [suppliedAsOfValue]);

  const asOf = useMemo(() => parseAsOfDate(asOfValue), [asOfValue]);
  const request = useMemo(
    () => ({ district, propertyType, asOf: asOf ?? new Date(0) }),
    [asOf, district, propertyType]
  );
  const evidenceQuery = trpc.evidenceIntegrity.report.useQuery(request, {
    enabled: hasRequested && asOf !== null,
    retry: false,
  });
  const state = getEvidenceIntegrityUiState({
    hasRequested,
    hasInvalidAsOf: asOf === null,
    isPending: evidenceQuery.isPending,
    isError: evidenceQuery.isError,
    result: evidenceQuery.data,
  });

  function inspectEvidence(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasRequested(true);
  }

  return (
    <section
      id="evidence-integrity"
      className="ei-panel"
      aria-labelledby="evidence-integrity-title"
    >
      <div className="ei-heading">
        <div>
          <p className="mi-eyebrow">Evidence integrity · DLD only</p>
          <h2 id="evidence-integrity-title">Evidence, before inference.</h2>
          <p>
            This read-only report records local DLD eligibility, sample
            sufficiency, time exclusions, and provenance. It does not provide a
            value, score, or price classification.
          </p>
        </div>
        <span className="ei-policy">EID-v1.0 · 90 days</span>
      </div>

      <form className="ei-controls" onSubmit={inspectEvidence} noValidate>
        <label>
          <span>
            {valuationAsOf ? "Valuation as-of date" : "As-of date"}
          </span>
          <div>
            <CalendarClock size={15} />
            <input
              aria-label="Evidence integrity as-of date"
              type="date"
              value={asOfValue}
              onChange={event => setAsOfValue(event.target.value)}
              readOnly={Boolean(valuationAsOf)}
              required
            />
          </div>
        </label>
        <p>
          Scope: <b>{titleize(district)}</b> · <b>{titleize(propertyType)}</b>
        </p>
        <button type="submit" disabled={evidenceQuery.isFetching}>
          {evidenceQuery.isFetching ? (
            <LoaderCircle className="spin" size={16} />
          ) : (
            <Database size={16} />
          )}
          {hasRequested
            ? valuationAsOf
              ? "Refresh linked evidence"
              : "Refresh evidence"
            : "Inspect evidence"}
        </button>
      </form>

      <div className={`ei-result ei-${state}`} aria-live="polite">
        {state === "idle" && (
          <>
            <Database size={22} />
            <div>
              <b>{getEvidenceIntegrityHeading(state)}</b>
              <p>
                {valuationAsOf
                  ? "The server-held DLD record is linked to this valuation's district, property type, and as-of date."
                  : "Select the reporting date, then inspect the server-held DLD record for this district and property type."}
              </p>
            </div>
          </>
        )}
        {state === "validation" && (
          <>
            <FileWarning size={22} />
            <div>
              <b>{getEvidenceIntegrityHeading(state)}</b>
              <p>
                The report was not requested. Enter a calendar date in
                YYYY-MM-DD form.
              </p>
            </div>
          </>
        )}
        {state === "loading" && (
          <>
            <LoaderCircle className="spin" size={22} />
            <div>
              <b>{getEvidenceIntegrityHeading(state)}</b>
              <p>
                The report is read from the DLD evidence provider on the server.
              </p>
            </div>
          </>
        )}
        {state === "error" && (
          <>
            <AlertTriangle size={22} />
            <div>
              <b>{getEvidenceIntegrityHeading(state)}</b>
              <p>
                The server did not return an evidence report. Review the inputs
                and try again.
              </p>
            </div>
          </>
        )}
        {(state === "available" || state === "unavailable") &&
          evidenceQuery.data && (
            <EvidenceIntegritySnapshot result={evidenceQuery.data} />
          )}
      </div>
    </section>
  );
}
