import { FileText, Trash2, UploadCloud } from "lucide-react";
import AppShell from "../components/layout/AppShell";
import { useEvidenceStore } from "../core/adapters/useEvidenceStore";

export default function Evidence() {
  // All evidence state is now managed by EvidenceEngineService (versioning,
  // tags, review status, approval status, mappings, audit history).
  // The existing UI markup below is completely unchanged.
  const { files, uploadFile, deleteFile } = useEvidenceStore();

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
            Upload, review, and organize audit artifacts for your active controls.
          </p>
        </div>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-10 text-center dark:border-slate-700 dark:bg-slate-950">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
              <UploadCloud size={28} />
            </div>
            <h2 className="mt-5 text-2xl font-bold text-slate-950 dark:text-white">
              Upload compliance evidence
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-600 dark:text-slate-300">
              Add screenshots, reports, policies, and exports that support control readiness.
            </p>

            <label className="mt-6 inline-flex cursor-pointer items-center justify-center rounded-lg bg-primary px-6 py-3 font-semibold text-white transition hover:bg-blue-700">
              Upload Evidence
              <input type="file" className="hidden" onChange={uploadFile} />
            </label>
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 p-5 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-950 dark:text-white">Uploaded Files</h2>
          </div>

          {files.map((file) => (
            <div
              key={file.name}
              className="flex flex-col gap-4 border-b border-slate-100 p-5 last:border-b-0 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-blue-600 dark:bg-slate-800 dark:text-blue-300">
                  <FileText size={21} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-950 dark:text-white">{file.name}</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {file.category} · {file.uploaded}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => deleteFile(file.name)}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 dark:hover:bg-slate-800"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
