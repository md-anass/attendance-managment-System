import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle, XCircle } from "lucide-react";

interface LeaveRequest {
  name: string;
  type: string;
  dates: string;
  days: string;
  status: string;
  initials: string;
}

interface PendingLeavesProps {
  data: LeaveRequest[];
  onApprove?: (name: string) => void;
  onReject?: (name: string) => void;
}

export default function PendingLeaves({
  data,
  onApprove,
  onReject,
}: PendingLeavesProps) {
  return (
    <Card className="shadow-xs bg-white border border-slate-200 flex flex-col justify-between">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold">Pending Leaves</CardTitle>
        <CardDescription>Requests awaiting review and approval</CardDescription>
      </CardHeader>
      <CardContent className="pt-2 flex-1">
        <div className="space-y-4">
          {data.map((req, index) => (
            <div key={index} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-slate-100 text-slate-700 font-semibold text-xs">{req.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm leading-none">{req.name}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {req.type} &bull; <span className="font-medium text-slate-500">{req.days}</span>
                  </p>
                  <p className="text-xs font-semibold text-blue-600 mt-0.5">{req.dates}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="xs"
                  variant="ghost"
                  className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 h-7 px-2"
                  title="Approve"
                  onClick={() => onApprove?.(req.name)}
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 h-7 px-2"
                  title="Reject"
                  onClick={() => onReject?.(req.name)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
