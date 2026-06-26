import { Users } from "lucide-react";
import ComplianceModulePage from "../components/compliance/ComplianceModulePage";

export default function Employees() {
  return (
    <ComplianceModulePage
      eyebrow="Compliance"
      title="Employees"
      description="Monitor employee compliance readiness, training status, and access review ownership."
      icon={Users}
      actionLabel="Add Employee"
      metrics={[
        ["Active", "86"],
        ["Training due", "7"],
        ["Reviews", "12"],
      ]}
      items={[
        {
          title: "Security awareness training",
          description: "Follow up with employees who have not completed annual training.",
          owner: "People Ops",
          status: "Due",
        },
        {
          title: "Privileged access review",
          description: "Validate admin users and document manager approval.",
          owner: "IT",
          status: "In progress",
        },
        {
          title: "New hire compliance setup",
          description: "Confirm onboarding checklist and policy acknowledgements.",
          owner: "People Ops",
          status: "Ready",
        },
      ]}
    />
  );
}
