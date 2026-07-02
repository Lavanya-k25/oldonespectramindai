/**
 * useOrganizationStore.js
 *
 * localStorage-backed adapter that wraps OrganizationEngineService.
 *
 * Provides:
 *  - loadWorkspaceItem(itemId)         → legacy { status, owner, dueDate, ... } shape
 *  - saveWorkspaceItem(itemId, state)  → routes through OrganizationEngine trackControlStatus()
 *  - saveQuestionnaireAnswers(answers) → stores as org-specific metadata
 *  - loadQuestionnaireAnswers()        → reads from org-specific metadata
 *  - workspaceData                     → the flat { [itemId]: state } map that pages already read
 *
 * Organization data is always stored separately from framework library data.
 * The framework library JSON files are never touched.
 *
 * Storage keys (backward-compatible with the legacy helpers):
 *   spectramind:organization-workspace    — control/risk/test/policy item states
 *   spectramind:org-engine-workspace      — full OrganizationEngine workspace snapshot
 *   spectramind:onboarding-questionnaire  — questionnaire answers (same key as legacy)
 */

import { useCallback, useMemo, useState, useEffect } from "react";
import { OrganizationEngineService } from "../../organization-engine/services/OrganizationEngineService";
import { DEFAULT_FRAMEWORK_ID, resolveFrameworkId } from "../engines/framework-engine/frameworkRegistry";

// ── Constants ─────────────────────────────────────────────────────────────────
const DEFAULT_ORG_ID = "default-org";
const DEFAULT_ORG_NAME = "My Organization";

const LEGACY_WORKSPACE_KEY = "spectramind:organization-workspace";
const ENGINE_WORKSPACE_KEY = "spectramind:org-engine-workspace";
const QUESTIONNAIRE_KEY = "spectramind:onboarding-questionnaire";

// ── Persistence helpers ───────────────────────────────────────────────────────

function loadEngineWorkspace() {
  try {
    const raw = localStorage.getItem(ENGINE_WORKSPACE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function persistEngineWorkspace(workspace) {
  try {
    localStorage.setItem(ENGINE_WORKSPACE_KEY, JSON.stringify(workspace));
  } catch { /* quota exceeded */ }
}

/**
 * Loads the legacy flat workspace map { [itemId]: { status, owner, ... } }
 * still used by the Implementation.jsx as `workspaceData`.
 */
function loadLegacyWorkspace() {
  try {
    const raw = localStorage.getItem(LEGACY_WORKSPACE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function persistLegacyWorkspace(data) {
  try {
    localStorage.setItem(LEGACY_WORKSPACE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event("spectramind:workspace-updated"));
  } catch { /* quota exceeded */ }
}

// ── Bootstrap helper ──────────────────────────────────────────────────────────

/**
 * Creates a seeded OrganizationEngineService with the default org + framework
 * already bootstrapped, loading any previously persisted state.
 */
function createBootstrappedEngine(persistedWorkspace, frameworkId = DEFAULT_FRAMEWORK_ID) {
  const engine = new OrganizationEngineService(persistedWorkspace ?? {});
  const frameworkIds = [...new Set([DEFAULT_FRAMEWORK_ID, frameworkId].filter(Boolean))];

  // Ensure the default org exists
  const hasOrg = engine.toJSON().organizations.some((o) => o.id === DEFAULT_ORG_ID);
  if (!hasOrg) {
    engine.onboardOrganization({ id: DEFAULT_ORG_ID, name: DEFAULT_ORG_NAME });
  }

  // Ensure required frameworks are assigned without removing existing assignments.
  for (const id of frameworkIds) {
    const hasFw = engine.toJSON().frameworks.some(
      (f) => f.organizationId === DEFAULT_ORG_ID && f.frameworkId === id
    );
    if (!hasFw) {
      try {
        engine.assignFramework({
          organizationId: DEFAULT_ORG_ID,
          frameworkId: id,
        });
      } catch { /* already assigned */ }
    }
  }

  return engine;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

/**
 * React hook that provides a full OrganizationEngine-backed workspace store.
 *
 * Returns:
 *   workspaceData   — { [itemId]: { status, owner, dueDate, ... } } (same shape as legacy)
 *   saveWorkspaceItem(itemId, state) — saves to OrganizationEngine + legacy key
 *   engine          — raw OrganizationEngineService instance for advanced use
 */
export function useOrganizationStore(frameworkId = DEFAULT_FRAMEWORK_ID) {
  const activeFrameworkId = resolveFrameworkId(frameworkId) || DEFAULT_FRAMEWORK_ID;
  // Seed from persisted engine snapshot
  const [engineSnapshot, setEngineSnapshot] = useState(() => loadEngineWorkspace());

  // Flat workspace map — mirrors the legacy organizationWorkspace.js format
  const [legacyWorkspaceData, setLegacyWorkspaceData] = useState(() => loadLegacyWorkspace());

  // Build (or rebuild) engine from the persisted snapshot
  const engine = useMemo(
    () => createBootstrappedEngine(engineSnapshot, activeFrameworkId),
    [activeFrameworkId, engineSnapshot]
  );

  const workspaceData = useMemo(
    () => createFrameworkWorkspaceView(legacyWorkspaceData, activeFrameworkId),
    [activeFrameworkId, legacyWorkspaceData]
  );

  // Sync workspace state automatically across all components/pages in real-time
  useEffect(() => {
    const handleWorkspaceUpdate = () => {
      setLegacyWorkspaceData(loadLegacyWorkspace());
      setEngineSnapshot(loadEngineWorkspace());
    };

    window.addEventListener("spectramind:workspace-updated", handleWorkspaceUpdate);
    window.addEventListener("storage", handleWorkspaceUpdate);

    return () => {
      window.removeEventListener("spectramind:workspace-updated", handleWorkspaceUpdate);
      window.removeEventListener("storage", handleWorkspaceUpdate);
    };
  }, []);

  /**
   * Saves an item's workspace state.
   *  - Routes through OrganizationEngine trackControlStatus() for formal tracking
   *  - Also writes the legacy flat map so all existing page reads continue to work
   */
  const saveWorkspaceItem = useCallback(
    (itemId, state) => {
      // 1. Update the OrganizationEngine
      try {
        engine.trackControlStatus({
          organizationId: DEFAULT_ORG_ID,
          frameworkId: activeFrameworkId,
          controlId: itemId,
          status: normalizeOrgStatus(state.status),
        });
      } catch {
        // Silently ignore if not a tracked control type
      }

      // 2. Persist the engine snapshot for next session
      const nextSnapshot = engine.toJSON();
      persistEngineWorkspace(nextSnapshot);
      setEngineSnapshot(nextSnapshot);

      // 3. Update + persist the legacy flat workspace map dynamically (prevent stale closures)
      const latestWorkspace = loadLegacyWorkspace();
      const storageKey = getLegacyWorkspaceStorageKey(activeFrameworkId, itemId);
      const nextWorkspaceData = { ...latestWorkspace, [storageKey]: state };
      persistLegacyWorkspace(nextWorkspaceData);
      setLegacyWorkspaceData(nextWorkspaceData);
    },
    [activeFrameworkId, engine]
  );

  return { engine, workspaceData, saveWorkspaceItem };
}

// ── Questionnaire storage (org-scoped) ───────────────────────────────────────

/**
 * Loads questionnaire answers from localStorage.
 * Uses the same key as the legacy `loadQuestionnaireResponses()` so
 * existing answers are preserved.
 */
export function loadOrgQuestionnaireAnswers(frameworkId = DEFAULT_FRAMEWORK_ID) {
  try {
    const raw = localStorage.getItem(getQuestionnaireStorageKey(frameworkId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Saves questionnaire answers as organization-specific metadata.
 * Writes to the same key as the legacy helper (backward compatible) AND
 * also mirrors into the engine workspace as org metadata.
 */
export function saveOrgQuestionnaireAnswers(answers, frameworkId = DEFAULT_FRAMEWORK_ID) {
  const activeFrameworkId = resolveFrameworkId(frameworkId) || DEFAULT_FRAMEWORK_ID;

  // 1. Persist to the shared questionnaire key (same key as legacy)
  try {
    localStorage.setItem(getQuestionnaireStorageKey(activeFrameworkId), JSON.stringify(answers));
  } catch { /* quota exceeded */ }

  // 2. Mirror into the org engine workspace as metadata on the org record
  try {
    const raw = localStorage.getItem(ENGINE_WORKSPACE_KEY);
    const snapshot = raw ? JSON.parse(raw) : null;
    const engine = createBootstrappedEngine(snapshot);
    // Update the org record metadata to timestamp the questionnaire update
    const ws = engine.toJSON();
    const org = ws.organizations.find((o) => o.id === DEFAULT_ORG_ID);
    if (org) {
      org.metadata = {
        ...(org.metadata ?? {}),
        questionnaireLastUpdated: new Date().toISOString(),
        questionnaireAnswerCount: Object.keys(answers).length,
        questionnaireFrameworkId: activeFrameworkId,
      };
    }
    persistEngineWorkspace(ws);
  } catch {
    // If the engine update fails, the localStorage write above already succeeded
  }

  // 3. Notify listeners (same event as legacy helper)
  window.dispatchEvent(new Event("spectramind:questionnaire-updated"));
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Maps legacy free-form status strings to OrganizationEngine's
 * ImplementationStatus enum values.
 */
function getLegacyWorkspaceStorageKey(frameworkId, itemId) {
  return frameworkId === DEFAULT_FRAMEWORK_ID ? itemId : `${frameworkId}:${itemId}`;
}

function getQuestionnaireStorageKey(frameworkId = DEFAULT_FRAMEWORK_ID) {
  return frameworkId === DEFAULT_FRAMEWORK_ID ? QUESTIONNAIRE_KEY : `${QUESTIONNAIRE_KEY}:${frameworkId}`;
}

function createFrameworkWorkspaceView(workspace, frameworkId) {
  if (frameworkId === DEFAULT_FRAMEWORK_ID) {
    return Object.fromEntries(Object.entries(workspace).filter(([key]) => !key.includes(":")));
  }

  const prefix = `${frameworkId}:`;
  return Object.fromEntries(
    Object.entries(workspace)
      .filter(([key]) => key.startsWith(prefix))
      .map(([key, value]) => [key.slice(prefix.length), value])
  );
}

function normalizeOrgStatus(status) {
  const s = String(status ?? "").toLowerCase().trim();
  if (["complete", "completed", "implemented", "ready"].includes(s)) return "implemented";
  if (s === "not_applicable" || s === "not applicable") return "not_applicable";
  if (s === "in_progress" || s === "in progress") return "in_progress";
  return "not_started";
}
