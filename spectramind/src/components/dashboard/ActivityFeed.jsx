import { CheckCircle2 } from "lucide-react";

const activities = [
  ["Security Policy uploaded", "2 hours ago"],
  ["Vendor AWS reviewed", "Yesterday"],
  ["Risk Assessment completed", "Jun 18"],
  ["SOC 2 Control CC1.1 completed", "Jun 17"],
  ["Incident Response Plan updated", "Jun 16"],
];

export default function ActivityFeed() {
  return (
    <div className="h-full rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-xl font-bold text-slate-950 dark:text-white">
        Recent Activity
      </h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Latest changes across your compliance workspace
      </p>

      <div className="mt-6 space-y-4">
        {activities.map(([activity, time]) => (
          <div key={activity} className="flex gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle2 size={17} />
            </div>
            <div className="min-w-0 flex-1 border-b border-slate-100 pb-4 last:border-b-0 dark:border-slate-800">
              <p className="font-semibold text-slate-900 dark:text-white">{activity}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
