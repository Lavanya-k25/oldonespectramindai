import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";

const policies = [
  {
    name: "Security Policy",
    owner: "Security Team",
    status: "Approved"
  },
  {
    name: "Access Control Policy",
    owner: "IT Team",
    status: "Approved"
  },
  {
    name: "Password Policy",
    owner: "Security Team",
    status: "Review Required"
  },
  {
    name: "Incident Response Policy",
    owner: "Security Team",
    status: "Approved"
  }
];

export default function Policies() {
  return (
    <div className="flex">

      <Sidebar />

      <div className="flex-1 bg-slate-100 dark:bg-slate-900 min-h-screen">

        <Topbar />

        <div className="p-8">

          <div className="flex justify-between items-center mb-8">

            <h1 className="text-4xl font-bold text-black dark:text-white">
              Policies
            </h1>

            <button className="bg-blue-600 text-white px-5 py-3 rounded-xl">
              Create Policy
            </button>

          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow">

            {policies.map((policy) => (

              <div
                key={policy.name}
                className="p-6 border-b border-gray-200 dark:border-slate-700 flex justify-between"
              >

                <div>

                  <h3 className="font-bold text-black dark:text-white">
                    {policy.name}
                  </h3>

                  <p className="text-gray-500 dark:text-gray-300">
                    Owner: {policy.owner}
                  </p>

                </div>

                <span
                  className={`px-4 py-2 rounded-full text-sm ${
                    policy.status === "Approved"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {policy.status}
                </span>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
}