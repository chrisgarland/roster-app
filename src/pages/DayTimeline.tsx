import { eachHourOfInterval, format, parseISO } from "date-fns";
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useActiveLocation, useRostersByDate, useStaff, useUpdateRoster } from "@/data/hooks";
import { toast } from "@/components/ui/use-toast";
import ShiftEditorDialog from "@/components/timeline/ShiftEditorDialog";
import type { Shift } from "@/data/types";
// Data is sourced from the central store via hooks.

export default function DayTimeline() {
  const { date } = useParams();
  const day = date ?? new Date().toISOString().slice(0, 10);

  useEffect(() => {
    document.title = `Day – ${format(parseISO(`${day}T00:00:00`), "PPP")}`;
  }, [day]);

  // Active location and data from store
  const active = useActiveLocation();
  const groups = active?.areas ?? [];
  const { staff } = useStaff();
  const rosters = useRostersByDate(day, active?.id);

  const allShifts = useMemo(() => rosters.flatMap((r) => r.shifts), [rosters]);
  const staffMap = useMemo(() => new Map(staff.map((s) => [s.id, s])), [staff]);

  const [editor, setEditor] = useState<{ rosterId: string; shiftId: string } | null>(null);
  const updateRoster = useUpdateRoster();
  

  const activeRoster = useMemo(() => rosters.find((r) => r.id === editor?.rosterId), [rosters, editor]);
  const selectedShift = useMemo(() => activeRoster?.shifts.find((s) => s.id === editor?.shiftId), [activeRoster, editor]);

  const parseTime = (hm: string) => parseISO(`${day}T${hm}:00`);

  // Timeline bounds 8:00 -> 23:00
  const startRef = parseISO("2020-01-01T08:00:00");
  const endRef = parseISO("2020-01-01T23:00:00");
  const hours = eachHourOfInterval({ start: startRef, end: endRef });
  const totalHours = endRef.getHours() - startRef.getHours(); // 15
  const ticks = hours.slice(0, -1); // 15 intervals between 8:00 and 23:00

  // Helpers to position shifts within a row based on time
  const getLeftPercent = (d: Date) => ((d.getHours() + d.getMinutes() / 60 - 8) / totalHours) * 100;
  const getWidthPercent = (s: Date, e: Date) => ((e.getHours() + e.getMinutes() / 60) - (s.getHours() + s.getMinutes() / 60)) / totalHours * 100;

  return (
    <section className="animate-enter">
      <header className="mb-4">
        <h1 className="text-xl font-semibold">Day timeline</h1>
        
      </header>

      {/* Two-column grid: left labels, right timeline */}
      <div className="grid grid-cols-[220px_1fr] gap-x-2">
        {/* Top-left blank cell to align with hour ruler */}
        <div />
        {/* Hour ruler */}
        <div className="sticky top-0 z-10 grid border-b bg-background/80 backdrop-blur" style={{ gridTemplateColumns: `repeat(${ticks.length}, minmax(64px, 1fr))` }}>
          {ticks.map((h) => (
            <div key={h.toISOString()} className="text-xs text-muted-foreground py-1 px-1">
              {format(h, "ha")}
            </div>
          ))}
        </div>

        {/* Area groups */}
        {groups.map((group) => (
          <React.Fragment key={group.id}>
            {/* Area header row */}
            <div className="h-8 pr-2 border-r flex items-center">
              <div className="text-sm font-semibold">{group.name}</div>
            </div>
            <div className="border-b" />

            {/* Section rows */}
            {group.sections.map((section) => (
              <React.Fragment key={`${group.id}-${section}`}>
                <div className="h-16 pr-2 pl-6 border-r flex items-center">
                  <div className="text-sm font-medium">{section}</div>
                </div>
                <div className="relative h-16 rounded-md bg-muted/40">
                  {/* Hour grid lines */}
                  <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${ticks.length}, minmax(64px, 1fr))` }}>
                    {ticks.map((h) => (
                      <div key={`${group.id}-${section}-${h.toISOString()}`} className="border-l/50 border-l first:border-l-0" />
                    ))}
                  </div>

                  {/* Shifts for this exact Section */}
                  {allShifts
                    .filter((sh) => sh.areaId === group.id && sh.section === section)
                    .map((sh) => {
                      const s = parseTime(sh.start);
                      const e = parseTime(sh.end);
                      const left = getLeftPercent(s);
                      const width = getWidthPercent(s, e);
                      const staffLabel = sh.staffId ? (staffMap.get(sh.staffId)?.name ?? "Unassigned") : "Unassigned";

                      return (
                        <div
                          key={sh.id}
                          className="absolute top-1 h-14 rounded-md text-xs font-medium px-2 py-1 shadow cursor-pointer hover:opacity-95"
                          style={{ left: `${left}%`, width: `${width}%`, background: "hsl(var(--primary))", color: 'hsl(var(--primary-foreground))' }}
                          aria-label={`${staffLabel} • ${section} • ${format(s, 'p')}–${format(e, 'p')}`}
                          title="Click to edit shift"
                          onClick={() => {
                            const r = rosters.find((r) => r.shifts.some((x) => x.id === sh.id));
                            if (r) setEditor({ rosterId: r.id, shiftId: sh.id });
                          }}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="inline-flex items-center rounded-sm bg-background/20 px-1.5 py-0.5 text-[10px]">{section}</span>
                            <span className="truncate">{staffLabel}</span>
                          </div>
                          <div className="opacity-85 text-[11px]">{format(s, 'p')} – {format(e, 'p')}</div>
                        </div>
                      );
                    })}
                </div>
              </React.Fragment>
            ))}
            </React.Fragment>
          ))}
      </div>

      {editor && activeRoster && selectedShift ? (
        <ShiftEditorDialog
          open={!!editor}
          onOpenChange={(open) => setEditor(open ? editor : null)}
          shift={selectedShift as Shift}
          areas={groups}
          staff={staff}
          onSave={(updated) => {
            const newRoster = { ...activeRoster, shifts: activeRoster.shifts.map((s) => s.id === (selectedShift as Shift).id ? { ...s, ...updated } : s) };
            updateRoster(newRoster);
            toast({ title: "Shift updated", description: `${format(parseISO(`${day}T${updated.start}:00`), 'p')} – ${format(parseISO(`${day}T${updated.end}:00`), 'p')}` });
            setEditor(null);
          }}
          onRemove={() => {
            const newRoster = { ...activeRoster, shifts: activeRoster.shifts.filter((s) => s.id !== (selectedShift as Shift).id) };
            updateRoster(newRoster);
            toast({ title: "Shift removed" });
            setEditor(null);
          }}
        />
      ) : null}
    </section>
  );
}
