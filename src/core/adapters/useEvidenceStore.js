/**
 * useEvidenceStore.js
 *
 * Adapter hook that bridges EvidenceEngineService to the shape that
 * Evidence.jsx already renders: { name, category, uploaded } file list.
 *
 * State is persisted to localStorage so uploads survive page reloads
 * (metadata only — blob URLs are transient and are not stored).
 *
 * The framework library is never modified.
 */

import { useCallback, useState } from "react";
import { EvidenceEngineService } from "../../evidence-engine/services/EvidenceEngineService";

const STORAGE_KEY = "spectramind:evidence-store";
const DEFAULT_ORG_ID = "default-org";

// ── Persistence helpers ───────────────────────────────────────────────────────

function loadPersistedRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistRecords(records) {
  // Strip transient blob URLs before serialising — they die on reload anyway.
  const metadata = records.map((ev) => ({
    ...ev,
    versions: ev.versions.map((v) => ({
      ...v,
      downloadUrl: undefined,
      previewUrl: undefined,
    })),
  }));

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(metadata));
  } catch {
    // localStorage quota exceeded — silently skip
  }
}

// ── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Provides evidence file management backed by EvidenceEngineService.
 *
 * Returns:
 *   files       — array of { id, name, category, uploaded } for display
 *   uploadFile  — handles a file input onChange event
 *   deleteFile  — removes a record by its display name
 *   records     — raw Evidence[] from the engine (for advanced use)
 */
export function useEvidenceStore() {
  // Seed initial state from localStorage — persisted metadata without blob URLs
  const [records, setRecords] = useState(() => loadPersistedRecords());

  /**
   * Rebuilds an engine from the current records snapshot, runs an operation
   * on it, then syncs state + localStorage with the new snapshot.
   */
  const withEngine = useCallback((operation) => {
    setRecords((currentRecords) => {
      const engine = new EvidenceEngineService({ evidence: currentRecords });
      operation(engine);
      const next = engine.toJSON();
      persistRecords(next);
      return next;
    });
  }, []);

  /** Handles a browser file input change event. */
  const uploadFile = useCallback(
    (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      withEngine((engine) => {
        engine.uploadEvidence({
          organizationId: DEFAULT_ORG_ID,
          title: file.name,
          description: categoryFromFileName(file.name),
          file,
          uploadedBy: "current-user",
        });
      });
    },
    [withEngine],
  );

  /** Removes an evidence record by its display name. */
  const deleteFile = useCallback(
    (fileName) => {
      setRecords((currentRecords) => {
        const next = currentRecords.filter((r) => {
          const latestVersion = r.versions?.at(-1);
          return (latestVersion?.fileName ?? r.title) !== fileName;
        });
        persistRecords(next);
        return next;
      });
    },
    [],
  );

  // ── Derive display-ready { name, category, uploaded } list ───────────────
  const files = records.map((ev) => {
    const latestVersion = ev.versions?.at(-1);
    const name = latestVersion?.fileName ?? ev.title;
    const category = ev.description || categoryFromFileName(name);
    const uploaded = latestVersion
      ? formatUploadDate(latestVersion.uploadedAt)
      : formatUploadDate(ev.createdAt);

    return { id: ev.id, name, category, uploaded };
  });

  return { files, uploadFile, deleteFile, records };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function categoryFromFileName(name) {
  const n = String(name ?? "").toLowerCase();
  if (/access|iam|identity|user/.test(n)) return "Access Control";
  if (/incident|ir|response/.test(n)) return "Security Operations";
  if (/policy|pol/.test(n)) return "Policy Management";
  if (/risk/.test(n)) return "Risk Management";
  if (/vendor/.test(n)) return "Vendor Management";
  if (/encrypt|data|backup/.test(n)) return "Data Protection";
  return "Uploaded File";
}

function formatUploadDate(isoString) {
  if (!isoString) return "Today";
  try {
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Today";
  }
}
