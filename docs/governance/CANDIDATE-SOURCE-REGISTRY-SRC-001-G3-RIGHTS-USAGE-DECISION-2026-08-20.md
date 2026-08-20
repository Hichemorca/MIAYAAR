# SRC-001 — G-3 Rights and Usage Suitability Decision

**Candidate:** `CAND-2026-001` / `SRC-001` — Bayut – UAE Property Search
**Gate:** `G-3` — written governance decision on rights and limited suitability
**Decision state:** `HOLD`
**Governing policy:** `NSE-RG-v1.0`
**Scope:** `M-03/M-04` research governance only
**Recorded at:** `2026-08-20T06:23:33Z`
**Recorded by:** Manus AI
**Owner decision reference:** Owner approval, expressed as `Go`, following the approved three-line G-3 scope in this task
**Basis limited to:** the merged Phase C fact record and internal governance documents; no new source access, data collection, provider contact, licence request, legal interpretation, or rights verification occurred

> **Decision:** `SRC-001` remains recorded but is placed in `HOLD` for any activity that would access, collect, process, retain, share, deploy, or use source content. This is not a rejection of the candidate and is not a legal opinion. It is a governance result: the Phase C facts document visible restrictions and no source-specific permission or licence for MIAYAAR; unresolved rights cannot be inferred from public visibility. [1] [2]

## 1. Decision boundary

This decision evaluates only the governance consequences of rights and usage facts already preserved in the Phase C record. It does not decide whether the source's terms are legally valid, whether a licence could be obtained, whether any company relationship is correct, or whether any content would be suitable, sufficient, accurate, current, or lawful for a future use.

No use case has been authorised through this decision. In particular, the candidate is not approved for browsing beyond the prior three references, account creation, sign-in, registration, acceptance of terms, download, API access, scraping, automation, collection, extraction, processing, retention, sharing, deployment, production testing, contract validation, or valuation. Eligible local DLD sales evidence remains mandatory and cannot be replaced by this candidate. [2] [3]

## 2. Decision inputs preserved from Phase C

| Phase C fact                                                                                                     | Governance treatment in G-3                                                                                                | Not inferred                                                                     |
| ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| The terms identify a personal, limited, non-transferable, non-exclusive, revocable right subject to compliance.  | Records a visible usage restriction. It does not create an MIAYAAR permission decision.                                    | Any right to collect, process, retain, share, deploy, or use content.            |
| The terms state that commercial use requires a licence.                                                          | No licence is recorded for MIAYAAR; this blocks a positive usage-suitability conclusion.                                   | That isolated research governance is permitted commercial or non-commercial use. |
| The terms state restrictions against scraping and creating collections, compilations, databases, or directories. | The existing prohibition on automated and collection activity remains in force for this candidate.                         | An exception, waiver, or permission for an alternative collection method.        |
| The privacy statement describes personal-data processing in the Platform relationship.                           | Source- and jurisdiction-specific privacy, retention, deletion, access, sharing, and cross-border terms remain unresolved. | That no privacy obligations apply to a future artefact or workflow.              |
| The owner-supplied publisher differs from the visible operator/owner/controller statement.                       | The provenance discrepancy remains `CONFLICT_RECORDED`.                                                                    | Corporate identity, affiliation, ownership, or authority to grant rights.        |
| The public references rendered and guest browsing is stated.                                                     | `PUBLIC_REFERENCE_STATED` remains an access fact only.                                                                     | Permission to create an account, retrieve content, or use content.               |

The facts in this table are restatements of the Phase C record, not a new review of the provider's website or its terms. [1]

## 3. G-3 decision record

```yaml
candidateId: CAND-2026-001
rightsFacts: UNVERIFIED_RIGHTS
usageRestrictions:
  - "Phase C recorded visible terms that state commercial use requires a licence."
  - "Phase C recorded visible terms that restrict scraping and the creation of collections, compilations, databases, and directories."
  - "No MIAYAAR-specific licence, written permission, or rights clearance is recorded."
  - "Public visibility remains an access fact, not evidence of rights to process, retain, share, deploy, or use content."
gapRegister:
  - "Publisher/operator identity conflict remains unresolved."
  - "No rights holder or authorised grantor for any MIAYAAR use has been established."
  - "Access, processing, retention, deletion, sharing, access-class, and cross-border terms remain unresolved."
  - "No source-specific privacy and jurisdiction decision exists for an actual artefact."
descriptiveReviewStatus: NON_INDEPENDENT_REVIEW
researchDecisionState: HOLD
decisionRationale: "Visible restrictions and the absence of a source-specific licence or permissions record do not support a positive usage-suitability conclusion. The candidate remains in the registry with its rights and governance gaps explicit."
ownerDecisionReference: "Owner approval, expressed as Go, following the approved three-line G-3 scope in this task."
recordedBy: Manus AI
recordedAt: 2026-08-20T06:23:33Z
supersedes: null
```

`NON_INDEPENDENT_REVIEW` means that this governance decision has not been reviewed by a separate, approved independent reviewer. It does not invalidate the recorded facts; it preserves the absence of an approved independent-review path. [4]

## 4. Consequences of `HOLD`

`HOLD` keeps the candidate and its audit history in the registry without deeming it rejected, approved, trusted, sufficient, or usable. It does not permit an implicit next step. In particular, it does not open the Phase D descriptive contract-alignment activity, source contact, a licence discussion, or any collection proposal. Each of those would require a separately approved scope and, where applicable, a newly defined source-specific gate. [3] [4]

Before a positive usage-suitability decision could be considered, a future source- and jurisdiction-specific decision would need to identify or explicitly preserve as unresolved: the permitted research purpose; access right; processing right; retention duration; deletion handling; access classes; sharing controls; cross-border conditions; and the authority and scope of any licence or written permission. The present decision does not invent any answer, fallback, period, threshold, or contractual interpretation for those topics. [2]

## 5. Non-interference statement

No code, API, database schema, database record, DLD transaction row, production evidence log, source connector, scheduled job, Valuation Engine, methodology v1.2, method weight, coefficient, comparable-selection rule, confidence logic, user interface, or valuation output has changed. No source artefact or market data was added to the repository, database, or evidence log. [2] [3]

## References

[1]: CANDIDATE-SOURCE-REGISTRY-SRC-001-PHASE-C-PROVENANCE-RIGHTS-2026-08-20.md "SRC-001 — Phase C Passive Provenance and Rights Fact Record"
[2]: ../policies/NON-SALES-EVIDENCE-SOURCES-RESEARCH-GOVERNANCE-POLICY.md "NSE-RG-v1.0"
[3]: ../../../../miayaar-candidate-evidence-source-registry-work-plan.md "MIAYAAR — Candidate evidence-source registry work plan"
[4]: CANDIDATE-NON-SALES-EVIDENCE-SOURCE-REGISTRY-GLOSSARY.md "Candidate non-sales evidence-source registry glossary"
