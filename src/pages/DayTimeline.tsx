import { eachHourOfInterval, format, parseISO } from "date-fns";
import React, { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";

type Shift = {
  id: string;
  area: string;
  section: string; // REQUIRED: every shift is assigned to a Section
  staff: string;
  start: string; // ISO datetime
  end: string; // ISO datetime
  color: string; // CSS color string
};

const areas = [
  { area: "Bar", sections: ["Front Bar", "Beer Garden"] },
  { area: "Kitchen", sections: ["Pass", "Prep"] },
  { area: "Floor", sections: ["Main", "Function Room"] },
];

export default function DayTimeline() {
  const { date } = useParams();
  const day = date ?? new Date().toISOString().slice(0, 10);

  useEffect(() => {
    document.title = `Day – ${format(parseISO(`${day}T00:00:00`), "PPP")}`;
  }, [day]);

  // Flat list of all sections so each section gets its own dedicated row
  const sectionRows = useMemo(
    () =>
      areas.flatMap((a) => a.sections.map((s) => ({ area: a.area, section: s }))),
    []
  );

  // Mock shifts (every shift MUST have a section)
  const mockShifts: Shift[] = [
    {
      id: "1",
      area: "Bar",
      section: "Front Bar",
      staff: "Alex",
      start: `${day}T10:00:00`,
      end: `${day}T14:00:00`,
      color: "hsl(var(--primary))",
    },
    {
      id: "2",
      area: "Kitchen",
      section: "Pass",
      staff: "Sam",
      start: `${day}T12:00:00`,
      end: `${day}T20:00:00`,
      color: "hsl(var(--accent))",
    },
    {
      id: "3",
      area: "Floor",
      section: "Main",
      staff: "Pat",
      start: `${day}T18:00:00`,
      end: `${day}T22:00:00`,
      color: "hsl(var(--primary))",
    },
  ];

  // Timeline bounds 8:00 -> 23:00
  const startRef = parseISO("2020-01-01T08:00:00");
  const endRef = parseISO("2020-01-01T23:00:00");
  const hours = eachHourOfInterval({ start: startRef, end: endRef });
  const totalHours = endRef.getHours() - startRef.getHours(); // 15

  // Helpers to position shifts within a row based on time
  const getLeftPercent = (d: Date) => ((d.getHours() + d.getMinutes() / 60 - 8) / totalHours) * 100;
  const getWidthPercent = (s: Date, e: Date) => ((e.getHours() + e.getMinutes() / 60) - (s.getHours() + s.getMinutes() / 60)) / totalHours * 100;

  return (
    <section className="animate-enter">
      <header className="mb-4">
        <h1 className="text-xl font-semibold">Day timeline</h1>
        <p className="text-sm text-muted-foreground">Areas are headers; each Section is a horizontal timeline row.</p>
      </header>

      {/* Two-column grid: left labels, right timeline */}
      <div className="grid grid-cols-[220px_1fr] gap-x-2">
        {/* Top-left blank cell to align with hour ruler */}
        <div />
        {/* Hour ruler */}
        <div className="sticky top-0 z-10 grid border-b bg-background/80 backdrop-blur" style={{ gridTemplateColumns: `repeat(${hours.length}, minmax(64px, 1fr))` }}>
          {hours.map((h) => (
            <div key={h.toISOString()} className="text-xs text-muted-foreground py-1 px-1">
              {format(h, "ha")}
            </div>
          ))}
        </div>

        {/* Area groups */}
        {areas.map((group) => (
          <React.Fragment key={group.area}>
            {/* Area header row */}
            <div className="py-2 pr-2 border-r">
              <div className="text-sm font-semibold">{group.area}</div>
            </div>
            <div className="h-8 border-b bg-muted/30 rounded-sm" />

            {/* Section rows */}
            {group.sections.map((section) => (
              <React.Fragment key={`${group.area}-${section}`}>
                <div className="py-3 pr-2 border-r">
                  <div className="text-sm font-medium">{section}</div>
                </div>
                <div className="relative h-16 rounded-md bg-muted/40">
                  {/* Hour grid lines */}
                  <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${hours.length}, minmax(64px, 1fr))` }}>
                    {hours.map((h) => (
                      <div key={`${group.area}-${section}-${h.toISOString()}`} className="border-l/50 border-l first:border-l-0" />
                    ))}
                  </div>

                  {/* Shifts for this exact Section */}
                  {mockShifts
                    .filter((sh) => sh.area === group.area && sh.section === section)
                    .map((sh) => {
                      const s = parseISO(sh.start);
                      const e = parseISO(sh.end);
                      const left = getLeftPercent(s);
                      const width = getWidthPercent(s, e);

                      return (
                        <div
                          key={sh.id}
                          className="absolute top-1 h-14 rounded-md text-xs font-medium px-2 py-1 shadow"
                          style={{ left: `${left}%`, width: `${width}%`, background: sh.color, color: 'hsl(var(--primary-foreground))' }}
                          aria-label={`${sh.staff} • ${section} • ${format(s, 'p')}–${format(e, 'p')}`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="inline-flex items-center rounded-sm bg-background/20 px-1.5 py-0.5 text-[10px]">{section}</span>
                            <span className="truncate">{sh.staff}</span>
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
    </section>
  );
}
