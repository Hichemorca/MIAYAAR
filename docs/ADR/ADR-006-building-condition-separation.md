# ADR-006: Separation of Property Condition and Building Condition

## Status

Accepted

## Date

2026-08-07

## Context

The Valuation Methodology defines both Property Condition and Building Condition as independent valuation factors. The current Core Types model treated them as a single concept.

We needed to decide whether to keep them combined or separate them into distinct fields.

## Decision

Property Condition and Building Condition represent different business concepts.

- **Property Condition** describes the physical condition of the property itself.
- **Building Condition** describes the physical condition of the building containing the property.

Both must exist independently.

Both must use dedicated enums.

## Rationale

1. **Methodology Alignment**: The official Valuation Methodology defines them as separate valuation factors. Combining them would diverge from the methodology.

2. **Clarity**: Separate fields make the model more explicit. Developers and users can see exactly which condition is being assessed.

3. **Traceability**: Independent fields enable independent adjustment factors. Valuation adjustments for property condition and building condition can be tracked separately.

4. **Future Extensibility**: The platform may need to support properties where the building condition differs significantly from the property condition (e.g., a renovated unit in an old building).

5. **Data Quality**: Data sources may provide only one or the other. Separate fields allow partial data to be preserved.

## Consequences

### Positive

- Property model contains two independent, clear fields.
- Aligned with the official Valuation Methodology.
- Improved traceability for valuation adjustments.
- Future extensibility without breaking changes.

### Negative

- Slight increase in model complexity.
- Requires both enums to be maintained.

### Future Implications

- The `Property` entity will contain both `propertyCondition` and `buildingCondition` fields.
- Valuation adjustments will reference the appropriate field.
- No breaking architectural changes.

## Alternatives Considered

### Combining them into a single field

**Rejected because:**

This would have conflated two distinct valuation factors. It would have made adjustments ambiguous and deviated from the official methodology. The Valuation Methodology explicitly separates them.