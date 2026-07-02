const STORAGE_KEY = "spectramind:organization-workspace";

export function loadOrganizationWorkspace() {
  if (typeof window === "undefined") return {};

  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveOrganizationWorkspace(workspaceData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspaceData));
  window.dispatchEvent(new Event("spectramind:workspace-updated"));
}
