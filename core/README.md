# Core

## Purpose

Core is the foundation of the MIAYAAR Decision Intelligence Platform. It defines what the platform is, not how it works.

All modules depend on Core. Core depends on nothing. This unidirectional dependency ensures that the platform's fundamental concepts remain stable while engines, services, and products evolve independently.

Core provides the common language, contracts, and abstractions shared across the entire platform. It establishes the boundary between business logic and implementation, ensuring that every component speaks the same domain language.

## Design Philosophy

Core contains only platform-independent concepts that are universally applicable across all engines, services, and products.

**Business logic** belongs to Engines.  
**Platform logic** belongs to Platform.  
**Presentation** belongs to UI.  
**Configuration** belongs to Config.  

Core is the abstraction layer. It defines interfaces without implementations, contracts without dependencies, and types without behavior. This separation ensures that Core remains lightweight, stable, and reusable throughout the platform's lifetime.

## Core Components

### types/

Canonical immutable contracts shared across the entire platform. Contains primitive types, domain entities, value objects, enumerations, and metadata definitions. These contracts are the official business language of the platform.

### errors/

Error types, classifications, and handling contracts. Defines how errors are structured, classified, and propagated across module boundaries. Provides a consistent error language for the entire platform.

### results/

Result Object standard definition and status enums. Defines the contract that every engine must satisfy. Ensures consistent output structure across all decision engines.

### contracts/

Engine interfaces, provider interfaces, and service boundaries. Defines the contracts that engines implement and the interfaces that data providers fulfill. Abstracts implementation details behind clear, stable boundaries.

## Dependency Rules

**Core depends on nothing.**

Everything else may depend on Core.

Core must never reference Engines, Platform, Products, API, or UI.

This rule is absolute. Any code that references a module outside Core immediately violates the architectural boundary and must be relocated.

## Design Principles

**Simplicity** — Every component serves exactly one purpose with minimal complexity.

**Stability** — Core changes only when the platform's fundamental concepts change.

**Reusability** — Components are designed for use by every module, not a single consumer.

**Determinism** — Core defines contracts that produce predictable, reproducible results.

**Low Coupling** — Core interfaces rely on abstractions, not concrete implementations.

**High Cohesion** — Related concepts reside together within their natural boundaries.

**Explicit Contracts** — Every interface, type, and entity is precisely defined and documented.

## Future Evolution

New components may be added to Core only if they are completely generic and reusable by every module in the platform.

If a component is specific to one engine or one product, it must not be placed inside Core.

Before adding any component to Core, consider:

- Is this concept fundamental to the platform?
- Will every engine or service need to understand it?
- Does it depend on anything outside Core?

If the answer to any of these questions is no, the component belongs elsewhere.

Core is the platform's foundation. It is built to last.