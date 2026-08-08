# MIAYAAR Decision Intelligence Platform

# Architecture Reference Document v1.0

---

## 1. Vision

MIAYAAR is a decision intelligence platform purpose-built for the Dubai real estate market. The architecture enables the systematic transformation of raw market data into actionable decision insights through a composable engine ecosystem.

The platform treats valuation as the initial capability, with architectural provisions for investment analysis, risk assessment, negotiation support, portfolio optimization, and market intelligence as native extensions of the same decision fabric.

---

## 2. Architectural Principles

- **Single Responsibility:** Every engine addresses exactly one domain concern.
- **Loose Coupling:** Engines communicate only through the Orchestrator.
- **High Cohesion:** Related functionality resides within the same engine.
- **Technology Agnostic:** Interfaces define contracts, not implementations.
- **Deterministic Core:** Valuation pipeline produces reproducible results.
- **Engine Independence:** Engines may be developed, deployed, and scaled independently.
- **Configuration Driven:** Business rules and parameters are externalized.
- **Open for Extension:** New capabilities added without modifying existing engines.
- **Testability:** Each component testable in isolation.

---

## 3. High-Level Architecture
┌─────────────────────────────────────────────────────────┐
│ PRESENTATION LAYER │
└───────────────────────────┬─────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│ API / ORCHESTRATOR │
│ (Workflow Coordination) │
└───────────┬─────────────────────────────────┬───────────┘
│ │
▼ ▼
┌───────────────────────┐ ┌───────────────────────┐
│ DATA ENGINE │ │ RULES ENGINE │
└───────────┬───────────┘ └───────────┬───────────┘
│ │
└───────────────┬─────────────────┘
▼
┌─────────────────────────────────────────────────────────┐
│ VALIDATION ENGINE │
└───────────────────────────┬─────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│ GIS ENGINE │
└───────────────────────────┬─────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│ VALUATION ENGINE │
└───────────────────────────┬─────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│ CONFIDENCE ENGINE │
└───────────────────────────┬─────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│ REPORTING ENGINE │
└───────────────────────────┬─────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│ FINAL RESPONSE │
└─────────────────────────────────────────────────────────┘


---

## 4. Core Domain Model

The domain model establishes the common language of the platform. All engines communicate using these standardized domain objects.

| Domain Entity | Responsibility |
|---------------|----------------|
| Property | Represents a real estate asset with attributes (size, type, age, amenities). Contains location reference and physical characteristics. |
| Comparable | Represents similar properties used for valuation reference. Contains transaction data, listing data, and similarity metrics. |
| MarketData | Represents market-wide indicators. Contains trends, indices, supply/demand metrics, and market sentiment. |
| Location | Represents geospatial context. Contains coordinates, administrative boundaries, proximity metrics, and neighborhood characteristics. |
| Valuation | Represents the valuation output. Contains value estimates, methodology applied, adjustment factors, and supporting calculations. |
| Confidence | Represents certainty assessment. Contains confidence scores, uncertainty bounds, data quality indicators, and risk flags. |
| Evidence | Represents supporting data for decisions. Contains data provenance, timestamps, source references, and validation status. |
| Report | Represents the final decision output. Contains structured results, narrative, visualizations, and metadata. |
| UserRequest | Represents the initial request. Contains parameters, context, user preferences, and required decision type. |

---

## 5. System Layers

### 5.1 Presentation Layer

Thin client interfaces that render decision outputs. No business logic. No valuation logic. Clients consume standardized APIs and display results.

### 5.2 API / Orchestrator Layer

The entry point for all platform interactions. Manages workflow execution. Does not perform calculations, validation, adjustments, or valuation logic. Coordinates engine execution only.

### 5.3 Engine Layer

All core decision engines. Each engine exposes a well-defined interface, accepts validated input, processes within its domain, and returns a standardized Result Object.

### 5.4 Data Provider Layer

Abstract interfaces to external data systems. Enables runtime switching of data sources without engine modification.

### 5.5 AI Layer (Optional)

Separate layer for artificial intelligence capabilities. Not part of the deterministic valuation pipeline. Contains recommendation engines, explanation services, LLM services, and prediction models. May be removed without affecting core valuation.

---

## 6. Core Engines

### 6.1 Data Engine

Ingests, validates, stores, and retrieves platform data. Maintains versioned data snapshots. Transforms provider-specific formats to canonical domain objects. No business logic, no valuation.

### 6.2 Validation Engine

Performs data integrity checks against defined rules and constraints. Validates completeness, range boundaries, cross-field consistency, and market-specific requirements. Outputs validation results and flags anomalous data.

### 6.3 GIS Engine

Computes geospatial relationships. Distance calculations, catchment areas, point-in-polygon, coordinate transformations, and geocoding. Provides spatial context through Location domain objects.

### 6.4 Rules Engine

Loads business rules from configuration. Evaluates policies, regulations, and market rules. Never owns business rules. Reads from configuration hierarchy. No hardcoded values. Deterministic, rule-based processing.

### 6.5 Valuation Engine

Consumes Property, Comparable, MarketData, and Location domain objects. Produces Valuation domain objects. Houses all valuation-specific logic. Never accesses data sources directly. Deterministic core capability.

### 6.6 Confidence Engine

Assesses confidence in decision outputs. Evaluates data quality, model certainty, input completeness, and contextual factors. Produces Confidence domain objects with scores and uncertainty bounds.

### 6.7 Reporting Engine

Constructs structured decision reports. Composes domain objects into coherent Report outputs. Handles templating and formatting. No analysis, no valuation, no calculations.

### 6.8 Future Engines

Investment Engine, Risk Engine, Negotiation Engine, Portfolio Engine, and Market Intelligence Engine follow the same patterns: single responsibility, Result Object output, Orchestrator-only communication, and technology independence.

---

## 7. Data Provider Layer

### 7.1 Interface Definition

| Contract Element | Description |
|------------------|-------------|
| fetch(parameters) | Retrieve data matching query parameters |
| validate(credentials) | Authenticate with the data source |
| transform(raw) | Convert source format to canonical domain objects |

### 7.2 Provider Implementations

- **DLD Provider:** Real estate transaction data from Dubai Land Department
- **Bayut Provider:** Listing data and market indicators
- **Property Finder Provider:** Listing data and market indicators
- **CSV Provider:** Bulk import capabilities
- **Future Providers:** Extensible through the same interface

### 7.3 Provider Lifecycle

Providers are initialized at system startup. The Orchestrator manages provider selection based on request parameters. The Valuation Engine receives pre-fetched, transformed domain objects through the interface, unaware of which provider supplied them.

---

## 8. Canonical Event Flow
┌─────────────────┐
│ USER REQUEST │
└────────┬────────┘
│
▼
┌─────────────────┐
│ VALIDATION │
└────────┬────────┘
│
▼
┌─────────────────┐
│ DATA │
└────────┬────────┘
│
▼
┌─────────────────┐
│ GIS │
└────────┬────────┘
│
▼
┌─────────────────┐
│ RULES │
└────────┬────────┘
│
▼
┌─────────────────┐
│ VALUATION │
└────────┬────────┘
│
▼
┌─────────────────┐
│ CONFIDENCE │
└────────┬────────┘
│
▼
┌─────────────────┐
│ REPORTING │
└────────┬────────┘
│
▼
┌─────────────────┐
│ RESPONSE │
└─────────────────┘


---

## 9. Result Object Standard

Every engine MUST return the same standardized Result Object structure.

### 9.1 Mandatory Structure

```json
{
  "status": "success" | "partial" | "error" | "pending",
  "data": { ...domain specific... },
  "warnings": [ ... ],
  "errors": [ ... ],
  "metadata": { ... }
}
9.2 Field Definitions
Field	Type	Required	Description
status	enum	Yes	Processing status of the engine
data	object	Yes	Engine-specific output payload containing domain objects
warnings	array	Yes	Non-critical issues encountered during processing
errors	array	Yes	Critical failures preventing complete processing
metadata	object	Yes	Processing metadata (timing, version, requestId)
9.3 Status Semantics
Status	Meaning
success	Engine completed normally with full output
partial	Engine completed with reduced output
error	Engine failed to complete processing
pending	Engine processing is in progress (async workflows)
9.4 Optional Extensions
Additional fields may be added to the Result Object by individual engines, provided they do not modify the mandatory structure.

10. Configuration Hierarchy
10.1 Configuration Layers
text
┌─────────────────────────────────────────────────────────┐
│                    CONFIGURATION                        │
│        (System-wide settings, infrastructure)           │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   METHODOLOGY                           │
│        (Valuation methods, adjustment rules)            │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   CALIBRATION                           │
│        (Model parameters, thresholds, weights)          │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  RUNTIME SETTINGS                       │
│        (Feature flags, overrides, A/B tests)           │
└─────────────────────────────────────────────────────────┘
10.2 Layer Responsibilities
Layer	Responsibility
Configuration	Infrastructure settings, logging levels, connection strings, service endpoints. Read at startup.
Methodology	Valuation approach definitions, adjustment rules, business policies. Versioned and audited.
Calibration	Model coefficients, threshold values, confidence parameters. Data-driven and periodically updated.
Runtime Settings	Feature flags, request-specific overrides, temporary adjustments. Dynamically changeable.
10.3 Configuration Principles
All configuration is external to engines

Engines read configuration at initialization and through refresh mechanisms

Critical configuration requires validation and versioning

Secrets managed through secure vaults

Default values for all parameters

11. Error Handling
11.1 Error Classification
Class	Description	Recovery Strategy
Transient	Temporary failures (network, timeout)	Retry with backoff
Data	Invalid, incomplete, or malformed data	Report to Orchestrator, continue with available data
Engine	Logic errors within an engine	Fail the engine, record in Result Object
Infrastructure	Hardware, network, dependency failures	Circuit breaker, failover
Security	Authorization, authentication failures	Reject request, log alarm
11.2 Error Propagation
Engine errors propagate to Orchestrator as Result Object with status error

Orchestrator evaluates whether workflow can continue or must fail

Error details are logged and returned to client as appropriate

Sensitive error details are sanitized for client visibility

11.3 Circuit Breaker Pattern
All engine calls use circuit breakers to prevent cascading failures. Open circuits short-circuit to fallback behaviors or error responses.

12. Logging Strategy
12.1 Log Levels
Level	Use
ERROR	Failures requiring human intervention
WARN	Degraded operations, recoverable issues
INFO	Normal operational events
DEBUG	Detailed diagnostic information
12.2 Structured Logging
All logs are structured JSON. Required fields: timestamp, level, service, requestId, message, context.

12.3 Correlation
Every request receives a requestId that propagates across all engine calls, enabling end-to-end tracing. Engine outputs include the requestId in metadata.

12.4 Retention
ERROR logs: 30 days

WARN logs: 14 days

INFO logs: 7 days

DEBUG logs: 1 day

Audit logs: As required by regulation

13. Security Considerations
13.1 Authentication & Authorization
API keys or JWT tokens for client authentication

Role-based access control for platform functions

Service-to-service authentication with mutual TLS or API keys

All authentication handled at Orchestrator level

13.2 Data Protection
Encryption in transit (TLS 1.2+)

Encryption at rest for stored data

PII and sensitive data classified and handled per policy

Data minimization: engines receive only required data

13.3 Access Control
Data provider credentials stored in secure vault

Temporary credentials rotated automatically

Audit trail of all data access requests

No hardcoded secrets in code or configuration

13.4 Compliance
Dubai real estate data handled per local regulations

Data sovereignty requirements respected

Audit logs maintained for compliance reporting

14. Testing Strategy
14.1 Test Pyramid
text
         ┌──────────┐
         │  E2E     │  (Few)
         ├──────────┤
         │Integration│ (Some)
         ├──────────┤
         │  Unit    │  (Many)
         └──────────┘
14.2 Unit Testing
Individual engines tested in isolation. Dependencies mocked. Result Objects validated against contract. Edge cases and failure modes covered.

14.3 Integration Testing
Engine-to-Orchestrator communication tested. Data Provider interface implementations validated. End-to-end flows with test data.

14.4 Performance Testing
Load testing for expected traffic. Latency targets defined. Memory and resource usage monitored. Degradation under load measured.

14.5 Chaos Engineering
Provider failures simulated. Engine outages tested. Circuit breaker behavior verified. Fallback paths validated.

15. Deployment Strategy
15.1 Deployment Model
Containerized engines for consistency

Orchestrator as separate service

Engines deployable independently

Blue-green deployments for zero-downtime

Rolling updates for engine releases

15.2 Scaling
Stateless engines scale horizontally

Stateful components handled appropriately

Auto-scaling based on request queue depth and CPU utilization

Cache layers reduce load on downstream engines

15.3 Environment Separation
Development environment with sample data

Staging environment with production-like data

Production environment with live data

16. AI Layer
16.1 Separation Principle
Artificial intelligence capabilities are isolated from the deterministic valuation core. The AI layer is optional and may be removed without affecting core decision processing.

16.2 AI Capabilities (Separate Layer)
Recommendation Engine: Provides property recommendations based on user preferences

Explanation Engine: Generates human-readable explanations of valuations

LLM Services: Natural language interfaces, document processing

Prediction Models: Forward-looking forecasts and trend analysis

16.3 Integration Pattern
AI services communicate through the Orchestrator using the same Result Object standard. The Orchestrator may call AI services as additional steps in the workflow, but the deterministic pipeline remains independent.

16.4 Design Constraint
No AI capability may be required for core valuation. All AI features are additive and optional.

17. Extension Policy
17.1 Open/Closed Principle
The architecture explicitly applies the Open/Closed Principle: Open for extension, closed for modification.

17.2 Adding New Engines
New engines implement standard interfaces

New engines return standardized Result Objects

New engines communicate only through the Orchestrator

Existing engines remain unmodified

17.3 Adding New Capabilities
Capabilities added as new engines or AI layer services

Orchestrator updated to include new workflow steps

No modifications to existing engines required

17.4 Adding New Data Providers
New providers implement Data Provider Interface

No engine modification required

Orchestrator configuration maps requests to providers

17.5 Modification Policy
Existing engines are never modified to support new functionality

Bug fixes and performance improvements are permitted

Engine behavior changes require version increment

18. Future Expansion
18.1 Engine Addition
New engines follow the established pattern:

Define engine responsibility (single)

Implement Result Object output

Expose interface for Orchestrator

Maintain no direct communication with other engines

Deploy independently

18.2 Capability Addition
Engine	Domain	Data Dependencies
Investment Engine	Investment analysis, ROI projections	Valuation, market data, financial data
Risk Engine	Risk scoring, risk factor analysis	Valuation, confidence, market volatility
Negotiation Engine	Negotiation strategy, pricing guidance	Valuation, confidence, market trends
Portfolio Engine	Portfolio composition, optimization	Valuation, risk, market intelligence
Market Intelligence	Market trends, forecasting	Historical data, valuations, GIS
18.3 Provider Addition
New data providers implement the Data Provider Interface. Orchestrator configuration maps request parameters to appropriate providers. No engine modification required.

18.4 Workflow Addition
Orchestrator supports new workflow definitions without engine modification. Workflows can be reconfigured dynamically.

Document Control
Version	Date	Author	Changes
1.0	2026-08-04	MIAYAAR Architecture Team	Final release
text

---

### docs/PRODUCT-ROADMAP.md

```markdown
# MIAYAAR Decision Intelligence Platform
# Product Roadmap

**Version:** 1.0
**Status:** Living Document

---

# Purpose

This document records approved future capabilities of the MIAYAAR Decision Intelligence Platform.

It is not a task list.

It is not a development backlog.

It represents the strategic evolution of the platform.

Every feature documented here has been conceptually approved and will be implemented when its development phase begins.

---

# Planned Features

---

## 1. Calibration Studio

**Priority:** High

**Status:** Planned

### Objective

Provide an internal interface for managing the valuation methodology without modifying source code.

---

### Capabilities

#### Valuation Weights

- Sales Comparison
- Income Capitalization
- Cost Approach
- DCF

---

#### Adjustment Factors

- Property Condition
- Building Condition
- View Type
- Floor Level
- Street Position
- Finish Quality
- Furnished Status
- Size Category
- Age Depreciation
- GIS Influence

---

#### Income Parameters

- Cap Rate
- Vacancy Rate
- Operating Expenses

---

#### DCF Parameters

- Discount Rate
- Rental Growth
- Capital Growth
- Exit Cost

---

#### Confidence Parameters

Manage all confidence calculation settings.

---

### Scenario Testing

Allow changing any parameter and immediately compare:

- Previous valuation
- New valuation
- Difference (AED)
- Difference (%)

---

### Batch Calibration

Run the valuation engine against large datasets.

Display:

- Mean Error
- Median Error
- Error Distribution
- Improvement after calibration

---

### Methodology Versioning

Store every approved methodology.

Example:

Methodology v1.0

↓

Methodology v1.1

↓

Methodology v1.2

Allow restoring any previous version.

---

### Approval Workflow

Every methodology update passes through:

Draft

↓

Testing

↓

Review

↓

Approved

↓

Production

Only approved methodologies can be used by the production engine.

---

### Design Principles

- No source code modification required.
- Configuration-driven.
- Fully traceable.
- Fully reversible.
- Compatible with future AI-assisted calibration.

---

# Future Products

Reserved.

---

# Future Decision Engines

Reserved.

---

# Future Platform Services

Reserved.