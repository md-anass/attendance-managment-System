import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface Holiday {
  name: string;
  date: string;
  day: string;
}

interface UpcomingHolidaysProps {
  data: Holiday[];
}

export default function UpcomingHolidays({ data }: UpcomingHolidaysProps) {
  return (
    <Card className="shadow-xs bg-white border border-slate-200 flex flex-col justify-between">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold">Upcoming Holidays</CardTitle>
        <CardDescription>Official calendar holidays for this term</CardDescription>
      </CardHeader>
      <CardContent className="pt-2 flex-1">
        <div className="space-y-4">
          {data.map((hol, index) => (
            <div key={index} className="flex items-center gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
              <div className="h-10 w-10 rounded-lg bg-blue-50 border border-blue-100 flex flex-col items-center justify-center text-blue-600 shrink-0">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-800">{hol.name}</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {hol.date} &bull; <span className="text-slate-400 font-normal">{hol.day}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
