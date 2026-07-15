import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: "blue" | "green" | "red" | "orange" | "amber" | string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: StatCardProps) {
  // Map color names to Tailwind CSS classes
  const colorMap: Record<string, { bg: string; icon: string; value: string }> = {
    blue: { bg: "bg-blue-100", icon: "text-blue-600", value: "text-foreground" },
    green: { bg: "bg-emerald-100", icon: "text-emerald-600", value: "text-emerald-600" },
    red: { bg: "bg-rose-100", icon: "text-rose-600", value: "text-rose-600" },
    orange: { bg: "bg-amber-100", icon: "text-amber-500", value: "text-amber-500" },
    amber: { bg: "bg-amber-100", icon: "text-amber-500", value: "text-amber-500" },
  };

  const selectedColors = colorMap[color] || colorMap.blue;

  return (
    <Card className="shadow-xs bg-white border border-slate-200">
      <CardContent className="p-6 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className={cn("text-3xl font-bold", selectedColors.value)}>{value}</h3>
        </div>
        <div className={cn("h-12 w-12 rounded-full flex items-center justify-center", selectedColors.bg, selectedColors.icon)}>
          <Icon className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  );
}

