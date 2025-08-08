import { eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, isToday, startOfMonth, startOfWeek } from "date-fns";
import { useMemo } from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import RosterForm from "./RosterForm";
import { useAddRoster } from "@/data/hooks";
import { useStoreInternal } from "@/data/store";
import { useActiveLocation } from "@/data/hooks";
import { useUpdateRoster } from "@/data/hooks";

export function MonthGrid({ date, onSelectDay }: { date: Date; onSelectDay: (d: Date) => void }) {
  const start = startOfWeek(startOfMonth(date), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(date), { weekStartsOn: 1 });
  const days = useMemo(() => eachDayOfInterval({ start, end }), [start, end]);

  const { state } = useStoreInternal();
  const active = useActiveLocation();
  const addRoster = useAddRoster();
  const updateRoster = useUpdateRoster();

  const rosterByDay = useMemo(() => {
    const map: Record<string, any[]> = {};
    state.rosters.forEach((r) => {
      if (active?.id && r.locationId !== active.id) return;
      (map[r.dateISO] ||= []).push(r);
    });
    return map;
  }, [state.rosters, active?.id]);

  return (
    <div className="grid grid-cols-7 border rounded-md overflow-hidden">
      {/* Weekday header */}
      {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
        <div key={d} className="bg-muted/60 py-2 px-2 text-sm font-medium border-b">{d}</div>
      ))}

      {days.map((d) => {
        const key = format(d, 'yyyy-MM-dd');
        const dayRosters = rosterByDay[key] || [];
        return (
          <div key={key} className="relative min-h-28 border p-2 hover:bg-muted/40 transition-colors cursor-pointer" onClick={() => onSelectDay(d)}>

            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">
                <span className={isToday(d) ? 'text-primary font-semibold' : 'text-foreground'}>{format(d, 'd')}</span>
              </div>
            </div>
            <div className="space-y-2">
              {dayRosters.map((r) => (
                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      key={r.id}
                      className="relative w-full text-left text-xs rounded-md px-2 py-2 bg-primary/5 border border-primary/10 hover:bg-primary/8 transition-colors shadow-sm hover:shadow-md"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-start gap-2">
                        <span aria-hidden className="mt-0.5 h-2.5 w-2.5 rounded-full bg-primary/70 ring-2 ring-primary/20" />
                        <div className="min-w-0">
                          <div className="font-medium truncate">{r.title}</div>
                          <div className="text-muted-foreground truncate">{r.shifts?.length || 0} {r.shifts?.length === 1 ? 'shift' : 'shifts'}</div>
                        </div>
                      </div>
                    </button>
                  </DialogTrigger>
                  <DialogContent
                    className="sm:max-w-4xl md:max-w-5xl max-h-[85vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <DialogHeader>
                      <DialogTitle>Edit Daily Roster</DialogTitle>
                      <DialogDescription>Update title, description, and shifts for this roster.</DialogDescription>
                    </DialogHeader>
                    <RosterForm
                      defaultDate={new Date(r.dateISO)}
                      roster={r}
                      onSubmit={(payload) => {
                        updateRoster({ ...r, ...payload, id: r.id });
                      }}
                    />
                  </DialogContent>
                </Dialog>
              ))}
              {dayRosters.length === 0 && (
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="block w-full text-left px-2 py-2 mt-4 text-xs text-muted-foreground hover:text-foreground story-link" onClick={(e) => e.stopPropagation()}>
                      + Add daily roster
                    </button>
                  </DialogTrigger>
                  <DialogContent
                    className="sm:max-w-4xl md:max-w-5xl max-h-[85vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <DialogHeader>
                      <DialogTitle>Add Daily Roster</DialogTitle>
                      <DialogDescription>Plan and assign shifts for this day.</DialogDescription>
                    </DialogHeader>
                    <RosterForm defaultDate={d} onSubmit={(r) => addRoster(r)} />
                  </DialogContent>
                </Dialog>
              )}
            </div>
            {!isSameMonth(d, date) && <div className="absolute inset-0 bg-background/60 pointer-events-none" />}
          </div>
        );
      })}
    </div>
  );
}
