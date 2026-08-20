import { lazy, Suspense, useMemo, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Building2,
  Check,
  CircleHelp,
  Gauge,
  Landmark,
  LoaderCircle,
  MapPinned,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import type { PropertySubmission } from "@shared/valuation/contracts";
import { trpc } from "@/lib/trpc";

const LazyValuationReport = lazy(() => import("@/components/ValuationReport"));

const HERO_URL = "/manus-storage/miayaar-hero-atlas_f1470738.png";
const DISTRICT_ART_URL = "/manus-storage/miayaar-district-card_52080fb3.png";
const PATTERN_URL = "/manus-storage/miayaar-evidence-pattern_b999ae17.png";
const LOGO_URL = "/manus-storage/miayaar-logo-mark_6a147430.png";

const propertyTypes = [
  ["apartment", "Apartment"],
  ["villa", "Villa"],
  ["townhouse", "Townhouse"],
  ["office", "Office"],
  ["retail", "Retail"],
  ["land", "Land"],
  ["warehouse", "Warehouse"],
] as const;

const districts = [
  "JUMEIRAH VILLAGE CIRCLE",
  "BUSINESS BAY",
  "DUBAI MARINA",
  "BURJ KHALIFA",
  "DUBAI CREEK HARBOUR",
] as const;

const titleize = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, letter => letter.toUpperCase());

function SelectField({ label, value, children, onChange }: { label: string; value: string; children: React.ReactNode; onChange: (value: string) => void }) {
  return (
    <label className="mi-field">
      <span>{label}</span>
      <select value={value} onChange={event => onChange(event.target.value)}>{children}</select>
    </label>
  );
}

function NumberField({ label, value, onChange, suffix, min = 0, step = 1, optional = false }: { label: string; value?: number; onChange: (value?: number) => void; suffix: string; min?: number; step?: number; optional?: boolean }) {
  return (
    <label className="mi-field">
      <span>{label}{optional && <em>Optional</em>}</span>
      <div className="number-input">
        <input type="number" min={min} step={step} value={value ?? ""} onChange={event => onChange(event.target.value === "" ? undefined : Number(event.target.value))} />
        <b>{suffix}</b>
      </div>
    </label>
  );
}

export default function Home() {
  const [form, setForm] = useState<PropertySubmission>({
    propertyType: "apartment",
    district: "JUMEIRAH VILLAGE CIRCLE",
    areaSqm: 100,
    bedrooms: 1,
    yearBuilt: 2019,
    condition: "good",
    buildingCondition: "well_maintained",
    views: ["city"],
    finish: "normal",
    furnished: "semi_furnished",
    floor: "high",
    streetPosition: "secondary_street",
    annualRentAed: 120_000,
  });
  const valuation = trpc.valuation.run.useMutation({
    onSuccess: () => window.setTimeout(() => document.getElementById("valuation-report")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80),
  });
  const report = valuation.data?.report;
  const resultSummary = useMemo(() => {
    if (!report) return "No valuation has been run for this property profile.";
    if (report.status === "rejected") return "MIAYAAR withheld a value because the local evidence threshold was not met.";
    return "The value range is calculated from independently prepared evidence and the frozen methodology configuration.";
  }, [report]);

  function update<K extends keyof PropertySubmission>(key: K, value: PropertySubmission[K]) {
    setForm(current => ({ ...current, [key]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    valuation.mutate(form);
  }

  return (
    <main className="mi-app">
      <aside className="mi-rail" aria-label="MIAYAAR methodology status">
        <a className="mi-rail-logo" href="#top"><img src={LOGO_URL} alt="MIAYAAR" /><span>MIAYAAR</span></a>
        <div className="rail-rule" />
        <div className="rail-version"><span>Methodology</span><b>v1.2</b><small>Dubai · UAE</small></div>
        <span className="rail-live"><i />Engine active</span>
      </aside>

      <div className="mi-canvas">
        <header className="mi-topbar">
          <a className="mi-wordmark" href="#top"><img src={LOGO_URL} alt="" /><span>MIAYAAR</span><em>Evidence-led valuation</em></a>
          <nav aria-label="Page navigation"><a href="#workbench">Property file</a><a href="#valuation-report">Valuation</a><a href="#evidence">Evidence</a></nav>
          <div className="mi-source-status"><i /><span>DLD evidence registry</span><b>30,325 records</b></div>
        </header>

        <section id="top" className="mi-hero">
          <div className="hero-copy">
            <p className="mi-eyebrow">Property valuation intelligence · Dubai</p>
            <h1>Don’t ask the market for <em>a number.</em><br />Ask it for <em>evidence.</em></h1>
            <p className="hero-summary">MIAYAAR produces a transparent value range from local transaction evidence, applicable valuation approaches, and a frozen methodology version.</p>
            <div className="hero-points"><span><Check size={15} />Verified DLD transactions</span><span><Check size={15} />Independent scenarios</span><span><Check size={15} />No value without evidence</span></div>
          </div>
          <div className="hero-map" style={{ backgroundImage: `url(${HERO_URL})` }}>
            <div className="map-caption"><span>Decision map</span><b>Value horizon</b><small>Lower · Baseline · Upper</small></div>
            <div className="map-key"><i /><span>Evidence layers</span></div>
          </div>
        </section>

        <section id="workbench" className="mi-workbench" style={{ backgroundImage: `linear-gradient(90deg, rgba(244,240,232,.98), rgba(244,240,232,.76)), url(${PATTERN_URL})` }}>
          <div className="workbench-heading">
            <div><p className="mi-eyebrow">Decision inputs</p><h2>Property file</h2><p>Enter facts you can support. Where a valuation approach lacks a required input, MIAYAAR discloses the limitation instead of inferring it.</p></div>
            <div className="source-card"><MapPinned size={18} /><span>Reference market</span><b>Dubai · DLD</b></div>
          </div>

          <form onSubmit={submit}>
            <div className="mi-input-grid">
              <fieldset><legend><Building2 size={17} />Identity & location</legend>
                <SelectField label="Asset type" value={form.propertyType} onChange={value => update("propertyType", value as PropertySubmission["propertyType"])}>{propertyTypes.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</SelectField>
                <SelectField label="District" value={form.district} onChange={value => update("district", value)}>{districts.map(district => <option value={district} key={district}>{titleize(district)}</option>)}</SelectField>
                <div className="mi-fields-two"><NumberField label="Internal area" value={form.areaSqm} onChange={value => update("areaSqm", value ?? 0)} suffix="sqm" min={15} /><NumberField label="Bedrooms" value={form.bedrooms} onChange={value => update("bedrooms", value)} suffix="rooms" min={0} /></div>
              </fieldset>
              <fieldset><legend><SlidersHorizontal size={17} />Value characteristics</legend>
                <div className="mi-fields-two"><SelectField label="Unit condition" value={form.condition} onChange={value => update("condition", value as PropertySubmission["condition"])}>{["excellent", "good", "fair", "needs_renovation"].map(value => <option key={value} value={value}>{titleize(value)}</option>)}</SelectField><SelectField label="Building condition" value={form.buildingCondition} onChange={value => update("buildingCondition", value as PropertySubmission["buildingCondition"])}>{["excellent", "well_maintained", "fair", "old_needs_renovation"].map(value => <option key={value} value={value}>{titleize(value)}</option>)}</SelectField></div>
                <div className="mi-fields-two"><SelectField label="Primary view" value={form.views[0]} onChange={value => update("views", [value as PropertySubmission["views"][number]])}>{["city", "sea", "partial_sea", "garden", "park", "street", "internal", "unknown"].map(value => <option key={value} value={value}>{titleize(value)}</option>)}</SelectField><SelectField label="Finish quality" value={form.finish} onChange={value => update("finish", value as PropertySubmission["finish"])}>{["luxury", "good", "normal", "basic", "poor"].map(value => <option key={value} value={value}>{titleize(value)}</option>)}</SelectField></div>
                <div className="mi-fields-two"><SelectField label="Furnishing" value={form.furnished ?? "unfurnished"} onChange={value => update("furnished", value as NonNullable<PropertySubmission["furnished"]>)}>{["furnished", "semi_furnished", "unfurnished"].map(value => <option key={value} value={value}>{titleize(value)}</option>)}</SelectField><SelectField label="Floor" value={form.floor ?? "mid"} onChange={value => update("floor", value as NonNullable<PropertySubmission["floor"]>)}>{["penthouse", "very_high", "high", "mid", "low", "ground"].map(value => <option key={value} value={value}>{titleize(value)}</option>)}</SelectField></div>
              </fieldset>
              <fieldset><legend><BarChart3 size={17} />Optional financial inputs <CircleHelp size={15} /></legend>
                <p className="fieldset-note">Providing rent activates the income and DCF approaches. Replacement cost and land value are required before a cost approach can run.</p>
                <NumberField label="Annual rent" value={form.annualRentAed} onChange={value => update("annualRentAed", value)} suffix="AED" step={5000} optional />
                <div className="mi-fields-two"><NumberField label="Replacement cost" value={form.replacementCostPerSqm} onChange={value => update("replacementCostPerSqm", value)} suffix="AED/sqm" step={100} optional /><NumberField label="Land value" value={form.landValueAed} onChange={value => update("landValueAed", value)} suffix="AED" step={50000} optional /></div>
              </fieldset>
            </div>
            {valuation.error && <div className="mi-error"><AlertTriangle size={17} />We could not complete this valuation. Please review the supplied data and try again.</div>}
            <div className="mi-evaluate-bar"><div><span>Live evaluation path</span><b>API → Evidence → Rules → Valuation → Report</b></div><button type="submit" disabled={valuation.isPending}>{valuation.isPending ? <LoaderCircle className="spin" size={17} /> : <Sparkles size={17} />}{valuation.isPending ? "Evaluating evidence…" : "Run valuation"}<ArrowUpRight size={17} /></button></div>
          </form>
        </section>

        <section id="valuation-report" className="mi-report-shell">
          {!report ? <div className="mi-empty"><Gauge size={30} /><p className="mi-eyebrow">Ready when the property file is</p><h2>A defensible result begins with documented facts.</h2><p>MIAYAAR will show the evidence, applicable approaches, explicit omissions, and decision trail after the valuation is run.</p></div> : <Suspense fallback={<div className="mi-empty" aria-live="polite"><Gauge size={30} /><p>Loading the evidence-led report…</p></div>}><LazyValuationReport report={report} requestId={valuation.data?.requestId} resultSummary={resultSummary} /></Suspense>}
        </section>

        <section className="mi-methodology-card"><div className="methodology-art" style={{ backgroundImage: `url(${DISTRICT_ART_URL})` }}><span>Decision model,<br />not a guessing model.</span></div><div><p className="mi-eyebrow">How MIAYAAR works</p><h2>Four independent views of value.</h2><p>Market comparison, income capitalization, cost, and DCF are treated as separate evidence streams. The platform names each unavailable stream rather than masking its absence.</p><div className="pill-list"><span>Market comparison</span><span>Income capitalization</span><span>Cost approach</span><span>10-year DCF</span></div><a href="#workbench"><Landmark size={15} />Review the property file</a></div></section>

        <footer><div className="footer-mark"><img src={LOGO_URL} alt="" /><span>MIAYAAR</span></div><p>MIAYAAR is a decision-support platform based on MIAYAAR Methodology v1.2. It does not replace a licensed professional appraisal, legal review, or property inspection.</p><span>© 2026 · Dubai, UAE</span></footer>
      </div>
    </main>
  );
}
