import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, CheckCircle2, ClipboardCheck, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../auth/UserContext";
import { AUDIT_CATEGORIES, AUDIT_FRAMEWORKS, AUDIT_SEVERITIES } from "../audit/AuditReadinessEngine";
import { loadAuditReviews, markFindingReviewed, saveAuditReviews } from "../audit/AuditReviewService";
import AppShell from "../components/layout/AppShell";
import { useComplianceState } from "../compliance/ComplianceStateContext";
import ActiveFrameworkRequired from "../framework/ActiveFrameworkRequired";
import { useFrameworkWorkspace } from "../framework/FrameworkWorkspaceContext";
import { buildCrossModuleTarget } from "../navigation/crossModuleNavigation";
import { isApiEnabled } from "../api/client";
import { reviewAuditFinding, synchronizeAuditReadiness } from "../api/assurance";
import { resolveFrameworkId } from "../core/engines/framework-engine/frameworkRegistry";

const STATUS_FILTERS = ["All", "Open", "Reviewed", "Resolved"];

const severityStyles = {
  Critical: "bg-rose-50 text-rose-700",
  High: "bg-orange-50 text-orange-700",
  Medium: "bg-amber-50 text-amber-700",
  Low: "bg-emerald-50 text-emerald-700",
};

export default function Audits() {
  const { activeFramework } = useFrameworkWorkspace();

  if (!activeFramework) {
    return <ActiveFrameworkRequired />;
  }

  return <AuditCenter key={activeFramework.id} activeFramework={activeFramework} />;
}

function AuditCenter({ activeFramework }) {
  const navigate = useNavigate();
  const { user } = useUser();
  const { audit } = useComplianceState();
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [frameworkFilter, setFrameworkFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [apiFindings, setApiFindings] = useState([]);
  const [apiError, setApiError] = useState("");
  useEffect(() => {
    if (!isApiEnabled) return;
    const payload = (audit.findings || []).map(toApiFinding);
    synchronizeAuditReadiness(resolveFrameworkId(activeFramework.id) || activeFramework.id, payload)
      .then((record) => setApiFindings((record.findings || []).map((finding) => fromApiFinding(finding, activeFramework.name))))
      .catch((error) => setApiError(error.message || "Could not synchronize audit findings"));
  }, [activeFramework, audit.findings]);
  const sourceFindings = isApiEnabled && apiFindings.length ? apiFindings : audit.findings || [];

  const filteredFindings = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return sourceFindings.filter((finding) => {
      const matchesStatus = statusFilter === "All" || finding.status === statusFilter;
      const matchesCategory = categoryFilter === "All" || finding.category === categoryFilter;
      const matchesFramework = frameworkFilter === "All" || finding.framework === frameworkFilter;
      const matchesSeverity = severityFilter === "All" || finding.severity === severityFilter;
      const searchable = [
        finding.name,
        finding.relatedItemId,
        finding.severity,
        finding.framework,
        finding.category,
        finding.domain,
      ].join(" ").toLowerCase();
      return matchesStatus && matchesCategory && matchesFramework && matchesSeverity && (!query || searchable.includes(query));
    });
  }, [sourceFindings, categoryFilter, frameworkFilter, searchTerm, severityFilter, statusFilter]);

  const groupedFindings = useMemo(
    () => Object.fromEntries(AUDIT_SEVERITIES.map((severity) => [severity, filteredFindings.filter((finding) => finding.severity === severity)])),
    [filteredFindings]
  );

  const summaryCards = [
    ["Audit Readiness", `${Math.round(audit.readiness)}%`, {}],
    ["Compliance Score", `${Math.round(audit.complianceScore)}%`, {}],
    ["Total Findings", audit.totalFindings, { status: "All", category: "All" }],
    ["Open Findings", audit.openFindings, { status: "Open" }],
    ["Reviewed Findings", audit.reviewedFindings, { status: "Reviewed" }],
    ["Resolved Findings", audit.resolvedFindings, { status: "Resolved" }],
    ["Critical Findings", audit.criticalFindings, { severity: "Critical" }],
    ["High Findings", audit.highFindings, { severity: "High" }],
    ["Medium Findings", audit.mediumFindings, { severity: "Medium" }],
    ["Low Findings", audit.lowFindings, { severity: "Low" }],
    ["Evidence Coverage", `${Math.round(audit.evidenceCoverage)}%`, { category: "Evidence" }],
    ["Controls Completed", audit.controlsCompleted, { category: "Controls" }],
    ["Policies Published", audit.policiesPublished, { category: "Policies" }],
    ["Tests Completed", audit.testsCompleted, { category: "Tests" }],
    ["Open Risks", audit.openRisks, { category: "Risks", status: "Open" }],
  ];

  const applyCardFilter = (filter) => {
    setSearchTerm("");
    setFrameworkFilter("All");
    setStatusFilter(filter.status || "All");
    setCategoryFilter(filter.category || "All");
    setSeverityFilter(filter.severity || "All");
  };

  const markReviewed = async (finding) => {
    const comments = window.prompt("Review comments (optional)", finding.reviewComments || "") || "";
    if (isApiEnabled && finding.apiId) {
      try { const updated = fromApiFinding(await reviewAuditFinding(finding.apiId, comments), finding.framework); setApiFindings((items) => items.map((item) => item.apiId === finding.apiId ? updated : item)); }
      catch (error) { setApiError(error.message || "Could not review finding"); }
      return;
    }
    const currentReviews = loadAuditReviews(activeFramework.id);
    saveAuditReviews(activeFramework.id, markFindingReviewed(currentReviews, finding.id, user, comments));
  };

  const openFinding = (finding, mode) => {
    const target = buildCrossModuleTarget({
      activeFramework,
      itemId: finding.relatedItemId,
      itemType: finding.category,
      moduleContext: `Audit:${finding.id}`,
      mode,
    });
    navigate(target.path, { state: target.state });
  };

  return (
    <AppShell>
      <div className="space-y-7">
        {apiError && <p role="alert" className="rounded-lg bg-rose-50 px-4 py-3 font-semibold text-rose-700">{apiError}</p>}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-blue-700">
              Compliance
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-normal text-slate-900">
              Enterprise Audit Center
            </h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              Plan {activeFramework.name} audit milestones, evidence requests, auditor conversations, and review readiness.
            </p>
          </div>

          <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-600/35 bg-[linear-gradient(135deg,rgba(255,246,216,.96),rgba(216,180,109,.74)_48%,rgba(168,117,52,.86))] px-5 py-3 font-bold text-slate-900 shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5">
            Plan Audit
            <ArrowUpRight size={18} />
          </button>
        </div>

        <section className="rounded-lg border border-white/75 bg-white/62 p-6 shadow-xl shadow-slate-900/5 backdrop-blur">
          <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-blue-600/20 bg-blue-50 text-blue-700">
                <ClipboardCheck size={24} />
              </div>
              <h2 className="mt-5 text-2xl font-black text-slate-900">
                Audit Center overview
              </h2>
              <p className="mt-2 leading-7 text-slate-600">
                Readiness, findings, checklist items, and recent audit activity are calculated from the centralized compliance state.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {summaryCards.map(([label, value, filter]) => (
                <button
                  type="button"
                  key={label}
                  onClick={() => applyCardFilter(filter)}
                  className="rounded-lg border border-slate-200 bg-[#fffdf8]/72 p-4 text-left transition hover:-translate-y-0.5 hover:bg-blue-50/50"
                >
                  <p className="text-sm font-medium text-slate-500">
                    {label}
                  </p>
                  <p className="mt-2 text-3xl font-black text-slate-900">
                    {value}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-white/75 bg-white/62 p-5 shadow-xl shadow-slate-900/5 backdrop-blur">
          <div className="grid gap-3 lg:grid-cols-[1fr_150px_190px_190px]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setSeverityFilter("All");
                }}
                placeholder="Search findings, IDs, names, or framework"
                className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500"
              />
            </label>
            <Select value={statusFilter} onChange={setStatusFilter} options={STATUS_FILTERS} />
            <Select value={categoryFilter} onChange={setCategoryFilter} options={["All", ...AUDIT_CATEGORIES]} />
            <Select value={frameworkFilter} onChange={setFrameworkFilter} options={["All", ...AUDIT_FRAMEWORKS]} />
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-white/75 bg-white/62 shadow-xl shadow-slate-900/5 backdrop-blur">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-xl font-black text-slate-900">
              Audit Findings
            </h2>
          </div>

          <div className="divide-y divide-slate-100">
            {AUDIT_SEVERITIES.map((severity) => (
              <FindingGroup
                key={severity}
                severity={severity}
                findings={groupedFindings[severity] || []}
                onView={(finding) => openFinding(finding, "view")}
                onResolve={(finding) => openFinding(finding, "resolve")}
                onReview={markReviewed}
              />
            ))}
            {!filteredFindings.length && (
              <div className="px-6 py-10 text-center text-sm font-semibold text-slate-500">
                No findings match the current filters.
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <AuditChecklist items={audit.checklist || []} onOpen={(finding) => openFinding(finding, "resolve")} />
          <AuditTimeline events={audit.timeline || []} />
        </section>
      </div>
    </AppShell>
  );
}

function toApiFinding(finding) {
  const severity = String(finding.severity || "Medium").toUpperCase();
  return { externalId: finding.id, name: finding.name || finding.id, description: finding.description || "", category: finding.category, domain: finding.domain, relatedItemId: finding.relatedItemId, severity: ["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(severity) ? severity : "MEDIUM", ownerName: finding.owner || undefined, dueDate: auditDateToIso(finding.dueDate) };
}

function auditDateToIso(value) { if (!value) return null; const date = new Date(value); return Number.isNaN(date.getTime()) ? null : date.toISOString(); }

function fromApiFinding(finding, framework = "Framework") {
  const title = (value) => value ? `${value.charAt(0)}${value.slice(1).toLowerCase()}` : "";
  return { id: finding.externalId || finding.id, apiId: finding.id, name: finding.name, description: finding.description, category: finding.category, domain: finding.domain, relatedItemId: finding.relatedItemId, severity: title(finding.severity), status: title(finding.status), owner: finding.ownerName || "Unassigned", dueDate: finding.dueDate || "", lastUpdated: finding.updatedAt, framework, reviewer: finding.reviewerName, reviewComments: finding.reviewComments };
}

function FindingGroup({ severity, findings, onView, onResolve, onReview }) {
  if (!findings.length) return null;

  return (
    <div className="px-6 py-5">
      <div className="mb-4 flex items-center gap-2">
        <span className={`rounded-full px-3 py-1 text-sm font-black ${severityStyles[severity]}`}>
          {severity}
        </span>
        <span className="text-sm font-bold text-slate-500">{findings.length} finding(s)</span>
      </div>
      <div className="space-y-3">
        {findings.map((finding) => (
          <article key={finding.id} className="rounded-lg border border-slate-200 bg-[#fffdf8]/70 p-4">
            <div className="grid gap-4 xl:grid-cols-[1fr_160px_140px_180px]">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                  {finding.category} · {finding.relatedItemId}
                </p>
                <h3 className="mt-1 font-black text-slate-900">{finding.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{finding.description}</p>
                <div className="mt-3 grid gap-2 text-xs font-bold text-slate-500 sm:grid-cols-3">
                  <span>Framework: {finding.framework}</span>
                  <span>Domain: {finding.domain}</span>
                  <span>Updated: {formatDate(finding.lastUpdated)}</span>
                </div>
              </div>
              <Meta label="Owner" value={finding.owner} />
              <Meta label="Due" value={formatDate(finding.dueDate)} />
              <div className="space-y-2">
                <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-800">
                  {finding.status}
                </span>
                {finding.reviewer && <p className="text-xs font-bold text-slate-500">Reviewed by {finding.reviewer}</p>}
                <div className="flex flex-wrap gap-2 pt-1">
                  <ActionButton onClick={() => onView(finding)}>View Details</ActionButton>
                  <ActionButton onClick={() => onResolve(finding)}>Resolve</ActionButton>
                  <ActionButton onClick={() => onReview(finding)}>Mark as Reviewed</ActionButton>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function AuditChecklist({ items, onOpen }) {
  return (
    <section className="overflow-hidden rounded-lg border border-white/75 bg-white/62 shadow-xl shadow-slate-900/5 backdrop-blur">
      <div className="border-b border-slate-100 px-6 py-5">
        <h2 className="text-xl font-black text-slate-900">Audit Checklist</h2>
      </div>
      <div className="divide-y divide-slate-100">
        {items.length ? items.slice(0, 12).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onOpen(item)}
            className="flex w-full gap-3 px-6 py-4 text-left transition hover:bg-blue-50/40"
          >
            <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-500" />
            <span>
              <span className="block font-black text-slate-900">{item.name}</span>
              <span className="mt-1 block text-sm text-slate-500">{item.description}</span>
            </span>
          </button>
        )) : (
          <div className="px-6 py-10 text-center text-sm font-semibold text-slate-500">
            Audit checklist is complete.
          </div>
        )}
      </div>
    </section>
  );
}

function AuditTimeline({ events }) {
  return (
    <section className="overflow-hidden rounded-lg border border-white/75 bg-white/62 shadow-xl shadow-slate-900/5 backdrop-blur">
      <div className="border-b border-slate-100 px-6 py-5">
        <h2 className="text-xl font-black text-slate-900">Audit Timeline</h2>
      </div>
      <div className="divide-y divide-slate-100">
        {events.length ? events.slice(0, 12).map((event) => (
          <div key={event.id} className="px-6 py-4">
            <p className="font-black text-slate-900">{event.name}</p>
            <p className="mt-1 text-sm text-slate-500">{event.detail}</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-400">{formatDate(event.timestamp)}</p>
          </div>
        )) : (
          <div className="px-6 py-10 text-center text-sm font-semibold text-slate-500">
            No audit activity yet.
          </div>
        )}
      </div>
    </section>
  );
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-500"
    >
      {options.map((option) => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  );
}

function Meta({ label, value }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-700">{value || "Unassigned"}</p>
    </div>
  );
}

function ActionButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-50"
    >
      {children}
    </button>
  );
}

function formatDate(value) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
