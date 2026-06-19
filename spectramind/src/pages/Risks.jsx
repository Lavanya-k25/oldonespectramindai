import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";

const risks = [
  {
    id: 1,
    title: "Weak Password Policy",
    severity: "High",
    owner: "Security Team",
    dueDate: "July 15, 2026",
    status: "Open"
  },
  {
    id: 2,
    title: "Unpatched Server",
    severity: "Critical",
    owner: "Infrastructure Team",
    dueDate: "June 30, 2026",
    status: "In Progress"
  },
  {
    id: 3,
    title: "Missing Access Review",
    severity: "Medium",
    owner: "Compliance Team",
    dueDate: "August 01, 2026",
    status: "Open"
  }
];

export default function Risks() {
  return (
    <div className="flex">

      <Sidebar />

      <div className="flex-1 bg-slate-100 dark:bg-slate-900 min-h-screen">

        <Topbar />

        <div className="p-8">

          <div className="flex justify-between items-center mb-8">

            <h1 className="text-4xl font-bold text-black dark:text-white">
              Risk Register
            </h1>

            <button className="bg-blue-600 text-white px-5 py-3 rounded-xl">
              Add Risk
            </button>

          </div>

          <div className="grid gap-6">

            {risks.map((risk) => (

              <div
                key={risk.id}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6"
              >

                <div className="flex justify-between">

                  <h2 className="text-2xl font-bold text-black dark:text-white">
                    {risk.title}
                  </h2>

                  <span
                    className={`px-4 py-2 rounded-full text-sm
                      ${
                        risk.severity === "Critical"
                          ? "bg-red-100 text-red-700"
                          : risk.severity === "High"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                  >
                    {risk.severity}
                  </span>

                </div>

                <div className="grid md:grid-cols-3 gap-4 mt-6">

                  <div>

                    <p className="text-gray-500 dark:text-gray-300 text-sm">
                      Owner
                    </p>

                    <p className="font-semibold text-black dark:text-white">
                      {risk.owner}
                    </p>

                  </div>

                  <div>

                    <p className="text-gray-500 dark:text-gray-300 text-sm">
                      Due Date
                    </p>

                    <p className="font-semibold text-black dark:text-white">
                      {risk.dueDate}
                    </p>

                  </div>

                  <div>

                    <p className="text-gray-500 dark:text-gray-300 text-sm">
                      Status
                    </p>

                    <p className="font-semibold text-black dark:text-white">
                      {risk.status}
                    </p>

                  </div>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
}