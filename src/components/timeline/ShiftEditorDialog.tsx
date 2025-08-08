import { z } from "zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Area, Shift, StaffRecord } from "@/data/types";

export type ShiftUpdate = Omit<Shift, "id">;

const schema = z
  .object({
    staffId: z.string().min(1, "Staff is required"),
    role: z.string().min(1, "Role is required"),
    areaId: z.string().min(1, "Area is required"),
    section: z.string().min(1, "Section is required"),
    start: z.string().min(1, "Start time is required"),
    end: z.string().min(1, "End time is required"),
    notes: z.string().optional().default(""),
  })
  .refine((s) => s.start < s.end, {
    path: ["end"],
    message: "End must be after start",
  });

export default function ShiftEditorDialog({
  open,
  onOpenChange,
  shift,
  staff,
  areas,
  onSave,
  onRemove,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: Shift;
  staff: StaffRecord[];
  areas: Area[];
  onSave: (updated: ShiftUpdate) => void;
  onRemove: () => void;
}) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      staffId: shift.staffId ?? staff[0]?.id ?? "",
      role: shift.role,
      areaId: shift.areaId,
      section: shift.section,
      start: shift.start,
      end: shift.end,
      notes: shift.notes || "",
    },
  });

  // Keep section in sync with area
  const areaId = form.watch("areaId");
  const sections = useMemo(() => {
    const a = areas.find((x) => x.id === areaId);
    return a?.sections ?? [];
  }, [areas, areaId]);

  useEffect(() => {
    const first = sections[0] ?? "";
    if (!form.getValues("section") && first) form.setValue("section", first);
  }, [sections, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Edit Shift</DialogTitle>
          <DialogDescription>Update details or remove this shift.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="grid gap-4"
            onSubmit={form.handleSubmit((values) => {
              onSave(values as ShiftUpdate);
            })}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Role */}
              <FormField name="role" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Input placeholder="Role" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Area */}
              <FormField name="areaId" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Area</FormLabel>
                  <Select value={field.value} onValueChange={(val) => {
                    field.onChange(val);
                    const first = (areas.find((a) => a.id === val)?.sections ?? [""])[0] ?? "";
                    form.setValue("section", first);
                  }}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select area" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {areas.map((a) => (
                        <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Section */}
              <FormField name="section" control={form.control} render={({ field }) => (
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

              {/* Start */}
              <FormField name="start" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Start</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* End */}
              <FormField name="end" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>End</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Staff */}
              <FormField name="staffId" control={form.control} render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Assign Staff</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select staff" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {staff.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}{s.role ? ` – ${s.role}` : ""}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Notes */}
              <FormField name="notes" control={form.control} render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Optional notes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="flex items-center justify-between gap-3 mt-2">
              <Button type="button" variant="destructive" onClick={onRemove}>Remove shift</Button>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit">Save changes</Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
