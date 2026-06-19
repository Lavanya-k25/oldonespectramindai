import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";

import { frameworks } from "../data/mockData";

import { Link } from "react-router-dom";

export default function Frameworks() {
  return (
    <div className="flex">

      <Sidebar />

      <div className="flex-1 bg-slate-100 dark:bg-slate-900 min-h-screen">

        <Topbar />

        <div className="p-8">

          <h1 className="text-4xl font-bold mb-8 text-black dark:text-white">
            Compliance Frameworks
          </h1>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

            {frameworks.map((framework) => (

              <div
                key={framework.id}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6"
              >

                <h2 className="text-2xl font-bold text-black dark:text-white">
                  {framework.name}
                </h2>

                <p className="text-gray-500 dark:text-gray-300 mt-2">
                  {framework.status}
                </p>

                <div className="mt-6">

                  <div className="flex justify-between mb-2 text-black dark:text-white">

                    <span>Progress</span>

                    <span>
                      {framework.progress}%
                    </span>

                  </div>

                  <div className="bg-gray-200 dark:bg-slate-700 h-3 rounded-full">

                    <div
                      className="bg-blue-600 h-3 rounded-full"
                      style={{
                        width: `${framework.progress}%`
                      }}
                    />

                  </div>

                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">

                  <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-xl">

                    <p className="text-gray-500 dark:text-gray-300 text-sm">
                      Controls
                    </p>

                    <h3 className="text-2xl font-bold text-black dark:text-white">
                      {framework.controls}
                    </h3>

                  </div>

                  <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-xl">

                    <p className="text-gray-500 dark:text-gray-300 text-sm">
                      Evidence
                    </p>

                    <h3 className="text-2xl font-bold text-black dark:text-white">
                      {framework.evidence}
                    </h3>

                  </div>

                </div>

                {framework.name === "SOC 2" ? (
                  <Link to="/soc2">
                    <button className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl">
                      View Framework
                    </button>
                  </Link>
                ) : (
                  <button className="mt-6 w-full bg-gray-400 text-white py-3 rounded-xl">
                    Coming Soon
                  </button>
                )}

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
}