import { readFile, writeFile } from "node:fs/promises";
import { cleanDldRecords } from "./lib/dld-evidence-cleaning.mjs";

const inputPath = process.env.DLD_SOURCE_PATH ?? "/home/ubuntu/webdev-static-assets/miayaar-dld-comparables.json";
const reportPath = process.env.DLD_CLEANING_REPORT_PATH;

const dataset = JSON.parse(await readFile(inputPath, "utf8"));
const result = cleanDldRecords(dataset.records);
const report = {
  source: dataset.source ?? "DLD",
  inputPath,
  ...result.summary,
  issues: result.issues,
};

if (reportPath) {
  if (reportPath === inputPath) throw new Error("DLD_CLEANING_REPORT_PATH must not overwrite the raw source file.");
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

console.log(JSON.stringify(report, null, 2));
