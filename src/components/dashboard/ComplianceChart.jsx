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
    <div className="rounded-lg border border-white/75 bg-white/62 p-6 shadow-xl shadow-slate-900/5 backdrop-blur">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">
            Compliance Progress
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Monthly readiness score across active frameworks
          </p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">
          +40 pts
        </span>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(92,80,62,.16)" />
            <XAxis dataKey="month" stroke="#746b5d" />
            <YAxis stroke="#746b5d" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#9d6f38"
              strokeWidth={4}
              dot={{ r: 5, fill: "#d8b46d", strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
