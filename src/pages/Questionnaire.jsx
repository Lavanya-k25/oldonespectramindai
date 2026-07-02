import {
  ArrowLeft,
  Check,
  ChevronDown,
  FileText,
  UploadCloud,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import { loadQuestionnaireResponses } from "../data/questionnaireEngine";
import { useQuestionnaireSections } from "../core/adapters/useQuestionnaireData";
import { saveOrgQuestionnaireAnswers } from "../core/adapters/useOrganizationStore";
import {
  DEFAULT_FRAMEWORK_ID,
  ISO27001_FRAMEWORK_ID,
  getFrameworkLibrary,
  resolveFrameworkId,
} from "../core/engines/framework-engine/frameworkRegistry";

const FRAMEWORK_SLUGS = {
  [DEFAULT_FRAMEWORK_ID]: "soc-2",
  [ISO27001_FRAMEWORK_ID]: "iso-27001",
};

export default function Questionnaire() {
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const selectedFrameworkId = resolveFrameworkId(params.get("framework")) || DEFAULT_FRAMEWORK_ID;
  const selectedQuestionnaireId = params.get("questionnaire");
  const soc2Sections = useQuestionnaireSections(DEFAULT_FRAMEWORK_ID);
  const isoSections = useQuestionnaireSections(ISO27001_FRAMEWORK_ID);

  return (
    <AppShell>
      {selectedQuestionnaireId ? (
        <QuestionnaireDetail
          key={`${selectedFrameworkId}:${selectedQuestionnaireId}`}
          frameworkId={selectedFrameworkId}
          sectionId={selectedQuestionnaireId}
          sections={selectedFrameworkId === ISO27001_FRAMEWORK_ID ? isoSections : soc2Sections}
        />
      ) : (
        <QuestionnaireLanding
          sectionsByFramework={{
            [DEFAULT_FRAMEWORK_ID]: soc2Sections,
            [ISO27001_FRAMEWORK_ID]: isoSections,
          }}
        />
      )}
    </AppShell>
  );
}

function QuestionnaireLanding({ sectionsByFramework }) {
  const frameworkGroups = [
    {
      id: DEFAULT_FRAMEWORK_ID,
      title: "SOC 2 Trial",
      sections: sectionsByFramework[DEFAULT_FRAMEWORK_ID] ?? [],
    },
    {
      id: ISO27001_FRAMEWORK_ID,
      title: "ISO 27001:2022",
      sections: sectionsByFramework[ISO27001_FRAMEWORK_ID] ?? [],
    },
  ];

  return (
    <div className="max-w-3xl space-y-5">
      <header>
        <h1 className="text-2xl font-bold leading-7 tracking-normal text-slate-950">Questionnaires</h1>
        <p className="mt-2 text-xs font-medium leading-5 text-slate-500">
          Please complete the questions below before a compliance expert can start working on your account.
        </p>
      </header>

      <div className="space-y-4">
        {frameworkGroups.map((framework) => (
          <FrameworkQuestionnaireGroup key={framework.id} framework={framework} />
        ))}
      </div>
    </div>
  );
}

function FrameworkQuestionnaireGroup({ framework }) {
  const [responses] = useState(() => loadQuestionnaireResponses(framework.id));
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <section className="space-y-2">
      <button
        type="button"
        onClick={() => setIsExpanded((current) => !current)}
        className="flex items-center gap-2"
        aria-expanded={isExpanded}
      >
        <ChevronDown
          size={13}
          className={`text-slate-500 transition-transform ${isExpanded ? "rotate-180" : ""}`}
        />
        <h2 className="text-base font-bold leading-6 tracking-normal text-slate-950">{framework.title}</h2>
      </button>

      {isExpanded ? (
        <div className="overflow-hidden rounded-md border border-amber-200 bg-amber-50/70">
          {framework.sections.length ? (
            framework.sections.map((section) => {
              const status = getSectionStatus(section, responses);
              const slug = FRAMEWORK_SLUGS[framework.id] ?? framework.id;

              return (
                <Link
                  key={section.id}
                  to={`/questionnaire?framework=${slug}&questionnaire=${section.id}`}
                  className="flex items-center justify-between gap-4 border-b border-amber-100 bg-amber-50/50 px-4 py-3 transition last:border-b-0 hover:bg-amber-50"
                >
                  <span>
                    <span className="block text-xs font-bold leading-5 text-slate-800">{section.title}</span>
                    <span className="block text-xs font-medium leading-4 text-slate-500">
                      {status.completed
                        ? "This questionnaire is successfully completed."
                        : `${status.answered}/${status.total} questions completed.`}
                    </span>
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-bold ${
                      status.completed
                        ? "border-amber-200 bg-amber-50 text-amber-900"
                        : "border-amber-300 bg-amber-50 text-amber-900"
                    }`}
                  >
                    <FileText size={13} />
                    {status.completed ? "Completed" : "Start"}
                  </span>
                </Link>
              );
            })
          ) : (
            <div className="bg-amber-50/60 px-4 py-3 text-xs font-semibold leading-5 text-stone-500">
              Questionnaires are not required for this framework.
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}

function QuestionnaireDetail({ frameworkId, sectionId, sections }) {
  const section = sections.find((candidate) => candidate.id === sectionId) ?? sections[0];
  const frameworkName =
    getFrameworkLibrary(frameworkId)?.framework?.shortName ||
    getFrameworkLibrary(frameworkId)?.framework?.name ||
    "Framework";
  const [responses, setResponses] = useState(() => loadQuestionnaireResponses(frameworkId));
  const [isQuestionsExpanded, setIsQuestionsExpanded] = useState(true);

  if (!section) {
    return (
      <div className="max-w-3xl">
        <Link to="/questionnaire" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-700">
          <ArrowLeft size={14} />
          Back to Questionnaires
        </Link>
        <div className="mt-6 rounded-md border border-amber-200 bg-amber-50/60 p-4 text-xs font-semibold text-slate-600">
          No questionnaire is configured for {frameworkName}.
        </div>
      </div>
    );
  }

  const updateResponse = (key, value) => {
    const nextResponses = { ...responses, [key]: value };
    setResponses(nextResponses);
    saveOrgQuestionnaireAnswers(nextResponses, frameworkId);
  };
  const status = getSectionStatus(section, responses);
  const progress = status.total ? Math.round((status.answered / status.total) * 100) : 0;

  return (
    <div className="max-w-3xl space-y-4">
      <header>
        <h1 className="text-2xl font-bold leading-7 tracking-normal text-slate-950">{section.title}</h1>
        <Link
          to="/questionnaire"
          className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-700"
        >
          <ArrowLeft size={13} />
          Back to Questionnaires
        </Link>
      </header>

      <div className="flex items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#080047] via-[#342cff] to-[#c4f7ff] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs font-bold text-slate-700">{progress}%</span>
      </div>

      <section className="space-y-3">
        <button
          type="button"
          onClick={() => setIsQuestionsExpanded((current) => !current)}
          className="flex w-full items-center justify-between border-b border-slate-200 pb-2"
          aria-expanded={isQuestionsExpanded}
        >
          <span className="inline-flex items-center gap-2">
            <ChevronDown
              size={13}
              className={`text-slate-500 transition-transform ${isQuestionsExpanded ? "rotate-180" : ""}`}
            />
            <h2 className="text-lg font-bold leading-6 tracking-normal text-slate-950">Questions</h2>
          </span>
          {status.completed ? <Check size={15} className="text-blue-600" /> : null}
        </button>

        {isQuestionsExpanded
          ? section.questions.map((question) => (
              <QuestionCard
                key={question.key}
                question={question}
                responses={responses}
                updateResponse={updateResponse}
              />
            ))
          : null}
      </section>
    </div>
  );
}

function QuestionCard({ question, responses, updateResponse }) {
  const answered = isQuestionAnswered(question, responses);

  return (
    <article className="rounded-md border border-sky-100 bg-sky-50/70 p-4 shadow-sm shadow-slate-900/5">
      <QuestionPrompt question={question} answered={answered} />
      <QuestionInput question={question} responses={responses} updateResponse={updateResponse} />

      {question.subQuestions?.length ? (
        <div className="mt-3 space-y-3 border-t border-sky-100 pt-3">
          {question.subQuestions.map((subQuestion) => (
            <div key={subQuestion.key} className="rounded-md border border-sky-100 bg-sky-50/60 p-3">
              <QuestionPrompt question={subQuestion} answered={isQuestionAnswered(subQuestion, responses)} compact />
              <QuestionInput question={subQuestion} responses={responses} updateResponse={updateResponse} />
            </div>
          ))}
        </div>
      ) : null}

      {question.uploadEnabled ? <UploadBlock question={question} responses={responses} updateResponse={updateResponse} /> : null}
    </article>
  );
}

function QuestionPrompt({ question, answered, compact = false }) {
  return (
    <div className="mb-2.5 flex items-start justify-between gap-4">
      <div className="space-y-1.5">
        <p className={`${compact ? "text-xs" : "text-sm"} font-bold leading-5 text-slate-800`}>
          {question.required ? <span className="mr-0.5 text-red-500">*</span> : null}
          {question.label}
        </p>
        {question.helpText ? (
          <p className="whitespace-pre-line text-xs font-medium leading-5 text-slate-600">{question.helpText}</p>
        ) : null}
        {question.description ? (
          <p className="text-xs font-medium leading-5 text-slate-500">{question.description}</p>
        ) : null}
      </div>
      {answered ? <Check size={15} className="mt-1 shrink-0 text-blue-600" /> : null}
    </div>
  );
}

function QuestionInput({ question, responses, updateResponse }) {
  if (question.type === "radio") {
    return (
      <div className="flex flex-wrap gap-3">
        {question.options.map((option) => (
          <label key={option} className="inline-flex items-center gap-2 text-xs font-medium text-slate-600">
            <input
              type="radio"
              name={question.key}
              checked={responses[question.key] === option}
              onChange={() => updateResponse(question.key, option)}
              className="h-3.5 w-3.5 border-slate-300 text-blue-700 focus:ring-blue-500"
            />
            {option}
          </label>
        ))}
      </div>
    );
  }

  if (question.type === "checkbox") {
    const selected = Array.isArray(responses[question.key]) ? responses[question.key] : [];

    return (
      <div className="grid gap-2">
        {question.options.map((option) => (
          <label key={option} className="inline-flex items-center gap-2 text-xs font-medium text-slate-600">
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => {
                const nextValue = selected.includes(option)
                  ? selected.filter((item) => item !== option)
                  : [...selected, option];
                updateResponse(question.key, nextValue);
              }}
              className="h-3.5 w-3.5 rounded border-slate-300 text-blue-700 focus:ring-blue-500"
            />
            {option}
          </label>
        ))}
      </div>
    );
  }

  if (question.type === "system_table") {
    return <SystemTable question={question} value={responses[question.key]} onChange={(value) => updateResponse(question.key, value)} />;
  }

  if (question.type === "file") {
    return <UploadBlock question={question} responses={responses} updateResponse={updateResponse} standalone />;
  }

  if (question.type === "text") {
    return (
      <input
        value={responses[question.key] || ""}
        onChange={(event) => updateResponse(question.key, event.target.value)}
        placeholder={question.placeholder || "Type your answer"}
        className="h-10 w-full rounded-md border border-sky-100 bg-white/70 px-3 text-xs font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
      />
    );
  }

  return (
    <textarea
      value={responses[question.key] || ""}
      onChange={(event) => updateResponse(question.key, event.target.value)}
      placeholder={question.placeholder || "Type your answer"}
      rows={3}
      className="min-h-20 w-full resize-y rounded-md border border-sky-100 bg-white/70 px-3 py-2.5 text-xs font-medium leading-5 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
    />
  );
}

function UploadBlock({ question, responses, updateResponse, standalone = false }) {
  const uploadKey = `${question.key}__files`;
  const files = Array.isArray(responses[uploadKey]) ? responses[uploadKey] : [];

  return (
    <div className={standalone ? "" : "mt-4"}>
      <p className="mb-2 text-xs font-bold text-slate-700">Please upload files if needed</p>
      <label className="flex min-h-20 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-amber-200 bg-amber-50/60 px-3 py-4 text-center transition hover:border-amber-300 hover:bg-amber-50">
        <UploadCloud size={18} className="mb-2 text-slate-500" />
        <span className="text-xs font-semibold text-slate-600">Drag your file(s) here or Browse</span>
        <span className="mt-1 text-xs font-medium text-slate-400">You can upload up to 10 files</span>
        <input
          type="file"
          multiple
          className="sr-only"
          onChange={(event) => {
            const selectedFiles = Array.from(event.target.files ?? []).map((file) => file.name);
            updateResponse(uploadKey, [...files, ...selectedFiles].slice(0, 10));
            event.target.value = "";
          }}
        />
      </label>
      {files.length ? (
        <div className="mt-3 grid gap-2">
          {files.map((fileName) => (
            <div key={fileName} className="rounded-md border border-amber-100 bg-amber-50/60 px-3 py-2 text-xs font-semibold text-slate-600">
              {fileName}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SystemTable({ question, value, onChange }) {
  const fields = question.fields?.length ? question.fields : ["System Name", "Description"];
  const rows = Array.isArray(value) && value.length ? value : [createEmptySystem(fields)];

  const updateCell = (rowIndex, field, nextValue) => {
    const nextRows = rows.map((row, index) => (index === rowIndex ? { ...row, [field]: nextValue } : row));
    onChange(nextRows);
  };

  return (
    <div className="space-y-3">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="overflow-hidden rounded-md border border-sky-100 bg-white/70">
          <div className="flex items-center justify-between border-b border-sky-100 bg-sky-50/70 px-3 py-2">
            <p className="text-xs font-bold text-slate-700">System #{rowIndex + 1}</p>
            <button type="button" className="text-xs font-semibold text-slate-500 hover:text-blue-700">
              Edit
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {fields.map((field) => (
              <label key={field} className="grid gap-2 px-3 py-2.5 md:grid-cols-[190px_1fr] md:items-start">
                <span className="text-xs font-bold leading-5 text-slate-700">{field}</span>
                <textarea
                  rows={field === "System Usage Description" || field === "Client Service Impact by the System" ? 2 : 1}
                  value={row[field] || ""}
                  onChange={(event) => updateCell(rowIndex, field, event.target.value)}
                  className="min-h-8 resize-y rounded-md border border-transparent bg-transparent text-xs font-medium leading-5 text-slate-700 outline-none focus:border-sky-100 focus:bg-white/70"
                />
              </label>
            ))}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...rows, createEmptySystem(fields)])}
        className="w-full rounded-md border border-dashed border-sky-100 bg-white/60 px-3 py-2.5 text-xs font-bold text-slate-500 transition hover:border-blue-400 hover:text-blue-700"
      >
        + Add System
      </button>
    </div>
  );
}

function createEmptySystem(fields) {
  return fields.reduce((system, field) => ({ ...system, [field]: "" }), {});
}

function getSectionStatus(section, responses) {
  const total = section.questions.length;
  const answered = section.questions.filter((question) => isQuestionAnswered(question, responses)).length;
  return {
    total,
    answered,
    completed: total > 0 && answered === total,
  };
}

function isQuestionAnswered(question, responses) {
  const value = responses[question.key];
  if (Array.isArray(value)) {
    if (question.type === "system_table") {
      return value.some((row) => Object.values(row).some((entry) => String(entry ?? "").trim()));
    }
    return value.length > 0;
  }
  return String(value ?? "").trim().length > 0;
}
