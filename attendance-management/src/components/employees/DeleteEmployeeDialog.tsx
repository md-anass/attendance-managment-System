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

interface DeleteEmployeeDialogProps {
  employeeName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export default function DeleteEmployeeDialog({
  employeeName,
  open,
  onOpenChange,
  onConfirm,
  isDeleting = false,
}: DeleteEmployeeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deactivate Employee</DialogTitle>
          <DialogDescription>
            Are you sure you want to deactivate <span className="font-semibold text-foreground">{employeeName}</span>? This will set their status to inactive and keep their history logs.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            disabled={isDeleting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={isDeleting}
            onClick={onConfirm}
            className="bg-rose-600 hover:bg-rose-700 text-white font-medium"
          >
            {isDeleting ? "Deactivating..." : "Deactivate Employee"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
