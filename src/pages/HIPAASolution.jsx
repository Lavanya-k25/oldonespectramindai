import { ArrowRight, FileHeart, KeyRound, ShieldCheck, Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/layout/Navbar";

const safeguards = [
  ["Administrative", "Assign owners, document policies, and track review cycles."],
  ["Technical", "Monitor access, evidence, and security control implementation."],
  ["Vendor", "Track business associate reviews and third-party risk signals."],
];

export default function HIPAASolution() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />

      <main>
        <section className="border-b border-slate-200 bg-slate-50 px-6 py-24 dark:border-slate-800 dark:bg-slate-900 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-300">
                HIPAA Compliance
              </p>
              <h1 className="mt-4 text-5xl font-bold leading-tight text-slate-950 dark:text-white md:text-6xl">
                Coordinate privacy safeguards without losing the thread.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                SpectraMind gives healthcare and health-tech teams a cleaner way
                to manage safeguards, policies, evidence, vendors, and risk work.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  Get Started
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/testimonials"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-800 transition hover:bg-white dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-950"
                >
                  View Product
                </Link>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-950">
              <div className="rounded-xl bg-slate-950 p-6 text-white dark:bg-blue-600">
                <Stethoscope size={30} />
                <h2 className="mt-5 text-3xl font-bold">PHI-focused workflows</h2>
                <p className="mt-2 text-slate-300 dark:text-blue-100">
                  Keep policy work, evidence requests, and vendor follow-ups visible.
                </p>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <MiniMetric icon={ShieldCheck} label="Safeguards" />
                <MiniMetric icon={KeyRound} label="Access" />
                <MiniMetric icon={FileHeart} label="Evidence" />
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-5 md:grid-cols-3">
              {safeguards.map(([title, copy]) => (
                <div
                  key={title}
                  className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
                >
                  <h2 className="text-xl font-bold text-slate-950 dark:text-white">
                    {title} safeguards
                  </h2>
                  <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">
                    {copy}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function MiniMetric({ icon: Icon, label }) {
  return (
    <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
      <Icon size={21} className="text-blue-600 dark:text-blue-300" />
      <p className="mt-3 font-semibold text-slate-950 dark:text-white">{label}</p>
    </div>
  );
}
