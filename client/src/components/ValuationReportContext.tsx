import React from "react";
import { getApplicableMethods } from "@shared/valuation/method-applicability.policy";
import type { ValuationReport as ValuationReportData } from "../../../server/engines/reporting/valuation-report";
import {
  allValuationMethods,
  getMethodNotApplicableExplanation,
  getServerApproachLabel,
  propertyTypeChoices,
} from "../pages/home-form-config";

export type ReportContentCategory =
  | "FACT"
  | "ASSESSMENT"
  | "UNAVAILABLE"
  | "NOT_APPLICABLE";

export function ReportContentCategoryTag({
  category,
}: {
  category: ReportContentCategory;
}) {
  return (
    <span className={`mi-report-category ${category.toLowerCase()}`}>
      {category}
    </span>
  );
}

function propertyTypeLabel(
  propertyType: ValuationReportData["property"]["propertyType"]
) {
  return (
    propertyTypeChoices.find(choice => choice.value === propertyType)?.label ??
    propertyType
  );
}

export default function ValuationReportContext({
  report,
}: {
  report: ValuationReportData;
}) {
  const { property } = report;
  const applicableMethods = getApplicableMethods(property.propertyType);
  const notApplicableMethods = allValuationMethods.filter(
    method => !applicableMethods.includes(method)
  );
  return (
    <>
      <section className="mi-report-context">
        <div className="section-lead">
          <span>01</span>
          <div>
            <div className="mi-section-heading">
              <h3>Property summary</h3>
              <ReportContentCategoryTag category="FACT" />
            </div>
            <p>
              Facts supplied in the server-authored report for this valuation
              request.
            </p>
          </div>
        </div>
        <dl className="mi-report-facts">
          <div>
            <dt>Property type</dt>
            <dd>{propertyTypeLabel(property.propertyType)}</dd>
          </div>
          <div>
            <dt>District</dt>
            <dd>{property.district}</dd>
          </div>
          <div>
            <dt>Internal area</dt>
            <dd>{property.areaSqm.toLocaleString("en-AE")} sqm</dd>
          </div>
        </dl>
      </section>

      <section className="mi-report-context">
        <div className="section-lead">
          <span>02</span>
          <div>
            <div className="mi-section-heading">
              <h3>Applicable methods</h3>
              <ReportContentCategoryTag category="FACT" />
            </div>
            <p>
              Method availability is a policy fact; it is not a statement that a
              value was calculated.
            </p>
          </div>
        </div>
        <div className="mi-method-policy-grid">
          <article>
            <b>Applicable</b>
            <ul>
              {applicableMethods.map(method => (
                <li key={method}>{getServerApproachLabel(method)}</li>
              ))}
            </ul>
          </article>
          {notApplicableMethods.length > 0 && (
            <article className="not-applicable">
              <div className="mi-policy-card-heading">
                <b>Not applicable</b>
                <ReportContentCategoryTag category="NOT_APPLICABLE" />
              </div>
              <ul>
                {notApplicableMethods.map(method => (
                  <li key={method}>
                    {getMethodNotApplicableExplanation(
                      property.propertyType,
                      method
                    )}
                  </li>
                ))}
              </ul>
            </article>
          )}
        </div>
      </section>

      <section className="mi-data-limitations">
        <div className="section-lead">
          <span>06</span>
          <div>
            <div className="mi-section-heading">
              <h3>Data limitations</h3>
              <ReportContentCategoryTag
                category={
                  report.evidence.status === "unavailable"
                    ? "UNAVAILABLE"
                    : "FACT"
                }
              />
            </div>
            {report.evidence.status === "unavailable" ? (
              <p>
                The server returned {report.evidence.availableCount} eligible
                local records; the report requires{" "}
                {report.evidence.requiredCount}. No substitute evidence set was
                provided.
              </p>
            ) : (
              <p>
                No separate data-limitations field was returned by the server.
                The available evidence facts and any server warnings remain
                visible in their own sections.
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
