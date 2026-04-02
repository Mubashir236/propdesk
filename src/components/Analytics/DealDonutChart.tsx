import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DealDonutChartProps {
  data: Array<{ name: string; value: number }>;
}

const COLORS = ["#1A2D4A", "#C9A84C", "#4F76A0", "#E5C971"];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-border rounded-lg shadow-lg p-3 text-sm">
        <p className="font-semibold capitalize">{payload[0].name}</p>
        <p className="text-muted-foreground">{payload[0].value} deals</p>
      </div>
    );
  }
  return null;
};

export default function DealDonutChart({ data }: DealDonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (!data || data.length === 0 || total === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
        No deals data yet
      </div>
    );
  }

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11 }}
            formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Center label */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center" style={{ marginTop: "-20px" }}>
          <p className="text-2xl font-bold text-[#1A2D4A]">{total}</p>
          <p className="text-xs text-muted-foreground">Total Deals</p>
        </div>
      </div>
    </div>
  );
}
