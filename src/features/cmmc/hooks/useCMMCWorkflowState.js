import { useCallback, useEffect, useMemo, useState } from "react";
import {
  loadOrgQuestionnaireAnswers,
  saveOrgQuestionnaireAnswers,
} from "../../../core/adapters/useOrganizationStore";
import { CMMC_FRAMEWORK_ID } from "../../../core/engines/framework-engine/frameworkRegistry";

const QUESTIONNAIRE_EVENT = "spectramind:questionnaire-updated";
const EVIDENCE_WORKFLOW_FIELDS_KEY = "__cmmcEvidenceWorkflowFields";
const CONTROL_WORKFLOW_FIELDS_KEY = "__cmmcControlWorkflowFields";
const EVIDENCE_WORKFLOW_FIELDS = [
  "evidenceStatus",
  "ownerCollector",
  "dateCollected",
  "sourceSystemTool",
  "notesGaps",
];
const CONTROL_WORKFLOW_FIELDS = ["status"];

export const CMMC_CONTROL_WORKFLOW_STATUS_OPTIONS = ["Not Started", "In Progress", "Completed"];

export function loadCMMCScopeAnswers() {
  return normalizeAnswers(loadOrgQuestionnaireAnswers(CMMC_FRAMEWORK_ID));
}

export function saveCMMCScopeAnswers(answers) {
  const nextAnswers = normalizeAnswers(answers);
  saveOrgQuestionnaireAnswers(nextAnswers, CMMC_FRAMEWORK_ID);
  return nextAnswers;
}

export function getCMMCWorkflowState(scopeAnswers = loadCMMCScopeAnswers()) {
  const answers = normalizeAnswers(scopeAnswers);

  return {
    frameworkId: CMMC_FRAMEWORK_ID,
    scope: {
      answers,
    },
    organization: getCMMCOrganizationProfile(answers),
    controls: {
      fields: getCMMCControlWorkflowFields(answers),
    },
    evidence: {
      fields: getCMMCEvidenceWorkflowFields(answers),
    },
  };
}

export function useCMMCWorkflowState() {
  const [scopeAnswers, setScopeAnswers] = useState(() => loadCMMCScopeAnswers());

  useEffect(() => {
    const refreshScopeAnswers = () => setScopeAnswers(loadCMMCScopeAnswers());

    window.addEventListener(QUESTIONNAIRE_EVENT, refreshScopeAnswers);
    window.addEventListener("spectramind:session-updated", refreshScopeAnswers);
    window.addEventListener("storage", refreshScopeAnswers);

    return () => {
      window.removeEventListener(QUESTIONNAIRE_EVENT, refreshScopeAnswers);
      window.removeEventListener("spectramind:session-updated", refreshScopeAnswers);
      window.removeEventListener("storage", refreshScopeAnswers);
    };
  }, []);

  const updateScopeAnswers = useCallback((updater) => {
    const currentAnswers = loadCMMCScopeAnswers();
    const nextAnswers =
      typeof updater === "function" ? updater(currentAnswers) : updater;
    const savedAnswers = saveCMMCScopeAnswers(nextAnswers);
    setScopeAnswers(savedAnswers);
    return savedAnswers;
  }, []);

  const updateScopeAnswer = useCallback(
    (answerId, value) =>
      updateScopeAnswers((currentAnswers) => ({
        ...currentAnswers,
        [answerId]: value,
      })),
    [updateScopeAnswers]
  );

  const evidenceWorkflowFields = useMemo(
    () => getCMMCEvidenceWorkflowFields(scopeAnswers),
    [scopeAnswers]
  );
  const controlWorkflowFields = useMemo(
    () => getCMMCControlWorkflowFields(scopeAnswers),
    [scopeAnswers]
  );

  const updateEvidenceWorkflowField = useCallback(
    (evidenceKey, field, value) =>
      updateScopeAnswers((currentAnswers) => {
        const normalizedKey = String(evidenceKey ?? "").trim();
        if (!normalizedKey || !EVIDENCE_WORKFLOW_FIELDS.includes(field)) {
          return currentAnswers;
        }

        const currentFields = getCMMCEvidenceWorkflowFields(currentAnswers);

        return {
          ...currentAnswers,
          [EVIDENCE_WORKFLOW_FIELDS_KEY]: {
            ...currentFields,
            [normalizedKey]: {
              ...(currentFields[normalizedKey] || {}),
              [field]: String(value ?? ""),
            },
          },
        };
      }),
    [updateScopeAnswers]
  );

  const updateControlWorkflowField = useCallback(
    (controlKey, field, value) =>
      updateScopeAnswers((currentAnswers) => {
        const normalizedKey = String(controlKey ?? "").trim();
        if (!normalizedKey || !CONTROL_WORKFLOW_FIELDS.includes(field)) {
          return currentAnswers;
        }

        const currentFields = getCMMCControlWorkflowFields(currentAnswers);

        return {
          ...currentAnswers,
          [CONTROL_WORKFLOW_FIELDS_KEY]: {
            ...currentFields,
            [normalizedKey]: {
              ...(currentFields[normalizedKey] || {}),
              [field]: String(value ?? ""),
            },
          },
        };
      }),
    [updateScopeAnswers]
  );

  const updateControlWorkflowStatus = useCallback(
    (controlKey, status) => updateControlWorkflowField(controlKey, "status", status),
    [updateControlWorkflowField]
  );

  const organizationProfile = useMemo(
    () => getCMMCOrganizationProfile(scopeAnswers),
    [scopeAnswers]
  );

  const workflowState = useMemo(
    () => getCMMCWorkflowState(scopeAnswers),
    [scopeAnswers]
  );

  return {
    workflowState,
    scopeAnswers,
    organizationProfile,
    controlWorkflowFields,
    evidenceWorkflowFields,
    updateScopeAnswer,
    updateScopeAnswers,
    updateControlWorkflowField,
    updateControlWorkflowStatus,
    updateEvidenceWorkflowField,
  };
}

export function getCMMCControlWorkflowFields(scopeAnswers = {}) {
  const controlFields = scopeAnswers?.[CONTROL_WORKFLOW_FIELDS_KEY];
  if (!controlFields || typeof controlFields !== "object" || Array.isArray(controlFields)) {
    return {};
  }

  return Object.entries(controlFields).reduce((fieldsByKey, [controlKey, fieldValues]) => {
    if (!fieldValues || typeof fieldValues !== "object" || Array.isArray(fieldValues)) {
      return fieldsByKey;
    }

    const normalizedFieldValues = CONTROL_WORKFLOW_FIELDS.reduce((values, field) => {
      if (Object.prototype.hasOwnProperty.call(fieldValues, field)) {
        values[field] = String(fieldValues[field] ?? "");
      }
      return values;
    }, {});

    if (Object.keys(normalizedFieldValues).length) {
      fieldsByKey[controlKey] = normalizedFieldValues;
    }

    return fieldsByKey;
  }, {});
}

export function getCMMCEvidenceWorkflowFields(scopeAnswers = {}) {
  const evidenceFields = scopeAnswers?.[EVIDENCE_WORKFLOW_FIELDS_KEY];
  if (!evidenceFields || typeof evidenceFields !== "object" || Array.isArray(evidenceFields)) {
    return {};
  }

  return Object.entries(evidenceFields).reduce((fieldsByKey, [evidenceKey, fieldValues]) => {
    if (!fieldValues || typeof fieldValues !== "object" || Array.isArray(fieldValues)) {
      return fieldsByKey;
    }

    const normalizedFieldValues = EVIDENCE_WORKFLOW_FIELDS.reduce((values, field) => {
      if (Object.prototype.hasOwnProperty.call(fieldValues, field)) {
        values[field] = String(fieldValues[field] ?? "");
      }
      return values;
    }, {});

    if (Object.keys(normalizedFieldValues).length) {
      fieldsByKey[evidenceKey] = normalizedFieldValues;
    }

    return fieldsByKey;
  }, {});
}

export function getCMMCOrganizationProfile(scopeAnswers = {}) {
  const answers = normalizeAnswers(scopeAnswers);

  return {
    organizationName: textAnswer(answers, "organizationName", "companyName"),
    organizationType: textAnswer(answers, "organizationType", "companyStage"),
    systemName: textAnswer(answers, "systemName"),
    cuiTypes: listAnswer(answers, "cuiCategories"),
    cloudPlatforms: listAnswer(answers, "cloudPlatforms", "cloudServices"),
    emailPlatform: listAnswer(answers, "cloudEmail"),
    storagePlatform: listAnswer(answers, "cloudFileStorage", "storageLocations"),
    devices: listAnswer(answers, "endUserDevices", "endpointCount"),
    cuiFlow: {
      receivedFrom: listAnswer(answers, "receivedFrom"),
      storageLocations: listAnswer(answers, "storageLocations"),
      transmissionMethods: listAnswer(answers, "transmissionMethods"),
      retentionPeriod: textAnswer(answers, "retentionPeriod"),
      flowDescription: textAnswer(answers, "flowDescription"),
    },
    workforce: {
      cuiEmployeeAccess: textAnswer(answers, "cuiEmployeeAccess", "cuiUsers"),
      remoteEmployees: textAnswer(answers, "remoteEmployees", "remoteAccess"),
      byodUse: textAnswer(answers, "byodUse", "byod"),
      dedicatedItSupport: listAnswer(answers, "dedicatedItSupport", "supportModel"),
    },
    externalConnections: {
      vpnRequired: textAnswer(answers, "vpnRequired"),
      thirdPartyAccess: listAnswer(answers, "thirdPartyAccess"),
      govPortals: listAnswer(answers, "govPortals"),
      connectionReview: textAnswer(answers, "connectionReview"),
      interconnectionNotes: textAnswer(answers, "interconnectionNotes"),
    },
  };
}

export function getCMMCOrganizationProfileSearchText(organizationProfile = {}) {
  return flattenProfileValues(organizationProfile).join(" ").toLowerCase();
}

function normalizeAnswers(answers) {
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
    return {};
  }

  return Object.entries(answers).reduce((normalized, [key, value]) => {
    if (!isAnswered(value)) return normalized;
    normalized[key] = Array.isArray(value) ? [...value] : value;
    return normalized;
  }, {});
}

function textAnswer(answers, ...keys) {
  for (const key of keys) {
    const value = answers[key];
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number") return String(value);
  }

  return "";
}

function listAnswer(answers, ...keys) {
  for (const key of keys) {
    const value = answers[key];
    if (Array.isArray(value) && value.length) return [...value];
    if (typeof value === "string" && value.trim()) return [value];
  }

  return [];
}

function isAnswered(value) {
  if (Array.isArray(value)) {
    return value.some((item) => String(item ?? "").trim());
  }

  return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
}

function flattenProfileValues(value) {
  if (Array.isArray(value)) {
    return value.flatMap((item) => flattenProfileValues(item));
  }

  if (value && typeof value === "object") {
    return Object.values(value).flatMap((item) => flattenProfileValues(item));
  }

  const normalized = String(value ?? "").trim();
  return normalized ? [normalized] : [];
}
