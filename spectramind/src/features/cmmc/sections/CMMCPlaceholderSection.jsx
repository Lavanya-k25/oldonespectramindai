import {
  CMMCEmptyState,
  CMMCSectionCard,
  CMMCStatusBadge,
} from "../components";

export default function CMMCPlaceholderSection({ module }) {
  return (
    <CMMCSectionCard
      title="Workspace foundation"
      description="Routing, naming, and shared layout are in place for this CMMC module."
      actions={<CMMCStatusBadge tone="info">{module.status}</CMMCStatusBadge>}
    >
      <CMMCEmptyState
        title={`${module.title} foundation`}
        description="The module shell is intentionally empty so the workflow can be implemented independently without coupling it to mock backend behavior."
      />
    </CMMCSectionCard>
  );
}
