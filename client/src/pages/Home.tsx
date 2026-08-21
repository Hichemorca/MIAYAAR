import { lazy, Suspense, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Building2,
  Check,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Gauge,
  Landmark,
  LoaderCircle,
  MapPinned,
  Ruler,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import type { PropertySubmission } from "@shared/valuation/contracts";
import { trpc } from "@/lib/trpc";
import { propertyTypeChoices, toggleViewSelection, viewChoices } from "./home-form-config";

const LazyValuationReport = lazy(() => import("@/components/ValuationReport"));

const HERO_URL = "/manus-storage/miayaar-hero-atlas_f1470738.png";
const DISTRICT_ART_URL = "/manus-storage/miayaar-district-card_52080fb3.png";
const PATTERN_URL = "/manus-storage/miayaar-evidence-pattern_b999ae17.png";
const LOGO_URL = "/manus-storage/miayaar-logo-mark_6a147430.png";

const titleize = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, letter => letter.toUpperCase());

function SelectField({ label, value, children, onChange, optional = false, hint }: { label: string; value: string; children: ReactNode; onChange: (value: string) => void; optional?: boolean; hint?: string }) {
  return (
    <label className="mi-field">
      <span>{label}{optional && <em>Optional</em>}</span>
      <select value={value} onChange={event => onChange(event.target.value)} aria-label={label}>
        {children}
      </select>
      {hint && <small className="mi-field-hint">{hint}</small>}
    </label>
  );
}

function NumberField({ label, value, onChange, suffix, min = 0, max, step = 1, optional = false, hint }: { label: string; value?: number; onChange: (value?: number) => void; suffix: string; min?: number; max?: number; step?: number; optional?: boolean; hint?: string }) {
  return (
    <label className="mi-field">
      <span>{label}{optional && <em>Optional</em>}</span>
      <div className="number-input">
        <input type="number" min={min} max={max} step={step} value={value ?? ""} onChange={event => onChange(event.target.value === "" ? undefined : Number(event.target.value))} aria-label={label} />
        <b>{suffix}</b>
      </div>
      {hint && <small className="mi-field-hint">{hint}</small>}
    </label>
  );
}

function ViewPicker({ value, onChange }: { value: PropertySubmission["views"]; onChange: (value: PropertySubmission["views"]) => void }) {
  return (
    <fieldset className="mi-view-picker">
      <legend>Outlook <em>Select up to five recorded views</em></legend>
      <div className="mi-view-options">
        {viewChoices.map(view => {
          const selected = value.includes(view);
          const unavailable = !selected && value.length >= 5;
          return <button type="button" key={view} className={selected ? "selected" : ""} aria-pressed={selected} disabled={unavailable} onClick={() => onChange(toggleViewSelection(value, view))}>{titleize(view)}</button>;
        })}
      </div>
    </fieldset>
  );
}

export default function Home() {
  const [form, setForm] = useState<PropertySubmission>({
    propertyType: "apartment",
    district: "",
    areaSqm: 0,
    condition: "good",
    buildingCondition: "well_maintained",
    views: ["unknown"],
    finish: "normal",
  });
  const [inputMessage, setInputMessage] = useState<string | null>(null);
  const valuation = trpc.valuation.run.useMutation({
    onSuccess: () => window.setTimeout(() => document.getElementById("valuation-report")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80),
  });
  const report = valuation.data?.report;
  const resultSummary = useMemo(() => {
    if (!report) return "No valuation has been run for this property file.";
    if (report.status === "rejected") return "MIAYAAR withheld a value because the available local evidence did not support one.";
    if (report.status === "partial") return "MIAYAAR shows the result and its documented limitations without inferring unavailable evidence.";
    return "The returned range is based on server-evaluated evidence and the frozen methodology configuration.";
  }, [report]);
  const selectedType = propertyTypeChoices.find(choice => choice.value === form.propertyType) ?? propertyTypeChoices[0];

  function update<K extends keyof PropertySubmission>(key: K, value: PropertySubmission[K]) {
    setInputMessage(null);
    setForm(current => ({ ...current, [key]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.district.trim()) {
      setInputMessage("Enter the district exactly as it is supported by your property records.");
      return;
    }
    if (!Number.isFinite(form.areaSqm) || form.areaSqm <= 0) {
      setInputMessage("Enter a positive internal area before requesting a valuation.");
      return;
    }
    setInputMessage(null);
    valuation.mutate({ ...form, district: form.district.trim() });
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
          <div className="mi-source-status"><i /><span>Primary evidence source</span><b>DLD transactions</b></div>
        </header>

        <section id="top" className="mi-hero">
          <div className="hero-copy">
            <p className="mi-eyebrow">Property valuation intelligence · Dubai</p>
            <h1>Start with the <em>property file.</em><br />End with the <em>evidence.</em></h1>
            <p className="hero-summary">MIAYAAR organizes property facts, local transaction evidence, applicable approaches, and decision context in one governed valuation workflow.</p>
            <div className="hero-points"><span><Check size={15} />Server-evaluated evidence</span><span><Check size={15} />Four governed approaches</span><span><Check size={15} />No value without local support</span></div>
          </div>
          <div className="hero-map" style={{ backgroundImage: `url(${HERO_URL})` }}>
            <div className="map-caption"><span>Decision workspace</span><b>Property → evidence</b><small>Review · evaluate · inspect</small></div>
            <div className="map-key"><i /><span>Evidence-led workflow</span></div>
          </div>
        </section>

        <section id="workbench" className="mi-workbench mi-workbench-rebuild" style={{ backgroundImage: `linear-gradient(90deg, rgba(244,240,232,.98), rgba(244,240,232,.76)), url(${PATTERN_URL})` }}>
          <div className="workbench-heading">
            <div><p className="mi-eyebrow">Step 01 · Property file</p><h2>Record the facts that exist.</h2><p>Complete the governed property fields you can support. Optional inputs remain optional; MIAYAAR will disclose an unavailable approach rather than create a substitute fact.</p></div>
            <div className="source-card"><ShieldCheck size={18} /><span>Evaluation boundary</span><b>Server-only execution</b></div>
          </div>

          <form onSubmit={submit} noValidate>
            <div className="mi-property-type-strip" aria-label="Property type boundary">
              <div><span>Current contract type</span><b>{selectedType.label}</b><small>{selectedType.description}</small></div>
              <p><ClipboardCheck size={16} />Field visibility is not inferred by asset type. MIAYAAR keeps the governed inputs available and does not fabricate a type-to-field rule.</p>
            </div>

            <div className="mi-input-grid mi-input-grid-rebuild">
              <fieldset><legend><Building2 size={17} />Identity & location</legend>
                <SelectField label="Property type" value={form.propertyType} onChange={value => update("propertyType", value as PropertySubmission["propertyType"])}>{propertyTypeChoices.map(choice => <option value={choice.value} key={choice.value}>{choice.label}</option>)}</SelectField>
                <label className="mi-field"><span>District</span><input className="mi-text-input" value={form.district} maxLength={160} placeholder="Enter the recorded district" onChange={event => update("district", event.target.value)} aria-label="District" /><small className="mi-field-hint">MIAYAAR does not provide a district catalogue or normalize this entry in the client.</small></label>
                <div className="mi-fields-two"><NumberField label="Internal area" value={form.areaSqm || undefined} onChange={value => update("areaSqm", value ?? 0)} suffix="sqm" min={0} hint="Required" /><NumberField label="Bedrooms" value={form.bedrooms} onChange={value => update("bedrooms", value)} suffix="rooms" min={0} max={20} optional /></div>
                <NumberField label="Year built" value={form.yearBuilt} onChange={value => update("yearBuilt", value)} suffix="year" min={1800} max={2100} optional />
              </fieldset>

              <fieldset><legend><SlidersHorizontal size={17} />Property characteristics</legend>
                <div className="mi-fields-two"><SelectField label="Unit condition" value={form.condition} onChange={value => update("condition", value as PropertySubmission["condition"])}>{["excellent", "good", "fair", "needs_renovation"].map(value => <option key={value} value={value}>{titleize(value)}</option>)}</SelectField><SelectField label="Building condition" value={form.buildingCondition} onChange={value => update("buildingCondition", value as PropertySubmission["buildingCondition"])}>{["excellent", "well_maintained", "fair", "old_needs_renovation"].map(value => <option key={value} value={value}>{titleize(value)}</option>)}</SelectField></div>
                <ViewPicker value={form.views} onChange={value => update("views", value)} />
                <div className="mi-fields-two"><SelectField label="Finish quality" value={form.finish} onChange={value => update("finish", value as PropertySubmission["finish"])}>{["luxury", "good", "normal", "basic", "poor"].map(value => <option key={value} value={value}>{titleize(value)}</option>)}</SelectField><SelectField label="Furnishing" value={form.furnished ?? ""} optional onChange={value => update("furnished", (value || undefined) as PropertySubmission["furnished"])}><option value="">Not recorded</option>{["furnished", "semi_furnished", "unfurnished"].map(value => <option key={value} value={value}>{titleize(value)}</option>)}</SelectField></div>
                <div className="mi-fields-two"><SelectField label="Floor" value={form.floor ?? ""} optional onChange={value => update("floor", (value || undefined) as PropertySubmission["floor"])}><option value="">Not recorded</option>{["penthouse", "very_high", "high", "mid", "low", "ground"].map(value => <option key={value} value={value}>{titleize(value)}</option>)}</SelectField><SelectField label="Street position" value={form.streetPosition ?? ""} optional onChange={value => update("streetPosition", (value || undefined) as PropertySubmission["streetPosition"])}><option value="">Not recorded</option>{["main_street", "corner_plot", "secondary_street", "quiet_street"].map(value => <option key={value} value={value}>{titleize(value)}</option>)}</SelectField></div>
              </fieldset>

              <fieldset><legend><BarChart3 size={17} />Declared economic inputs <CircleHelp size={15} /></legend>
                <p className="fieldset-note">These are optional declared inputs. They do not create an approach, value, or adjustment in the client.</p>
                <NumberField label="Annual rent" value={form.annualRentAed} onChange={value => update("annualRentAed", value)} suffix="AED" step={5000} optional />
                <NumberField label="Replacement cost" value={form.replacementCostPerSqm} onChange={value => update("replacementCostPerSqm", value)} suffix="AED/sqm" step={100} optional />
                <NumberField label="Land value" value={form.landValueAed} onChange={value => update("landValueAed", value)} suffix="AED" step={50000} optional />
                <NumberField label="Depreciation factor" value={form.depreciationFactor} onChange={value => update("depreciationFactor", value)} suffix="ratio" step={0.01} optional hint="Validated by the server" />
                <div className="mi-absence-note"><Ruler size={15} /><span>Project, legal rights, zoning, hospitality, and secondary-attribute inputs are not shown because no governed UI contract currently supports them.</span></div>
              </fieldset>
            </div>
            {(inputMessage || valuation.error) && <div className="mi-error" role="alert"><AlertTriangle size={17} />{inputMessage ?? "We could not complete this valuation. Review the supplied data and try again."}</div>}
            <div className="mi-evaluate-bar"><div><span>Step 02 · Server evaluation</span><b>API → Evidence → Applicable approaches → Decision record</b></div><button type="submit" disabled={valuation.isPending}>{valuation.isPending ? <LoaderCircle className="spin" size={17} /> : <Sparkles size={17} />}{valuation.isPending ? "Evaluating evidence…" : "Run valuation"}<ArrowUpRight size={17} /></button></div>
          </form>
        </section>

        <section id="valuation-report" className="mi-report-shell">
          {!report ? <div className="mi-empty"><Gauge size={30} /><p className="mi-eyebrow">Step 03 · Decision report</p><h2>A defensible result begins with documented facts.</h2><p>After a server evaluation, MIAYAAR presents the returned evidence, applicable approaches, explicit omissions, and decision trail. It does not fabricate a result when the local record is insufficient.</p><a className="mi-empty-link" href="#workbench">Review the property file <ChevronRight size={15} /></a></div> : <Suspense fallback={<div className="mi-empty" aria-live="polite"><Gauge size={30} /><p>Loading the evidence-led report…</p></div>}><LazyValuationReport report={report} requestId={valuation.data?.requestId} resultSummary={resultSummary} /></Suspense>}
        </section>

        <section className="mi-methodology-card"><div className="methodology-art" style={{ backgroundImage: `url(${DISTRICT_ART_URL})` }}><span>Decision model,<br />not a guessing model.</span></div><div><p className="mi-eyebrow">Method presentation</p><h2>Four independent views of value.</h2><p>Market comparison, income capitalization, cost, and DCF remain separate server-evaluated approaches. The report displays only approaches that are applicable to the supplied facts and evidence.</p><div className="pill-list"><span>Market comparison</span><span>Income capitalization</span><span>Cost approach</span><span>10-year DCF</span></div><a href="#workbench"><Landmark size={15} />Review the property file</a></div></section>

        <footer><div className="footer-mark"><img src={LOGO_URL} alt="" /><span>MIAYAAR</span></div><p>MIAYAAR is a decision-support platform based on MIAYAAR Methodology v1.2. It does not replace a licensed professional appraisal, legal review, or property inspection.</p><span>© 2026 · Dubai, UAE</span></footer>
      </div>
    </main>
  );
}
