import {
  LayoutDashboard,
  ShieldCheck,
  FolderOpen,
  AlertTriangle,
  Building2,
  Lock,
  Settings,
  FileText,
  Bot
} from "lucide-react";



import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();

  const items = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard
    },
    {
  name: "AI Assistant",
  path: "/assistant",
  icon: Bot
},
    {
      name: "Frameworks",
      path: "/frameworks",
      icon: ShieldCheck
    },
    {
      name: "Policies",
      path: "/policies",
      icon: FileText
    },
    {
      name: "Evidence",
      path: "/evidence",
      icon: FolderOpen
    },
    {
      name: "Risks",
      path: "/risks",
      icon: AlertTriangle
    },
    {
      name: "Vendors",
      path: "/vendors",
      icon: Building2
    },
    {
      name: "Trust Center",
      path: "/trust-center",
      icon: Lock
    },
    {
      name: "Settings",
      path: "/settings",
      icon: Settings
    }
  ];

  return (
  <div className="w-72 bg-slate-950 dark:bg-black text-white min-h-screen p-6">

    <Link
      to="/dashboard"
      className="block text-3xl font-bold mb-10 hover:text-blue-400 transition"
      >
      SpectraMind
    </Link>

      <div className="space-y-2">

      {items.map((item) => {
        const Icon = item.icon;

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              location.pathname === item.path
                ? "bg-blue-600"
                : "hover:bg-slate-800 dark:hover:bg-slate-900"
            }`}
          >
            <Icon size={20} />

            <span>{item.name}</span>

          </Link>
        );
      })}

      </div>

    </div>
);
}