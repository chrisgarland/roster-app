import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Areas and sections used across the app
const AREA_SECTIONS: { area: string; sections: string[] }[] = [
  { area: "Bar", sections: ["Front Bar", "Beer Garden"] },
  { area: "Kitchen", sections: ["Pass", "Prep"] },
  { area: "Floor", sections: ["Main", "Function Room"] },
];

const ShiftSchema = z.object({
  staff: z.string().min(1, "Staff is required"),
  area: z.string().min(1, "Area is required"),
  section: z.string().min(1, "Section is required"),
  start: z.string().min(1, "Start time is required"), // HH:mm
  end: z.string().min(1, "End time is required"),
}).refine((s) => s.start < s.end, {
  path: ["end"],
  message: "End must be after start",
});

export const RosterSchema = z.object({
  title: z.string().min(1, "Title is required"),
  shifts: z.array(ShiftSchema).min(1, "Add at least one shift"),
});

export type Shift = z.infer<typeof ShiftSchema>;
export type Roster = z.infer<typeof RosterSchema> & { id: string };

export default function RosterForm({ defaultDate, onSubmit }: { defaultDate: Date; onSubmit: (r: Roster) => void }) {
  const form = useForm<z.infer<typeof RosterSchema>>({
    resolver: zodResolver(RosterSchema),
    defaultValues: { title: "", shifts: [] },
  });

  const { control, setValue, watch } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "shifts" });

  const [shiftOpen, setShiftOpen] = useState(false);
  const shiftForm = useForm<Shift>({
    resolver: zodResolver(ShiftSchema),
    defaultValues: { staff: "", area: "Bar", section: "Front Bar", start: "09:00", end: "17:00" },
  });

  useEffect(() => {
    if (fields.length === 0) {
      append({ staff: "", area: "Bar", section: "Front Bar", start: "10:00", end: "14:00" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getSections = (area?: string) => AREA_SECTIONS.find((a) => a.area === area)?.sections ?? [];

  return (
    <Form {...form}>
      <form
        className="grid gap-4"
        onSubmit={form.handleSubmit((values) => onSubmit({ id: crypto.randomUUID?.() || Date.now().toString(), ...values }))}
      >
        <FormField name="title" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Roster Name</FormLabel>
            <FormControl>
              <Input placeholder={`Daily roster – ${defaultDate.toDateString()}`} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <FormLabel>Shifts</FormLabel>
            <Button type="button" variant="secondary" onClick={() => setShiftOpen(true)}>
              Add Shift
            </Button>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => {
              const area = watch(`shifts.${index}.area` as const) as string | undefined;
              const sections = getSections(area);
              return (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end border rounded-md p-3 bg-muted/20">
                  {/* Staff */}
                  <FormField control={control} name={`shifts.${index}.staff` as const} render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Staff</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Alex" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Area */}
                  <FormField control={control} name={`shifts.${index}.area` as const} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Area</FormLabel>
                      <Select value={field.value} onValueChange={(val) => {
                        field.onChange(val);
                        const firstSection = getSections(val)[0] ?? "";
                        setValue(`shifts.${index}.section` as const, firstSection);
                      }}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select area" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {AREA_SECTIONS.map((a) => (
                            <SelectItem key={a.area} value={a.area}>{a.area}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Section */}
                  <FormField control={control} name={`shifts.${index}.section` as const} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Section</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select section" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sections.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Times */}
                  <FormField control={control} name={`shifts.${index}.start` as const} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={control} name={`shifts.${index}.end` as const} render={({ field }) => (
                    <FormItem>
                      <FormLabel>End</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="flex md:justify-end">
                    <Button type="button" variant="ghost" onClick={() => remove(index)}>Remove</Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Dialog open={shiftOpen} onOpenChange={setShiftOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Shift</DialogTitle>
            </DialogHeader>
            <Form {...shiftForm}>
              <form
                className="grid gap-3"
                onSubmit={shiftForm.handleSubmit((values) => {
                  append(values);
                  setShiftOpen(false);
                  shiftForm.reset({ staff: "", area: "Bar", section: "Front Bar", start: "09:00", end: "17:00" });
                })}
              >
                <FormField control={shiftForm.control} name="staff" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Staff</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Alex" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <FormField control={shiftForm.control} name="area" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Area</FormLabel>
                      <Select value={field.value} onValueChange={(val) => {
                        field.onChange(val);
                        const firstSection = getSections(val)[0] ?? "";
                        shiftForm.setValue("section", firstSection);
                      }}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select area" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {AREA_SECTIONS.map((a) => (
                            <SelectItem key={a.area} value={a.area}>{a.area}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={shiftForm.control} name="section" render={({ field }) => {
                    const areaVal = shiftForm.watch("area");
                    const sections = getSections(areaVal);
                    return (
                      <FormItem>
                        <FormLabel>Section</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select section" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sections.map((s) => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    );
                  }} />

                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={shiftForm.control} name="start" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={shiftForm.control} name="end" render={({ field }) => (
                      <FormItem>
                        <FormLabel>End</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={() => setShiftOpen(false)}>Cancel</Button>
                  <Button type="submit">Add Shift</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <div className="flex justify-end gap-2">
          <Button type="submit">Save Roster</Button>
        </div>
      </form>
    </Form>
  );
}
