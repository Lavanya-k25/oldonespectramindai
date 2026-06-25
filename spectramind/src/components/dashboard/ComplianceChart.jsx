import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { month: "Jan", score: 45 },
  { month: "Feb", score: 55 },
  { month: "Mar", score: 60 },
  { month: "Apr", score: 70 },
  { month: "May", score: 80 },
  { month: "Jun", score: 85 },
];

export default function ComplianceChart() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">
            Compliance Progress
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Monthly readiness score across active frameworks
          </p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          +40 pts
        </span>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#2563eb"
              strokeWidth={4}
              dot={{ r: 5, fill: "#2563eb", strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
