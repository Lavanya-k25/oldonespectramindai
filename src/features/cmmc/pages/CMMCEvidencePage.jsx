import { FileText, Pin, Printer, ScrollText } from "lucide-react";
import { useMemo, useState } from "react";
import { CMMCImplementationLayout, useCMMCWorkspaceFilters } from "../components";

const tabs = [
  { id: "ssp", label: "System Security Plan", icon: FileText },
  { id: "poam", label: "POA&M", icon: Pin },
  { id: "policies", label: "Policy Documents", icon: ScrollText },
];

const policyDocuments = [
  ["3.1", "AC", "Access Control", "Access Control Policy", "Controls who can access your systems and CUI. Assessors verify you have formal rules governing access.", "22"],
  ["3.2", "AT", "Awareness & Training", "Awareness and Training Policy", "The most common source of breaches is human error. Assessors verify personnel know how to protect CUI.", "3"],
  ["3.3", "AU", "Audit & Accountability", "Audit and Accountability Policy", "You cannot investigate an incident you did not log. Assessors verify that you collect audit records.", "9"],
  ["3.4", "CM", "Configuration Management", "Configuration Management Policy", "Misconfigured systems are the number one attack vector. Assessors look for controlled baselines.", "9"],
  ["3.5", "IA", "Identification & Authentication", "Identification and Authentication Policy", "Identity is your first line of defense. Assessors verify password and MFA requirements.", "11"],
  ["3.6", "IR", "Incident Response", "Incident Response Plan", "Under DFARS 252.204-7012, you must report cyber incidents to DoD within 72 hours.", "3"],
  ["3.7", "MA", "Maintenance", "Maintenance Policy", "Maintenance technicians and remote vendors are a common entry point for attackers.", "6"],
  ["3.8", "MP", "Media Protection", "Media Protection Policy", "Portable media, USB drives, laptops, and printed CUI need defined handling rules.", "9"],
  ["3.9", "PS", "Personnel Security", "Personnel Security Policy", "Insider threats are a primary concern for DoD contractors.", "2"],
  ["3.10", "PE", "Physical Protection", "Physical Protection Policy", "Physical access to systems is logical access. Assessors verify facility controls.", "6"],
  ["3.11", "RA", "Risk Assessment", "Risk Assessment Policy", "You cannot manage risk you have not identified. Assessors verify periodic assessments.", "3"],
  ["3.12", "CA", "Security Assessment", "Security Assessment Policy", "CMMC Level 2 requires ongoing control assessment and corrective action.", "4"],
  ["3.13", "SC", "Systems & Comms Protection", "System and Communications Protection Policy", "This is one of the largest and most technically demanding control families.", "16"],
  ["3.14", "SI", "System & Info Integrity", "System and Information Integrity Policy", "This family covers patching, malware protection, monitoring, and security alerting.", "7"],
];

const poamRows = [
  ["POAM-001", "3.1.1", "5", "AC", "Limit system access to only authorized users, processes, and devices."],
  ["POAM-002", "3.1.2", "5", "AC", "Restrict what each user can do based on their role, no more access than needed."],
  ["POAM-003", "3.1.12", "5", "AC", "Monitor and control every remote access session."],
  ["POAM-004", "3.1.13", "5", "AC", "Encrypt remote access sessions (TLS, SSH, or equivalent)."],
  ["POAM-005", "3.1.16", "5", "AC", "Explicitly authorize wireless connections before allowing them."],
  ["POAM-006", "3.1.17", "5", "AC", "Secure all wireless access with authentication and encryption."],
];

const sspControls = [
  ["AC", "Access Control", "3.1.1", "5 pt", "Limit system access to only authorized users, processes, and devices."],
  ["AC", "Access Control", "3.1.2", "5 pt", "Restrict system transactions and functions to authorized users."],
  ["AT", "Awareness and Training", "3.2.1", "5 pt", "Ensure personnel understand security risks associated with their roles."],
];

const initialSspForm = {
  organizationName: "",
  systemName: "",
  owner: "",
  version: "1.0",
  date: "2026-06-30",
  currentSprs: "-203",
  scope: "",
  environment: "",
  purpose: "",
};

const initialPoamNotes = poamRows.reduce((notes, [id]) => {
  notes[id] = { weakness: "", owner: "", date: "", resources: "", milestones: "", status: "Not Started" };
  return notes;
}, {});

export default function CMMCEvidencePage() {
  const { searchQuery, domainFilter, resetVersion, statusFilter } = useCMMCWorkspaceFilters();
  return (
    <CMMCImplementationLayout>
      <CMMCEvidenceContent
        key={resetVersion}
        searchQuery={searchQuery}
        domainFilter={domainFilter}
        statusFilter={statusFilter}
      />
    </CMMCImplementationLayout>
  );
}

function CMMCEvidenceContent({ searchQuery, domainFilter, statusFilter }) {
  const [activeTab, setActiveTab] = useState("ssp");
  const [sspForm, setSspForm] = useState(initialSspForm);
  const [controlNotes, setControlNotes] = useState({});
  const [poamNotes, setPoamNotes] = useState(initialPoamNotes);
  const normalizedSearch = searchQuery.trim().toLowerCase();

  const visiblePolicies = useMemo(
    () =>
      policyDocuments.filter(([section, domain, family, title, description]) => {
        const matchesDomain = domainFilter === "all" || domainFilter === domain;
        const matchesSearch =
          !normalizedSearch ||
          [section, domain, family, title, description].join(" ").toLowerCase().includes(normalizedSearch);

        return matchesDomain && matchesSearch;
      }),
    [domainFilter, normalizedSearch]
  );

  const visiblePoamRows = useMemo(
    () =>
      poamRows.filter(([id, control, points, domain, requirement]) => {
        const rowStatus = poamNotes[id]?.status || "Not Started";
        const matchesDomain = domainFilter === "all" || domainFilter === domain;
        const matchesStatus = statusFilter === "All" || statusFilter === rowStatus;
        const matchesSearch =
          !normalizedSearch ||
          [id, control, points, domain, requirement, rowStatus].join(" ").toLowerCase().includes(normalizedSearch);

        return matchesDomain && matchesStatus && matchesSearch;
      }),
    [domainFilter, normalizedSearch, poamNotes, statusFilter]
  );

  const visibleSspControls = useMemo(
    () =>
      sspControls.filter(([domain, family, control, points, requirement]) => {
        const matchesDomain = domainFilter === "all" || domainFilter === domain;
        const matchesSearch =
          !normalizedSearch ||
          [domain, family, control, points, requirement, controlNotes[control] || ""]
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearch);

        return matchesDomain && matchesSearch;
      }),
    [controlNotes, domainFilter, normalizedSearch]
  );

  const updateSspForm = (field, value) => {
    setSspForm((current) => ({ ...current, [field]: value }));
  };

  const updatePoamNote = (id, field, value) => {
    setPoamNotes((current) => ({ ...current, [id]: { ...current[id], [field]: value } }));
  };

  return (
    <section className="mx-auto max-w-6xl space-y-5">
        <div className="grid overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm md:grid-cols-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex min-h-12 items-center justify-center gap-2 border-slate-100 px-4 text-sm font-black transition md:border-r md:last:border-r-0 ${
                  active ? "bg-[#171630] text-white" : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "ssp" && (
          <SSPView
            form={sspForm}
            onChange={updateSspForm}
            controls={visibleSspControls}
            controlNotes={controlNotes}
            onNoteChange={(control, value) => setControlNotes((current) => ({ ...current, [control]: value }))}
          />
        )}
        {activeTab === "poam" && (
          <POAMView rows={visiblePoamRows} notes={poamNotes} onChange={updatePoamNote} />
        )}
        {activeTab === "policies" && <PolicyView policies={visiblePolicies} />}
    </section>
  );
}

function SSPView({ form, onChange, controls, controlNotes, onNoteChange }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-black text-slate-900">System Security Plan - NIST SP 800-171 Rev 2</h1>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="rounded-lg border border-violet-200 bg-white px-4 py-2 text-sm font-black text-violet-700">
            Clear Notes
          </button>
          <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-[#171630] px-4 py-2 text-sm font-black text-white">
            <Printer size={15} />
            Print / Export PDF
          </button>
        </div>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="border-b-2 border-slate-700 pb-3 text-lg font-black text-slate-900">
          System Information & Organization Details
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <TextField label="Organization Name" value={form.organizationName} placeholder="Your company or organization name" onChange={(value) => onChange("organizationName", value)} />
          <TextField label="System / Application Name" value={form.systemName} placeholder="Name of the covered system or enclave" onChange={(value) => onChange("systemName", value)} />
          <TextField label="System Owner / ISSO" value={form.owner} placeholder="Name and title of the system owner" onChange={(value) => onChange("owner", value)} />
          <TextField label="SSP Version" value={form.version} onChange={(value) => onChange("version", value)} />
          <TextField label="Date" type="date" value={form.date} onChange={(value) => onChange("date", value)} />
          <TextField label="Current SPRS Score" value={form.currentSprs} onChange={(value) => onChange("currentSprs", value)} />
        </div>
        <TextArea label="System Boundary / Scope" value={form.scope} placeholder="Describe the boundary of the system - what hardware, software, networks, and data are in scope for CUI protection..." onChange={(value) => onChange("scope", value)} />
        <TextArea label="System Environment Description" value={form.environment} placeholder="Describe the operating environment - on-premise, cloud, hybrid, network topology, key technologies in use..." onChange={(value) => onChange("environment", value)} />
        <TextArea label="System Description / Purpose" value={form.purpose} placeholder="Brief description of the system's mission and how it supports your DoD contract work..." onChange={(value) => onChange("purpose", value)} />
      </section>

      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-slate-600">
        Tip: Fill in each "Implementation Description" below to document how your organization meets the control.
        <span className="font-black text-red-500"> 110 controls are not yet marked complete</span> - those will appear as POA&M items.
      </div>

      <div className="space-y-3">
        {controls.map(([domain, family, control, points, requirement]) => (
          <article key={control} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between bg-violet-600 px-4 py-3 text-white">
              <div className="flex items-center gap-3">
                <span className="rounded bg-white/20 px-2 py-1 text-xs font-black">{domain}</span>
                <span className="font-black">{family}</span>
              </div>
              <span className="text-xs font-bold">0/22 implemented</span>
            </div>
            <div className="space-y-3 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-black text-violet-700">{control}</p>
                <span className="w-fit rounded bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">Not Implemented</span>
              </div>
              <p className="font-semibold text-slate-700">
                <span className="mr-2 rounded bg-red-50 px-2 py-1 text-xs font-black text-red-500">{points}</span>
                {requirement}
              </p>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Evidence Required: Access control policy, user account listing, authorized device inventory, access request/approval records
              </p>
              <TextArea
                label="Implementation Description"
                value={controlNotes[control] || ""}
                placeholder="Describe how this control is implemented in your environment. Include tools, processes, responsible personnel, and specific configurations..."
                onChange={(value) => onNoteChange(control, value)}
              />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function POAMView({ rows, notes, onChange }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-black text-slate-900">Plan of Action & Milestones (POA&M)</h1>
        <button type="button" className="inline-flex w-fit items-center gap-2 rounded-lg bg-[#171630] px-4 py-2 text-sm font-black text-white">
          <Printer size={15} />
          Print / Export PDF
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <POAMMetric value="110" label="Open Items" tone="text-red-500" />
        <POAMMetric value="44" label="Critical (5-pt)" tone="text-red-500" />
        <POAMMetric value="14" label="Important (3-pt)" tone="text-amber-500" />
        <POAMMetric value="313" label="SPRS Pts at Risk" tone="text-violet-600" />
      </div>

      <section className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <h2 className="p-4 text-lg font-black text-slate-900">
          POA&M - [Organization Name] · NIST SP 800-171 Rev 2 · Assessment Date: 2026-06-30
        </h2>
        <table className="w-full min-w-[1040px] text-left text-sm">
          <thead className="border-y border-slate-100 bg-slate-50 text-[11px] font-black uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">POA&M ID / Control</th>
              <th className="px-4 py-3">Requirement</th>
              <th className="px-4 py-3">Weakness / Gap Description</th>
              <th className="px-4 py-3">Responsible Party & Planned Date</th>
              <th className="px-4 py-3">Resources & Milestones</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map(([id, control, points, domain, requirement]) => {
              const note = notes[id];

              return (
                <tr key={id} className="align-top">
                  <td className="px-4 py-4 font-black text-violet-700">
                    {id}
                    <br />
                    {control}
                    <div className="mt-2 flex gap-1">
                      <span className="rounded bg-red-50 px-2 py-1 text-xs text-red-500">{points}</span>
                      <span className="rounded bg-violet-100 px-2 py-1 text-xs text-violet-700">{domain}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-semibold text-slate-700">{requirement}</td>
                  <td className="px-4 py-4">
                    <textarea value={note.weakness} onChange={(event) => onChange(id, "weakness", event.target.value)} placeholder={`${requirement} - This control has not been fully implemented.`} rows={3} className="w-full rounded border border-slate-200 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200" />
                  </td>
                  <td className="space-y-2 px-4 py-4">
                    <input value={note.owner} onChange={(event) => onChange(id, "owner", event.target.value)} placeholder="Name / Role" className="h-9 w-full rounded border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200" />
                    <input type="date" value={note.date} onChange={(event) => onChange(id, "date", event.target.value)} className="h-9 w-full rounded border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200" />
                  </td>
                  <td className="space-y-2 px-4 py-4">
                    <input value={note.resources} onChange={(event) => onChange(id, "resources", event.target.value)} placeholder="Budget, tools, personnel..." className="h-9 w-full rounded border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200" />
                    <input value={note.milestones} onChange={(event) => onChange(id, "milestones", event.target.value)} placeholder="Key milestones..." className="h-9 w-full rounded border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200" />
                  </td>
                  <td className="px-4 py-4">
                    <select value={note.status} onChange={(event) => onChange(id, "status", event.target.value)} className="h-9 rounded border border-slate-200 px-2 text-sm font-bold text-slate-600">
                      <option>Not Started</option>
                      <option>In Progress</option>
                      <option>Completed</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function PolicyView({ policies }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-black text-slate-900">Policy Documents - NIST SP 800-171 Rev 2</h1>
        <button type="button" className="inline-flex w-fit items-center gap-2 rounded-lg bg-[#171630] px-4 py-2 text-sm font-black text-white">
          <Printer size={15} />
          Print All Policies
        </button>
      </div>
      <section className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900">Audit Package Policy Status - [Organization Name]</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            A C3PAO assessor will verify that each policy document exists, is approved, and has been communicated to personnel.
          </p>
        </div>
        <div className="flex gap-8 text-center">
          <StatusStat value="0" label="Approved" tone="text-emerald-500" />
          <StatusStat value="14" label="Draft" tone="text-amber-500" />
          <StatusStat value="0" label="N/A" tone="text-slate-400" />
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {policies.map(([section, domain, family, title, description, count]) => (
          <article key={`${domain}-${title}`} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">
              {section} - {family}
            </p>
            <h2 className="mt-2 text-lg font-black text-slate-900">{title}</h2>
            <p className="mt-3 line-clamp-3 min-h-16 text-sm font-semibold leading-6 text-slate-500">{description}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="rounded bg-amber-50 px-2 py-1 text-xs font-black text-amber-700">Draft</span>
              <span className="text-xs font-bold text-slate-400">{count} controls</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function TextField({ label, value, placeholder, type = "text", onChange }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</span>
      <input type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="mt-2 h-10 w-full rounded border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200" />
    </label>
  );
}

function TextArea({ label, value, placeholder, onChange }) {
  return (
    <label className="mt-4 block">
      <span className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</span>
      <textarea value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} rows={3} className="mt-2 w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200" />
    </label>
  );
}

function POAMMetric({ value, label, tone }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 text-center shadow-sm">
      <p className={`text-3xl font-black ${tone}`}>{value}</p>
      <p className="mt-1 text-xs font-black uppercase text-slate-400">{label}</p>
    </div>
  );
}

function StatusStat({ value, label, tone }) {
  return (
    <div>
      <p className={`text-3xl font-black ${tone}`}>{value}</p>
      <p className="text-xs font-black uppercase text-slate-400">{label}</p>
    </div>
  );
}
