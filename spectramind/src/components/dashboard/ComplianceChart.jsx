import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

const data = [
  { month: "Jan", score: 45 },
  { month: "Feb", score: 55 },
  { month: "Mar", score: 60 },
  { month: "Apr", score: 70 },
  { month: "May", score: 80 },
  { month: "Jun", score: 85 }
];

export default function ComplianceChart() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 min-h-[450px]">

      <h2 className="text-xl font-bold mb-6 text-black dark:text-white">
        Compliance Progress
      </h2>

      <div className="h-[350px] w-full">

        <ResponsiveContainer width="100%" height="100%">

          <LineChart data={data}>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#475569"
            />

            <XAxis
              dataKey="month"
              stroke="#94a3b8"
            />

            <YAxis
              stroke="#94a3b8"
            />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="score"
              stroke="#2563eb"
              strokeWidth={4}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}