import { useEffect, useMemo, useState } from "react";
import { addMonths, format, startOfMonth, subMonths } from "date-fns";
import { Button } from "@/components/ui/button";
import { MonthGrid } from "@/components/calendar/MonthGrid";
import { useNavigate } from "react-router-dom";

export default function CalendarMonth() {
  const [current, setCurrent] = useState(new Date());
  const navigate = useNavigate();

  const title = useMemo(() => format(current, "MMMM yyyy"), [current]);

  useEffect(() => {
    document.title = `Calendar – ${title}`;
  }, [title]);

  return (
    <section className="space-y-4 animate-enter">
      <header className="flex items-center justify-start">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrent(new Date())}>Today</Button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" aria-label="Previous month" onClick={() => setCurrent((d) => subMonths(d, 1))}>
              ‹
            </Button>
            <Button variant="ghost" size="icon" aria-label="Next month" onClick={() => setCurrent((d) => addMonths(d, 1))}>
              ›
            </Button>
          </div>
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>
      </header>

      <MonthGrid date={startOfMonth(current)} onSelectDay={(d) => navigate(`/app/day/${format(d, 'yyyy-MM-dd')}`)} />
    </section>
  );
}
