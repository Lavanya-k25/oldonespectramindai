import { CMMCPageLayout } from "../components";
import { useCMMCModule } from "../hooks";
import { CMMCPlaceholderSection } from "../sections";

const fallbackModule = {
  title: "CMMC Workspace",
  description: "CMMC workspace foundation.",
  status: "Foundation",
};

export default function CMMCModulePlaceholderPage({ moduleId }) {
  const module = useCMMCModule(moduleId) || fallbackModule;

  return (
    <CMMCPageLayout
      eyebrow="CMMC Workspace"
      title={module.title}
      description={module.description}
    >
      <CMMCPlaceholderSection module={module} />
    </CMMCPageLayout>
  );
}
