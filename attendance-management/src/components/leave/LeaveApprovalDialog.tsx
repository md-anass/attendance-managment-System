"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, X, AlertTriangle } from "lucide-react";

interface LeaveApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeName: string;
  onConfirm: (action: "Approved" | "Rejected") => void;
  loading?: boolean;
}

export default function LeaveApprovalDialog({
  open,
  onOpenChange,
  employeeName,
  onConfirm,
  loading = false,
}: LeaveApprovalDialogProps) {
  const handleAction = (type: "Approved" | "Rejected") => {
    onConfirm(type);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-xl text-black">
        <DialogHeader className="space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="text-center space-y-1">
            <DialogTitle className="text-lg font-bold text-slate-800">
              Leave Request Decision
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 font-medium leading-relaxed">
              Determine the administrative status of the leave application submitted by{" "}
              <strong className="text-slate-800 font-semibold">{employeeName}</strong>.
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row justify-center gap-3 pt-3 border-t border-slate-100">
          <Button
            variant="outline"
            disabled={loading}
            onClick={() => onOpenChange(false)}
            className="border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl h-10 px-4 text-sm font-semibold sm:flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={loading}
            onClick={() => handleAction("Rejected")}
            className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-10 px-4 text-sm font-semibold sm:flex-1 flex items-center justify-center gap-1.5"
          >
            <X className="h-4 w-4" />
            Reject
          </Button>
          <Button
            type="button"
            disabled={loading}
            onClick={() => handleAction("Approved")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 px-4 text-sm font-semibold sm:flex-1 flex items-center justify-center gap-1.5"
          >
            <Check className="h-4 w-4" />
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
