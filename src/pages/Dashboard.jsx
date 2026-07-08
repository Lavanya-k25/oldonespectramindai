import {
  AlertTriangle,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  FileCheck2,
  ListChecks,
  ScrollText,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ActivityFeed from "../components/dashboard/ActivityFeed";
import ComplianceChart from "../components/dashboard/ComplianceChart";
import AppShell from "../components/layout/AppShell";
import { useComplianceState } from "../compliance/ComplianceStateContext";
import { CMMC_FRAMEWORK_ID, resolveFrameworkId } from "../core/engines/framework-engine/frameworkRegistry";
import { useCMMCActivityHistory, useCMMCSPRSCalculation, useCMMCWorkflowState } from "../features/cmmc/hooks";
import { formatCMMCActivityName } from "../features/cmmc/services";
import ActiveFrameworkRequired from "../framework/ActiveFrameworkRequired";
import { useFrameworkWorkspace } from "../framework/FrameworkWorkspaceContext";
import { buildCrossModuleTarget } from "../navigation/crossModuleNavigation";

export default function Dashboard() {
  const { activeFramework } = useFrameworkWorkspace();

  if (!activeFramework) {
    return <ActiveFrameworkRequired />;
  }

  return <DashboardContent key={activeFramework.id} activeFramework={activeFramework} />;
}

function DashboardContent({ activeFramework }) {
  const navigate = useNavigate();
  const cmmcSPRS = useCMMCSPRSCalculation();
  const cmmcActivities = useCMMCActivityHistory();
  const { controlWorkflowFields } = useCMMCWorkflowState();
  const isCMMCWorkspace = resolveFrameworkId(activeFramework.id) === CMMC_FRAMEWORK_ID;
  const {
    audit,
    controls,
    implementations,
    evidence,
    policies,
    risks,
    tests,
    tasks,
  } = useComplianceState();

  const implementationRows = [
    ...(implementations.controls || []),
    ...(implementations.tests || []),
    ...(implementations.policies || []),
    ...(implementations.risks || []),
    ...(implementations.populations || []),
  ];
  const completedImplementations = implementationRows.filter(isComplete).length;
  const totalImplementations = implementationRows.length;
  const cmmcCompletionPercentage = clampPercent(cmmcSPRS.completionPercentage);
  const cmmcCompliancePercentage = clampPercent(cmmcSPRS.compliancePercentage ?? cmmcSPRS.completionPercentage);
  const frameworkProgress = isCMMCWorkspace
    ? cmmcCompletionPercentage
    : totalImplementations ? Math.round((completedImplementations / totalImplementations) * 100) : 0;
  const auditReadiness = isCMMCWorkspace ? cmmcCompletionPercentage : Math.round(audit.readiness ?? 0);
  const overallScore = isCMMCWorkspace ? cmmcCompliancePercentage : Math.round(audit.complianceScore ?? frameworkProgress);
  const applicableControls = controls.filter((control) => control.applicable).length;
  const cmmcEvidenceAttachmentStats = buildCMMCEvidenceAttachmentStats(controlWorkflowFields, cmmcSPRS.controls);
  const evidenceTotal = isCMMCWorkspace
    ? cmmcEvidenceAttachmentStats.totalAttachments
    : evidence.filter((record) => !record.deletedAt).length;
  const missingEvidenceTotal = isCMMCWorkspace
    ? cmmcEvidenceAttachmentStats.missingControls
    : audit.pendingEvidence?.length || 0;
  const policiesTotal = policies.length;
  const policiesPublished = policies.filter((policy) => policy.status === "Active" || isComplete(policy)).length;
  const openRisks = risks.filter((risk) => risk.applicable && ["Open", "In Progress"].includes(risk.treatmentStatus || risk.status)).length;
  const testsTotal = tests.length;
  const completedTests = tests.filter(isComplete).length;
  const openTasks = tasks.filter((task) => !isComplete(task)).length;
  const dashboardActivities = isCMMCWorkspace ? cmmcActivities : (audit.timeline || []);
  const recentActivityCount = dashboardActivities.length;
  const recentActivityNote = recentActivityCount
    ? isCMMCWorkspace ? formatCMMCActivityName(dashboardActivities[0]) : "Latest compliance updates"
    : "No activity yet";
  const highRisks = risks.filter((risk) => ["High", "Critical"].includes(risk.riskLevel || risk.severity) && ["Open", "In Progress"].includes(risk.treatmentStatus || risk.status)).length;

  const stats = [
    ...(isCMMCWorkspace
      ? buildCMMCDashboardStats(cmmcSPRS, cmmcCompliancePercentage, cmmcCompletionPercentage)
      : [
          {
            label: "Compliance Score",
            value: `${overallScore}%`,
            note: `${completedImplementations} of ${totalImplementations} implementation items complete`,
            icon: ShieldCheck,
            tone: "text-emerald-600",
            target: { itemType: "Audit", itemId: "compliance-score" },
          },
          {
            label: "Audit Readiness",
            value: `${auditReadiness}%`,
            note: `${audit.openFindings || 0} open audit findings`,
            icon: CheckCircle2,
            tone: "text-blue-700",
            target: { itemType: "Audit", itemId: "readiness" },
          },
          {
            label: "Framework Progress",
            value: `${frameworkProgress}%`,
            note: `${activeFramework.name} active workspace`,
            icon: Building2,
            tone: "text-violet-600",
            target: { itemType: "Implementation", itemId: "framework-progress" },
          },
          {
            label: "Total Implementations",
            value: String(totalImplementations),
            note: `${completedImplementations} completed`,
            icon: Wrench,
            tone: "text-slate-700",
            target: { itemType: "Implementation", itemId: "" },
          },
          {
            label: "Completed Implementations",
            value: String(completedImplementations),
            note: `${Math.max(totalImplementations - completedImplementations, 0)} remaining`,
            icon: CheckCircle2,
            tone: "text-emerald-600",
            target: { itemType: "Implementation", itemId: "" },
          },
          {
            label: "Applicable Controls",
            value: String(applicableControls),
            note: `${controls.length} total controls`,
            icon: ShieldCheck,
            tone: "text-blue-700",
            target: { itemType: "Control", itemId: "" },
          },
        ]),
    {
      label: "Evidence Count",
      value: String(evidenceTotal),
      note: `${missingEvidenceTotal} missing evidence items`,
      icon: FileCheck2,
      tone: "text-blue-700",
      target: { itemType: "Evidence", itemId: "repository" },
    },
    {
      label: "Policies",
      value: String(policiesTotal),
      note: `${policiesPublished} published`,
      icon: ScrollText,
      tone: "text-amber-700",
      target: { itemType: "Policy", itemId: "" },
    },
    {
      label: "Open Risks",
      value: String(isNaN(openRisks) ? 0 : openRisks),
      note: `${highRisks} high/critical`,
      icon: AlertTriangle,
      tone: "text-rose-600",
      target: { itemType: "Risk", itemId: "" },
    },
    {
      label: "Tests",
      value: String(testsTotal),
      note: `${completedTests} completed`,
      icon: ListChecks,
      tone: "text-indigo-700",
      target: { itemType: "Test", itemId: "" },
    },
    {
      label: "Tasks",
      value: String(openTasks),
      note: `${tasks.length} generated tasks`,
      icon: Building2,
      tone: "text-violet-600",
      target: { itemType: "Task", itemId: "" },
    },
    {
      label: "Recent Activity",
      value: String(recentActivityCount),
      note: recentActivityNote,
      icon: CheckCircle2,
      tone: "text-emerald-600",
      target: { itemType: "Audit", itemId: "activity" },
    },
  ];

  const readiness = (audit.checklist || []).slice(0, 3).map((item) => [
    item.relatedItemId || item.name,
    item.status || item.category,
  ]);
  const chartData = buildDashboardChartData({
    complianceScore: overallScore,
    auditReadiness,
    frameworkProgress,
    evidenceCoverage: isCMMCWorkspace ? cmmcEvidenceAttachmentStats.coveragePercentage : Math.round(audit.evidenceCoverage || 0),
    testsProgress: testsTotal ? Math.round((completedTests / testsTotal) * 100) : 0,
    policyProgress: policiesTotal ? Math.round((policiesPublished / policiesTotal) * 100) : 0,
  });
  const chartDelta = chartData.length > 1 ? chartData.at(-1).score - chartData[0].score : 0;
  const navigateToCard = (stat) => {
    const target = buildCrossModuleTarget({
      activeFramework,
      itemId: stat.target.itemId,
      itemType: stat.target.itemType,
      moduleContext: `Dashboard:${stat.label}`,
      mode: "view",
    });
    navigate(target.path, { state: target.state });
  };

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
                  <p className="text-sm font-bold text-blue-700">{activeFramework.name} Audit Readiness</p>
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
                {!readiness.length && (
                  <div className="text-sm font-semibold text-slate-500">No open readiness items.</div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <button
                type="button"
                key={stat.label}
                onClick={() => navigateToCard(stat)}
                className="rounded-lg border border-white/75 bg-white/62 p-5 text-left shadow-xl shadow-slate-900/5 backdrop-blur transition hover:-translate-y-0.5 hover:bg-blue-50/40"
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
              </button>
            );
          })}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <ComplianceChart data={chartData} delta={chartDelta} />
          <ActivityFeed />
        </section>
      </div>
    </AppShell>
  );
}

function isComplete(item) {
  return ["complete", "completed", "implemented", "approved", "active", "mitigated", "accepted"].includes(
    String(item?.status || item?.applicabilityStatus || item?.treatmentStatus || "").toLowerCase()
  );
}

function buildCMMCDashboardStats(cmmcSPRS, compliancePercentage, completionPercentage) {
  const totalControls = Number(cmmcSPRS.totalControls) || 0;
  const completedControls = Number(cmmcSPRS.completedControls) || 0;
  const inProgressControls = Number(cmmcSPRS.inProgressControls) || 0;
  const notStartedControls = Number(cmmcSPRS.notStartedControls) || 0;

  return [
    {
      label: "Compliance Percentage",
      value: `${compliancePercentage}%`,
      note: `${completedControls} of ${totalControls} controls compliant`,
      icon: ShieldCheck,
      tone: "text-emerald-600",
      target: { itemType: "Audit", itemId: "compliance-score" },
    },
    {
      label: "Completion Percentage",
      value: `${completionPercentage}%`,
      note: `${completedControls} of ${totalControls} controls completed`,
      icon: CheckCircle2,
      tone: "text-blue-700",
      target: { itemType: "Audit", itemId: "readiness" },
    },
    {
      label: "Total Controls",
      value: String(totalControls),
      note: `${completedControls} completed`,
      icon: Building2,
      tone: "text-violet-600",
      target: { itemType: "Control", itemId: "" },
    },
    {
      label: "Completed Controls",
      value: String(completedControls),
      note: `${Math.max(totalControls - completedControls, 0)} remaining`,
      icon: Wrench,
      tone: "text-slate-700",
      target: { itemType: "Control", itemId: "" },
    },
    {
      label: "In Progress Controls",
      value: String(inProgressControls),
      note: `${notStartedControls} not started`,
      icon: CheckCircle2,
      tone: "text-emerald-600",
      target: { itemType: "Control", itemId: "" },
    },
    {
      label: "Not Started Controls",
      value: String(notStartedControls),
      note: `${totalControls} total controls`,
      icon: ShieldCheck,
      tone: "text-blue-700",
      target: { itemType: "Control", itemId: "" },
    },
  ];
}

function buildCMMCEvidenceAttachmentStats(controlWorkflowFields = {}, controls = []) {
  const controlIds = new Set(
    (controls || [])
      .map((control) => control.controlId)
      .filter(Boolean)
  );
  Object.keys(controlWorkflowFields || {}).forEach((controlId) => controlIds.add(controlId));

  const attachmentCountsByControl = Array.from(controlIds).map((controlId) => {
    const attachments = controlWorkflowFields?.[controlId]?.attachments;
    return Array.isArray(attachments) ? attachments.length : 0;
  });
  const totalAttachments = attachmentCountsByControl.reduce((total, count) => total + count, 0);
  const missingControls = attachmentCountsByControl.filter((count) => count === 0).length;
  const controlsWithAttachments = attachmentCountsByControl.length - missingControls;

  return {
    totalAttachments,
    missingControls,
    coveragePercentage: attachmentCountsByControl.length
      ? Math.round((controlsWithAttachments / attachmentCountsByControl.length) * 100)
      : 0,
  };
}

function buildDashboardChartData(scores) {
  return [
    ["Compliance", scores.complianceScore],
    ["Audit", scores.auditReadiness],
    ["Framework", scores.frameworkProgress],
    ["Evidence", scores.evidenceCoverage],
    ["Tests", scores.testsProgress],
    ["Policies", scores.policyProgress],
  ].map(([label, score]) => ({ label, score: Math.max(0, Math.min(100, Number(score) || 0)) }));
}

function clampPercent(value) {
  return Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
}
