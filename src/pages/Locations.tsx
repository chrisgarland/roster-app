import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAddLocations, useLocations, useUpdateLocation, useRemoveLocation, useRosters } from "@/data/hooks";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Location } from "@/data/types";

const LocationSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  areas: z.string().optional(),
  sections: z.string().optional(),
});

type LocationForm = z.infer<typeof LocationSchema>;

export default function Locations() {
  const [tab, setTab] = useState("add");
  const form = useForm<LocationForm>({ resolver: zodResolver(LocationSchema) });
  const addLocations = useAddLocations();
  const locations = useLocations();
  const updateLocation = useUpdateLocation();
  const removeLocation = useRemoveLocation();

  useEffect(() => {
    document.title = "Locations – Add and Manage";
  }, []);

  const onSubmit = (values: LocationForm) => {
    const parseCSV = (s?: string) => (s ?? "").split(",").map((v) => v.trim()).filter(Boolean);
    const areas = parseCSV(values.areas);
    const sections = parseCSV(values.sections);

    addLocations([
      {
        name: values.name.trim(),
        address: values.address.trim(),
        areas: areas.map((a) => ({ name: a, sections })),
      },
    ]);

    toast({ title: "Location saved", description: `${values.name} added${areas.length ? ` with ${areas.length} area(s)` : ""}.` });
    form.reset();
    setTab("manage");
  };

  const count = locations.length;

  return (
    <section className="animate-enter">
      <header className="mb-4">
        <h1 className="text-xl font-semibold">Locations</h1>
        <p className="text-sm text-muted-foreground">Add venues and manage existing locations.</p>
      </header>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="add">Add Location</TabsTrigger>
          <TabsTrigger value="manage">Manage Locations ({count})</TabsTrigger>
        </TabsList>

        <TabsContent value="add" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Add a Location</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  <FormField name="name" control={form.control} render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Venue name</FormLabel>
                      <FormControl><Input placeholder="e.g. The Golden Lion" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="address" control={form.control} render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Address</FormLabel>
                      <FormControl><Input placeholder="123 High St, Melbourne" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="areas" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Areas (comma separated)</FormLabel>
                      <FormControl><Input placeholder="Bar, Kitchen, Floor" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="sections" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sections (comma separated)</FormLabel>
                      <FormControl><Input placeholder="Front Bar, Beer Garden" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="col-span-2 flex justify-end">
                    <Button type="submit" variant="default" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Manage Locations ({count})</CardTitle>
            </CardHeader>
            <CardContent>
              {locations.length === 0 ? (
                <p className="text-sm text-muted-foreground">No locations yet. Add your first venue.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="py-2 pr-2">Name</th>
                        <th className="py-2 pr-2">Address</th>
                        <th className="py-2 pr-2">Areas</th>
                        <th className="py-2 pr-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {locations.map((l) => (
                        <LocationRow
                          key={l.id}
                          location={l}
                          onUpdated={(patch) => {
                            updateLocation(l.id, patch);
                            toast({ title: "Location updated", description: `${patch.name ?? l.name} details saved.` });
                          }}
                          onRemove={() => {
                            removeLocation(l.id);
                            toast({ title: "Location removed", description: `${l.name} has been removed.` });
                          }}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}

function LocationRow({ location, onUpdated, onRemove }: {
  location: Location;
  onUpdated: (patch: Partial<Location>) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [n, setN] = useState(location.name);
  const [a, setA] = useState(location.address);
  const [areas, setAreas] = useState<Array<{ id?: string; name: string; sections: string[] }>>(
    (location.areas || []).map((ar) => ({ id: ar.id, name: ar.name, sections: [...ar.sections] }))
  );
  const rosters = useRosters();

  useEffect(() => {
    if (open) {
      setN(location.name);
      setA(location.address);
      setAreas((location.areas || []).map((ar) => ({ id: ar.id, name: ar.name, sections: [...ar.sections] })));
    }
  }, [open, location]);

  const shifts = useMemo(() => rosters.filter((r) => r.locationId === location.id).flatMap((r) => r.shifts), [rosters, location.id]);
  const areaUsage = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of shifts) {
      if (!s.areaId) continue;
      m.set(s.areaId, (m.get(s.areaId) ?? 0) + 1);
    }
    return m;
  }, [shifts]);
  const sectionUsage = useMemo(() => {
    const m = new Map<string, Map<string, number>>();
    for (const s of shifts) {
      if (!s.areaId) continue;
      const inner = m.get(s.areaId) ?? new Map<string, number>();
      inner.set(s.section, (inner.get(s.section) ?? 0) + 1);
      m.set(s.areaId, inner);
    }
    return m;
  }, [shifts]);

  const getAreaUsage = (areaId?: string) => (areaId ? areaUsage.get(areaId) ?? 0 : 0);
  const getSectionUsage = (areaId: string | undefined, section: string) => {
    if (!areaId) return 0;
    const map = sectionUsage.get(areaId);
    return map ? map.get(section) ?? 0 : 0;
  };

  const areaNameCounts = useMemo(() => {
    const c = new Map<string, number>();
    areas.forEach((ar) => {
      const k = ar.name.trim().toLowerCase();
      if (!k) return;
      c.set(k, (c.get(k) ?? 0) + 1);
    });
    return c;
  }, [areas]);

  const areaHasError = (ar: { name: string }) => {
    const nm = ar.name.trim();
    if (!nm) return "Required";
    const dup = areaNameCounts.get(nm.toLowerCase()) ?? 0;
    if (dup > 1) return "Duplicate area name";
    return undefined;
  };

  const sectionHasError = (idx: number, sec: string) => {
    const nm = sec.trim();
    if (!nm) return "Required";
    const list = areas[idx]?.sections || [];
    const counts = new Map<string, number>();
    list.forEach((s) => {
      const k = s.trim().toLowerCase();
      if (!k) return;
      counts.set(k, (counts.get(k) ?? 0) + 1);
    });
    if ((counts.get(nm.toLowerCase()) ?? 0) > 1) return "Duplicate section";
    return undefined;
  };

  const hasErrors =
    !n.trim() ||
    !a.trim() ||
    areas.some((ar, i) => areaHasError(ar) || ar.sections.some((s) => sectionHasError(i, s)));

  const addArea = () => setAreas((prev) => [...prev, { name: "", sections: [] }]);
  const removeArea = (i: number) => setAreas((prev) => prev.filter((_, idx) => idx !== i));
  const addSection = (i: number) => setAreas((prev) => prev.map((ar, idx) => (idx === i ? { ...ar, sections: [...ar.sections, ""] } : ar)));
  const removeSection = (ai: number, si: number) =>
    setAreas((prev) => prev.map((ar, idx) => (idx === ai ? { ...ar, sections: ar.sections.filter((_, j) => j !== si) } : ar)));

  const handleSave = () => {
    if (hasErrors) {
      toast({ variant: "destructive", title: "Fix validation errors", description: "Please resolve highlighted fields." });
      return;
    }
    const cleaned = areas.map((ar) => ({ id: ar.id, name: ar.name.trim(), sections: ar.sections.map((s) => s.trim()) }));
    onUpdated({ name: n.trim(), address: a.trim(), areas: cleaned });
    setOpen(false);
  };

  return (
    <tr className="border-b">
      <td className="py-2 pr-2 font-medium">{location.name}</td>
      <td className="py-2 pr-2">{location.address}</td>
      <td className="py-2 pr-2">{location.areas?.length ? location.areas.map((a) => a.name).join(", ") : "—"}</td>
      <td className="py-2 pr-2 text-right">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost">Edit</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Location</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="details">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="areas">Areas & Sections</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="mt-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor={`name-${location.id}`}>Name</Label>
                    <Input id={`name-${location.id}`} value={n} onChange={(e) => setN(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`addr-${location.id}`}>Address</Label>
                    <Input id={`addr-${location.id}`} value={a} onChange={(e) => setA(e.target.value)} />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="areas" className="mt-4">
                <TooltipProvider>
                  <div className="space-y-4">
                    {areas.map((ar, i) => {
                      const usage = getAreaUsage(ar.id);
                      const arErr = areaHasError(ar);
                      return (
                        <div key={ar.id ?? i} className="rounded-md border p-3 space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <Label className="text-sm">Area name</Label>
                              <Input value={ar.name} onChange={(e) => setAreas((prev) => prev.map((x, idx) => (idx === i ? { ...x, name: e.target.value } : x)))} />
                              {arErr && <p className="text-xs text-destructive mt-1">{arErr}</p>}
                            </div>
                            <div className="text-xs text-muted-foreground whitespace-nowrap pt-6">{usage > 0 ? `${usage} shift(s)` : "Not used"}</div>
                            <div className="pt-5">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span>
                                    <Button size="sm" variant="ghost" disabled={usage > 0} onClick={() => removeArea(i)}>
                                      Remove area
                                    </Button>
                                  </span>
                                </TooltipTrigger>
                                {usage > 0 && <TooltipContent>Cannot remove; used by {usage} shift(s).</TooltipContent>}
                              </Tooltip>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">Sections</Label>
                            {ar.sections.map((sec, si) => {
                              const sUsage = getSectionUsage(ar.id, sec);
                              const sErr = sectionHasError(i, sec);
                              const disabled = sUsage > 0;
                              return (
                                <div key={`${ar.id ?? i}-${si}`} className="flex items-start gap-3">
                                  <div className="flex-1">
                                    <Input value={sec} disabled={disabled} onChange={(e) => setAreas((prev) => prev.map((x, idx) => (idx === i ? { ...x, sections: x.sections.map((s, j) => (j === si ? e.target.value : s)) } : x)))} />
                                    {disabled && <p className="text-xs text-muted-foreground mt-1">In use by {sUsage} shift(s) — rename blocked.</p>}
                                    {sErr && !disabled && <p className="text-xs text-destructive mt-1">{sErr}</p>}
                                  </div>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span>
                                        <Button size="sm" variant="ghost" disabled={sUsage > 0} onClick={() => removeSection(i, si)}>Remove</Button>
                                      </span>
                                    </TooltipTrigger>
                                    {sUsage > 0 && <TooltipContent>Cannot remove; used by {sUsage} shift(s).</TooltipContent>}
                                  </Tooltip>
                                </div>
                              );
                            })}
                            <div>
                              <Button size="sm" variant="secondary" onClick={() => addSection(i)}>+ Add section</Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div>
                      <Button size="sm" onClick={addArea}>+ Add area</Button>
                    </div>
                  </div>
                </TooltipProvider>
              </TabsContent>
            </Tabs>
            <DialogFooter>
              <Button variant="secondary" onClick={() => { setOpen(false); }}>Cancel</Button>
              <Button onClick={handleSave} disabled={hasErrors}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button size="sm" variant="ghost" onClick={onRemove}>Remove</Button>
      </td>
    </tr>
  );
}
