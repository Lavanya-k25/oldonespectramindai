import { Search, SlidersHorizontal } from "lucide-react";

export default function CMMCFilterBar({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search CMMC workspace",
  filters = [],
  actions,
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-white/75 bg-white/62 p-4 shadow-xl shadow-slate-900/5 backdrop-blur lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">{searchPlaceholder}</span>
          <Search
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={searchValue}
            onChange={(event) => onSearchChange?.(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-600"
          />
        </label>

        {filters.map((filter) => (
          <label key={filter.id} className="flex min-w-40 items-center gap-2">
            <SlidersHorizontal size={16} className="text-slate-400" />
            <span className="sr-only">{filter.label}</span>
            <select
              value={filter.value}
              onChange={(event) => filter.onChange?.(event.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 outline-none transition focus:border-blue-600"
            >
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
