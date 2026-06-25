import { Bell, ShoppingCart, UserCircle } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

const notifications = [
  "3 vendor reviews are overdue",
  "SOC 2 control CC3.1 is incomplete",
  "Risk assessment due this week",
  "New evidence uploaded",
];

export default function Topbar() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 px-5 py-4 backdrop-blur-2xl dark:border-slate-800 dark:bg-slate-950/80 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="min-w-0">
          <div>
            <p className="text-sm font-bold text-slate-950 dark:text-white">
              Compliance workspace
            </p>
            <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
              SOC 2 readiness · 78% complete
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          <button
            type="button"
            className="relative inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
            aria-label="Open cart"
          >
            <ShoppingCart size={18} />
            <span className="hidden sm:inline">Cart</span>
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              2
            </span>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowNotifications((value) => !value);
                setShowProfile(false);
              }}
              className="relative rounded-full p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
              aria-label="Open notifications"
            >
              <Bell size={20} />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white">
                {notifications.length}
              </span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-3 w-80 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b border-slate-200 p-4 dark:border-slate-800">
                  <h3 className="font-bold text-slate-950 dark:text-white">Notifications</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Items needing attention
                  </p>
                </div>

                {notifications.map((notification) => (
                  <div
                    key={notification}
                    className="border-b border-slate-100 px-4 py-3 text-sm text-slate-700 last:border-b-0 dark:border-slate-800 dark:text-slate-300"
                  >
                    {notification}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowProfile((value) => !value);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 text-slate-900 transition hover:bg-slate-100 dark:text-white dark:hover:bg-slate-900"
            >
              <UserCircle size={30} />
              <div className="hidden text-left sm:block">
                <p className="text-sm font-bold leading-tight">Admin</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Organization</p>
              </div>
            </button>

            {showProfile && (
              <div className="absolute right-0 top-full mt-3 w-56 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900">
                <Link
                  to="/profile"
                  className="block px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  My Profile
                </Link>
                <Link
                  to="/profile-settings"
                  className="block px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  Profile Settings
                </Link>
                <Link
                  to="/login"
                  className="block px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800"
                >
                  Logout
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
