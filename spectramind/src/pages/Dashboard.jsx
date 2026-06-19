import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";

import ComplianceChart from "../components/dashboard/ComplianceChart";
import ActivityFeed from "../components/dashboard/ActivityFeed";

export default function Dashboard() {
  return (
    <div className="flex">

      <Sidebar />

      <div className="flex-1 bg-slate-100 dark:bg-slate-900 min-h-screen">

        <Topbar />

        <div className="p-8">

          <h1 className="text-4xl font-bold mb-8 text-black dark:text-white">
            Dashboard
          </h1>

          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-8 mb-8">

  <h2 className="text-3xl font-bold">
    Audit Readiness
  </h2>

  <p className="mt-2 text-blue-100">
    You're 78% ready for your next SOC 2 audit.
  </p>

  <div className="bg-white/20 rounded-full h-4 mt-6">

    <div
      className="bg-white h-4 rounded-full"
      style={{ width: "78%" }}
    />

  </div>

</div>

          {/* Stats Cards */}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow">

  <p className="text-gray-500 dark:text-gray-300">
    Compliance Score
  </p>

  <h2 className="text-4xl font-bold mt-2 text-black dark:text-white">
    85%
  </h2>

  <p className="text-green-600 mt-2">
    ↑ 12% this month
  </p>

</div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow">

  <p className="text-gray-500 dark:text-gray-300">
    Evidence Files
  </p>

  <h2 className="text-4xl font-bold mt-2 text-black dark:text-white">
    124
  </h2>

  <p className="text-green-600 mt-2">
    +24 uploaded
  </p>

</div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow">

 <p className="text-gray-500 dark:text-gray-300">
    Open Risks
  </p>

  <h2 className="text-4xl font-bold mt-2 text-black dark:text-white">
    5
  </h2>

  <p className="text-red-500 mt-2">
    Requires attention
  </p>

</div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow">

  <p className="text-gray-500 dark:text-gray-300">
    Vendors
  </p>

  <h2 className="text-4xl font-bold mt-2 text-black dark:text-white">
    21
  </h2>

  <p className="text-gray-500 dark:text-gray-300 mt-2">
  3 pending reviews
</p>

</div>

          </div>

          {/* Chart + Activity */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">

            <ComplianceChart />

            <ActivityFeed />

          </div>

        </div>

      </div>

    </div>
  );
}