export default function ActivityFeed() {

  const activities = [
    "Security Policy uploaded",
    "Vendor AWS reviewed",
    "Risk Assessment completed",
    "SOC2 Control CC1.1 completed",
    "Incident Response Plan updated"
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 h-full">

      <h2 className="font-bold text-xl mb-6 text-black dark:text-white">
        Recent Activity
      </h2>

      <div className="space-y-4">

        {activities.map((activity) => (
          <div
            key={activity}
            className="border-b border-gray-200 dark:border-slate-700 pb-3 text-gray-700 dark:text-gray-300"
          >
            ✓ {activity}
          </div>
        ))}

      </div>

    </div>
  );
}