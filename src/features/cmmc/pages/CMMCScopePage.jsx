import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import CMMCImplementationLayout from "../components/CMMCImplementationLayout";
import { useCMMCWorkspaceFilters } from "../components";

const sections = [
  {
    id: "inventory",
    title: "System Inventory",
    subtitle: "Cloud services, devices, servers, network",
    questions: [
      { id: "systemName", label: "What is the name of the system or enclave that will process CUI?", type: "text", placeholder: "Example: Contractor Managed IT Enclave" },
      { id: "hostingModel", label: "Where are scoped systems hosted?", type: "select", options: ["Select hosting model", "Commercial cloud", "On-premises", "Hybrid", "Managed service provider"] },
      { id: "cloudServices", label: "Which cloud services store, process, or transmit CUI?", type: "checkbox", options: ["Microsoft 365 GCC High", "Azure Government", "AWS GovCloud", "Google Workspace", "None"] },
      { id: "endpointCount", label: "How many endpoints are in the CUI boundary?", type: "select", options: ["Select range", "1-25", "26-100", "101-500", "500+"] },
      { id: "networkSegmentation", label: "Is the CUI environment segmented from corporate IT?", type: "radio", options: ["Yes", "No", "Partially"] },
      { id: "inventoryOwner", label: "Who owns the authoritative asset inventory?", type: "text", placeholder: "Example: IT Operations Manager" },
    ],
  },
  {
    id: "cuiFlow",
    title: "CUI Flow",
    subtitle: "How CUI is received, stored, and shared",
    questions: [
      { id: "receivedFrom", label: "How does your organization receive CUI?", type: "checkbox", options: ["DoD portal", "Prime contractor", "Encrypted email", "SFTP", "Physical media"] },
      { id: "storageLocations", label: "Where is CUI stored?", type: "checkbox", options: ["Document repository", "Engineering drawings system", "Email", "ERP", "Local file shares"] },
      { id: "transmissionMethods", label: "How is CUI transmitted externally?", type: "checkbox", options: ["Encrypted email", "Secure portal", "SFTP", "Managed file transfer", "Not transmitted externally"] },
      { id: "retentionPeriod", label: "What is the expected CUI retention period?", type: "select", options: ["Select retention", "Less than 1 year", "1-3 years", "3-7 years", "Contract-defined"] },
      { id: "flowDescription", label: "Summarize the primary CUI flow.", type: "textarea", placeholder: "Describe intake, storage, processing, sharing, and disposal." },
    ],
  },
  {
    id: "workforce",
    title: "Workforce",
    subtitle: "Headcount, remote workers, BYOD, IT support",
    questions: [
      { id: "cuiUsers", label: "How many users require access to CUI?", type: "select", options: ["Select range", "1-10", "11-50", "51-200", "200+"] },
      { id: "remoteAccess", label: "Do users access CUI remotely?", type: "radio", options: ["Yes", "No", "Limited exceptions"] },
      { id: "byod", label: "Are personally owned devices allowed in the CUI boundary?", type: "radio", options: ["Yes", "No", "Under review"] },
      { id: "supportModel", label: "Who administers scoped systems?", type: "checkbox", options: ["Internal IT", "Managed service provider", "Cloud service provider", "Engineering admin", "Security team"] },
    ],
  },
  {
    id: "connections",
    title: "External Connections",
    subtitle: "VPN, third-party IT, subcontractors, gov portals",
    questions: [
      { id: "vpnRequired", label: "Is VPN required for remote access to scoped systems?", type: "radio", options: ["Yes", "No", "Conditional"] },
      { id: "thirdPartyAccess", label: "Which third parties can access scoped systems?", type: "checkbox", options: ["MSP", "Cloud provider support", "Subcontractors", "Prime contractor", "None"] },
      { id: "govPortals", label: "Which government or prime portals are used for CUI exchange?", type: "checkbox", options: ["PIEE", "SPRS", "DIBNet", "Prime contractor portal", "Other"] },
      { id: "connectionReview", label: "How often are external connections reviewed?", type: "select", options: ["Select cadence", "Monthly", "Quarterly", "Annually", "Ad hoc"] },
      { id: "interconnectionNotes", label: "Document key interconnection boundaries.", type: "textarea", placeholder: "List VPNs, tunnels, APIs, portals, and support access paths." },
    ],
  },
  {
    id: "cuiType",
    title: "CUI Type",
    subtitle: "CUI categories, DFARS clause, export controls",
    questions: [
      { id: "cuiCategories", label: "What type(s) of CUI does your organization handle?", type: "checkbox", options: ["DoD CUI", "Technical Data / Engineering drawings", "Export Controlled (ITAR/EAR)", "Privacy / PII", "Law Enforcement Sensitive", "Financial / Procurement", "General CUI"] },
      { id: "dfarsClause", label: "Do your contracts include DFARS clause 252.204-7012?", type: "radio", options: ["Yes", "No", "Unsure"] },
      { id: "exportControlled", label: "Is any CUI marked export controlled or CUI//SP-ITAR / CUI//CTI?", type: "radio", options: ["Yes", "No", "Under review"] },
    ],
  },
];

const totalQuestions = sections.reduce((sum, section) => sum + section.questions.length, 0);

export default function CMMCScopePage() {
  const { searchQuery, resetVersion } = useCMMCWorkspaceFilters();
  return (
    <CMMCImplementationLayout>
      <CMMCScopeContent key={resetVersion} searchQuery={searchQuery} />
    </CMMCImplementationLayout>
  );
}

function CMMCScopeContent({ searchQuery }) {
  const [answers, setAnswers] = useState({});
  const [openSections, setOpenSections] = useState(() => ({
    inventory: true,
    cuiFlow: false,
    workforce: false,
    connections: false,
    cuiType: true,
  }));

  const answeredCount = useMemo(
    () => sections.flatMap((section) => section.questions).filter((question) => isAnswered(answers[question.id])).length,
    [answers]
  );
  const progress = Math.round((answeredCount / totalQuestions) * 100);
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const visibleSections = useMemo(() => {
    if (!normalizedSearch) {
      return sections;
    }

    return sections
      .map((section) => ({
        ...section,
        questions: section.questions.filter((question) =>
          [section.title, section.subtitle, question.label, question.placeholder, ...(question.options || [])]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearch)
        ),
      }))
      .filter((section) => section.questions.length > 0);
  }, [normalizedSearch]);

  const updateAnswer = (id, value) => {
    setAnswers((current) => ({ ...current, [id]: value }));
  };

  const toggleCheckbox = (id, option) => {
    setAnswers((current) => {
      const selected = Array.isArray(current[id]) ? current[id] : [];
      const next = selected.includes(option)
        ? selected.filter((item) => item !== option)
        : [...selected, option];

      return { ...current, [id]: next };
    });
  };

  return (
    <div className="mx-auto max-w-5xl">
        <section className="mb-4 rounded-lg bg-gradient-to-r from-[#22164b] to-[#694df4] p-6 text-white shadow-xl shadow-violet-950/15">
          <h1 className="text-2xl font-black tracking-normal">System Scope Questionnaire</h1>
          <p className="mt-2 text-sm font-semibold text-violet-100">
            Define your CUI boundary before the Gap Wizard. Answers should later populate the SSP.
          </p>
          <div className="mt-5 flex items-center gap-4">
            <div className="h-2 flex-1 rounded-full bg-white/25">
              <div
                className="h-2 rounded-full bg-white transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="min-w-max text-sm font-black">
              {answeredCount} / {totalQuestions} Answered
            </span>
          </div>
        </section>

        <div className="space-y-2">
          {visibleSections.map((section) => {
            const sectionAnswered = section.questions.filter((question) => isAnswered(answers[question.id])).length;
            const isOpen = openSections[section.id];

            return (
              <section
                key={section.id}
                className={`overflow-hidden rounded-lg border bg-white shadow-sm transition ${
                  isOpen ? "border-violet-300" : "border-slate-200"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenSections((current) => ({ ...current, [section.id]: !current[section.id] }))}
                  className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition hover:bg-slate-50"
                >
                  <span>
                    <span className="block text-xs font-black uppercase tracking-wide text-slate-800">
                      {section.title}
                    </span>
                    <span className="mt-1 block text-xs font-semibold text-slate-500">
                      {section.subtitle}
                    </span>
                  </span>
                  <span className="flex items-center gap-3 text-xs font-black text-slate-500">
                    {sectionAnswered}/{section.questions.length}
                    <ChevronDown
                      size={16}
                      className={`transition ${isOpen ? "rotate-180 text-violet-600" : ""}`}
                    />
                  </span>
                </button>

                {isOpen && (
                  <div className="space-y-5 border-t border-slate-100 px-5 py-5">
                    {section.questions.map((question) => (
                      <QuestionField
                        key={question.id}
                        question={question}
                        value={answers[question.id]}
                        onChange={updateAnswer}
                        onToggleCheckbox={toggleCheckbox}
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
    </div>
  );
}

function QuestionField({ question, value, onChange, onToggleCheckbox }) {
  return (
    <div>
      <label className="block text-sm font-black text-slate-800">{question.label}</label>
      {question.type === "text" && (
        <input
          type="text"
          value={value || ""}
          onChange={(event) => onChange(question.id, event.target.value)}
          placeholder={question.placeholder}
          className="mt-2 h-10 w-full rounded border border-slate-200 bg-white px-3 text-sm font-semibold outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
        />
      )}
      {question.type === "textarea" && (
        <textarea
          value={value || ""}
          onChange={(event) => onChange(question.id, event.target.value)}
          placeholder={question.placeholder}
          rows={3}
          className="mt-2 w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
        />
      )}
      {question.type === "select" && (
        <select
          value={value || ""}
          onChange={(event) => onChange(question.id, event.target.value)}
          className="mt-2 h-10 w-full rounded border border-slate-200 bg-white px-3 text-sm font-semibold outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
        >
          {question.options.map((option, index) => (
            <option key={option} value={index === 0 ? "" : option}>
              {option}
            </option>
          ))}
        </select>
      )}
      {question.type === "radio" && (
        <div className="mt-2 flex flex-wrap gap-2">
          {question.options.map((option) => (
            <label
              key={option}
              className={`inline-flex min-h-9 cursor-pointer items-center rounded border px-3 text-sm font-bold transition ${
                value === option
                  ? "border-violet-500 bg-violet-50 text-violet-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-violet-200"
              }`}
            >
              <input
                type="radio"
                name={question.id}
                value={option}
                checked={value === option}
                onChange={() => onChange(question.id, option)}
                className="sr-only"
              />
              {option}
            </label>
          ))}
        </div>
      )}
      {question.type === "checkbox" && (
        <div className="mt-2 flex flex-wrap gap-2">
          {question.options.map((option) => {
            const checked = Array.isArray(value) && value.includes(option);

            return (
              <label
                key={option}
                className={`inline-flex min-h-9 cursor-pointer items-center gap-2 rounded border px-3 text-sm font-bold transition ${
                  checked
                    ? "border-violet-500 bg-violet-50 text-violet-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-violet-200"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleCheckbox(question.id, option)}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                />
                {option}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

function isAnswered(value) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
}
