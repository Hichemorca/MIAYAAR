import {
  BuildingCondition,
  Currency,
  DataSource,
  FinishQuality,
  FloorLevel,
  FurnishedStatus,
  MarketSnapshot,
  Money,
  Property,
  PropertyCondition,
  PropertyType,
  StreetPosition,
  Timestamp,
  TransactionType,
  UsageType,
  ViewType,
} from '../../../core/types';
import type { ValuationData } from '../../../engines/valuation/types';
import type { ComparableEvidence } from '../../valuation/evidence.contracts';
import type { PropertySubmission } from '../../../shared/valuation/contracts';

const AED: Currency = { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', decimalPlaces: 2 };
const asMoney = (amount: number): Money => ({ amount: Math.round((amount + Number.EPSILON) * 100) / 100, currency: AED });
const asTimestamp = (date: Date): Timestamp => date.toISOString() as Timestamp;

const propertyTypeMap: Record<PropertySubmission['propertyType'], PropertyType> = {
  apartment: PropertyType.APARTMENT,
  villa: PropertyType.VILLA,
  townhouse: PropertyType.TOWNHOUSE,
  office: PropertyType.OFFICE,
  retail: PropertyType.RETAIL,
  land: PropertyType.LAND,
  warehouse: PropertyType.WAREHOUSE,
};

const conditionMap: Record<PropertySubmission['condition'], PropertyCondition> = {
  excellent: PropertyCondition.EXCELLENT,
  good: PropertyCondition.GOOD,
  fair: PropertyCondition.FAIR,
  needs_renovation: PropertyCondition.NEEDS_RENOVATION,
};

const buildingConditionMap: Record<PropertySubmission['buildingCondition'], BuildingCondition> = {
  excellent: BuildingCondition.EXCELLENT,
  well_maintained: BuildingCondition.WELL_MAINTAINED,
  fair: BuildingCondition.FAIR,
  old_needs_renovation: BuildingCondition.OLD_NEEDS_RENOVATION,
};

const finishMap: Record<PropertySubmission['finish'], FinishQuality> = {
  luxury: FinishQuality.LUXURY,
  good: FinishQuality.GOOD,
  normal: FinishQuality.NORMAL,
  basic: FinishQuality.BASIC,
  poor: FinishQuality.POOR,
};

const furnishedMap: Record<NonNullable<PropertySubmission['furnished']>, FurnishedStatus> = {
  furnished: FurnishedStatus.FURNISHED,
  semi_furnished: FurnishedStatus.SEMI_FURNISHED,
  unfurnished: FurnishedStatus.UNFURNISHED,
};

const floorMap: Record<NonNullable<PropertySubmission['floor']>, FloorLevel> = {
  penthouse: FloorLevel.PENTHOUSE,
  very_high: FloorLevel.VERY_HIGH,
  high: FloorLevel.HIGH,
  mid: FloorLevel.MID,
  low: FloorLevel.LOW,
  ground: FloorLevel.GROUND,
};

const streetMap: Record<NonNullable<PropertySubmission['streetPosition']>, StreetPosition> = {
  main_street: StreetPosition.MAIN_STREET,
  corner_plot: StreetPosition.CORNER_PLOT,
  secondary_street: StreetPosition.SECONDARY_STREET,
  quiet_street: StreetPosition.QUIET_STREET,
};

const viewMap: Record<NonNullable<PropertySubmission['views']>[number], ViewType> = {
  sea: ViewType.SEA,
  partial_sea: ViewType.PARTIAL_SEA,
  city: ViewType.CITY,
  garden: ViewType.GARDEN,
  park: ViewType.PARK,
  street: ViewType.STREET,
  internal: ViewType.INTERNAL,
  unknown: ViewType.UNKNOWN,
};

function usageFor(propertyType: PropertyType): UsageType {
  switch (propertyType) {
    case PropertyType.OFFICE:
    case PropertyType.RETAIL:
      return UsageType.COMMERCIAL;
    case PropertyType.WAREHOUSE:
      return UsageType.INDUSTRIAL;
    default:
      return UsageType.RESIDENTIAL;
  }
}

/** Converts only supplied, intrinsic property facts into the canonical Property entity. */
export function toCanonicalProperty(input: PropertySubmission, requestId: string, capturedAt = new Date()): Property {
  const timestamp = asTimestamp(capturedAt);
  const type = propertyTypeMap[input.propertyType];
  const soleView = input.views.length === 1 ? viewMap[input.views[0]] : undefined;
  return {
    identity: { id: `submitted-property:${requestId}` },
    name: {
      name: `${input.propertyType.replace('_', ' ')} in ${input.district}`,
      description: 'Property facts supplied for an evidence-led MIAYAAR valuation request.',
    },
    classification: { type, usage: usageFor(type), status: 'SUBMITTED' },
    location: {
      id: `district:${input.district.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      address: { district: { code: input.district, name: input.district } },
    },
    physical: {
      totalArea: input.areaSqm,
      bedrooms: input.bedrooms,
      yearBuilt: input.yearBuilt,
      floorLevel: input.floor ? floorMap[input.floor] : undefined,
    },
    structural: {
      propertyCondition: conditionMap[input.condition],
      buildingCondition: buildingConditionMap[input.buildingCondition],
      finishQuality: finishMap[input.finish],
      furnished: input.furnished ? furnishedMap[input.furnished] : undefined,
      streetPosition: input.streetPosition ? streetMap[input.streetPosition] : undefined,
      // A multi-view input has no canonical single-view equivalent, so it is deliberately omitted.
      viewType: soleView,
    },
    legal: {},
    metadata: {
      id: `property-metadata:${requestId}`,
      timestamps: { createdAt: timestamp, updatedAt: timestamp },
      audit: { createdBy: 'api:valuation-submission', updatedBy: 'api:valuation-submission' },
      version: { version: '1.1.0', versionedAt: timestamp, versionedBy: 'api:valuation-submission', changeDescription: 'Created from the submitted property facts.' },
      provenance: {
        source: { id: requestId, name: 'MIAYAAR valuation API submission', type: 'USER_SUBMISSION' },
        acquiredAt: timestamp,
        acquiredBy: 'api:valuation-submission',
      },
      status: { status: 'SUBMITTED', category: 'PROPERTY', statusChangedAt: timestamp },
    },
  };
}

function median(values: readonly number[]): number {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

/**
 * Builds only the DLD-observable portion of MarketSnapshot. Supply, demand,
 * liquidity, and price trend are marked unavailable rather than set to zero.
 */
export function toCanonicalMarketSnapshot(
  property: Property,
  comparables: readonly ComparableEvidence[],
  asOf = new Date(),
): MarketSnapshot {
  if (!comparables.length) throw new Error('Cannot construct a market snapshot without eligible DLD comparables.');
  const transactionPrices = comparables.map(comparable => comparable.salePriceAed);
  const pricePerSqm = comparables.map(comparable => comparable.pricePerSqm);
  const totalValue = transactionPrices.reduce((total, value) => total + value, 0);
  const newestComparable = comparables.reduce((newest, comparable) => comparable.transactionDate > newest ? comparable.transactionDate : newest, comparables[0].transactionDate);
  const observedAt = asTimestamp(asOf);
  return {
    id: `dld-market:${property.location.id}:${observedAt}`,
    segment: { id: property.location.id, name: property.location.address.district?.name ?? property.location.id, propertyType: property.classification.type, locationId: property.location.id },
    timestamp: {
      asOf: observedAt,
      periodDescription: 'Eligible local DLD transactions selected by the evidence service.',
      daysSinceUpdate: Math.max(0, Math.floor((asOf.getTime() - newestComparable.getTime()) / 86_400_000)),
    },
    prices: {
      averagePrice: asMoney(totalValue / transactionPrices.length),
      medianPrice: asMoney(median(transactionPrices)),
      minPrice: asMoney(Math.min(...transactionPrices)),
      maxPrice: asMoney(Math.max(...transactionPrices)),
      pricePerSqm: asMoney(pricePerSqm.reduce((total, value) => total + value, 0) / pricePerSqm.length),
      priceTrendPercent: { status: 'unavailable', reason: 'not_provided_by_source', source: DataSource.DLD, observedAt },
    },
    supply: { status: 'unavailable', reason: 'not_provided_by_source', source: DataSource.DLD, observedAt },
    demand: { status: 'unavailable', reason: 'not_provided_by_source', source: DataSource.DLD, observedAt },
    liquidity: { status: 'unavailable', reason: 'not_provided_by_source', source: DataSource.DLD, observedAt },
    volume: {
      count: comparables.length,
      totalValue: asMoney(totalValue),
      averageValue: asMoney(totalValue / transactionPrices.length),
      medianValue: asMoney(median(transactionPrices)),
      transactionType: TransactionType.SALE,
    },
    // Evidence retains the transaction-level references and matching attributes.
    // No made-up similarity scores are placed in the core market snapshot.
    comparables: [],
    source: DataSource.DLD,
  };
}

export type EvidenceSupportedAssumptions = {
  readonly vacancyRate: number;
  readonly operatingExpenseRate: number;
  readonly residentialCapRate: number;
  readonly commercialCapRate: number;
};

/** Converts evidence and submitted monetary facts into engine inputs, without performing valuation calculations. */
export function toCanonicalValuationData(
  input: PropertySubmission,
  comparables: readonly ComparableEvidence[],
  assumptions: EvidenceSupportedAssumptions,
): ValuationData {
  const propertyType = propertyTypeMap[input.propertyType];
  const capRate = propertyType === PropertyType.OFFICE || propertyType === PropertyType.RETAIL
    ? assumptions.commercialCapRate
    : assumptions.residentialCapRate;
  return {
    comparables: comparables.map(comparable => ({
      salePrice: asMoney(comparable.timeAdjustedPricePerSqm * comparable.areaSqm),
      area: comparable.areaSqm,
      saleDate: comparable.transactionDate.toISOString(),
    })),
    income: input.annualRentAed === undefined
      ? undefined
      : {
          grossRent: asMoney(input.annualRentAed),
          vacancyRate: assumptions.vacancyRate,
          operatingExpenses: assumptions.operatingExpenseRate,
          capRate,
        },
    cost: input.replacementCostPerSqm === undefined || input.depreciationFactor === undefined
      ? undefined
      : {
          replacementCostPerSqm: asMoney(input.replacementCostPerSqm),
          depreciationFactor: input.depreciationFactor,
          landValue: input.landValueAed === undefined ? undefined : asMoney(input.landValueAed),
        },
    // DCF requires an independently supplied NOI and is intentionally omitted.
  };
}
