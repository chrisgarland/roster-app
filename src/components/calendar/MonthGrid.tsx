import { addDays, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, isToday, startOfMonth, startOfWeek } from "date-fns";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import RosterForm, { Roster } from "./RosterForm";

export function MonthGrid({ date, onSelectDay }: { date: Date; onSelectDay: (d: Date) => void }) {
  const start = startOfWeek(startOfMonth(date), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(date), { weekStartsOn: 1 });
  const days = useMemo(() => eachDayOfInterval({ start, end }), [start, end]);

  const [rosters, setRosters] = useState<Record<string, Roster[]>>({
    [format(new Date(), 'yyyy-MM-dd')]: [
      { id: '1', title: 'Lunch Service', area: 'Bar', section: 'Front Bar' }
    ]
  });

  const addRoster = (dayKey: string, roster: Roster) => {
    setRosters((prev) => ({ ...prev, [dayKey]: [...(prev[dayKey] || []), roster] }));
  };

  return (
    <div className="grid grid-cols-7 border rounded-md overflow-hidden">
      {/* Weekday header */}
      {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
        <div key={d} className="bg-muted/60 py-2 px-2 text-sm font-medium border-b">{d}</div>
      ))}

      {days.map((d) => {
        const key = format(d, 'yyyy-MM-dd');
        const dayRosters = rosters[key] || [];
        return (
          <div key={key} className="relative min-h-28 border p-2 hover:bg-muted/40 transition-colors">

            <div className="flex items-center justify-between mb-2">
              <button onClick={() => onSelectDay(d)} className="text-sm font-medium hover:underline">
                <span className={isToday(d) ? 'text-primary font-semibold' : 'text-foreground'}>{format(d, 'd')}</span>
              </button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground">Add</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Daily Roster</DialogTitle>
                  </DialogHeader>
                  <RosterForm defaultDate={d} onSubmit={(r) => addRoster(key, r)} />
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-2">
              {dayRosters.map((r) => (
                <button key={r.id} className="w-full text-left text-xs rounded-md px-2 py-1 bg-card shadow hover:shadow-md transition-shadow">
                  <div className="font-medium truncate">{r.title}</div>
                  <div className="text-muted-foreground truncate">{r.area} • {r.section}</div>
                </button>
              ))}
              {dayRosters.length === 0 && (
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="text-xs text-muted-foreground hover:text-foreground story-link">
                      + Add daily roster
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add Daily Roster</DialogTitle>
                    </DialogHeader>
                    <RosterForm defaultDate={d} onSubmit={(r) => addRoster(key, r)} />
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
