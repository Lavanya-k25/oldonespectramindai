import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import { CMMCImplementationLayout, useCMMCWorkspaceFilters } from "../components";

const statuses = ["Not Started", "In Progress", "Completed"];

const domainGroups = [
  {
    code: "AC",
    name: "Access Control",
    total: 22,
    controls: [
      ["3.1.1", "Limit system access to authorized users, processes, and devices.", "Access review export", "AO: user authorization, process authorization"],
      ["3.1.2", "Limit transactions and functions to authorized users.", "Role matrix and permission screenshots", "AO: transaction limits, privileged functions"],
      ["3.1.20", "Verify and control connections to external systems.", "Boundary diagram and approval record", "AO: external system connection control"],
    ],
  },
  {
    code: "AT",
    name: "Awareness and Training",
    total: 3,
    controls: [
      ["3.2.1", "Ensure managers, users, and administrators understand security risks.", "Security awareness completion report", "AO: role-based risk awareness"],
      ["3.2.2", "Ensure personnel are trained to carry out assigned security duties.", "Training assignment export", "AO: assigned responsibility training"],
      ["3.2.3", "Provide awareness training on recognizing and reporting insider threat indicators.", "Insider threat training record", "AO: threat recognition and reporting"],
    ],
  },
  {
    code: "AU",
    name: "Audit and Accountability",
    total: 9,
    controls: [
      ["3.3.1", "Create and retain system audit logs and records.", "SIEM retention policy", "AO: event capture and retention"],
      ["3.3.3", "Review and update logged events.", "Audit event review minutes", "AO: logged event review cadence"],
      ["3.3.8", "Protect audit information from unauthorized access.", "Audit role permissions", "AO: audit data protection"],
    ],
  },
  {
    code: "IR",
    name: "Incident Response",
    total: 3,
    controls: [
      ["3.6.1", "Establish an operational incident-handling capability.", "Incident response plan", "AO: preparation, detection, containment"],
      ["3.6.2", "Track, document, and report incidents to designated officials.", "Incident ticket sample", "AO: tracking and reporting"],
      ["3.6.3", "Test the organizational incident response capability.", "Tabletop exercise evidence", "AO: incident response testing"],
    ],
  },
  {
    code: "MA",
    name: "Maintenance",
    total: 6,
    controls: [
      ["3.7.1", "Perform maintenance on organizational systems.", "Maintenance log", "AO: approved maintenance activity"],
      ["3.7.2", "Provide controls on tools, techniques, mechanisms, and personnel used for maintenance.", "Maintenance access procedure", "AO: tool and personnel control"],
      ["3.7.5", "Require multifactor authentication for nonlocal maintenance sessions.", "Remote maintenance MFA screenshot", "AO: authenticated nonlocal maintenance"],
    ],
  },
  {
    code: "MP",
    name: "Media Protection",
    total: 9,
    controls: [
      ["3.8.1", "Protect system media containing CUI.", "Media handling policy", "AO: media storage and access protection"],
      ["3.8.3", "Sanitize or destroy media containing CUI before disposal or reuse.", "Destruction certificate", "AO: sanitization and disposal"],
      ["3.8.9", "Protect backup CUI at storage locations.", "Backup encryption evidence", "AO: backup media protection"],
    ],
  },
  {
    code: "PS",
    name: "Personnel Security",
    total: 2,
    controls: [
      ["3.9.1", "Screen individuals prior to authorizing access to organizational systems containing CUI.", "Background screening record", "AO: pre-access screening"],
      ["3.9.2", "Ensure systems containing CUI are protected during and after personnel actions.", "Termination checklist", "AO: transfer and termination protection"],
    ],
  },
  {
    code: "PE",
    name: "Physical Protection",
    total: 6,
    controls: [
      ["3.10.1", "Limit physical access to organizational systems and operating environments.", "Badge access report", "AO: facility access limitation"],
      ["3.10.3", "Escort visitors and monitor visitor activity.", "Visitor log sample", "AO: visitor escort and monitoring"],
      ["3.10.6", "Enforce safeguarding measures for CUI at alternate work sites.", "Remote work attestation", "AO: alternate work site protection"],
    ],
  },
  {
    code: "RA",
    name: "Risk Assessment",
    total: 3,
    controls: [
      ["3.11.1", "Periodically assess risk to organizational operations, assets, and individuals.", "Risk register export", "AO: periodic risk assessment"],
      ["3.11.2", "Scan for vulnerabilities periodically and when new vulnerabilities are identified.", "Vulnerability scan report", "AO: vulnerability scanning"],
      ["3.11.3", "Remediate vulnerabilities in accordance with risk assessments.", "Remediation ticket sample", "AO: risk-based remediation"],
    ],
  },
  {
    code: "CA",
    name: "Security Assessment",
    total: 4,
    controls: [
      ["3.12.1", "Periodically assess the security controls in organizational systems.", "Control assessment schedule", "AO: control assessment"],
      ["3.12.2", "Develop and implement plans of action to correct deficiencies.", "POA&M item sample", "AO: deficiency correction planning"],
      ["3.12.4", "Develop, document, and update system security plans.", "SSP revision history", "AO: SSP maintenance"],
    ],
  },
  {
    code: "SC",
    name: "System and Communications Protection",
    total: 16,
    controls: [
      ["3.13.1", "Monitor, control, and protect communications at system boundaries.", "Firewall rule review", "AO: boundary protection"],
      ["3.13.8", "Implement cryptographic mechanisms to prevent unauthorized disclosure of CUI.", "Encryption configuration", "AO: cryptographic protection"],
      ["3.13.11", "Employ FIPS-validated cryptography when used to protect CUI.", "FIPS validation evidence", "AO: validated encryption"],
    ],
  },
  {
    code: "SI",
    name: "System and Information Integrity",
    total: 7,
    controls: [
      ["3.14.1", "Identify, report, and correct system flaws in a timely manner.", "Patch report", "AO: flaw identification and correction"],
      ["3.14.2", "Provide protection from malicious code at designated locations.", "Endpoint protection dashboard", "AO: malicious code protection"],
      ["3.14.6", "Monitor organizational systems for attacks and indicators of potential attacks.", "Alert review evidence", "AO: security monitoring"],
    ],
  },
];

const initialStatuses = domainGroups.reduce((statusById, domain) => {
  domain.controls.forEach(([id]) => {
    statusById[`${domain.code}-${id}`] = "Not Started";
  });
  return statusById;
}, {});

export default function CMMCOrganizationPage() {
  const { searchQuery, domainFilter, resetVersion, statusFilter } = useCMMCWorkspaceFilters();
  return (
    <CMMCImplementationLayout>
      <CMMCOrganizationContent
        key={resetVersion}
        searchQuery={searchQuery}
        domainFilter={domainFilter}
        statusFilter={statusFilter}
      />
    </CMMCImplementationLayout>
  );
}

function CMMCOrganizationContent({ searchQuery, domainFilter, statusFilter }) {
  const [openDomains, setOpenDomains] = useState({ AC: true });
  const [controlStatuses, setControlStatuses] = useState(initialStatuses);
  const normalizedSearch = searchQuery.trim().toLowerCase();

  const statusCounts = useMemo(() => {
    return Object.values(controlStatuses).reduce(
      (counts, status) => ({ ...counts, [status]: counts[status] + 1 }),
      { "Not Started": 0, "In Progress": 0, Completed: 0 }
    );
  }, [controlStatuses]);
  const notStartedTotal = 110 - statusCounts.Completed - statusCounts["In Progress"];
  const visibleDomains = useMemo(() => {
    return domainGroups
      .map((domain) => {
        const domainMatches =
          !normalizedSearch ||
          `${domain.code} ${domain.name}`.toLowerCase().includes(normalizedSearch);
        const controls = domain.controls.filter(([id, description, evidence, objective]) => {
          const controlKey = `${domain.code}-${id}`;
          const status = controlStatuses[controlKey];
          const matchesSearch =
            domainMatches ||
            [id, description, evidence, objective, status, domain.code, domain.name]
              .join(" ")
              .toLowerCase()
              .includes(normalizedSearch);
          const matchesDomain = domainFilter === "all" || domainFilter === domain.code;
          const matchesStatus = statusFilter === "All" || statusFilter === status;

          return matchesSearch && matchesDomain && matchesStatus;
        });

        return { ...domain, controls };
      })
      .filter((domain) => domain.controls.length > 0);
  }, [controlStatuses, domainFilter, normalizedSearch, statusFilter]);

  const updateStatus = (controlKey, status) => {
    setControlStatuses((current) => ({ ...current, [controlKey]: status }));
  };

  return (
    <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-4">
          <StatusCard value={statusCounts.Completed} label="Completed" tone="text-emerald-500" />
          <StatusCard value={statusCounts["In Progress"]} label="In Progress" tone="text-amber-500" />
          <StatusCard value={notStartedTotal} label="Not Started" tone="text-slate-900" />
          <StatusCard value={domainGroups.length} label="Domains" tone="text-slate-400" />
        </div>

        <div className="space-y-2">
          {visibleDomains.map((domain) => {
            const isOpen = Boolean(openDomains[domain.code]);
            const completedCount = domain.controls.filter(
              ([id]) => controlStatuses[`${domain.code}-${id}`] === "Completed"
            ).length;

            return (
              <section key={domain.code} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => setOpenDomains((current) => ({ ...current, [domain.code]: !current[domain.code] }))}
                  className={`flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-sm font-black transition ${
                    isOpen ? "bg-violet-600 text-white" : "bg-white text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <span className="min-w-0">
                    <span className={`mr-3 rounded px-2 py-1 text-xs ${isOpen ? "bg-white/15" : "bg-violet-50 text-violet-700"}`}>
                      {domain.code}
                    </span>
                    {domain.name}
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    {completedCount}/{domain.total}
                    <ChevronDown size={16} className={`transition ${isOpen ? "rotate-180" : ""}`} />
                  </span>
                </button>

                {isOpen && (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[920px] text-left text-sm">
                      <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-black uppercase tracking-wide text-slate-400">
                        <tr>
                          <th className="w-12 px-4 py-3">Done</th>
                          <th className="w-24 px-4 py-3">Control ID</th>
                          <th className="px-4 py-3">Control Description</th>
                          <th className="w-48 px-4 py-3">Evidence Needed</th>
                          <th className="w-56 px-4 py-3">Assessment Objective</th>
                          <th className="w-40 px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {domain.controls.map(([id, description, evidence, objective]) => {
                          const controlKey = `${domain.code}-${id}`;
                          const status = controlStatuses[controlKey];

                          return (
                            <tr key={controlKey} className="align-top transition hover:bg-slate-50/70">
                              <td className="px-4 py-3">
                                <input
                                  type="checkbox"
                                  checked={status === "Completed"}
                                  onChange={(event) => updateStatus(controlKey, event.target.checked ? "Completed" : "Not Started")}
                                  className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                                />
                              </td>
                              <td className="px-4 py-3 font-black text-violet-700">{id}</td>
                              <td className="px-4 py-3 font-semibold leading-5 text-slate-700">{description}</td>
                              <td className="px-4 py-3 text-xs font-semibold leading-5 text-violet-600">{evidence}</td>
                              <td className="px-4 py-3 text-xs font-semibold leading-5 text-slate-500">{objective}</td>
                              <td className="px-4 py-3">
                                <select
                                  value={status}
                                  onChange={(event) => updateStatus(controlKey, event.target.value)}
                                  className="h-8 w-full rounded border border-slate-200 bg-white px-2 text-xs font-bold text-slate-600 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                                >
                                  {statuses.map((statusOption) => (
                                    <option key={statusOption}>{statusOption}</option>
                                  ))}
                                </select>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            );
          })}
        </div>
    </div>
  );
}

function StatusCard({ value, label, tone }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 text-center shadow-sm">
      <p className={`text-2xl font-black ${tone}`}>{value}</p>
      <p className="mt-1 text-xs font-black uppercase text-slate-400">{label}</p>
    </div>
  );
}
