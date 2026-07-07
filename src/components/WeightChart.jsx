import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import Card from "../components/Card/Card";

const WeightChart = ({ data = [] }) => {
  const chartData = data.map((item) => ({
    date: new Date(item.created_at).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
    }),
    weight: Number(item.weight),
  }));

  if (chartData.length === 0) {
    return (
      <Card variant="default" className="p-5">
        <p className="text-sm text-zinc-400">
          Todavía no registraste pesos para mostrar en la gráfica.
        </p>
      </Card>
    );
  }

  return (
    <Card variant="default" className="p-2">
      <div className="mb-4">
        <h3 className="text-[19px] font-bold text-white">Historial de peso</h3>
        <p className="text-xs text-zinc-500">Evolución de tu peso registrado</p>
      </div>

      <div className="h-56 w-full flex justify-center">
        <div className="h-full w-[100%]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 10,
                right: 18,
                left: 0,
                bottom: 0,
              }}
            >
              <XAxis
                dataKey="date"
                tick={{ fill: "#a1a1aa", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                width={28}
                tick={{ fill: "#a1a1aa", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                domain={["dataMin - 1", "dataMax + 1"]}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#443737",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "#fff",
                }}
                labelStyle={{
                  color: "#fff",
                }}
                formatter={(value) => [`${value} kg`, "Peso"]}
              />

              <Line
                type="monotone"
                dataKey="weight"
                stroke="#FF4D00"
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: "#FF4D00",
                  strokeWidth: 0,
                }}
                activeDot={{
                  r: 6,
                  fill: "#FF4D00",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};

export default WeightChart;
