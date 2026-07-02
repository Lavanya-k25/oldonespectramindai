const STORAGE_KEY = "spectramind:onboarding-questionnaire";
const DEFAULT_FRAMEWORK_ID = "soc2-type-ii";

export const questionnaireSections = [
  {
    id: "organization",
    title: "Organization",
    questions: [
      mcq("companyStage", "What best describes your organization?", ["SaaS company", "Internal IT team", "Professional services", "Marketplace", "Other"], ["Governance"]),
      mcq("employeeCount", "How many people need access to company systems?", ["1-10", "11-50", "51-200", "201+", "No employees yet"], ["Workforce", "Identity"]),
      mcq("soc2Scope", "Which system is in scope for SOC 2?", ["Customer-facing production app", "Internal platform", "Data processing service", "Not decided yet"], ["Governance", "Infrastructure"]),
    ],
  },
  {
    id: "identity",
    title: "Identity and Access",
    questions: [
      mcq("identityProvider", "Which identity provider do you use?", ["Google Workspace", "Okta", "Microsoft Entra ID", "JumpCloud", "None"], ["Identity", "Access Control"]),
      mcq("mfaEnabled", "Is MFA enforced for users with access to production or customer data?", ["Yes, all users", "Only admins", "No", "Not sure"], ["Identity", "Access Control"]),
      mcq("accessReviews", "How often do you review user access?", ["Monthly", "Quarterly", "Annually", "Never", "Not sure"], ["Identity", "Access Control"]),
    ],
  },
  {
    id: "infrastructure",
    title: "Infrastructure and Cloud",
    questions: [
      mcq("usesCloud", "Do you host production systems in a cloud provider?", ["Yes", "No", "Not sure"], ["Infrastructure", "Cloud", "System Operations"]),
      mcq("cloudProvider", "Which cloud provider is primary?", ["AWS", "Azure", "Google Cloud", "Vercel/Netlify", "Other", "None"], ["Infrastructure", "Cloud"]),
      mcq("hasServers", "Do you manage servers, endpoints, containers, or cloud resources?", ["Yes", "No", "Not sure"], ["Infrastructure", "Endpoint", "Patch", "Vulnerability"]),
      mcq("vulnerabilityScanning", "Do you run vulnerability or configuration scans?", ["Yes, automated", "Manual only", "No", "Not sure"], ["Vulnerability", "Monitoring"]),
    ],
  },
  {
    id: "applicationSecurity",
    title: "Application Security",
    questions: [
      mcq("sourceControl", "Which source control platform do you use?", ["GitHub", "GitLab", "Bitbucket", "Azure DevOps", "None"], ["Change Management", "Application Security"]),
      mcq("changeApprovals", "Are production changes reviewed before deployment?", ["Yes, pull requests required", "Sometimes", "No", "Not sure"], ["Change Management", "Application Security"]),
      mcq("dependencyScanning", "Do you scan third-party dependencies?", ["Yes", "No", "Not sure"], ["Application Security", "Vulnerability"]),
    ],
  },
  {
    id: "monitoring",
    title: "Monitoring and Incident Response",
    questions: [
      mcq("monitoringTools", "Do you collect logs or security alerts?", ["Yes, centralized", "Basic application logs", "No", "Not sure"], ["Monitoring", "Logging", "System Operations"]),
      mcq("hasIncidentPlan", "Do you have an incident response plan?", ["Yes, approved", "Draft only", "No", "Not sure"], ["Incident Response"]),
      mcq("tabletopExercises", "Have you completed an incident response tabletop exercise in the last 12 months?", ["Yes", "No", "Not sure"], ["Incident Response"]),
    ],
  },
  {
    id: "backups",
    title: "Backups and Availability",
    questions: [
      mcq("hasBackups", "Are backups required for production or customer data?", ["Yes", "No", "Not sure"], ["Backup", "Business Continuity", "Availability"]),
      mcq("restoreTests", "Do you test backup restoration?", ["Yes, at least annually", "No", "Not sure"], ["Backup", "Business Continuity", "Availability"]),
      mcq("availabilityCommitment", "Do you make uptime or availability commitments to customers?", ["Yes", "No", "Not sure"], ["Availability", "Business Continuity"]),
    ],
  },
  {
    id: "vendors",
    title: "Vendor Management",
    questions: [
      mcq("usesVendors", "Do vendors process customer data or access company systems?", ["Yes", "No", "Not sure"], ["Vendor", "Vendor Management"]),
      mcq("vendorReviews", "Are critical vendors reviewed before onboarding or annually?", ["Yes", "No", "Not sure"], ["Vendor", "Vendor Management"]),
    ],
  },
  {
    id: "dataProtection",
    title: "Data Protection",
    questions: [
      mcq("storesSensitiveData", "Do you store confidential, personal, or customer data?", ["Yes", "No", "Not sure"], ["Data Protection", "Confidentiality", "Privacy"]),
      mcq("encryptionEnabled", "Is sensitive data encrypted in storage and transit?", ["Yes", "Partially", "No", "Not sure"], ["Data Protection", "Encryption"]),
      mcq("retentionRequirements", "Do you have retention or deletion requirements for customer data?", ["Yes", "No", "Not sure"], ["Data Protection", "Retention"]),
    ],
  },
  {
    id: "workforce",
    title: "Employee Security",
    questions: [
      mcq("securityTraining", "Do employees complete security awareness training?", ["Yes", "No", "Not sure"], ["Workforce", "Training", "Human Resources"]),
      mcq("remoteWork", "Do employees or contractors work remotely?", ["Yes", "No", "Not sure"], ["Remote Work", "Endpoint", "Workforce"]),
      mcq("offboarding", "Is offboarding tied to access removal?", ["Yes", "No", "Not sure"], ["Workforce", "Identity", "Access Control"]),
    ],
  },
];

function mcq(key, label, options, signals) {
  return { key, label, type: "mcq", options, signals };
}

export function loadQuestionnaireResponses(frameworkId = DEFAULT_FRAMEWORK_ID) {
  if (typeof window === "undefined") return {};

  try {
    return JSON.parse(window.localStorage.getItem(getQuestionnaireStorageKey(frameworkId)) || "{}");
  } catch {
    return {};
  }
}

export function saveQuestionnaireResponses(responses, frameworkId = DEFAULT_FRAMEWORK_ID) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getQuestionnaireStorageKey(frameworkId), JSON.stringify(responses));
  window.dispatchEvent(new Event("spectramind:questionnaire-updated"));
}

export function hasQuestionnaireAnswers(responses) {
  return Object.values(responses || {}).some(Boolean);
}

export function getQuestionnaireSignals(responses) {
  const signals = [];
  const add = (...items) => signals.push(...items);
  const answered = (key) => Boolean(responses?.[key]);
  const positive = (key) => !["No", "None", "Never"].includes(responses?.[key]);

  if (answered("companyStage") || answered("soc2Scope")) add("Governance");
  if (positive("employeeCount")) add("Workforce", "Human Resources");
  if (positive("identityProvider") || answered("mfaEnabled") || answered("accessReviews") || answered("offboarding")) add("Identity", "Access Control");
  if (responses.usesCloud === "Yes" || positive("cloudProvider")) add("Infrastructure", "Cloud", "System Operations");
  if (responses.hasServers === "Yes" || answered("vulnerabilityScanning")) add("Infrastructure", "Endpoint", "Patch", "Vulnerability");
  if (positive("sourceControl") || answered("changeApprovals") || answered("dependencyScanning")) add("Application Security", "Change Management", "Secure Development");
  if (answered("monitoringTools")) add("Monitoring", "Logging", "System Operations");
  if (answered("hasIncidentPlan") || answered("tabletopExercises")) add("Incident Response");
  if (responses.hasBackups === "Yes" || answered("restoreTests") || responses.availabilityCommitment === "Yes") add("Backup", "Business Continuity", "Availability");
  if (responses.usesVendors === "Yes" || answered("vendorReviews")) add("Vendor", "Vendor Management");
  if (responses.storesSensitiveData === "Yes" || answered("encryptionEnabled") || responses.retentionRequirements === "Yes") add("Data Protection", "Confidentiality", "Privacy", "Encryption", "Retention");
  if (answered("securityTraining") || answered("remoteWork")) add("Training", "Remote Work", "Workforce");

  return [...new Set(signals)];
}

export function getQuestionnaireNotApplicableSignals(responses) {
  const signals = [];
  const add = (...items) => signals.push(...items);

  if (responses.usesCloud === "No" && responses.hasServers === "No") add("Cloud", "Infrastructure", "Patch", "Vulnerability", "Endpoint");
  if (responses.cloudProvider === "None") add("Cloud");
  if (responses.sourceControl === "None") add("Application Security", "Change Management", "Secure Development");
  if (responses.hasBackups === "No" && responses.availabilityCommitment === "No") add("Backup", "Business Continuity", "Availability");
  if (responses.usesVendors === "No") add("Vendor", "Vendor Management");
  if (responses.storesSensitiveData === "No") add("Data Protection", "Confidentiality", "Privacy", "Encryption", "Retention");
  if (responses.remoteWork === "No") add("Remote Work");
  if (responses.employeeCount === "No employees yet") add("Workforce", "Training", "Human Resources", "Remote Work");

  return [...new Set(signals)];
}

export function getQuestionnaireApplicability(item, responses) {
  if (!hasQuestionnaireAnswers(responses)) return "Library";

  const text = itemSearchText(item);
  const applicableSignals = getQuestionnaireSignals(responses);
  const notApplicableSignals = getQuestionnaireNotApplicableSignals(responses);
  const alwaysApplicableSignals = ["Governance", "Control Environment", "Risk Assessment", "Monitoring Activities", "Control Activities"];

  if (alwaysApplicableSignals.some((signal) => text.includes(signal.toLowerCase()))) return "Applicable";
  if (notApplicableSignals.some((signal) => text.includes(signal.toLowerCase()))) return "Not applicable";
  if (applicableSignals.some((signal) => text.includes(signal.toLowerCase()))) return "Applicable";

  return "Not applicable";
}

export function isRelevantToQuestionnaire(item, responses) {
  return getQuestionnaireApplicability(item, responses) === "Applicable";
}

export function getImplementationRecommendation(item, responses) {
  if (!isRelevantToQuestionnaire(item, responses)) return "";

  return "Applicable based on onboarding questionnaire responses.";
}

function itemSearchText(item) {
  return [
    item.category,
    item.title,
    item.description,
    item.evidenceType,
    item.trustServiceCriteria,
    item.criteria?.join(" "),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getQuestionnaireStorageKey(frameworkId = DEFAULT_FRAMEWORK_ID) {
  return frameworkId === DEFAULT_FRAMEWORK_ID ? STORAGE_KEY : `${STORAGE_KEY}:${frameworkId}`;
}
