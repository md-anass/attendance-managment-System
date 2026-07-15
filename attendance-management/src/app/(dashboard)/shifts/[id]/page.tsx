"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ShiftCard from "@/components/shifts/ShiftCard";
import { getShiftById } from "@/services/shift.service";
import { Shift } from "@/types/shift";

export default function ShiftDetailPage() {
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/shifts">
            <Button variant="outline" size="icon" className="h-9 w-9 border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Shift Profile Details</h2>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">View details and active timeline parameters.</p>
          </div>
        </div>
        {!loading && shift && (
          <Link href={`/shifts/${shift.id}/edit`}>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl">
              <Edit2 className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          </Link>
        )}
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full max-w-md rounded-2xl" />
      ) : (
        shift && (
          <div className="max-w-md">
            <ShiftCard shift={shift} />
          </div>
        )
      )}
    </div>
  );
}
