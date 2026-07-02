import { useState } from "react";
import { FileText, Search, SlidersHorizontal, ChevronDown, Check, X, ShieldAlert, Download, Settings } from "lucide-react";
import AppShell from "../components/layout/AppShell";

// Sourced dynamically from the framework engine and organization workspace state

import { useFrameworkData } from "../core/adapters/useFrameworkData";
import { useOrganizationStore } from "../core/adapters/useOrganizationStore";
import { useEffect } from "react";

export default function Policies() {
  const { policies: frameworkPolicies } = useFrameworkData("soc-2");
  const { workspaceData, saveWorkspaceItem } = useOrganizationStore();

  const [acknowledgementsState, setAcknowledgementsState] = useState(() => {
    try {
      const saved = localStorage.getItem("spectramind:policy-acknowledgements");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleToggleAcknowledgement = (policyId, employeeName) => {
    const policyMap = acknowledgementsState[policyId] || {};
    const currentStatus = policyMap[employeeName] || "Pending";
    const nextStatus = currentStatus === "Completed" ? "Pending" : "Completed";

    const nextState = {
      ...acknowledgementsState,
      [policyId]: {
        ...policyMap,
        [employeeName]: nextStatus,
      }
    };

    setAcknowledgementsState(nextState);
    localStorage.setItem("spectramind:policy-acknowledgements", JSON.stringify(nextState));

    // Dispatch storage event to sync with Employees.jsx immediately
    window.dispatchEvent(new Event("storage"));
  };

  const policies = frameworkPolicies.map((p) => {
    const saved = workspaceData[p.id] ?? {};

    // Determine frameworks assigned based on policy ID matching mockup
    const isHipaa = ["POL-002", "POL-003", "POL-004", "POL-010", "POL-011", "POL-012"].includes(p.id);
    const frameworksLabel = isHipaa ? "HIPAA" : "SOC 2";

    // Legacy status matches mockup
    const status = saved.status === "Approved" || saved.status === "complete" || saved.status === "implemented"
      ? "Published"
      : "Published - Legacy";

    const activeAcks = acknowledgementsState[p.id] || {};
    
    // Load staff names dynamically from database (localStorage)
    const defaultStaff = (() => {
      try {
        const saved = localStorage.getItem("spectramind:employees");
        const list = saved ? JSON.parse(saved) : [];
        return list.map((emp) => emp.name);
      } catch {
        return [];
      }
    })();

    const acknowledgementsList = defaultStaff.map((name) => ({
      name,
      status: activeAcks[name] || "Pending",
    }));

    const completedCount = acknowledgementsList.filter((a) => a.status === "Completed").length;
    const totalCount = acknowledgementsList.length;
    const acknowledgedLabel = p.id === "POL-002" ? "Not required" : `${completedCount}/${totalCount}`;

    return {
      id: p.id,
      title: p.title,
      status,
      acknowledged: acknowledgedLabel,
      nextVersion: "-",
      reviewers: "-",
      assignedTo: saved.assignments?.owner || "Unassigned",
      renewalFrequency: "-",
      frameworks: frameworksLabel,
      otherFrameworks: p.id === "POL-001" ? "ISO 27001:2022" : "-",
      tags: ["All Staff"],
      documentName: p.id === "POL-001" ? "Information security policy.docx" : `${p.title.replace(/[\/\s+]/g, "_").toLowerCase()}.docx`,
      documentDate: "01/28/26, 08:32 PM",
      acknowledgements: acknowledgementsList,
      connectedTests: p.linkedControls?.map((ctrlId) => ({
        title: `Organization's documented ${p.title.toLowerCase()}...`,
        owner: saved.assignments?.owner || "Unassigned",
        status: "READY"
      })) || []
    };
  });


  const [selectedPolicyId, setSelectedPolicyId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (policies.length && !selectedPolicyId) {
      setSelectedPolicyId(policies[0].id);
    }
  }, [policies, selectedPolicyId]);

  const selectedPolicy = policies.find((p) => p.id === selectedPolicyId);

  const handleArchive = (policyId) => {
    const currentState = workspaceData[policyId] ?? {};
    saveWorkspaceItem(policyId, {
      ...currentState,
      status: "complete", // switches legacy flow to active flow
      timeline: [
        { id: `archive-${Date.now()}`, label: "Policy archived and legacy flow cleared" },
        ...(currentState.timeline ?? []),
      ],
    });
  };

  const handleToggleApplicability = (policyId) => {
    const currentState = workspaceData[policyId] ?? {};
    const isCurrentNotApplicable = currentState.status === "not_applicable" || currentState.status === "Not Applicable";
    const nextStatus = isCurrentNotApplicable ? "complete" : "not_applicable";
    saveWorkspaceItem(policyId, {
      ...currentState,
      status: nextStatus,
      timeline: [
        {
          id: `app-${Date.now()}`,
          label: nextStatus === "not_applicable" ? "Policy marked as not applicable" : "Policy marked as applicable"
        },
        ...(currentState.timeline ?? []),
      ],
    });
  };

  const filteredPolicies = policies.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Framework Header Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* SOC 2 card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-black text-slate-950 dark:text-white">SOC 2</h3>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  22 of 22 applicable published (22 total, 0 not applicable)
                </p>
              </div>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-700 text-xs font-black">
                100%
              </span>
            </div>
            <div className="mt-4 space-y-2 text-xs font-bold text-slate-500">
              <div className="flex items-center justify-between">
                <span>Published</span>
                <span>100%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Acknowledged</span>
                <span>0%</span>
              </div>
            </div>
          </div>

          {/* HIPAA card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-black text-slate-950 dark:text-white">HIPAA</h3>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  30 of 30 applicable published (30 total, 1 not applicable)
                </p>
              </div>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-50 text-rose-700 text-xs font-black">
                0%
              </span>
            </div>
            <div className="mt-4 space-y-2 text-xs font-bold text-slate-500">
              <div className="flex items-center justify-between">
                <span>Published</span>
                <span>0%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Acknowledged</span>
                <span>0%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search, Filter, Sort Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or ID"
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-800 outline-none focus:border-blue-500 dark:border-slate-850 dark:bg-slate-950 dark:text-white"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-50">
              <SlidersHorizontal size={16} />
              Filters
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-50">
              Sort by
              <ChevronDown size={16} />
            </button>
            <button className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50">
              <Settings size={18} />
            </button>
          </div>
        </div>

        {/* Grid split layout for Table + Right Drawer */}
        <section className="grid gap-4 xl:grid-cols-[1fr_420px] items-start">
          {/* Policies Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <table className="w-full border-collapse text-left text-sm text-slate-600">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-black uppercase tracking-wider text-slate-500 dark:bg-slate-900/50">
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Publishing Status</th>
                  <th className="px-6 py-4">Acknowledged</th>
                  <th className="px-6 py-4">Next Version</th>
                  <th className="px-6 py-4">Reviewers</th>
                  <th className="px-6 py-4">Assigned To</th>
                  <th className="px-6 py-4">Renewal Frequency</th>
                  <th className="px-6 py-4">Frameworks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPolicies.map((p) => {
                  const isSelected = selectedPolicyId === p.id;
                  const isNotApplicable = p.status === "not_applicable" || p.status === "Not Applicable";
                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedPolicyId(p.id)}
                      className={`cursor-pointer transition hover:bg-slate-50/50 ${
                        isSelected ? "bg-blue-50/20 dark:bg-slate-800/30" : ""
                      }`}
                    >
                      <td className="px-6 py-4 font-bold text-slate-950 dark:text-white">
                        {p.title}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 font-bold ${
                          isNotApplicable ? "text-slate-400" : "text-blue-600"
                        }`}>
                          {isNotApplicable ? "Not Applicable" : p.status}
                          <ChevronDown size={14} />
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {isNotApplicable ? "Not required" : p.acknowledged}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-400">
                        {p.nextVersion}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-400">
                        {p.reviewers}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-600 uppercase">
                            {p.assignedTo[0]}
                          </span>
                          <span className="font-semibold text-slate-800">{p.assignedTo}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-400">
                        {p.renewalFrequency}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {p.frameworks}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Right Policy Drawer */}
          {selectedPolicy && (
            <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 space-y-6">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                <div className="space-y-1">
                  <h2 className="text-lg font-black text-slate-950 dark:text-white">
                    {selectedPolicy.title}
                  </h2>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border-2 border-slate-400" />
                    {selectedPolicy.status === "not_applicable" || selectedPolicy.status === "Not Applicable" || selectedPolicy.acknowledged === "Not required"
                      ? "ACKNOWLEDGEMENT NOT REQUIRED"
                      : `${selectedPolicy.acknowledged} ACKNOWLEDGED`}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPolicyId(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Amber Info Box (only display if status is Published - Legacy) */}
              {selectedPolicy.status === "Published - Legacy" && (
                <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 space-y-3 dark:border-amber-900/50 dark:bg-amber-950/20">
                  <div className="flex items-start gap-2 text-amber-800 dark:text-amber-300">
                    <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-black">This policy uses the legacy flow</h4>
                      <p className="mt-1 text-xs leading-5 text-amber-700/90 dark:text-amber-400/90">
                        Previously uploaded evidence and prior acknowledgements are shown below in read-only mode. Please archive this previously accepted policy before authoring future versions in the updated Policy system. The archived policy will still be available for your review under Version History when you open Full View of this policy entity.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleArchive(selectedPolicy.id)}
                    className="w-full rounded-lg bg-slate-900 py-2 text-xs font-black text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950"
                  >
                    Archive Current Policy
                  </button>
                </div>
              )}

              {/* Details Section */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Details</h4>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Active Frameworks</span>
                    <span className="font-bold text-slate-850 dark:text-white">{selectedPolicy.frameworks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Other Frameworks</span>
                    <span className="font-bold text-slate-850 dark:text-white">{selectedPolicy.otherFrameworks}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-semibold">Tags</span>
                    <div className="flex gap-1">
                      {selectedPolicy.tags.map((tag) => (
                        <span key={tag} className="rounded bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Uploaded Policy Documents */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Uploaded Policy Documents</h4>
                <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/50">
                  <div className="flex items-center gap-3">
                    <div className="rounded bg-blue-50 p-2 text-blue-600">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 dark:text-white">{selectedPolicy.documentName}</p>
                      <p className="text-[10px] font-semibold text-slate-400">{selectedPolicy.documentDate}</p>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-slate-700">
                    <Download size={16} />
                  </button>
                </div>
              </div>

              {/* Employee Acknowledgements */}
              {selectedPolicy.acknowledgements.length > 0 && selectedPolicy.status !== "not_applicable" && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Employee Acknowledgements</h4>
                  <div className="grid gap-2">
                    {selectedPolicy.acknowledgements.map((ack) => (
                      <div
                        key={ack.name}
                        onClick={() => handleToggleAcknowledgement(selectedPolicy.id, ack.name)}
                        className="flex items-center justify-between text-sm font-semibold text-slate-700 cursor-pointer p-2 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-100/50 select-none dark:border-slate-800"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`h-2.5 w-2.5 rounded-full ${
                            ack.status === "Completed" ? "bg-emerald-500" : "bg-rose-500"
                          }`} />
                          <span>{ack.name}</span>
                        </div>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                          ack.status === "Completed" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                        }`}>
                          {ack.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Connected Tests */}
              {selectedPolicy.connectedTests.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Connected Tests</h4>
                  <div className="space-y-2">
                    {selectedPolicy.connectedTests.map((t) => (
                      <div
                        key={t.title}
                        className="rounded-lg border border-slate-150 p-4 space-y-3 bg-[#fffdf8]/30 dark:border-slate-800"
                      >
                        <p className="text-sm font-bold text-slate-900 leading-relaxed">{t.title}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-black text-slate-600 uppercase">
                              {t.owner[0]}
                            </span>
                            <span className="text-xs font-semibold text-slate-500">{t.owner}</span>
                          </div>
                          <span className="rounded bg-blue-50 border border-blue-200 px-2 py-0.5 text-xs font-black text-blue-700">
                            {t.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                <button
                  onClick={() => handleToggleApplicability(selectedPolicy.id)}
                  className="text-xs font-black text-slate-400 hover:text-slate-600 hover:underline"
                >
                  {selectedPolicy.status === "not_applicable" || selectedPolicy.status === "Not Applicable"
                    ? "Mark as Applicable"
                    : "Mark as Not Applicable"}
                </button>
              </div>
            </aside>
          )}
        </section>
      </div>
    </AppShell>
  );
}

