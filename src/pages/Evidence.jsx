import { Download, FileText } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useComplianceState } from "../compliance/ComplianceStateContext";
import AppShell from "../components/layout/AppShell";
import { getCurrentVersion, getEvidenceHealth } from "../evidence/EvidenceService";
import ActiveFrameworkRequired from "../framework/ActiveFrameworkRequired";
import { useFrameworkWorkspace } from "../framework/FrameworkWorkspaceContext";
import { buildCrossModuleTarget } from "../navigation/crossModuleNavigation";

const healthStyles = {
  Valid: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  "Needs Review": "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  Missing: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  Expired: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300",
};

export default function Evidence() {
  const { activeFramework } = useFrameworkWorkspace();

  if (!activeFramework) {
    return <ActiveFrameworkRequired />;
  }

  return <EvidenceContent key={activeFramework.id} activeFramework={activeFramework} />;
}

function EvidenceContent({ activeFramework }) {
  const location = useLocation();
  const navigate = useNavigate();
  const targetItemId = new URLSearchParams(location.search).get("item");
  const { evidenceStore } = useComplianceState();
  const records = evidenceStore.records.filter((record) => !record.deletedAt);
  const openImplementationRecord = (itemId, itemType, evidenceId) => {
    const target = buildCrossModuleTarget({
      activeFramework,
      itemId,
      itemType,
      moduleContext: `Evidence:${evidenceId}`,
      mode: "view",
    });
    navigate(target.path, { state: target.state });
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-300">
            Evidence
          </p>
          <h1 className="mt-2 text-4xl font-bold text-slate-950 dark:text-white">
            Evidence Repository
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
            Evidence uploaded from Tests appears here automatically.
          </p>
        </div>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 p-5 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-950 dark:text-white">Uploaded Evidence</h2>
          </div>

          {records.map((record) => {
            const version = getCurrentVersion(record);
            const metadata = record.metadata || {};
            const health = getEvidenceHealth(record);
            const mappings = record.mappings || [];
            const linkedTests = uniqueValues(mappings.map((mapping) => mapping.testId).filter(Boolean));
            const linkedControls = uniqueValues([
              ...(metadata.linkedControls || []),
              ...mappings.map((mapping) => mapping.controlId).filter(Boolean),
            ]);

            return (
              <div
                key={record.id}
                className={`flex flex-col gap-4 border-b p-5 last:border-b-0 dark:border-slate-800 lg:flex-row lg:items-start lg:justify-between ${
                  targetItemId === record.id
                    ? "border-blue-200 bg-blue-50/40"
                    : "border-slate-100"
                }`}
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-blue-600 dark:bg-slate-800 dark:text-blue-300">
                    <FileText size={21} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-slate-950 dark:text-white">
                      {version?.fileName || record.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {record.id} · v{version?.versionNumber || metadata.version || 1} · {formatDate(version?.uploadedAt || record.createdAt)}
                    </p>
                    <div className="mt-3 grid gap-1 text-xs font-semibold text-slate-500 sm:grid-cols-2">
                      <RepositoryMeta label="File Type" value={version?.fileType || metadata.fileType} />
                      <RepositoryMeta label="Uploaded By" value={version?.uploadedByName || metadata.uploadedBy} />
                      <RepositoryMeta label="Linked Framework" value={metadata.linkedFramework || activeFramework.id} />
                      <RepositoryLinks
                        label="Linked Test"
                        ids={linkedTests.length ? linkedTests : [metadata.linkedTest].filter(Boolean)}
                        onOpen={(id) => openImplementationRecord(id, "Test", record.id)}
                      />
                      <RepositoryLinks
                        label="Linked Controls"
                        ids={linkedControls}
                        onOpen={(id) => openImplementationRecord(id, "Control", record.id)}
                      />
                      <RepositoryMeta label="Status" value={record.evidenceStatus || metadata.evidenceStatus} />
                    </div>
                    {metadata.description || record.description ? (
                      <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                        {metadata.description || record.description}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${healthStyles[health] || healthStyles.Missing}`}>
                    {health}
                  </span>
                  <a
                    href={version?.downloadUrl || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800 ${
                      !version?.downloadUrl ? "pointer-events-none opacity-50" : ""
                    }`}
                  >
                    <Download size={16} />
                    Download
                  </a>
                </div>
              </div>
            );
          })}

          {!records.length && (
            <div className="p-8 text-center">
              <p className="text-sm font-bold text-slate-900 dark:text-white">No evidence uploaded yet.</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Open a Test in Implementation and use the Evidence section to upload or link evidence.
              </p>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function RepositoryMeta({ label, value }) {
  return (
    <div className="min-w-0">
      <span className="text-slate-400">{label}: </span>
      <span className="font-black text-slate-700 dark:text-slate-200">{value || "-"}</span>
    </div>
  );
}

function RepositoryLinks({ label, ids, onOpen }) {
  return (
    <div className="min-w-0">
      <span className="text-slate-400">{label}: </span>
      {ids.length ? (
        <span className="inline-flex flex-wrap gap-1">
          {ids.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => onOpen(id)}
              className="rounded bg-blue-50 px-1.5 py-0.5 text-xs font-black text-blue-700 transition hover:bg-blue-100"
            >
              {id}
            </button>
          ))}
        </span>
      ) : (
        <span className="font-black text-slate-700 dark:text-slate-200">-</span>
      )}
    </div>
  );
}

function formatDate(value) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function uniqueValues(values) {
  return [...new Set((values || []).filter(Boolean))];
}
