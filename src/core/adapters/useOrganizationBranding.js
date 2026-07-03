import { useEffect, useState } from "react";

export const APP_NAME = "SpectraMind.ai";
export const ORGANIZATION_LOGO_STORAGE_KEY = "spectramind:organization-logo";
export const ORGANIZATION_BRANDING_EVENT = "spectramind:organization-branding-updated";

export function readOrganizationLogo() {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    return window.localStorage.getItem(ORGANIZATION_LOGO_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

export function saveOrganizationLogo(logoDataUrl) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (logoDataUrl) {
      window.localStorage.setItem(ORGANIZATION_LOGO_STORAGE_KEY, logoDataUrl);
    } else {
      window.localStorage.removeItem(ORGANIZATION_LOGO_STORAGE_KEY);
    }

    window.dispatchEvent(new Event(ORGANIZATION_BRANDING_EVENT));
  } catch {
    window.dispatchEvent(new Event(ORGANIZATION_BRANDING_EVENT));
  }
}

export function useOrganizationLogo() {
  const [logo, setLogo] = useState(readOrganizationLogo);

  useEffect(() => {
    const refreshLogo = () => setLogo(readOrganizationLogo());

    window.addEventListener(ORGANIZATION_BRANDING_EVENT, refreshLogo);
    window.addEventListener("storage", refreshLogo);

    return () => {
      window.removeEventListener(ORGANIZATION_BRANDING_EVENT, refreshLogo);
      window.removeEventListener("storage", refreshLogo);
    };
  }, []);

  return logo;
}
