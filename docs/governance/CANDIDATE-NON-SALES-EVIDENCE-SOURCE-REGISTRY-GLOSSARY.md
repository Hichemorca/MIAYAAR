# Candidate Non-Sales Evidence Source Registry — Glossary

**Status:** Phase A glossary only

**Applies to:** Candidate-source research governance for `M-03` and `M-04`

**Governing policy:** `NSE-RG-v1.0`
**Author:** Manus AI

> This glossary standardises descriptive language for the governance template. It creates no source record, does not define a data model, and does not authorise source access, data collection, valuation use, or a partial valuation policy.

## 1. Core entities

| Term                          | Definition                                                                                                                   | Explicitly not meant by the term                                                                     |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Candidate source**          | A named information source that may be entered only after a source-specific owner gate, for descriptive research governance. | A source approved for production, collection, or valuation.                                          |
| **Candidate class**           | A descriptive category of non-sales evidence that may be studied under `SOURCE-01`.                                          | A proof that a source supports an engine contract or valuation approach.                             |
| **Artifact**                  | A discrete item stated to originate from a candidate source, such as a record, report, document, or file.                    | A verified or permitted item, or an item already collected.                                          |
| **Artifact reference**        | A link or project reference that identifies an artifact without copying its content.                                         | A right to access, process, retain, share, or download the artifact.                                 |
| **Evidence package**          | A future, reviewable grouping of artifacts and their provenance, linkage, time, rights, extraction, and review facts.        | A currently approved data package or a valuation input.                                              |
| **Source owner or publisher** | The owner, issuer, author, or publisher as stated by a source or owner-provided reference.                                   | A verified legal owner or an authority with data-use permission.                                     |
| **Subject property**          | The property for which a valuation request is being considered.                                                              | A property established merely by district, property type, area, project, or similar characteristics. |

## 2. Provenance, linkage, and time

| Term                                  | Definition                                                                                  | Required distinction                                                                         |
| ------------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **Provenance fact**                   | A fact describing where a candidate or artifact is stated to come from.                     | It must be kept distinct from authenticity, completeness, and permission.                    |
| **Property-link fact**                | A source-stated fact that refers to a property, project, unit, parcel, or other identifier. | It must be kept distinct from a legal or verified identity conclusion.                       |
| **Link incomplete**                   | A recorded state where available link facts do not establish the intended connection.       | It is not a negative price or quality judgment.                                              |
| **Link conflict recorded**            | A recorded state where two or more stated linkage facts conflict.                           | It does not resolve the conflict or select a preferred fact.                                 |
| **Observed time**                     | Time when a reference is recorded in the governance register.                               | Artifact capture time, source observation time, effective time, reporting period, or `asOf`. |
| **Artifact capture time**             | Time when an artifact was captured, if explicitly known.                                    | The artifact’s publication, observation, effective, or reporting period.                     |
| **Stated observation/effective time** | Time the source states that an observation occurred or became effective.                    | A recency finding or a rule for temporal suitability.                                        |
| **Reporting period**                  | Period the artifact states that its content covers.                                         | A valuation date or an instruction to annualise or adjust.                                   |
| **`asOf` context**                    | Request-time context preserved separately for a future valuation request.                   | A rule that determines whether non-sales evidence is timely.                                 |

## 3. Rights, access, and use

| Term                    | Definition                                                                                                        | Explicitly not implied                                                           |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **Access fact**         | A statement that a reference appears public, appears to require authentication, or has unknown access conditions. | Permission to visit, authenticate, register, or retrieve content.                |
| **Rights fact**         | A stated licence, terms reference, or explicit unresolved-rights status.                                          | A legal interpretation, clearance, or permission.                                |
| **`UNVERIFIED_RIGHTS`** | A status for visible rights language that has not been independently evaluated.                                   | Permission to collect, process, retain, share, or deploy.                        |
| **`UNRESOLVED_RIGHTS`** | A status for absent, incomplete, conflicting, or not-yet-determined rights information.                           | A defect that can be ignored or an implicit right.                               |
| **Usage restriction**   | A stated condition on access, processing, retention, sharing, or deployment.                                      | A complete compliance assessment.                                                |
| **Research purpose**    | The isolated descriptive-governance purpose defined in `NSE-RG-v1.0`.                                             | Production use, product delivery, valuation testing, or commercial exploitation. |

## 4. Raw values and transformations

| Term                                          | Definition                                                                                   | Explicitly not implied                                                                                |
| --------------------------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **Raw value**                                 | A value stated by a source together with the stated unit, currency, and period.              | Correctness, comparability, or an engine-ready input.                                                 |
| **Descriptive representation change**         | A documented non-economic presentation change that names raw value, reason, actor, and time. | FX conversion, annualisation, normalisation, escalation, time adjustment, or a valuation coefficient. |
| **Transformation lineage**                    | A future record that traces a descriptive representation change back to its raw value.       | Approval of an economic transformation or policy.                                                     |
| **Potential contract-field mention**          | A statement that a candidate declares data that resembles a named existing contract field.   | Evidence that the field is present, valid, complete, or acceptable.                                   |
| **`MENTIONED` / `NOT_MENTIONED` / `UNKNOWN`** | The only descriptive states for a potential contract-field mention.                          | A measurement of data quality, sufficiency, or method availability.                                   |

## 5. Review and register decision states

| Term                         | Definition                                                                                                                                  | Explicitly not implied                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **Descriptive review**       | A review separate from collection, extraction, or transformation that records what was and was not checked.                                 | A price, fairness, anomaly, confidence, or valuation judgment.                |
| **Independent review**       | A descriptive review performed by someone separate from the collector or extractor, under a future approved identity and independence rule. | A production release approval or a resolution of policy gaps.                 |
| **`OBSERVED`**               | A stated or visible fact has been recorded descriptively.                                                                                   | Validation of truth, completeness, permission, or valuation use.              |
| **`INCOMPLETE`**             | Expected descriptive facts are missing or incomplete.                                                                                       | Permission to fill the gap by inference.                                      |
| **`CONFLICT_RECORDED`**      | Descriptive facts conflict and the conflict is preserved.                                                                                   | A choice of one fact as correct.                                              |
| **`NOT_ASSESSED`**           | No descriptive assessment has been made.                                                                                                    | A negative finding.                                                           |
| **`NON_INDEPENDENT_REVIEW`** | Review was conducted by the collector or extractor, or independence is not established.                                                     | An independent review.                                                        |
| **`CANDIDATE_FOR_GATE`**     | A candidate may be presented to the owner for a distinct source-specific next-gate decision.                                                | Authorization to contact, access, collect, use, or deploy.                    |
| **`HOLD`**                   | The candidate remains recorded with unresolved gaps or no further decision.                                                                 | Rejection, approval, or a right to infer missing information.                 |
| **`REJECTED_FROM_REGISTRY`** | The candidate is closed in the governance register with a written reason.                                                                   | Deletion of its audit history or a judgment about the candidate’s price data. |

## 6. Governance and non-interference

| Term                                  | Definition                                                                                                           | Explicitly not implied                                                                           |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| **Phase A**                           | Creation and approval of the blank template and glossary only.                                                       | A populated register, a candidate list, external research, provider contact, or data collection. |
| **Source-specific gate**              | A future, explicit owner decision that scopes examination of one named candidate.                                    | A general approval for a class of sources or any other candidate.                                |
| **Policy gate**                       | A documented decision point required before a new policy, source, transformation, or methodological use may proceed. | A software feature flag or automatic implementation instruction.                                 |
| **Non-interference statement**        | An auditable statement that governance work did not alter protected production or valuation surfaces.                | Proof that a future source is suitable for any use.                                              |
| **Local eligible DLD sales evidence** | The mandatory local sales-evidence condition of the current governed valuation posture.                              | A requirement that may be replaced by non-sales evidence.                                        |
| **`UNRESOLVED_POLICY`**               | A policy matter deliberately left undecided because no approved evidence-backed rule exists.                         | Permission to invent a fallback, benchmark, threshold, coefficient, or rule.                     |

## 7. References

[1]: ../policies/NON-SALES-EVIDENCE-SOURCES-RESEARCH-GOVERNANCE-POLICY.md "NSE-RG-v1.0"
[2]: CANDIDATE-NON-SALES-EVIDENCE-SOURCE-REGISTRY-TEMPLATE.md "Candidate source registry template"
[3]: CALC-013-M03-M04-EVIDENCE-ACQUISITION-VALIDATION-PROTOCOL-2026-08-20.md "M-03/M-04 evidence-acquisition and validation protocol"
