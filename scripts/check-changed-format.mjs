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
  return execFileSync("git", args, { encoding: "utf8" }).trim();
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
execFileSync("pnpm", ["exec", "prettier", "--check", ...changedFiles], {
  stdio: "inherit",
});
