# ADR-009: Valuation Engine

## Status

Accepted

## Date

2026-08-08

## Context

The MIAYAAR platform's primary capability is property valuation. The Valuation Engine is the core decision engine responsible for producing valuation outputs.

Currently, the architecture defines the engine layer (`engines/`), the core contracts (`core/contracts/`), and the result object (`core/results/`). The valuation methodology is documented in `VALUATION-METHODOLOGY.md`. However, the architectural boundary, responsibilities, and dependencies of the Valuation Engine itself have not been formally defined.

This ADR establishes the Valuation Engine as a distinct, isolated component within the engine layer, ensuring it operates within the platform's architectural principles.

## Decision

Create the Valuation Engine as a primary decision engine within the `engines/valuation/` module.

The Valuation Engine is responsible for executing property valuations based on the approved methodology. It consumes prepared data through defined contracts, applies valuation logic, and returns a standardized `Result` object. It does not access external data sources directly and does not communicate with other engines.

## Responsibilities

- Execute property valuations using the approved methodology.
- Consume `Property`, `MarketSnapshot`, `Location`, and other relevant domain objects from Core Types.
- Apply valuation approaches (Sales Comparison, Income Capitalization, Cost Approach, DCF).
- Produce a consolidated valuation result with supporting calculations.
- Return the standardized `Result<TData>` object as defined in ADR-007.
- Expose its contract to the Orchestrator via the `IEngine<TRequest, TData>` interface.
- Maintain independence from other engines and platform services.

## Non-Responsibilities / Boundaries

- Does NOT access external data sources directly (e.g., DLD, Bayut, GIS providers).
- Does NOT perform data ingestion, cleaning, or normalization.
- Does NOT manage user authentication or authorization.
- Does NOT generate reports or presentations.
- Does NOT contain platform-level configuration logic.
- Does NOT perform confidence scoring (handled by the Confidence Engine).
- Does NOT contain the Calibration Studio logic.

## Supported Valuation Approaches

The Valuation Engine must support the following approaches, as defined in `VALUATION-METHODOLOGY.md`:

- **Sales Comparison Approach**: Estimates value using recent comparable sales.
- **Income Capitalization Approach**: Estimates value based on net operating income.
- **Cost Approach**: Estimates value based on replacement cost.
- **Discounted Cash Flow (DCF)**: Estimates value using projected future cash flows.

Detailed calculation rules, formulas, weights, and adjustment coefficients remain governed by `VALUATION-METHODOLOGY.md` and future implementation specifications (IMP-00X). This ADR defines only the architectural boundary.

## Scenario Model

The Valuation Engine must support the three valuation scenarios defined in `VALUATION-METHODOLOGY.md`:

- **Lower Scenario**
- **Baseline Scenario**
- **Upper Scenario**

All scenario calculation behavior is deferred to the future implementation specification.

## Dependency Direction

The Valuation Engine depends only on:

- `core/types` (canonical domain contracts)
- `core/results` (Result Object contract)
- `core/contracts` (IEngine interface)

Methodology and configuration data are supplied through the platform's established architecture. The Valuation Engine is not directly responsible for configuration access.

The Valuation Engine must NOT depend on:

- Other engines (e.g., Confidence Engine, Reporting Engine)
- Platform services (`platform/`)
- Products (`products/`)
- API layer (`api/`)
- UI layer (`ui/`)

## Relationship with Result Object

The Valuation Engine must return the standardized `Result<TData>` object defined in ADR-007. The `data` field will contain the valuation result (e.g., a `Valuation` contract from Core Types).

## Relationship with Core Contracts

The Valuation Engine must implement the `IEngine<TRequest, TData>` interface from ADR-008. The `TRequest` type will define the valuation request parameters, and `TData` will define the valuation result structure.

## Relationship with Calibration

All valuation parameters (weights, adjustment factors, coefficients, thresholds) are externalized to the `config/` hierarchy. Methodology and configuration parameters are supplied to the Valuation Engine through the platform's established architecture. The Valuation Engine does not directly access or manage configuration storage.

The Calibration Studio (planned) will provide an interface for managing these parameters without source code changes. This ADR does not define the Calibration Studio.

## Consequences

### Positive

- Clear architectural boundary for valuation logic.
- Ensures valuation logic remains isolated and maintainable.
- Enables independent evolution of the Valuation Engine.
- Supports future calibration and methodology updates without code changes.
- Aligns with the platform's engine isolation principles.

### Negative

- Requires discipline to keep valuation logic separate from data access and platform services.
- All parameter changes require configuration updates and validation.

### Future Implications

- The Valuation Engine can be extended to support additional property types or geographies.
- New valuation approaches can be added without modifying existing ones.
- The Calibration Studio will provide a UI for managing valuation parameters.
- The Valuation Engine will serve as a reference for other decision engines.

## Rejected Alternatives

### Valuation Engine as a monolith with data access

**Rejected because:**

This violates the platform's separation of concerns. Data access belongs to the Data Engine. The Valuation Engine must remain focused on valuation logic only.

### Valuation Engine as part of the Orchestrator

**Rejected because:**

The Orchestrator coordinates workflow; it does not perform calculations. Valuation logic belongs in a dedicated engine.

### No Valuation Engine (valuation logic in Orchestrator)

**Rejected because:**

This would couple orchestration with valuation logic, making both harder to maintain and test.