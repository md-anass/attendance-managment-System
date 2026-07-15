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
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { MonthlyTrendData } from "@/types/report";

interface MonthlyTrendChartProps {
  data: MonthlyTrendData[];
}

export default function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  return (
    <Card className="shadow-xs bg-white border border-slate-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-slate-500" />
            <div>
              <CardTitle className="text-base font-bold">Monthly Staffing Trend</CardTitle>
              <CardDescription>Ratios of present, absent, and leaves over the year</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "12px",
                }}
                formatter={(val) => [`${val}%`, null]}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
              <Area type="monotone" dataKey="Present" name="Present Ratio" stackId="1" stroke="#10b981" fill="#e6f4ea" strokeWidth={2} />
              <Area type="monotone" dataKey="Leave" name="On Leave Ratio" stackId="1" stroke="#f97316" fill="#fef3c7" strokeWidth={1.5} />
              <Area type="monotone" dataKey="Absent" name="Absent Ratio" stackId="1" stroke="#ef4444" fill="#fde8e8" strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
