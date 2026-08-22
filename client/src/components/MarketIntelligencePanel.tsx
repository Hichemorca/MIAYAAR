import React from "react";
import { AlertTriangle, LoaderCircle, ShieldCheck } from "lucide-react";
import type {
  MarketIntelligenceBenchmark,
  MarketIntelligencePropertyType,
} from "../../../contracts/market-intelligence.contracts";
import { trpc } from "@/lib/trpc";
import { ReportContentCategoryTag } from "./ValuationReportContext";

type MarketIntelligencePanelProps = {
  district: string;
  propertyType: MarketIntelligencePropertyType;
  asOf: Date;
};

type MarketIntelligenceSnapshotProps = {
  benchmark?: MarketIntelligenceBenchmark;
  state: "loading" | "error" | "ready";
};

const formatDate = (value: Date) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));

const formatPricePerSqm = (value: number) =>
  new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
  }).format(value);

function MarketSnapshotFacts({
  benchmark,
}: {
  benchmark: MarketIntelligenceBenchmark;
}) {
  const { provenance } = benchmark;
  const sampleSize =
    benchmark.status === "available"
      ? benchmark.statistics.count
      : provenance.recordCount;

  const unavailableMessage =
    benchmark.status === "unavailable"
      ? `The server returned ${provenance.recordCount} eligible DLD transaction${provenance.recordCount === 1 ? "" : "s"}; MI-v1.0 requires ${benchmark.requiredCount}. No fallback was used.`
      : null;

  return (
    <>
      <dl className="mi-market-facts" aria-label="Market snapshot facts">
        <div>
          <dt>Market status</dt>
          <dd>
            {benchmark.status === "available" ? "Available" : "Unavailable"}
          </dd>
        </div>
        <div>
          <dt>Sample size</dt>
          <dd>{sampleSize} eligible transactions</dd>
        </div>
        <div>
          <dt>Date range</dt>
          <dd>
            {formatDate(provenance.filters.from)} to{" "}
            {formatDate(provenance.asOf)}
          </dd>
        </div>
        <div>
          <dt>Data quality</dt>
          <dd>Eligible DLD evidence</dd>
        </div>
        <div>
          <dt>Market confidence</dt>
          <dd>UNAVAILABLE — not produced by MI-v1.0</dd>
        </div>
        <div>
          <dt>Source</dt>
          <dd>{provenance.source}</dd>
        </div>
      </dl>

      {benchmark.status === "available" ? (
        <div
          className="mi-market-statistics"
          aria-label="Descriptive benchmark statistics"
        >
          <div>
            <span>Mean price / sqm</span>
            <b>{formatPricePerSqm(benchmark.statistics.mean)}</b>
          </div>
          <div>
            <span>Observed range</span>
            <b>
              {formatPricePerSqm(benchmark.statistics.min)} to{" "}
              {formatPricePerSqm(benchmark.statistics.max)}
            </b>
          </div>
          <div>
            <span>Standard deviation</span>
            <b>{formatPricePerSqm(benchmark.statistics.standardDeviation)}</b>
          </div>
        </div>
      ) : (
        <div className="mi-market-unavailable">
          <AlertTriangle size={18} />
          <p>{unavailableMessage}</p>
        </div>
      )}

      <p className="mi-market-boundary">
        <ShieldCheck size={15} />
        This descriptive DLD benchmark is independent market context. It does
        not change the valuation, create a confidence level, or perform
        diagnostics.
      </p>

      <details className="mi-market-provenance">
        <summary>Source and provenance</summary>
        <p>
          {provenance.source} · {provenance.policyVersion} · as of{" "}
          {formatDate(provenance.asOf)} · {provenance.recordCount} selected
          record{provenance.recordCount === 1 ? "" : "s"}
        </p>
        <p>
          Scope: {provenance.filters.district} ·{" "}
          {provenance.filters.propertyType} ·{" "}
          {formatDate(provenance.filters.from)}
          {" to "}
          {formatDate(provenance.filters.asOf)}
        </p>
        {provenance.records.length > 0 && (
          <div className="mi-market-provenance-table">
            <div className="mi-market-provenance-head">
              <span>Transaction reference</span>
              <span>Transaction date</span>
              <span>Ingested</span>
              <span>Checksum</span>
            </div>
            {provenance.records.slice(0, 8).map(record => (
              <div
                className="mi-market-provenance-row"
                key={record.sourceTransactionId}
              >
                <span>{record.sourceTransactionId}</span>
                <span>{formatDate(record.transactionDate)}</span>
                <span>{formatDate(record.ingestedAt)}</span>
                <span>{record.sourceChecksum}</span>
              </div>
            ))}
          </div>
        )}
      </details>
    </>
  );
}

/** Pure presentation surface for the existing MI-v1.0 result union. */
export function MarketIntelligenceSnapshot({
  benchmark,
  state,
}: MarketIntelligenceSnapshotProps) {
  if (state === "loading") {
    return (
      <div className="mi-market-state" aria-live="polite">
        <LoaderCircle className="spin" size={20} />
        <div>
          <b>Loading Market Snapshot</b>
          <p>The read-only DLD benchmark is being requested from the server.</p>
        </div>
      </div>
    );
  }

  if (state === "error" || !benchmark) {
    return (
      <div className="mi-market-state unavailable" aria-live="polite">
        <AlertTriangle size={20} />
        <div>
          <div className="mi-market-state-title">
            <b>Market Snapshot Unavailable</b>
            <ReportContentCategoryTag category="UNAVAILABLE" />
          </div>
          <p>
            The server did not return a Market Intelligence report. No market
            value, confidence, or diagnostic result is shown.
          </p>
        </div>
      </div>
    );
  }

  const available = benchmark.status === "available";
  return (
    <div
      className={`mi-market-result ${available ? "available" : "unavailable"}`}
    >
      <div className="mi-market-result-title">
        <span className={`status-badge ${available ? "positive" : "negative"}`}>
          <i />
          {available ? "Market available" : "Market unavailable"}
        </span>
        <ReportContentCategoryTag
          category={available ? "FACT" : "UNAVAILABLE"}
        />
      </div>
      <MarketSnapshotFacts benchmark={benchmark} />
    </div>
  );
}

/** Server-backed, read-only MI v1.0 presentation linked to a valuation report scope. */
export default function MarketIntelligencePanel({
  district,
  propertyType,
  asOf,
}: MarketIntelligencePanelProps) {
  const benchmarkQuery = trpc.marketIntelligence.benchmark.useQuery(
    { district, propertyType, asOf },
    { retry: false }
  );
  const state = benchmarkQuery.isPending
    ? "loading"
    : benchmarkQuery.isError
      ? "error"
      : "ready";

  return (
    <section
      id="market-intelligence"
      className="mi-market-intelligence"
      aria-labelledby="market-intelligence-title"
    >
      <div className="section-lead">
        <span>05</span>
        <div>
          <div className="mi-section-heading">
            <h3 id="market-intelligence-title">Market Snapshot</h3>
            <ReportContentCategoryTag category="FACT" />
          </div>
          <p>
            A read-only DLD benchmark for this district, property type, and
            server-held as-of date. It is not an input to this valuation report.
          </p>
        </div>
      </div>
      <div className="mi-market-content">
        <MarketIntelligenceSnapshot
          benchmark={benchmarkQuery.data}
          state={state}
        />
      </div>
    </section>
  );
}
