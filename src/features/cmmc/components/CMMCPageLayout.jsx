import AppShell from "../../../components/layout/AppShell";
import CMMCHeader from "./CMMCHeader";

export default function CMMCPageLayout({
  eyebrow,
  title,
  description,
  actions,
  children,
}) {
  return (
    <AppShell>
      <div className="space-y-6">
        <CMMCHeader
          eyebrow={eyebrow}
          title={title}
          description={description}
          actions={actions}
        />
        {children}
      </div>
    </AppShell>
  );
}
