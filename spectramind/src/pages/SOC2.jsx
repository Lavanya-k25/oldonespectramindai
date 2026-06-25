import { CheckCircle2, CircleAlert, ListChecks } from "lucide-react";
import { Link } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import { controls } from "../data/controls";

const stats = [
  ["Total Controls", "64", ListChecks, "text-blue-600"],
  ["Completed", "52", CheckCircle2, "text-emerald-600"],
  ["Missing", "12", CircleAlert, "text-rose-600"],
];

export default function SOC2() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-300">
            Framework
          </p>
          <h1 className="mt-2 text-4xl font-bold text-slate-950 dark:text-white">
            SOC 2 Controls
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
            Monitor control readiness, evidence status, and remediation needs.
          </p>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          {stats.map(([label, value, Icon, tone]) => (
            <div
              key={label}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <Icon size={24} className={tone} />
              <p className="mt-4 text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</p>
              <h2 className={`mt-1 text-4xl font-bold ${tone}`}>{value}</h2>
            </div>
          ))}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex justify-between text-sm font-bold text-slate-700 dark:text-slate-200">
            <span>SOC 2 Readiness</span>
            <span>81%</span>
          </div>
          <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800">
            <div className="h-3 w-[81%] rounded-full bg-blue-600" />
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 p-5 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-950 dark:text-white">Controls</h2>
          </div>

          {controls.map((control) => (
            <div
              key={control.id}
              className="flex flex-col gap-4 border-b border-slate-100 p-5 last:border-b-0 dark:border-slate-800 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <Link
                  to={`/control/${control.id}`}
                  className="font-bold text-blue-600 transition hover:text-blue-700"
                >
                  {control.id}
                </Link>
                <p className="mt-1 text-slate-600 dark:text-slate-300">{control.name}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  Evidence: {control.evidence}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-bold ${
                    control.status === "Completed"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      : control.status === "In Progress"
                      ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                      : "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                  }`}
                >
                  {control.status}
                </span>
              </div>
            </div>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
