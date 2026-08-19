import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import {
  calculateBacktestMetrics,
  estimateDldObservableTarget,
  type BacktestEstimate,
  type BacktestPropertyType,
  type DldObservableBacktestRow,
} from '../server/valuation/dld-observable-backtesting';

const PROTOCOL_ID = 'MIAYAAR-BT-001';
const TARGET_START = new Date('2026-04-02T00:00:00.000Z');
const TARGET_END_EXCLUSIVE = new Date('2026-07-27T00:00:00.000Z');
const REPORTABLE_DISTRICT_COMPLETED_COUNT = 30;
const PROPERTY_TYPES = new Set<BacktestPropertyType>(['apartment', 'villa', 'townhouse', 'office', 'retail', 'land', 'warehouse']);

interface RawExportRow {
  sourceTransactionId: string;
  transactionDate: string;
  district: string;
  propertyType: string;
  areaSqm: number | string;
  salePriceAed: number | string;
  pricePerSqm: number | string;
}

interface AggregatedCohort {
  readonly eligibleTargets: number;
  readonly completedTargets: number;
  readonly rejectedTargets: number;
  readonly coverage: number;
  readonly rejectionRate: number;
  readonly primary: { readonly maeAed: number; readonly mdape: number; readonly signedBias: number };
  readonly baseline: { readonly maeAed: number; readonly mdape: number; readonly signedBias: number };
  readonly mdapeDelta: number;
}

function parseRow(raw: RawExportRow, index: number): DldObservableBacktestRow {
  const transactionDate = new Date(raw.transactionDate);
  const propertyType = raw.propertyType as BacktestPropertyType;
  if (!raw.sourceTransactionId || !raw.district || !PROPERTY_TYPES.has(propertyType) || Number.isNaN(transactionDate.getTime())) {
    throw new Error(`Invalid DLD export row at index ${index}.`);
  }
  const areaSqm = Number(raw.areaSqm);
  const salePriceAed = Number(raw.salePriceAed);
  const pricePerSqm = Number(raw.pricePerSqm);
  if (![areaSqm, salePriceAed, pricePerSqm].every(value => Number.isFinite(value) && value > 0)) {
    throw new Error(`Non-positive or invalid numeric evidence at row ${index}.`);
  }
  return { sourceTransactionId: raw.sourceTransactionId, transactionDate, district: raw.district, propertyType, areaSqm, salePriceAed, pricePerSqm };
}

function inTargetPeriod(row: DldObservableBacktestRow): boolean {
  return row.transactionDate >= TARGET_START && row.transactionDate < TARGET_END_EXCLUSIVE;
}

function metricsFor(results: readonly BacktestEstimate[]): AggregatedCohort {
  return calculateBacktestMetrics(results);
}

function groupResults(results: readonly BacktestEstimate[], key: (result: BacktestEstimate) => string): Map<string, BacktestEstimate[]> {
  const groups = new Map<string, BacktestEstimate[]>();
  results.forEach(result => {
    const groupKey = key(result);
    const group = groups.get(groupKey) ?? [];
    group.push(result);
    groups.set(groupKey, group);
  });
  return groups;
}

function evidenceGroupKey(row: Pick<DldObservableBacktestRow, 'district' | 'propertyType'>): string {
  return `${row.district}\u0000${row.propertyType}`;
}

function orderedCohorts(groups: Map<string, BacktestEstimate[]>, predicate?: (cohort: AggregatedCohort) => boolean): Record<string, AggregatedCohort> {
  return Object.fromEntries(
    [...groups.entries()]
      .map(([key, results]) => [key, metricsFor(results)] as const)
      .filter(([, cohort]) => !predicate || predicate(cohort))
      .sort(([left], [right]) => left.localeCompare(right)),
  );
}

async function main(): Promise<void> {
  const inputPath = process.env.BACKTEST_INPUT;
  const outputPath = process.env.BACKTEST_OUTPUT;
  if (!inputPath || !outputPath) {
    throw new Error('BACKTEST_INPUT and BACKTEST_OUTPUT are both required.');
  }

  const inputBytes = await readFile(resolve(inputPath));
  const rawRows = JSON.parse(inputBytes.toString('utf8')) as RawExportRow[];
  if (!Array.isArray(rawRows)) throw new Error('BACKTEST_INPUT must contain a JSON array of eligible DLD rows.');
  const rows = rawRows.map(parseRow);
  const targetRows = rows.filter(inTargetPeriod);
  const rowsByEvidenceGroup = new Map<string, DldObservableBacktestRow[]>();
  rows.forEach(row => {
    const key = evidenceGroupKey(row);
    const group = rowsByEvidenceGroup.get(key) ?? [];
    group.push(row);
    rowsByEvidenceGroup.set(key, group);
  });
  const results = targetRows.map(target => estimateDldObservableTarget(rowsByEvidenceGroup.get(evidenceGroupKey(target))!, target));

  const output = {
    protocolId: PROTOCOL_ID,
    methodology: { documentId: 'MIAYAAR-METH-001', version: '1.2' },
    execution: {
      gitRevision: process.env.GIT_COMMIT ?? 'unavailable',
      inputSha256: createHash('sha256').update(inputBytes).digest('hex'),
      sourceRowsRead: rows.length,
      targetPeriod: { startInclusive: TARGET_START.toISOString(), endExclusive: TARGET_END_EXCLUSIVE.toISOString() },
      targetRowsSelected: targetRows.length,
      writePolicy: 'read-only; no valuation request, audit, methodology, or evidence writes',
    },
    overall: metricsFor(results),
    byPropertyType: orderedCohorts(groupResults(results, result => result.propertyType)),
    byDistrictWithAtLeast30Completed: orderedCohorts(
      groupResults(results, result => result.district),
      cohort => cohort.completedTargets >= REPORTABLE_DISTRICT_COMPLETED_COUNT,
    ),
  };

  await mkdir(dirname(resolve(outputPath)), { recursive: true });
  await writeFile(resolve(outputPath), `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ protocolId: output.protocolId, sourceRowsRead: output.execution.sourceRowsRead, targetRowsSelected: output.execution.targetRowsSelected, overall: output.overall }, null, 2));
}

void main();
