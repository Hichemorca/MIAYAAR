# IMP-005 – Valuation Engine Specification

## 1. Objective

Implement the Valuation Engine as the primary decision engine for property valuation, as defined in ADR-009.

The Valuation Engine is responsible for executing property valuations based on the approved methodology, consuming prepared data through defined contracts, and returning standardized `Result` objects. It must operate as an isolated, deterministic component within the engine layer.

## 2. Scope

### Included

- `IEngine<TRequest, TData>` implementation for valuation requests.
- Valuation logic for all supported approaches:
  - Sales Comparison
  - Income Capitalization
  - Cost Approach
  - DCF
- Support for Lower, Baseline, and Upper scenarios as defined in VALUATION-METHODOLOGY.md.
- Integration with Core Contracts (`IEngine`) and Result Object (`Result<TData>`).
- Consumption of Core Types (`Property`, `MarketSnapshot`, `Location`, etc.).
- Dependency on configuration/methodology parameters through the platform's established architecture.
- Deterministic, reproducible valuation outputs.
- Immutable by design.

### Not Included

- Data ingestion, cleaning, or normalization.
- External data source access (e.g., DLD, Bayut, GIS providers).
- User authentication or authorization.
- Report generation or presentation.
- Confidence scoring (handled by Confidence Engine).
- Platform-level configuration storage or management.
- Calibration Studio logic.

## 3. Required Dependencies

The Valuation Engine depends ONLY on:

- `core/types` (canonical domain contracts)
- `core/results` (Result Object contract)
- `core/contracts` (`IEngine` interface)

Configuration and methodology parameters are supplied through the platform's established architecture. The Valuation Engine does not directly access or manage configuration storage.

The Valuation Engine must NOT depend on:

- Other engines (e.g., Confidence Engine, Reporting Engine)
- Platform services (`platform/`)
- Products (`products/`)
- API layer (`api/`)
- UI layer (`ui/`)

## 4. IEngine Integration

The Valuation Engine must implement `IEngine<TRequest, TData>` from ADR-008.

- `TRequest` defines the valuation request parameters.
- `TData` defines the valuation result structure (e.g., `Valuation` from Core Types).
- The `execute` method accepts a validated request and returns `Promise<Result<TData>>`.

## 5. Result<TData> Integration

The Valuation Engine must return the standardized `Result<TData>` object from ADR-007.

- `status` indicates processing status (`success`, `partial`, `error`, `pending`).
- `data` contains the valuation result (`Valuation` domain object).
- `warnings` contains non-critical issues.
- `errors` contains critical failures.
- `metadata` contains processing metadata.

## 6. Supported Valuation Approaches

The Valuation Engine must support the following approaches as defined in `VALUATION-METHODOLOGY.md`:

### 6.1 Sales Comparison Approach

- Estimates value using recent comparable sales.
- Applicable to all property types.
- Uses market evidence as primary input.

### 6.2 Income Capitalization Approach

- Estimates value based on net operating income.
- Applicable to Apartment, Villa, Townhouse, Office, Retail.
- Uses rental income and capitalization rates.

### 6.3 Cost Approach

- Estimates value based on replacement cost.
- Applicable to Villa, Townhouse, Office, Retail.
- Provides a floor value for unique properties.

### 6.4 Discounted Cash Flow (DCF)

- Estimates value using projected future cash flows.
- Applicable to Apartment, Villa, Townhouse, Office, Retail.
- Uses growth rates, discount rates, and exit costs.

**Note:** Detailed calculation rules, formulas, weights, and adjustment coefficients remain governed by `VALUATION-METHODOLOGY.md` and are not defined in this specification.

## 7. Supported Scenarios

The Valuation Engine must support the three valuation scenarios defined in `VALUATION-METHODOLOGY.md`:

- **Lower Scenario**
- **Baseline Scenario**
- **Upper Scenario**

The detailed execution mechanics (e.g., whether execution is sequential or parallel, how parameters are passed internally, how scenario outputs are aggregated) remain deferred to implementation.

## 8. Input/Output Contract

### Input

- `TRequest` includes:
  - Property identifier or full `Property` object.
  - Market context (`MarketSnapshot` or sufficient market data).
  - Optional request parameters as defined by the implementation.

### Output

- `Result<TData>` where `TData` is `Valuation`.
- `Valuation` includes:
  - Final value.
  - Lower and upper bounds.
  - Approach results.
  - Methodology and version information.

## 9. Determinism Requirements

- The Valuation Engine must be deterministic.
- Given the same inputs and configuration, it must produce identical outputs.
- No reliance on external state, random numbers, or time-dependent logic.
- All calculations must be reproducible.

## 10. Dependency Direction

The Valuation Engine follows the dependency rules established in `PROJECT-STRUCTURE.md`:

- Depends on `core/types`, `core/results`, and `core/contracts` only.
- Must not depend on other engines, platform services, or products.
- Configuration and methodology parameters are supplied through the platform's established architecture.

## 11. Calibration Boundary

- Valuation parameters (weights, adjustment factors, coefficients, thresholds) are externalized to `config/`.
- The Valuation Engine does not directly access or manage configuration storage.
- The Calibration Studio (planned) will provide a UI for managing parameters without code changes.
- This specification does not define the Calibration Studio.

## 12. Relationship with Confidence Engine

- The Valuation Engine produces valuation results.
- Confidence scoring is handled by the Confidence Engine.
- The Valuation Engine does not compute confidence scores.
- Confidence Engine consumes Valuation outputs to produce Confidence assessments.

## 13. Relationship with Orchestrator

- The Orchestrator coordinates workflow and routes requests to engines.
- The Valuation Engine exposes its contract through `IEngine`.
- The Orchestrator invokes the Valuation Engine as part of the valuation pipeline.
- The Valuation Engine does not communicate directly with other engines.

## 14. Error/Warning Handling

- Use the standardized `Result` contract.
- Errors indicate critical failures preventing complete valuation.
- Warnings indicate non-critical issues (e.g., missing optional data).
- Error and warning structures follow the contracts defined in `core/results`.

## 15. Immutability Requirements

- All Valuation Engine outputs must be immutable by design.
- The `Valuation` domain object and all nested structures must be `readonly`.
- No mutable state within the engine.

## 16. Acceptance Criteria

### Structural

- `engines/valuation/` directory exists.
- Engine implements `IEngine<TRequest, TData>`.
- Engine returns `Result<TData>`.
- No direct data source access.
- No dependencies on other engines or platform services.

### Semantic

- Supports all four valuation approaches.
- Supports Lower, Baseline, and Upper scenarios.
- Produces deterministic outputs.
- Handles warnings and errors via Result contract.

### Dependency

- Dependencies limited to `core/types`, `core/results`, `core/contracts`.
- No circular dependencies.

### Documentation

- Every exported type and method is documented.

## 17. Definition of Done

IMP-005 is complete when:

1. All required files are created.
2. All Acceptance Criteria are met.
3. Claude's Review passes.
4. Architecture Board approves the freeze.
5. No modifications to files outside the specified scope.

**Once frozen, the Valuation Engine cannot be modified without a new ADR and Architecture Board approval.**

## 18. Validation Requirements

Before returning the implementation:

- Verify TypeScript syntax is valid.
- Verify imports only from `core/types`, `core/results`, `core/contracts`.
- Verify no Core Types files were modified.
- Verify no core/results files were modified.
- Verify no core/contracts files were modified.
- Verify no other engines or platform services are imported.
- Verify no business logic from methodology is implemented prematurely.
- Verify all required exports and methods are documented.

## 19. Traceability to ADRs

| ADR | Requirement | Implementation |
|-----|-------------|----------------|
| ADR-007 | Result Object | Engine returns `Result<TData>` |
| ADR-008 | Core Contracts | Engine implements `IEngine<TRequest, TData>` |
| ADR-009 | Valuation Engine Boundary | Engine isolated, deterministic, consumes prepared data only |

## 20. Unresolved Implementation Decisions

The following details are not defined by the governing documents and must be resolved before or during implementation:

1. **DCF / Land Contradiction**: VALUATION-METHODOLOGY.md §4.4 excludes Land from DCF applicability, but §5.6 assigns DCF a non-zero weight for Land in Lower, Baseline, and Upper scenarios. This methodology conflict must be resolved before implementation.

2. **Request Type (`TRequest`)**: The exact structure of the valuation request is not defined. Should it include the full `Property` object, a property ID, or a combination? This depends on how the Orchestrator and Data Engine interact.

3. **Partial Output Handling**: When data is missing for one approach (e.g., no rental data for Income Capitalization), should the engine return a `partial` result with warnings, or should it fall back to other approaches without changing status? This is an implementation decision.

4. **Configuration Access Pattern**: How does the Valuation Engine receive configuration/methodology parameters? Through dependency injection, a configuration service, or direct file access? ADR-009 states parameters are supplied through the platform's established architecture, but the pattern is not defined.

5. **Error/Warning Granularity**: What level of detail should warnings and errors contain? For example, should a missing comparable include the specific comparable ID? This is an implementation decision.