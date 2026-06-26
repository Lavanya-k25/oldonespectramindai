import { CheckSquare } from "lucide-react";
import ComplianceModulePage from "../components/compliance/ComplianceModulePage";

export default function Tasks() {
  return (
    <ComplianceModulePage
      eyebrow="Compliance"
      title="Tasks"
      description="Manage compliance tasks, blockers, due dates, and accountable owners."
      icon={CheckSquare}
      actionLabel="Create Task"
      metrics={[
        ["Open", "24"],
        ["Due soon", "6"],
        ["Blocked", "3"],
      ]}
      items={[
        {
          title: "Upload access review evidence",
          description: "Attach the June access review export to SOC 2 CC6.2.",
          owner: "IT",
          status: "Due soon",
        },
        {
          title: "Complete vendor renewal review",
          description: "Review updated security documentation for Slack.",
          owner: "Security",
          status: "Open",
        },
        {
          title: "Resolve logging retention blocker",
          description: "Confirm storage ownership and retention configuration.",
          owner: "Infrastructure",
          status: "Blocked",
        },
      ]}
    />
  );
}
