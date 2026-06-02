import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Analytics({ stats }) {
  const data = [
    {
      name: "Open",
      value: stats.open_tickets,
    },
    {
      name: "In Progress",
      value: stats.in_progress_tickets,
    },
    {
      name: "Closed",
      value: stats.closed_tickets,
    },
  ];

  const COLORS = [
    "#16a34a",
    "#eab308",
    "#6b7280",
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">
        Analytics Dashboard
      </h2>

      <div style={{ width: "100%", height: 350 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              outerRadius={120}
              label
            >
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index]}
                />
              ))}
            </Pie>

            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Analytics;