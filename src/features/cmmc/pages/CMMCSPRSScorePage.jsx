import { useMemo, useState } from "react";
import { CMMCImplementationLayout, useCMMCWorkspaceFilters } from "../components";

const remediations = [
  ["3.1.1", "5", "Limit system access to only authorized users, processes, and devices.", "AC", "Not Started"],
  ["3.1.2", "5", "Restrict what each user can do based on their role, no more access than needed.", "AC", "Not Started"],
  ["3.1.12", "5", "Monitor and control every remote access session.", "AC", "Not Started"],
  ["3.1.13", "5", "Encrypt remote access sessions (TLS, SSH, or equivalent).", "AC", "Not Started"],
  ["3.1.16", "5", "Explicitly authorize wireless connections before allowing them.", "AC", "Not Started"],
  ["3.1.17", "5", "Secure all wireless access with authentication and encryption (WPA2/WPA3 minimum).", "AC", "Not Started"],
  ["3.1.18", "5", "Control which mobile devices can connect to organizational systems.", "AC", "Not Started"],
  ["3.2.1", "5", "Ensure all personnel understand security risks associated with their roles.", "AT", "Not Started"],
  ["3.2.2", "5", "Train staff to carry out their assigned information security responsibilities.", "AT", "Not Started"],
  ["3.3.1", "5", "Create and retain audit logs long enough to support investigations.", "AU", "Not Started"],
  ["3.3.5", "5", "Correlate logs across systems to detect patterns of suspicious activity.", "AU", "Not Started"],
];

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
  const [partialCredit, setPartialCredit] = useState({
    "3.5.3": "No MFA implemented (-5 pts)",
    "3.13.11": "No encryption employed (-5 pts)",
  });
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const visibleRemediations = useMemo(
    () =>
      remediations.filter(([control, points, requirement, domain, status]) => {
        const matchesSearch =
          !normalizedSearch ||
          [control, points, requirement, domain, status].join(" ").toLowerCase().includes(normalizedSearch);
        const matchesDomain = domainFilter === "all" || domainFilter === domain;
        const matchesStatus = statusFilter === "All" || statusFilter === status;

        return matchesSearch && matchesDomain && matchesStatus;
      }),
    [domainFilter, normalizedSearch, statusFilter]
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
            <ScoreBox value="0" label="Points Secured" tone="text-emerald-400" />
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
              110 controls remaining. Completing 5-pt controls gives the fastest score improvement.
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
