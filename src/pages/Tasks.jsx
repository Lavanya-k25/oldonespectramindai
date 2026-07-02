import { CheckSquare } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ComplianceModulePage from "../components/compliance/ComplianceModulePage";
import { getFrameworkLibrary } from "../data/frameworkLibraries";
import { loadOrganizationWorkspace } from "../data/organizationWorkspace";
import { loadQuestionnaireResponses } from "../data/questionnaireEngine";
import { generateImplementationTasks } from "../data/taskEngine";

const soc2Library = getFrameworkLibrary("soc-2");

export default function Tasks() {
  const [workspaceData, setWorkspaceData] = useState(() => loadOrganizationWorkspace());
  const [questionnaireResponses, setQuestionnaireResponses] = useState(() => loadQuestionnaireResponses());

  useEffect(() => {
    const refreshWorkspaceData = () => setWorkspaceData(loadOrganizationWorkspace());
    const refreshQuestionnaireResponses = () => setQuestionnaireResponses(loadQuestionnaireResponses());

    window.addEventListener("spectramind:workspace-updated", refreshWorkspaceData);
    window.addEventListener("spectramind:questionnaire-updated", refreshQuestionnaireResponses);
    window.addEventListener("storage", refreshWorkspaceData);

    return () => {
      window.removeEventListener("spectramind:workspace-updated", refreshWorkspaceData);
      window.removeEventListener("spectramind:questionnaire-updated", refreshQuestionnaireResponses);
      window.removeEventListener("storage", refreshWorkspaceData);
    };
  }, []);

  const tasks = useMemo(
    () => generateImplementationTasks(soc2Library, workspaceData, questionnaireResponses),
    [questionnaireResponses, workspaceData]
  );
  const evidenceTasks = tasks.filter((task) => task.id.includes("upload-evidence")).length;
  const ownerTasks = tasks.filter((task) => task.id.includes("assign-owner")).length;

  return (
    <ComplianceModulePage
      eyebrow="Compliance"
      title="Tasks"
      description="Automatically generated implementation tasks from SOC 2 workspace progress."
      icon={CheckSquare}
      actionLabel="Refresh Tasks"
      metrics={[
        ["Open", String(tasks.length)],
        ["Evidence", String(evidenceTasks)],
        ["Ownership", String(ownerTasks)],
      ]}
      items={tasks.map((task) => ({
        title: task.title,
        description: `${task.itemId} · ${task.description}`,
        owner: task.owner,
        status: task.status,
      }))}
      emptyMessage="No generated implementation tasks."
    />
  );
}
