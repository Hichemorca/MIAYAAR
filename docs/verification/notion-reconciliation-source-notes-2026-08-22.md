# Notion reconciliation — source notes

## Source A — linked Notion root page

- **Title:** MIAYAAR Investment Master Repository
- **URL:** https://app.notion.com/p/3b29d2cffb0c81eaa072f2b9ab104cb0
- **Observed through Notion MCP:** 2026-08-05T08:23:39.985Z (as reported by Notion)
- **Retrieved for reconciliation:** 2026-08-22

### Source-authority statements (quoted/paraphrased faithfully)

1. The page describes itself as the single source of truth for investment-related
   documents and states that the sibling **AQAR Research Institute** remains the
   technical source of truth for methodologies, formulas, data standards, and
   validation.
2. It classifies this repository as business and investment knowledge rather than
   a pitch deck or technical methodology source; technical statements are meant
   to reference, not restate, the Research Institute.
3. The product is called **MIAYAAR Valuation Intelligence Engine** in this
   Investment Repository; the rename is not claimed as retroactively applied to
   the Research Institute, methodology pages, formula references, or code
   comments.
4. It positions MIAYAAR as a Decision Intelligence Company and presents the
   hierarchy: Decision Intelligence Platform → Decision Intelligence Engines →
   Industry Solutions → MIAYAAR Valuation Intelligence Engine.
5. It expressly says no financial projections, market sizing, revenue, pricing,
   funding, or customer figures have been invented. Missing information is
   separated into Verified Information, Assumptions, Future Research, and Open
   Questions.
6. It says **Market & Competitive Landscape** is deliberately named to avoid
   collision with the AQAR Market Intelligence Program documented in the
   Research Institute.
7. It identifies these linked top-level pages: About MIAYAAR, Business, Product,
   Market & Competitive Landscape, Intellectual Property, Investment,
   Governance, Decision Intelligence Manifesto, and MIAYAAR Ecosystem.
8. It states that its contents are not automatically investor-ready and that
   missing information should be represented as open questions rather than
   guesses.

### Reconciliation implication

The root page alone does not provide authoritative architecture, valuation
methodology, property applicability, weights, coefficients, Market Intelligence,
Comparable Selection, Diagnostics/Forensics, Temporal Backtesting, interface,
Admin/Governance, or Calibration Studio specifications. Those requested details
must be obtained from the linked Product/Governance pages and, where the page
itself directs, the sibling AQAR Research Institute; no technical requirement is
inferred from this root page.

## Source B — Product

- **Title:** Product
- **URL:** https://app.notion.com/p/3b29d2cffb0c81fb9b63cbb4449da430
- **Observed through Notion MCP:** 2026-08-05T08:22:58.208Z (as reported by Notion)
- **Retrieved for reconciliation:** 2026-08-22

### Source-authority statements

1. Product is a navigation page for Platform Overview & Architecture, Current
   Products, Roadmap & Future Products, Technology & AI Overview, and Future
   Decision Engines.
2. It identifies two current products: the MIAYAAR Valuation Intelligence Engine
   and the Market Intelligence Engine.
3. It directs technical claims to the AQAR Research Institute instead of
   independently defining implementation requirements.

## Source C — Platform Overview & Architecture

- **Title:** Platform Overview & Architecture
- **URL:** https://app.notion.com/p/3b29d2cffb0c81a7a6f0f7df085d0ce6
- **Observed through Notion MCP:** 2026-08-04T10:29:47.912Z (as reported by Notion)
- **Retrieved for reconciliation:** 2026-08-22

### Source-authority statements

1. The page states a reusable pipeline pattern: raw data, collection, cleaning,
   validation, normalization, feature engineering, modelling, confidence
   assessment, decision output, and business intelligence.
2. It identifies a real-government-data layer, a Research Institute governance
   layer, and an application layer with two current products.
3. It describes a Netlify-hosted web application, Node.js/JavaScript pipeline
   scripts, a Python ML experimentation track, and static/generated artifacts.
4. It directs full technical detail to the AQAR Research Institute and says this
   investor/partner-facing page is not itself the technical implementation
   authority.

### Reconciliation implication

The architectural pipeline is a high-level reference only. No stage ordering,
formula, confidence rule, field contract, property applicability rule, or
implementation requirement may be inferred from it before comparison with the
repository's governing documents and the directed Research Institute sources.

## Source D — Current Products

- **Title:** Current Products
- **URL:** https://app.notion.com/p/3b29d2cffb0c81c9bedce93a0ac1d343
- **Observed through Notion MCP:** 2026-08-04T10:29:47.934Z (as reported by Notion)
- **Retrieved for reconciliation:** 2026-08-22

### Source-authority statements

1. The page describes a valuation product using Sales Comparison, Income
   Capitalization, Cost/Replacement, and DCF approaches in a weighted hybrid,
   and separately mentions a comparable-transaction backtesting engine.
2. It cites **AQAR Property Valuation Methodology v1.0**, reports that two
   structurally different valuation engines exist under the product name, and
   says their reconciliation is unresolved by the Research Committee.
3. It describes district and district-by-property-type market analytics and
   names price growth, temporal volatility, liquidity, Bubble Risk, and an
   Investment Score composite. It directs the detail to the Research Institute
   Market Intelligence Program and a July 2026 scientific review.
4. It identifies reconciliation of the two engines and consumer-engine
   backtesting as future improvements.

### Reconciliation implication

The cited valuation version (`v1.0`), the two-engine statement, the reported
historical accuracy, and the named market composite metrics cannot be adopted
as current implementation requirements. They require direct comparison with
the repository's frozen v1.2 methodology and approved governance record; any
disagreement is a `CONFLICT / GOVERNANCE REVIEW`, not a prompt for changes.

## Notion navigation correction

The Product page supplies the accessible Roadmap & Future Products URL as
https://app.notion.com/p/3b29d2cffb0c815d9e74f02037450155. An earlier attempt
used a different identifier and returned Notion `object_not_found`; that failed
identifier is not treated as evidence.

## Source E — Roadmap & Future Products

- **URL:** https://app.notion.com/p/3b29d2cffb0c815d9e74f02037450155
- **Observed through Notion MCP:** 2026-08-04T10:29:47.955Z (as reported by Notion)
- **Retrieved for reconciliation:** 2026-08-22

### Source-authority statements

1. The page labels its roadmap as investor-facing context carried over from the
   Research Institute, not newly derived technical scope.
2. It lists geographic expansion targets, thematic indices, advanced analytics,
   and distribution channels; it says geographic work depends on market-specific
   data-source work.
3. It explicitly labels the dates as prior planning targets rather than
   reconfirmed commitments, and asks that they be reconfirmed against current
   resourcing.

### Reconciliation implication

These entries are strategic references, not approved implementation work. No
date, country expansion, index, analytics feature, channel, or external
integration is treated as a repository requirement absent a current owner scope
and a compatible policy gate.

## Source F — Investment Master Repository authority boundary

- **URL:** https://app.notion.com/p/3b29d2cffb0c81eaa072f2b9ab104cb0
- **Observed through Notion MCP:** 2026-08-05T08:23:39.985Z (as reported by Notion)
- **Retrieved for reconciliation:** 2026-08-22

### Source-authority statements

1. The page calls itself the business and investment source of truth, while
   declaring the sibling AQAR Research Institute the technical source of truth
   for methodologies, formulas, data standards, and validation.
2. It says technical claims should reference Research Institute material rather
   than be restated independently.
3. It marks the flagship product name as MIAYAAR Valuation Intelligence Engine,
   while noting that the old AQAR naming was not retroactively changed inside
   the Research Institute.
4. It separates verified information, assumptions, future research, and open
   questions; it explicitly warns that investor-facing pages are not finished
   technical or investment deliverables.

### Reconciliation implication

The linked Investment Repository is a legitimate business-reference input but
not itself authoritative for a methodology, formula, field contract, or
validation claim. Direct Research Institute pages must be retrieved where a
technical statement is proposed for reconciliation; until then, the matrix uses
`SOURCE-GAP / GOVERNANCE REVIEW` rather than assuming the investment summary is
binding.

## Source G — MIAYAAR Ecosystem

- **URL:** https://app.notion.com/p/3b29d2cffb0c81c3a1a0de07ffd5f88a
- **Observed through Notion MCP:** 2026-08-04T10:43:43.725Z (as reported by Notion)
- **Retrieved for reconciliation:** 2026-08-22

### Source-authority statements

1. The page identifies the existing **AQAR Research Institute** as the technical
   source of truth for methodologies, formulas, data standards, and validation.
2. It identifies the linked Investment Repository as the business and investment
   source of truth, and says the two existing repositories are cross-linked
   rather than duplicating their respective content.
3. It describes Product, Corporate, Marketing, Legal, and Strategy repositories
   as future categories rather than current technical sources or commitments.

### Reconciliation implication

The linked Notion repository confirms the authority boundary but does not expose
the directed Research Institute material itself. The requested extraction of
technical methodology, formulas, applicability, and validation requirements is
therefore incomplete until the AQAR Research Institute is linked or made
accessible. This is recorded as `SOURCE-GAP / GOVERNANCE REVIEW`, not inferred
from the Investment Repository.

## Source H — AQAR Research Institute

- **URL:** https://app.notion.com/p/3ac9d2cffb0c81eb9b6ed1a8e53d0085
- **Observed through Notion MCP:** 2026-07-30T21:53:28.035Z (as reported by Notion)
- **Retrieved for reconciliation:** 2026-08-22

### Source-authority statements

1. The page identifies itself as the institutional home for AQAR methodology,
   models, standards, formulas, datasets, and research outputs. It describes
   two distinct programs: **Market Intelligence** for composite market indices
   and **Valuation Intelligence** for single-property appraisal.
2. It names Sales Comparison, Income Capitalisation, Cost, and DCF as the four
   valuation approaches in the Valuation Intelligence program.
3. It attributes earlier institutional debt to incompatible proximity formulas,
   confidence models, liquidity definitions, unused models, and a silently
   failing automation pipeline. It requires shared research-governance,
   standards, formula, data-definition, model-registry, and validation
   infrastructure rather than per-program duplication.
4. It states that the AQAR Decision Engine belongs to the ORCA Research
   Framework and evolves independently. This is a scope statement; it does not
   authorise any change to MIAYAAR's frozen valuation engine.
5. The page links Valuation Intelligence, Market Intelligence, Research
   Governance, Research/Data/Statistical Standards, Validation Center, Formula
   Library, Data Dictionary, Model Registry, Knowledge Graph & Ontology, and a
   Research Decision Log. It says migration is in progress as of July 2026.

### Reconciliation implication

This page confirms the technical-source boundary and the existence of detailed
child sources. It does not itself define MIAYAAR v1.2 weights, coefficients,
field contracts, property applicability, diagnostics, temporal backtesting,
interface requirements, governance permissions, or Calibration Studio scope.
Those requirements must be extracted from the linked child pages and then
compared with the frozen repository artefacts. The migration-in-progress status
also requires every child-page claim to be assigned a source/status category
rather than adopted automatically.

## Source I — AQAR Property Valuation Methodology v1.0

- **Title:** AQAR Property Valuation Methodology v1.0
- **URL:** https://app.notion.com/p/3ac9d2cffb0c81d48b05d473c56f1e0c
- **Observed through Notion MCP:** 2026-07-30T21:51:05.515Z (as reported by Notion)
- **Retrieved for reconciliation:** 2026-08-22
- **Declared status in the source:** Draft — reconstructed from source code, not
  yet Committee-approved; the source says it was created because no prior
  methodology document existed.

### Source-authority statements

1. The document records two structurally different, unresolved engines under
   the AQAR brand: a server-side comparable-median backtest engine and a
   client-side four-method weighted-hybrid consumer engine. It expressly says a
   Research Committee decision is required before these become one methodology.
2. The backtest engine records a project/district and size-category hierarchy,
   specified minimum comparable counts, leave-one-out exclusion, a recency
   weight `max(0.15, 1 - age_days / 180)`, and a weighted-median price-per-sqm
   estimate multiplied by subject area. It also records static consultancy and
   GIS adjustment layers, and identifies the underlying cap-rate, vacancy, and
   GIS sources/derivations as unsupported or name-based rather than
   property-coordinate evidence.
3. The consumer engine records Sales Comparison, Income Capitalization, Cost,
   and DCF approaches with weights of 0.40, 0.35, 0.15, and 0.10 respectively.
   It describes detailed adjustment factors, market-data defaults, a ten-year
   DCF, an additive GIS multiplier, weighted averaging over available methods,
   and an additive confidence heuristic. The source labels multiple calibration
   rows and the confidence model as unvalidated/heuristic and states that this
   engine had not been backtested against real transactions.
4. The source reports a single July 2026 backtest result for Engine 1 and says
   the protocol should be rerun under the Validation Center. It does not claim
   a Committee-approved validation record for Engine 2.

### Reconciliation implication

This is direct technical-source material but it is explicitly a **draft,
source-code reconstruction with unresolved two-engine divergence**. Every
formula, coefficient, hierarchy, adjustment, default, threshold, confidence
rule, and claimed backtest outcome in this page is therefore a historical
Notion statement only. It cannot override the repository's frozen MIAYAAR
methodology v1.2, Core Types Freeze, approved Comparable Selection policy, or
Evidence-led no-fallback rule. The matrix must record these items as
`CONFLICT / GOVERNANCE REVIEW` or `NOT ADOPTED` rather than treating them as
missing implementation work.

## Source J — Market Intelligence Program

- **Title:** Market Intelligence Program
- **URL:** https://app.notion.com/p/3a89d2cffb0c8159a3c7fbdf9acfb6d7
- **Observed through Notion MCP:** 2026-07-29T21:40:06.633Z (as reported by Notion)
- **Retrieved for reconciliation:** 2026-08-22

### Source-authority statements

1. The page defines the program as composite, market-level indices concerning
   emirates, districts, or segments, and explicitly distinguishes this scope
   from single-property appraisal in the Valuation Intelligence Program.
2. It describes a five-tier AQAR Index System: Market, Investment, Risk, Demand
   & Supply, and Regional/Specialty. The stated implementation concept is
   value-weighted, chain-linked composite indices aggregated from DLD
   transactions at district/emirate level.
3. It says the program follows shared Institute Research, Data, Statistical, and
   Governance Standards rather than maintaining separate copies.
4. As of July 2026, it identifies AQAR Index Methodology v1.0 as a **Draft for
   Review** and states that none of the Tier 1–5 indices specified by that
   methodology had been calculated against real data.

### Reconciliation implication

The repository's implemented Market Intelligence v1.0 is an evidence-led,
DLD-only benchmark service, not an implementation of the five-tier composite
index system. The distinction in source scope is material: the composite-index
taxonomy, weighting/chaining model, and any Tier 1–5 outputs are not approved
MIAYAAR requirements and cannot be inferred as a gap. They require direct
comparison with the repository governance record and a new Policy Gate; until
then they are `SOURCE-GAP / GOVERNANCE REVIEW` or `NOT ADOPTED`, not a basis for
new market metrics, scores, or thresholds.

## Source K — Valuation Intelligence Program

- **Title:** Valuation Intelligence Program
- **URL:** https://app.notion.com/p/3ac9d2cffb0c81fbbfb2d3eee2c3fc10
- **Observed through Notion MCP:** 2026-07-29T21:40:45.285Z (as reported by Notion)
- **Retrieved for reconciliation:** 2026-08-22

### Source-authority statements

1. The page scopes the program to individual-property appraisal and lists Sales
   Comparison, Income Capitalization, Cost (Replacement), and DCF in a weighted
   hybrid, plus a comparable-transaction backtesting engine intended to measure
   accuracy.
2. It says the program's logic was extracted from the `aqar-evaluate-engine`
   codebase during the July 2026 Architecture Review because prior methodology,
   weights, and calibration constants existed only in two unreconciled engines.
3. It declares an open Research Committee decision: formally merge the
   leave-one-out comparable-median backtest engine and four-method hybrid
   consumer engine, or formalize them as two separately validated methodologies
   with an explanation for their difference.
4. It places the program under shared Institute research, data, statistical,
   validation, formula-library, model-registry, and governance departments.

### Reconciliation implication

The page corroborates the unresolved status captured in Source I; it does not
supersede the frozen MIAYAAR v1.2 methodology. In particular, its historical
consumer-engine weighting, source-code calibration, and backtest-engine
hierarchy cannot be recorded as a missing MIAYAAR implementation. The matrix
must preserve the distinction between the implemented v1.2 evidence-led engine
and the Notion program's unresolved historical architecture as
`CONFLICT / GOVERNANCE REVIEW`.

## Source L — Research Governance

- **Title:** Research Governance
- **URL:** https://app.notion.com/p/3a89d2cffb0c81358a1dcd6724f6b1b5
- **Observed through Notion MCP:** 2026-07-30T21:49:53.555Z (as reported by Notion)
- **Retrieved for reconciliation:** 2026-08-22

### Source-authority statements

1. The page presents a research governance model in which methodology documents
   are the source of truth and code is an implementation; it states that a code
   change alone is not a methodology change.
2. It requires contribution traceability, document review statuses (`Draft` →
   `Internal Review` → `Expert Review` → `Approved` → `Archived`), and dated
   Decision Records for material decisions.
3. It specifies a Research Committee change process involving proposal, impact
   analysis, consultation, decision, publication, and delayed implementation;
   its versioning table associates parameter/weight changes with a minor version
   and requires historical restatement under the stated conditions.
4. It describes an audit trail for calculation steps and governance decisions,
   model-deployment validation before customer-facing claims, provenance and
   synthetic-data policies, and failure-alerting requirements for scheduled
   pipelines.
5. Several clauses are framed for an AQAR Institute and index-publication
   environment, including quarterly/annual audit cadence, public-comment timing,
   monthly publication, subscription access, and index deprecation rules.

### Reconciliation implication

The repository already implements its own governing record: frozen v1.2,
read-only governance surface, decision/audit evidence, and explicit owner
approval boundaries. The Notion page provides reference governance intent, but
does not automatically create a MIAYAAR methodology-editing path, a Calibration
Studio, automated recurring processes, external publication workflow, or new
roles. Clauses compatible with existing traceability are `IMPLEMENTED` or
`PARTIAL` only after direct repository verification; clauses that imply edits to
weights, methodology, or scheduled publication remain `CONFLICT / GOVERNANCE
REVIEW` or `OUT OF SCOPE`.

## Source M — Validation Center

- **Title:** Validation Center
- **URL:** https://app.notion.com/p/3ac9d2cffb0c81e0b38bda8c8650b10c
- **Observed through Notion MCP:** 2026-07-30T21:53:02.399Z (as reported by Notion)
- **Retrieved for reconciliation:** 2026-08-22

### Source-authority statements

1. The page prohibits customer-, investor-, dashboard-, export-, or whitepaper-
   facing accuracy/validation/AI claims without a Validation Center-approved
   backtest, and requires any synthetic, simulated, or placeholder figure to be
   labelled at point of display.
2. It describes the historical comparable-median result as one in-sample,
   leave-one-out run; identifies the four-method hybrid as never backtested;
   records a single time-based split for a separate XGBoost model; and states
   the AQAR Index System had not been calculated against real data.
3. It calls for future validation dimensions, including scientific,
   mathematical, real-estate, field, and benchmark validation, with several
   recorded as not yet conducted.
4. It also publishes numeric validation thresholds for any index or model
   claiming production status. The page describes those thresholds as inherited
   from Statistical Standards and as applicable once validation is performed.

### Reconciliation implication

The requirements for transparent validation status, auditable results, and
synthetic-data disclosure are compatible in principle with MIAYAAR's
evidence-led governance. However, the specific historical results, proposed
validation protocol, and numeric thresholds are Notion-era AQAR material and
are not automatically MIAYAAR acceptance criteria. No performance claim,
threshold, backtest design, or synthetic-data handling rule may be introduced
into the frozen engine or UI without an owner-approved governance scope. The
matrix must mark the absence of a temporal-backtesting feature as
`FUTURE / GOVERNANCE REVIEW`, not as a defect requiring immediate changes.

## Source O — Data Dictionary

- **Title:** Data Dictionary
- **URL:** https://app.notion.com/p/3ac9d2cffb0c81668817c8b158c8f5ba
- **Observed through Notion MCP:** 2026-07-30T21:52:45.665Z (as reported by Notion)
- **Retrieved for reconciliation:** 2026-08-22

### Source-authority statements

1. The page describes a field-template migration where unknown metadata is left
   blank rather than guessed. It documents historical AQAR JSON data and model
   fields, rather than asserting MIAYAAR contract compatibility.
2. It defines historical DLD-style fields including `propertyRef`,
   `transactionNumber`, free-text `district`, `propertyType`/`propSubType`,
   area variants, `actualSalePrice`, off-plan/freehold flags, district-level GIS
   data, backtest-derived comparable fields, and valuation-deviation outputs.
3. It explicitly labels an `appraiserValuation` field as synthetic and says it
   must be disclosed wherever displayed or exported. It also records historical
   external consultancy, government, and developer data as static/hand-entered
   or insufficiently cited.
4. It describes a historical market-intelligence v3.0 data model with segment,
   growth, volatility, dispersion, confidence, Bubble Risk, Investment Score,
   and anomaly-warning fields; the page itself associates several values with
   derived composite logic and threshold rules.

### Reconciliation implication

Notion field names such as `propertyRef`, `actualSalePrice`, `saleDate`, and
`transactionNumber` must be checked against the repository's real DLD schema;
they must not be mapped by assumption. The historical synthetic field, static
external assumptions, score fields, and index-specific metrics are expressly
outside the approved MIAYAAR evidence pipeline unless an existing governing
artefact independently proves them. Any mismatch is a contract/source conflict
or source gap, not a justification to alter frozen types or seed new data.

## Source N — owner-supplied Clarification & Policy Reconciliation attachment

- **File:** `/home/ubuntu/upload/pasted_content.txt`
- **Provided by:** project owner
- **Read for reconciliation:** 2026-08-22

### Source-authority statements

1. The attachment reaffirms the non-negotiable boundaries: preserve methodology
   v1.2, frozen Core Types/contracts, current engine, evidence pipeline,
   reproducibility, and historical data; do not invent fallbacks, thresholds,
   scores, coefficients, or reopen closed decisions.
2. It defines a future Calibration Studio as a governed draft/backtest/review/
   approval/version workflow. It must not alter production methodology,
   parameters, or weights now; an approved configuration must be versioned,
   auditable, and reproducible.
3. It requires an Admin/Governance boundary where methodology settings are
   read-only while frozen. It calls for versioning and audit records but does not
   authorise current live editing of weights, coefficients, thresholds, formulas,
   field applicability, or market configuration.
4. It requires a documented Property Type × Method × Field Applicability model
   whose values are extracted from approved methodology, not guessed by UI code;
   unresolved cells must remain `UNRESOLVED`.
5. It distinguishes domain-field existence, policy applicability, UI visibility,
   validation, and API payload. It requires method applicability to remain
   distinct from a method's successful/insufficient-evidence result.
6. It describes target product surfaces and boundaries for Market Intelligence,
   Diagnostics/Forensics, Temporal Backtesting, and the valuation workspace. It
   expressly forbids automatic diagnostic price adjustment and automatic
   production-parameter changes from backtesting.
7. It directs creation of an execution-reconciliation document before further
   implementation and asks that every item be classified as `APPROVED`,
   `DOCUMENTED`, `INFERRED`, or `UNRESOLVED`.

### Reconciliation implication

The attachment is an owner-supplied governing clarification for the
reconciliation exercise. It adds no approved value to any previously frozen
methodology rule, matrix cell, threshold, coefficient, API contract, or
production configuration. Where it establishes a boundary, the matrix records
it directly; where it requests a substantive design that lacks an approved
methodology source, the result remains `UNRESOLVED / GOVERNANCE REVIEW`.

## Source P — property classification and applicability search result

- **Search query:** `Property Classification Standard methodology applicability`
- **Searched through Notion MCP:** 2026-08-22

### Observation

The search returned the existing AQAR v1.0 methodology, Data Dictionary,
research/technical standards, future-methodology index, and programme overview.
It did **not** return a standalone Property Classification Standard or a
property-type × method × field applicability table. The only directly relevant
reference describes the historical AQAR property type/subtype as a DLD-sourced
field and directs readers to a standard that is not available in the indexed
Notion results.

### Reconciliation implication

The requested MIAYAAR matrix cannot safely be populated from a missing Notion
standard or inferred from property names. The reconciliation may show existing
repository behaviour as implemented, but any cell not explicitly supported by
MIAYAAR methodology v1.2 and current contracts must be recorded as
`UNRESOLVED / GOVERNANCE REVIEW`.
