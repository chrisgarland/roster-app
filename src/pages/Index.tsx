import hero from "@/assets/hero-calendar.jpg";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    document.title = "RosterFlow – Hospitality Rostering Calendar";
  }, []);

  return (
    <div className="min-h-screen flex items-center bg-background">
      <main className="container mx-auto grid md:grid-cols-2 gap-10 items-center px-6">
        <section className="space-y-6 animate-enter">
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight">
            The modern roster for hospitality
          </h1>
          <p className="text-lg text-muted-foreground">
            Plan shifts with a beautiful calendar interface your team will actually enjoy using.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="/app/calendar">
              <Button variant="hero" size="lg">Open the Demo</Button>
            </a>
            <Button variant="outline" size="lg">Sign up with Email</Button>
            <Button variant="secondary" size="lg">Continue with Google</Button>
          </div>
          <p className="text-sm text-muted-foreground">
            No backend yet – this demo focuses on the look & feel. Functionality will follow.
          </p>
        </section>
        <section className="relative">
          <img src={hero} alt="Modern calendar rostering app hero" className="rounded-xl shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-glow)] transition-shadow" loading="lazy" />
          <div className="pointer-events-none absolute inset-0 rounded-xl" style={{ background: "radial-gradient(600px circle at var(--x,50%) var(--y,50%), hsl(var(--primary)/0.08), transparent 40%)" }} />
        </section>
      </main>
    </div>
  );
};

export default Index;
