import {
  ArrowRight,
  ArrowUpDown,
  X,
  ChevronDown,
  Download,
  Filter,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  UploadCloud,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import { useFrameworkData } from "../core/adapters/useFrameworkData";
import { useRelationshipGraph, getLinkedItemsFromGraph } from "../core/adapters/useRelationshipGraph";
import { useOrganizationStore } from "../core/adapters/useOrganizationStore";
import { frameworks } from "../data/mockData";
import { loadOrganizationWorkspace } from "../data/organizationWorkspace";
import {
  getQuestionnaireApplicability,
  getImplementationRecommendation,
  isRelevantToQuestionnaire,
  loadQuestionnaireResponses,
} from "../data/questionnaireEngine";

const implementationTabs = [
  "Risk Scenarios",
  "Controls",
  "Tests",
  "Policies",
  "Populations",
];

const emptyImplementationData = {
  risks: [],
  controls: [],
  tests: [],
  policies: [],
  populations: [],
};

const riskColumns = [
  { key: "id", label: "ID" },
  { key: "title", label: "Description" },
  { key: "status", label: "Status" },
  { key: "owner", label: "Assigned To" },
  { key: "category", label: "Category" },
  { key: "initialRiskScore", label: "Initial Risk Score" },
  { key: "residualRiskScore", label: "Residual Risk Score" },
  { key: "controls", label: "Controls" },
  { key: "comments", label: "Comment" },
];

const controlColumns = [
  { key: "id", label: "ID" },
  { key: "title", label: "Description" },
  { key: "status", label: "Status" },
  { key: "owner", label: "Assigned To" },
  { key: "dueDate", label: "Due Date" },
  { key: "category", label: "Category" },
  { key: "trustServiceCriteria", label: "Trust Service Criteria" },
  { key: "mappedTests", label: "Tests" },
  { key: "mappedRisks", label: "Risk Scenarios" },
];

const testColumns = [
  { key: "id", label: "ID" },
  { key: "title", label: "Title" },
  { key: "status", label: "Status" },
  { key: "owner", label: "Assigned To" },
  { key: "dueDate", label: "Due Date" },
  { key: "category", label: "Category" },
  { key: "comments", label: "Comments" },
];

const policyColumns = [
  { key: "id", label: "ID" },
  { key: "title", label: "Policy" },
  { key: "status", label: "Status" },
  { key: "owner", label: "Assigned To" },
  { key: "dueDate", label: "Due Date" },
  { key: "category", label: "Category" },
  { key: "comments", label: "Comments" },
];

const populationColumns = [
  { key: "id", label: "ID" },
  { key: "title", label: "Description" },
  { key: "status", label: "Status" },
  { key: "owner", label: "Assigned To" },
  { key: "dueDate", label: "Due Date" },
  { key: "category", label: "Category" },
  { key: "mappedTests", label: "Tests" },
  { key: "comments", label: "Comments" },
];

export default function Implementation() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("Tests");

  // OrganizationEngine now owns workspace state — routes status changes through
  // trackControlStatus() with full audit history, while keeping the legacy
  // flat-map format that all downstream components already read.
  const { workspaceData, saveWorkspaceItem } = useOrganizationStore();

  const [questionnaireResponses, setQuestionnaireResponses] = useState(() => loadQuestionnaireResponses());
  const selectedFramework = getSelectedFramework(location);
  // FrameworkEngine is now the source of truth — the framework library JSON
  // files are never modified. useFrameworkData returns the same shape that
  // getFrameworkLibrary() previously returned so all downstream components
  // continue to work without any changes.
  const rawImplementationData = useFrameworkData(selectedFramework?.slug);

  const implementationData = useMemo(() => {
    if (!rawImplementationData || !rawImplementationData.controls) {
      return { controls: [], risks: [], tests: [], policies: [], populations: [] };
    }

    const risks = rawImplementationData.risks.map((r) => {
      const saved = (workspaceData && workspaceData[r.id]) ?? {};
      const initialLikelihood = saved.initialLikelihood ?? 3;
      const initialImpact = saved.initialImpact ?? 5;
      const residualLikelihood = saved.residualLikelihood ?? 1;
      const residualImpact = saved.residualImpact ?? 3;
      return {
        ...r,
        owner: saved.assignments?.owner || "Unassigned",
        status: saved.status || r.status || "Ready",
        initialRiskScore: initialLikelihood * initialImpact,
        residualRiskScore: residualLikelihood * residualImpact,
        comments: saved.comments?.length || "",
      };
    });

    const controls = rawImplementationData.controls.map((c) => {
      const saved = (workspaceData && workspaceData[c.id]) ?? {};
      return {
        ...c,
        owner: saved.assignments?.owner || "Unassigned",
        status: saved.status || c.status || "Ready",
        comments: saved.comments?.length || "",
      };
    });

    const tests = rawImplementationData.tests.map((t) => {
      const saved = (workspaceData && workspaceData[t.id]) ?? {};
      return {
        ...t,
        owner: saved.assignments?.owner || "Unassigned",
        status: saved.status || t.status || "Ready",
        comments: saved.comments?.length || "",
      };
    });

    const policies = rawImplementationData.policies.map((p) => {
      const saved = (workspaceData && workspaceData[p.id]) ?? {};
      return {
        ...p,
        owner: saved.assignments?.owner || "Unassigned",
        status: saved.status || p.status || "Ready",
        comments: saved.comments?.length || "",
      };
    });

    return {
      ...rawImplementationData,
      risks,
      controls,
      tests,
      policies,
    };
  }, [rawImplementationData, workspaceData]);

  // RelationshipEngine is seeded from the framework mappings JSON so the
  // workspace panel resolves linked items via graph lookups instead of
  // hardcoded array references.
  const relationshipGraph = useRelationshipGraph(selectedFramework?.slug);

  const [workspaceItem, setWorkspaceItem] = useState(() =>
    getWorkspaceItemFromLocation(window.location, implementationData)
  );
  const selectWorkspaceItem = (item, { replace = false } = {}) => {
    setWorkspaceItem(item);
    updateWorkspaceHistory(item, replace);
  };

  useEffect(() => {
    const syncWorkspaceFromUrl = () => {
      setWorkspaceItem(getWorkspaceItemFromLocation(window.location, implementationData));
    };

    window.addEventListener("popstate", syncWorkspaceFromUrl);

    return () => window.removeEventListener("popstate", syncWorkspaceFromUrl);
  }, [implementationData]);

  useEffect(() => {
    const refreshQuestionnaireResponses = () => setQuestionnaireResponses(loadQuestionnaireResponses());
    window.addEventListener("spectramind:questionnaire-updated", refreshQuestionnaireResponses);
    window.addEventListener("storage", refreshQuestionnaireResponses);

    return () => {
      window.removeEventListener("spectramind:questionnaire-updated", refreshQuestionnaireResponses);
      window.removeEventListener("storage", refreshQuestionnaireResponses);
    };
  }, []);

  if (!selectedFramework) {
    return <SelectFrameworkScreen />;
  }

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex flex-col gap-4 rounded-lg border border-white/75 bg-white/62 px-5 py-4 shadow-xl shadow-slate-900/5 backdrop-blur lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-normal text-slate-900">
              Compliance Implementation
            </h1>
            <p className="mt-3 text-2xl font-black text-slate-900">
              {selectedFramework.name}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50">
              Description of System
            </button>
            <ExportMenu data={implementationData} />
          </div>
        </div>

        <section
          className={`grid gap-4 xl:items-start ${
            workspaceItem ? "xl:grid-cols-[minmax(0,1fr)_320px]" : "xl:grid-cols-1"
          }`}
        >
          <div className="min-w-0 space-y-3">
            <OverviewRings data={implementationData} workspaceData={workspaceData} />
            <ImplementationTabs activeTab={activeTab} onTabChange={setActiveTab} />

            <TabPanel
              activeTab={activeTab}
              selectedFramework={selectedFramework}
              data={implementationData}
              questionnaireResponses={questionnaireResponses}
              workspaceData={workspaceData}
              onSelectWorkspaceItem={selectWorkspaceItem}
            />
          </div>

          {workspaceItem && (
            <ImplementationWorkspace
              key={workspaceItem.id}
              item={workspaceItem}
              framework={selectedFramework}
              data={implementationData}
              questionnaireResponses={questionnaireResponses}
              savedState={workspaceData && workspaceData[workspaceItem.id]}
              relationshipGraph={relationshipGraph}
              onWorkspaceStateChange={(itemId, nextState) => {
                // Route through OrganizationEngine for proper audit tracking,
                // then the hook syncs both the engine snapshot and the legacy
                // flat-map so all downstream reads continue to work.
                saveWorkspaceItem(itemId, nextState);
              }}
              onSelectItem={selectWorkspaceItem}
              onClose={() => {
                setWorkspaceItem(null);
                updateWorkspaceHistory(null);
              }}
            />
          )}
        </section>
      </div>
    </AppShell>
  );
}

function SelectFrameworkScreen() {
  return (
    <AppShell>
      <div className="space-y-7">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-blue-700">
            Compliance Implementation
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-normal text-slate-900">
            Select a Framework
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Choose a framework to open its implementation workspace.
          </p>
        </div>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {frameworks.map((framework) => {
            const slug = framework.slug || slugifyFramework(framework.name);

            return (
              <Link
                key={framework.id}
                to={`/implementation?framework=${slug}`}
                state={{ framework }}
                className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <ShieldCheck size={22} />
                </div>
                <h2 className="mt-5 text-2xl font-bold text-slate-950">
                  {framework.name}
                </h2>
                <p className="mt-1 text-slate-500">{framework.status}</p>
                <div className="mt-5 flex items-center justify-between text-sm font-semibold text-slate-700">
                  <span>{framework.progress}% complete</span>
                  <ArrowRight size={18} />
                </div>
              </Link>
            );
          })}
        </section>
      </div>
    </AppShell>
  );
}

function OverviewRings({ data, workspaceData }) {
  const riskProgress = progressFromRows(data.risks, (row) => isCompletedStatus(row, workspaceData));
  const controlProgress = progressFromRows(data.controls, (row) => isCompletedStatus(row, workspaceData));
  const testProgress = progressFromRows(data.tests, (row) => isCompletedStatus(row, workspaceData));
  const policyProgress = progressFromRows(data.policies, (row) => isApprovedStatus(row, workspaceData));
  const evidenceProgress = progressFromRows(
    [...data.controls, ...data.tests, ...data.policies],
    (row) => hasUploadedEvidence(row, workspaceData)
  );
  const auditReadiness = Math.round(
    (controlProgress + testProgress + evidenceProgress + policyProgress) / 4
  );

  const rings = [
    {
      label: "Risk Progress",
      value: riskProgress,
      caption: `${completedCount(data.risks, (row) => isCompletedStatus(row, workspaceData))}/${data.risks.length} completed`,
      tone: "#60a5fa",
    },
    {
      label: "Control Progress",
      value: controlProgress,
      caption: `${completedCount(data.controls, (row) => isCompletedStatus(row, workspaceData))}/${data.controls.length} completed`,
      tone: "#3b82f6",
    },
    {
      label: "Test Progress",
      value: testProgress,
      caption: `${completedCount(data.tests, (row) => isCompletedStatus(row, workspaceData))}/${data.tests.length} completed`,
      tone: "#22d3ee",
    },
    {
      label: "Policy Progress",
      value: policyProgress,
      caption: `${completedCount(data.policies, (row) => isApprovedStatus(row, workspaceData))}/${data.policies.length} approved`,
      tone: "#8b5cf6",
    },
    {
      label: "Audit Readiness",
      value: auditReadiness,
      caption: "Controls, tests, evidence, policies",
      tone: "#facc15",
    },
  ];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <button className="inline-flex items-center gap-2 text-sm font-black text-slate-800">
          <span className="text-slate-500">⌄</span>
          Overview
        </button>
        <p className="ml-6 text-xs font-semibold text-slate-400">
          Organization progress from implementation status, evidence, and policy approval
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {rings.map((ring) => (
          <div
            key={ring.label}
            className="flex flex-col items-center justify-center border-slate-100 py-2 xl:border-r xl:last:border-r-0"
          >
            <p className="mb-2 text-xs font-black text-slate-600">
              {ring.label}
            </p>
            <div
              className="grid h-24 w-24 place-items-center rounded-full"
              style={{
                background: `conic-gradient(${ring.tone} ${ring.value * 3.6}deg, #f1f5f9 0deg)`,
              }}
            >
              <div className="grid h-20 w-20 place-items-center rounded-full bg-white">
                <span className="text-xl font-black text-slate-950">
                  {ring.value}%
                </span>
              </div>
            </div>
            <p className="mt-2 text-xs font-semibold text-slate-400">
              {ring.caption}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ImplementationTabs({ activeTab, onTabChange }) {
  return (
    <div className="overflow-x-auto border-b border-slate-200 bg-transparent">
      <div className="flex min-w-max gap-6 px-1">
        {implementationTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            className={`border-b-2 px-0 py-3 text-sm font-black transition ${
              activeTab === tab
                ? "border-slate-950 text-slate-950"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}

function ExportMenu({ compact = false, data = emptyImplementationData }) {
  const options = [
    ["Export all", "all", [...data.risks, ...data.tests, ...data.controls, ...data.policies, ...data.populations]],
    ["Export tests", "tests", data.tests],
    ["Export controls", "controls", data.controls],
    ["Export risk scenarios", "risk-scenarios", data.risks],
    ["Export policies", "policies", data.policies],
    ["Export populations", "populations", data.populations],
  ];

  return (
    <details className="relative">
      <summary
        className={`inline-flex cursor-pointer list-none items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 ${
          compact ? "h-11 px-3" : "px-4 py-2"
        }`}
      >
        <Download size={16} />
        Export
        {!compact && <ArrowRight size={15} />}
      </summary>
      <div className="absolute right-0 z-30 mt-2 w-52 rounded-lg border border-slate-200 bg-white p-2 shadow-xl">
        {options.map(([label, fileName, rows]) => (
          <button
            key={fileName}
            type="button"
            onClick={() => downloadExcelFile(fileName, rows)}
            className="block w-full rounded-lg px-3 py-2 text-left text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            {label}
          </button>
        ))}
      </div>
    </details>
  );
}

function TabPanel({ activeTab, selectedFramework, data, questionnaireResponses, workspaceData, onSelectWorkspaceItem }) {
  if (activeTab === "Controls") {
    return (
      <ControlsSection rows={data.controls} questionnaireResponses={questionnaireResponses} workspaceData={workspaceData} selectedFramework={selectedFramework} onSelectWorkspaceItem={onSelectWorkspaceItem} />
    );
  }

  if (activeTab === "Risk Scenarios") {
    return (
      <RiskScenariosSection rows={data.risks} questionnaireResponses={questionnaireResponses} workspaceData={workspaceData} selectedFramework={selectedFramework} onSelectWorkspaceItem={onSelectWorkspaceItem} />
    );
  }

  if (activeTab === "Tests") {
    return (
      <TestsSection rows={data.tests} questionnaireResponses={questionnaireResponses} workspaceData={workspaceData} selectedFramework={selectedFramework} onSelectWorkspaceItem={onSelectWorkspaceItem} />
    );
  }

  if (activeTab === "Policies") {
    return (
      <PoliciesSection rows={data.policies} questionnaireResponses={questionnaireResponses} workspaceData={workspaceData} selectedFramework={selectedFramework} onSelectWorkspaceItem={onSelectWorkspaceItem} />
    );
  }

  return (
    <PopulationSection rows={data.populations} questionnaireResponses={questionnaireResponses} workspaceData={workspaceData} selectedFramework={selectedFramework} onSelectWorkspaceItem={onSelectWorkspaceItem} />
  );
}

function RiskScenariosSection({ rows, questionnaireResponses, workspaceData, selectedFramework, onSelectWorkspaceItem }) {
  const [query, setQuery] = useState("");
  const [filterBy, setFilterBy] = useState("All");
  const [sortBy, setSortBy] = useState("dueDate");
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState(
    riskColumns.reduce((columns, column) => ({ ...columns, [column.key]: true }), {})
  );

  const filteredRisks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return rows
      .filter((risk) => {
        const matchesQuery =
          !normalizedQuery ||
          Object.values(risk).join(" ").toLowerCase().includes(normalizedQuery);
        const matchesFilter =
          filterBy === "All" ||
          risk.status === filterBy ||
          risk.severity === filterBy ||
          risk.category === filterBy;

        return matchesQuery && matchesFilter;
      })
      .sort((a, b) => compareRiskRows(a, b, sortBy));
  }, [filterBy, query, rows, sortBy]);

  const resetTable = () => {
    setQuery("");
    setFilterBy("All");
    setSortBy("dueDate");
    setSelectedRisk(null);
  };

  return (
    <section className="overflow-hidden rounded-lg border border-white/75 bg-white/62 shadow-xl shadow-slate-900/5 backdrop-blur">
      <div className="border-b border-slate-100 px-6 py-5">
        <SectionHeader
          title="Risk Scenarios"
          description={`Search, review, and prioritize mapped risk scenarios for ${selectedFramework.name}.`}
        />
      </div>

      <div className="border-b border-slate-100 p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <label className="relative min-w-0 flex-1">
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm font-semibold text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500"
              placeholder="Search risks by ID, title, owner, reviewer, or category"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <label className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm">
              <Filter size={16} />
              <select
                value={filterBy}
                onChange={(event) => setFilterBy(event.target.value)}
                className="bg-transparent font-bold outline-none"
              >
                <option value="All">Filter</option>
                <option value="High">High severity</option>
                <option value="Medium">Medium severity</option>
                <option value="Low">Low severity</option>
                <option value="Open">Open</option>
                <option value="In Progress">In progress</option>
                <option value="In Review">In review</option>
                <option value="Ready">Ready</option>
              </select>
            </label>

            <label className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm">
              <ArrowUpDown size={16} />
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="bg-transparent font-bold outline-none"
              >
                <option value="dueDate">Sort by due date</option>
                <option value="severity">Sort by severity</option>
                <option value="status">Sort by status</option>
                <option value="title">Sort by title</option>
              </select>
            </label>

            <details className="relative">
              <summary className="inline-flex h-11 cursor-pointer list-none items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50">
                <SlidersHorizontal size={16} />
                Column Settings
              </summary>
              <div className="absolute right-0 z-20 mt-2 w-56 rounded-lg border border-slate-200 bg-white p-3 shadow-xl">
                <p className="mb-2 text-xs font-black uppercase tracking-widest text-slate-500">
                  Columns
                </p>
                <div className="space-y-2">
                  {riskColumns.map((column) => (
                    <label
                      key={column.key}
                      className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={visibleColumns[column.key]}
                        onChange={() =>
                          setVisibleColumns((current) => ({
                            ...current,
                            [column.key]: !current[column.key],
                          }))
                        }
                      />
                      {column.label}
                    </label>
                  ))}
                </div>
              </div>
            </details>

            <ExportMenu compact data={{ ...emptyImplementationData, risks: rows }} />

            <button
              type="button"
              onClick={resetTable}
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[980px] w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50/90 text-xs font-black uppercase tracking-wider text-slate-500">
            <tr>
              <th className="w-12 border-b border-slate-200 px-4 py-3">
                <input type="checkbox" aria-label="Select all risk scenarios" />
              </th>
              {riskColumns
                .filter((column) => visibleColumns[column.key])
                .map((column) => (
                  <th key={column.key} className="border-b border-slate-200 px-4 py-3">
                    {column.label}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody className="bg-white/60">
            {filteredRisks.map((risk) => {
              const applicability = getQuestionnaireApplicability(risk, questionnaireResponses);
              const isDisabled = applicability === "Not applicable";

              return (
              <tr
                key={risk.id}
                onClick={() => {
                  if (isDisabled) return;
                  setSelectedRisk(risk);
                  onSelectWorkspaceItem(createWorkspaceItem("Risk", risk));
                }}
                onKeyDown={(event) => {
                  if (!isDisabled && (event.key === "Enter" || event.key === " ")) {
                    setSelectedRisk(risk);
                    onSelectWorkspaceItem(createWorkspaceItem("Risk", risk));
                  }
                }}
                role={isDisabled ? undefined : "button"}
                tabIndex={isDisabled ? -1 : 0}
                aria-disabled={isDisabled}
                className={`border-b border-slate-100 transition last:border-0 ${
                  isDisabled
                    ? "cursor-not-allowed bg-slate-50/70 opacity-60"
                    : `cursor-pointer hover:bg-blue-50/50 ${selectedRisk?.id === risk.id ? "bg-blue-50/70" : ""}`
                }`}
              >
                <RiskCell>
                  <input type="checkbox" aria-label={`Select ${risk.id}`} onClick={(event) => event.stopPropagation()} />
                </RiskCell>
                {visibleColumns.id && <RiskCell strong>{risk.id}</RiskCell>}
                {visibleColumns.title && (
                  <RiskCell>
                    <span className="font-black text-slate-900">
                      {risk.title}
                    </span>
                  </RiskCell>
                )}
                {visibleColumns.status && (
                  <RiskCell>
                    {renderStatusPill(risk, applicability, workspaceData)}
                  </RiskCell>
                )}
                {visibleColumns.owner && <RiskCell>{risk.owner}</RiskCell>}
                {visibleColumns.category && <RiskCell>{risk.category}</RiskCell>}
                {visibleColumns.initialRiskScore && <RiskCell>{risk.initialRiskScore}</RiskCell>}
                {visibleColumns.residualRiskScore && <RiskCell>{risk.residualRiskScore}</RiskCell>}
                {visibleColumns.controls && <RiskCell>{risk.controls}</RiskCell>}
                {visibleColumns.comments && (
                  <RiskCell>
                    <span className="inline-flex items-center gap-1 font-black">
                      <MessageSquare size={14} />
                      {risk.comments}
                    </span>
                  </RiskCell>
                )}
              </tr>
              );
            })}
          </tbody>
        </table>
        {!filteredRisks.length && <EmptyRows label="risk scenarios" />}
      </div>

    </section>
  );
}

function ControlsSection({ rows, questionnaireResponses, workspaceData, selectedFramework, onSelectWorkspaceItem }) {
  const [query, setQuery] = useState("");
  const [filterBy, setFilterBy] = useState("All");
  const [sortBy, setSortBy] = useState("dueDate");
  const [selectedControl, setSelectedControl] = useState(null);

  const filteredControls = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return rows
      .filter((control) => {
        const matchesQuery =
          !normalizedQuery ||
          Object.values(control).join(" ").toLowerCase().includes(normalizedQuery);
        const matchesFilter =
          filterBy === "All" ||
          control.status === filterBy ||
          control.evidenceStatus === filterBy ||
          control.owner === filterBy;

        return matchesQuery && matchesFilter;
      })
      .sort((a, b) => compareControlRows(a, b, sortBy));
  }, [filterBy, query, rows, sortBy]);

  const resetTable = () => {
    setQuery("");
    setFilterBy("All");
    setSortBy("dueDate");
    setSelectedControl(null);
  };

  return (
    <section className="overflow-hidden rounded-lg border border-white/75 bg-white/62 shadow-xl shadow-slate-900/5 backdrop-blur">
      <div className="border-b border-slate-100 px-6 py-5">
        <SectionHeader
          title="Controls"
          description={`Search, review, and prioritize mapped controls for ${selectedFramework.name}. Questionnaire matches are highlighted.`}
        />
      </div>

      <div className="border-b border-slate-100 p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <label className="relative min-w-0 flex-1">
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm font-semibold text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500"
              placeholder="Search controls by ID, title, owner, reviewer, or evidence status"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <label className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm">
              <Filter size={16} />
              <select
                value={filterBy}
                onChange={(event) => setFilterBy(event.target.value)}
                className="bg-transparent font-bold outline-none"
              >
                <option value="All">Filter</option>
                <option value="Implemented">Implemented</option>
                <option value="In Progress">In progress</option>
                <option value="Needs Review">Needs review</option>
                <option value="Open">Open</option>
                <option value="Ready">Evidence ready</option>
                <option value="Partial">Evidence partial</option>
                <option value="Missing">Evidence missing</option>
              </select>
            </label>

            <label className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm">
              <ArrowUpDown size={16} />
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="bg-transparent font-bold outline-none"
              >
                <option value="dueDate">Sort by due date</option>
                <option value="status">Sort by status</option>
                <option value="evidenceStatus">Sort by evidence</option>
                <option value="title">Sort by title</option>
              </select>
            </label>

            <ExportMenu compact data={{ ...emptyImplementationData, controls: rows }} />

            <button
              type="button"
              onClick={resetTable}
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[920px] w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50/90 text-xs font-black uppercase tracking-wider text-slate-500">
            <tr>
              <th className="w-12 border-b border-slate-200 px-4 py-3">
                <input type="checkbox" aria-label="Select all controls" />
              </th>
              {controlColumns.map((column) => (
                <th key={column.key} className="border-b border-slate-200 px-4 py-3">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white/60">
            {filteredControls.map((control) => {
              const applicability = getQuestionnaireApplicability(control, questionnaireResponses);
              const isDisabled = applicability === "Not applicable";

              return (
              <tr
                key={control.id}
                onClick={() => {
                  if (isDisabled) return;
                  setSelectedControl(control);
                  onSelectWorkspaceItem(createWorkspaceItem("Control", control));
                }}
                onKeyDown={(event) => {
                  if (!isDisabled && (event.key === "Enter" || event.key === " ")) {
                    setSelectedControl(control);
                    onSelectWorkspaceItem(createWorkspaceItem("Control", control));
                  }
                }}
                role={isDisabled ? undefined : "button"}
                tabIndex={isDisabled ? -1 : 0}
                aria-disabled={isDisabled}
                className={`border-b border-slate-100 transition last:border-0 ${
                  isDisabled
                    ? "cursor-not-allowed bg-slate-50/70 opacity-60"
                    : `cursor-pointer hover:bg-blue-50/50 ${
                        selectedControl?.id === control.id || isRelevantToQuestionnaire(control, questionnaireResponses) ? "bg-blue-50/70" : ""
                      }`
                }`}
              >
                <RiskCell>
                  <input type="checkbox" aria-label={`Select ${control.id}`} onClick={(event) => event.stopPropagation()} />
                </RiskCell>
                <RiskCell strong>{control.id}</RiskCell>
                <RiskCell>
                  <span className="font-black text-slate-900">
                    {control.title}
                  </span>
                  {isRelevantToQuestionnaire(control, questionnaireResponses) && (
                    <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-black text-blue-800">
                      Prioritized
                    </span>
                  )}
                </RiskCell>
                <RiskCell>
                  {renderStatusPill(control, applicability, workspaceData)}
                </RiskCell>
                <RiskCell>{control.owner}</RiskCell>
                <RiskCell>{control.dueDate}</RiskCell>
                <RiskCell>{control.category}</RiskCell>
                <RiskCell>{control.trustServiceCriteria}</RiskCell>
                <RiskCell>{control.mappedTests}</RiskCell>
                <RiskCell>{control.mappedRisks}</RiskCell>
              </tr>
              );
            })}
          </tbody>
        </table>
        {!filteredControls.length && <EmptyRows label="controls" />}
      </div>

    </section>
  );
}

function TestsSection({ rows, questionnaireResponses, workspaceData, selectedFramework, onSelectWorkspaceItem }) {
  const [query, setQuery] = useState("");
  const [filterBy, setFilterBy] = useState("All");
  const [sortBy, setSortBy] = useState("dueDate");
  const [selectedTest, setSelectedTest] = useState(null);

  const filteredTests = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return rows
      .filter((test) => {
        const matchesQuery =
          !normalizedQuery ||
          Object.values(test).join(" ").toLowerCase().includes(normalizedQuery);
        const matchesFilter =
          filterBy === "All" ||
          test.status === filterBy ||
          test.evidenceStatus === filterBy ||
          test.owner === filterBy;

        return matchesQuery && matchesFilter;
      })
      .sort((a, b) => compareTestRows(a, b, sortBy));
  }, [filterBy, query, rows, sortBy]);

  const resetTable = () => {
    setQuery("");
    setFilterBy("All");
    setSortBy("dueDate");
    setSelectedTest(null);
  };

  return (
    <section className="overflow-hidden rounded-lg border border-white/75 bg-white/62 shadow-xl shadow-slate-900/5 backdrop-blur">
      <div className="border-b border-slate-100 px-6 py-5">
        <SectionHeader
          title="Tests"
          description={`Search, review, and prioritize mapped tests for ${selectedFramework.name}.`}
        />
      </div>

      <div className="border-b border-slate-100 p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <label className="relative min-w-0 flex-1">
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm font-semibold text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500"
              placeholder="Search tests by ID, title, owner, reviewer, or evidence status"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <label className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm">
              <Filter size={16} />
              <select
                value={filterBy}
                onChange={(event) => setFilterBy(event.target.value)}
                className="bg-transparent font-bold outline-none"
              >
                <option value="All">Filter</option>
                <option value="Ready">Ready</option>
                <option value="In Progress">In progress</option>
                <option value="In Review">In review</option>
                <option value="Open">Open</option>
                <option value="Partial">Evidence partial</option>
                <option value="Missing">Evidence missing</option>
              </select>
            </label>

            <label className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm">
              <ArrowUpDown size={16} />
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="bg-transparent font-bold outline-none"
              >
                <option value="dueDate">Sort by due date</option>
                <option value="status">Sort by status</option>
                <option value="evidenceStatus">Sort by evidence</option>
                <option value="title">Sort by title</option>
              </select>
            </label>

            <ExportMenu compact data={{ ...emptyImplementationData, tests: rows }} />

            <button
              type="button"
              onClick={resetTable}
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[980px] w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50/90 text-xs font-black uppercase tracking-wider text-slate-500">
            <tr>
              <th className="w-12 border-b border-slate-200 px-4 py-3">
                <input type="checkbox" aria-label="Select all tests" />
              </th>
              {testColumns.map((column) => (
                <th key={column.key} className="border-b border-slate-200 px-4 py-3">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white/60">
            {filteredTests.map((test) => {
              const applicability = getQuestionnaireApplicability(test, questionnaireResponses);
              const isDisabled = applicability === "Not applicable";

              return (
              <tr
                key={test.id}
                onClick={() => {
                  if (isDisabled) return;
                  setSelectedTest(test);
                  onSelectWorkspaceItem(createWorkspaceItem("Test", test));
                }}
                onKeyDown={(event) => {
                  if (!isDisabled && (event.key === "Enter" || event.key === " ")) {
                    setSelectedTest(test);
                    onSelectWorkspaceItem(createWorkspaceItem("Test", test));
                  }
                }}
                role={isDisabled ? undefined : "button"}
                tabIndex={isDisabled ? -1 : 0}
                aria-disabled={isDisabled}
                className={`border-b border-slate-100 transition last:border-0 ${
                  isDisabled
                    ? "cursor-not-allowed bg-slate-50/70 opacity-60"
                    : `cursor-pointer hover:bg-blue-50/50 ${selectedTest?.id === test.id ? "bg-blue-50/70" : ""}`
                }`}
              >
                <RiskCell>
                  <input type="checkbox" aria-label={`Select ${test.id}`} onClick={(event) => event.stopPropagation()} />
                </RiskCell>
                <RiskCell strong>{test.id}</RiskCell>
                <RiskCell>
                  <span className="font-black text-slate-900">
                    {test.title}
                  </span>
                </RiskCell>
                <RiskCell>
                  {renderStatusPill(test, applicability, workspaceData)}
                </RiskCell>
                <RiskCell>{test.owner}</RiskCell>
                <RiskCell>{test.dueDate}</RiskCell>
                <RiskCell>{test.category}</RiskCell>
                <RiskCell>
                  <span className="inline-flex items-center gap-1 font-black">
                    <MessageSquare size={14} />
                    {test.comments}
                  </span>
                </RiskCell>
              </tr>
              );
            })}
          </tbody>
        </table>
        {!filteredTests.length && <EmptyRows label="tests" />}
      </div>

    </section>
  );
}

function PoliciesSection({ rows, questionnaireResponses, workspaceData, selectedFramework, onSelectWorkspaceItem }) {
  const [query, setQuery] = useState("");
  const [filterBy, setFilterBy] = useState("All");
  const [sortBy, setSortBy] = useState("title");

  const filteredPolicies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return rows
      .filter((policy) => {
        const matchesQuery =
          !normalizedQuery ||
          Object.values(policy).join(" ").toLowerCase().includes(normalizedQuery);
        const matchesFilter =
          filterBy === "All" ||
          policy.status === filterBy ||
          policy.category === filterBy;

        return matchesQuery && matchesFilter;
      })
      .sort((a, b) => compareControlRows(a, b, sortBy));
  }, [filterBy, query, rows, sortBy]);

  const resetTable = () => {
    setQuery("");
    setFilterBy("All");
    setSortBy("title");
  };

  return (
    <section className="overflow-hidden rounded-lg border border-white/75 bg-white/62 shadow-xl shadow-slate-900/5 backdrop-blur">
      <div className="border-b border-slate-100 px-6 py-5">
        <SectionHeader
          title="Policies"
          description={`Review the policy library for ${selectedFramework.name}.`}
        />
      </div>

      <div className="border-b border-slate-100 p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <label className="relative min-w-0 flex-1">
            <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm font-semibold text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500"
              placeholder="Search policies by ID, title, or category"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <label className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm">
              <Filter size={16} />
              <select value={filterBy} onChange={(event) => setFilterBy(event.target.value)} className="bg-transparent font-bold outline-none">
                <option value="All">Filter</option>
                <option value="Library">Library</option>
                <option value="Access Control">Access control</option>
                <option value="Operations">Operations</option>
                <option value="Data Protection">Data protection</option>
                <option value="Governance">Governance</option>
              </select>
            </label>

            <label className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm">
              <ArrowUpDown size={16} />
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="bg-transparent font-bold outline-none">
                <option value="title">Sort by title</option>
                <option value="status">Sort by status</option>
                <option value="category">Sort by category</option>
              </select>
            </label>

            <ExportMenu compact data={{ ...emptyImplementationData, policies: rows }} />

            <button type="button" onClick={resetTable} className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50">
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[860px] w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50/90 text-xs font-black uppercase tracking-wider text-slate-500">
            <tr>
              <th className="w-12 border-b border-slate-200 px-4 py-3">
                <input type="checkbox" aria-label="Select all policies" />
              </th>
              {policyColumns.map((column) => (
                <th key={column.key} className="border-b border-slate-200 px-4 py-3">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white/60">
            {filteredPolicies.map((policy) => {
              const applicability = getQuestionnaireApplicability(policy, questionnaireResponses);
              const isDisabled = applicability === "Not applicable";

              return (
              <tr
                key={policy.id}
                onClick={() => {
                  if (!isDisabled) onSelectWorkspaceItem(createWorkspaceItem("Policy", policy));
                }}
                role={isDisabled ? undefined : "button"}
                tabIndex={isDisabled ? -1 : 0}
                aria-disabled={isDisabled}
                className={`border-b border-slate-100 transition last:border-0 ${
                  isDisabled ? "cursor-not-allowed bg-slate-50/70 opacity-60" : "cursor-pointer hover:bg-blue-50/50"
                }`}
              >
                <RiskCell>
                  <input type="checkbox" aria-label={`Select ${policy.id}`} onClick={(event) => event.stopPropagation()} />
                </RiskCell>
                <RiskCell strong>{policy.id}</RiskCell>
                <RiskCell><span className="font-black text-slate-900">{policy.title}</span></RiskCell>
                <RiskCell>{renderStatusPill(policy, applicability, workspaceData)}</RiskCell>
                <RiskCell>{policy.owner}</RiskCell>
                <RiskCell>{policy.dueDate}</RiskCell>
                <RiskCell>{policy.category}</RiskCell>
                <RiskCell>{policy.comments}</RiskCell>
              </tr>
              );
            })}
          </tbody>
        </table>
        {!filteredPolicies.length && <EmptyRows label="policies" />}
      </div>
    </section>
  );
}

function PopulationSection({ rows, questionnaireResponses, workspaceData, selectedFramework, onSelectWorkspaceItem }) {
  const [query, setQuery] = useState("");
  const [filterBy, setFilterBy] = useState("All");
  const [sortBy, setSortBy] = useState("dueDate");

  const filteredPopulations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return rows
      .filter((population) => {
        const matchesQuery =
          !normalizedQuery ||
          Object.values(population).join(" ").toLowerCase().includes(normalizedQuery);
        const matchesFilter =
          filterBy === "All" ||
          population.status === filterBy ||
          population.category === filterBy;

        return matchesQuery && matchesFilter;
      })
      .sort((a, b) => compareControlRows(a, b, sortBy));
  }, [filterBy, query, rows, sortBy]);

  const resetTable = () => {
    setQuery("");
    setFilterBy("All");
    setSortBy("dueDate");
  };

  return (
    <section className="overflow-hidden rounded-lg border border-white/75 bg-white/62 shadow-xl shadow-slate-900/5 backdrop-blur">
      <div className="border-b border-slate-100 px-6 py-5">
        <SectionHeader
          title="Populations"
          description={`Review scoped populations for ${selectedFramework.name}.`}
        />
      </div>

      <div className="border-b border-slate-100 p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <label className="relative min-w-0 flex-1">
            <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm font-semibold text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500"
              placeholder="Search populations by ID, title, owner, or category"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <label className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm">
              <Filter size={16} />
              <select value={filterBy} onChange={(event) => setFilterBy(event.target.value)} className="bg-transparent font-bold outline-none">
                <option value="All">Filter</option>
                <option value="Ready">Ready</option>
                <option value="In Review">In review</option>
                <option value="Access Control">Access control</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Workforce">Workforce</option>
              </select>
            </label>

            <label className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm">
              <ArrowUpDown size={16} />
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="bg-transparent font-bold outline-none">
                <option value="dueDate">Sort by due date</option>
                <option value="status">Sort by status</option>
                <option value="title">Sort by title</option>
              </select>
            </label>

            <ExportMenu compact data={{ ...emptyImplementationData, populations: rows }} />

            <button type="button" onClick={resetTable} className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50">
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[860px] w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50/90 text-xs font-black uppercase tracking-wider text-slate-500">
            <tr>
              <th className="w-12 border-b border-slate-200 px-4 py-3">
                <input type="checkbox" aria-label="Select all populations" />
              </th>
              {populationColumns.map((column) => (
                <th key={column.key} className="border-b border-slate-200 px-4 py-3">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white/60">
            {filteredPopulations.map((population) => {
              const applicability = getQuestionnaireApplicability(population, questionnaireResponses);
              const isDisabled = applicability === "Not applicable";

              return (
              <tr
                key={population.id}
                onClick={() => {
                  if (!isDisabled) onSelectWorkspaceItem(createWorkspaceItem("Population", population));
                }}
                role={isDisabled ? undefined : "button"}
                tabIndex={isDisabled ? -1 : 0}
                aria-disabled={isDisabled}
                className={`border-b border-slate-100 transition last:border-0 ${
                  isDisabled ? "cursor-not-allowed bg-slate-50/70 opacity-60" : "cursor-pointer hover:bg-blue-50/50"
                }`}
              >
                <RiskCell>
                  <input type="checkbox" aria-label={`Select ${population.id}`} onClick={(event) => event.stopPropagation()} />
                </RiskCell>
                <RiskCell strong>{population.id}</RiskCell>
                <RiskCell><span className="font-black text-slate-900">{population.title}</span></RiskCell>
                <RiskCell>{renderStatusPill(population, applicability, workspaceData)}</RiskCell>
                <RiskCell>{population.owner}</RiskCell>
                <RiskCell>{population.dueDate}</RiskCell>
                <RiskCell>{population.category}</RiskCell>
                <RiskCell>{population.mappedTests}</RiskCell>
                <RiskCell>{population.comments}</RiskCell>
              </tr>
              );
            })}
          </tbody>
        </table>
        {!filteredPopulations.length && <EmptyRows label="populations" />}
      </div>
    </section>
  );
}

function ImplementationWorkspace({ item, framework, data, questionnaireResponses, savedState = {}, onWorkspaceStateChange, onSelectItem, onClose, relationshipGraph }) {
  const state = savedState || {};
  const linkedItems = getLinkedItemsFromGraph(item, data, relationshipGraph);
  const [organizationStatus, setOrganizationStatus] = useState(state.status || "");
  const [dueDate, setDueDate] = useState(state.dueDate || "");
  const [assignments, setAssignments] = useState({
    owner: state.assignments?.owner || "Unassigned",
    reviewer: state.assignments?.reviewer || "Unassigned",
    approver: state.assignments?.approver || "Unassigned",
  });
  const [evidenceFiles, setEvidenceFiles] = useState(state.evidenceFiles || []);
  const [evidenceByRequirement, setEvidenceByRequirement] = useState(state.evidenceByRequirement || {});
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(state.comments || []);
  const [timeline, setTimeline] = useState(state.timeline || []);
  const [taskText, setTaskText] = useState("");
  const [tasks, setTasks] = useState(state.tasks || []);

  // Load dynamic employee list (no fake fallbacks)
  const [employeesList, setEmployeesList] = useState(() => {
    try {
      const saved = localStorage.getItem("spectramind:employees");
      const list = saved ? JSON.parse(saved) : [];
      const names = list.map((emp) => emp.name);
      if (!names.includes("Unassigned")) names.push("Unassigned");
      return names;
    } catch {
      return ["Unassigned"];
    }
  });

  // Risk Parameters
  const [initialLikelihood, setInitialLikelihood] = useState(state.initialLikelihood ?? 3);
  const [initialImpact, setInitialImpact] = useState(state.initialImpact ?? 5);
  const [treatment, setTreatment] = useState(state.treatment ?? "Minimize");
  const [residualLikelihood, setResidualLikelihood] = useState(state.residualLikelihood ?? 1);
  const [residualImpact, setResidualImpact] = useState(state.residualImpact ?? 3);

  const saveWorkspaceState = (overrides = {}) => {
    onWorkspaceStateChange(item.id, {
      status: organizationStatus,
      dueDate,
      assignments,
      evidenceFiles,
      evidenceByRequirement,
      comments,
      timeline,
      tasks,
      initialLikelihood,
      initialImpact,
      treatment,
      residualLikelihood,
      residualImpact,
      ...overrides,
    });
  };

  const addTimelineEvent = (label, stateOverrides = {}) => {
    const nextTimeline = [
      { id: `${timeline.length + 1}-${label}-${Date.now()}`, label },
      ...timeline,
    ];
    setTimeline(nextTimeline);
    saveWorkspaceState({ ...stateOverrides, timeline: nextTimeline });
  };

  const updateOrganizationStatus = (value) => {
    setOrganizationStatus(value);
    addTimelineEvent("Status updated", { status: value });
  };

  const updateDueDate = (value) => {
    setDueDate(value);
    addTimelineEvent("Due date updated", { dueDate: value });
  };

  const updateAssignment = (field, value) => {
    const nextAssignments = { ...assignments, [field]: value };
    setAssignments(nextAssignments);
    addTimelineEvent(`${fieldLabel(field)} updated`, { assignments: nextAssignments });
  };

  const handleRiskParamChange = (params) => {
    const nextParams = {
      initialLikelihood,
      initialImpact,
      treatment,
      residualLikelihood,
      residualImpact,
      ...params,
    };
    if (params.initialLikelihood !== undefined) setInitialLikelihood(params.initialLikelihood);
    if (params.initialImpact !== undefined) setInitialImpact(params.initialImpact);
    if (params.treatment !== undefined) setTreatment(params.treatment);
    if (params.residualLikelihood !== undefined) setResidualLikelihood(params.residualLikelihood);
    if (params.residualImpact !== undefined) setResidualImpact(params.residualImpact);

    saveWorkspaceState(nextParams);
    addTimelineEvent("Risk parameters updated", nextParams);
  };

  const addComment = () => {
    const trimmedComment = commentText.trim();
    if (!trimmedComment) return;
    const activeAuthor = (() => {
      try {
        const saved = localStorage.getItem("spectramind:employees");
        const list = saved ? JSON.parse(saved) : [];
        return list[0]?.name || "Admin";
      } catch {
        return "Admin";
      }
    })();

    const newCommentObj = {
      id: `comment-${Date.now()}`,
      user: activeAuthor,
      text: trimmedComment,
      timestamp: new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }),
    };
    const nextComments = [newCommentObj, ...comments];
    setComments(nextComments);
    setCommentText("");
    addTimelineEvent("Comment added", { comments: nextComments });
  };

  const renderComment = (comment, index) => {
    const isObj = typeof comment === "object" && comment !== null;
    const userName = isObj ? comment.user : "User";
    const userInitial = userName[0] || "U";
    const text = isObj ? comment.text : comment;
    const time = isObj ? comment.timestamp : "Just now";

    return (
      <div key={index} className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-xs font-black text-blue-700 uppercase">
              {userInitial}
            </span>
            <div>
              <p className="text-xs font-black text-slate-900">{userName}</p>
              <p className="text-[10px] font-bold text-slate-400">{time}</p>
            </div>
          </div>
        </div>
        <p className="text-xs leading-5 text-slate-600 font-semibold">{text}</p>
      </div>
    );
  };

  // ── 1. TEST DRAWER LAYOUT ──────────────────────────────────────────────────
  if (item.type === "Test") {
    const isNotApplicable = organizationStatus === "Not Applicable" || organizationStatus === "not_applicable";

    return (
      <aside className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto border-l border-slate-200 bg-white p-5 shadow-sm space-y-6 w-full xl:w-[420px]">
        {/* Drawer Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="space-y-2">
            <div className="flex gap-2">
              <span className="inline-flex rounded bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-500 uppercase tracking-wide">
                {isNotApplicable ? "NOT APPLICABLE" : "READY"}
              </span>
              <span className="inline-flex rounded bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-500 uppercase tracking-wide">
                SOC 2
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-950">
              {item.id.replace("TEST-", "Test ")}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-slate-750"
          >
            <X size={18} />
          </button>
        </div>

        {/* Guidance Callout Box */}
        <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-4">
          <h4 className="text-[10px] font-black uppercase tracking-wider text-indigo-700">Guidance</h4>
          <p className="mt-2 text-sm leading-6 text-indigo-950/90">
            {item.guidance || "Provide documentation showing that your organization completed a physical access review within the last 12 months."}
            <button className="text-blue-600 font-bold hover:underline ml-1">read more</button>
          </p>
        </div>

        {/* Applicability Toggle Section */}
        <div className="space-y-2 border-b border-slate-100 pb-5">
          {isNotApplicable ? (
            <div className="space-y-3">
              <h4 className="text-sm font-black text-slate-900">This test is marked as Not Applicable</h4>
              <p className="text-xs leading-5 text-slate-500">
                This test does not apply to your organization and will not be included in calculations.
              </p>
              <button
                onClick={() => updateOrganizationStatus("Ready")}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-black text-white transition hover:bg-blue-700"
              >
                Mark as Applicable
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <h4 className="text-sm font-black text-slate-900">This test is marked as Applicable</h4>
              <p className="text-xs leading-5 text-slate-500">
                This test applies to your organization and is included in compliance calculations.
              </p>
              <button
                onClick={() => updateOrganizationStatus("not_applicable")}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-50"
              >
                Mark as Not Applicable
              </button>
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="space-y-3 border-b border-slate-100 pb-5">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Details</h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold">Assigned</span>
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 text-[10px] font-black text-blue-700 uppercase">
                  {assignments.owner[0]}
                </span>
                <select
                  value={assignments.owner}
                  onChange={(e) => updateAssignment("owner", e.target.value)}
                  className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
                >
                  {employeesList.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold">Due Date</span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => updateDueDate(e.target.value)}
                className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 font-bold text-slate-700 outline-none text-xs"
              />
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Category</span>
              <span className="font-bold text-slate-800">{item.category || "General"}</span>
            </div>
          </div>
        </div>

        {/* Mapped Controls Section */}
        <div className="space-y-3 border-b border-slate-100 pb-5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Mapped Controls</h4>
            <button className="rounded border border-slate-200 px-2 py-0.5 text-xs font-bold text-slate-700 hover:bg-slate-50">
              Link
            </button>
          </div>
          {linkedItems.controls?.map((ctrl) => (
            <div key={ctrl.id} className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5 space-y-3">
              <p className="text-sm font-black text-slate-900">{ctrl.title}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-xs font-black text-blue-700 uppercase">
                    {(ctrl.owner || "U")[0]}
                  </span>
                  <span className="text-xs font-semibold text-slate-600">{ctrl.owner || "Unassigned"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-500">
                    IMPLEMENTED
                  </span>
                  <button className="text-xs font-bold text-blue-600 hover:underline">Unlink</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* History Section */}
        <div className="space-y-3 border-b border-slate-100 pb-5">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">History</h4>
          <div className="space-y-3">
            {/* Custom comments list */}
            {comments.map((comment, index) => renderComment(comment, index))}

            {!comments.length && (
              <p className="py-2 text-center text-xs font-semibold text-slate-400">There are no comments yet</p>
            )}
          </div>
        </div>

        {/* Comment Editor Box */}
        <div className="space-y-3">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            className="w-full min-h-20 rounded-lg border border-slate-200 p-3 text-sm text-slate-800 outline-none focus:border-blue-500"
          />
          <div className="flex items-center justify-between">
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50">
              Unassigned
              <ChevronDown size={14} />
            </button>
            <button
              onClick={addComment}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </aside>
    );
  }

  // ── 2. CONTROL DRAWER LAYOUT ───────────────────────────────────────────────
  if (item.type === "Control") {
    const isImplemented = organizationStatus === "complete" || organizationStatus === "Implemented";

    return (
      <aside className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto border-l border-slate-200 bg-white p-5 shadow-sm space-y-6 w-full xl:w-[420px]">
        {/* Drawer Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="space-y-2">
            <div className="flex gap-2">
              <span className="inline-flex rounded bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-500 uppercase tracking-wide">
                {isImplemented ? "IMPLEMENTED" : "IN PROGRESS"}
              </span>
              <span className="inline-flex rounded bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-500 uppercase tracking-wide">
                SOC 2
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-950">
              {item.id}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-slate-750"
          >
            <X size={18} />
          </button>
        </div>

        {/* Description Section */}
        <div className="space-y-2 border-b border-slate-100 pb-5">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Description</h4>
          <p className="text-sm leading-6 text-slate-700">
            {item.description}
          </p>
        </div>

        {/* Details Section */}
        <div className="space-y-3 border-b border-slate-100 pb-5">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Details</h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold">Assigned</span>
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 text-[10px] font-black text-blue-700 uppercase">
                  {assignments.owner[0]}
                </span>
                <select
                  value={assignments.owner}
                  onChange={(e) => updateAssignment("owner", e.target.value)}
                  className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
                >
                  {employeesList.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold">Due Date</span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => updateDueDate(e.target.value)}
                className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 font-bold text-slate-700 outline-none text-xs"
              />
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Category</span>
              <span className="font-bold text-slate-800">{item.category || "Compliance"}</span>
            </div>
          </div>
        </div>

        {/* Linked Tests Section */}
        <div className="space-y-3 border-b border-slate-100 pb-5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Connected Tests</h4>
            <button className="rounded border border-slate-200 px-2 py-0.5 text-xs font-bold text-slate-700 hover:bg-slate-50">
              Link
            </button>
          </div>
          {linkedItems.tests?.map((t) => (
            <div key={t.id} className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5 space-y-3">
              <p className="text-sm font-black text-slate-900">{t.title}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">{t.id}</span>
                <span className="rounded bg-blue-50 px-2.5 py-0.5 text-[10px] font-black text-blue-700 uppercase">
                  READY
                </span>
              </div>
            </div>
          ))}
          {!linkedItems.tests?.length && (
            <p className="text-xs font-semibold text-slate-400 italic">No connected tests.</p>
          )}
        </div>

        {/* Linked Risk Scenarios Section */}
        <div className="space-y-3 border-b border-slate-100 pb-5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Mitigated Risks</h4>
            <button className="rounded border border-slate-200 px-2 py-0.5 text-xs font-bold text-slate-700 hover:bg-slate-50">
              Link
            </button>
          </div>
          {linkedItems.risks?.map((r) => (
            <div key={r.id} className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5 space-y-2">
              <p className="text-sm font-black text-slate-900">{r.title}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">{r.id}</span>
                <span className="rounded bg-rose-50 px-2 py-0.5 text-[10px] font-black text-rose-700">
                  Mitigated
                </span>
              </div>
            </div>
          ))}
          {!linkedItems.risks?.length && (
            <p className="text-xs font-semibold text-slate-400 italic">No mitigated risks.</p>
          )}
        </div>

        {/* Comment History Section */}
        <div className="space-y-3 border-b border-slate-100 pb-5">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">History</h4>
          <div className="space-y-3">
            {comments.map((comment, index) => renderComment(comment, index))}
            {!comments.length && (
              <p className="py-2 text-center text-xs font-semibold text-slate-400">There are no comments yet</p>
            )}
          </div>
        </div>

        {/* Comment Input */}
        <div className="space-y-3">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            className="w-full min-h-20 rounded-lg border border-slate-200 p-3 text-sm text-slate-800 outline-none focus:border-blue-500"
          />
          <div className="flex justify-end">
            <button
              onClick={addComment}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </aside>
    );
  }

  // ── 3. RISK SCENARIO DRAWER LAYOUT (MATCHES SCREENSHOT) ─────────────────────
  if (item.type === "Risk") {
    const isNotApplicable = organizationStatus === "not_applicable" || organizationStatus === "Not Applicable";
    const initialRiskScore = initialLikelihood * initialImpact;
    const residualRiskScore = residualLikelihood * residualImpact;

    return (
      <aside className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto border-l border-slate-200 bg-white p-5 shadow-sm space-y-6 w-full xl:w-[420px]">
        {/* Drawer Header */}
        <div className="flex items-start justify-between border-b border-slate-105 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-black tracking-wide uppercase ${
                isNotApplicable ? "bg-slate-100 text-slate-500" : "bg-purple-50 text-purple-700"
              }`}>
                {!isNotApplicable && (
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-500 inline-block mr-0.5" />
                )}
                {isNotApplicable ? "NOT APPLICABLE" : "READY"}
              </span>
              <span className="inline-flex rounded bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-500 uppercase tracking-wide">
                SOC 2
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-950 mt-1">
              Risk Scenario {item.id}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-slate-750"
          >
            <X size={18} />
          </button>
        </div>

        {/* Description Section */}
        <div className="space-y-1">
          <p className="text-sm leading-6 text-slate-700">
            {item.description || "The absence or failure to ensure compliance with information security policies, rules, and standards..."}
            <button className="text-blue-600 font-bold hover:underline ml-1">read more</button>
          </p>
        </div>

        {/* Applicability Checkbox */}
        <div className="flex items-center gap-2.5">
          <input
            type="checkbox"
            id="risk-not-applicable"
            checked={isNotApplicable}
            onChange={(e) => updateOrganizationStatus(e.target.checked ? "not_applicable" : "Ready")}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
          <label htmlFor="risk-not-applicable" className="text-sm font-black text-slate-700 cursor-pointer select-none">
            Not Applicable
          </label>
        </div>

        {/* Details Section */}
        <div className="space-y-3 border-t border-slate-100 pt-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-400 font-semibold text-xs uppercase">Assigned to</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-black text-white uppercase">
                  {assignments.owner[0]}
                </span>
                <select
                  value={assignments.owner}
                  onChange={(e) => updateAssignment("owner", e.target.value)}
                  className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
                >
                  {employeesList.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <p className="text-slate-400 font-semibold text-xs uppercase">Category</p>
              <p className="font-bold text-slate-800 mt-2">{item.category || "Operations"}</p>
            </div>
          </div>
        </div>

        {/* Initial Risk Section */}
        <div className="rounded-xl border border-slate-150 p-4 space-y-4 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-slate-900">Initial Risk</h4>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-black text-slate-600">
              {initialRiskScore}
            </span>
          </div>

          {/* Likelihood Slider */}
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-850">Likelihood:</p>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={initialLikelihood}
              disabled={isNotApplicable}
              onChange={(e) => handleRiskParamChange({ initialLikelihood: parseInt(e.target.value) })}
              className={`w-full h-1 rounded-lg appearance-none cursor-pointer accent-indigo-650 ${
                isNotApplicable ? "bg-slate-100 cursor-not-allowed" : "bg-indigo-100"
              }`}
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-bold px-1 mt-1">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
            </div>
          </div>

          {/* Impact Slider */}
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-850">Impact:</p>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={initialImpact}
              disabled={isNotApplicable}
              onChange={(e) => handleRiskParamChange({ initialImpact: parseInt(e.target.value) })}
              className={`w-full h-1 rounded-lg appearance-none cursor-pointer accent-indigo-650 ${
                isNotApplicable ? "bg-slate-100 cursor-not-allowed" : "bg-indigo-100"
              }`}
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-bold px-1 mt-1">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
            </div>
          </div>
        </div>

        {/* Treatment Radios */}
        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <h4 className="text-sm font-black text-slate-900">Treatment</h4>
            <span className="text-slate-400 cursor-help">ℹ️</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700">
            {["Tolerate", "Eliminate", "Minimize", "Outsource"].map((option) => (
              <label key={option} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="risk-treatment"
                  value={option}
                  disabled={isNotApplicable}
                  checked={treatment === option}
                  onChange={() => handleRiskParamChange({ treatment: option })}
                  className="h-4 w-4 text-indigo-650 border-indigo-350 focus:ring-indigo-500 cursor-pointer"
                />
                {option}
              </label>
            ))}
          </div>
        </div>

        {/* Residual Risk Section */}
        <div className="rounded-xl border border-slate-150 p-4 space-y-4 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-slate-900">Residual Risk</h4>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-black text-slate-600">
              {residualRiskScore}
            </span>
          </div>

          {/* Likelihood Slider */}
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-850">Likelihood:</p>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={residualLikelihood}
              disabled={isNotApplicable}
              onChange={(e) => handleRiskParamChange({ residualLikelihood: parseInt(e.target.value) })}
              className={`w-full h-1 rounded-lg appearance-none cursor-pointer accent-indigo-650 ${
                isNotApplicable ? "bg-slate-100 cursor-not-allowed" : "bg-indigo-100"
              }`}
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-bold px-1 mt-1">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
            </div>
          </div>

          {/* Impact Slider */}
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-850">Impact:</p>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={residualImpact}
              disabled={isNotApplicable}
              onChange={(e) => handleRiskParamChange({ residualImpact: parseInt(e.target.value) })}
              className={`w-full h-1 rounded-lg appearance-none cursor-pointer accent-indigo-650 ${
                isNotApplicable ? "bg-slate-100 cursor-not-allowed" : "bg-indigo-100"
              }`}
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-bold px-1 mt-1">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
            </div>
          </div>
        </div>

        {/* Mapped Controls Section */}
        <div className="space-y-3 border-b border-slate-100 pb-5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Mapped Controls</h4>
            <button className="rounded bg-slate-900 border border-slate-900 px-3 py-1 text-xs font-black text-white hover:bg-slate-800">
              Link
            </button>
          </div>
          {linkedItems.controls?.map((ctrl) => (
            <div key={ctrl.id} className="rounded-lg border border-slate-150 p-4 space-y-3.5 bg-white">
              <p className="text-sm font-black text-slate-950 leading-relaxed">{ctrl.title}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-black text-white uppercase">
                    {(ctrl.owner || "U")[0]}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{ctrl.owner || "Unassigned"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-black text-indigo-700">
                    IMPLEMENTED
                  </span>
                  <button className="text-xs font-black text-slate-400 hover:text-slate-600 hover:underline">
                    Unlink
                  </button>
                </div>
              </div>
            </div>
          ))}
          {!linkedItems.controls?.length && (
            <p className="text-xs font-semibold text-slate-400 italic">No mapped controls.</p>
          )}
        </div>

        {/* History / Comment Timeline Section */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">History</h4>
          <div className="space-y-3">
            {comments.map((comment, index) => renderComment(comment, index))}
            {!comments.length && (
              <p className="py-8 text-center text-xs font-semibold text-slate-400">There are no comments yet</p>
            )}
          </div>
        </div>

        {/* Comment Editor Box */}
        <div className="space-y-3">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            className="w-full min-h-20 rounded-lg border border-slate-200 p-3 text-sm text-slate-800 outline-none focus:border-blue-500"
          />
          <div className="flex justify-end">
            <button
              onClick={addComment}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto border-l border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">
            Library · {framework.name}
          </p>
          <h2 className="mt-2 text-xl font-black text-slate-950">
            {item.id}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close details panel"
        >
          <X size={18} />
        </button>
      </div>
    </aside>
  );
}


function RiskCell({ children, strong = false }) {
  return (
    <td
      className={`px-4 py-3 align-top ${
        strong ? "font-black text-blue-700" : "font-semibold text-slate-600"
      }`}
    >
      {children}
    </td>
  );
}

function LinkedItemGroup({ title, items, onSelectItem }) {
  return (
    <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
      <p className="text-xs font-black uppercase tracking-widest text-slate-500">{title}</p>
      {items.length ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {items.map((linkedItem) => (
            <button
              key={`${title}-${linkedItem.id}`}
              type="button"
              onClick={() => onSelectItem(linkedItem)}
              className="rounded-lg border border-blue-600/20 bg-blue-50 px-2.5 py-1.5 text-left text-xs font-black text-blue-800 transition hover:bg-blue-100"
            >
              {linkedItem.id}
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-xs font-semibold text-slate-400">No linked {title.toLowerCase()}.</p>
      )}
    </div>
  );
}

function EvidenceChecklist({ requirements, evidenceByRequirement, onUpload }) {
  const completedCount = requirements.filter((requirement) => evidenceByRequirement[requirement]?.length).length;
  const progress = requirements.length ? Math.round((completedCount / requirements.length) * 100) : 0;

  if (!requirements.length) {
    return (
      <p className="mt-3 text-xs font-semibold text-slate-400">
        No framework evidence requirements defined for this item.
      </p>
    );
  }

  return (
    <div className="mt-4">
      <div className="mb-3 flex items-center justify-between text-xs font-black uppercase tracking-widest text-slate-500">
        <span>Required Evidence</span>
        <span>{completedCount}/{requirements.length} complete</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-blue-600" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-3 space-y-2">
        {requirements.map((requirement) => {
          const files = evidenceByRequirement[requirement] || [];
          const isComplete = Boolean(files.length);

          return (
            <div key={requirement} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-start gap-2">
                <span className={`mt-0.5 grid h-5 w-5 place-items-center rounded border text-xs font-black ${
                  isComplete ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 text-transparent"
                }`}>
                  ✓
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-slate-800">{requirement}</p>
                  {files.length ? (
                    <div className="mt-2 space-y-1">
                      {files.map((fileName) => (
                        <p key={`${requirement}-${fileName}`} className="truncate text-xs font-semibold text-slate-500">
                          {fileName}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1 text-xs font-semibold text-slate-400">No document uploaded.</p>
                  )}
                </div>
              </div>
              <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-black text-slate-700 shadow-sm">
                <UploadCloud size={14} />
                Upload
                <input
                  type="file"
                  className="hidden"
                  onChange={(event) => onUpload(event.target.files, requirement)}
                />
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WorkspaceSectionTitle({ children }) {
  return <h3 className="text-base font-black text-slate-950">{children}</h3>;
}

function ComplianceCopilot({ item, linkedItems, evidenceByRequirement, questionnaireResponses }) {
  const requiredEvidence = item.requiredEvidence || [];
  const missingEvidence = requiredEvidence.filter(
    (requirement) => !evidenceByRequirement[requirement]?.length
  );
  const checklist = getCompletionChecklist(item, missingEvidence, linkedItems);
  const sections = [
    ["Purpose", getCopilotPurpose(item)],
    ["Why this exists", getCopilotWhy(item)],
    ["Implementation guidance", getCopilotGuidance(item)],
    ["Required evidence", requiredEvidence.length ? requiredEvidence.join(", ") : "No framework evidence requirements defined."],
    ["Related risks", formatLinkedTitles(linkedItems.risks)],
    ["Related controls", formatLinkedTitles(linkedItems.controls)],
    ["Questionnaire recommendation", getImplementationRecommendation(item, questionnaireResponses) || "No questionnaire-specific priority detected."],
    ["Next recommended action", getNextRecommendedAction(item, missingEvidence)],
  ];

  return (
    <div className="mt-3 space-y-3 rounded-lg bg-violet-50 p-4 text-sm font-semibold leading-6 text-slate-700">
      {sections.map(([title, body]) => (
        <div key={title}>
          <p className="text-xs font-black uppercase tracking-widest text-violet-700">{title}</p>
          <p className="mt-1">{body}</p>
        </div>
      ))}
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-violet-700">Completion checklist</p>
        <div className="mt-2 space-y-1">
          {checklist.map((entry) => (
            <div key={entry} className="flex gap-2">
              <span>□</span>
              <span>{entry}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getEvidencePrompt(item) {
  if (item.type === "Test") return "Required evidence is empty. Add test samples, screenshots, exports, or review records when available.";
  if (item.type === "Control") return "Required evidence is empty. Attach proof that this control is implemented and operating.";
  if (item.type === "Risk") return "Required evidence is empty. Link risk assessment notes or treatment records when available.";
  if (item.type === "Policy") return "Required evidence is empty. Attach the approved policy and acknowledgement evidence when available.";
  return "Required evidence is empty.";
}

function getCopilotPurpose(item) {
  if (item.type === "Risk") return "Identify a scenario that could affect trust, security, availability, or compliance outcomes.";
  if (item.type === "Test") return "Validate that linked controls are designed and operating as expected.";
  if (item.type === "Control") return "Define the activity that reduces compliance risk and supports SOC 2 criteria.";
  if (item.type === "Policy") return "Document management intent and operating expectations for related controls.";
  return "Support the framework implementation workflow.";
}

function getCopilotWhy(item) {
  if (item.type === "Control") return "Auditors need evidence that this control exists, is assigned, and is operating.";
  if (item.type === "Test") return "Testing creates proof that linked controls are functioning for the selected period.";
  if (item.type === "Risk") return "Risks explain why tests and controls are required.";
  if (item.type === "Policy") return "Policies provide governance support for controls and operating procedures.";
  return "This item supports implementation completeness.";
}

function getCopilotGuidance(item) {
  if (item.type === "Test") return "Assign an owner, upload all required evidence, then mark the test ready after review.";
  if (item.type === "Control") return "Confirm linked tests, upload control evidence, assign reviewers, and complete implementation status.";
  if (item.type === "Risk") return "Review linked tests and controls to make sure the risk is mitigated.";
  if (item.type === "Policy") return "Upload the approved policy, confirm review date, and mark it approved.";
  return "Complete assignments, evidence, and status.";
}

function getNextRecommendedAction(item, missingEvidence) {
  if (missingEvidence.length) return `Upload ${missingEvidence[0]}.`;
  if (item.type === "Policy") return "Review and approve this policy.";
  if (item.type === "Control") return "Mark this control ready after validating linked tests.";
  if (item.type === "Risk") return "Confirm linked tests mitigate this risk.";
  return "Assign reviewer and complete final review.";
}

function getCompletionChecklist(item, missingEvidence, linkedItems) {
  return [
    "Assign owner, reviewer, and approver",
    ...missingEvidence.map((requirement) => `Upload ${requirement}`),
    linkedItems.controls.length ? "Review linked controls" : "Confirm control mapping",
    linkedItems.risks.length ? "Review related risks" : "Confirm risk mapping",
    item.type === "Policy" ? "Approve policy" : "Update implementation status",
  ];
}

function formatLinkedTitles(items) {
  if (!items.length) return "No linked items.";
  return items.slice(0, 4).map((linkedItem) => `${linkedItem.id} ${linkedItem.title}`).join("; ");
}

function fieldLabel(field) {
  return {
    owner: "Owner",
    reviewer: "Reviewer",
    approver: "Approver",
  }[field];
}

function RiskPill({ children, tone }) {
  const toneClass =
    tone === "High"
      ? "bg-rose-50 text-rose-700"
      : tone === "Medium"
        ? "bg-amber-50 text-amber-700"
        : tone === "Low"
          ? "bg-emerald-50 text-emerald-700"
          : "bg-blue-50 text-blue-800";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ${toneClass}`}>
      {children}
    </span>
  );
}

function SectionHeader({ title, description }) {
  return (
    <div>
      <h2 className="text-xl font-black text-slate-900">
        {title}
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        {description}
      </p>
    </div>
  );
}

function EmptyRows({ label }) {
  return (
    <div className="border-t border-slate-100 bg-white px-6 py-10 text-center">
      <p className="text-sm font-black text-slate-900">No {label} available.</p>
      <p className="mt-1 text-sm font-semibold text-slate-500">
        Reset the library or upload your company data from the section above.
      </p>
    </div>
  );
}

function progressFromRows(rows, predicate) {
  if (!rows.length) return 0;
  return Math.round((completedCount(rows, predicate) / rows.length) * 100);
}

function completedCount(rows, predicate) {
  return rows.filter(predicate).length;
}

function renderStatusPill(row, defaultApplicability, workspaceData) {
  const saved = (workspaceData && workspaceData[row.id]) || {};
  const status = String(saved.status || row.status || "").toLowerCase();

  if (status === "not_applicable" || status === "not applicable") {
    return <RiskPill tone="Medium">Not Applicable</RiskPill>;
  }
  if (["complete", "completed", "implemented", "approved"].includes(status)) {
    return <RiskPill tone="Low">Implemented</RiskPill>;
  }
  if (defaultApplicability === "Not applicable") {
    return <RiskPill tone="Medium">Not Applicable</RiskPill>;
  }
  return <RiskPill>Applicable</RiskPill>;
}

function isCompletedStatus(row, workspaceData) {
  return ["complete", "completed", "implemented", "ready", "approved"].includes(
    String((workspaceData && workspaceData[row.id]?.status) || "").toLowerCase()
  );
}

function isApprovedStatus(row, workspaceData) {
  return ["approved", "complete", "completed"].includes(
    String((workspaceData && workspaceData[row.id]?.status) || "").toLowerCase()
  );
}

function hasUploadedEvidence(row, workspaceData) {
  if (!workspaceData) return false;
  const itemData = workspaceData[row.id];
  if (!itemData) return false;
  return Boolean(
    itemData.evidenceFiles?.length ||
      Object.values(itemData.evidenceByRequirement || {}).some((files) => files.length)
  );
}

function compareRiskRows(a, b, sortBy) {
  const severityRank = {
    High: 1,
    Medium: 2,
    Low: 3,
  };

  if (sortBy === "severity") {
    return severityRank[a.severity] - severityRank[b.severity];
  }

  if (sortBy === "dueDate") {
    return new Date(a.dueDate) - new Date(b.dueDate);
  }

  return String(a[sortBy]).localeCompare(String(b[sortBy]), undefined, {
    numeric: true,
  });
}

function compareControlRows(a, b, sortBy) {
  if (sortBy === "dueDate") {
    return new Date(a.dueDate) - new Date(b.dueDate);
  }

  return String(a[sortBy]).localeCompare(String(b[sortBy]), undefined, {
    numeric: true,
  });
}

function compareTestRows(a, b, sortBy) {
  if (sortBy === "dueDate") {
    return new Date(a.dueDate) - new Date(b.dueDate);
  }

  return String(a[sortBy]).localeCompare(String(b[sortBy]), undefined, {
    numeric: true,
  });
}

function createWorkspaceItem(type, item) {
  const id = item.id || item.name;
  const title = item.title || item.name;
  const priority = item.priority || "";
  const category = item.category || categoryFromType(type);
  const evidence = item.evidence || item.evidenceStatus || "";

  return {
    type,
    id,
    title,
    description: item.description || item.title || "",
    status: item.status || "",
    priority,
    owner: item.owner || "",
    reviewer: item.reviewer || "",
    approver: item.approver || "",
    dueDate: item.dueDate || "",
    category,
    mappedRisks: item.mappedRisks || "",
    mappedTests: item.mappedTests || "",
    mappedControls: item.mappedControls || "",
    linkedRisks: item.linkedRisks || [],
    linkedTests: item.linkedTests || [],
    linkedControls: item.linkedControls || [],
    linkedPolicies: item.linkedPolicies || [],
    evidence,
    requiredEvidence: item.requiredEvidence || [],
    comments: item.comments ?? "",
    guidance: item.guidance || "",
    updatedAt: item.updatedAt || "",
    activityTimeline: item.activityTimeline || [],
    aiRecommendation: item.aiRecommendation || "",
  };
}

function categoryFromType(type) {
  return {
    Risk: "Risk Management",
    Control: "Control Operations",
    Test: "Testing",
    Policy: "Policy Management",
    Population: "Population Management",
  }[type];
}

function getLinkedItems(item, data) {
  return {
    risks: resolveLinkedItems(item.linkedRisks, data.risks, "Risk"),
    controls: resolveLinkedItems(item.linkedControls, data.controls, "Control"),
    tests: resolveLinkedItems(item.linkedTests, data.tests, "Test"),
    policies: resolveLinkedItems(item.linkedPolicies, data.policies, "Policy"),
    populations: resolveLinkedItems(item.linkedPopulations, data.populations, "Population"),
  };
}

function resolveLinkedItems(ids = [], rows, type) {
  return ids
    .map((id) => rows.find((row) => row.id === id))
    .filter(Boolean)
    .map((row) => createWorkspaceItem(type, row));
}

function updateWorkspaceHistory(item, replace = false) {
  const url = new URL(window.location.href);

  if (item) {
    url.searchParams.set("itemType", item.type);
    url.searchParams.set("itemId", item.id);
  } else {
    url.searchParams.delete("itemType");
    url.searchParams.delete("itemId");
  }

  const nextUrl = `${url.pathname}${url.search}${url.hash}`;
  const historyMethod = replace ? "replaceState" : "pushState";
  window.history[historyMethod]({}, "", nextUrl);
}

function getWorkspaceItemFromLocation(locationValue, data) {
  const searchParams = new URLSearchParams(locationValue.search);
  const itemType = searchParams.get("itemType");
  const itemId = searchParams.get("itemId");

  if (!itemType || !itemId) return null;

  const rowsByType = {
    Risk: data.risks,
    Control: data.controls,
    Test: data.tests,
    Policy: data.policies,
    Population: data.populations,
  };
  const row = rowsByType[itemType]?.find((item) => item.id === itemId);

  return row ? createWorkspaceItem(itemType, row) : null;
}

function downloadExcelFile(fileName, rows) {
  const headers = Array.from(
    rows.reduce((keys, row) => {
      Object.keys(row).forEach((key) => keys.add(key));
      return keys;
    }, new Set())
  );
  const table = [
    headers.join("\t"),
    ...rows.map((row) =>
      headers
        .map((header) => String(row[header] ?? "").replace(/\t|\n/g, " "))
        .join("\t")
    ),
  ].join("\n");
  const blob = new Blob([table], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}.xls`;
  link.click();
  URL.revokeObjectURL(url);
}

function getSelectedFramework(location) {
  const searchParams = new URLSearchParams(location.search);
  const selectedSlug = searchParams.get("framework");
  const stateFramework = location.state?.framework;

  if (stateFramework && slugifyFramework(stateFramework.name) === selectedSlug) {
    return {
      ...stateFramework,
      slug: selectedSlug,
    };
  }

  const framework = frameworks.find((item) => {
    const slug = item.slug || slugifyFramework(item.name);
    return slug === selectedSlug;
  });

  if (!framework) return null;

  return {
    ...framework,
    slug: selectedSlug,
  };
}

function slugifyFramework(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
