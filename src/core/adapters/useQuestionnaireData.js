/**
 * useQuestionnaireData.js
 *
 * Adapter that bridges the FrameworkEngine's JSON-based questionnaire
 * (src/core/framework-library/soc2/questionnaire.json) to the MCQ shape
 * that Questionnaire.jsx already renders.
 *
 * Storage is delegated to the existing localStorage helpers in
 * src/data/questionnaireEngine.js — fully backward compatible, same key.
 */

import { useMemo } from "react";
import { FrameworkEngine } from "../engines/framework-engine/frameworkEngine";

const DEFAULT_FRAMEWORK_ID = "soc2-type-ii";

/**
 * Returns questionnaire sections shaped as:
 *   { id, title, questions: [{ key, label, type, options }] }
 *
 * This matches the legacy questionnaireSections format that Questionnaire.jsx
 * already iterates over.
 *
 * @param {string} [frameworkId]
 * @returns {{ id: string, title: string, questions: object[] }[]}
 */
export function useQuestionnaireSections(frameworkId = DEFAULT_FRAMEWORK_ID) {
  return useMemo(() => {
    let engine;
    try {
      engine = new FrameworkEngine(frameworkId);
    } catch {
      return [];
    }

    const rawSections = engine.getQuestionnaire();
    if (!rawSections?.length) return [];

    return rawSections.map((section) => ({
      id: section.id,
      title: section.title,
      questions: (section.questions ?? []).map((q) => ({
        // Use the JSON question id as the storage key (e.g. "Q-ORG-001")
        key: q.id,
        label: q.question,
        type: normalizeType(q.type),
        options: q.options ?? [],
        signals: deriveSignals(q),
        relatedControls: q.relatedControls ?? [],
      })),
    }));
  }, [frameworkId]);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Normalises question type strings from the JSON schema to the values
 * that Questionnaire.jsx's rendering branches on ("mcq" | "boolean" | "text").
 */
function normalizeType(type) {
  if (type === "single_select") return "mcq";
  if (type === "multi_select") return "mcq";
  if (type === "boolean") return "boolean";
  return "mcq";
}

/**
 * Derives applicability signal tags from the question's relatedControls
 * so getQuestionnaireApplicability() can still function.
 */
function deriveSignals(q) {
  // Map control IDs to broad category signals
  const signals = new Set();
  for (const controlId of q.relatedControls ?? []) {
    if (/^CC1/.test(controlId)) signals.add("Governance");
    if (/^CC3/.test(controlId)) signals.add("Risk Assessment");
    if (/^CC5/.test(controlId)) signals.add("Control Activities");
    if (/^CC6/.test(controlId)) signals.add("Access Control").add("Identity");
    if (/^CC7/.test(controlId)) signals.add("Monitoring").add("Logging").add("Incident Response");
    if (/^CC8/.test(controlId)) signals.add("Change Management").add("Application Security");
    if (/^CC9/.test(controlId)) signals.add("Vendor Management").add("Vendor");
    if (/^A1/.test(controlId)) signals.add("Availability").add("Backup").add("Business Continuity");
    if (/^C1/.test(controlId)) signals.add("Confidentiality").add("Data Protection").add("Encryption");
    if (/^P[0-9]/.test(controlId)) signals.add("Privacy").add("Data Protection");
    if (/^PI/.test(controlId)) signals.add("Processing Integrity");
  }
  return [...signals];
}
