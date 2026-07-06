import { useUser } from "../auth/UserContext";
import AppShell from "../components/layout/AppShell";

export default function ProfileSettings() {
  const { user } = useUser();

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-300">
            Account
          </p>
          <h1 className="mt-2 text-4xl font-bold text-slate-950 dark:text-white">
            Profile Settings
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
            Update your profile information and account credentials.
          </p>
        </div>

        <section className="max-w-3xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-5">
            <Field label="Full Name" defaultValue={user?.name || ""} />
            <Field label="Email" defaultValue={user?.email || ""} />
            <Field label="Password" defaultValue="password" type="password" />
          </div>

          <button className="mt-6 rounded-lg bg-primary px-5 py-3 font-semibold text-white transition hover:bg-blue-700">
            Update Profile
          </button>
        </section>
      </div>
    </AppShell>
  );
}

function Field({ label, defaultValue, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
        {label}
      </span>
      <input
        type={type}
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
        defaultValue={defaultValue}
      />
    </label>
  );
}
