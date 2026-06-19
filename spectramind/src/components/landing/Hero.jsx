import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import heroArt from "../../assets/hero.png";

const readinessItems = [
  ["SOC 2", "78%", "Evidence due in 4 days"],
  ["ISO 27001", "64%", "Risk review active"],
  ["HIPAA", "91%", "Policies approved"],
];

const activity = [
  "Password policy evidence approved",
  "Vendor risk review assigned",
  "AI mapped 6 controls to SOC 2",
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="absolute inset-x-0 top-0 h-64 bg-[linear-gradient(180deg,#dbeafe_0%,rgba(255,255,255,0)_100%)] dark:bg-[linear-gradient(180deg,rgba(30,41,59,.9)_0%,rgba(2,6,23,0)_100%)]" />

      <div className="relative mx-auto grid min-h-[calc(100vh-81px)] max-w-7xl items-center gap-14 px-6 py-16 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-20">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 dark:border-blue-900/70 dark:bg-blue-950/60 dark:text-blue-200">
            <Sparkles size={16} />
            Compliance operations, ready for audit week
          </div>

          <h1 className="mt-7 max-w-4xl text-5xl font-bold leading-tight text-slate-950 dark:text-white md:text-6xl">
            Run compliance, risk, vendors, and trust from one calm workspace.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            SpectraMind gives security teams a live operating system for controls,
            evidence, risk decisions, vendor reviews, and customer trust reporting.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              Get Started
              <ArrowRight size={18} />
            </Link>

            <Link
              to="/testimonials"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900"
            >
              View Product
            </Link>
          </div>

          <div className="mt-10 grid max-w-2xl grid-cols-1 gap-3 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-3">
            {["Control ownership", "Evidence workflows", "Trust center updates"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-emerald-500" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <img
            src={heroArt}
            alt=""
            className="absolute -right-8 -top-10 hidden w-36 opacity-70 lg:block"
          />

          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-3 shadow-2xl shadow-slate-900/20 dark:border-slate-800">
            <div className="overflow-hidden rounded-[1.25rem] bg-slate-100 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-950">
                <div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    Audit Readiness
                  </p>
                  <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
                    78% ready
                  </h2>
                </div>
                <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  On track
                </div>
              </div>

              <div className="grid gap-4 p-5 lg:grid-cols-[1fr_0.8fr]">
                <div className="space-y-4">
                  {readinessItems.map(([name, value, note]) => (
                    <div key={name} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="font-semibold text-slate-900 dark:text-white">{name}</span>
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-300">{value}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                        <div className="h-2 rounded-full bg-blue-600" style={{ width: value }} />
                      </div>
                      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{note}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                    <div className="mb-4 flex items-center gap-2">
                      <ShieldCheck size={18} className="text-blue-600" />
                      <h3 className="font-semibold text-slate-950 dark:text-white">
                        Control Health
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Metric label="Healthy" value="42" tone="text-emerald-600" />
                      <Metric label="Needs review" value="7" tone="text-amber-600" />
                      <Metric label="Risks" value="5" tone="text-rose-600" />
                      <Metric label="Vendors" value="21" tone="text-blue-600" />
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                    <h3 className="font-semibold text-slate-950 dark:text-white">
                      Recent Activity
                    </h3>
                    <div className="mt-4 space-y-3">
                      {activity.map((item) => (
                        <div key={item} className="flex gap-3 text-sm text-slate-600 dark:text-slate-300">
                          <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value, tone }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
      <p className={`text-2xl font-bold ${tone}`}>{value}</p>
      <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
        {label}
      </p>
    </div>
  );
}
