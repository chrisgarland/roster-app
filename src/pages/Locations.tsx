import { useEffect, useState } from "react";
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
import { useAddLocations, useLocations } from "@/data/hooks";
import { useUpdateLocation, useRemoveLocation } from "@/data/hooks";

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
                          id={l.id}
                          name={l.name}
                          address={l.address}
                          areaNames={l.areas?.map((a) => a.name) || []}
                          onSave={(name, address) => {
                            updateLocation(l.id, { name: name.trim(), address: address.trim() });
                            toast({ title: "Location updated", description: `${name} details saved.` });
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

function LocationRow({ id, name, address, areaNames, onSave, onRemove }: {
  id: string;
  name: string;
  address: string;
  areaNames: string[];
  onSave: (name: string, address: string) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [n, setN] = useState(name);
  const [a, setA] = useState(address);

  return (
    <tr className="border-b">
      <td className="py-2 pr-2 font-medium">{name}</td>
      <td className="py-2 pr-2">{address}</td>
      <td className="py-2 pr-2">{areaNames.length ? areaNames.join(", ") : "—"}</td>
      <td className="py-2 pr-2 text-right">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost">Edit</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Location</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor={`name-${id}`}>Name</Label>
                <Input id={`name-${id}`} value={n} onChange={(e) => setN(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`addr-${id}`}>Address</Label>
                <Input id={`addr-${id}`} value={a} onChange={(e) => setA(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => { setN(name); setA(address); setOpen(false); }}>Cancel</Button>
              <Button onClick={() => { onSave(n, a); setOpen(false); }}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button size="sm" variant="ghost" onClick={onRemove}>Remove</Button>
      </td>
    </tr>
  );
}