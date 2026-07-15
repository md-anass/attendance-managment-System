"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Calendar, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ShiftTable from "@/components/shifts/ShiftTable";
import ShiftFilters from "@/components/shifts/ShiftFilters";
import { getShifts, deleteShift } from "@/services/shift.service";
import { Shift, ShiftFilters as FiltersType } from "@/types/shift";

export default function ShiftsPage() {
  const [shifts, setShifts] = React.useState<Shift[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [filters, setFilters] = React.useState<FiltersType>({});

  const loadData = React.useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await getShifts(filters);
      setShifts(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load shifts profiles.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (id: number) => {
    try {
      await deleteShift(id);
      toast.success("Shift profile deleted successfully!");
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete shift profile.");
    }
  };

  return (
    <div className="space-y-6 text-black">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">Shift Roster Management</h2>
            <Button
              variant="ghost"
              size="icon"
              disabled={loading || refreshing}
              onClick={() => {
                loadData(true);
                toast.success("Shifts list refreshed.");
              }}
              className="h-8 w-8 hover:bg-slate-100 text-slate-500 rounded-lg mt-1"
              title="Refresh Data"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
          <p className="text-muted-foreground">Define shift profile configurations and assign them to employees.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/shifts/new">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl">
              <Plus className="mr-2 h-4 w-4" /> Add Shift
            </Button>
          </Link>
          <Link href="/shifts/assignments">
            <Button size="sm" variant="outline" className="border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl">
              <Plus className="mr-2 h-4 w-4" /> Assign Shifts
            </Button>
          </Link>
          <Link href="/shifts/schedule">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl">
              <Calendar className="mr-2 h-4 w-4" /> View Weekly Schedule
            </Button>
          </Link>
        </div>
      </div>

      <ShiftFilters onFilterChange={setFilters} />

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      ) : (
        <ShiftTable data={shifts} onDelete={handleDelete} />
      )}
    </div>
  );
}
