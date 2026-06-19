import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";

export default function ProfileSettings() {
  return (
    <div className="flex">

      <Sidebar />

      <div className="flex-1 bg-slate-100 dark:bg-slate-900 min-h-screen">

        <Topbar />

        <div className="p-8">

          <h1 className="text-4xl font-bold text-black dark:text-white mb-8">
            Profile Settings
          </h1>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6">

            <label className="block mb-2 text-black dark:text-white">
              Full Name
            </label>

            <input
              className="w-full border p-3 rounded-lg mb-5 bg-white dark:bg-slate-700 dark:text-white"
              defaultValue="Admin"
            />

            <label className="block mb-2 text-black dark:text-white">
              Email
            </label>

            <input
              className="w-full border p-3 rounded-lg mb-5 bg-white dark:bg-slate-700 dark:text-white"
              defaultValue="admin@spectramind.ai"
            />

            <label className="block mb-2 text-black dark:text-white">
              Password
            </label>

            <input
              type="password"
              className="w-full border p-3 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
              defaultValue="password"
            />

          </div>

        </div>

      </div>

    </div>
  );
}