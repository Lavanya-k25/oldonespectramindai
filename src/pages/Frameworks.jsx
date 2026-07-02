import { ArrowRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import { frameworks } from "../data/mockData";

export default function Frameworks() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-300">
            Compliance
          </p>
          <h1 className="mt-2 text-4xl font-bold text-slate-950 dark:text-white">
            Frameworks
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
            Monitor progress across active compliance frameworks and prioritize the next control work.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {frameworks.map((framework) => (
            <article
              key={framework.id}
              className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                    <ShieldCheck size={22} />
                  </div>
                  <h2 className="mt-5 text-2xl font-bold text-slate-950 dark:text-white">
                    {framework.name}
                  </h2>
                  <p className="mt-1 text-slate-500 dark:text-slate-400">{framework.status}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {framework.progress}%
                </span>
              </div>

              <div className="mt-6">
                <div className="mb-2 flex justify-between text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <span>Progress</span>
                  <span>{framework.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-2 rounded-full bg-blue-600"
                    style={{ width: `${framework.progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Metric label="Controls" value={framework.controls} />
                <Metric label="Evidence" value={framework.evidence} />
              </div>

              <Link
                to={`/implementation?framework=${framework.slug || slugifyFramework(framework.name)}`}
                state={{ framework }}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                View Framework
                <ArrowRight size={18} />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}

function slugifyFramework(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
