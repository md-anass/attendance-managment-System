"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ShiftForm from "@/components/shifts/ShiftForm";
import { getShiftById } from "@/services/shift.service";
import { Shift } from "@/types/shift";

export default function EditShiftPage() {
  const params = useParams();
  const router = useRouter();
  const [shift, setShift] = React.useState<Shift | null>(null);
  const [loading, setLoading] = React.useState(true);

  const idStr = params.id as string;
  const id = parseInt(idStr, 10);

  React.useEffect(() => {
    async function loadData() {
      if (isNaN(id)) {
        toast.error("Invalid Shift ID.");
        router.push("/shifts");
        return;
      }
      try {
        const data = await getShiftById(id);
        if (!data) {
          toast.error("Shift profile not found.");
          router.push("/shifts");
          return;
        }
        setShift(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load shift details.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, router]);

  return (
    <div className="space-y-6 text-black">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/shifts">
          <Button variant="outline" size="icon" className="h-9 w-9 border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Edit Shift Profile</h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Modify timings or grace configurations.</p>
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-96 w-full max-w-2xl rounded-2xl" />
      ) : (
        shift && (
          <div className="max-w-2xl">
            <ShiftForm initialData={shift} />
          </div>
        )
      )}
    </div>
  );
}
