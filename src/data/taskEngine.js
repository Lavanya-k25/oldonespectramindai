import { isRelevantToQuestionnaire } from "./questionnaireEngine";

const completedStatuses = ["ready", "approved", "completed", "complete", "implemented"];

export function generateImplementationTasks(frameworkLibrary, workspaceData, questionnaireResponses = {}) {
  const tasks = [
    ...frameworkLibrary.risks.flatMap((risk) => generateItemTasks("Risk", risk, workspaceData, questionnaireResponses)),
    ...frameworkLibrary.controls.flatMap((control) => generateItemTasks("Control", control, workspaceData, questionnaireResponses)),
    ...frameworkLibrary.tests.flatMap((test) => generateItemTasks("Test", test, workspaceData, questionnaireResponses)),
    ...frameworkLibrary.policies.flatMap((policy) => generateItemTasks("Policy", policy, workspaceData, questionnaireResponses)),
  ];

  return Array.from(new Map(tasks.map((task) => [task.id, task])).values())
    .sort((a, b) => Number(b.priority) - Number(a.priority));
}

function generateItemTasks(type, item, workspaceData, questionnaireResponses) {
  const state = workspaceData[item.id] || {};
  const status = String(state.status || "").toLowerCase();
  const tasks = [];

  if (!state.assignments?.owner) {
    tasks.push(taskFor(item, type, "assign-owner", "Assign Owner", `Assign an owner for ${item.title}.`, questionnaireResponses));
  }

  if (requiresEvidence(type) && !hasEvidence(item, state)) {
    tasks.push(taskFor(item, type, "upload-evidence", "Upload Evidence", `Upload required evidence for ${item.title}.`, questionnaireResponses));
  }

  if (type === "Policy" && status !== "approved") {
    tasks.push(taskFor(item, type, "review-policy", "Review Policy", `Review and approve ${item.title}.`, questionnaireResponses));
  }

  if (type === "Control" && !completedStatuses.includes(status)) {
    tasks.push(taskFor(item, type, "complete-control", "Complete Control", `Complete implementation for ${item.title}.`, questionnaireResponses));
  }

  return tasks;
}

function taskFor(item, type, action, title, description, questionnaireResponses) {
  const prioritized = isRelevantToQuestionnaire(item, questionnaireResponses);

  return {
    id: `${item.id}:${action}`,
    title,
    description,
    owner: "Unassigned",
    status: prioritized ? "Prioritized" : "Open",
    priority: prioritized ? 1 : 0,
    itemId: item.id,
    itemType: type,
  };
}

function requiresEvidence(type) {
  return ["Test", "Control", "Policy"].includes(type);
}

function hasEvidence(item, state) {
  if (state.evidenceFiles?.length) return true;

  const requirements = item.requiredEvidence || [];
  if (!requirements.length) return false;

  return requirements.every((requirement) => state.evidenceByRequirement?.[requirement]?.length);
}
