"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DataPoint { month: string; kwh: number; cost: number; }

export default function ConsumoChart({ data }: { data: DataPoint[] }) {
  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorKwh" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
          <XAxis dataKey="month" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v} kWh`} />
          <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 4px 20px rgba(0,0,0,0.5)", background: "#0a0a0a", color: "#e2e8f0" }} />
          <Area type="monotone" dataKey="kwh" stroke="#f97316" strokeWidth={3} fill="url(#colorKwh)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
