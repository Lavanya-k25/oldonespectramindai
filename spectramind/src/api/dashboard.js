import { apiRequest, isApiEnabled } from "./client";
export const loadDashboard = frameworkId => isApiEnabled ? apiRequest(`/api/v1/dashboard?frameworkId=${encodeURIComponent(frameworkId)}`) : null;
