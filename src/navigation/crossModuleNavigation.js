const IMPLEMENTATION_TYPES = new Set(["Control", "Test", "Implementation", "Population", "Risk"]);

const MODULE_PATHS = {
  Control: "/implementation",
  Test: "/implementation",
  Implementation: "/implementation",
  Population: "/implementation",
  Risk: "/implementation",
  Policy: "/policies",
  Evidence: "/evidence",
  Questionnaire: "/questionnaire",
  Task: "/tasks",
  Training: "/training",
  Audit: "/audits",
};

export function buildCrossModuleTarget({ activeFramework, itemId, itemType, moduleContext = "", mode = "view" }) {
  const normalizedType = normalizeItemType(itemType);
  const frameworkId = activeFramework?.id || activeFramework?.slug || activeFramework || "";
  const path = MODULE_PATHS[normalizedType] || "/implementation";
  const params = new URLSearchParams({
    framework: frameworkId,
    item: itemId || "",
    itemType: normalizedType,
    moduleContext,
    auditMode: mode,
  });

  if (IMPLEMENTATION_TYPES.has(normalizedType)) {
    params.set("itemId", itemId || "");
  }

  return {
    path: `${path}?${params.toString()}`,
    state: {
      activeFramework,
      relatedItemId: itemId,
      itemType: normalizedType,
      moduleContext,
      auditMode: mode,
      readOnly: mode === "view",
      missingRecordMessage: "The linked record is no longer available. Use this module to locate the current replacement.",
    },
  };
}

export function normalizeItemType(itemType = "") {
  const normalized = String(itemType).trim();
  return {
    Controls: "Control",
    Tests: "Test",
    Implementations: "Implementation",
    Policies: "Policy",
    Risks: "Risk",
    EvidenceRequirements: "Evidence",
    Tasks: "Task",
  }[normalized] || normalized || "Implementation";
}

export function implementationTabForItemType(itemType, fallback = "Tests") {
  return {
    Control: "Controls",
    Test: "Tests",
    Risk: "Risk Scenarios",
    Policy: "Policies",
    Implementation: "Populations",
    Population: "Populations",
  }[normalizeItemType(itemType)] || fallback;
}
