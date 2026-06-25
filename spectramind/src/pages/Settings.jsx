import AppShell from "../components/layout/AppShell";

export default function Settings() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-300">
            Workspace
          </p>
          <h1 className="mt-2 text-4xl font-bold text-slate-950 dark:text-white">
            Settings
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
            Manage organization details and product preferences.
          </p>
        </div>

        <section className="max-w-3xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-5">
            <Field label="Organization Name" defaultValue="SpectraMind" />
            <Field label="Contact Email" defaultValue="admin@spectramind.ai" />
          </div>

          <button className="mt-6 rounded-lg bg-primary px-5 py-3 font-semibold text-white transition hover:bg-blue-700">
            Save Changes
          </button>
        </section>
      </div>
    </AppShell>
  );
}

function Field({ label, defaultValue }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
        {label}
      </span>
      <input
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
        defaultValue={defaultValue}
      />
    </label>
  );
}
