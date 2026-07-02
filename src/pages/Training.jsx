import { useState, useEffect } from "react";
import { GraduationCap, ChevronDown, ChevronUp, CheckCircle, Info } from "lucide-react";
import AppShell from "../components/layout/AppShell";

const defaultEmployees = [];

export default function Training() {
  const [employees, setEmployees] = useState(() => {
    try {
      const saved = localStorage.getItem("spectramind:employees");
      const list = saved ? JSON.parse(saved) : [];
      return list;
    } catch {
      return [];
    }
  });

  const [completions, setCompletions] = useState(() => {
    try {
      const saved = localStorage.getItem("spectramind:training-completions");
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return {
      "cybersecurity-awareness": [],
      "hipaa-compliance": [],
    };
  });

  const [expandedTrainingId, setExpandedTrainingId] = useState(null);

  useEffect(() => {
    localStorage.setItem("spectramind:training-completions", JSON.stringify(completions));
  }, [completions]);

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem("spectramind:employees");
        if (saved) setEmployees(JSON.parse(saved));
      } catch { /* ignore */ }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleToggleCompletion = (trainingId, employeeId) => {
    setCompletions((current) => {
      const list = current[trainingId] || [];
      const nextList = list.includes(employeeId)
        ? list.filter((id) => id !== employeeId)
        : [...list, employeeId];
      return { ...current, [trainingId]: nextList };
    });
  };

  // Derive metrics
  const totalEmployees = employees.length;
  const cyberCompleted = completions["cybersecurity-awareness"]?.length || 0;
  const hipaaCompleted = completions["hipaa-compliance"]?.length || 0;

  const cyberPercent = totalEmployees ? Math.round((cyberCompleted / totalEmployees) * 100) : 0;
  const hipaaPercent = totalEmployees ? Math.round((hipaaCompleted / totalEmployees) * 100) : 0;

  const totalTrainings = 2;
  const fullyCompletedTrainings = (cyberCompleted === totalEmployees ? 1 : 0) + (hipaaCompleted === totalEmployees ? 1 : 0);

  const totalRequiredCompletions = totalEmployees * totalTrainings;
  const totalCompletedCompletions = cyberCompleted + hipaaCompleted;

  const coveragePercent = totalRequiredCompletions ? Math.round((totalCompletedCompletions / totalRequiredCompletions) * 100) : 0;
  const scorePercent = coveragePercent; // Binds score to coverage

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900">Training</h1>
          <p className="max-w-4xl text-sm leading-6 text-slate-500">
            Trainings help your team stay aligned with security and privacy standards. On this page, you can view and manage the list of training requirements linked to your active compliance frameworks. Each training includes clear step-by-step instructions and links to the necessary learning materials. You can assign trainings to employees and track their completion to ensure your organization stays audit ready.
          </p>
        </div>

        {/* Training Overview Dashboard Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="flex-1">
              <h2 className="text-lg font-black text-slate-900">Training Overview</h2>
              <p className="text-xs text-slate-400 font-semibold mt-1">
                Track compliance training coverage across all active frameworks.
              </p>
            </div>
            <div className="rounded-lg bg-amber-50 px-3 py-1.5 text-right dark:bg-amber-950/30">
              <p className="text-[10px] font-black uppercase tracking-wider text-amber-700">COMPLIANCE SCORE</p>
              <p className="text-sm font-black text-amber-700">{scorePercent}% Needs attention</p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {/* Total Trainings */}
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">TOTAL TRAININGS</p>
              <p className="mt-2 text-3xl font-black text-slate-900">
                {fullyCompletedTrainings} / {totalTrainings}
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                {Math.round((fullyCompletedTrainings / totalTrainings) * 100)}% of applicable trainings
              </p>
              <div className="h-1.5 w-full bg-slate-200 rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${(fullyCompletedTrainings / totalTrainings) * 100}%` }}
                />
              </div>
            </div>

            {/* Completion Coverage */}
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">COMPLETION COVERAGE</p>
              <p className="mt-2 text-3xl font-black text-slate-900">
                {coveragePercent}%
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                {totalCompletedCompletions} of {totalRequiredCompletions} required completions
              </p>
              <div className="h-1.5 w-full bg-slate-200 rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${coveragePercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Frameworks row */}
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
                  <p className="text-xs font-semibold text-slate-500">
                    {cyberCompleted === totalEmployees ? "1 of 1 applicable fully completed" : "0 of 1 applicable fully completed"}
                  </p>
                </div>
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${
                  cyberCompleted === totalEmployees ? "bg-blue-50 text-blue-700" : "bg-rose-50 text-rose-700"
                }`}>
                  {cyberCompleted === totalEmployees ? "100%" : `${cyberPercent}%`}
                </span>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-semibold">Trainings Completed</span>
                  <span className="font-black text-blue-600">
                    {cyberCompleted === totalEmployees ? "100%" : "0%"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-semibold">Employees Completed</span>
                  <span className="font-black text-blue-600">{cyberPercent}%</span>
                </div>
              </div>
            </div>

            {/* HIPAA card */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-black text-slate-900">HIPAA</h3>
                  <p className="text-xs font-semibold text-slate-500">
                    {hipaaCompleted === totalEmployees ? "1 of 1 applicable fully completed" : "0 of 1 applicable fully completed"}
                  </p>
                </div>
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${
                  hipaaCompleted === totalEmployees ? "bg-blue-50 text-blue-700" : "bg-rose-50 text-rose-700"
                }`}>
                  {hipaaCompleted === totalEmployees ? "100%" : `${hipaaPercent}%`}
                </span>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-semibold">Trainings Completed</span>
                  <span className="font-black text-slate-400">
                    {hipaaCompleted === totalEmployees ? "100%" : "0%"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-semibold">Employees Completed</span>
                  <span className="font-black text-blue-600">{hipaaPercent}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trainings list */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-950">
            {[
              {
                id: "hipaa-compliance",
                title: "HIPAA Compliance & Security Awareness Training",
                framework: "HIPAA",
                frameworkBadge: "bg-purple-50 text-purple-700",
                completedCount: hipaaCompleted,
                totalCount: totalEmployees,
                description: "Security and privacy rules required for handling protected health information (PHI) under HIPAA.",
                link: "https://compliance.rette.ai/training/hipaa-awareness",
              },
              {
                id: "cybersecurity-awareness",
                title: "Cybersecurity Awareness Training",
                framework: "SOC 2",
                frameworkBadge: "bg-blue-50 text-blue-700",
                completedCount: cyberCompleted,
                totalCount: totalEmployees,
                description: "Core cybersecurity practices including phishing protection, password hygiene, and device safety.",
                link: "https://compliance.rette.ai/training/security-awareness",
              },
            ].map((training) => {
              const isExpanded = expandedTrainingId === training.id;
              const isAllCompleted = training.completedCount === training.totalCount;

              return (
                <div key={training.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                  <div
                    onClick={() => setExpandedTrainingId(isExpanded ? null : training.id)}
                    className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50/50 transition"
                  >
                    <div className="space-y-1">
                      <h3 className="font-black text-slate-900 dark:text-white">{training.title}</h3>
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex rounded px-2 py-0.5 text-[10px] font-black uppercase ${training.frameworkBadge}`}>
                          {training.framework}
                        </span>
                        <span className={`text-xs font-bold ${isAllCompleted ? "text-emerald-600" : "text-slate-400"}`}>
                          {isAllCompleted ? "ALL COMPLETED" : `${training.completedCount}/${training.totalCount} COMPLETED`}
                        </span>
                      </div>
                    </div>
                    <div>
                      {isExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="bg-slate-50/50 p-5 border-t border-slate-100 dark:bg-slate-900/10 dark:border-slate-800 space-y-4">
                      <div>
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Description</h4>
                        <p className="text-sm text-slate-600 mt-1 leading-6">{training.description}</p>
                      </div>

                      <div>
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Learning Materials</h4>
                        <a
                          href={training.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-black text-blue-600 hover:underline"
                        >
                          Go to training course modules &gt;
                        </a>
                      </div>

                      <div>
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Employee Completions</h4>
                        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                          {employees.map((emp) => {
                            const isEmpCompleted = completions[training.id]?.includes(emp.id);
                            return (
                              <label
                                key={emp.id}
                                className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition select-none dark:border-slate-800 dark:bg-slate-950"
                              >
                                <input
                                  type="checkbox"
                                  checked={isEmpCompleted}
                                  onChange={() => handleToggleCompletion(training.id, emp.id)}
                                  className="h-4 w-4 rounded border-slate-350 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                                <span className="text-xs font-semibold text-slate-800 dark:text-slate-250">
                                  {emp.name}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
