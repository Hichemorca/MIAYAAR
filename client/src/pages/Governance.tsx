import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import {
  AlertTriangle,
  Database,
  FileCheck2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

function formatDate(value: Date | null | undefined) {
  return value ? new Date(value).toLocaleString() : "Not recorded";
}

function Metric({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-background/70 p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function GovernanceLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-28 w-full rounded-2xl" />
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
      <Skeleton className="h-96 w-full rounded-2xl" />
    </div>
  );
}

function GovernanceAccessDenied() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl items-center">
      <Card className="w-full border-amber-200 bg-amber-50/60 shadow-sm dark:border-amber-900 dark:bg-amber-950/20">
        <CardHeader>
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <CardTitle>Administrative access required</CardTitle>
          <CardDescription>
            This route exposes governance records only to the persisted MIAYAAR
            administrator role.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

function GovernanceContent() {
  const { user } = useAuth();
  const overview = trpc.governance.overview.useQuery(undefined, {
    enabled: user?.role === "admin",
  });
  const connectionRole = trpc.governance.admin.connectionRole.useQuery(
    undefined,
    {
      enabled: user?.role === "admin",
    }
  );

  if (user?.role !== "admin") return <GovernanceAccessDenied />;
  if (overview.isLoading) return <GovernanceLoading />;

  if (overview.isError || !overview.data) {
    return (
      <Card className="border-destructive/40">
        <CardHeader>
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <CardTitle>Governance records are unavailable</CardTitle>
          <CardDescription>
            The platform did not return the administrative read model. No
            configuration change was attempted.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { configuration, storage } = overview.data;
  const release = configuration.frozenRelease;
  const roleEvidence = connectionRole.data;
  const roleEvidenceUnavailable =
    connectionRole.isError ||
    !roleEvidence ||
    roleEvidence.status === "UNAVAILABLE";

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 p-6 text-slate-50 shadow-lg sm:p-8">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
              <ShieldCheck className="h-4 w-4" />
              Controlled administrative visibility
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Governance &amp; evidence register
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Read-only facts from the frozen methodology registry and DLD
              evidence store. This surface cannot change valuations, methods,
              weights, parameters, sources, or historical records.
            </p>
          </div>
          <Badge className="w-fit border border-cyan-300/30 bg-cyan-400/15 px-3 py-1 text-cyan-100 hover:bg-cyan-400/15">
            Read-only
          </Badge>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Metric
          label="Methodology"
          value={`v${release.version}`}
          description={`${release.documentId} · ${release.status}`}
        />
        <Metric
          label="Eligible DLD records"
          value={
            storage.available
              ? String(storage.evidence.eligibleRecords)
              : "Unavailable"
          }
          description="Persisted eligible evidence only"
        />
        <Metric
          label="Latest eligible evidence"
          value={
            storage.available
              ? formatDate(storage.evidence.latestEligibleTransactionDate)
              : "Unavailable"
          }
          description="Transaction date, not a technical audit time"
        />
      </section>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Server connection role
              </CardTitle>
              <CardDescription>
                Read-only runtime evidence from the deployed server connection.
                Connection strings, credentials, hosts, and application data are
                not exposed.
              </CardDescription>
            </div>
            <Badge
              variant={roleEvidenceUnavailable ? "secondary" : "outline"}
            >
              {roleEvidenceUnavailable ? "Evidence unavailable" : "Observed"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {connectionRole.isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
            </div>
          ) : roleEvidenceUnavailable ? (
            <p className="rounded-lg bg-muted/60 p-3 text-sm leading-6 text-muted-foreground">
              Evidence unavailable. No role attributes could be observed from
              the current server connection, and no configuration change was
              attempted.
            </p>
          ) : (
            <div className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-border/70 p-4">
                <p className="text-muted-foreground">Effective role</p>
                <p className="mt-1 break-all font-mono text-sm font-medium">
                  {roleEvidence.effectiveRole}
                </p>
              </div>
              <div className="rounded-xl border border-border/70 p-4">
                <p className="text-muted-foreground">Session role</p>
                <p className="mt-1 break-all font-mono text-sm font-medium">
                  {roleEvidence.sessionRole}
                </p>
              </div>
              <div className="rounded-xl border border-border/70 p-4">
                <p className="text-muted-foreground">Role alignment</p>
                <p className="mt-1 font-medium">
                  {roleEvidence.effectiveRoleMatchesSessionRole
                    ? "Matches"
                    : "Differs"}
                </p>
              </div>
              <div className="rounded-xl border border-border/70 p-4">
                <p className="text-muted-foreground">Role attributes</p>
                <p className="mt-1 font-medium">
                  Superuser: {roleEvidence.isSuperuser ? "Yes" : "No"}
                </p>
                <p className="text-muted-foreground">
                  Bypasses RLS: {roleEvidence.bypassesRls ? "Yes" : "No"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck2 className="h-5 w-5 text-primary" />
                  Frozen methodology release
                </CardTitle>
                <CardDescription>
                  Canonical release facts and scenario allocations from the
                  current server registry.
                </CardDescription>
              </div>
              <Badge variant="outline">Immutable</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground">Checksum</p>
                <p className="mt-1 break-all font-mono text-xs">
                  {configuration.checksum}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">
                  Persisted release records
                </p>
                <p className="mt-1 font-semibold">
                  {storage.available
                    ? storage.methodologyVersions.length
                    : "Unavailable"}
                </p>
              </div>
            </div>
            <Separator />
            <div className="space-y-4">
              {Object.entries(release.weightsByPropertyType).map(
                ([propertyType, scenarios]) => (
                  <div
                    key={propertyType}
                    className="rounded-xl border border-border/70 p-4"
                  >
                    <p className="mb-3 text-sm font-semibold">{propertyType}</p>
                    <div className="grid gap-3 md:grid-cols-3">
                      {Object.entries(scenarios ?? {}).map(
                        ([scenario, weights]) => (
                          <div
                            key={scenario}
                            className="rounded-lg bg-muted/50 p-3"
                          >
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              {scenario}
                            </p>
                            <p className="mt-2 text-xs leading-5 text-foreground">
                              {Object.entries(weights)
                                .map(
                                  ([method, value]) =>
                                    `${method}: ${(Number(value) * 100).toFixed(0)}%`
                                )
                                .join(" · ")}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                DLD provenance
              </CardTitle>
              <CardDescription>
                Import-run facts and evidence coverage; no source collection
                occurs here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {storage.available && storage.latestImport ? (
                <>
                  <div>
                    <p className="text-muted-foreground">Latest source label</p>
                    <p className="mt-1 font-medium">
                      {storage.latestImport.sourceLabel}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Import status</p>
                    <p className="mt-1 font-medium capitalize">
                      {storage.latestImport.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Completed</p>
                    <p className="mt-1 font-medium">
                      {formatDate(storage.latestImport.completedAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Rejected records</p>
                    <p className="mt-1 font-medium">
                      {storage.evidence.rejectedRecords}
                    </p>
                  </div>
                </>
              ) : (
                <p className="rounded-lg bg-muted/60 p-3 text-sm leading-6 text-muted-foreground">
                  No persisted import-run record is available to this read
                  model.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contract registry</CardTitle>
              <CardDescription>
                Actual public property-submission fields. Field applicability
                remains unresolved where no governing rule exists.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {configuration.propertySubmissionFields.map(field => (
                  <Badge key={field} variant="secondary">
                    {field}
                  </Badge>
                ))}
              </div>
              <p className="mt-4 text-xs leading-5 text-muted-foreground">
                Administrative mutation status: {configuration.mutationStatus}.
                This page records the constraint instead of exposing editable
                inputs.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

export default function Governance() {
  return (
    <DashboardLayout>
      <GovernanceContent />
    </DashboardLayout>
  );
}
