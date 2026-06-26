import {
  Bot,
  Building2,
  ClipboardCheck,
  FileArchive,
  Radar,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: ClipboardCheck,
    title: "Control Management",
    description:
      "Assign owners, map controls to frameworks, and see what is ready, blocked, or due.",
  },
  {
    icon: FileArchive,
    title: "Evidence Repository",
    description:
      "Collect audit artifacts in structured workflows with status, owner, and review context.",
  },
  {
    icon: Radar,
    title: "Risk Register",
    description:
      "Score, prioritize, and track mitigation work without losing the business decision trail.",
  },
  {
    icon: Building2,
    title: "Vendor Reviews",
    description:
      "Keep third-party security questionnaires, renewals, and risk posture in one place.",
  },
  {
    icon: ShieldCheck,
    title: "Trust Center",
    description:
      "Publish the right security posture to customers while keeping sensitive evidence gated.",
  },
  {
    icon: Bot,
    title: "AI Assistant",
    description:
      "Ask about controls, policies, risks, and evidence to get faster compliance answers.",
  },
];

export default function Features() {
  return (
    <section className="bg-white px-6 py-24 dark:bg-slate-950 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-300">
            Platform
          </p>
          <h2 className="mt-3 text-4xl font-bold text-slate-950 dark:text-white md:text-5xl">
            The daily workspace for compliance teams.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
            Replace scattered spreadsheets, drive-by chat requests, and audit
            scramble with a shared system of record for security operations.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="group rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-950/5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-900"
              >
                <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-950 dark:text-blue-300">
                  <Icon size={22} />
                </div>

                <h3 className="text-xl font-bold text-slate-950 dark:text-white">
                  {feature.title}
                </h3>

                <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
