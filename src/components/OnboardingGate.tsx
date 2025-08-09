import { useMemo } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAddLocations, useLocations } from "@/data/hooks";
import { useForm, useFieldArray, Control } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Schema for onboarding multiple locations with areas and sections
const SectionStr = z.string().optional();
const AreaSchema = z.object({
  name: z.string().min(1, "Area name is required"),
  sections: SectionStr, // comma separated
});
const LocationSchema = z.object({
  name: z.string().min(1, "Location name is required"),
  address: z.string().min(1, "Address is required"),
  areas: z.array(AreaSchema).min(1, "Add at least one area"),
});
const MultiSchema = z.object({
  locations: z.array(LocationSchema).min(1, "Add at least one location"),
});

type MultiForm = z.infer<typeof MultiSchema>;

export default function OnboardingGate() {
  const locations = useLocations();
  const shouldShow = useMemo(() => locations.length === 0, [locations.length]);
  if (!shouldShow) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="absolute inset-0 pointer-events-none" />
      <div className="relative w-full max-w-4xl mx-4">
        <OnboardingForm />
      </div>
    </div>
  );
}

function OnboardingForm() {
  const addLocations = useAddLocations();
  const form = useForm<MultiForm>({
    resolver: zodResolver(MultiSchema),
    defaultValues: {
      locations: [
        {
          name: "",
          address: "",
          areas: [{ name: "", sections: "" }],
        },
      ],
    },
  });

  const { fields: locFields, append: appendLoc, remove: removeLoc } = useFieldArray({ control: form.control, name: "locations" });

  const onSubmit = form.handleSubmit((values) => {
    const toCreate = values.locations.map((l) => ({
      name: l.name,
      address: l.address,
      areas: l.areas.map((a) => ({ name: a.name, sections: (a.sections || "").split(",").map((s) => s.trim()).filter(Boolean) })),
    }));
    addLocations(toCreate);
  });

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-xl">
      <div className="p-6 border-b">
        <h1 className="text-xl font-semibold">Welcome! Let’s set up your locations</h1>
        <p className="text-sm text-muted-foreground">Create one or more locations and define areas and sections. You can edit these later.</p>
      </div>
      <Form {...form}>
        <form onSubmit={onSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {locFields.map((loc, i) => (
            <div key={loc.id} className="rounded-md border p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField name={`locations.${i}.name`} control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. The Golden Lion" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField name={`locations.${i}.address`} control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 High St, Melbourne" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <AreasEditor index={i} control={form.control} />

              <div className="flex justify-end">
                {locFields.length > 1 && (
                  <Button type="button" variant="ghost" onClick={() => removeLoc(i)}>Remove location</Button>
                )}
              </div>
            </div>
          ))}

          <div className="flex items-center gap-3">
            <Button type="button" variant="secondary" onClick={() => appendLoc({ name: "", address: "", areas: [{ name: "", sections: "" }] })}>
              + Add another location
            </Button>
            <Button type="submit">Save and continue</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

function AreasEditor({ index, control }: { index: number; control: Control<MultiForm> }) {
  const { fields, append, remove } = useFieldArray({ control, name: `locations.${index}.areas` as const });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Areas & sections</h3>
        <Button type="button" variant="outline" size="sm" onClick={() => append({ name: "", sections: "" })}>+ Add area</Button>
      </div>
      <div className="space-y-3">
        {fields.map((f, j) => (
          <div key={f.id} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <FormField name={`locations.${index}.areas.${j}.name`} control={control} render={({ field }) => (
              <FormItem>
                <FormLabel>Area name</FormLabel>
                <FormControl>
                  <Input placeholder="Bar, Kitchen, Floor" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField name={`locations.${index}.areas.${j}.sections`} control={control} render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Sections (comma separated)</FormLabel>
                <FormControl>
                  <Input placeholder="Front Bar, Beer Garden" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="md:col-span-3 -mt-1">
              {fields.length > 1 && <Button type="button" variant="ghost" size="sm" onClick={() => remove(j)}>Remove area</Button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
