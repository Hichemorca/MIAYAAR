import {
  BuildingCondition,
  FinishQuality,
  FloorLevel,
  FurnishedStatus,
  Property,
  PropertyCondition,
  PropertyType,
  StreetPosition,
  ViewType,
} from '../../core/types';
import type { AdjustmentFactorSet, ApproachWeights, ValuationConfiguration } from './types';

type Scenario = 'lower' | 'baseline' | 'upper';
type ScenarioValues = Readonly<Record<Scenario, number>>;
type ScenarioWeights = Readonly<Record<Scenario, ApproachWeights>>;

export const METHODOLOGY_DOCUMENT_ID = 'MIAYAAR-METH-001';
export const METHODOLOGY_VERSION = '1.1';

const scenarios = (lower: ApproachWeights, baseline: ApproachWeights, upper: ApproachWeights): ScenarioWeights => ({ lower, baseline, upper });
const factor = (lower: number, baseline: number, upper: number): ScenarioValues => ({ lower: 1 + lower, baseline: 1 + baseline, upper: 1 + upper });
const noAdjustment: ScenarioValues = { lower: 1, baseline: 1, upper: 1 };

const weightsByPropertyType: Readonly<Partial<Record<PropertyType, ScenarioWeights>>> = {
  [PropertyType.APARTMENT]: scenarios({ salesComparison: .48, incomeCapitalization: .37, cost: .10, dcf: .05 }, { salesComparison: .50, incomeCapitalization: .35, cost: .10, dcf: .05 }, { salesComparison: .52, incomeCapitalization: .33, cost: .10, dcf: .05 }),
  [PropertyType.VILLA]: scenarios({ salesComparison: .43, incomeCapitalization: .22, cost: .30, dcf: .05 }, { salesComparison: .45, incomeCapitalization: .20, cost: .30, dcf: .05 }, { salesComparison: .47, incomeCapitalization: .18, cost: .30, dcf: .05 }),
  [PropertyType.TOWNHOUSE]: scenarios({ salesComparison: .43, incomeCapitalization: .27, cost: .25, dcf: .05 }, { salesComparison: .45, incomeCapitalization: .25, cost: .25, dcf: .05 }, { salesComparison: .47, incomeCapitalization: .23, cost: .25, dcf: .05 }),
  [PropertyType.OFFICE]: scenarios({ salesComparison: .38, incomeCapitalization: .47, cost: .10, dcf: .05 }, { salesComparison: .40, incomeCapitalization: .45, cost: .10, dcf: .05 }, { salesComparison: .42, incomeCapitalization: .43, cost: .10, dcf: .05 }),
  [PropertyType.RETAIL]: scenarios({ salesComparison: .33, incomeCapitalization: .52, cost: .10, dcf: .05 }, { salesComparison: .35, incomeCapitalization: .50, cost: .10, dcf: .05 }, { salesComparison: .37, incomeCapitalization: .48, cost: .10, dcf: .05 }),
  [PropertyType.LAND]: scenarios({ salesComparison: .78, incomeCapitalization: 0, cost: 0, dcf: .22 }, { salesComparison: .80, incomeCapitalization: 0, cost: 0, dcf: .20 }, { salesComparison: .82, incomeCapitalization: 0, cost: 0, dcf: .18 }),
};

const conditionFactors: Readonly<Record<PropertyCondition, ScenarioValues>> = {
  [PropertyCondition.EXCELLENT]: factor(.06, .08, .10),
  [PropertyCondition.GOOD]: noAdjustment,
  [PropertyCondition.FAIR]: factor(-.20, -.18, -.15),
  [PropertyCondition.NEEDS_RENOVATION]: factor(-.28, -.25, -.22),
};

const buildingConditionFactors: Readonly<Record<BuildingCondition, ScenarioValues>> = {
  [BuildingCondition.EXCELLENT]: factor(.08, .10, .12),
  [BuildingCondition.WELL_MAINTAINED]: factor(.01, .03, .05),
  [BuildingCondition.FAIR]: factor(-.07, -.05, -.03),
  [BuildingCondition.OLD_NEEDS_RENOVATION]: factor(-.20, -.18, -.15),
};

const viewFactors: Readonly<Record<ViewType, ScenarioValues>> = {
  [ViewType.SEA]: factor(.13, .15, .17),
  [ViewType.PARTIAL_SEA]: factor(.06, .08, .10),
  [ViewType.CITY]: factor(.03, .05, .07),
  [ViewType.GARDEN]: factor(.02, .04, .06),
  [ViewType.PARK]: factor(.01, .02, .03),
  [ViewType.STREET]: factor(-.05, -.03, -.01),
  [ViewType.INTERNAL]: factor(-.02, 0, 0),
  [ViewType.UNKNOWN]: noAdjustment,
};

const floorFactors: Readonly<Record<FloorLevel, ScenarioValues>> = {
  [FloorLevel.PENTHOUSE]: factor(.10, .12, .14),
  [FloorLevel.VERY_HIGH]: factor(.04, .06, .08),
  [FloorLevel.HIGH]: factor(.01, .03, .05),
  [FloorLevel.MID]: noAdjustment,
  [FloorLevel.LOW]: factor(-.05, -.03, -.01),
  [FloorLevel.GROUND]: factor(-.07, -.05, -.03),
};

const streetFactors: Readonly<Record<StreetPosition, ScenarioValues>> = {
  [StreetPosition.MAIN_STREET]: factor(.06, .08, .10),
  [StreetPosition.CORNER_PLOT]: factor(.03, .05, .07),
  [StreetPosition.SECONDARY_STREET]: noAdjustment,
  [StreetPosition.QUIET_STREET]: factor(-.06, -.04, -.02),
};

const finishFactors: Readonly<Record<FinishQuality, ScenarioValues>> = {
  [FinishQuality.LUXURY]: factor(.13, .15, .17),
  [FinishQuality.GOOD]: factor(.03, .05, .07),
  [FinishQuality.NORMAL]: noAdjustment,
  [FinishQuality.BASIC]: factor(-.10, -.08, -.06),
  [FinishQuality.POOR]: factor(-.22, -.20, -.18),
};

const furnishedFactors: Readonly<Record<FurnishedStatus, ScenarioValues>> = {
  [FurnishedStatus.FURNISHED]: factor(.02, .04, .06),
  [FurnishedStatus.SEMI_FURNISHED]: factor(.01, .02, .03),
  [FurnishedStatus.UNFURNISHED]: factor(-.03, -.02, -.01),
};

export const frozenMethodologyV11 = {
  documentId: METHODOLOGY_DOCUMENT_ID,
  version: METHODOLOGY_VERSION,
  status: 'frozen' as const,
  weightsByPropertyType,
  assumptions: {
    vacancyRate: .10,
    operatingExpenseRate: .20,
    residentialCapRate: .07,
    commercialCapRate: .075,
    rentGrowthRate: .02,
    valueGrowthRate: .03,
    discountRate: .10,
    exitCostRate: .05,
    operatingRatio: .75,
  },
} as const;

/** Verifies that each frozen scenario remains a complete methodology allocation. */
export function validateFrozenMethodology(): readonly string[] {
  const errors: string[] = [];
  for (const [propertyType, byScenario] of Object.entries(frozenMethodologyV11.weightsByPropertyType)) {
    for (const [scenario, weights] of Object.entries(byScenario ?? {})) {
      const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
      if (Math.abs(total - 1) > 0.000001) errors.push(`${propertyType}.${scenario} weights must sum to 1.0`);
    }
  }
  return errors;
}

function adjustmentSet(property: Property, scenario: Scenario): AdjustmentFactorSet {
  return {
    condition: conditionFactors[property.structural.propertyCondition][scenario],
    buildingCondition: buildingConditionFactors[property.structural.buildingCondition][scenario],
    viewType: property.structural.viewType ? viewFactors[property.structural.viewType][scenario] : 1,
    floorLevel: property.physical.floorLevel ? floorFactors[property.physical.floorLevel][scenario] : 1,
    streetPosition: property.structural.streetPosition ? streetFactors[property.structural.streetPosition][scenario] : 1,
    finishQuality: property.structural.finishQuality ? finishFactors[property.structural.finishQuality][scenario] : 1,
    furnishedStatus: property.structural.furnished ? furnishedFactors[property.structural.furnished][scenario] : 1,
    sizeCategory: 1,
    ageDepreciation: 1,
    gisPenalty: 1,
  };
}

/** Selects the frozen methodology configuration for one canonical property. */
export function resolveValuationConfiguration(property: Property): ValuationConfiguration | undefined {
  const weights = frozenMethodologyV11.weightsByPropertyType[property.classification.type];
  if (!weights) return undefined;
  return {
    weights,
    assumptions: {
      vacancyRate: frozenMethodologyV11.assumptions.vacancyRate,
      operatingExpenses: frozenMethodologyV11.assumptions.operatingExpenseRate,
      capRate: property.classification.type === PropertyType.OFFICE || property.classification.type === PropertyType.RETAIL
        ? frozenMethodologyV11.assumptions.commercialCapRate
        : frozenMethodologyV11.assumptions.residentialCapRate,
      rentalGrowthRate: frozenMethodologyV11.assumptions.rentGrowthRate,
      discountRate: frozenMethodologyV11.assumptions.discountRate,
      exitCosts: frozenMethodologyV11.assumptions.exitCostRate,
    },
    adjustments: {
      lower: adjustmentSet(property, 'lower'),
      baseline: adjustmentSet(property, 'baseline'),
      upper: adjustmentSet(property, 'upper'),
    },
  };
}
