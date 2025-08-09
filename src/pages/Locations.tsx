import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAddLocations } from "@/data/hooks";
import { toast } from "@/components/ui/use-toast";

const LocationSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  areas: z.string().optional(),
  sections: z.string().optional(),
});

type LocationForm = z.infer<typeof LocationSchema>;

export default function Locations() {
  const form = useForm<LocationForm>({ resolver: zodResolver(LocationSchema) });
  const addLocations = useAddLocations();
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
  };

  return (
    <section className="max-w-2xl space-y-4 animate-enter">
      <header>
        <h1 className="text-xl font-semibold">Locations</h1>
        <p className="text-sm text-muted-foreground">Add venues and define areas and sections.</p>
      </header>
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
    </section>
  );
}
