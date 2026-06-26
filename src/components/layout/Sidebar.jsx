import {
  AlertTriangle,
  Bot,
  Building2,
  CheckSquare,
  ClipboardCheck,
  ClipboardList,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Lock,
  MessageSquare,
  Settings,
  ShieldCheck,
  Users,
  Wrench,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const dashboardItem = { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard };

const complianceItems = [
  { name: "AI Assistant", path: "/assistant", icon: Bot },
  { name: "Frameworks", path: "/frameworks", icon: ShieldCheck },
  { name: "Policies", path: "/policies", icon: FileText },
  { name: "Evidence", path: "/evidence", icon: FolderOpen },
  { name: "Risks", path: "/risks", icon: AlertTriangle },
  { name: "Vendors", path: "/vendors", icon: Building2 },
  { name: "Questionnaire", path: "/questionnaire", icon: ClipboardList },
  { name: "Implementation", path: "/implementation", icon: Wrench },
  { name: "Employees", path: "/employees", icon: Users },
  { name: "Audits", path: "/audits", icon: ClipboardCheck },
  { name: "Comments", path: "/comments", icon: MessageSquare },
  { name: "Tasks", path: "/tasks", icon: CheckSquare },
];

const workspaceItems = [
  { name: "Trust Center", path: "/trust-center", icon: Lock },
  { name: "Settings", path: "/settings", icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 overflow-y-auto border-r border-slate-200 bg-white px-4 py-5 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white lg:block">
      <Link
        to="/dashboard"
        className="flex items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-slate-50 dark:hover:bg-white/5"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-lg font-bold text-white">
          S
        </span>
        <div>
          <p className="text-xl font-bold leading-tight">SpectraMind</p>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Trust operations
          </p>
        </div>
      </Link>

      <nav className="mt-6 space-y-5">
        <NavItem item={dashboardItem} activePath={location.pathname} />

        <NavGroup title="Compliance" items={complianceItems} activePath={location.pathname} />

        <NavGroup title="Workspace" items={workspaceItems} activePath={location.pathname} />
      </nav>
    </aside>
  );
}

function NavGroup({ title, items, activePath }) {
  return (
    <div>
      <p className="mb-1.5 px-3 text-xs font-bold uppercase tracking-widest text-slate-400">
        {title}
      </p>
      <div className="space-y-1">
        {items.map((item) => (
          <NavItem key={item.path} item={item} activePath={activePath} />
        ))}
      </div>
    </div>
  );
}

function NavItem({ item, activePath }) {
  const Icon = item.icon;
  const isActive = activePath === item.path;

  return (
    <Link
      to={item.path}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition ${
        isActive
          ? "bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-200"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
      }`}
    >
      <Icon size={17} />
      <span>{item.name}</span>
    </Link>
  );
}
