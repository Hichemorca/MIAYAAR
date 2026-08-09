# MIAYAAR Valuation Engine — Methodology

---

**Version:** 1.0
**Status:** Frozen
**Owner:** MIAYAAR Engineering
**Last Review:** 2026-08-04
**Next Review:** 2027-02-04
**Document ID:** MIAYAAR-METH-001
**Classification:** Internal Standard

---

## 1. Purpose

This document defines the valuation methodology implemented in the MIAYAAR Valuation Engine. It is the single source of truth for all calculation logic, adjustment factors, and weighting decisions. Implementations must conform to this specification.

---

## 2. Scope

### 2.1 Geographic

- **Primary:** Dubai, UAE
- **Future:** Other Emirates (subject to data availability)

### 2.2 Data Sources

| Source | Type | Coverage |
|--------|------|----------|
| Dubai Land Department (DLD) | Official transactions | 30,475+ records |
| OpenStreetMap (Overpass API) | Facilities | Real-time |
| Consultancy Data | Cap rates, vacancy rates | Reviewed quarterly |

### 2.3 Exclusions

- Off-plan properties
- Ultra-luxury (>50,000 AED/sqm or >50M AED)
- Commercial land
- Properties with <5 comparable sales

---

## 3. Supported Property Types

| Type | Code | Valuation |
|------|------|-----------|
| Apartment | APT | ✅ Full |
| Villa | VIL | ✅ Full |
| Townhouse | TWN | ✅ Full |
| Office | OFF | ✅ Full |
| Retail | RET | ✅ Full |
| Land (Residential) | LND | ✅ Full |
| Warehouse | WAR | ⚠️ Limited |

---

## 4. Valuation Approaches

### 4.1 Sales Comparison Approach

**Purpose:** Estimate value using recent comparable sales.

**Applicable Property Types:** All types.

**Advantages:** Direct market evidence; most reliable for residential.

**Limitations:** Requires sufficient comparable sales; less reliable for unique properties.

---

### 4.2 Income Capitalization Approach

**Purpose:** Estimate value based on net operating income.

**Applicable Property Types:** Apartment, Villa, Townhouse, Office, Retail.

**Advantages:** Useful for investment properties.

**Limitations:** Requires reliable rental data; less relevant for owner-occupied properties.

---

### 4.3 Cost Approach

**Purpose:** Estimate value based on replacement cost.

**Applicable Property Types:** Villa, Townhouse, Office, Retail.

**Advantages:** Provides a floor value; useful for unique properties.

**Limitations:** Not applicable to apartments or land; requires cost estimates.

---

### 4.4 Discounted Cash Flow (DCF)

**Purpose:** Estimate value using projected future cash flows.

**Applicable Property Types:** Apartment, Villa, Townhouse, Office, Retail, Land.

**Advantages:** Captures future potential.

**Limitations:** Sensitive to assumptions; lower reliability.

---

## 5. Official Valuation Weights

### 5.1 Apartment

| Scenario | Sales Comp | Income | Cost | DCF | Total |
|----------|------------|--------|------|-----|-------|
| Lower | 48% | 37% | 10% | 5% | 100% |
| Baseline | 50% | 35% | 10% | 5% | 100% |
| Upper | 52% | 33% | 10% | 5% | 100% |

**Justification:** Apartments trade frequently; market evidence is primary. Rental income influences investor demand.

---

### 5.2 Villa

| Scenario | Sales Comp | Income | Cost | DCF | Total |
|----------|------------|--------|------|-----|-------|
| Lower | 43% | 22% | 30% | 5% | 100% |
| Baseline | 45% | 20% | 30% | 5% | 100% |
| Upper | 47% | 18% | 30% | 5% | 100% |

**Justification:** Land and construction costs are significant for villas. Market evidence remains primary.

---

### 5.3 Townhouse

| Scenario | Sales Comp | Income | Cost | DCF | Total |
|----------|------------|--------|------|-----|-------|
| Lower | 43% | 27% | 25% | 5% | 100% |
| Baseline | 45% | 25% | 25% | 5% | 100% |
| Upper | 47% | 23% | 25% | 5% | 100% |

**Justification:** Balanced approach between market evidence and construction cost.

---

### 5.4 Office

| Scenario | Sales Comp | Income | Cost | DCF | Total |
|----------|------------|--------|------|-----|-------|
| Lower | 38% | 47% | 10% | 5% | 100% |
| Baseline | 40% | 45% | 10% | 5% | 100% |
| Upper | 42% | 43% | 10% | 5% | 100% |

**Justification:** Income is the primary driver for office value.

---

### 5.5 Retail

| Scenario | Sales Comp | Income | Cost | DCF | Total |
|----------|------------|--------|------|-----|-------|
| Lower | 33% | 52% | 10% | 5% | 100% |
| Baseline | 35% | 50% | 10% | 5% | 100% |
| Upper | 37% | 48% | 10% | 5% | 100% |

**Justification:** Income generation is the dominant value driver for retail.

---

### 5.6 Land

| Scenario | Sales Comp | Income | Cost | DCF | Total |
|----------|------------|--------|------|-----|-------|
| Lower | 78% | 0% | 0% | 22% | 100% |
| Baseline | 80% | 0% | 0% | 20% | 100% |
| Upper | 82% | 0% | 0% | 18% | 100% |

**Justification:** Land value is almost entirely market-driven. Future development potential provides context.

---

## 6. Valuation Factors

### 6.1 Condition (Property)

| Metric | Baseline | Lower | Upper |
|--------|----------|-------|-------|
| Excellent | +8% | +6% | +10% |
| Good | 0% | 0% | 0% |
| Fair | -18% | -20% | -15% |
| Needs Renovation | -25% | -28% | -22% |

**Applicability:** All types.
**Evidence Level:** B (inspection).
**Review Status:** Approved.
**Review Date:** 2026-08-04.

---

### 6.2 Building Condition

| Metric | Baseline | Lower | Upper |
|--------|----------|-------|-------|
| Excellent | +10% | +8% | +12% |
| Well Maintained | +3% | +1% | +5% |
| Fair | -5% | -7% | -3% |
| Old / Needs Renovation | -18% | -20% | -15% |

**Applicability:** All types.
**Evidence Level:** B (inspection).
**Review Status:** Approved.
**Review Date:** 2026-08-04.

---

### 6.3 View Type

| Metric | Baseline | Lower | Upper | Applicability |
|--------|----------|-------|-------|---------------|
| Sea / Beach | +15% | +13% | +17% | APT, VIL, OFF |
| Partial Sea | +8% | +6% | +10% | APT, VIL, OFF |
| City Skyline | +5% | +3% | +7% | APT, VIL, OFF |
| Garden (Private) | +4% | +2% | +6% | Residential |
| Park (Public) | +2% | +1% | +3% | Residential |
| Street / Main Road | -3% | -5% | -1% | All |
| Internal / No View | 0% | -2% | 0% | All |
| Unknown | 0% | 0% | 0% | All |

**Evidence Level:** C (verified).
**Review Status:** Approved.
**Review Date:** 2026-08-04.

---

### 6.4 Floor Level

| Metric | Baseline | Lower | Upper | Applicability |
|--------|----------|-------|-------|---------------|
| Penthouse | +12% | +10% | +14% | APT, OFF |
| Very High (21+) | +6% | +4% | +8% | APT, OFF |
| High (11-20) | +3% | +1% | +5% | APT, OFF |
| Mid (4-10) | 0% | 0% | 0% | APT, OFF |
| Low (1-3) | -3% | -5% | -1% | APT, OFF |
| Ground | -5% | -7% | -3% | APT, OFF |

**Evidence Level:** C (verified).
**Review Status:** Approved.
**Review Date:** 2026-08-04.

---

### 6.5 Street Position

| Metric | Baseline | Lower | Upper | Applicability |
|--------|----------|-------|-------|---------------|
| Main Street | +8% | +6% | +10% | VIL, TWN, OFF, RET |
| Corner Plot | +5% | +3% | +7% | VIL, TWN, OFF, RET |
| Secondary Street | 0% | 0% | 0% | VIL, TWN, OFF, RET |
| Quiet Street | -4% | -6% | -2% | VIL, TWN, OFF, RET |

**Evidence Level:** C (verified).
**Review Status:** Approved.
**Review Date:** 2026-08-04.

---

### 6.6 Finish Quality

| Metric | Baseline | Lower | Upper |
|--------|----------|-------|-------|
| Luxury / High-end | +15% | +13% | +17% |
| Good / Standard | +5% | +3% | +7% |
| Normal / Average | 0% | 0% | 0% |
| Basic / Economy | -8% | -10% | -6% |
| Poor / Needs Work | -20% | -22% | -18% |

**Applicability:** All types.
**Evidence Level:** B (inspection).
**Review Status:** Approved.
**Review Date:** 2026-08-04.

---

### 6.7 Furnished Status

| Metric | Baseline | Lower | Upper | Applicability |
|--------|----------|-------|-------|---------------|
| Furnished | +4% | +2% | +6% | APT, VIL, TWN, OFF |
| Semi-Furnished | +2% | +1% | +3% | APT, VIL, TWN, OFF |
| Unfurnished | -2% | -3% | -1% | APT, VIL, TWN, OFF |

**Evidence Level:** C (verified).
**Review Status:** Approved.
**Review Date:** 2026-08-04.

---

### 6.8 Size (Area)

| Category | Condition | Baseline | Lower | Upper | Applicability |
|----------|-----------|----------|-------|-------|---------------|
| Small | <80 sqm | +4% | +2% | +6% | APT, VIL, TWN |
| Medium | 80-200 sqm | 0% | 0% | 0% | APT, VIL, TWN |
| Large | >200 sqm | -4% | -6% | -2% | APT, VIL, TWN |

**Evidence Level:** A (market data).
**Review Status:** Approved.
**Review Date:** 2026-08-04.

---

### 6.9 Age (Year Built)

| Age Range | Baseline | Lower | Upper |
|-----------|----------|-------|-------|
| 0-5 years | -1% | 0% | -2% |
| 5-10 years | -3% | -2% | -5% |
| 10-20 years | -6% | -4% | -10% |
| 20-30 years | -12% | -8% | -15% |
| 30+ years | -18% | -15% | -25% |

**Applicability:** All types.
**Evidence Level:** A (verifiable).
**Review Status:** Approved.
**Review Date:** 2026-08-04.

---

### 6.10 GIS / Location Penalty Score

**Definition:** A penalty applied to properties with higher proximity to facilities, compensating for market over-valuation of location quality.

**Formula:**
Location Penalty = 1 + (accessibilityScore × -0.03)

text

Where accessibilityScore ranges from 0.0 to 1.0, derived from OpenStreetMap facility density.

| accessibilityScore | Baseline | Lower | Upper |
|-------------------|----------|-------|-------|
| 0.0 | 0% | 0% | 0% |
| 0.4 | -1.2% | -0.5% | -1.5% |
| 1.0 | -3.0% | -1.0% | -4.0% |

**Applicability:** All types.
**Evidence Level:** A (computed).
**Review Status:** Approved.
**Review Date:** 2026-08-04.

---

### 6.11 Studio

| Metric | Baseline | Lower | Upper | Applicability |
|--------|----------|-------|-------|---------------|
| Studio | -20% | -25% | -15% | APT only |

**Evidence Level:** A (market data).
**Review Status:** Experimental.
**Review Date:** 2026-08-04.

---

### 6.12 Multiple Views Algorithm

**Algorithm (Pseudo-code):**
Function CalculateViewMultiplier(views):
If views empty or contains "unknown" or "internal":
Return 1.0

Factors = {
"sea": 1.15,
"partial-sea": 1.08,
"city": 1.05,
"garden": 1.04,
"park": 1.02,
"street": 0.97
}

valid = views where type exists in Factors
If valid empty: Return 1.0

Sort valid by factor value descending

multiplier = 1.0
first = true

For each view in valid:
factor = Factors[view]
If first:
multiplier = multiplier * factor
first = false
Else:
multiplier = multiplier + (factor - 1) * 0.5

Return Clamp(multiplier, 0.80, 1.25)

text

**Applicability:** All view types.
**Review Status:** Approved.
**Review Date:** 2026-08-04.

---

## 7. Market Assumptions

These are engine configuration values, not property adjustment factors.

| Parameter | Value | Source |
|-----------|-------|--------|
| Vacancy Rate | 10% | Market average |
| Operating Expenses | 20% of gross rent | Market average |
| Cap Rate (Residential) | 7.0% | DLD / Consultancy |
| Cap Rate (Commercial) | 7.5% | DLD / Consultancy |
| Rent Growth | 2.0% p.a. | Historical average |
| Value Growth | 3.0% p.a. | Historical average |
| Discount Rate | 10.0% | WACC approximation |
| Exit Cost | 5.0% | Transaction cost estimate |
| Operating Ratio | 75.0% | Industry standard |

---

## 8. Valuation Range Model

### 8.1 Scenario Execution

The engine produces three independent valuation scenarios:

| Scenario | Weight Selection | Factor Selection |
|----------|------------------|------------------|
| Lower | Lower weights | Lower adjustment factors |
| Baseline | Baseline weights | Baseline adjustment factors |
| Upper | Upper weights | Upper adjustment factors |

Each scenario is a complete, independent execution of the valuation engine.

### 8.2 Output

The final report displays:

- Lower Scenario: One complete valuation result
- Baseline Scenario: One complete valuation result
- Upper Scenario: One complete valuation result

### 8.3 Confidence Interpretation

| Range Width | Interpretation |
|-------------|----------------|
| < 10% | High confidence |
| 10% – 20% | Moderate confidence |
| > 20% | Low confidence |

---

## 9. Search Strategy

### 9.1 Adaptive Windows

| Window | Confidence |
|--------|------------|
| 30 days | High |
| 60 days | High |
| 90 days | High |
| 180 days | Medium |
| 365 days | Low |
| 730 days | Very Low |

### 9.2 Search Levels

| Level | Granularity | Minimum Samples |
|-------|-------------|-----------------|
| 1 | District + Type + Size | 5 |
| 2 | District + Type | 5 |
| 3 | District Only | 5 |

### 9.3 Time Adjustment
Adjusted Price = Sale Price × (1 + MonthlyGrowthRate)^Months

text

Where MonthlyGrowthRate is computed from historical data per district and type.

---

## 10. Evidence Levels

| Level | Description | Criteria |
|-------|-------------|----------|
| A | High Confidence | ≥10 comparables, data ≤90 days |
| B | Medium-High | 7-9 comparables, data ≤180 days |
| C | Medium | 5-6 comparables, data ≤365 days |
| D | Medium-Low | 3-4 comparables, data ≤730 days |
| E | Low | <3 comparables or data >730 days |

---

## 11. Decision Log

| Decision | Value | Reason | Evidence | Review Status | Review Date |
|----------|-------|--------|----------|---------------|-------------|
| Sales Comparison Weight (Apartment) | 50% | Market evidence strongest for frequently traded assets | DLD data analysis | Approved | 2026-08-04 |
| Income Weight (Apartment) | 35% | Rental income influences investor demand | Market practice | Approved | 2026-08-04 |
| Studio Discount | -20% | Smaller units trade at discount to 1-bed | Market data | Experimental | 2026-08-04 |
| GIS Calibration | -0.03 | Market over-values proximity; compensates | Back-testing | Approved | 2026-08-04 |
| Sea View Premium | +15% | Highest demand view type | Market data | Approved | 2026-08-04 |
| Age Depreciation | Table-based | Standard market depreciation rates | Industry practice | Approved | 2026-08-04 |
| DCF Applicability to Land | DCF applies to Land | Resolves inconsistency between §4.4 exclusion and §5.6 Land weights; captures future development potential | Methodology consistency review | Approved | 2026-08-09 |

---

## 12. Engine Configuration

### 12.1 Confidence Model

| Comparables | Data Age | Confidence |
|-------------|----------|------------|
| ≥10 | ≤90 days | High |
| 5-9 | ≤180 days | Medium |
| <5 | >180 days | Basic |

### 12.2 Document Control

| Role | Responsibility |
|------|----------------|
| Chief Valuation Officer | Approve methodology changes |
| Data Science Team | Maintain calibration factors |
| Engineering Team | Implement methodology in code |
| QA Team | Validate implementation |

### 12.3 Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-08-07 | MIAYAAR Engineering | Initial frozen version |
| 1.1 | 2026-08-09 | MIAYAAR Engineering | §4.4: added Land to DCF applicability; §11: added decision log entry |

---

## 13. Change Control

### 13.1 Allowed Changes

Future modifications require:

1. Market validation: New data supports the change
2. Expert validation: RICS/IVS aligned professional review
3. Back-testing: Improved accuracy demonstrated

### 13.2 Change Process

| Stage | Action | Owner |
|-------|--------|-------|
| 1 | Propose change | Engineering / DS |
| 2 | Review against market data | Data Science |
| 3 | Expert validation | CVO |
| 4 | Back-test | QA |
| 5 | Approve | CVO |
| 6 | Deploy | Engineering |

---

## 14. Calibration Strategy

### 14.1 Triggers

| Trigger | Frequency | Action |
|---------|-----------|--------|
| Market data analysis | Quarterly | Review factors |
| Expert review | Semi-annually | Validate assumptions |
| Back-testing | Monthly | Compare against actual sales |

### 14.2 Governance

All calibration changes require:

1. Data Science review
2. QA validation
3. Chief Valuation Officer approval
4. Version increment
5. Code alignment

---

## 15. Future Roadmap

### Version 1.1 (Q4 2026)

- Add Abu Dhabi data (when available)
- Calibrate GIS factor with expanded dataset
- Add more retail sub-types

### Version 1.2 (Q1 2027)

- Add rental transaction data integration
- Improve Income Capitalization with actual rents
- Add price-to-rent ratio analysis

### Version 2.0 (Q3 2027)

- Multi-city support (Sharjah, Ajman, RAK)
- Machine Learning integration for valuation
- Automated calibration pipeline

---

## 16. Known Limitations

### 16.1 Data

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| ~7 months of historical data | Limited trend analysis | Adaptive search prioritises recent sales |
| No rental transaction data | Income approach uses estimates | Assumptions based on market averages |
| No inventory / listing data | Cannot adjust for supply | Use consultancy data as proxy |

### 16.2 Methodology

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| No price-to-rent ratio analysis | Income approach simplified | Use cap rate as proxy |
| No multi-year performance analysis | DCF assumptions manual | Conservative growth rates |
| GIS data from OpenStreetMap only | Facility coverage varies | Multiple data sources when available |

### 16.3 Property Types

| Type | Limitation |
|------|------------|
| Warehouse | Limited market data |
| Land | No income or cost approach |
| Commercial | Lower transaction frequency |

---

## 17. References

- RICS Valuation Standards (Red Book)
- IVS Framework
- Dubai Land Department Transaction Data
- OpenStreetMap API Documentation
- MIAYAAR Internal Calibration

---

## 18. Freeze Policy

This document is frozen as Version 1.0.

Direct modifications are prohibited.

Future modifications require:

- Version increment
- Decision Log update
- Change approval
- Documentation update

All valuation changes must be traceable.

---

## End of Document