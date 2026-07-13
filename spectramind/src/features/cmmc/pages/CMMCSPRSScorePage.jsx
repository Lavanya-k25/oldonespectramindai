import { useMemo, useState } from "react";
import {
  CMMC_FRAMEWORK_ID,
  getFrameworkLibrary,
} from "../../../core/engines/framework-engine/frameworkRegistry";
import { CMMCImplementationLayout, useCMMCWorkspaceFilters } from "../components";
import { useCMMCSPRSCalculation } from "../hooks";

const cmmcLibrary = getFrameworkLibrary(CMMC_FRAMEWORK_ID) || emptyFrameworkLibrary();
const remediations = buildRemediations(cmmcLibrary);

export default function CMMCSPRSScorePage() {
  const { searchQuery, domainFilter, resetVersion, statusFilter } = useCMMCWorkspaceFilters();
  return (
    <CMMCImplementationLayout>
      <CMMCSPRSScoreContent
        key={resetVersion}
        searchQuery={searchQuery}
        domainFilter={domainFilter}
        statusFilter={statusFilter}
      />
    </CMMCImplementationLayout>
  );
}

function CMMCSPRSScoreContent({ searchQuery, domainFilter, statusFilter }) {
  const sprsMetrics = useCMMCSPRSCalculation();
  const [partialCredit, setPartialCredit] = useState({
    "3.5.3": "No MFA implemented (-5 pts)",
    "3.13.11": "No encryption employed (-5 pts)",
  });
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const remediationStatusByControl = useMemo(
    () => new Map((sprsMetrics.controls || []).map((control) => [control.controlId, control.status])),
    [sprsMetrics.controls]
  );
  const workflowRemediations = useMemo(
    () => remediations.map((remediation) => applyWorkflowStatus(remediation, remediationStatusByControl)),
    [remediationStatusByControl]
  );
  const controlsRemaining = Math.max(
    (Number(sprsMetrics.inProgressControls) || 0) + (Number(sprsMetrics.notStartedControls) || 0),
    0
  );
  const completionPercentage = Math.max(0, Math.min(100, Math.round(Number(sprsMetrics.completionPercentage) || 0)));
  const pointsSecured = workflowRemediations.reduce(
    (total, remediation) => {
      const [, points, , , status] = remediation;
      return isCompletedStatus(status) ? total + parsePointValue(points) : total;
    },
    0
  );
  const visibleRemediations = useMemo(
    () =>
      workflowRemediations.filter(([control, points, requirement, domain, status, evidence]) => {
        const matchesSearch =
          !normalizedSearch ||
          [control, points, requirement, domain, status, evidence].join(" ").toLowerCase().includes(normalizedSearch);
        const matchesDomain = domainFilter === "all" || domainFilter === domain;
        const matchesStatus = statusFilter === "All" || statusFilter === status;

        return matchesSearch && matchesDomain && matchesStatus;
      }),
    [domainFilter, normalizedSearch, statusFilter, workflowRemediations]
  );

  return (
    <div className="mx-auto max-w-6xl space-y-4">
        <section className="rounded-lg bg-[#16162d] p-4 text-white shadow-xl shadow-slate-950/20">
          <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
            <div>
              <p className="text-xs font-black uppercase text-slate-300">SPRS Score</p>
              <p className="mt-3 text-6xl font-black leading-none text-red-500">-203</p>
              <p className="mt-2 text-sm font-black text-red-400">Critical Deficiencies - high risk</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase text-slate-300">Score Position</p>
              <div className="mt-5 rounded-full bg-white/10 px-1 py-1">
                <div className="relative h-4 rounded-full bg-gradient-to-r from-red-500 via-slate-700 to-slate-500">
                  <span className="absolute left-[78%] top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border-4 border-slate-600 bg-slate-300 shadow-lg shadow-black/20" />
                </div>
              </div>
              <div className="mt-2 flex justify-between text-[11px] font-bold text-slate-300">
                <span>-203</span>
                <span>0</span>
                <span>88</span>
                <span>110</span>
              </div>
              <p className="mt-4 text-xs font-semibold text-slate-300">
                +88 = CMMC Level 2 eligible (conditional) &nbsp; | &nbsp; 0 = FAR 52.204-21 baseline met
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            <ScoreBox value="-203" label="Current SPRS" />
            <ScoreBox value={String(pointsSecured)} label="Points Secured" tone="text-emerald-400" />
            <ScoreBox value="313" label="Points at Risk" tone="text-red-400" />
            <ScoreBox value="44" label="Critical Gaps" tone="text-amber-300" />
          </div>
        </section>

        <section className="rounded-lg border border-amber-300 bg-[#fff3bf] p-4 shadow-sm">
          <h2 className="text-sm font-black text-amber-950">
            Two controls offer partial credit - set your actual implementation level:
          </h2>
          <div className="mt-3 grid gap-2 md:grid-cols-[minmax(220px,1fr)_180px_minmax(220px,300px)]">
            <PartialCredit
              id="3.5.3"
              label="Multi-Factor Authentication"
              value={partialCredit["3.5.3"]}
              onChange={(value) => setPartialCredit((current) => ({ ...current, "3.5.3": value }))}
              options={["No MFA implemented (-5 pts)", "Partial MFA coverage (-3 pts)", "MFA fully implemented (0 pts)"]}
            />
            <PartialCredit
              id="3.13.11"
              label="FIPS-Validated Cryptography"
              value={partialCredit["3.13.11"]}
              onChange={(value) => setPartialCredit((current) => ({ ...current, "3.13.11": value }))}
              options={["No encryption employed (-5 pts)", "Non-FIPS encryption only (-3 pts)", "FIPS-validated encryption (0 pts)"]}
            />
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="p-4">
            <h2 className="text-base font-black text-slate-900">Prioritized Remediation - Highest Point Value First</h2>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              {controlsRemaining} controls remaining ({completionPercentage}% complete). Completing 5-pt controls gives the fastest score improvement.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-y border-slate-100 bg-slate-50 text-[11px] font-black uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-3">Control</th>
                  <th className="px-4 py-3">Points</th>
                  <th className="px-4 py-3">Requirement</th>
                  <th className="px-4 py-3">Domain</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleRemediations.map(([control, points, requirement, domain, status]) => (
                  <tr key={control} className="transition hover:bg-slate-50">
                    <td className="px-4 py-3 font-black text-violet-700">{control}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 font-black text-red-500">
                        <span className="h-2 w-2 rounded-full bg-red-500" />
                        {points}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{requirement}</td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-violet-100 px-2 py-1 text-xs font-black text-violet-700">{domain}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-slate-100 px-2 py-1 text-xs font-black text-slate-600">{status}</span>
                    </td>
                  </tr>
                ))}
                {visibleRemediations.length === 0 && (
                  <tr>
                    <td className="px-4 py-8 text-center text-sm font-semibold text-slate-500" colSpan={5}>
                      No remediation items match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
    </div>
  );
}

function buildRemediations(library) {
  const controlsById = new Map((library.controls || []).map((control) => [control.controlId || control["Control ID"] || control.id, control]));
  const evidenceById = new Map((library.evidence || []).map((evidence) => [evidence.id, evidence]));

  return (library.mappings || []).map((mapping) => {
    const control = controlsById.get(mapping.controlId) || {};
    const evidenceIds = mapping.evidenceRequirementIds || mapping.evidenceIds || [];
    const evidence = evidenceById.get(evidenceIds[0]) || {};
    const controlId = mapping.controlId || control.controlId || control["Control ID"] || evidence.controlId || "";
    const controlFamily = control.controlFamily || control["Control Family"] || evidence.controlFamily || evidence["Control Family"] || "";

    return [
      controlId,
      "5",
      control.controlRequirement || control["Control Requirement"] || evidence["Control Requirement"] || "",
      parseControlDomain(controlFamily, controlId),
      evidence.evidenceStatus || evidence["Evidence Status"] || "",
      evidence.evidenceToRequest || evidence["Evidence to Request"] || "",
    ];
  });
}

function applyWorkflowStatus(remediation, remediationStatusByControl) {
  const [control, points, requirement, domain, status, evidence] = remediation;
  const workflowStatus = remediationStatusByControl.get(control);

  return [
    control,
    points,
    requirement,
    domain,
    workflowStatus || status,
    evidence,
  ];
}

function isCompletedStatus(status) {
  return String(status ?? "").trim().toLowerCase() === "completed";
}

function parsePointValue(points) {
  const value = Number(String(points ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(value) ? value : 0;
}

function parseControlDomain(controlFamily, controlId) {
  return controlFamily.split(" - ")[0] || controlId.split(".")[0] || "";
}

function emptyFrameworkLibrary() {
  return {
    controls: [],
    evidence: [],
    mappings: [],
  };
}

function ScoreBox({ value, label, tone = "text-white" }) {
  return (
    <div className="rounded-md bg-white/8 p-4 text-center shadow-inner shadow-white/5">
      <p className={`text-3xl font-black leading-none ${tone}`}>{value}</p>
      <p className="mt-2 text-[11px] font-black uppercase tracking-wide text-slate-300">{label}</p>
    </div>
  );
}

function PartialCredit({ id, label, value, options, onChange }) {
  return (
    <>
      <p className="text-sm font-bold text-amber-950">{id} - {label}</p>
      <span className="rounded bg-blue-100 px-2 py-1 text-xs font-black text-blue-600">partial credit available</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 rounded border border-amber-200 bg-white px-2 text-xs font-bold text-slate-700"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </>
  );
}
