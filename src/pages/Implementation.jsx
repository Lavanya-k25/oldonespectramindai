import { Wrench } from "lucide-react";
import ComplianceModulePage from "../components/compliance/ComplianceModulePage";

export default function Implementation() {
  return (
    <ComplianceModulePage
      eyebrow="Compliance"
      title="Implementation"
      description="Track control implementation work from assignment through evidence-ready completion."
      icon={Wrench}
      actionLabel="Add Implementation"
      metrics={[
        ["Planned", "14"],
        ["Active", "9"],
        ["Blocked", "2"],
      ]}
      items={[
        {
          title: "MFA enforcement rollout",
          description: "Complete enforcement for production and administrative users.",
          owner: "IT",
          status: "Active",
        },
        {
          title: "Logging retention policy",
          description: "Finalize retention scope and export configuration evidence.",
          owner: "Infrastructure",
          status: "Blocked",
        },
        {
          title: "Quarterly access review",
          description: "Implement review cadence and manager attestation workflow.",
          owner: "Compliance",
          status: "Planned",
        },
      ]}
    />
  );
}
