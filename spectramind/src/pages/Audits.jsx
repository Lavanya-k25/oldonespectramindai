import { ClipboardCheck } from "lucide-react";
import ComplianceModulePage from "../components/compliance/ComplianceModulePage";

export default function Audits() {
  return (
    <ComplianceModulePage
      eyebrow="Compliance"
      title="Audits"
      description="Plan audit milestones, evidence requests, auditor conversations, and review readiness."
      icon={ClipboardCheck}
      actionLabel="Plan Audit"
      metrics={[
        ["Upcoming", "2"],
        ["Requests", "18"],
        ["Ready", "78%"],
      ]}
      items={[
        {
          title: "SOC 2 Type II readiness review",
          description: "Prepare evidence package and scope control owner walkthroughs.",
          owner: "Compliance",
          status: "Scheduled",
        },
        {
          title: "Vendor evidence sampling",
          description: "Collect review artifacts for vendors in audit scope.",
          owner: "Security",
          status: "Open",
        },
        {
          title: "Management review",
          description: "Prepare executive summary for readiness sign-off.",
          owner: "Leadership",
          status: "Draft",
        },
      ]}
    />
  );
}
