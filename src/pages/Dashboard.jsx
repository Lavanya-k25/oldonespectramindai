import {
  AlertTriangle,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  FileCheck2,
  ShieldCheck,
} from "lucide-react";
import ActivityFeed from "../components/dashboard/ActivityFeed";
import ComplianceChart from "../components/dashboard/ComplianceChart";
import AppShell from "../components/layout/AppShell";

const stats = [
  {
    label: "Compliance Score",
    value: "85%",
    note: "+12% this month",
    icon: ShieldCheck,
    tone: "text-emerald-600",
  },
  {
    label: "Evidence Files",
    value: "124",
    note: "24 uploaded recently",
    icon: FileCheck2,
    tone: "text-blue-600",
  },
  {
    label: "Open Risks",
    value: "5",
    note: "2 high priority",
    icon: AlertTriangle,
    tone: "text-rose-600",
  },
  {
    label: "Vendors",
    value: "21",
    note: "3 pending reviews",
    icon: Building2,
    tone: "text-violet-600",
  },
];

const readiness = [
  ["Access reviews", "Complete"],
  ["Incident response", "Needs evidence"],
  ["Vendor due diligence", "In progress"],
];

export default function Dashboard() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-300">
              Command Center
            </p>
            <h1 className="mt-2 text-4xl font-bold text-slate-950 dark:text-white">
              Dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
              Track audit readiness, evidence movement, vendor reviews, and risk posture.
            </p>
          </div>

          <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-semibold text-white transition hover:bg-blue-700">
            Start Review
            <ArrowUpRight size={18} />
          </button>
        </div>

        <section className="overflow-hidden rounded-2xl bg-slate-950 text-white shadow-2xl shadow-slate-900/10 dark:bg-blue-600">
          <div className="grid gap-6 p-6 lg:grid-cols-[1fr_340px] lg:p-8">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
                  <ShieldCheck size={26} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-100">SOC 2 Audit Readiness</p>
                  <h2 className="text-4xl font-bold">78% ready</h2>
                </div>
              </div>

              <div className="mt-8 h-3 rounded-full bg-white/15">
                <div className="h-3 w-[78%] rounded-full bg-white" />
              </div>

              <p className="mt-4 max-w-2xl text-blue-100">
                You are on track, but incident response evidence and vendor reviews still need attention.
              </p>
            </div>

            <div className="rounded-xl bg-white/10 p-5">
              <h3 className="font-bold">Readiness queue</h3>
              <div className="mt-4 space-y-3">
                {readiness.map(([label, status]) => (
                  <div key={label} className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-blue-100">{label}</span>
                    <span className="rounded-full bg-white/15 px-3 py-1 font-semibold text-white">
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                      {stat.label}
                    </p>
                    <h2 className="mt-2 text-4xl font-bold text-slate-950 dark:text-white">
                      {stat.value}
                    </h2>
                  </div>
                  <div className={`rounded-lg bg-slate-50 p-3 dark:bg-slate-800 ${stat.tone}`}>
                    <Icon size={22} />
                  </div>
                </div>
                <p className="mt-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  {stat.note}
                </p>
              </div>
            );
          })}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <ComplianceChart />
          <ActivityFeed />
        </section>
      </div>
    </AppShell>
  );
}
