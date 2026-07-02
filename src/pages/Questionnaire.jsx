import { ClipboardList } from "lucide-react";
import { useState } from "react";
import AppShell from "../components/layout/AppShell";
import {
  loadQuestionnaireResponses,
} from "../data/questionnaireEngine";
import { useQuestionnaireSections } from "../core/adapters/useQuestionnaireData";
import { saveOrgQuestionnaireAnswers } from "../core/adapters/useOrganizationStore";

export default function Questionnaire() {
  // questionnaireSections are now sourced from the FrameworkEngine’s read-only
  // JSON library rather than the hardcoded legacy questionnaireEngine.js data.
  // The MCQ rendering logic below is completely unchanged.
  const questionnaireSections = useQuestionnaireSections();
  const [responses, setResponses] = useState(() => loadQuestionnaireResponses());

  const updateResponse = (key, value) => {
    const nextResponses = { ...responses, [key]: value };
    setResponses(nextResponses);
    // Route through OrganizationEngine so answers are stored as auditable
    // org-level metadata alongside the legacy localStorage key.
    saveOrgQuestionnaireAnswers(nextResponses);
  };

  const answeredCount = Object.values(responses).filter(Boolean).length;
  const totalCount = questionnaireSections.reduce((count, section) => count + section.questions.length, 0);

  return (
    <AppShell>
      <div className="space-y-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-blue-700">Compliance</p>
            <h1 className="mt-2 text-4xl font-black tracking-normal text-slate-900">
              Onboarding Questionnaire
            </h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              Personalize SOC 2 implementation priorities without changing the framework library.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-blue-600/20 bg-blue-50 px-4 py-3 text-sm font-black text-blue-800">
            <ClipboardList size={18} />
            {answeredCount}/{totalCount} answered
          </div>
        </div>

        <section className="grid gap-4 xl:grid-cols-2">
          {questionnaireSections.map((section) => (
            <article key={section.id} className="rounded-lg border border-white/75 bg-white/62 p-5 shadow-xl shadow-slate-900/5 backdrop-blur">
              <h2 className="text-xl font-black text-slate-900">{section.title}</h2>
              <div className="mt-4 grid gap-4">
                {section.questions.map((question) => {
                  const [legacyKey, legacyLabel, legacyType] = Array.isArray(question) ? question : [];
                  const key = question.key || legacyKey;
                  const label = question.label || legacyLabel;
                  const type = question.type || legacyType;
                  const options = question.options || (type === "boolean" ? ["Yes", "No"] : []);

                  return (
                    <div key={key} className="grid gap-2 text-sm font-bold text-slate-700">
                      <p>{label}</p>
                      {type === "mcq" || type === "boolean" ? (
                        <div className="flex flex-wrap gap-2">
                          {options.map((option) => {
                            const isSelected = responses[key] === option;

                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => updateResponse(key, option)}
                                className={`rounded-lg border px-3 py-2 text-left text-sm font-black transition ${
                                  isSelected
                                    ? "border-blue-600 bg-blue-50 text-blue-800 shadow-sm"
                                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                }`}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <input
                          value={responses[key] || ""}
                          onChange={(event) => updateResponse(key, event.target.value)}
                          className="h-11 rounded-lg border border-slate-200 bg-white px-3 font-semibold text-slate-800 outline-none focus:border-blue-500"
                          placeholder={label}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
