import { AlertTriangle, LoaderCircle, ShieldCheck } from "lucide-react";
import type { ComparableSelectionPreview } from "../../../server/comparable-selection/dld-comparable-selection-preview";
import { trpc } from "@/lib/trpc";
import { ReportContentCategoryTag } from "./ValuationReportContext";

type ComparableSelectionPanelProps = {
  district: string;
  propertyType:
    | "apartment"
    | "villa"
    | "townhouse"
    | "office"
    | "retail"
    | "land"
    | "warehouse";
  areaSqm: number;
  asOf: Date;
};

export type ComparableSelectionSnapshotProps = {
  preview?: ComparableSelectionPreview;
  state: "loading" | "error" | "ready";
};

const formatDate = (value: Date) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));

const formatAed = (value: number) =>
  new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
  }).format(value);

function ComparableTable({
  label,
  records,
  exclusions,
}: {
  label: string;
  records:
    | ComparableSelectionPreview["comparables"]
    | ComparableSelectionPreview["excluded"];
  exclusions?: boolean;
}) {
  return (
    <div className="evidence-table mi-comparable-table">
      <div className="evidence-head mi-comparable-head">
        <span>Property reference</span>
        <span>District</span>
        <span>Property type</span>
        <span>Date</span>
        <span>Area</span>
        <span>Sale price</span>
        <span>Price / sqm</span>
        {exclusions && <span>Server exclusion reason</span>}
      </div>
      {records.length > 0 ? (
        records.map(record => (
          <div
            className="evidence-row mi-comparable-row"
            key={record.sourceTransactionId}
          >
            <span>
              <b>{record.sourceTransactionId}</b>
            </span>
            <span>{record.district}</span>
            <span>{record.propertyType}</span>
            <span>{formatDate(record.transactionDate)}</span>
            <span>{record.areaSqm.toLocaleString("en-AE")} sqm</span>
            <span>{formatAed(record.salePriceAed)}</span>
            <span>{formatAed(record.pricePerSqm)}</span>
            {exclusions && (
              <span>
                <code>{"reason" in record ? record.reason : ""}</code>
              </span>
            )}
          </div>
        ))
      ) : (
        <p className="mi-comparable-empty">
          No {label.toLowerCase()} records were returned by the server.
        </p>
      )}
    </div>
  );
}

/** Pure presentation surface for the server-returned Comparable Selection preview. */
export function ComparableSelectionSnapshot({
  preview,
  state,
}: ComparableSelectionSnapshotProps) {
  if (state === "loading") {
    return (
      <div className="mi-market-state" aria-live="polite">
        <LoaderCircle className="spin" size={20} />
        <div>
          <b>Loading Comparable Selection</b>
          <p>
            The read-only DLD candidate preview is being requested from the
            server.
          </p>
        </div>
      </div>
    );
  }

  if (state === "error" || !preview) {
    return (
      <div className="mi-market-state unavailable" aria-live="polite">
        <AlertTriangle size={20} />
        <div>
          <div className="mi-market-state-title">
            <b>Comparable Selection Unavailable</b>
            <ReportContentCategoryTag category="UNAVAILABLE" />
          </div>
          <p>
            The server did not return a Comparable Selection preview. No
            comparable was created by the interface.
          </p>
        </div>
      </div>
    );
  }

  const selected = preview.status === "selected";
  return (
    <div
      className={`mi-market-result ${selected ? "available" : "unavailable"}`}
    >
      <div className="mi-market-result-title">
        <span className={`status-badge ${selected ? "positive" : "negative"}`}>
          <i />
          {selected
            ? "Comparables selected"
            : "Comparable Selection unavailable"}
        </span>
        <ReportContentCategoryTag
          category={selected ? "FACT" : "UNAVAILABLE"}
        />
      </div>
      <dl className="mi-market-facts" aria-label="Comparable selection facts">
        <div>
          <dt>Selection status</dt>
          <dd>{selected ? "Selected" : "Unavailable"}</dd>
        </div>
        <div>
          <dt>Selected comparables</dt>
          <dd>{preview.comparables.length}</dd>
        </div>
        <div>
          <dt>Excluded candidates</dt>
          <dd>{preview.excluded.length}</dd>
        </div>
        <div>
          <dt>DLD candidate count</dt>
          <dd>{preview.search.candidateCount}</dd>
        </div>
        <div>
          <dt>Selection window</dt>
          <dd>{preview.search.windowDays} days</dd>
        </div>
        <div>
          <dt>As of</dt>
          <dd>{formatDate(preview.search.asOf)}</dd>
        </div>
      </dl>
      {!selected && (
        <div className="mi-market-unavailable">
          <AlertTriangle size={18} />
          <p>
            The server returned {preview.comparables.length} selected record
            {preview.comparables.length === 1 ? "" : "s"}; CS-v1.0 requires{" "}
            {preview.requiredCount}. No fallback was used.
          </p>
        </div>
      )}
      <div className="mi-comparable-section">
        <h4>Selected comparables</h4>
        <ComparableTable
          label="selected comparable"
          records={preview.comparables}
        />
      </div>
      <div className="mi-comparable-section">
        <h4>Excluded candidates</h4>
        <ComparableTable
          label="excluded candidate"
          records={preview.excluded}
          exclusions
        />
      </div>
      <p className="mi-market-boundary">
        <ShieldCheck size={15} />
        This server-returned selection preview is read-only. It does not change
        valuation, confidence, methodology, or the CS-v1.0 selection rules.
      </p>
    </div>
  );
}

/** Server-backed, read-only CS-v1.0 presentation linked to a valuation report scope. */
export default function ComparableSelectionPanel({
  district,
  propertyType,
  areaSqm,
  asOf,
}: ComparableSelectionPanelProps) {
  const previewQuery = trpc.comparableSelection.preview.useQuery(
    { district, propertyType, areaSqm, asOf },
    { retry: false }
  );
  const state = previewQuery.isPending
    ? "loading"
    : previewQuery.isError
      ? "error"
      : "ready";

  return (
    <section
      id="comparable-selection"
      className="mi-market-intelligence mi-comparable-selection"
      aria-labelledby="comparable-selection-title"
    >
      <div className="section-lead">
        <span>06</span>
        <div>
          <div className="mi-section-heading">
            <h3 id="comparable-selection-title">Comparable Selection</h3>
            <ReportContentCategoryTag category="FACT" />
          </div>
          <p>
            Selected and excluded DLD candidates are shown exactly as returned
            by the CS-v1.0 server preview.
          </p>
        </div>
      </div>
      <div className="mi-market-content">
        <ComparableSelectionSnapshot
          preview={previewQuery.data}
          state={state}
        />
      </div>
    </section>
  );
}
