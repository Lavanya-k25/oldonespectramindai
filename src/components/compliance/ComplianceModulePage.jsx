import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import AppShell from "../layout/AppShell";

export default function ComplianceModulePage({
  eyebrow,
  title,
  description,
  icon: Icon,
  metrics,
  items,
  actionLabel,
}) {
  return (
    <AppShell>
      <div className="space-y-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-300">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950 dark:text-white">
              {title}
            </h1>
            <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
              {description}
            </p>
          </div>

          <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100">
            {actionLabel}
            <ArrowUpRight size={18} />
          </button>
        </div>

        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-900 dark:ring-slate-800">
          <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                <Icon size={24} />
              </div>
              <h2 className="mt-5 text-2xl font-bold text-slate-950 dark:text-white">
                {title} overview
              </h2>
              <p className="mt-2 leading-7 text-slate-600 dark:text-slate-300">
                Keep owners, status, and upcoming work visible without opening multiple systems.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {metrics.map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950"
                >
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {label}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-900 dark:ring-slate-800">
          <div className="border-b border-slate-100 px-6 py-5 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-950 dark:text-white">
              Current work
            </h2>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((item) => (
              <div
                key={item.title}
                className="grid gap-4 px-6 py-5 lg:grid-cols-[1fr_160px_140px]"
              >
                <div className="flex gap-3">
                  <CheckCircle2
                    size={20}
                    className="mt-0.5 shrink-0 text-emerald-500"
                  />
                  <div>
                    <h3 className="font-bold text-slate-950 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {item.description}
                    </p>
                  </div>
                </div>

                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  {item.owner}
                </p>
                <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
