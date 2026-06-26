import { FileText, Plus } from "lucide-react";
import AppShell from "../components/layout/AppShell";

const policies = [
  { name: "Security Policy", owner: "Security Team", status: "Approved" },
  { name: "Access Control Policy", owner: "IT Team", status: "Approved" },
  { name: "Password Policy", owner: "Security Team", status: "Review Required" },
  { name: "Incident Response Policy", owner: "Security Team", status: "Approved" },
];

export default function Policies() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-300">
              Documents
            </p>
            <h1 className="mt-2 text-4xl font-bold text-slate-950 dark:text-white">
              Policies
            </h1>
            <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
              Track ownership, approval state, and review needs for key security policies.
            </p>
          </div>

          <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-semibold text-white transition hover:bg-blue-700">
            <Plus size={18} />
            Create Policy
          </button>
        </div>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {policies.map((policy) => (
            <div
              key={policy.name}
              className="flex flex-col gap-4 border-b border-slate-100 p-5 last:border-b-0 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                  <FileText size={21} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-950 dark:text-white">{policy.name}</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Owner: {policy.owner}
                  </p>
                </div>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-sm font-bold ${
                  policy.status === "Approved"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                }`}
              >
                {policy.status}
              </span>
            </div>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
