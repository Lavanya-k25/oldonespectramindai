import { CheckSquare } from "lucide-react";
import { readScopedJson } from "../auth/session";
import ComplianceModulePage from "../components/compliance/ComplianceModulePage";
import { useComplianceState } from "../compliance/ComplianceStateContext";
import ActiveFrameworkRequired from "../framework/ActiveFrameworkRequired";
import { useFrameworkWorkspace } from "../framework/FrameworkWorkspaceContext";
import { TASK_STATUSES } from "../tasks/TaskService";

export default function Tasks() {
  const { activeFramework } = useFrameworkWorkspace();

  if (!activeFramework) {
    return <ActiveFrameworkRequired />;
  }

  return <TasksContent key={activeFramework.id} activeFramework={activeFramework} />;
}

function TasksContent({ activeFramework }) {
  const { tasks, actions } = useComplianceState();
  const employees = readScopedJson("spectramind:employees", []);
  const owners = ["Unassigned", ...employees.map((employee) => employee.name).filter(Boolean)];
  const evidenceTasks = tasks.filter((task) => task.category === "Evidence").length;
  const riskTasks = tasks.filter((task) => task.category === "Risk").length;
  const auditTasks = tasks.filter((task) => task.category === "Audit").length;
  const openTasks = tasks.filter((task) => task.status !== "Completed").length;

  const updateOwner = (task, owner) => {
    actions.updateTask(task.id, { owner });
  };

  const updateStatus = (task, status) => {
    if (status === "Completed") {
      actions.completeTask(task);
      return;
    }
    actions.updateTask(task.id, { status });
  };

  return (
    <ComplianceModulePage
      eyebrow="Compliance"
      title="Tasks"
      description={`Automatically generated implementation tasks from ${activeFramework.name} workspace progress.`}
      icon={CheckSquare}
      actionLabel="Refresh Tasks"
      metrics={[
        ["Open", String(openTasks)],
        ["Evidence", String(evidenceTasks)],
        ["Risks", String(riskTasks)],
        ["Audit", String(auditTasks)],
      ]}
      items={tasks.map((task) => ({
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
            onClick={() => actions.completeTask(task)}
            className="rounded-lg bg-slate-900 px-2 py-1 text-xs font-black text-white transition hover:bg-slate-800"
          >
            Complete
          </button>
        </div>
      )}
      emptyMessage="No generated implementation tasks."
    />
  );
}
