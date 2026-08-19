/**
 * MIAYAAR Valuation Engine — browser implementation
 * Implements transparent, deterministic scenario valuation for the interface.
 * The visual language is documented in /ideas.md; this module intentionally
 * contains only methodology, data provenance, and calculations.
 */

export type PropertyType = "APARTMENT" | "VILLA" | "TOWNHOUSE" | "OFFICE" | "RETAIL" | "LAND" | "WAREHOUSE";
export type Scenario = "lower" | "baseline" | "upper";
export type Confidence = "مرتفع" | "متوسط" | "أساسي" | "منخفض";

export interface Transaction {
  id: string;
  d: string;
  t: string;
  s: string;
  x: string;
  a: number;
  p: number;
  r: number | null;
}

export interface DldDataset {
  source: string;
  retrievedAt: string;
  methodology: string;
  types: string[];
  districts: { district: string; count: number }[];
  records: Transaction[];
}

export interface ValuationInput {
  propertyType: PropertyType;
  district: string;
  area: number;
  bedrooms: number;
  yearBuilt: number;
  condition: "EXCELLENT" | "GOOD" | "FAIR" | "NEEDS_RENOVATION";
  buildingCondition: "EXCELLENT" | "WELL_MAINTAINED" | "FAIR" | "OLD_NEEDS_RENOVATION";
  view: "SEA" | "PARTIAL_SEA" | "CITY" | "GARDEN" | "PARK" | "STREET" | "INTERNAL" | "UNKNOWN";
  finish: "LUXURY" | "GOOD" | "NORMAL" | "BASIC" | "POOR";
  furnished: "FURNISHED" | "SEMI_FURNISHED" | "UNFURNISHED";
  floor: "PENTHOUSE" | "VERY_HIGH" | "HIGH" | "MID" | "LOW" | "GROUND";
  street: "MAIN_STREET" | "CORNER_PLOT" | "SECONDARY_STREET" | "QUIET_STREET";
  accessibility: number;
  annualRent?: number;
  replacementCost?: number;
  landValue?: number;
}

export interface ComparableView extends Transaction {
  adjustedPricePerSqm: number;
  monthsOld: number;
}

export interface ApproachResult {
  id: "sales" | "income" | "cost" | "dcf";
  label: string;
  value: number;
  baseWeight: number;
  appliedWeight: number;
  confidence: number;
  note: string;
}

export interface ScenarioResult {
  scenario: Scenario;
  label: string;
  value: number;
  approaches: ApproachResult[];
  warnings: string[];
}

export interface ValuationResult {
  lower: ScenarioResult;
  baseline: ScenarioResult;
  upper: ScenarioResult;
  comparables: ComparableView[];
  confidence: Confidence;
  confidenceScore: number;
  evidenceLevel: "A" | "B" | "C" | "D" | "E";
  usedFallback: boolean;
  timeWindowDays: number;
  pricePerSqm: number;
  rangeWidthPercent: number;
  warnings: string[];
}

const SCENARIOS: Record<Scenario, { label: string; shift: -1 | 0 | 1 }> = {
  lower: { label: "الحد الأدنى", shift: -1 },
  baseline: { label: "القيمة الأساسية", shift: 0 },
  upper: { label: "الحد الأعلى", shift: 1 },
};

const BASE_WEIGHTS: Record<PropertyType, Record<Scenario, [number, number, number, number]>> = {
  APARTMENT: { lower: [0.48, 0.37, 0.10, 0.05], baseline: [0.50, 0.35, 0.10, 0.05], upper: [0.52, 0.33, 0.10, 0.05] },
  VILLA: { lower: [0.43, 0.22, 0.30, 0.05], baseline: [0.45, 0.20, 0.30, 0.05], upper: [0.47, 0.18, 0.30, 0.05] },
  TOWNHOUSE: { lower: [0.43, 0.27, 0.25, 0.05], baseline: [0.45, 0.25, 0.25, 0.05], upper: [0.47, 0.23, 0.25, 0.05] },
  OFFICE: { lower: [0.38, 0.47, 0.10, 0.05], baseline: [0.40, 0.45, 0.10, 0.05], upper: [0.42, 0.43, 0.10, 0.05] },
  RETAIL: { lower: [0.33, 0.52, 0.10, 0.05], baseline: [0.35, 0.50, 0.10, 0.05], upper: [0.37, 0.48, 0.10, 0.05] },
  LAND: { lower: [0.78, 0, 0, 0.22], baseline: [0.80, 0, 0, 0.20], upper: [0.82, 0, 0, 0.18] },
  WAREHOUSE: { lower: [0.45, 0.35, 0.15, 0.05], baseline: [0.48, 0.32, 0.15, 0.05], upper: [0.50, 0.30, 0.15, 0.05] },
};

const FACTORS: Record<string, [number, number, number]> = {
  EXCELLENT: [1.06, 1.08, 1.10],
  GOOD: [1, 1, 1],
  FAIR: [0.80, 0.82, 0.85],
  NEEDS_RENOVATION: [0.72, 0.75, 0.78],
  WELL_MAINTAINED: [1.01, 1.03, 1.05],
  OLD_NEEDS_RENOVATION: [0.80, 0.82, 0.85],
  SEA: [1.13, 1.15, 1.17],
  PARTIAL_SEA: [1.06, 1.08, 1.10],
  CITY: [1.03, 1.05, 1.07],
  GARDEN: [1.02, 1.04, 1.06],
  PARK: [1.01, 1.02, 1.03],
  STREET: [0.95, 0.97, 0.99],
  INTERNAL: [0.98, 1, 1],
  UNKNOWN: [1, 1, 1],
  LUXURY: [1.13, 1.15, 1.17],
  NORMAL: [1, 1, 1],
  BASIC: [0.90, 0.92, 0.94],
  POOR: [0.78, 0.80, 0.82],
  FURNISHED: [1.02, 1.04, 1.06],
  SEMI_FURNISHED: [1.01, 1.02, 1.03],
  UNFURNISHED: [0.97, 0.98, 0.99],
  PENTHOUSE: [1.10, 1.12, 1.14],
  VERY_HIGH: [1.04, 1.06, 1.08],
  HIGH: [1.01, 1.03, 1.05],
  MID: [1, 1, 1],
  LOW: [0.95, 0.97, 0.99],
  GROUND: [0.93, 0.95, 0.97],
  MAIN_STREET: [1.06, 1.08, 1.10],
  CORNER_PLOT: [1.03, 1.05, 1.07],
  SECONDARY_STREET: [1, 1, 1],
  QUIET_STREET: [0.94, 0.96, 0.98],
};

const RESIDENTIAL = new Set<PropertyType>(["APARTMENT", "VILLA", "TOWNHOUSE"]);
const RATES = { vacancy: 0.10, expenses: 0.20, residentialCap: 0.07, commercialCap: 0.075, rentalGrowth: 0.02, discount: 0.10, exitCosts: 0.05, valueGrowth: 0.03 };

function factor(key: string, scenario: Scenario) {
  const index = scenario === "lower" ? 0 : scenario === "upper" ? 2 : 1;
  return FACTORS[key]?.[index] ?? 1;
}

function propertyFactor(input: ValuationInput, scenario: Scenario) {
  const age = Math.max(0, 2026 - input.yearBuilt);
  const ageFactor = age <= 5 ? [1, 0.99, 0.98] : age <= 10 ? [0.98, 0.97, 0.95] : age <= 20 ? [0.96, 0.94, 0.90] : age <= 30 ? [0.92, 0.88, 0.85] : [0.85, 0.82, 0.75];
  const ageIndex = scenario === "lower" ? 0 : scenario === "upper" ? 2 : 1;
  const sizeFactor = RESIDENTIAL.has(input.propertyType) ? input.area < 80 ? [1.02, 1.04, 1.06][ageIndex] : input.area > 200 ? [0.94, 0.96, 0.98][ageIndex] : 1 : 1;
  const accessibilityPenalty = 1 - input.accessibility * (scenario === "lower" ? 0.01 : scenario === "upper" ? 0.04 : 0.03);
  const studioFactor = input.propertyType === "APARTMENT" && input.bedrooms === 0 ? [0.75, 0.80, 0.85][ageIndex] : 1;
  return factor(input.condition, scenario) * factor(input.buildingCondition, scenario) * factor(input.view, scenario) * factor(input.finish, scenario) * factor(input.furnished, scenario) * factor(input.floor, scenario) * factor(input.street, scenario) * ageFactor[ageIndex] * sizeFactor * accessibilityPenalty * studioFactor;
}

function typeMatches(transaction: Transaction, propertyType: PropertyType) {
  const haystack = `${transaction.t} ${transaction.s}`.toUpperCase();
  const terms: Record<PropertyType, string[]> = {
    APARTMENT: ["APARTMENT", "UNIT", "FLAT"], VILLA: ["VILLA"], TOWNHOUSE: ["TOWNHOUSE"], OFFICE: ["OFFICE"], RETAIL: ["RETAIL", "SHOP"], LAND: ["LAND", "PLOT"], WAREHOUSE: ["WAREHOUSE"],
  };
  return terms[propertyType].some((term) => haystack.includes(term));
}

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const midpoint = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[midpoint] : (sorted[midpoint - 1] + sorted[midpoint]) / 2;
}

function daysBetween(earlier: string, later: string) {
  return Math.max(0, Math.round((new Date(later).getTime() - new Date(earlier).getTime()) / 86_400_000));
}

function monthsBetween(earlier: string, later: string) { return daysBetween(earlier, later) / 30.4375; }

function evidence(count: number, maxAge: number): { confidence: Confidence; score: number; level: "A" | "B" | "C" | "D" | "E" } {
  if (count >= 10 && maxAge <= 90) return { confidence: "مرتفع", score: 0.89, level: "A" };
  if (count >= 7 && maxAge <= 180) return { confidence: "متوسط", score: 0.73, level: "B" };
  if (count >= 5 && maxAge <= 365) return { confidence: "متوسط", score: 0.61, level: "C" };
  if (count >= 3 && maxAge <= 730) return { confidence: "أساسي", score: 0.44, level: "D" };
  return { confidence: "منخفض", score: 0.28, level: "E" };
}

function salesApproach(input: ValuationInput, comparables: ComparableView[], scenario: Scenario, evidenceScore: number): ApproachResult | undefined {
  if (comparables.length < 3) return undefined;
  const adjustedPpsm = median(comparables.map((item) => item.adjustedPricePerSqm));
  const value = adjustedPpsm * input.area * propertyFactor(input, scenario);
  return { id: "sales", label: "مقارنة السوق", value, baseWeight: 0, appliedWeight: 0, confidence: evidenceScore, note: `${comparables.length} معاملة بعد تصحيح زمني ونطاق بحث متكيّف` };
}

function incomeApproach(input: ValuationInput): ApproachResult | undefined {
  if (!input.annualRent || input.annualRent <= 0 || input.propertyType === "LAND") return undefined;
  const noi = input.annualRent * (1 - RATES.vacancy - RATES.expenses);
  const capRate = RESIDENTIAL.has(input.propertyType) ? RATES.residentialCap : RATES.commercialCap;
  return { id: "income", label: "رأسملة الدخل", value: noi / capRate, baseWeight: 0, appliedWeight: 0, confidence: 0.54, note: `صافي الدخل التشغيلي ÷ معدل الرسملة ${(capRate * 100).toFixed(1)}%` };
}

function costApproach(input: ValuationInput): ApproachResult | undefined {
  if (!input.replacementCost || input.replacementCost <= 0 || input.propertyType === "APARTMENT" || input.propertyType === "LAND") return undefined;
  const age = Math.max(0, 2026 - input.yearBuilt);
  const depreciation = age <= 5 ? 0.01 : age <= 10 ? 0.03 : age <= 20 ? 0.06 : age <= 30 ? 0.12 : 0.18;
  const value = (input.landValue || 0) + input.replacementCost * input.area * (1 - depreciation);
  return { id: "cost", label: "نهج التكلفة", value, baseWeight: 0, appliedWeight: 0, confidence: 0.45, note: `تكلفة الاستبدال ناقص إهلاك عمره ${age} سنة` };
}

function dcfApproach(input: ValuationInput): ApproachResult | undefined {
  if (!input.annualRent || input.annualRent <= 0) return undefined;
  const initialNoi = input.annualRent * (1 - RATES.vacancy - RATES.expenses);
  let discountedCashflows = 0;
  for (let year = 1; year <= 10; year += 1) discountedCashflows += initialNoi * (1 + RATES.rentalGrowth) ** year / (1 + RATES.discount) ** year;
  const terminalNoi = initialNoi * (1 + RATES.rentalGrowth) ** 11;
  const terminalValue = terminalNoi / (RESIDENTIAL.has(input.propertyType) ? RATES.residentialCap : RATES.commercialCap);
  const discountedTerminal = terminalValue * (1 - RATES.exitCosts) / (1 + RATES.discount) ** 10;
  return { id: "dcf", label: "التدفقات المخصومة", value: discountedCashflows + discountedTerminal, baseWeight: 0, appliedWeight: 0, confidence: 0.38, note: "توقع 10 سنوات: نمو الإيجار 2%، خصم 10%، وتكلفة خروج 5%" };
}

function executeScenario(input: ValuationInput, comparables: ComparableView[], scenario: Scenario, evidenceScore: number): ScenarioResult {
  const raw = [salesApproach(input, comparables, scenario, evidenceScore), incomeApproach(input), costApproach(input), dcfApproach(input)].filter(Boolean) as ApproachResult[];
  const weights = BASE_WEIGHTS[input.propertyType][scenario];
  const rawWeights: Record<ApproachResult["id"], number> = { sales: weights[0], income: weights[1], cost: weights[2], dcf: weights[3] };
  const availableWeight = raw.reduce((sum, item) => sum + rawWeights[item.id], 0);
  const approaches = raw.map((item) => ({ ...item, baseWeight: rawWeights[item.id], appliedWeight: availableWeight > 0 ? rawWeights[item.id] / availableWeight : 0 }));
  const value = approaches.reduce((sum, item) => sum + item.value * item.appliedWeight, 0);
  const warnings: string[] = [];
  if (availableWeight < 0.999) warnings.push("أعيد توزيع أوزان المنهجية على المناهج ذات البيانات المتاحة فقط.");
  return { scenario, label: SCENARIOS[scenario].label, value, approaches, warnings };
}

export function evaluate(input: ValuationInput, dataset: DldDataset): ValuationResult | null {
  const asOf = dataset.retrievedAt;
  const exact = dataset.records.filter((record) => record.x === input.district && typeMatches(record, input.propertyType));
  const typed = dataset.records.filter((record) => typeMatches(record, input.propertyType));
  const pool = exact.length >= 3 ? exact : typed;
  if (pool.length < 3) return null;
  const windows = [90, 180, 365, 730];
  const requested = windows.find((days) => pool.filter((record) => daysBetween(record.d, asOf) <= days).length >= 5) || 730;
  const windowed = pool.filter((record) => daysBetween(record.d, asOf) <= requested);
  const comparableBase = (windowed.length >= 3 ? windowed : pool).sort((a, b) => new Date(b.d).getTime() - new Date(a.d).getTime()).slice(0, 12);
  const comparables = comparableBase.map((record) => {
    const monthsOld = monthsBetween(record.d, asOf);
    return { ...record, monthsOld, adjustedPricePerSqm: (record.p / record.a) * (1 + RATES.valueGrowth / 12) ** monthsOld };
  });
  const maxAge = Math.max(...comparables.map((record) => daysBetween(record.d, asOf)));
  const support = evidence(comparables.length, maxAge);
  const lower = executeScenario(input, comparables, "lower", support.score);
  const baseline = executeScenario(input, comparables, "baseline", support.score);
  const upper = executeScenario(input, comparables, "upper", support.score);
  const rangeWidthPercent = baseline.value > 0 ? ((upper.value - lower.value) / baseline.value) * 100 : 0;
  const warnings = [
    ...(exact.length < 3 ? ["لم تتوافر ثلاث مقارنات متجانسة في المنطقة المختارة؛ استُخدم نطاق نوع العقار على مستوى دبي."] : []),
    ...(comparables.length < 5 ? ["عدد المقارنات أقل من خمسة؛ لا يُنصح باستخدام النتيجة كبديل لتقييم مهني مكتبي."] : []),
    ...baseline.warnings,
  ];
  return { lower, baseline, upper, comparables, confidence: support.confidence, confidenceScore: support.score, evidenceLevel: support.level, usedFallback: exact.length < 3, timeWindowDays: requested, pricePerSqm: median(comparables.map((item) => item.adjustedPricePerSqm)), rangeWidthPercent, warnings };
}

export function formatAED(value: number, compact = false) {
  return new Intl.NumberFormat("ar-AE", { style: "currency", currency: "AED", notation: compact ? "compact" : "standard", maximumFractionDigits: 0 }).format(value);
}

export function readableDistrict(value: string) {
  return value.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}
