import type { DeploySucceededEvent } from "@netlify/functions";

export const MIAYAAR_NETLIFY_SITE_ID = "2b4393c8-233e-4ed7-b315-ba633589fb82";
export const PRODUCTION_BUILD_STAMP_URL =
  "https://miayaar.netlify.app/_miayaar/build";

export type ProductionBuildStamp = {
  schemaVersion: "MIAYAAR-BUILD-STAMP-1";
  commitRef: string;
  branch: string;
  context: string;
};

export type DeployAttestationOutcome =
  | "IGNORED_UNEXPECTED_SITE"
  | "IGNORED_NON_PRODUCTION_MAIN"
  | "INVALID_EVENT"
  | "STAMP_UNAVAILABLE"
  | "MALFORMED_STAMP"
  | "MATCH"
  | "MISMATCH";

export type DeployAttestation = {
  schemaVersion: "MIAYAAR-DEPLOY-ATTESTATION-1";
  outcome: DeployAttestationOutcome;
  deployId: string | null;
  siteId: string | null;
  expectedCommitRef: string | null;
  observedCommitRef: string | null;
  observedBranch: string | null;
  observedContext: string | null;
};

export type BuildStampFetcher = (
  input: string
) => Promise<Pick<Response, "ok" | "json">>;

function record(
  outcome: DeployAttestationOutcome,
  event: DeploySucceededEvent,
  observed: Partial<ProductionBuildStamp> = {}
): DeployAttestation {
  return {
    schemaVersion: "MIAYAAR-DEPLOY-ATTESTATION-1",
    outcome,
    deployId: typeof event.deploy?.id === "string" ? event.deploy.id : null,
    siteId: typeof event.site?.id === "string" ? event.site.id : null,
    expectedCommitRef:
      typeof event.deploy?.commitRef === "string"
        ? event.deploy.commitRef
        : null,
    observedCommitRef:
      typeof observed.commitRef === "string" ? observed.commitRef : null,
    observedBranch:
      typeof observed.branch === "string" ? observed.branch : null,
    observedContext:
      typeof observed.context === "string" ? observed.context : null,
  };
}

function isBuildStamp(value: unknown): value is ProductionBuildStamp {
  if (!value || typeof value !== "object") return false;

  const stamp = value as Record<string, unknown>;
  return (
    stamp.schemaVersion === "MIAYAAR-BUILD-STAMP-1" &&
    typeof stamp.commitRef === "string" &&
    typeof stamp.branch === "string" &&
    typeof stamp.context === "string"
  );
}

/**
 * Compares one Netlify Deploy succeeded event with the public production build
 * stamp. It never requests a valuation path, database, DLD source, or audit API.
 */
export async function attestProductionDeploy(
  event: DeploySucceededEvent,
  fetchBuildStamp: BuildStampFetcher = fetch
): Promise<DeployAttestation> {
  if (event.site?.id !== MIAYAAR_NETLIFY_SITE_ID) {
    return record("IGNORED_UNEXPECTED_SITE", event);
  }

  if (
    event.deploy?.context !== "production" ||
    event.deploy?.branch !== "main"
  ) {
    return record("IGNORED_NON_PRODUCTION_MAIN", event);
  }

  if (!event.deploy?.id || !event.deploy.commitRef) {
    return record("INVALID_EVENT", event);
  }

  let response: Pick<Response, "ok" | "json">;
  try {
    response = await fetchBuildStamp(PRODUCTION_BUILD_STAMP_URL);
  } catch {
    return record("STAMP_UNAVAILABLE", event);
  }

  if (!response.ok) {
    return record("STAMP_UNAVAILABLE", event);
  }

  let candidate: unknown;
  try {
    candidate = await response.json();
  } catch {
    return record("MALFORMED_STAMP", event);
  }

  if (!isBuildStamp(candidate)) {
    return record("MALFORMED_STAMP", event);
  }

  const matches =
    candidate.commitRef === event.deploy.commitRef &&
    candidate.branch === "main" &&
    candidate.context === "production";

  return record(matches ? "MATCH" : "MISMATCH", event, candidate);
}

function logAttestation(attestation: DeployAttestation): void {
  // This is the sole record destination. It intentionally includes no secret,
  // request body, valuation data, DLD evidence, or user data.
  console.info("[Deploy attestation]", JSON.stringify(attestation));
}

/**
 * Netlify invokes this typed event handler only after platform JWS verification.
 * It intentionally exposes no HTTP path and does not require an application secret.
 */
export async function deploySucceeded(
  event: DeploySucceededEvent
): Promise<void> {
  logAttestation(await attestProductionDeploy(event));
}

export default { deploySucceeded };
