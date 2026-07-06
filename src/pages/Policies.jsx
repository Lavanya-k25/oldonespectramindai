import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FileText, Search, SlidersHorizontal, ChevronDown, X, ShieldAlert, Download, Settings } from "lucide-react";
import AppShell from "../components/layout/AppShell";
import { useComplianceState } from "../compliance/ComplianceStateContext";
import { readScopedJson } from "../auth/session";
import { useUser } from "../auth/UserContext";
import {
  archivePolicy,
  canManagePolicies,
  createCustomPolicy,
  getPolicyMetrics,
  loadPolicyAcknowledgements,
  loadPolicyAssignments,
  loadPolicyLibrary,
  publishPolicy,
  resetPolicyAcknowledgements,
  savePolicyAcknowledgements,
  savePolicyAssignments,
  savePolicyLibrary,
  updatePolicy,
} from "../policies/PolicyService";

// Sourced dynamically from the framework engine and organization workspace state

import ActiveFrameworkRequired from "../framework/ActiveFrameworkRequired";
import { useFrameworkWorkspace } from "../framework/FrameworkWorkspaceContext";
import { buildCrossModuleTarget } from "../navigation/crossModuleNavigation";
import { useEffect } from "react";

export default function Policies() {
  const { activeFramework } = useFrameworkWorkspace();

  if (!activeFramework) {
    return <ActiveFrameworkRequired />;
  }

  return <PoliciesContent key={activeFramework.id} activeFramework={activeFramework} />;
}

function PoliciesContent({ activeFramework }) {
  const location = useLocation();
  const navigate = useNavigate();
  const targetItemId = new URLSearchParams(location.search).get("item");
  const { policies: frameworkPolicies, workspaceData, actions } = useComplianceState();
  const { user } = useUser();
  const canManage = canManagePolicies(user);
  const [employees, setEmployees] = useState(() => readScopedJson("spectramind:employees", []));
  const [policyLibrary, setPolicyLibrary] = useState(() => loadPolicyLibrary(activeFramework.id, frameworkPolicies, activeFramework));
  const [policyAssignments, setPolicyAssignments] = useState(() =>
    loadPolicyAssignments(activeFramework.id, readScopedJson("spectramind:employees", []), loadPolicyLibrary(activeFramework.id, frameworkPolicies, activeFramework))
  );

  const [acknowledgementsState, setAcknowledgementsState] = useState(() => {
    try {
      return loadPolicyAcknowledgements(activeFramework.id);
    } catch {
      return {};
    }
  });
  const [newPolicyName, setNewPolicyName] = useState("");
  const [newPolicyDescription, setNewPolicyDescription] = useState("");

  const persistLibrary = (nextLibrary, nextAcknowledgements = acknowledgementsState, nextAssignments = policyAssignments) => {
    setPolicyLibrary(nextLibrary);
    savePolicyLibrary(activeFramework.id, nextLibrary);
    savePolicyAcknowledgements(activeFramework.id, nextAcknowledgements, employees, nextLibrary, nextAssignments);
  };

  const persistAssignments = (nextAssignments) => {
    setPolicyAssignments(nextAssignments);
    savePolicyAssignments(activeFramework.id, nextAssignments);
    savePolicyAcknowledgements(activeFramework.id, acknowledgementsState, employees, policyLibrary, nextAssignments);
  };

  const handleToggleAcknowledgement = (policyId, employeeId) => {
    const policyMap = acknowledgementsState[policyId] || {};
    const currentStatus = policyMap[employeeId];
    const nextState = {
      ...acknowledgementsState,
      [policyId]: currentStatus
        ? Object.fromEntries(Object.entries(policyMap).filter(([id]) => id !== String(employeeId)))
        : {
            ...policyMap,
            [employeeId]: { acknowledgedAt: new Date().toISOString(), acknowledgedBy: user?.userId },
          },
    };

    setAcknowledgementsState(nextState);
    savePolicyAcknowledgements(activeFramework.id, nextState, employees, policyLibrary, policyAssignments);
  };

  const updatePolicyField = (policyId, updates) => {
    if (!canManage) return;
    const currentPolicy = policyLibrary.find((policy) => policy.id === policyId);
    const nextLibrary = updatePolicy(policyLibrary, policyId, updates);
    const nextAcknowledgements =
      currentPolicy?.requireReacknowledgement && (updates.name !== undefined || updates.description !== undefined || updates.version !== undefined)
        ? resetPolicyAcknowledgements(acknowledgementsState, policyId)
        : acknowledgementsState;
    setAcknowledgementsState(nextAcknowledgements);
    persistLibrary(nextLibrary, nextAcknowledgements);
  };

  const handlePublish = (policyId) => {
    if (!canManage) return;
    persistLibrary(publishPolicy(policyLibrary, policyId));
  };

  const handleArchivePolicy = (policyId) => {
    if (!canManage) return;
    persistLibrary(archivePolicy(policyLibrary, policyId));
  };

  const handleAssignmentToggle = (policyId, employeeId) => {
    if (!canManage) return;
    const current = policyAssignments[policyId] || [];
    const next = current.includes(employeeId) ? current.filter((id) => id !== employeeId) : [...current, employeeId];
    persistAssignments({ ...policyAssignments, [policyId]: next });
  };

  const handleCreatePolicy = () => {
    if (!canManage || !newPolicyName.trim()) return;
    const nextLibrary = createCustomPolicy(activeFramework.id, policyLibrary, {
      name: newPolicyName.trim(),
      description: newPolicyDescription.trim(),
      owner: user?.name || "Unassigned",
    }, activeFramework);
    const newPolicy = nextLibrary[nextLibrary.length - 1];
    const nextAssignments = { ...policyAssignments, [newPolicy.id]: [] };
    setNewPolicyName("");
    setNewPolicyDescription("");
    setPolicyAssignments(nextAssignments);
    savePolicyAssignments(activeFramework.id, nextAssignments);
    persistLibrary(nextLibrary, acknowledgementsState, nextAssignments);
  };

  const currentEmployee = employees.find((employee) => employee.email?.toLowerCase() === user?.email?.toLowerCase()) ||
    employees.find((employee) => employee.name === user?.name);

  const policies = policyLibrary.map((p) => {
    const saved = workspaceData[p.id] ?? {};
    const activeAcks = acknowledgementsState[p.id] || {};
    const metrics = getPolicyMetrics(p, employees, policyAssignments, acknowledgementsState);
    const assignedEmployees = employees.filter((employee) => (policyAssignments[p.id] || []).includes(employee.id));
    const visibleAcknowledgementEmployees = canManage ? assignedEmployees : assignedEmployees.filter((employee) => employee.id === currentEmployee?.id);
    const acknowledgementsList = visibleAcknowledgementEmployees.map((employee) => ({
      id: employee.id,
      name: employee.name,
      status: activeAcks[employee.id] ? "Completed" : "Pending",
    }));
    const sourcePolicy = p.sourcePolicy || {};

    return {
      id: p.id,
      title: p.name,
      description: p.description,
      status: p.status,
      acknowledged: `${metrics.acknowledged}/${metrics.assigned}`,
      nextVersion: p.version,
      reviewers: "-",
      assignedTo: p.owner || saved.assignments?.owner || "Unassigned",
      renewalFrequency: p.reviewDate || "-",
      frameworks: p.relatedFrameworks.join(", "),
      otherFrameworks: "-",
      tags: ["All Staff"],
      documentName: `${p.name.replace(/[\/\s+]/g, "_").toLowerCase()}.docx`,
      documentDate: p.effectiveDate || "-",
      acknowledgements: acknowledgementsList,
      metrics,
      policy: p,
      connectedTests: sourcePolicy.linkedControls?.map((ctrlId) => ({
        id: ctrlId,
        title: ctrlId,
        description: `Organization's documented ${p.name.toLowerCase()}...`,
        owner: saved.assignments?.owner || "Unassigned",
        status: "READY"
      })) || []
    };
  });


  const [selectedPolicyId, setSelectedPolicyId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const visiblePolicies = canManage
    ? policies
    : policies.filter((policy) => currentEmployee && (policyAssignments[policy.id] || []).includes(currentEmployee.id));

  useEffect(() => {
    const refresh = () => {
      const nextEmployees = readScopedJson("spectramind:employees", []);
      const nextLibrary = loadPolicyLibrary(activeFramework.id, frameworkPolicies, activeFramework);
      setEmployees(nextEmployees);
      setPolicyLibrary(nextLibrary);
      setPolicyAssignments(loadPolicyAssignments(activeFramework.id, nextEmployees, nextLibrary));
      setAcknowledgementsState(loadPolicyAcknowledgements(activeFramework.id));
    };
    window.addEventListener("storage", refresh);
    window.addEventListener("spectramind:policy-updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("spectramind:policy-updated", refresh);
    };
  }, [activeFramework, frameworkPolicies]);

  useEffect(() => {
    if (targetItemId && visiblePolicies.some((policy) => policy.id === targetItemId)) {
      setSelectedPolicyId(targetItemId);
      return;
    }
    if (visiblePolicies.length && !selectedPolicyId) {
      setSelectedPolicyId(visiblePolicies[0].id);
    }
  }, [targetItemId, visiblePolicies, selectedPolicyId]);

  const selectedPolicy = visiblePolicies.find((p) => p.id === selectedPolicyId);
  const openImplementationRecord = (itemId, itemType = "Control") => {
    const target = buildCrossModuleTarget({
      activeFramework,
      itemId,
      itemType,
      moduleContext: `Policy:${selectedPolicyId || ""}`,
      mode: "view",
    });
    navigate(target.path, { state: target.state });
  };

  const handleArchive = (policyId) => {
    handleArchivePolicy(policyId);
    const currentState = workspaceData[policyId] ?? {};
    actions.saveComplianceItem(policyId, {
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
    actions.saveComplianceItem(policyId, {
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

  const filteredPolicies = visiblePolicies.filter((p) =>
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

        {canManage ? (
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <h2 className="text-sm font-black text-slate-900">Create Policy</h2>
            <div className="mt-3 grid gap-2 md:grid-cols-[1fr_1fr_auto]">
              <input
                value={newPolicyName}
                onChange={(event) => setNewPolicyName(event.target.value)}
                placeholder="Policy name"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold outline-none"
              />
              <input
                value={newPolicyDescription}
                onChange={(event) => setNewPolicyDescription(event.target.value)}
                placeholder="Description"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold outline-none"
              />
              <button
                type="button"
                onClick={handleCreatePolicy}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-black text-white"
              >
                Create
              </button>
            </div>
          </div>
        ) : null}

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

              {canManage ? (
                <div className="grid gap-2">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handlePublish(selectedPolicy.id)}
                      className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-black text-white"
                    >
                      Publish
                    </button>
                    <button
                      type="button"
                      onClick={() => handleArchivePolicy(selectedPolicy.id)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50"
                    >
                      Archive
                    </button>
                  </div>
                  <input
                    value={selectedPolicy.policy.name}
                    onChange={(event) => updatePolicyField(selectedPolicy.id, { name: event.target.value })}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-800 outline-none"
                  />
                  <textarea
                    value={selectedPolicy.policy.description}
                    onChange={(event) => updatePolicyField(selectedPolicy.id, { description: event.target.value })}
                    className="min-h-20 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 outline-none"
                  />
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      value={selectedPolicy.policy.version}
                      onChange={(event) => updatePolicyField(selectedPolicy.id, { version: event.target.value })}
                      placeholder="Version"
                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold outline-none"
                    />
                    <input
                      value={selectedPolicy.policy.owner}
                      onChange={(event) => updatePolicyField(selectedPolicy.id, { owner: event.target.value })}
                      placeholder="Owner"
                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold outline-none"
                    />
                    <input
                      type="date"
                      value={selectedPolicy.policy.effectiveDate}
                      onChange={(event) => updatePolicyField(selectedPolicy.id, { effectiveDate: event.target.value })}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold outline-none"
                    />
                    <input
                      type="date"
                      value={selectedPolicy.policy.reviewDate}
                      onChange={(event) => updatePolicyField(selectedPolicy.id, { reviewDate: event.target.value })}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold outline-none"
                    />
                  </div>
                </div>
              ) : null}

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
                    <span className="text-slate-500 font-semibold">Version</span>
                    <span className="font-bold text-slate-850 dark:text-white">{selectedPolicy.policy.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Owner</span>
                    <span className="font-bold text-slate-850 dark:text-white">{selectedPolicy.policy.owner}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Effective Date</span>
                    <span className="font-bold text-slate-850 dark:text-white">{selectedPolicy.policy.effectiveDate || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Review Date</span>
                    <span className="font-bold text-slate-850 dark:text-white">{selectedPolicy.policy.reviewDate || "-"}</span>
                  </div>
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

              <div className="grid gap-2 rounded-lg border border-slate-100 bg-slate-50/50 p-3 text-xs font-semibold text-slate-600">
                <div className="flex justify-between">
                  <span>Assigned</span>
                  <span className="font-black">{selectedPolicy.metrics.assigned}</span>
                </div>
                <div className="flex justify-between">
                  <span>Acknowledged</span>
                  <span className="font-black">{selectedPolicy.metrics.acknowledged}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pending</span>
                  <span className="font-black">{selectedPolicy.metrics.pending}</span>
                </div>
                <div className="flex justify-between">
                  <span>Completion</span>
                  <span className="font-black">{selectedPolicy.metrics.percentage}%</span>
                </div>
              </div>

              {selectedPolicy.policy.versionHistory?.length ? (
                <details className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                  <summary className="cursor-pointer text-xs font-black uppercase tracking-wider text-slate-500">
                    Version History
                  </summary>
                  <div className="mt-2 space-y-2">
                    {selectedPolicy.policy.versionHistory.map((version) => (
                      <div key={version.id} className="rounded bg-white p-2 text-xs font-semibold text-slate-600">
                        v{version.version} · {version.name} · {version.archivedAt ? new Date(version.archivedAt).toLocaleDateString() : "-"}
                      </div>
                    ))}
                  </div>
                </details>
              ) : null}

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
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    {canManage ? "Employee Assignments & Acknowledgements" : "My Acknowledgement"}
                  </h4>
                  <div className="grid gap-2">
                    {(canManage ? employees : selectedPolicy.acknowledgements).map((item) => {
                      const employee = canManage ? item : employees.find((candidate) => candidate.id === item.id) || item;
                      const isAssigned = (policyAssignments[selectedPolicy.id] || []).includes(employee.id);
                      const ack = selectedPolicy.acknowledgements.find((candidate) => candidate.id === employee.id) || {
                        id: employee.id,
                        name: employee.name,
                        status: "Pending",
                      };

                      return (
                      <div
                        key={employee.id}
                        className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-700 p-2 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-100/50 select-none dark:border-slate-800"
                      >
                        <div className="flex items-center gap-2.5">
                          {canManage ? (
                            <input
                              type="checkbox"
                              checked={isAssigned}
                              onChange={() => handleAssignmentToggle(selectedPolicy.id, employee.id)}
                              className="h-4 w-4 rounded border-slate-300 text-blue-600"
                            />
                          ) : null}
                          <span className={`h-2.5 w-2.5 rounded-full ${
                            ack.status === "Completed" ? "bg-emerald-500" : "bg-rose-500"
                          }`} />
                          <span>{ack.name}</span>
                        </div>
                        <button
                          type="button"
                          disabled={!isAssigned}
                          onClick={() => handleToggleAcknowledgement(selectedPolicy.id, employee.id)}
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded disabled:opacity-40 ${
                            ack.status === "Completed" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {ack.status === "Completed" ? "Acknowledged" : "Acknowledge"}
                        </button>
                      </div>
                    );
                    })}
                  </div>
                </div>
              )}

              {/* Connected Tests */}
              {selectedPolicy.connectedTests.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Connected Tests</h4>
                  <div className="space-y-2">
                    {selectedPolicy.connectedTests.map((t) => (
                      <button
                        type="button"
                        key={t.id || t.title}
                        onClick={() => openImplementationRecord(t.id, "Control")}
                        className="w-full rounded-lg border border-slate-150 p-4 text-left space-y-3 bg-[#fffdf8]/30 transition hover:bg-blue-50/40 dark:border-slate-800"
                      >
                        <p className="text-sm font-bold text-slate-900 leading-relaxed">{t.description || t.title}</p>
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
                      </button>
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
