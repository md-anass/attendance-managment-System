"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

interface StatusChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  totalPresent: number;
}

export default function StatusChart({ data, totalPresent }: StatusChartProps) {
  return (
    <Card className="shadow-xs bg-white border border-slate-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold">Attendance Status</CardTitle>
        <CardDescription>Today's staff breakdown</CardDescription>
      </CardHeader>
      <CardContent className="pt-0 flex flex-col items-center justify-center">
        <div className="h-56 w-full relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-extrabold">{totalPresent}</span>
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Present</span>
          </div>
        </div>
        {/* Custom Legend */}
        <div className="w-full grid grid-cols-3 gap-2 text-center text-xs mt-2 border-t border-slate-100 pt-4">
          {data.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className="flex items-center gap-1.5 font-medium">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name}
              </div>
              <span className="text-sm font-bold mt-0.5 text-slate-700">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
