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
import { useProgressData } from "../core/adapters/useProgressData";

export default function Dashboard() {
  // All dashboard metrics are calculated by ProgressEngineService —
  // no values are hardcoded. Change your workspace in the Implementation
  // page and the dashboard will reflect the updated numbers.
  const { summary } = useProgressData("soc-2");

  const auditReadiness = Math.round(summary.auditReadinessScore ?? 0);
  const overallScore = Math.round(summary.overallComplianceScore ?? 0);
  const highRisks = summary.riskBreakdown?.High ?? summary.riskBreakdown?.high ?? 0;
  const criticalRisks = summary.riskBreakdown?.Critical ?? summary.riskBreakdown?.critical ?? 0;
  const openRisks = summary.riskCoverage?.total - summary.riskCoverage?.completed;
  const evidenceTotal = summary.evidenceCoverage?.total ?? 0;
  const pendingCount = summary.pendingEvidence?.length ?? 0;
  const overdueCount = summary.overdueTasks?.length ?? 0;

  // Stats cards — same structure as before, values now from ProgressEngine
  const stats = [
    {
      label: "Compliance Score",
      value: `${overallScore}%`,
      note: `${summary.controlCompletion?.completed ?? 0} of ${summary.controlCompletion?.total ?? 0} controls done`,
      icon: ShieldCheck,
      tone: "text-emerald-600",
    },
    {
      label: "Evidence Files",
      value: String(evidenceTotal),
      note: `${pendingCount} pending review`,
      icon: FileCheck2,
      tone: "text-blue-700",
    },
    {
      label: "Open Risks",
      value: String(isNaN(openRisks) ? 0 : openRisks),
      note: `${highRisks + criticalRisks} high/critical`,
      icon: AlertTriangle,
      tone: "text-rose-600",
    },
    {
      label: "Overdue Tasks",
      value: String(overdueCount),
      note: overdueCount === 0 ? "None overdue" : `${overdueCount} past due date`,
      icon: Building2,
      tone: "text-violet-600",
    },
  ];

  // Readiness queue — shows top 3 missing controls (falling back to static
  // labels if the workspace has no tracked items yet)
  const missingControls = summary.missingControls ?? [];
  const readiness = missingControls.length > 0
    ? missingControls.slice(0, 3).map((c) => [c.id, "Needs attention"])
    : [
        ["Access reviews", "Needs attention"],
        ["Incident response", "Needs evidence"],
        ["Vendor due diligence", "In progress"],
      ];

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-blue-700">
              Command Center
            </p>
            <h1 className="mt-2 text-4xl font-black text-slate-900">
              Dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              Track audit readiness, evidence movement, vendor reviews, and risk posture.
            </p>
          </div>

          <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-600/35 bg-[linear-gradient(135deg,rgba(255,246,216,.96),rgba(216,180,109,.74)_48%,rgba(168,117,52,.86))] px-5 py-3 font-bold text-slate-900 shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5">
            Start Review
            <ArrowUpRight size={18} />
          </button>
        </div>

        <section className="overflow-hidden rounded-lg border border-white/80 bg-white/58 text-slate-900 shadow-2xl shadow-slate-900/10 backdrop-blur">
          <div className="grid gap-6 p-6 lg:grid-cols-[1fr_340px] lg:p-8">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-blue-600/20 bg-blue-50 text-blue-700">
                  <ShieldCheck size={26} />
                </div>
                <div>
                  <p className="text-sm font-bold text-blue-700">SOC 2 Audit Readiness</p>
                  <h2 className="text-4xl font-black">{auditReadiness}% ready</h2>
                </div>
              </div>

              <div className="mt-8 h-3 rounded-full bg-slate-100">
                <div
                  className="h-3 rounded-full bg-[linear-gradient(90deg,#8eaf99,#d8b46d,#9d6f38)] transition-all duration-700"
                  style={{ width: `${auditReadiness}%` }}
                />
              </div>

              <p className="mt-4 max-w-2xl text-slate-600">
                {auditReadiness >= 80
                  ? "You are well on track. Keep completing outstanding evidence and controls."
                  : "Keep going — complete outstanding controls and evidence to improve your audit readiness score."}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-[#fffdf8]/70 p-5">
              <h3 className="font-black">Readiness queue</h3>
              <div className="mt-4 space-y-3">
                {readiness.map(([label, status]) => (
                  <div key={label} className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-slate-600">{label}</span>
                    <span className="rounded-full bg-blue-50 px-3 py-1 font-bold text-blue-800">
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
                className="rounded-lg border border-white/75 bg-white/62 p-5 shadow-xl shadow-slate-900/5 backdrop-blur"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      {stat.label}
                    </p>
                    <h2 className="mt-2 text-4xl font-black text-slate-900">
                      {stat.value}
                    </h2>
                  </div>
                  <div className={`rounded-lg border border-slate-200 bg-[#fffdf8]/70 p-3 ${stat.tone}`}>
                    <Icon size={22} />
                  </div>
                </div>
                <p className="mt-4 flex items-center gap-2 text-sm text-slate-600">
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
