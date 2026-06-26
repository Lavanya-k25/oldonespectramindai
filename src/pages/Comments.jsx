import { MessageSquare } from "lucide-react";
import ComplianceModulePage from "../components/compliance/ComplianceModulePage";

export default function Comments() {
  return (
    <ComplianceModulePage
      eyebrow="Compliance"
      title="Comments"
      description="Review compliance discussions, decision notes, and open questions by owner."
      icon={MessageSquare}
      actionLabel="Add Comment"
      metrics={[
        ["Open", "16"],
        ["Mentions", "5"],
        ["Resolved", "42"],
      ]}
      items={[
        {
          title: "Clarify incident response test evidence",
          description: "Auditor requested supporting notes from the tabletop exercise.",
          owner: "Security",
          status: "Open",
        },
        {
          title: "Vendor review exception",
          description: "Document risk acceptance language for GitHub renewal.",
          owner: "Compliance",
          status: "Mentioned",
        },
        {
          title: "Policy approval comment",
          description: "Leadership approved the updated password policy language.",
          owner: "Admin",
          status: "Resolved",
        },
      ]}
    />
  );
}
