export const METHODOLOGY_DOCUMENT_ID = "MIAYAAR-METH-001";
export const METHODOLOGY_VERSION = "1.1";

export type Scenario = "lower" | "baseline" | "upper";
export type PropertyType = "apartment" | "villa" | "townhouse" | "office" | "retail" | "land" | "warehouse";
export type EvidenceLevel = "A" | "B" | "C" | "D" | "E";

export type ScenarioValues = Record<Scenario, number>;

export interface ApproachWeights {
  salesComparison: number;
  incomeCapitalization: number;
  cost: number;
  dcf: number;
}

export interface MarketAssumptions {
  vacancyRate: number;
  operatingExpenseRate: number;
  residentialCapRate: number;
  commercialCapRate: number;
  rentGrowthRate: number;
  valueGrowthRate: number;
  discountRate: number;
  exitCostRate: number;
  operatingRatio: number;
}

export interface MethodologyConfiguration {
  documentId: string;
  version: string;
  status: "frozen" | "draft";
  weights: Record<PropertyType, Record<Scenario, ApproachWeights>>;
  factors: Record<string, Record<string, ScenarioValues>>;
  assumptions: MarketAssumptions;
}

export interface PropertySubmission {
  propertyType: PropertyType;
  district: string;
  areaSqm: number;
  bedrooms?: number;
  yearBuilt?: number;
  condition: "excellent" | "good" | "fair" | "needs_renovation";
  buildingCondition: "excellent" | "well_maintained" | "fair" | "old_needs_renovation";
  views: ("sea" | "partial_sea" | "city" | "garden" | "park" | "street" | "internal" | "unknown")[];
  finish: "luxury" | "good" | "normal" | "basic" | "poor";
  furnished?: "furnished" | "semi_furnished" | "unfurnished";
  floor?: "penthouse" | "very_high" | "high" | "mid" | "low" | "ground";
  streetPosition?: "main_street" | "corner_plot" | "secondary_street" | "quiet_street";
  annualRentAed?: number;
  replacementCostPerSqm?: number;
  landValueAed?: number;
  depreciationFactor?: number;
}
