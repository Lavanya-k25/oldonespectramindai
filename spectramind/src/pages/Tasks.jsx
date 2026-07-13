import { CheckSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { readScopedJson } from "../auth/session";
import ComplianceModulePage from "../components/compliance/ComplianceModulePage";
import { useComplianceState } from "../compliance/ComplianceStateContext";
import ActiveFrameworkRequired from "../framework/ActiveFrameworkRequired";
import { useFrameworkWorkspace } from "../framework/FrameworkWorkspaceContext";
import { TASK_STATUSES } from "../tasks/TaskService";
import { isApiEnabled } from "../api/client";
import { listEmployees } from "../api/people";
import { synchronizeTasks, updateApiTask } from "../api/workflows";
import { resolveFrameworkId } from "../core/engines/framework-engine/frameworkRegistry";

export default function Tasks() {
  const { activeFramework } = useFrameworkWorkspace();

  if (!activeFramework) {
    return <ActiveFrameworkRequired />;
  }

  return <TasksContent key={activeFramework.id} activeFramework={activeFramework} />;
}

function TasksContent({ activeFramework }) {
  const { tasks, actions } = useComplianceState();
  const [apiTasks, setApiTasks] = useState([]);
  const [apiEmployees, setApiEmployees] = useState([]);
  const [loading, setLoading] = useState(isApiEnabled);
  const [error, setError] = useState("");
  const employees = isApiEnabled ? apiEmployees : readScopedJson("spectramind:employees", []);
  const visibleTasks = isApiEnabled ? apiTasks : tasks;
  useEffect(() => {
    if (!isApiEnabled) return;
    let cancelled = false;
    const frameworkId = resolveFrameworkId(activeFramework.id) || activeFramework.id;
    Promise.all([synchronizeTasks(frameworkId), listEmployees()])
      .then(([taskRecords, employeeRecords]) => {
        if (!cancelled) { setApiTasks(taskRecords.map(fromApiTask)); setApiEmployees(employeeRecords); }
      })
      .catch((requestError) => { if (!cancelled) setError(requestError.message || "Could not load tasks"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [activeFramework]);
  const owners = ["Unassigned", ...employees.map((employee) => employee.name).filter(Boolean)];
  const evidenceTasks = visibleTasks.filter((task) => task.category === "Evidence").length;
  const riskTasks = visibleTasks.filter((task) => task.category === "Risk").length;
  const auditTasks = visibleTasks.filter((task) => task.category === "Audit").length;
  const openTasks = visibleTasks.filter((task) => task.status !== "Completed").length;

  const updateOwner = async (task, owner) => {
    if (!isApiEnabled) return actions.updateTask(task.id, { owner });
    try { const updated = await updateApiTask(task.id, task.apiVersion, { ownerName: owner }); replaceTask(updated); }
    catch (requestError) { setError(requestError.message || "Could not update task owner"); }
  };

  const updateStatus = async (task, status) => {
    if (isApiEnabled) {
      try { const updated = await updateApiTask(task.id, task.apiVersion, { status: statusToApi(status) }); replaceTask(updated); }
      catch (requestError) { setError(requestError.message || "Could not update task status"); }
      return;
    }
    if (status === "Completed") {
      actions.completeTask(task);
      return;
    }
    actions.updateTask(task.id, { status });
  };
  const replaceTask = (updated) => setApiTasks((current) => current.map((task) => task.id === updated.id ? fromApiTask(updated) : task));

  return (
    <ComplianceModulePage
      eyebrow="Compliance"
      title="Tasks"
      description={error || (loading ? "Loading tasks from the compliance API..." : `Automatically generated implementation tasks from ${activeFramework.name} workspace progress.`)}
      icon={CheckSquare}
      actionLabel="Refresh Tasks"
      metrics={[
        ["Open", String(openTasks)],
        ["Evidence", String(evidenceTasks)],
        ["Risks", String(riskTasks)],
        ["Audit", String(auditTasks)],
      ]}
      items={visibleTasks.map((task) => ({
        ...task,
        title: task.title,
        description: `${task.itemId} · ${task.description}`,
        owner: task.owner,
        status: task.status,
      }))}
      renderItemActions={(task) => (
        <div className="flex flex-col gap-2">
          <select
            value={task.owner}
            onChange={(event) => updateOwner(task, event.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-700"
          >
            {owners.map((owner) => (
              <option key={owner} value={owner}>{owner}</option>
            ))}
          </select>
          <select
            value={task.status}
            onChange={(event) => updateStatus(task, event.target.value)}
            className="rounded-lg border border-slate-200 bg-blue-50 px-2 py-1 text-xs font-bold text-blue-800"
          >
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => updateStatus(task, "Completed")}
            className="rounded-lg bg-slate-900 px-2 py-1 text-xs font-black text-white transition hover:bg-slate-800"
          >
            Complete
          </button>
        </div>
      )}
      emptyMessage={loading ? "Loading tasks..." : error || "No generated implementation tasks."}
    />
  );
}

function fromApiTask(task) {
  return { ...task, apiVersion: task.version, status: { OPEN: "Open", IN_PROGRESS: "In Progress", COMPLETED: "Completed" }[task.status] || task.status, owner: task.ownerName || "Unassigned", itemId: task.itemId || task.sourceTemplateId || task.id, description: task.description || "" };
}
function statusToApi(status) { return { Open: "OPEN", "In Progress": "IN_PROGRESS", Completed: "COMPLETED" }[status] || status; }
