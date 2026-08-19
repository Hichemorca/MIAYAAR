import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = resolve(projectRoot, "netlify/generated/build-stamp.ts");

function publicValue(value) {
  return value?.trim() || "unknown";
}

const stamp = {
  schemaVersion: "MIAYAAR-BUILD-STAMP-1",
  commitRef: publicValue(process.env.COMMIT_REF),
  branch: publicValue(process.env.BRANCH),
  context: publicValue(process.env.CONTEXT),
};

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `// Generated during the build; do not commit.\nexport const BUILD_STAMP = ${JSON.stringify(stamp, null, 2)} as const;\n`);
