import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";

const vendors = [
  {
    id: 1,
    name: "AWS",
    category: "Cloud Provider",
    risk: "Low",
    reviewDate: "July 2026"
  },
  {
    id: 2,
    name: "GitHub",
    category: "Source Control",
    risk: "Medium",
    reviewDate: "August 2026"
  },
  {
    id: 3,
    name: "Slack",
    category: "Communication",
    risk: "Low",
    reviewDate: "September 2026"
  },
  {
    id: 4,
    name: "Google Workspace",
    category: "Identity & Email",
    risk: "Medium",
    reviewDate: "October 2026"
  }
];

export default function Vendors() {
  return (
    <div className="flex">

      <Sidebar />

      <div className="flex-1 bg-slate-100 dark:bg-slate-900 min-h-screen">

        <Topbar />

        <div className="p-8">

          <div className="flex justify-between items-center mb-8">

            <h1 className="text-4xl font-bold text-black dark:text-white">
              Vendor Management
            </h1>

            <button className="bg-blue-600 text-white px-5 py-3 rounded-xl">
              Add Vendor
            </button>

          </div>

          <div className="grid gap-6">

            {vendors.map((vendor) => (

              <div
                key={vendor.id}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6"
              >

                <div className="flex justify-between items-center">

                  <h2 className="text-2xl font-bold text-black dark:text-white">
                    {vendor.name}
                  </h2>

                  <span
                    className={`px-4 py-2 rounded-full text-sm ${
                      vendor.risk === "Low"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {vendor.risk} Risk
                  </span>

                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-6">

                  <div>

                    <p className="text-gray-500 dark:text-gray-300 text-sm">
                      Category
                    </p>

                    <p className="font-semibold text-black dark:text-white">
                      {vendor.category}
                    </p>

                  </div>

                  <div>

                    <p className="text-gray-500 dark:text-gray-300 text-sm">
                      Next Review
                    </p>

                    <p className="font-semibold text-black dark:text-white">
                      {vendor.reviewDate}
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