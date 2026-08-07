# MIAYAAR Platform

## Project Structure v1.0

---

## Purpose

This document defines the official repository organization for the MIAYAAR Decision Intelligence Platform. The structure supports multiple products sharing the same decision engines while maintaining clear separation of concerns, domain boundaries, and extension points. Every directory serves a specific architectural role. No directory exists for organizational convenience.

---

## Repository Philosophy

The repository is organized around engines, not applications. Products consume engines. Platform capabilities support engines. Shared utilities serve all components. This structure enables independent evolution of engines, products, and platform services.

**Key organizational principles:**

- Engines are top-level citizens
- Products are thin consumers
- Platform services are supporting infrastructure
- Shared code is explicitly extracted
- Dependencies flow inward toward core

---

## Architecture Layers
Products
│
Platform Services
│
Decision Engines
│
Core
│
Configuration

text

| Layer | Responsibility |
|-------|----------------|
| Products | Thin consumer layers that define user experiences |
| Platform Services | Multi-tenant infrastructure enabling the engine ecosystem |
| Decision Engines | Independent business logic components producing decision outputs |
| Core | Domain model, contracts, and shared type definitions |
| Configuration | Externalized settings driving engine behavior |

---

## Top-Level Structure
miaayar-platform/
├── docs/
├── config/
├── core/
├── platform/
├── engines/
├── products/
├── shared/
├── api/
├── ui/
├── tests/
├── scripts/
└── package.json

text

---

## Directory Responsibilities

### /docs

**Owner:** Product Management

**Purpose:** All platform documentation. Contains architecture references, methodology specifications, API contracts, operational guides, and strategic planning documents. The single source of truth for system documentation.

**Depends On:** None

**Used By:** All teams

---

### /config

**Owner:** Platform Engineering

**Purpose:** Externalized configuration for all platform components. Organized by layer, not by component. No business logic resides here. Configuration is versioned, auditable, and environment-aware.

**Structure:**

- `/methodology` - Valuation approaches, adjustment rules, business policies
- `/calibration` - Model coefficients, threshold values, confidence parameters
- `/runtime` - Feature flags, request-specific overrides, temporary adjustments
- `/environments` - Environment-specific settings (development, staging, production)

**Depends On:** None

**Used By:** engines, platform, api

---

### /core

**Owner:** Core Architecture Team

**Purpose:** Domain model and contracts. The foundation of the platform. Contains no implementation. Defines what the platform is, not how it works. All engines reference these definitions.

**Structure:**

- `/types` - Canonical immutable contracts (Property, Valuation, Confidence, etc.)
- `/errors` - Error types, classifications, and handling contracts
- `/results` - Result Object standard definition and status enums
- `/contracts` - Engine interfaces, provider interfaces, service boundaries
- `/domain` - (Reserved for future use)

**Depends On:** None

**Used By:** engines, platform, shared, api, products

---

### /platform

**Owner:** Platform Engineering

**Purpose:** Multi-tenant infrastructure supporting the engine ecosystem. Platform services are independent of business logic. They enable engines to operate in a production environment.

**Structure:**

- `/auth` - Authentication, authorization, role management, JWT handling
- `/users` - User management, preferences, profiles
- `/organizations` - Tenant management, organization hierarchy, team structures
- `/subscriptions` - Plan management, feature entitlements, access control
- `/billing` - Invoicing, payment processing, usage-based billing
- `/usage` - Usage tracking, rate limiting, analytics ingestion
- `/notifications` - Email, SMS, in-app notifications, webhooks
- `/storage` - File storage, document management, artifact storage

**Depends On:** core, shared

**Used By:** engines, products, api

---

### /engines

**Owner:** Decision Intelligence

**Purpose:** All decision engines. Each engine is independent, deployable, and follows the Result Object contract. Engines communicate only through the Orchestrator. No engine depends on another engine.

**Structure:**

**/engines/orchestrator**

Workflow coordination. The orchestrator accepts requests, determines execution sequence, routes to engines, composes results, and returns consolidated responses. Performs no calculations, validation, adjustments, or valuation logic.

**/engines/data**

Data ingestion and management. Handles data acquisition from external providers.

- `/providers` - Data provider interface implementations (DLD, Bayut, Property Finder, CSV)
- `/cleaning` - Data sanitization, deduplication, outlier detection
- `/normalization` - Standardization, unit conversion, schema mapping
- `/lookup` - Reference data, property master, identifier resolution
- `/gis` - Geospatial data retrieval, coordinate transformations, proximity queries
- `/quality` - Data quality scoring, completeness assessment, freshness monitoring

**/engines/validation**

Data integrity verification. Checks completeness, range boundaries, cross-field consistency, and market-specific requirements. Produces validation results and flags anomalies.

**/engines/rules**

Business rule evaluation. Loads rules from configuration. Evaluates policies, regulations, and market rules. No hardcoded values. Deterministic processing only.

**/engines/valuation**

Core valuation capability. Contains all valuation-specific logic.

- `/approaches` - Valuation methods (sales comparison, income, cost)
- `/adjustments` - Adjustment factors, location adjustments, feature adjustments
- `/calculators` - Price per square foot, hedonics, regression calculations
- `/aggregator` - Valuation consolidation, weighting, reconciliation

**/engines/confidence**

Uncertainty assessment. Evaluates data quality, model certainty, input completeness. Produces confidence scores and uncertainty bounds.

**/engines/reporting**

Report assembly. Composes engine outputs into structured reports. Handles templating and formatting. No analysis, no valuation, no calculations.

**Depends On:** core, config, shared

**Used By:** products, api

---

### /products

**Owner:** Product Teams

**Purpose:** Thin product layers that consume engines. Products define user experiences, not capabilities. Each product references engines and platform services. Products do not contain business logic.

**Structure:**

- `/valuation` - Valuation product interface
- `/investment` - Investment analysis product interface
- `/market-intelligence` - Market intelligence product interface
- `/portfolio` - Portfolio management product interface
- `/risk` - Risk assessment product interface

**Depends On:** api, platform, engines

**Used By:** ui

---

### /shared

**Owner:** Core Architecture Team

**Purpose:** Cross-cutting utilities. Code that is used across multiple engines or platform services. Shared code is explicitly extracted to prevent duplication.

**Structure:**

- `/math` - Mathematical utilities, statistical functions, matrix operations
- `/dates` - Date handling, time zones, formatting, parsing
- `/logging` - Structured logging, log correlation, log formatting
- `/parsers` - Input parsers, file parsers, format converters
- `/formatters` - Output formatters, report formatters, display formatters
- `/validators` - Common validation utilities, input sanitization

**Depends On:** core

**Used By:** engines, platform, api

---

### /api

**Owner:** Platform Engineering

**Purpose:** API layer. Exposes platform capabilities to clients. Thin routing layer that delegates to Orchestrator. No business logic. No engine invocation directly. API contracts versioned.

**Depends On:** orchestrator (via contract), core

**Used By:** ui, products

---

### /ui

**Owner:** Product Teams

**Purpose:** Presentation layer. User interfaces for products. Thin clients that render decision outputs. No business logic, no valuation logic, no transformation. Consumes APIs only.

**Depends On:** api (via contract)

**Used By:** End users

---

### /tests

**Owner:** Quality Engineering

**Purpose:** Testing infrastructure. Contains test utilities, fixtures, mocks, and integration test harnesses. Unit tests reside with their respective components.

**Depends On:** All components

**Used By:** CI/CD pipelines, developers

---

### /scripts

**Owner:** DevOps

**Purpose:** Operational and development scripts. CI/CD automation, database migrations, data seeding, local development setup, build processes.

**Depends On:** None

**Used By:** Developers, CI/CD pipelines

---

### /package.json

**Owner:** Core Architecture Team

**Purpose:** Project manifest. Defines dependencies, scripts, and project metadata. Supports monorepo structure.

**Depends On:** None

**Used By:** Build tools, developers, CI/CD

---

## Dependency Rules

### Allowed Dependencies

| Source | May Depend On |
|--------|---------------|
| /engines/* | /core, /shared, /config |
| /orchestrator | /engines/* (via contracts), /core, /shared |
| /api | /orchestrator (via contract), /core |
| /ui | /api (via contract) |
| /products/* | /api, /ui |
| /platform/* | /core, /shared |
| /shared | None (except standard library) |

### Forbidden Dependencies

- No engine depends on another engine
- No product contains business logic or engine implementation
- No engine depends on platform services
- No shared code depends on product or engine code
- No api layer bypasses orchestrator to invoke engines directly
- No configuration contains business logic
- No core depends on any other directory

---

## Dependency Matrix

| Directory | Allowed Dependencies |
|-----------|---------------------|
| products | api, platform, engines |
| platform | core, shared |
| engines | core, config, shared |
| api | orchestrator, core |
| ui | api |
| shared | core |
| core | none |
| config | none |
| tests | all components |
| scripts | none |
| docs | none |

---

## Naming Conventions

### Directories

- Lowercase
- Hyphen-separated for multi-word names
- Singular nouns
- Example: market-intelligence, data-quality, property-lookup

### Files

- Lowercase
- Hyphen-separated
- PascalCase for class files, lowercase for utilities
- File extensions indicate type: .test.ts, .spec.ts, .interface.ts
- Example: property-valuation.interface.ts, data-quality.service.ts

### Interfaces

- PascalCase
- Prefix with I for interfaces
- Example: IValuationEngine, IDataProvider, IResultObject

### Domain Models

- PascalCase
- No prefixes
- Example: Property, Valuation, Confidence, UserRequest

### Tests

- Mirror source file structure in /tests
- Test files end with .test.ts or .spec.ts
- Test suites describe behavior, not implementation
- Example: valuation-engine.test.ts, data-provider.spec.ts

---

## Reserved Directories

The following directory names are reserved for future use. They intentionally remain empty until required by platform evolution.

| Directory | Purpose |
|-----------|---------|
| /assets | Static assets, images, fonts, and shared media resources |
| /examples | Sample code, usage examples, and reference implementations |
| /tools | Internal tooling, custom build tools, and development utilities |

---

## Repository Design Principles

| Principle | Description |
|-----------|-------------|
| Simplicity | Every directory has a clear, singular purpose with minimal complexity. |
| Single Responsibility | Each directory contains code for one architectural concern only. |
| Low Coupling | Directories depend on abstractions, not concrete implementations. |
| High Cohesion | Related code resides together within the same directory. |
| Configuration First | Business behavior is driven by configuration, not code changes. |
| Engine Independence | Engines are autonomous and deployable without coordination. |
| Backward Compatibility | Changes preserve existing contracts and interfaces. |

---

## Future Expansion

### Adding a New Product

1. Create directory in /products with product name
2. Reference appropriate engines and platform services
3. Define product-specific UI in /ui (if applicable)
4. No modifications to engines or platform required

### Adding a New Engine

1. Create directory in /engines with engine name
2. Implement interfaces from /core/contracts
3. Return standardized Result Objects
4. Orchestrator updated to include new engine in workflows
5. Existing engines unchanged

### Adding a New Data Provider

1. Implement IDataProvider interface
2. Add implementation to /engines/data/providers
3. Configuration maps provider to requests
4. No engine modifications required

### Adding a New Platform Service

1. Create directory in /platform with service name
2. Reference /core and /shared only
3. Implement contracts as needed
4. Provide APIs for engines and products to consume

### Adding Shared Utilities

1. Evaluate if code is used in three or more locations
2. Extract to appropriate /shared subdirectory
3. Remove duplication from source locations

---

## Repository Structure Versioning

### Major Version (X.0.0)

Breaking repository changes that modify the fundamental organization. Examples include:

- Restructuring top-level directories
- Changing core domain models
- Modifying engine contracts
- Altering dependency rules

### Minor Version (x.Y.0)

Non-breaking additions to the repository structure. Examples include:

- Adding new modules within existing directories
- Adding new products
- Adding new engines
- Adding new platform services

### Patch Version (x.y.Z)

Documentation corrections, clarifications, and non-structural updates. Examples include:

- Fixing typos
- Clarifying existing descriptions
- Updating examples
- Correcting formatting

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-08-07 | MIAYAAR Architecture Team | Synchronized with ADR-001 |