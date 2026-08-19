import type { Config } from "@netlify/functions";

export type BuildStampEnvironment = {
  commitRef?: string;
  branch?: string;
  context?: string;
};

export type BuildStamp = {
  schemaVersion: "MIAYAAR-BUILD-STAMP-1";
  commitRef: string;
  branch: string;
  context: string;
};

function publicValue(value: string | undefined): string {
  return value?.trim() || "unknown";
}

export function createBuildStamp(environment: BuildStampEnvironment): BuildStamp {
  return {
    schemaVersion: "MIAYAAR-BUILD-STAMP-1",
    commitRef: publicValue(environment.commitRef),
    branch: publicValue(environment.branch),
    context: publicValue(environment.context),
  };
}

export default async (request: Request): Promise<Response> => {
  if (request.method !== "GET") {
    return new Response(JSON.stringify({ error: { code: "METHOD_NOT_ALLOWED", message: "GET is required." } }), {
      status: 405,
      headers: { Allow: "GET", "content-type": "application/json", "cache-control": "no-store" },
    });
  }

  const stamp = createBuildStamp({
    commitRef: Netlify.env.get("COMMIT_REF"),
    branch: Netlify.env.get("BRANCH"),
    context: Netlify.env.get("CONTEXT"),
  });

  return new Response(JSON.stringify(stamp), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
};

export const config: Config = {
  path: "/_miayaar/build",
};
