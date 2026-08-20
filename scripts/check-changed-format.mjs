import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

const formatExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".ts",
  ".tsx",
  ".yaml",
  ".yml",
]);

function git(args) {
  return execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function isPrettierCompliant(file, content) {
  try {
    execFileSync(
      "pnpm",
      ["exec", "prettier", "--check", "--stdin-filepath", file],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        input: content,
        stdio: ["pipe", "pipe", "pipe"],
      }
    );
    return true;
  } catch {
    return false;
  }
}

const baseRef = process.env.FORMAT_BASE_REF ?? "origin/main";
let mergeBase;

try {
  mergeBase = git(["merge-base", baseRef, "HEAD"]);
} catch {
  console.error(
    "Unable to find a merge base with " +
      baseRef +
      ". Fetch the base branch or set FORMAT_BASE_REF explicitly."
  );
  process.exit(2);
}

const changedFiles = [
  ...git(["diff", "--name-only", "--diff-filter=ACMR", mergeBase])
    .split("\n")
    .filter(Boolean),
  ...git(["ls-files", "--others", "--exclude-standard"])
    .split("\n")
    .filter(Boolean),
]
  .filter(file =>
    formatExtensions.has(file.slice(file.lastIndexOf(".")).toLowerCase())
  )
  .filter(existsSync)
  .filter((file, index, files) => files.indexOf(file) === index);

if (changedFiles.length === 0) {
  console.log("No changed, Prettier-supported files to check.");
  process.exit(0);
}

console.log(
  "Checking formatting for " +
    changedFiles.length +
    " changed file(s) against " +
    baseRef +
    "."
);

const filesToCheck = changedFiles.filter(file => {
  let baseline;

  try {
    baseline = git(["show", mergeBase + ":" + file]);
  } catch {
    return true;
  }

  if (baseline && !isPrettierCompliant(file, baseline)) {
    console.log(
      "Skipping " +
        file +
        " because its baseline version is not Prettier-compliant."
    );
    return false;
  }
  return true;
});

if (filesToCheck.length === 0) {
  console.log("No baseline-compliant changed files to check.");
  process.exit(0);
}

execFileSync("pnpm", ["exec", "prettier", "--check", ...filesToCheck], {
  stdio: "inherit",
});
