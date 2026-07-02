import { AlertTriangle, Plus } from "lucide-react";
import AppShell from "../components/layout/AppShell";
import { useFrameworkData } from "../core/adapters/useFrameworkData";
import { useOrganizationStore } from "../core/adapters/useOrganizationStore";

const severityStyles = {
  Critical: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  High: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  Medium: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  Low: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
};

export default function Risks() {
  const { risks: frameworkRisks } = useFrameworkData("soc-2");
  const { workspaceData } = useOrganizationStore();

  // Wire up the mock array to the actual engines
  const risks = frameworkRisks.map((risk) => {
    const saved = workspaceData[risk.id] ?? {};
    return {
      id: risk.id,
      title: risk.title,
      severity: risk.severity || "Medium",
      owner: saved.assignments?.owner || "Unassigned",
      dueDate: saved.dueDate || "No due date",
      status: saved.status || "Open",
    };
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-300">
              Risk
            </p>
            <h1 className="mt-2 text-4xl font-bold text-slate-950 dark:text-white">
              Risk Register
            </h1>
            <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
              Prioritize risks, assign owners, and track remediation work.
            </p>
          </div>

          <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-semibold text-white transition hover:bg-blue-700">
            <Plus size={18} />
            Add Risk
          </button>
        </div>

        <div className="grid gap-4">
          {risks.map((risk) => (
            <article
              key={risk.id}
              className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300">
                    <AlertTriangle size={21} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-950 dark:text-white">
                      {risk.title}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Owner: {risk.owner}
                    </p>
                  </div>
                </div>

                <span className={`rounded-full px-3 py-1 text-sm font-bold ${severityStyles[risk.severity]}`}>
                  {risk.severity}
                </span>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                <Detail label="Due date" value={risk.dueDate} />
                <Detail label="Status" value={risk.status} />
                <Detail label="Owner" value={risk.owner} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function Detail({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 font-bold text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}
