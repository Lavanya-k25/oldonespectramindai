import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";

import { Link } from "react-router-dom";
import { controls } from "../data/controls";

export default function SOC2() {
  return (
    <div className="flex">

      <Sidebar />

      <div className="flex-1 bg-slate-100 dark:bg-slate-900 min-h-screen">

        <Topbar />

        <div className="p-8">

          <h1 className="text-4xl font-bold text-black dark:text-white">
            SOC 2 Controls
          </h1>

          <p className="text-gray-500 dark:text-gray-300 mt-2">
            Monitor and manage SOC 2 controls.
          </p>

          {/* Summary Cards */}

          <div className="grid md:grid-cols-3 gap-6 mt-8">

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow">

              <p className="text-gray-500 dark:text-gray-300">
                Total Controls
              </p>

              <h2 className="text-4xl font-bold text-black dark:text-white">
                64
              </h2>

            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow">

              <p className="text-gray-500 dark:text-gray-300">
                Completed
              </p>

              <h2 className="text-4xl font-bold text-green-600">
                52
              </h2>

            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow">

              <p className="text-gray-500 dark:text-gray-300">
                Missing
              </p>

              <h2 className="text-4xl font-bold text-red-600">
                12
              </h2>

            </div>

          </div>

          {/* Readiness Bar */}

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow mt-8">

            <div className="flex justify-between mb-3 text-black dark:text-white">

              <span className="font-semibold">
                SOC 2 Readiness
              </span>

              <span>
                81%
              </span>

            </div>

            <div className="bg-gray-200 dark:bg-slate-700 rounded-full h-4">

              <div
                className="bg-blue-600 h-4 rounded-full"
                style={{ width: "81%" }}
              />

            </div>

          </div>

          {/* Controls Table */}

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow mt-8">

            <div className="p-6 border-b border-gray-200 dark:border-slate-700">

              <h2 className="text-2xl font-bold text-black dark:text-white">
                Controls
              </h2>

            </div>

            {controls.map((control) => (

              <div
                key={control.id}
                className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700"
              >

                <div>

                  <Link to={`/control/${control.id}`}>

                    <h3 className="font-bold text-blue-600 hover:underline">
                      {control.id}
                    </h3>

                  </Link>

                  <p className="text-gray-600 dark:text-gray-300">
                    {control.name}
                  </p>

                </div>

                <div className="flex items-center gap-6">

                  <span className="text-black dark:text-white">
                    Evidence: {control.evidence}
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      control.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : control.status === "In Progress"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {control.status}
                  </span>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
}