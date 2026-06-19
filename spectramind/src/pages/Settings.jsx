import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";

export default function Settings() {
  return (
    <div className="flex">

      <Sidebar />

      <div className="flex-1 bg-slate-100 dark:bg-slate-900 min-h-screen">

        <Topbar />

        <div className="p-8">

          <h1 className="text-4xl font-bold mb-8 text-black dark:text-white">
            Settings
          </h1>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6">

            <label className="block mb-2 text-black dark:text-white">
              Organization Name
            </label>

            <input
              className="
                border
                border-gray-300
                dark:border-slate-700
                p-3
                rounded-lg
                w-full
                mb-5
                bg-white
                dark:bg-slate-700
                text-black
                dark:text-white
              "
              defaultValue="SpectraMind"
            />

            <label className="block mb-2 text-black dark:text-white">
              Contact Email
            </label>

            <input
              className="
                border
                border-gray-300
                dark:border-slate-700
                p-3
                rounded-lg
                w-full
                bg-white
                dark:bg-slate-700
                text-black
                dark:text-white
              "
              defaultValue="admin@spectramind.ai"
            />

          </div>

        </div>

      </div>

    </div>
  );
}