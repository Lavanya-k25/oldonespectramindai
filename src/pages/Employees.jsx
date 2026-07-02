import { useState, useEffect } from "react";
import { Users, Plus, Mail, Search, SlidersHorizontal, Check, Edit2, Info, X, Trash2 } from "lucide-react";
import AppShell from "../components/layout/AppShell";

const initialEmployees = [];

export default function Employees() {
  const [employees, setEmployees] = useState(() => {
    try {
      const saved = localStorage.getItem("spectramind:employees");
      return saved ? JSON.parse(saved) : initialEmployees;
    } catch {
      return initialEmployees;
    }
  });

  const [activeTab, setActiveTab] = useState("Employee List");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("User");
  const [type, setType] = useState("Full-Time");
  const [hasAccess, setHasAccess] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tagsInput, setTagsInput] = useState("All Staff");

  // Dynamic States for integration (no fake fallbacks)
  const [completionsState, setCompletionsState] = useState(() => {
    try {
      const saved = localStorage.getItem("spectramind:training-completions");
      return saved ? JSON.parse(saved) : {
        "cybersecurity-awareness": [],
        "hipaa-compliance": []
      };
    } catch {
      return {
        "cybersecurity-awareness": [],
        "hipaa-compliance": []
      };
    }
  });

  const [acknowledgementsState, setAcknowledgementsState] = useState(() => {
    try {
      const saved = localStorage.getItem("spectramind:policy-acknowledgements");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [bgChecksState, setBgChecksState] = useState(() => {
    try {
      const saved = localStorage.getItem("spectramind:background-checks");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem("spectramind:employees", JSON.stringify(employees));
  }, [employees]);

  // Listener to handle instant bidirectional sync when Policies/Training pages modify localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const savedTraining = localStorage.getItem("spectramind:training-completions");
        if (savedTraining) setCompletionsState(JSON.parse(savedTraining));

        const savedPolicy = localStorage.getItem("spectramind:policy-acknowledgements");
        if (savedPolicy) setAcknowledgementsState(JSON.parse(savedPolicy));

        const savedBg = localStorage.getItem("spectramind:background-checks");
        if (savedBg) setBgChecksState(JSON.parse(savedBg));
      } catch { /* ignore */ }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleToggleAccess = (id) => {
    setEmployees(
      employees.map((emp) => (emp.id === id ? { ...emp, hasAccess: !emp.hasAccess } : emp))
    );
  };

  const handleToggleTraining = (trainingId, emp) => {
    const list = completionsState[trainingId] || [];
    const idKey = emp.id;
    const nextList = list.includes(idKey) ? list.filter(id => id !== idKey) : [...list, idKey];
    const nextCompletions = { ...completionsState, [trainingId]: nextList };
    setCompletionsState(nextCompletions);
    localStorage.setItem("spectramind:training-completions", JSON.stringify(nextCompletions));
    window.dispatchEvent(new Event("storage"));
  };

  const handleToggleBgCheck = (name) => {
    const current = bgChecksState[name] || "Pending";
    const next = current === "Completed" ? "Pending" : "Completed";
    const nextState = { ...bgChecksState, [name]: next };
    setBgChecksState(nextState);
    localStorage.setItem("spectramind:background-checks", JSON.stringify(nextState));
    window.dispatchEvent(new Event("storage"));
  };

  const getEmployeeCompliance = (emp) => {
    const cyberList = completionsState["cybersecurity-awareness"] || [];
    const cyberOk = cyberList.includes(emp.id) || cyberList.includes(emp.name);

    const hipaaList = completionsState["hipaa-compliance"] || [];
    const hipaaOk = hipaaList.includes(emp.id) || hipaaList.includes(emp.name);

    const activePolicyIds = ["POL-001", "POL-003", "POL-004", "POL-010", "POL-011", "POL-012"];
    let completedPoliciesCount = 0;
    activePolicyIds.forEach(pid => {
      const pMap = acknowledgementsState[pid] || {};
      if (pMap[emp.name] === "Completed") {
        completedPoliciesCount++;
      }
    });
    // Policy count matches default mockup logic
    const policyOk = completedPoliciesCount >= 5;

    const bgOk = bgChecksState[emp.name] === "Completed";

    const satisfiedCount = (cyberOk ? 1 : 0) + (hipaaOk ? 1 : 0) + (policyOk ? 1 : 0) + (bgOk ? 1 : 0);
    const isCompliant = satisfiedCount === 4;

    return {
      cyberOk,
      hipaaOk,
      policyOk,
      bgOk,
      satisfiedCount,
      isCompliant,
      statusLabel: isCompliant ? "COMPLIANT 4/4" : `NON-COMPLIANT ${satisfiedCount}/4`
    };
  };

  const handleOpenAddModal = () => {
    setEditingEmployeeId(null);
    setName("");
    setEmail("");
    setRole("User");
    setType("Full-Time");
    setHasAccess(true);
    setStartDate("");
    setEndDate("");
    setTagsInput("All Staff");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (emp) => {
    setEditingEmployeeId(emp.id);
    setName(emp.name);
    setEmail(emp.email);
    setRole(emp.role);
    setType(emp.type);
    setHasAccess(emp.hasAccess);
    setStartDate(emp.startDate === "-" ? "" : emp.startDate);
    setEndDate(emp.endDate === "-" ? "" : emp.endDate);
    setTagsInput(emp.tags.join(", "));
    setIsModalOpen(true);
  };

  const handleDeleteEmployee = (id) => {
    setEmployees(employees.filter((emp) => emp.id !== id));
    window.dispatchEvent(new Event("storage"));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    if (editingEmployeeId) {
      setEmployees(employees.map((emp) => emp.id === editingEmployeeId ? {
        ...emp,
        name: name.trim(),
        email: email.trim(),
        role,
        hasAccess,
        startDate: startDate || "-",
        endDate: endDate || "-",
        type,
        tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
      } : emp));
    } else {
      const newEmp = {
        id: Date.now(),
        name: name.trim(),
        email: email.trim(),
        role,
        hasAccess,
        startDate: startDate || "-",
        endDate: endDate || "-",
        type,
        tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
        employeeStatus: "Active",
      };
      setEmployees([...employees, newEmp]);
    }

    setName("");
    setEmail("");
    setRole("User");
    setType("Full-Time");
    setHasAccess(true);
    setStartDate("");
    setEndDate("");
    setTagsInput("All Staff");
    setEditingEmployeeId(null);
    setIsModalOpen(false);
    window.dispatchEvent(new Event("storage"));
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalEmps = employees.length;

  const trainingCompliantCount = employees.filter(e => {
    const comp = getEmployeeCompliance(e);
    return comp.cyberOk && comp.hipaaOk;
  }).length;

  const policyCompliantCount = employees.filter(e => {
    const comp = getEmployeeCompliance(e);
    return comp.policyOk;
  }).length;

  const bgCompliantCount = employees.filter(e => {
    const comp = getEmployeeCompliance(e);
    return comp.bgOk;
  }).length;

  const fullyCompliantCount = employees.filter(e => {
    const comp = getEmployeeCompliance(e);
    return comp.isCompliant;
  }).length;

  const fullyCompliantPercent = totalEmps ? Math.round((fullyCompliantCount / totalEmps) * 100) : 0;
  const trainingPercent = totalEmps ? Math.round((trainingCompliantCount / totalEmps) * 100) : 0;
  const policyPercent = totalEmps ? Math.round((policyCompliantCount / totalEmps) * 100) : 0;
  const bgPercent = totalEmps ? Math.round((bgCompliantCount / totalEmps) * 100) : 0;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Compliance</p>
            <h1 className="text-4xl font-black text-slate-900">Employee Compliance</h1>
            <p className="max-w-3xl text-sm leading-6 text-slate-500">
              Monitor and manage employee compliance across all active compliance frameworks.
            </p>
            <div className="mt-4 rounded-lg bg-slate-50 p-4 border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
              <p className="text-sm font-black text-slate-900 mb-2">To ensure compliance:</p>
              <ul className="space-y-1 text-sm text-slate-600 list-disc list-inside">
                <li>Upload and review required policy documents on the <a href="/policies" className="text-blue-600 hover:underline">Policy Page</a>.</li>
                <li>Send invitations to employees to complete their tasks. They will be directed to the <a href="/tasks" className="text-blue-600 hover:underline">Tasks page</a>.</li>
                <li>Ensure all team members meet the necessary compliance standards.</li>
              </ul>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 mt-4 lg:mt-0">
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <Plus size={16} />
              Add Employee
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50">
              <Mail size={16} />
              Send Invitations
            </button>
          </div>
        </div>

        {/* Custom Tabs */}
        <div className="border-b border-slate-200">
          <div className="flex gap-6">
            {["Employee List", "Employee Integrations"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-black transition-all border-b-2 ${
                  activeTab === tab
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "Employee List" ? (
          <>
            {/* Employee Compliance Overview card */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-black text-slate-900">Employee Compliance Overview</h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-700">
                    <Users size={12} />
                    {totalEmps} employees total
                  </span>
                </div>
                <div className="rounded-lg bg-rose-50 px-3 py-1.5 text-right dark:bg-rose-950/30">
                  <p className="text-[10px] font-black uppercase tracking-wider text-rose-700">COMPLIANCE SCORE</p>
                  <p className="text-sm font-black text-rose-700">{fullyCompliantPercent}% Compliance Score</p>
                </div>
              </div>

              {/* Grid of stats */}
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">FULLY COMPLIANT</p>
                  <p className="mt-2 text-3xl font-black text-slate-900">{fullyCompliantCount} / {totalEmps}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{fullyCompliantPercent}% of active employees</p>
                  <button className="mt-4 text-xs font-black text-blue-600 hover:underline">View all need action &gt;</button>
                </div>

                <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">TRAINING</p>
                  <p className="mt-2 text-3xl font-black text-slate-900">{trainingPercent}%</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{trainingCompliantCount} of {totalEmps} employees up to date</p>
                  <button className="mt-4 text-xs font-black text-blue-600 hover:underline">View behind &gt;</button>
                </div>

                <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">POLICY ACKNOWLEDGEMENT</p>
                  <p className="mt-2 text-3xl font-black text-slate-900">{policyPercent}%</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{policyCompliantCount} of {totalEmps} employees up to date</p>
                  <button className="mt-4 text-xs font-black text-blue-600 hover:underline">View behind &gt;</button>
                </div>

                <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">BACKGROUND CHECK</p>
                  <p className="mt-2 text-3xl font-black text-slate-900">{bgPercent}%</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{bgCompliantCount} of {totalEmps} employees up to date</p>
                  <button className="mt-4 text-xs font-black text-blue-600 hover:underline">View behind &gt;</button>
                </div>
              </div>
            </div>

            {/* Frameworks grid */}
            <div className="space-y-3">
              <h2 className="flex items-center gap-2 text-lg font-black text-slate-900">
                Frameworks
                <button className="text-slate-400 hover:text-slate-600">
                  <Info size={16} />
                </button>
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* SOC 2 card */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-black text-slate-900">SOC 2</h3>
                      <p className="text-xs font-semibold text-slate-500">{fullyCompliantCount} of {totalEmps} compliant</p>
                    </div>
                    <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${
                      fullyCompliantPercent === 100 ? "bg-blue-50 text-blue-700" : "bg-rose-50 text-rose-700"
                    }`}>
                      {fullyCompliantPercent}%
                    </span>
                  </div>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-semibold">Training</span>
                      <span className="font-black text-blue-600">{trainingPercent}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-semibold">Policy</span>
                      <span className="font-black text-blue-650">{policyPercent}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-semibold">Background Check</span>
                      <span className="font-black text-blue-650">{bgPercent}%</span>
                    </div>
                  </div>
                </div>

                {/* HIPAA card */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-black text-slate-900">HIPAA</h3>
                      <p className="text-xs font-semibold text-slate-500">{fullyCompliantCount} of {totalEmps} compliant</p>
                    </div>
                    <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${
                      fullyCompliantPercent === 100 ? "bg-blue-50 text-blue-700" : "bg-rose-50 text-rose-700"
                    }`}>
                      {fullyCompliantPercent}%
                    </span>
                  </div>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-semibold">Training</span>
                      <span className="font-black text-blue-600">{trainingPercent}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-semibold">Policy</span>
                      <span className="font-black text-blue-650">{policyPercent}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-semibold">Background Check</span>
                      <span className="font-black text-blue-650">{bgPercent}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search/Filters row */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title or ID"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-800 outline-none focus:border-blue-500 dark:border-slate-850 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50">
                <SlidersHorizontal size={16} />
                Filters
              </button>
            </div>

            {/* Employee Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <table className="w-full border-collapse text-left text-sm text-slate-600">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-black uppercase tracking-wider text-slate-500 dark:bg-slate-900/50">
                    <th className="px-6 py-4">Compliance Status</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">System Role</th>
                    <th className="px-6 py-4">Has Access To Client Portal</th>
                    <th className="px-6 py-4">Start Date</th>
                    <th className="px-6 py-4">End Date</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Roles</th>
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/50 transition">
                      <td className="whitespace-nowrap px-6 py-4">
                        {(() => {
                          const comp = getEmployeeCompliance(emp);
                          return (
                            <div className="flex flex-col gap-1.5">
                              <span className={`inline-flex px-2 py-0.5 text-xs font-black rounded ${
                                comp.isCompliant ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                              }`}>
                                {comp.statusLabel}
                              </span>
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  title="Toggle Cybersecurity Training Completion"
                                  onClick={() => handleToggleTraining("cybersecurity-awareness", emp)}
                                  className={`h-4 px-1 text-[9px] font-black rounded border transition ${
                                    comp.cyberOk ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-slate-50 text-slate-400 border-slate-200"
                                  }`}
                                >
                                  Cyber
                                </button>
                                <button
                                  type="button"
                                  title="Toggle HIPAA Training Completion"
                                  onClick={() => handleToggleTraining("hipaa-compliance", emp)}
                                  className={`h-4 px-1 text-[9px] font-black rounded border transition ${
                                    comp.hipaaOk ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-slate-50 text-slate-400 border-slate-200"
                                  }`}
                                >
                                  HIPAA
                                </button>
                                <button
                                  type="button"
                                  title="Toggle Background Check Status"
                                  onClick={() => handleToggleBgCheck(emp.name)}
                                  className={`h-4 px-1 text-[9px] font-black rounded border transition ${
                                    comp.bgOk ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-400 border-slate-200"
                                  }`}
                                >
                                  BG
                                </button>
                              </div>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-bold text-slate-950 dark:text-white">
                        {emp.name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-500">
                        {emp.email}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-800">
                        {emp.role}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <button
                          onClick={() => handleToggleAccess(emp.id)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            emp.hasAccess ? "bg-blue-600" : "bg-slate-200"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              emp.hasAccess ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-500">
                        {emp.startDate}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-500">
                        {emp.endDate}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-800">
                        {emp.type}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {emp.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="flex items-center gap-1.5 font-bold text-emerald-600">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          {emp.employeeStatus}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            title="Edit Employee"
                            onClick={() => handleOpenEditModal(emp)}
                            className="rounded-lg p-1.5 text-slate-450 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            title="Delete Employee"
                            onClick={() => handleDeleteEmployee(emp.id)}
                            className="rounded-lg p-1.5 text-slate-450 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="py-12 text-center text-sm font-semibold text-slate-400">
            No integrations configured.
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-950 dark:text-white">
                {editingEmployeeId ? "Edit Employee" : "Add New Employee"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-350">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none focus:border-blue-500 dark:border-slate-880 dark:bg-slate-955 dark:text-white"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-350">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none focus:border-blue-500 dark:border-slate-880 dark:bg-slate-955 dark:text-white"
                  placeholder="e.g. john@company.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-350">
                    System Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none focus:border-blue-500 dark:border-slate-880 dark:bg-slate-955 dark:text-white"
                  >
                    <option value="Admin">Admin</option>
                    <option value="User">User</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-350">
                    Employee Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none focus:border-blue-500 dark:border-slate-880 dark:bg-slate-955 dark:text-white"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Contractor">Contractor</option>
                    <option value="Part-Time">Part-Time</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between py-2 border-y border-slate-100 dark:border-slate-800">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Has Access to Client Portal
                </span>
                <button
                  type="button"
                  onClick={() => setHasAccess(!hasAccess)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    hasAccess ? "bg-blue-600" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      hasAccess ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-350">
                    Start Date
                  </label>
                  <input
                    type="text"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none focus:border-blue-500 dark:border-slate-880 dark:bg-slate-955 dark:text-white"
                    placeholder="e.g. 5/12/2026"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-350">
                    End Date
                  </label>
                  <input
                    type="text"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none focus:border-blue-500 dark:border-slate-880 dark:bg-slate-955 dark:text-white"
                    placeholder="e.g. 5/12/2027"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-350">
                  Roles / Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none focus:border-blue-500 dark:border-slate-880 dark:bg-slate-955 dark:text-white"
                  placeholder="All Staff, HR, Engineering..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
