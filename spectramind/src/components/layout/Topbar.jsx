import { Bell, ShoppingCart, UserCircle } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../auth/UserContext";
import ThemeToggle from "./ThemeToggle";

const notifications = [
  "3 vendor reviews are overdue",
  "SOC 2 control CC3.1 is incomplete",
  "Risk assessment due this week",
  "New evidence uploaded",
];

export default function Topbar() {
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = () => {
    logout();
    setShowProfile(false);
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-[#fffdf8]/76 px-5 py-4 shadow-lg shadow-slate-900/5 backdrop-blur-2xl sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-black text-slate-900">
            Compliance workspace
          </p>
          <p className="mt-0.5 text-xs font-medium text-slate-500">
            SOC 2 readiness - 78% complete
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          <button
            type="button"
            className="relative inline-flex items-center gap-2 rounded-lg border border-blue-600/25 bg-white/62 px-4 py-2 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-white hover:text-blue-700"
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
              className="relative rounded-lg p-2 text-slate-600 transition hover:bg-white/62 hover:text-blue-700"
              aria-label="Open notifications"
            >
              <Bell size={20} />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white">
                {notifications.length}
              </span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-3 w-80 overflow-hidden rounded-lg border border-white/80 bg-[#fffdf8]/95 shadow-2xl shadow-slate-900/10 backdrop-blur">
                <div className="border-b border-slate-200 p-4">
                  <h3 className="font-black text-slate-900">Notifications</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Items needing attention
                  </p>
                </div>

                {notifications.map((notification) => (
                  <div
                    key={notification}
                    className="border-b border-slate-100 px-4 py-3 text-sm text-slate-700 last:border-b-0"
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
              className="flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-3 text-slate-900 transition hover:bg-white/62"
            >
              <UserCircle size={30} />
              <div className="hidden text-left sm:block">
                <p className="text-sm font-black leading-tight">{user?.name || "User"}</p>
                <p className="text-xs text-slate-500">{user?.organizationName || "Organization"}</p>
              </div>
            </button>

            {showProfile && (
              <div className="absolute right-0 top-full mt-3 w-56 overflow-hidden rounded-lg border border-white/80 bg-[#fffdf8]/95 shadow-2xl shadow-slate-900/10 backdrop-blur">
                <Link
                  to="/profile"
                  className="block px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-blue-50 hover:text-blue-800"
                >
                  My Profile
                </Link>
                <Link
                  to="/profile-settings"
                  className="block px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-blue-50 hover:text-blue-800"
                >
                  Profile Settings
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
