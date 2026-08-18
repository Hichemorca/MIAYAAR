import type { MethodologyConfiguration, PropertySubmission, Scenario, ScenarioValues } from "@shared/valuation/contracts";

const scenarios: readonly Scenario[] = ["lower", "baseline", "upper"];

function multiplier(configuration: MethodologyConfiguration, family: string, key: string | undefined, scenario: Scenario): number {
  if (!key) return 1;
  return configuration.factors[family]?.[key]?.[scenario] ?? 1;
}

function clamp(value: number, lower: number, upper: number): number {
  return Math.min(upper, Math.max(lower, value));
}

/** Implements the approved multiple-view algorithm from MIAYAAR-METH-001. */
function viewMultiplier(configuration: MethodologyConfiguration, views: PropertySubmission["views"], scenario: Scenario): number {
  if (!views.length || views.includes("unknown") || views.includes("internal")) return 1;
  const factors = views
    .map(view => multiplier(configuration, "view", view, scenario))
    .filter(value => value !== 1)
    .sort((a, b) => b - a);
  if (!factors.length) return 1;
  const calculated = factors.reduce((total, factor, index) => index === 0 ? factor : total + (factor - 1) * 0.5, 1);
  return clamp(calculated, 0.8, 1.25);
}

export type RuleEvaluation = {
  multipliers: Record<Scenario, number>;
  explanation: Record<Scenario, ReadonlyArray<{ factor: string; multiplier: number }>>;
};

/**
 * Applies no hard-coded market percentages: every property factor is resolved
 * from the frozen methodology release supplied by the orchestrator.
 */
export function evaluatePropertyRules(property: PropertySubmission, configuration: MethodologyConfiguration): RuleEvaluation {
  const multipliers = {} as Record<Scenario, number>;
  const explanation = {} as RuleEvaluation["explanation"];

  for (const scenario of scenarios) {
    const entries = [
      ["condition", multiplier(configuration, "condition", property.condition, scenario)],
      ["buildingCondition", multiplier(configuration, "buildingCondition", property.buildingCondition, scenario)],
      ["view", viewMultiplier(configuration, property.views, scenario)],
      ["finish", multiplier(configuration, "finish", property.finish, scenario)],
      ["furnished", multiplier(configuration, "furnished", property.furnished, scenario)],
      ["floor", multiplier(configuration, "floor", property.floor, scenario)],
      ["streetPosition", multiplier(configuration, "streetPosition", property.streetPosition, scenario)],
    ] as const;
    explanation[scenario] = entries.map(([factor, value]) => ({ factor, multiplier: value }));
    multipliers[scenario] = entries.reduce((total, [, value]) => total * value, 1);
  }
  return { multipliers, explanation };
}
