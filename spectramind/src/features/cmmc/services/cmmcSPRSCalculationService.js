const COMPLETED_STATUS = "Completed";
const IN_PROGRESS_STATUS = "In Progress";
const NOT_STARTED_STATUS = "Not Started";

export function calculateCMMCSPRSMetrics(workflowState = {}, frameworkLibrary = {}) {
  const controls = buildControlMetrics(frameworkLibrary, workflowState?.controls?.fields);
  const totals = controls.reduce(
    (summary, control) => {
      summary.totalControls += 1;
      if (control.status === COMPLETED_STATUS) summary.completedControls += 1;
      if (control.status === IN_PROGRESS_STATUS) summary.inProgressControls += 1;
      if (control.status === NOT_STARTED_STATUS) summary.notStartedControls += 1;
      return summary;
    },
    {
      totalControls: 0,
      completedControls: 0,
      inProgressControls: 0,
      notStartedControls: 0,
    }
  );

  const completionByControlFamily = buildCompletionByControlFamily(controls);

  return {
    frameworkId: workflowState?.frameworkId || "",
    ...totals,
    completionPercentage: calculateCompletionPercentage(totals.completedControls, totals.totalControls),
    completionByControlFamily,
    controls,
  };
}

function buildControlMetrics(frameworkLibrary = {}, controlWorkflowFields = {}) {
  return uniqueControls(frameworkLibrary.controls || []).map((control) => {
    const controlId = control.controlId || control["Control ID"] || control.id || "";
    const controlFamily = control.controlFamily || control["Control Family"] || "";
    const family = parseControlFamily(controlFamily, controlId);
    const frameworkStatus = control.evidenceStatus || control["Evidence Status"] || "";
    const workflowStatus = controlWorkflowFields?.[controlId]?.status;

    return {
      controlId,
      controlFamily,
      familyCode: family.code,
      familyName: family.name,
      status: normalizeControlStatus(workflowStatus || frameworkStatus),
    };
  });
}

function uniqueControls(controls) {
  const controlsById = new Map();

  controls.forEach((control) => {
    const controlId = control.controlId || control["Control ID"] || control.id || "";
    if (controlId && !controlsById.has(controlId)) {
      controlsById.set(controlId, control);
    }
  });

  return Array.from(controlsById.values());
}

function buildCompletionByControlFamily(controls) {
  const familiesByCode = controls.reduce((families, control) => {
    const familyKey = control.familyCode || control.controlFamily || "Unassigned";
    if (!families.has(familyKey)) {
      families.set(familyKey, {
        familyCode: control.familyCode,
        familyName: control.familyName,
        controlFamily: control.controlFamily,
        totalControls: 0,
        completedControls: 0,
        inProgressControls: 0,
        notStartedControls: 0,
        completionPercentage: 0,
      });
    }

    const family = families.get(familyKey);
    family.totalControls += 1;
    if (control.status === COMPLETED_STATUS) family.completedControls += 1;
    if (control.status === IN_PROGRESS_STATUS) family.inProgressControls += 1;
    if (control.status === NOT_STARTED_STATUS) family.notStartedControls += 1;

    return families;
  }, new Map());

  return Array.from(familiesByCode.values()).map((family) => ({
    ...family,
    completionPercentage: calculateCompletionPercentage(family.completedControls, family.totalControls),
  }));
}

function normalizeControlStatus(status) {
  const normalizedStatus = String(status ?? "").trim().toLowerCase();
  if (normalizedStatus === "completed" || normalizedStatus === "complete") return COMPLETED_STATUS;
  if (normalizedStatus === "in progress" || normalizedStatus === "in-progress") return IN_PROGRESS_STATUS;
  return NOT_STARTED_STATUS;
}

function calculateCompletionPercentage(completedControls, totalControls) {
  if (!totalControls) return 0;
  return Math.round((completedControls / totalControls) * 100);
}

function parseControlFamily(controlFamily, controlId) {
  const [familyCode, ...familyNameParts] = String(controlFamily || "").split(" - ");
  const code = familyCode || String(controlId || "").split(".")[0] || "";
  const name = familyNameParts.join(" - ") || controlFamily || code;
  return { code, name };
}
