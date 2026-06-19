import {
  Bell,
  Search,
  UserCircle
} from "lucide-react";

import { useState } from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

export default function Topbar() {

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [showProfile, setShowProfile] =
    useState(false);

  const notifications = [
    "3 vendor reviews are overdue",
    "SOC 2 control CC3.1 is incomplete",
    "Risk assessment due this week",
    "New evidence uploaded"
  ];

  return (
    <div className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 px-8 py-4 flex items-center justify-between">

      {/* Search */}

      <div className="relative">

        <Search
          size={18}
          className="absolute left-3 top-3 text-gray-400"
        />

        <input
          placeholder="Search..."
          className="pl-10 pr-4 py-2 border rounded-xl w-80 bg-white dark:bg-slate-700 text-black dark:text-white"
        />

      </div>

      {/* Right Side */}

      <div className="flex items-center gap-5">

        <ThemeToggle />

        {/* Notification Bell */}

        <div className="relative">

          <button
            onClick={() => {
              setShowNotifications(
                !showNotifications
              );

              setShowProfile(false);
            }}
            className="relative flex items-center justify-center hover:scale-105 transition"
          >

            <Bell
              size={22}
              className="text-yellow-500"
            />

            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {notifications.length}
            </span>

          </button>

          {showNotifications && (

            <div className="absolute right-[-40px] top-full mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border dark:border-slate-700 z-50">

              <div className="p-4 border-b dark:border-slate-700">

                <h3 className="font-bold text-black dark:text-white">
                  Notifications
                </h3>

              </div>

              {notifications.map(
                (notification, index) => (

                  <div
                    key={index}
                    className="p-4 border-b dark:border-slate-700 text-sm text-gray-700 dark:text-gray-300"
                  >
                    {notification}
                  </div>

                )
              )}

            </div>

          )}

        </div>

        {/* User Profile */}

        <div className="relative">

          <button
            onClick={() => {
              setShowProfile(
                !showProfile
              );

              setShowNotifications(
                false
              );
            }}
            className="flex items-center gap-2 text-black dark:text-white hover:opacity-80 transition"
          >

            <UserCircle size={32} />

            <div>

              <p className="font-semibold">
                Admin
              </p>

              <p className="text-xs text-gray-500 dark:text-gray-300">
                Organization
              </p>

            </div>

          </button>

          {showProfile && (

            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border dark:border-slate-700 z-50">

              <Link to="/profile">
              <div className="p-4 hover:bg-slate-100 dark:hover:bg-slate-700 text-black dark:text-white">
              My Profile
            </div>

              </Link>

<Link to="/profile-settings">

  <div className="p-4 hover:bg-slate-100 dark:hover:bg-slate-700 text-black dark:text-white">
    Profile Settings
  </div>

</Link>

<Link to="/login">

  <div className="p-4 hover:bg-slate-100 dark:hover:bg-slate-700 text-red-600">
    Logout
  </div>

</Link>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}