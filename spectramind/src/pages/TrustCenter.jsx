import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";

export default function TrustCenter() {
  return (
    <div className="flex">

      <Sidebar />

      <div className="flex-1 bg-slate-100 dark:bg-slate-900 min-h-screen">

        <Topbar />

        <div className="p-8">

          <h1 className="text-4xl font-bold mb-8 text-black dark:text-white">
            Trust Center
          </h1>

          <div className="grid md:grid-cols-2 gap-6">

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow">

              <h2 className="font-bold text-xl text-black dark:text-white">
                Compliance Status
              </h2>

              <p className="mt-4 text-gray-700 dark:text-gray-300">
                SOC 2 In Progress
              </p>

            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow">

              <h2 className="font-bold text-xl text-black dark:text-white">
                Security Contact
              </h2>

              <p className="mt-4 text-gray-700 dark:text-gray-300">
                security@spectramind.ai
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}