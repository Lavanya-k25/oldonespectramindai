import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Info, Plus, Trash2 } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useUser } from "../auth/UserContext";
import { readScopedJson } from "../auth/session";
import { isApiEnabled } from "../api/client";
import { assignTraining, completeTraining, createTrainingCourse, deleteTrainingCourse, listEmployees, resetTrainingCompletion, synchronizeTraining, updateTrainingCourse } from "../api/people";
import AppShell from "../components/layout/AppShell";
import {
  canManageTraining,
  getEmployeeTrainingCompliance,
  getTrainingMetrics,
  loadTrainingAssignments,
  loadTrainingCompletions,
  loadTrainingLibrary,
  saveTrainingAssignments,
  saveTrainingCompletions,
  saveTrainingLibrary,
} from "../training/TrainingService";

export default function Training() {
  const location = useLocation();
  const targetItemId = new URLSearchParams(location.search).get("item");
  const { user } = useUser();
  const canManage = canManageTraining(user);
  const [employees, setEmployees] = useState(() => readScopedJson("spectramind:employees", []));
  const [library, setLibrary] = useState(() => loadTrainingLibrary());
  const [assignments, setAssignments] = useState(() => loadTrainingAssignments(readScopedJson("spectramind:employees", []), loadTrainingLibrary()));
  const [completions, setCompletions] = useState(() => loadTrainingCompletions());
  const [expandedTrainingId, setExpandedTrainingId] = useState(null);
  const [customName, setCustomName] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [customFramework, setCustomFramework] = useState("SOC 2");
  const [assignmentIds, setAssignmentIds] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(isApiEnabled);

  useEffect(() => {
    const refresh = () => {
      const nextEmployees = readScopedJson("spectramind:employees", []);
      const nextLibrary = loadTrainingLibrary();
      setEmployees(nextEmployees);
      setLibrary(nextLibrary);
      setAssignments(loadTrainingAssignments(nextEmployees, nextLibrary));
      setCompletions(loadTrainingCompletions());
    };

    window.addEventListener("storage", refresh);
    window.addEventListener("spectramind:training-updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("spectramind:training-updated", refresh);
    };
  }, []);

  useEffect(() => {
    if (!isApiEnabled) return;
    let cancelled = false;
    Promise.all([listEmployees(), synchronizeTraining()])
      .then(([employeeRecords, courses]) => {
        if (cancelled) return;
        const mappedEmployees = employeeRecords.map((employee) => ({ ...employee, role: employee.jobRole || "User", type: employee.employmentType || "Full-Time" }));
        const mappedLibrary = courses.map(fromApiCourse);
        const nextAssignments = Object.fromEntries(courses.map((course) => [course.id, course.assignments.map((assignment) => assignment.employeeId)]));
        const nextCompletions = Object.fromEntries(courses.map((course) => [course.id, Object.fromEntries(course.assignments.filter((assignment) => assignment.status === "COMPLETED").map((assignment) => [assignment.employeeId, { completedAt: assignment.completedAt }]))]));
        const nextIds = Object.fromEntries(courses.flatMap((course) => course.assignments.map((assignment) => [`${course.id}:${assignment.employeeId}`, assignment.id])));
        setEmployees(mappedEmployees); setLibrary(mappedLibrary); setAssignments(nextAssignments); setCompletions(nextCompletions); setAssignmentIds(nextIds);
      })
      .catch((error) => { if (!cancelled) setApiError(error.message || "Could not load training"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (targetItemId && library.some((training) => training.id === targetItemId)) {
      setExpandedTrainingId(targetItemId);
    }
  }, [library, targetItemId]);

  const visibleLibrary = useMemo(() => {
    if (canManage) return library;
    const employee = findCurrentEmployee(employees, user);
    if (!employee) return [];
    return library.filter((training) => (assignments[training.id] || []).includes(employee.id));
  }, [assignments, canManage, employees, library, user]);

  const metricsByTraining = useMemo(
    () => Object.fromEntries(library.map((training) => [training.id, getTrainingMetrics(training, employees, assignments, completions)])),
    [assignments, completions, employees, library]
  );

  const totalTrainings = visibleLibrary.length;
  const completedTrainings = visibleLibrary.filter((training) => metricsByTraining[training.id]?.status === "Completed").length;
  const totalRequiredCompletions = visibleLibrary.reduce((sum, training) => sum + (metricsByTraining[training.id]?.totalAssigned || 0), 0);
  const totalCompletedCompletions = visibleLibrary.reduce((sum, training) => sum + (metricsByTraining[training.id]?.completed || 0), 0);
  const coveragePercent = totalRequiredCompletions ? Math.round((totalCompletedCompletions / totalRequiredCompletions) * 100) : 0;

  const frameworkCards = ["SOC 2", "ISO 27001", "HIPAA"].map((framework) => {
    const trainings = visibleLibrary.filter((training) => training.relatedFrameworks.includes(framework));
    const completed = trainings.filter((training) => metricsByTraining[training.id]?.status === "Completed").length;
    const assigned = trainings.reduce((sum, training) => sum + (metricsByTraining[training.id]?.totalAssigned || 0), 0);
    const done = trainings.reduce((sum, training) => sum + (metricsByTraining[training.id]?.completed || 0), 0);
    const percent = assigned ? Math.round((done / assigned) * 100) : 0;
    return { framework, trainings, completed, percent };
  });

  const persistAssignments = (nextAssignments) => {
    setAssignments(nextAssignments);
    if (!isApiEnabled) {
      saveTrainingAssignments(nextAssignments);
      saveTrainingCompletions(completions, employees, library, nextAssignments);
    }
  };

  const persistCompletions = (nextCompletions) => {
    setCompletions(nextCompletions);
    if (!isApiEnabled) saveTrainingCompletions(nextCompletions, employees, library, assignments);
  };

  const toggleCompletion = async (trainingId, employeeId) => {
    const current = completions[trainingId] || {};
    if (isApiEnabled) {
      const assignmentId = assignmentIds[`${trainingId}:${employeeId}`];
      if (!assignmentId) return;
      try {
        if (current[employeeId]) await resetTrainingCompletion(assignmentId);
        else await completeTraining(assignmentId);
      } catch (error) { setApiError(error.message || "Could not update completion"); return; }
    }
    const nextTrainingCompletions = current[employeeId]
      ? Object.fromEntries(Object.entries(current).filter(([id]) => id !== String(employeeId)))
      : { ...current, [employeeId]: { completedAt: new Date().toISOString(), completedBy: user?.userId } };
    persistCompletions({ ...completions, [trainingId]: nextTrainingCompletions });
  };

  const toggleAssignment = async (trainingId, employeeId) => {
    if (!canManage) return;
    const current = assignments[trainingId] || [];
    const nextTrainingAssignments = current.includes(employeeId)
      ? current.filter((id) => id !== employeeId)
      : [...current, employeeId];
    if (isApiEnabled) {
      try {
        await assignTraining(trainingId, nextTrainingAssignments);
        const courses = await synchronizeTraining();
        const course = courses.find((item) => item.id === trainingId);
        setAssignmentIds((ids) => ({ ...ids, ...Object.fromEntries((course?.assignments || []).map((assignment) => [`${trainingId}:${assignment.employeeId}`, assignment.id])) }));
      } catch (error) { setApiError(error.message || "Could not update assignment"); return; }
    }
    persistAssignments({ ...assignments, [trainingId]: nextTrainingAssignments });
  };

  const updateDueDate = async (trainingId, dueDate) => {
    if (!canManage) return;
    const nextLibrary = library.map((training) => (training.id === trainingId ? { ...training, dueDate } : training));
    if (isApiEnabled) await updateTrainingCourse(trainingId, { dueDate: dueDate ? new Date(`${dueDate}T00:00:00Z`).toISOString() : null }).catch((error) => setApiError(error.message));
    setLibrary(nextLibrary);
    if (!isApiEnabled) {
      saveTrainingLibrary(nextLibrary);
      saveTrainingCompletions(completions, employees, nextLibrary, assignments);
    }
  };

  const updateTrainingDetails = async (trainingId, updates) => {
    if (!canManage) return;
    const nextLibrary = library.map((training) => (training.id === trainingId ? { ...training, ...updates } : training));
    if (isApiEnabled) await updateTrainingCourse(trainingId, updates).catch((error) => setApiError(error.message));
    setLibrary(nextLibrary);
    if (!isApiEnabled) {
      saveTrainingLibrary(nextLibrary);
      saveTrainingCompletions(completions, employees, nextLibrary, assignments);
    }
  };

  const addCustomTraining = async () => {
    if (!canManage || !customName.trim()) return;
    const apiCourse = isApiEnabled ? await createTrainingCourse({ name: customName.trim(), description: customDescription.trim() || "Custom training requirement.", relatedFrameworks: [customFramework] }).catch((error) => { setApiError(error.message); return null; }) : null;
    if (isApiEnabled && !apiCourse) return;
    const id = apiCourse?.id || `custom-${Date.now()}`;
    const nextLibrary = [
      ...library,
      {
        id,
        name: customName.trim(),
        description: customDescription.trim() || "Custom training requirement.",
        relatedFrameworks: [customFramework],
        dueDate: "",
        custom: true,
      },
    ];
    const nextAssignments = { ...assignments, [id]: [] };
    setCustomName("");
    setCustomDescription("");
    setLibrary(nextLibrary);
    setAssignments(nextAssignments);
    if (!isApiEnabled) {
      saveTrainingLibrary(nextLibrary);
      saveTrainingAssignments(nextAssignments);
    }
  };

  const deleteTraining = async (trainingId) => {
    if (!canManage) return;
    if (isApiEnabled) { try { await deleteTrainingCourse(trainingId); } catch (error) { setApiError(error.message); return; } }
    const nextLibrary = library.filter((training) => training.id !== trainingId);
    const nextAssignments = Object.fromEntries(Object.entries(assignments).filter(([id]) => id !== trainingId));
    const nextCompletions = Object.fromEntries(Object.entries(completions).filter(([id]) => id !== trainingId));
    setLibrary(nextLibrary);
    setAssignments(nextAssignments);
    setCompletions(nextCompletions);
    if (!isApiEnabled) {
      saveTrainingLibrary(nextLibrary);
      saveTrainingAssignments(nextAssignments);
      saveTrainingCompletions(nextCompletions, employees, nextLibrary, nextAssignments);
    }
  };

  const currentEmployee = findCurrentEmployee(employees, user);

  return (
    <AppShell>
      <div className="space-y-6">
        {apiError && <p role="alert" className="rounded-lg bg-rose-50 px-4 py-3 font-semibold text-rose-700">{apiError}</p>}
        {loading && <p className="rounded-lg border border-slate-200 bg-white p-4 text-slate-500">Loading training...</p>}
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900">Training</h1>
          <p className="max-w-4xl text-sm leading-6 text-slate-500">
            Trainings help your team stay aligned with security and privacy standards. On this page, you can view and manage the list of training requirements linked to your active compliance frameworks. Each training includes clear step-by-step instructions and links to the necessary learning materials. You can assign trainings to employees and track their completion to ensure your organization stays audit ready.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex flex-col gap-6 border-b border-slate-100 pb-4 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <h2 className="text-lg font-black text-slate-900">Training Overview</h2>
              <p className="mt-1 text-xs font-semibold text-slate-400">
                Track compliance training coverage across all active frameworks.
              </p>
            </div>
            <div className="rounded-lg bg-amber-50 px-3 py-1.5 text-right dark:bg-amber-950/30">
              <p className="text-[10px] font-black uppercase tracking-wider text-amber-700">COMPLIANCE SCORE</p>
              <p className="text-sm font-black text-amber-700">{coveragePercent}% Needs attention</p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <MetricCard
              label="TOTAL TRAININGS"
              value={`${completedTrainings} / ${totalTrainings}`}
              caption={`${totalTrainings ? Math.round((completedTrainings / totalTrainings) * 100) : 0}% of applicable trainings`}
              percent={totalTrainings ? Math.round((completedTrainings / totalTrainings) * 100) : 0}
            />
            <MetricCard
              label="COMPLETION COVERAGE"
              value={`${coveragePercent}%`}
              caption={`${totalCompletedCompletions} of ${totalRequiredCompletions} required completions`}
              percent={coveragePercent}
            />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-black text-slate-900">
            Frameworks
            <button className="text-slate-400 hover:text-slate-600">
              <Info size={16} />
            </button>
          </h2>

          <div className="grid gap-4 sm:grid-cols-3">
            {frameworkCards.map((card) => (
              <div key={card.framework} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-black text-slate-900">{card.framework}</h3>
                    <p className="text-xs font-semibold text-slate-500">
                      {card.completed} of {card.trainings.length} applicable fully completed
                    </p>
                  </div>
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${
                    card.percent === 100 ? "bg-blue-50 text-blue-700" : "bg-rose-50 text-rose-700"
                  }`}>
                    {card.percent}%
                  </span>
                </div>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-600">Trainings Completed</span>
                    <span className="font-black text-blue-600">{card.percent}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-600">Assigned Trainings</span>
                    <span className="font-black text-blue-600">{card.trainings.length}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {canManage ? (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <h2 className="text-lg font-black text-slate-900">Create Custom Training</h2>
            <div className="mt-3 grid gap-2 md:grid-cols-[1fr_1fr_160px_auto]">
              <input value={customName} onChange={(event) => setCustomName(event.target.value)} placeholder="Training name" className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold outline-none" />
              <input value={customDescription} onChange={(event) => setCustomDescription(event.target.value)} placeholder="Description" className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold outline-none" />
              <select value={customFramework} onChange={(event) => setCustomFramework(event.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold outline-none">
                <option>SOC 2</option>
                <option>ISO 27001</option>
                <option>HIPAA</option>
              </select>
              <button type="button" onClick={addCustomTraining} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-black text-white">
                <Plus size={16} />
                Create
              </button>
            </div>
          </div>
        ) : null}

        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            {visibleLibrary.map((training) => {
              const isExpanded = expandedTrainingId === training.id;
              const metrics = metricsByTraining[training.id] || getTrainingMetrics(training, employees, assignments, completions);
              const assignedEmployees = canManage ? employees : employees.filter((employee) => employee.id === currentEmployee?.id);
              const canCompleteFor = (employee) => canManage || employee.id === currentEmployee?.id;

              return (
                <div key={training.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                  <div
                    onClick={() => setExpandedTrainingId(isExpanded ? null : training.id)}
                    className="flex cursor-pointer items-center justify-between p-5 transition hover:bg-slate-50/50"
                  >
                    <div className="space-y-1">
                      <h3 className="font-black text-slate-900 dark:text-white">{training.name}</h3>
                      <div className="flex flex-wrap items-center gap-3">
                        {training.relatedFrameworks.map((framework) => (
                          <span key={framework} className={`inline-flex rounded px-2 py-0.5 text-[10px] font-black uppercase ${frameworkBadge(framework)}`}>
                            {framework}
                          </span>
                        ))}
                        <span className={`text-xs font-bold ${metrics.status === "Completed" ? "text-emerald-600" : "text-slate-400"}`}>
                          {metrics.completed}/{metrics.totalAssigned} COMPLETED
                        </span>
                        <span className="text-xs font-bold text-slate-400">
                          {metrics.status}
                        </span>
                      </div>
                    </div>
                    <div>{isExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}</div>
                  </div>

                  {isExpanded && (
                    <div className="space-y-4 border-t border-slate-100 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/10">
                      {canManage ? (
                        <div className="grid gap-2">
                          <label className="text-xs font-black uppercase tracking-wider text-slate-400">
                            Name
                            <input
                              value={training.name}
                              onChange={(event) => updateTrainingDetails(training.id, { name: event.target.value })}
                              className="mt-2 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-800 outline-none"
                            />
                          </label>
                          <label className="text-xs font-black uppercase tracking-wider text-slate-400">
                            Description
                            <textarea
                              value={training.description}
                              onChange={(event) => updateTrainingDetails(training.id, { description: event.target.value })}
                              className="mt-2 block min-h-20 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 outline-none"
                            />
                          </label>
                        </div>
                      ) : (
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Description</h4>
                          <p className="mt-1 text-sm leading-6 text-slate-600">{training.description}</p>
                        </div>
                      )}

                      <div className="grid gap-3 text-xs font-bold text-slate-500 sm:grid-cols-4">
                        <TrainingStat label="Total Assigned" value={metrics.totalAssigned} />
                        <TrainingStat label="Completed" value={metrics.completed} />
                        <TrainingStat label="Pending" value={metrics.pending} />
                        <TrainingStat label="Completion" value={`${metrics.percentage}%`} />
                      </div>

                      {canManage ? (
                        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                          <label className="text-xs font-black uppercase tracking-wider text-slate-400">
                            Due Date
                            <input
                              type="date"
                              value={training.dueDate || ""}
                              onChange={(event) => updateDueDate(training.id, event.target.value)}
                              className="mt-2 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 outline-none"
                            />
                          </label>
                          <button type="button" onClick={() => deleteTraining(training.id)} className="inline-flex items-end gap-2 rounded-lg border border-rose-200 px-3 py-2 text-xs font-black text-rose-600">
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      ) : training.dueDate ? (
                        <p className="text-xs font-bold text-slate-500">Due Date: {training.dueDate}</p>
                      ) : null}

                      <div>
                        <h4 className="mb-2 text-xs font-black uppercase tracking-wider text-slate-400">
                          {canManage ? "Employee Assignments & Completions" : "My Training"}
                        </h4>
                        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                          {assignedEmployees.map((employee) => {
                            const isAssigned = (assignments[training.id] || []).includes(employee.id);
                            const isCompleted = Boolean(completions[training.id]?.[employee.id]);
                            return (
                              <label
                                key={employee.id}
                                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-250"
                              >
                                {canManage ? (
                                  <input
                                    type="checkbox"
                                    checked={isAssigned}
                                    onChange={() => toggleAssignment(training.id, employee.id)}
                                    className="h-4 w-4 rounded border-slate-350 text-blue-600 focus:ring-blue-500"
                                  />
                                ) : null}
                                <input
                                  type="checkbox"
                                  checked={isCompleted}
                                  disabled={!isAssigned || !canCompleteFor(employee)}
                                  onChange={() => toggleCompletion(training.id, employee.id)}
                                  className="h-4 w-4 rounded border-slate-350 text-emerald-600 focus:ring-emerald-500 disabled:opacity-40"
                                />
                                <span className="min-w-0 truncate">{employee.name}</span>
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

            {!visibleLibrary.length && (
              <div className="p-8 text-center text-sm font-bold text-slate-500">
                No assigned trainings found.
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function fromApiCourse(course) {
  return { ...course, dueDate: course.dueDate ? new Date(course.dueDate).toISOString().slice(0, 10) : "", relatedFrameworks: course.relatedFrameworks || [] };
}

function MetricCard({ label, value, caption, percent }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
      <p className="mt-1 text-xs font-semibold text-slate-500">{caption}</p>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-blue-600 transition-all duration-300" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function TrainingStat({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-white px-3 py-2">
      <p className="text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-black text-slate-900">{value}</p>
    </div>
  );
}

function frameworkBadge(framework) {
  if (framework === "HIPAA") return "bg-purple-50 text-purple-700";
  if (framework === "ISO 27001") return "bg-emerald-50 text-emerald-700";
  return "bg-blue-50 text-blue-700";
}

function findCurrentEmployee(employees, user) {
  return employees.find((employee) => employee.email?.toLowerCase() === user?.email?.toLowerCase()) ||
    employees.find((employee) => employee.name === user?.name) ||
    employees.find((employee) => String(employee.id) === String(user?.userId));
}
