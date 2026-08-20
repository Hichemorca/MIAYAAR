# Candidate Non-Sales Evidence Source Registry — Governance Template

**Status:** Phase A template only — no candidate records entered

**Applies to:** Research governance for `M-03` and `M-04` only

**Governing policy:** `NSE-RG-v1.0`
**Author:** Manus AI

> This template records a _candidate source_ for a future owner-approved gate. It is not a production registry, data store, source approval, legal assessment, evidence package, or valuation input. No field in this template authorizes collection, login, acceptance of terms, download, processing, retention, sharing, or delivery to `valuation.run`.

## 1. Non-negotiable boundaries

Eligible local DLD sales evidence remains mandatory. A non-sales candidate must never replace it, create a partial valuation result, or change methodology v1.2, method weights, coefficients, comparable selection, confidence, API responses, database records, or valuation outputs. [1] [2]

The template may contain only facts supplied by the owner or already present in project documentation during a separately approved stage. It must not be populated from external searching, browsing, provider contact, registration, credentials, downloads, or copied artifact content.

## 2. Register-level control block

| Field                      | Required entry | Permitted value or instruction                                                                         |
| -------------------------- | -------------- | ------------------------------------------------------------------------------------------------------ |
| `registryVersion`          | Yes            | Semantic documentation version, starting at `0.1.0`.                                                   |
| `templateStatus`           | Yes            | `PHASE_A_TEMPLATE_ONLY`.                                                                               |
| `governingPolicy`          | Yes            | `NSE-RG-v1.0`.                                                                                         |
| `scope`                    | Yes            | `M-03/M-04 research governance only`.                                                                  |
| `recordCount`              | Yes            | `0` until a later owner-approved source-specific gate.                                                 |
| `lastChangeAt`             | Yes            | UTC timestamp of the template update.                                                                  |
| `changeLogReference`       | Yes            | Reference to the append-only register-level change log below.                                          |
| `nonInterferenceStatement` | Yes            | Statement that no source, artifact, data, API, database, engine, or valuation output has been changed. |

### Append-only register change log

| Change reference        | UTC time | Actor | Change description | Owner approval reference | Reversal or supersession reference |
| ----------------------- | -------- | ----- | ------------------ | ------------------------ | ---------------------------------- |
| _No entries in Phase A_ | —        | —     | —                  | —                        | —                                  |

No prior decision may be deleted. A correction, withdrawal, or supersession must be appended with a reference to the earlier entry and must preserve the earlier text.

## 3. Candidate source record template

The block below is a blank template. It must remain blank until an owner expressly approves a source-specific gate. It does not itself permit recording a named source.

### 3.1 Identity and provenance facts

| Field                    | Required when a record is permitted | Permitted content                                                                                                                                                                                                         | Explicitly not implied                              |
| ------------------------ | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `candidateId`            | Yes                                 | Descriptive identifier in the form `CAND-YYYY-NNN`, allocated sequentially without ranking.                                                                                                                               | Quality, priority, trust, or eligibility.           |
| `displayName`            | Yes                                 | Name supplied by the owner or stated by the source.                                                                                                                                                                       | Legal identity, ownership, or authority.            |
| `candidateClass`         | Yes                                 | One or more descriptive classes: `LEASE_OR_TENANCY`, `PROPERTY_OPERATING_OR_FINANCIAL`, `CONSTRUCTION_OR_COST`, `OPERATING_OR_EXPENSE`, `DCF_RELEVANT_DOCUMENT`, `REGULATORY_OR_OFFICIAL_REGISTER`, or `OTHER_DESCRIBED`. | Contract compatibility or use in valuation.         |
| `statedOwnerOrPublisher` | No                                  | Owner, publisher, author, or issuer as stated.                                                                                                                                                                            | Verification of that statement.                     |
| `publicReference`        | No                                  | Owner-supplied public URL or project-document reference.                                                                                                                                                                  | Permission to visit, access, download, or reuse it. |
| `provenanceFacts`        | No                                  | Observable, stated source facts only.                                                                                                                                                                                     | Completeness, authenticity, or content accuracy.    |
| `observedAt`             | No                                  | UTC time at which an owner-supplied reference was recorded.                                                                                                                                                               | Artifact capture, effective time, or freshness.     |

### 3.2 Declared evidence characteristics

| Field                            | Required when a record is permitted | Permitted content                                                                   | Explicitly not implied                                   |
| -------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `statedEvidenceType`             | No                                  | The evidence type as described by the candidate.                                    | A supported engine input or a complete evidence package. |
| `statedCoverageFacts`            | No                                  | Location, project, property type, period, or other coverage as declared.            | Subject-property identity or suitability.                |
| `statedUnitCurrencyPeriod`       | No                                  | Unit, currency, and reporting period as stated.                                     | Conversion, normalisation, annualisation, or adjustment. |
| `declaredTimeFacts`              | No                                  | Publication, observation, effective, or period times as separately stated.          | Temporal relevance or `asOf` compliance.                 |
| `potentialContractFieldMentions` | No                                  | `MENTIONED`, `NOT_MENTIONED`, or `UNKNOWN` against a named existing contract field. | Field availability, validity, or usable value.           |

### 3.3 Linkage, rights, and access facts

| Field               | Required when a record is permitted | Permitted content                                                                                                  | Explicitly not implied                                            |
| ------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| `propertyLinkFacts` | No                                  | Link facts expressly stated by the candidate or owner.                                                             | Legal or factual identity of the subject property.                |
| `linkageStatus`     | Yes                                 | `LINK_FACTS_RECORDED`, `LINK_INCOMPLETE`, `LINK_CONFLICT_RECORDED`, or `NOT_ASSESSED`.                             | Eligibility for calculation or partial valuation.                 |
| `accessFacts`       | Yes                                 | `PUBLIC_REFERENCE_STATED`, `ACCOUNT_OR_AUTHENTICATION_STATED`, `UNKNOWN_ACCESS`, or a free-text factual statement. | Authorization to access or create an account.                     |
| `rightsFacts`       | Yes                                 | A stated licence/terms reference, `UNVERIFIED_RIGHTS`, or `UNRESOLVED_RIGHTS`.                                     | Access, processing, retention, sharing, or deployment permission. |
| `usageRestrictions` | Yes                                 | Known restrictions stated without interpretation.                                                                  | A legal opinion or a clearance decision.                          |

### 3.4 Gaps, review, and decision state

| Field                     | Required when a record is permitted | Permitted content                                                                           | Explicitly not implied                                                    |
| ------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `gapRegister`             | Yes                                 | Descriptive gaps for provenance, rights, linkage, time, transformation, review, or usage.   | A risk score, threshold, or priority score.                               |
| `descriptiveReviewStatus` | Yes                                 | `OBSERVED`, `INCOMPLETE`, `CONFLICT_RECORDED`, `NOT_ASSESSED`, or `NON_INDEPENDENT_REVIEW`. | Price correctness, fairness, anomaly, confidence, or valuation usability. |
| `researchDecisionState`   | Yes                                 | `CANDIDATE_FOR_GATE`, `HOLD`, or `REJECTED_FROM_REGISTRY`.                                  | Production approval, data collection approval, or method availability.    |
| `decisionRationale`       | Yes                                 | Plain-language factual rationale, including unresolved items.                               | A waiver of a governing policy gate.                                      |
| `ownerDecisionReference`  | Yes                                 | Explicit owner approval that opened the source-specific gate.                               | A blanket approval for any other source.                                  |
| `recordedBy`              | Yes                                 | Actor or role that recorded the facts.                                                      | Independent review.                                                       |
| `recordedAt`              | Yes                                 | UTC timestamp.                                                                              | Source capture or effective time.                                         |
| `supersedes`              | No                                  | Identifier of a prior record or change log entry.                                           | Deletion of the prior record.                                             |

## 4. Blank record block

```yaml
candidateId: null
displayName: null
candidateClass: []
statedOwnerOrPublisher: null
publicReference: null
provenanceFacts: []
observedAt: null
statedEvidenceType: null
statedCoverageFacts: []
statedUnitCurrencyPeriod: []
declaredTimeFacts: []
potentialContractFieldMentions: []
propertyLinkFacts: []
linkageStatus: NOT_ASSESSED
accessFacts: UNKNOWN_ACCESS
rightsFacts: UNRESOLVED_RIGHTS
usageRestrictions: []
gapRegister: []
descriptiveReviewStatus: NOT_ASSESSED
researchDecisionState: HOLD
decisionRationale: "No source-specific gate has been approved."
ownerDecisionReference: null
recordedBy: null
recordedAt: null
supersedes: null
```

The null and holding values above are template defaults, not values assigned to an actual candidate.

## 5. Phase-A validation checklist

Before the template is approved for Phase A closure, confirm each statement below.

| Check                    | Required result                                                                                                                   |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Candidate records        | No named candidate, provider, URL, artifact, or data value has been entered.                                                      |
| Non-interference         | No code, runtime, API, schema, data store, DLD row, engine, methodology, weight, coefficient, or valuation output has changed.    |
| DLD safeguard            | The template states that eligible local DLD sales evidence remains mandatory.                                                     |
| Rights safeguard         | Access and rights facts are distinct; no field infers a permission from public visibility.                                        |
| Time safeguard           | Observation, effective, reporting-period, capture, and `asOf` facts remain distinct.                                              |
| Transformation safeguard | The template records descriptions only; it contains no FX, unit, period, escalation, normalisation, or other transformation rule. |
| Decision safeguard       | The only permitted states are `CANDIDATE_FOR_GATE`, `HOLD`, and `REJECTED_FROM_REGISTRY`.                                         |
| Audit safeguard          | The change log is append-only and no record may be silently overwritten or deleted.                                               |

## 6. References

[1]: ../policies/NON-SALES-EVIDENCE-SOURCES-RESEARCH-GOVERNANCE-POLICY.md "NSE-RG-v1.0"
[2]: ../ADR/ADR-011-canonical-frozen-valuation-methodology-v1-2.md "ADR-011"
[3]: CALC-013-M03-M04-EVIDENCE-ACQUISITION-VALIDATION-PROTOCOL-2026-08-20.md "M-03/M-04 evidence-acquisition and validation protocol"
