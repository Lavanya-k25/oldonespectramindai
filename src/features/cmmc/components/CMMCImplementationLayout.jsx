import {
  BarChart3,
  ClipboardList,
  FileText,
  Library,
  Search,
  ShieldCheck,
  Target,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import AppShell from "../../../components/layout/AppShell";
import { useCMMCWorkspaceFilters } from "./CMMCWorkspaceFilters";

const navigationItems = [
  { label: "Scope", path: "/cmmc", icon: Library, match: ["/cmmc", "/cmmc/scope"] },
  { label: "Gap Wizard", path: "/cmmc/gap-wizard", icon: Target },
  { label: "Organization", path: "/cmmc/organization", icon: ClipboardList },
  { label: "SPRS Score", path: "/cmmc/sprs-score", icon: BarChart3 },
  { label: "Auditor", path: "/cmmc/auditor", icon: Search },
  { label: "Evidence", path: "/cmmc/evidence", icon: FileText },
];

const domainOptions = [
  ["all", "All Domains"],
  ["AC", "Access Control"],
  ["AT", "Awareness and Training"],
  ["AU", "Audit and Accountability"],
  ["IR", "Incident Response"],
  ["MA", "Maintenance"],
  ["MP", "Media Protection"],
  ["PS", "Personnel Security"],
  ["PE", "Physical Protection"],
  ["RA", "Risk Assessment"],
  ["CA", "Security Assessment"],
  ["SC", "System and Communications Protection"],
  ["SI", "System and Information Integrity"],
];

const statusOptions = ["All", "Not Started", "In Progress", "Completed"];

export default function CMMCImplementationLayout({ children }) {
  const location = useLocation();
  const {
    searchQuery,
    domainFilter,
    statusFilter,
    setSearchQuery,
    setDomainFilter,
    setStatusFilter,
    resetWorkspace,
  } = useCMMCWorkspaceFilters();

  return (
    <AppShell>
      <div className="space-y-4 text-slate-900">
          <header className="rounded-lg border border-white/75 bg-[#fffdf8]/78 p-4 shadow-xl shadow-slate-900/5 backdrop-blur-2xl">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <Link
                to="/cmmc"
                className="flex min-w-max items-center gap-3 rounded-lg transition hover:bg-white/50"
              >
                <span className="grid h-11 w-11 place-items-center rounded-lg border border-blue-600/25 bg-blue-50 text-blue-700 shadow-lg shadow-blue-600/10">
                  <ShieldCheck size={24} />
                </span>
                <span>
                  <span className="block text-lg font-black tracking-normal text-slate-950">
                    CMMC Compliance Tracker
                  </span>
                  <span className="block text-xs font-semibold text-slate-500">
                    110 Controls · SPRS Scoring · Audit-Ready Documents
                  </span>
                </span>
              </Link>

              <nav className="flex gap-2 overflow-x-auto pb-1 xl:justify-center xl:pb-0">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const active =
                    (item.match || [item.path]).includes(location.pathname) ||
                    (item.label === "Scope" && location.pathname === "/implementation");

                  return (
                    <Link
                      key={item.label}
                      to={item.path}
                      className={`flex min-w-[88px] flex-col items-center justify-center gap-1 rounded-lg border px-3 py-2 text-xs font-black transition ${
                        active
                          ? "border-blue-600/25 bg-white text-blue-800 shadow-lg shadow-blue-600/10"
                          : "border-transparent text-slate-600 hover:border-blue-600/15 hover:bg-white/62 hover:text-slate-900"
                      }`}
                    >
                      <Icon size={18} className={active ? "text-blue-700" : "text-slate-500"} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </header>

          <section className="rounded-lg border border-white/75 bg-[#fffdf8]/72 p-3 shadow-xl shadow-slate-900/5 backdrop-blur">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-1 flex-col gap-2 lg:flex-row lg:items-center">
                <label className="relative block w-full max-w-xs">
                  <Search
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <span className="sr-only">Search CMMC workspace</span>
                  <input
                    type="search"
                    placeholder="Search controls, documents, notes..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="h-9 w-full rounded-lg border border-slate-200 bg-white/80 pl-9 pr-3 text-sm font-semibold outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(status)}
                      className={`h-9 rounded-lg border px-4 text-sm font-black transition ${
                        statusFilter === status
                          ? "border-blue-600/30 bg-slate-950 text-white shadow-sm"
                          : "border-slate-200 bg-white/80 text-slate-600 hover:bg-white hover:text-blue-700"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
                <select
                  value={domainFilter}
                  onChange={(event) => setDomainFilter(event.target.value)}
                  className="h-9 w-full max-w-xs rounded-lg border border-slate-200 bg-white/80 px-3 text-sm font-semibold text-slate-600 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                >
                  {domainOptions.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={resetWorkspace}
                className="h-9 rounded-lg border border-red-200 bg-white px-4 text-sm font-bold text-red-500 transition hover:bg-red-50 hover:text-red-600"
              >
                Reset
              </button>
            </div>
          </section>

        {children}
      </div>
    </AppShell>
  );
}
