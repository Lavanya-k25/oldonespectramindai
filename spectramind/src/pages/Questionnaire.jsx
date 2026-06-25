import { ClipboardList } from "lucide-react";
import ComplianceModulePage from "../components/compliance/ComplianceModulePage";

export default function Questionnaire() {
  return (
    <ComplianceModulePage
      eyebrow="Compliance"
      title="Questionnaire"
      description="Organize security questionnaires, customer requests, and response ownership."
      icon={ClipboardList}
      actionLabel="New Questionnaire"
      metrics={[
        ["Open", "8"],
        ["In review", "5"],
        ["Completed", "21"],
      ]}
      items={[
        {
          title: "Enterprise security questionnaire",
          description: "Customer request covering access, encryption, and continuity controls.",
          owner: "Security Team",
          status: "In review",
        },
        {
          title: "Vendor assurance response",
          description: "Standard response pack for procurement security review.",
          owner: "Compliance",
          status: "Draft",
        },
        {
          title: "Data privacy worksheet",
          description: "Privacy and subprocessors questions for sales review.",
          owner: "Legal",
          status: "Ready",
        },
      ]}
    />
  );
}
