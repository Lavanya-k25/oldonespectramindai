import { AlertTriangle, CircleDot } from "lucide-react";
import { Link } from "react-router-dom";
import { CMMCImplementationLayout } from "../components";

export default function CMMCGapWizardPage() {
  return (
    <CMMCImplementationLayout>
      <div className="mx-auto max-w-[760px] space-y-3 pt-6">
        <div className="flex flex-col gap-3 rounded-md border border-amber-300 bg-[#fff3bf] px-4 py-3 text-amber-950 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle size={17} className="shrink-0 text-amber-700" />
            <p className="text-[13px] font-black leading-5">
              System scope not completed.
              <span className="ml-2 font-semibold text-amber-800">
                Some controls may not reflect your actual environment.
              </span>
            </p>
          </div>
          <Link
            to="/cmmc"
            className="inline-flex min-h-8 shrink-0 items-center justify-center rounded-md border border-amber-200 bg-white px-3 text-[12px] font-black text-slate-700 shadow-sm transition hover:bg-amber-50"
          >
            Complete Scoping →
          </Link>
        </div>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
          <div className="bg-gradient-to-r from-[#1d123f] to-[#684cf5] px-7 py-6 text-white">
            <div className="flex items-center gap-2">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-amber-300 text-[#1d123f]">
                <CircleDot size={12} />
              </span>
              <h1 className="text-xl font-black tracking-normal">Gap Wizard</h1>
            </div>
            <p className="mt-2 text-[13px] font-semibold leading-5 text-violet-100">
              Walk through your open gaps one at a time, plain English explanations, concrete action steps, highest impact first.
            </p>
          </div>

          <div className="grid border-b border-slate-100 text-center sm:grid-cols-3">
            <ProgressMetric value="110" label="Open Gaps" />
            <ProgressMetric value="44" label="Critical (5-PT)" />
            <ProgressMetric value="-203" label="Current SPRS" />
          </div>

          <div className="space-y-5 px-7 py-6 text-[13px] font-semibold leading-6 text-slate-600">
            <p>
              The wizard will show you each incomplete control starting with the highest-value ones. For each control you will see what it actually means in plain English, what "done" looks like for a small business, and specific first steps to take.
            </p>
            <p>
              As you work through gaps and mark controls complete in the <strong className="text-slate-900">Organization</strong> tab, your SPRS score updates in real time. You're currently at risk of losing <strong className="text-slate-900">313 SPRS points</strong> from the maximum score of 110.
            </p>

            <button
              type="button"
              className="inline-flex min-h-10 items-center justify-center rounded-md bg-[#5b4bea] px-5 text-[13px] font-black text-white shadow-lg shadow-violet-600/20 transition hover:bg-[#4f40dc]"
            >
              Start Reviewing My 110 Gaps →
            </button>
          </div>
        </section>
      </div>
    </CMMCImplementationLayout>
  );
}

function ProgressMetric({ value, label }) {
  return (
    <div className="border-slate-100 px-4 py-6 sm:border-r last:sm:border-r-0">
      <p className="text-3xl font-black leading-none text-red-500">{value}</p>
      <p className="mt-2 text-[10px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
    </div>
  );
}
