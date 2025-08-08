import { eachHourOfInterval, format, parseISO } from "date-fns";
import { useEffect } from "react";

type Shift = {
  id: string;
  area: string;
  section: string;
  staff: string;
  start: string; // ISO datetime
  end: string;   // ISO datetime
  color: string; // hsl token name like 'primary' or arbitrary hsl string
};

const mockShifts: Shift[] = [
  {
    id: "1",
    area: "Bar",
    section: "Front Bar",
    staff: "Alex",
    start: new Date().toISOString().slice(0, 10) + "T10:00:00",
    end: new Date().toISOString().slice(0, 10) + "T14:00:00",
    color: "hsl(var(--primary))",
  },
  {
    id: "2",
    area: "Kitchen",
    section: "Pass",
    staff: "Sam",
    start: new Date().toISOString().slice(0, 10) + "T12:00:00",
    end: new Date().toISOString().slice(0, 10) + "T20:00:00",
    color: "hsl(var(--accent))",
  },
];

const areas = [
  { area: "Bar", sections: ["Front Bar", "Beer Garden"] },
  { area: "Kitchen", sections: ["Pass", "Prep"] },
  { area: "Floor", sections: ["Main", "Function Room"] },
];

export default function DayTimeline() {
  useEffect(() => {
    document.title = "Day – Timeline";
  }, []);

  const hours = eachHourOfInterval({ start: parseISO("2020-01-01T08:00:00"), end: parseISO("2020-01-01T23:00:00") });

  return (
    <section className="animate-enter">
      <header className="mb-3">
        <h1 className="text-xl font-semibold">Day timeline</h1>
        <p className="text-sm text-muted-foreground">Areas on the left, hours across the top. Drag-and-drop coming later.</p>
      </header>

      <div className="grid grid-cols-[220px_1fr] gap-2">
        {/* Y axis */}
        <aside className="space-y-6 pr-2 border-r">
          {areas.map((a) => (
            <div key={a.area} className="space-y-2">
              <div className="text-sm font-medium">{a.area}</div>
              <div className="space-y-2">
                {a.sections.map((s) => (
                  <div key={s} className="text-xs text-muted-foreground">{s}</div>
                ))}
              </div>
            </div>
          ))}
        </aside>

        {/* Main timeline */}
        <div className="relative">
          {/* Hour ruler */}
          <div className="sticky top-0 z-10 grid" style={{ gridTemplateColumns: `repeat(${hours.length}, minmax(64px, 1fr))` }}>
            {hours.map((h) => (
              <div key={h.toISOString()} className="text-xs text-muted-foreground py-1 border-b">
                {format(h, "ha")}
              </div>
            ))}
          </div>

          {/* Track rows (one per section) */}
          <div className="space-y-6 mt-2">
            {areas.map((a) => (
              <div key={a.area} className="space-y-2">
                {a.sections.map((s) => (
                  <div key={s} className="relative h-16 bg-muted/40 rounded-md">
                    {/* Shifts placed absolutely within the row */}
                    {mockShifts
                      .filter((sh) => sh.area === a.area && sh.section === s)
                      .map((sh) => {
                        const start = parseISO(sh.start);
                        const end = parseISO(sh.end);
                        const startHour = start.getHours();
                        const endHour = end.getHours() + end.getMinutes() / 60;
                        const left = ((startHour - 8) / 15) * 100; // 8am -> 11pm timeline (15 hours)
                        const width = ((endHour - startHour) / 15) * 100;
                        return (
                          <div
                            key={sh.id}
                            className="absolute top-1 h-14 rounded-md text-xs font-medium px-2 py-1 shadow"
                            style={{ left: `${left}%`, width: `${width}%`, background: sh.color, color: 'hsl(var(--primary-foreground))' }}
                          >
                            <div className="truncate">{sh.staff}</div>
                            <div className="opacity-80 text-[11px]">{format(start, 'p')} – {format(end, 'p')}</div>
                          </div>
                        );
                      })}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
