import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";

export default function Profile() {
  return (
    <div className="flex">

      <Sidebar />

      <div className="flex-1 bg-slate-100 dark:bg-slate-900 min-h-screen">

        <Topbar />

        <div className="p-8">

          <h1 className="text-4xl font-bold text-black dark:text-white mb-8">
            My Profile
          </h1>

          <div className="grid md:grid-cols-3 gap-6">

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6">

              <div className="flex flex-col items-center">

                <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold">
                  A
                </div>

                <h2 className="mt-4 text-xl font-bold text-black dark:text-white">
                  Admin User
                </h2>

                <p className="text-gray-500 dark:text-gray-300">
                  Compliance Administrator
                </p>

              </div>

            </div>

            <div className="md:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow p-6">

              <h2 className="text-2xl font-bold text-black dark:text-white mb-6">
                User Information
              </h2>

              <div className="space-y-4">

                <div>
                  <p className="text-gray-500 dark:text-gray-300">
                    Full Name
                  </p>

                  <p className="font-semibold text-black dark:text-white">
                    Admin User
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 dark:text-gray-300">
                    Email
                  </p>

                  <p className="font-semibold text-black dark:text-white">
                    admin@spectramind.ai
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 dark:text-gray-300">
                    Role
                  </p>

                  <p className="font-semibold text-black dark:text-white">
                    Compliance Administrator
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 dark:text-gray-300">
                    Department
                  </p>

                  <p className="font-semibold text-black dark:text-white">
                    Security & Compliance
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}