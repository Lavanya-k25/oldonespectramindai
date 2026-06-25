import { Building2, Plus } from "lucide-react";
import AppShell from "../components/layout/AppShell";

const vendors = [
  { id: 1, name: "AWS", category: "Cloud Provider", risk: "Low", reviewDate: "July 2026" },
  { id: 2, name: "GitHub", category: "Source Control", risk: "Medium", reviewDate: "August 2026" },
  { id: 3, name: "Slack", category: "Communication", risk: "Low", reviewDate: "September 2026" },
  { id: 4, name: "Google Workspace", category: "Identity & Email", risk: "Medium", reviewDate: "October 2026" },
];

const riskStyles = {
  Low: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  Medium: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
};

export default function Vendors() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-300">
              Third parties
            </p>
            <h1 className="mt-2 text-4xl font-bold text-slate-950 dark:text-white">
              Vendor Management
            </h1>
            <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
              Keep vendor ownership, renewal dates, and risk posture easy to review.
            </p>
          </div>

          <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-semibold text-white transition hover:bg-blue-700">
            <Plus size={18} />
            Add Vendor
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {vendors.map((vendor) => (
            <article
              key={vendor.id}
              className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                    <Building2 size={21} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-950 dark:text-white">
                      {vendor.name}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {vendor.category}
                    </p>
                  </div>
                </div>

                <span className={`rounded-full px-3 py-1 text-sm font-bold ${riskStyles[vendor.risk]}`}>
                  {vendor.risk} Risk
                </span>
              </div>

              <div className="mt-6 rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Next review
                </p>
                <p className="mt-1 font-bold text-slate-950 dark:text-white">
                  {vendor.reviewDate}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
