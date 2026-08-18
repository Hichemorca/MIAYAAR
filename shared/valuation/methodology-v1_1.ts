import type { ApproachWeights, MethodologyConfiguration, PropertyType, Scenario } from "./contracts";
import { METHODOLOGY_DOCUMENT_ID, METHODOLOGY_VERSION } from "./contracts";

const scenarios: Scenario[] = ["lower", "baseline", "upper"];
const weights = (lower: ApproachWeights, baseline: ApproachWeights, upper: ApproachWeights) => ({ lower, baseline, upper });
const factor = (lower: number, baseline: number, upper: number) => ({ lower: 1 + lower, baseline: 1 + baseline, upper: 1 + upper });

const zero = { salesComparison: 0, incomeCapitalization: 0, cost: 0, dcf: 0 } as const;
const fullWeights: Record<PropertyType, Record<Scenario, ApproachWeights>> = {
  apartment: weights({ salesComparison: .48, incomeCapitalization: .37, cost: .10, dcf: .05 }, { salesComparison: .50, incomeCapitalization: .35, cost: .10, dcf: .05 }, { salesComparison: .52, incomeCapitalization: .33, cost: .10, dcf: .05 }),
  villa: weights({ salesComparison: .43, incomeCapitalization: .22, cost: .30, dcf: .05 }, { salesComparison: .45, incomeCapitalization: .20, cost: .30, dcf: .05 }, { salesComparison: .47, incomeCapitalization: .18, cost: .30, dcf: .05 }),
  townhouse: weights({ salesComparison: .43, incomeCapitalization: .27, cost: .25, dcf: .05 }, { salesComparison: .45, incomeCapitalization: .25, cost: .25, dcf: .05 }, { salesComparison: .47, incomeCapitalization: .23, cost: .25, dcf: .05 }),
  office: weights({ salesComparison: .38, incomeCapitalization: .47, cost: .10, dcf: .05 }, { salesComparison: .40, incomeCapitalization: .45, cost: .10, dcf: .05 }, { salesComparison: .42, incomeCapitalization: .43, cost: .10, dcf: .05 }),
  retail: weights({ salesComparison: .33, incomeCapitalization: .52, cost: .10, dcf: .05 }, { salesComparison: .35, incomeCapitalization: .50, cost: .10, dcf: .05 }, { salesComparison: .37, incomeCapitalization: .48, cost: .10, dcf: .05 }),
  residential_land: weights({ salesComparison: .78, incomeCapitalization: 0, cost: 0, dcf: .22 }, { salesComparison: .80, incomeCapitalization: 0, cost: 0, dcf: .20 }, { salesComparison: .82, incomeCapitalization: 0, cost: 0, dcf: .18 }),
  warehouse: weights({ ...zero, salesComparison: 1 }, { ...zero, salesComparison: 1 }, { ...zero, salesComparison: 1 }),
};

export const methodologyV11: MethodologyConfiguration = {
  documentId: METHODOLOGY_DOCUMENT_ID,
  version: METHODOLOGY_VERSION,
  status: "frozen",
  weights: fullWeights,
  factors: {
    condition: { excellent: factor(.06, .08, .10), good: factor(0, 0, 0), fair: factor(-.20, -.18, -.15), needs_renovation: factor(-.28, -.25, -.22) },
    buildingCondition: { excellent: factor(.08, .10, .12), well_maintained: factor(.01, .03, .05), fair: factor(-.07, -.05, -.03), old_needs_renovation: factor(-.20, -.18, -.15) },
    view: { sea: factor(.13, .15, .17), partial_sea: factor(.06, .08, .10), city: factor(.03, .05, .07), garden: factor(.02, .04, .06), park: factor(.01, .02, .03), street: factor(-.05, -.03, -.01), internal: factor(-.02, 0, 0), unknown: factor(0, 0, 0) },
    floor: { penthouse: factor(.10, .12, .14), very_high: factor(.04, .06, .08), high: factor(.01, .03, .05), mid: factor(0, 0, 0), low: factor(-.05, -.03, -.01), ground: factor(-.07, -.05, -.03) },
    streetPosition: { main_street: factor(.06, .08, .10), corner_plot: factor(.03, .05, .07), secondary_street: factor(0, 0, 0), quiet_street: factor(-.06, -.04, -.02) },
    finish: { luxury: factor(.13, .15, .17), good: factor(.03, .05, .07), normal: factor(0, 0, 0), basic: factor(-.10, -.08, -.06), poor: factor(-.22, -.20, -.18) },
    furnished: { furnished: factor(.02, .04, .06), semi_furnished: factor(.01, .02, .03), unfurnished: factor(-.03, -.02, -.01) },
  },
  assumptions: { vacancyRate: .10, operatingExpenseRate: .20, residentialCapRate: .07, commercialCapRate: .075, rentGrowthRate: .02, valueGrowthRate: .03, discountRate: .10, exitCostRate: .05, operatingRatio: .75 },
};

/** Fails fast if a frozen methodology release is changed into an invalid weighting set. */
export function validateMethodology(configuration = methodologyV11): string[] {
  const errors: string[] = [];
  for (const [propertyType, byScenario] of Object.entries(configuration.weights)) {
    for (const scenario of scenarios) {
      const total = Object.values(byScenario[scenario]).reduce((sum, value) => sum + value, 0);
      if (Math.abs(total - 1) > 0.000001) errors.push(`${propertyType}.${scenario} weights must sum to 1.0`);
    }
  }
  return errors;
}
