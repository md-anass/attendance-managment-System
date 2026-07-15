import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface EmployeeAttendance {
  name: string;
  role: string;
  checkIn: string;
  checkOut: string;
  status: string;
  hours: string;
  initials: string;
}

interface RecentAttendanceProps {
  data: EmployeeAttendance[];
}

export default function RecentAttendance({ data }: RecentAttendanceProps) {
  return (
    <Card className="shadow-xs bg-white border border-slate-200">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-bold">Today's Attendance</CardTitle>
          <CardDescription>Live log of employee check-in and check-out times</CardDescription>
        </div>
        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 font-medium">
          View All <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-slate-200">
                <TableHead className="w-[250px]">Employee</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Hours</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((emp, index) => (
                <TableRow key={index} className="border-slate-100 hover:bg-slate-50/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-slate-100 text-slate-700 font-semibold text-xs">{emp.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm leading-none">{emp.name}</p>
                        <p className="text-xs text-slate-400 mt-1">{emp.role}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">{emp.checkIn}</TableCell>
                  <TableCell className="text-slate-600">{emp.checkOut}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        emp.status === "On Time"
                          ? "default"
                          : emp.status === "Late"
                          ? "destructive"
                          : "outline"
                      }
                      className={
                        emp.status === "On Time"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50"
                          : emp.status === "Late"
                          ? "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-50"
                          : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-50"
                      }
                    >
                      {emp.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium text-slate-700">{emp.hours}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
