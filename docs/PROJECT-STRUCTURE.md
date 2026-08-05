AQAR Platform
Project Structure v1.0
Purpose
This document defines the official repository organization for the AQAR Decision Intelligence Platform. The structure supports multiple products sharing the same decision engines while maintaining clear separation of concerns, domain boundaries, and extension points. Every directory serves a specific architectural role. No directory exists for organizational convenience.

Repository Philosophy
The repository is organized around engines, not applications. Products consume engines. Platform capabilities support engines. Shared utilities serve all components. This structure enables independent evolution of engines, products, and platform services.

Key organizational principles:

Engines are top-level citizens

Products are thin consumers

Platform services are supporting infrastructure

Shared code is explicitly extracted

Dependencies flow inward toward core

Top-Level Structure
text
aqar-platform/
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
Directory Responsibilities
/docs
All platform documentation. Contains architecture references, methodology specifications, API contracts, and operational guides. The single source of truth for system documentation. Includes ARCHITECTURE.md, VALUATION-METHODOLOGY.md, and PROJECT-STRUCTURE.md as frozen v1.0 documents.

/config
Externalized configuration for all platform components. Organized by layer, not by component. No business logic resides here. Configuration is versioned, auditable, and environment-aware.

/methodology - Valuation approaches, adjustment rules, business policies

/calibration - Model coefficients, threshold values, confidence parameters

/runtime - Feature flags, request-specific overrides, temporary adjustments

/environments - Environment-specific settings (development, staging, production)

/core
Domain model and contracts. The foundation of the platform. Contains no implementation. Defines what the platform is, not how it works. All engines reference these definitions.

/domain - Core business entities (Property, Comparable, MarketData, Location, Valuation, Confidence, Evidence, Report, UserRequest)

/contracts - Engine interfaces, provider interfaces, service boundaries

/results - Result Object standard definition and status enums

/errors - Error types, classifications, and handling contracts

/types - Common type definitions used across the platform

/platform
Multi-tenant infrastructure supporting the engine ecosystem. Platform services are independent of business logic. They enable engines to operate in a production environment.

/auth - Authentication, authorization, role management, JWT handling

/users - User management, preferences, profiles

/organizations - Tenant management, organization hierarchy, team structures

/subscriptions - Plan management, feature entitlements, access control

/billing - Invoicing, payment processing, usage-based billing

/usage - Usage tracking, rate limiting, analytics ingestion

/notifications - Email, SMS, in-app notifications, webhooks

/storage - File storage, document management, artifact storage

/engines
All decision engines. Each engine is independent, deployable, and follows the Result Object contract. Engines communicate only through the Orchestrator. No engine depends on another engine.

/engines/orchestrator
Workflow coordination. The orchestrator accepts requests, determines execution sequence, routes to engines, composes results, and returns consolidated responses. Performs no calculations, validation, adjustments, or valuation logic.

/engines/data
Data ingestion and management. Handles data acquisition from external providers.

/providers - Data provider interface implementations (DLD, Bayut, Property Finder, CSV)

/cleaning - Data sanitization, deduplication, outlier detection

/normalization - Standardization, unit conversion, schema mapping

/lookup - Reference data, property master, identifier resolution

/gis - Geospatial data retrieval, coordinate transformations, proximity queries

/quality - Data quality scoring, completeness assessment, freshness monitoring

/engines/validation
Data integrity verification. Checks completeness, range boundaries, cross-field consistency, and market-specific requirements. Produces validation results and flags anomalies.

/engines/rules
Business rule evaluation. Loads rules from configuration. Evaluates policies, regulations, and market rules. No hardcoded values. Deterministic processing only.

/engines/valuation
Core valuation capability. Contains all valuation-specific logic.

/approaches - Valuation methods (sales comparison, income, cost)

/adjustments - Adjustment factors, location adjustments, feature adjustments

/calculators - Price per square foot, hedonics, regression calculations

/aggregator - Valuation consolidation, weighting, reconciliation

/engines/confidence
Uncertainty assessment. Evaluates data quality, model certainty, input completeness. Produces confidence scores and uncertainty bounds.

/engines/reporting
Report assembly. Composes engine outputs into structured reports. Handles templating and formatting. No analysis, no valuation, no calculations.

/products
Thin product layers that consume engines. Products define user experiences, not capabilities. Each product references engines and platform services. Products do not contain business logic.

/valuation - Valuation product interface

/investment - Investment analysis product interface

/market-intelligence - Market intelligence product interface

/portfolio - Portfolio management product interface

/risk - Risk assessment product interface

/shared
Cross-cutting utilities. Code that is used across multiple engines or platform services. Shared code is explicitly extracted to prevent duplication.

/math - Mathematical utilities, statistical functions, matrix operations

/dates - Date handling, time zones, formatting, parsing

/logging - Structured logging, log correlation, log formatting

/parsers - Input parsers, file parsers, format converters

/formatters - Output formatters, report formatters, display formatters

/validators - Common validation utilities, input sanitization

/api
API layer. Exposes platform capabilities to clients. Thin routing layer that delegates to Orchestrator. No business logic. No engine invocation directly. API contracts versioned.

/ui
Presentation layer. User interfaces for products. Thin clients that render decision outputs. No business logic, no valuation logic, no transformation. Consumes APIs only.

/tests
Testing infrastructure. Contains test utilities, fixtures, mocks, and integration test harnesses. Unit tests reside with their respective components.

/scripts
Operational and development scripts. CI/CD automation, database migrations, data seeding, local development setup, build processes.

/package.json
Project manifest. Defines dependencies, scripts, and project metadata. Supports monorepo structure.

Dependency Rules
Allowed Dependencies
Source	May Depend On
/engines/*	/core, /shared, /config
/orchestrator	/engines/* (via contracts), /core, /shared
/api	/orchestrator (via contract), /core
/ui	/api (via contract)
/products/*	/api, /ui
/platform/*	/core, /shared
/shared	None (except standard library)
Forbidden Dependencies
No engine depends on another engine

No product contains business logic or engine implementation

No engine depends on platform services

No shared code depends on product or engine code

No api layer bypasses orchestrator to invoke engines directly

No configuration contains business logic

No core depends on any other directory

Naming Conventions
Directories
Lowercase

Hyphen-separated for multi-word names

Singular nouns

Example: market-intelligence, data-quality, property-lookup

Files
Lowercase

Hyphen-separated

PascalCase for class files, lowercase for utilities

File extensions indicate type: .test.ts, .spec.ts, .interface.ts

Example: property-valuation.interface.ts, data-quality.service.ts

Interfaces
PascalCase

Prefix with I for interfaces

Example: IValuationEngine, IDataProvider, IResultObject

Domain Models
PascalCase

No prefixes

Example: Property, Valuation, Confidence, UserRequest

Tests
Mirror source file structure in /tests

Test files end with .test.ts or .spec.ts

Test suites describe behavior, not implementation

Example: valuation-engine.test.ts, data-provider.spec.ts

Future Expansion
Adding a New Product
Create directory in /products with product name

Reference appropriate engines and platform services

Define product-specific UI in /ui (if applicable)

No modifications to engines or platform required

Adding a New Engine
Create directory in /engines with engine name

Implement interfaces from /core/contracts

Return standardized Result Objects

Orchestrator updated to include new engine in workflows

Existing engines unchanged

Adding a New Data Provider
Implement IDataProvider interface

Add implementation to /engines/data/providers

Configuration maps provider to requests

No engine modifications required

Adding a New Platform Service
Create directory in /platform with service name

Reference /core and /shared only

Implement contracts as needed

Provide APIs for engines and products to consume

Adding Shared Utilities
Evaluate if code is used in three or more locations

Extract to appropriate /shared subdirectory

Remove duplication from source locations

Document Control
Version	Date	Author	Changes
1.0	2026-08-04	AQAR Architecture Team	Initial release
