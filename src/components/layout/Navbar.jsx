import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

const solutions = [
  ["SOC 2 Compliance", "Security and trust reporting", "/solutions/soc2"],
  ["ISO 27001", "Information security management", "/solutions/iso27001"],
  ["HIPAA", "Healthcare compliance", "/solutions/hipaa"],
];

const resources = [
  ["About", "/about"],
  ["FAQs", "/faq"],
  ["Contact", "/contact"],
];

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!navRef.current?.contains(event.target)) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const closeMenus = () => {
    setOpenMenu(null);
    setMobileOpen(false);
  };

  const handleBrandClick = () => {
    closeMenus();

    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <nav
      ref={navRef}
      className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90"
    >
      <div className="flex w-full items-center justify-between px-6 py-4 lg:px-10 xl:px-16">
        <Link to="/" className="flex items-center gap-3" onClick={handleBrandClick}>
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-lg font-bold text-white">
            S
          </span>
          <span className="text-xl font-bold text-slate-950 dark:text-white">
            SpectraMind
          </span>
        </Link>

        <div className="hidden items-center gap-7 text-sm font-semibold text-slate-700 dark:text-slate-200 lg:flex">
          <Dropdown
            id="solutions"
            label="Solutions"
            items={solutions}
            openMenu={openMenu}
            setOpenMenu={setOpenMenu}
          />
          <Dropdown
            id="resources"
            label="Resources"
            items={resources}
            openMenu={openMenu}
            setOpenMenu={setOpenMenu}
            compact
          />
          <Link to="/pricing" className="transition hover:text-primary">
            Pricing
          </Link>
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />
          <Link
            to="/testimonials"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900"
          >
            View Product
          </Link>
          <Link
            to="/login"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Get Started
          </Link>
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            aria-label="Toggle navigation"
            onClick={() => setMobileOpen((value) => !value)}
            className="rounded-lg border border-slate-300 p-2 text-slate-900 dark:border-slate-700 dark:text-white"
          >
            {mobileOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-6 py-5 dark:border-slate-800 dark:bg-slate-950 lg:hidden">
          <div className="space-y-5">
            <MobileGroup title="Solutions" items={solutions} onClick={closeMenus} />
            <MobileGroup title="Resources" items={resources} onClick={closeMenus} />
            <Link
              to="/pricing"
              onClick={closeMenus}
              className="block font-semibold text-slate-800 dark:text-slate-100"
            >
              Pricing
            </Link>
            <div className="grid gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
              <Link
                to="/testimonials"
                onClick={closeMenus}
                className="rounded-lg border border-slate-300 px-4 py-3 text-center font-semibold text-slate-800 dark:border-slate-700 dark:text-slate-100"
              >
                View Product
              </Link>
              <Link
                to="/login"
                onClick={closeMenus}
                className="rounded-lg bg-primary px-4 py-3 text-center font-semibold text-white"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

function Dropdown({ id, label, items, openMenu, setOpenMenu, compact = false }) {
  const isOpen = openMenu === id;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpenMenu(isOpen ? null : id)}
        className="flex items-center gap-1 transition hover:text-primary"
      >
        {label}
        <ChevronDown size={16} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-3 w-72 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900">
          {items.map((item) => {
            const [title, description, href] = compact
              ? [item[0], null, item[1]]
              : item;

            return (
              <Link
                key={title}
                to={href}
                onClick={() => setOpenMenu(null)}
                className="block p-4 transition hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <span className="font-bold text-slate-950 dark:text-white">
                  {title}
                </span>
                {description && (
                  <span className="mt-1 block text-sm font-normal text-slate-500 dark:text-slate-400">
                    {description}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MobileGroup({ title, items, onClick }) {
  return (
    <div>
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
        {title}
      </p>
      <div className="grid gap-2">
        {items.map((item) => {
          const label = item[0];
          const href = item.length === 3 ? item[2] : item[1];

          return (
            <Link
              key={label}
              to={href}
              onClick={onClick}
              className="rounded-lg bg-slate-50 px-4 py-3 font-semibold text-slate-800 dark:bg-slate-900 dark:text-slate-100"
            >
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
