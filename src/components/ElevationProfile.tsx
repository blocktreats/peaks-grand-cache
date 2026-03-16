"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ElevationProfileProps {
  elevations: number[];
  distance_km: number;
}

export default function ElevationProfile({
  elevations,
  distance_km,
}: ElevationProfileProps) {
  const data = elevations.map((elev, i) => ({
    distance: Number(
      ((i / (elevations.length - 1)) * distance_km).toFixed(1)
    ),
    elevation: elev,
  }));

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <defs>
            <linearGradient id="elevGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="distance"
            tick={{ fill: "#737373", fontSize: 11 }}
            axisLine={{ stroke: "#1f1f1f" }}
            tickLine={false}
            tickFormatter={(v) => `${v} km`}
          />
          <YAxis
            tick={{ fill: "#737373", fontSize: 11 }}
            axisLine={{ stroke: "#1f1f1f" }}
            tickLine={false}
            tickFormatter={(v) => `${v}m`}
            domain={["dataMin - 50", "dataMax + 50"]}
            width={55}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#111",
              border: "1px solid #2a2a2a",
              borderRadius: "8px",
              color: "#e5e5e5",
              fontSize: "12px",
            }}
            formatter={(value) => [`${value}m`, "Elevation"]}
            labelFormatter={(label) => `${label} km`}
          />
          <Area
            type="monotone"
            dataKey="elevation"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#elevGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
