import { ArrowRight, BrainCircuit, FileCheck2, TriangleAlert } from "lucide-react";
import { Link } from "react-router-dom";

const queues = [
  { label: "Evidence requests", value: "18", icon: FileCheck2, tone: "text-blue-600" },
  { label: "Open risks", value: "5", icon: TriangleAlert, tone: "text-rose-600" },
  { label: "AI answers", value: "43", icon: BrainCircuit, tone: "text-violet-600" },
];

const rows = [
  ["Access review", "Ready", "SOC 2 CC6.2"],
  ["Incident response policy", "Needs owner", "ISO A.5.24"],
  ["Vendor renewal", "Due soon", "HIPAA"],
  ["Risk treatment plan", "In review", "SOC 2 CC3.2"],
];

export default function DashboardPreview() {
  return (
    <section className="bg-white px-6 py-24 dark:bg-slate-950 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-300">
            Product Preview
          </p>
          <h2 className="mt-3 text-4xl font-bold leading-tight text-slate-950 dark:text-white md:text-5xl">
            See the work, the owners, and the next decision.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
            Your team gets a clean cockpit for readiness, evidence collection,
            risk response, and vendor follow-up without digging through tabs.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/testimonials"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Explore the Product
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900"
            >
              View Pricing
            </Link>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-100 p-3 shadow-2xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900">
          <div className="rounded-[1rem] bg-white p-5 dark:bg-slate-950">
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Compliance Command Center
                </p>
                <h3 className="text-2xl font-bold text-slate-950 dark:text-white">
                  Today&apos;s audit queue
                </h3>
              </div>
              <div className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                12 items resolved
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {queues.map((queue) => {
                const Icon = queue.icon;

                return (
                  <div
                    key={queue.label}
                    className="rounded-lg border border-slate-200 p-4 dark:border-slate-800"
                  >
                    <Icon size={20} className={queue.tone} />
                    <p className="mt-4 text-3xl font-bold text-slate-950 dark:text-white">
                      {queue.value}
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {queue.label}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
              {rows.map(([name, status, framework]) => (
                <div
                  key={name}
                  className="grid grid-cols-[1fr_auto] gap-4 border-b border-slate-200 px-4 py-3 last:border-b-0 dark:border-slate-800 md:grid-cols-[1fr_140px_120px]"
                >
                  <p className="font-semibold text-slate-900 dark:text-white">{name}</p>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    {status}
                  </p>
                  <p className="hidden text-sm text-slate-500 dark:text-slate-400 md:block">
                    {framework}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
