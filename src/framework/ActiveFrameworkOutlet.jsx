import { Outlet } from "react-router-dom";
import ActiveFrameworkRequired from "./ActiveFrameworkRequired";
import { useFrameworkWorkspace } from "./FrameworkWorkspaceContext";

export default function ActiveFrameworkOutlet({ frameworkSlug }) {
  const { activeFramework } = useFrameworkWorkspace();

  if (!activeFramework || (frameworkSlug && activeFramework.slug !== frameworkSlug)) {
    return <ActiveFrameworkRequired />;
  }

  return <Outlet />;
}
