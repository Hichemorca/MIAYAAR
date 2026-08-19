import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import {
  BuildingCondition,
  FinishQuality,
  FloorLevel,
  FurnishedStatus,
  Property,
  PropertyCondition,
  StreetPosition,
  ViewType,
} from '../core/types';
import { frozenMethodologyV12, resolveValuationConfiguration } from '../engines/valuation/methodology-v1_2';
import type { AdjustmentFactorSet } from '../engines/valuation/types';
import { describeFrozenAdjustmentSensitivity } from '../server/valuation/dld-observable-backtesting';
import { minimalProperty } from '../tests/fixtures/property.fixture';

type Scenario = 'lower' | 'baseline' | 'upper';
type FactorKey = keyof AdjustmentFactorSet;

interface DimensionVariant {
  readonly label: string;
  readonly property: Property;
}

interface SensitivityDimension {
  readonly factorKey: FactorKey;
  readonly label: string;
  readonly variants: readonly DimensionVariant[];
}

const SCENARIOS: readonly Scenario[] = ['lower', 'baseline', 'upper'];
const BASE_VALUE_AED = Number(process.env.SENSITIVITY_BASE_VALUE_AED ?? '1000000');
const OUTPUT_PATH = process.env.SENSITIVITY_OUTPUT;

if (!Number.isFinite(BASE_VALUE_AED) || BASE_VALUE_AED <= 0) {
  throw new Error('SENSITIVITY_BASE_VALUE_AED must be finite and positive.');
}
if (!OUTPUT_PATH) throw new Error('SENSITIVITY_OUTPUT is required.');

const withStructural = (patch: Partial<Property['structural']>): Property => ({
  ...minimalProperty,
  structural: { ...minimalProperty.structural, ...patch },
});
const withPhysical = (patch: Partial<Property['physical']>): Property => ({
  ...minimalProperty,
  physical: { ...minimalProperty.physical, ...patch },
});

const dimensions: readonly SensitivityDimension[] = [
  {
    factorKey: 'condition',
    label: 'Property condition',
    variants: Object.values(PropertyCondition).map(value => ({ label: value, property: withStructural({ propertyCondition: value }) })),
  },
  {
    factorKey: 'buildingCondition',
    label: 'Building condition',
    variants: Object.values(BuildingCondition).map(value => ({ label: value, property: withStructural({ buildingCondition: value }) })),
  },
  {
    factorKey: 'viewType',
    label: 'View',
    variants: Object.values(ViewType).map(value => ({ label: value, property: withStructural({ viewType: value }) })),
  },
  {
    factorKey: 'floorLevel',
    label: 'Floor level',
    variants: Object.values(FloorLevel).map(value => ({ label: value, property: withPhysical({ floorLevel: value }) })),
  },
  {
    factorKey: 'streetPosition',
    label: 'Street position',
    variants: Object.values(StreetPosition).map(value => ({ label: value, property: withStructural({ streetPosition: value }) })),
  },
  {
    factorKey: 'finishQuality',
    label: 'Finish quality',
    variants: Object.values(FinishQuality).map(value => ({ label: value, property: withStructural({ finishQuality: value }) })),
  },
  {
    factorKey: 'furnishedStatus',
    label: 'Furnished status',
    variants: Object.values(FurnishedStatus).map(value => ({ label: value, property: withStructural({ furnished: value }) })),
  },
];

function neutralAdjustmentSet(): AdjustmentFactorSet {
  return {
    condition: 1,
    buildingCondition: 1,
    viewType: 1,
    floorLevel: 1,
    streetPosition: 1,
    finishQuality: 1,
    furnishedStatus: 1,
    sizeCategory: 1,
    ageDepreciation: 1,
    gisPenalty: 1,
  };
}

const results = dimensions.flatMap(dimension => dimension.variants.flatMap(variant => {
  const configuration = resolveValuationConfiguration(variant.property);
  if (!configuration) throw new Error(`No frozen configuration available for ${variant.property.classification.type}.`);
  return SCENARIOS.map(scenario => {
    const factors = neutralAdjustmentSet();
    factors[dimension.factorKey] = configuration.adjustments[scenario][dimension.factorKey];
    const sensitivity = describeFrozenAdjustmentSensitivity(BASE_VALUE_AED, scenario, factors);
    return {
      dimension: dimension.label,
      factorKey: dimension.factorKey,
      variant: variant.label,
      factor: factors[dimension.factorKey],
      factorDeltaPercent: Math.round((factors[dimension.factorKey] - 1) * 10_000) / 100,
      ...sensitivity,
    };
  });
}));

const output = {
  protocolId: 'MIAYAAR-SENS-001',
  methodology: {
    documentId: frozenMethodologyV12.documentId,
    version: frozenMethodologyV12.version,
    status: frozenMethodologyV12.status,
  },
  classification: {
    purpose: 'mechanical sensitivity analysis of frozen adjustment factors',
    empiricalCalibration: false,
    dataSource: 'frozen methodology configuration only; no DLD attribute inference',
  },
  baseValueAed: BASE_VALUE_AED,
  results,
};

await mkdir(dirname(resolve(OUTPUT_PATH)), { recursive: true });
await writeFile(resolve(OUTPUT_PATH), `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ protocolId: output.protocolId, baseValueAed: BASE_VALUE_AED, resultCount: results.length, outputPath: resolve(OUTPUT_PATH) }, null, 2));
