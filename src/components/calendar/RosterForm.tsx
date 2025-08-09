import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useEffect, useMemo, useState } from "react";
import { format as formatDate } from "date-fns";
import { useActiveLocation, useStaff, useStaffByLocation } from "@/data/hooks";
import type { Roster as StoreRoster, StaffRecord, Area } from "@/data/types";
import { toast } from "@/components/ui/use-toast";

// Areas and sections are derived from the active location


const ShiftSchema = z
  .object({
    staffId: z.string().min(1, "Staff is required"),
    role: z.string().min(1, "Role is required"),
    areaId: z.string().min(1, "Area is required"),
    section: z.string().min(1, "Section is required"),
    start: z.string().min(1, "Start time is required"), // HH:mm
    end: z.string().min(1, "End time is required"),
    notes: z.string().optional().default(""),
  })
  .refine((s) => s.start < s.end, {
    path: ["end"],
    message: "End must be after start",
  });

export const RosterSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().default(""),
  shifts: z.array(ShiftSchema).default([]),
});

export type Shift = z.infer<typeof ShiftSchema>;
export type Roster = z.infer<typeof RosterSchema> & { id: string };

export default function RosterForm({
  defaultDate,
  onSubmit,
  roster,
}: {
  defaultDate: Date;
  onSubmit: (r: Omit<StoreRoster, "id">) => void;
  roster?: StoreRoster;
}) {
  const defaultTitle = useMemo(() => `Daily roster – ${formatDate(defaultDate, "dd MMM yyyy")}`, [defaultDate]);

  const initialDefaults = useMemo(() => {
    if (roster) {
      return {
        title: roster.title || "",
        description: roster.description || "",
        shifts: (roster.shifts || []).map((s) => ({
          staffId: s.staffId || "",
          role: s.role,
          areaId: s.areaId,
          section: s.section,
          start: s.start,
          end: s.end,
          notes: s.notes || "",
        })),
      };
    }
    return { title: defaultTitle, description: "", shifts: [] };
  }, [roster, defaultTitle]);

  const form = useForm<z.infer<typeof RosterSchema>>({
    resolver: zodResolver(RosterSchema),
    defaultValues: initialDefaults,
  });

  const { control } = form;
  const { append, remove } = useFieldArray({ control, name: "shifts" });

  // Active location + staff from store
  const active = useActiveLocation();
  const areas = active?.areas ?? [];
  const { staff } = useStaff();
  const eligibleStaff = useStaffByLocation(active?.id);

  const roles = useMemo(() => {
    const set = new Set<string>();
    staff.forEach((s) => s.role && set.add(s.role));
    return Array.from(set);
  }, [staff]);

  const staffMap = useMemo(() => new Map(staff.map((s) => [s.id, s])), [staff]);

  const shifts = form.watch("shifts");

  useEffect(() => {
    if (roster) {
      form.reset(initialDefaults);
    }
  }, [roster, form, initialDefaults]);

  const getSections = (areaId?: string) => areas.find((a) => a.id === areaId)?.sections ?? [];

  const parseMinutes = (t: string) => {
    const [h, m] = t.split(":").map((n) => Number(n));
    return h * 60 + (m || 0);
  };

  const stats = useMemo(() => {
    const totalHours = (shifts || []).reduce((acc: number, s: any) => acc + Math.max(0, parseMinutes(s.end) - parseMinutes(s.start)) / 60, 0);
    const totalCost = (shifts || []).reduce((acc: number, s: any) => {
      const st = staff.find((x) => x.id === s.staffId);
      const rate = Number(st?.payRate || 0);
      const hours = Math.max(0, parseMinutes(s.end) - parseMinutes(s.start)) / 60;
      return acc + rate * hours;
    }, 0);
    return {
      totalHours: Number(totalHours.toFixed(2)),
      totalCost: Number(totalCost.toFixed(2)),
      totalShifts: shifts?.length || 0,
    };
  }, [shifts, staff]);

  // Shift Dialog state
  const [open, setOpen] = useState(false);

  return (
    <Form {...form}>
      <form
        className="grid gap-6"
        onSubmit={form.handleSubmit((values) => {
          if (!active?.id && !roster?.locationId) return;
          if (!values.shifts || values.shifts.length === 0) {
            toast({ title: "Add at least one shift", description: "Please add a shift before saving.", variant: "destructive" });
            console.warn("[RosterForm] Attempted save with 0 shifts");
            return;
          }
          const payload: Omit<StoreRoster, "id"> = {
            dateISO: formatDate(defaultDate, "yyyy-MM-dd"),
            locationId: roster?.locationId ?? (active!.id as string),
            title: values.title,
            description: values.description,
            shifts: (values.shifts || []).map((s) => ({
              id: (crypto.randomUUID?.() || Date.now().toString()),
              role: s.role,
              areaId: s.areaId,
              section: s.section,
              staffId: s.staffId,
              start: s.start,
              end: s.end,
              notes: s.notes,
            })),
          };
          console.log("[RosterForm] Saving roster", { title: values.title, shiftCount: values.shifts.length });
          onSubmit(payload);
          if (!roster) {
            form.reset({ title: defaultTitle, description: "", shifts: [] });
            toast({ title: "Roster saved", description: `${values.title || "Daily roster"} • ${payload.shifts.length} shift(s)` });
          } else {
            toast({ title: "Roster updated", description: `${values.title || "Daily roster"} • ${payload.shifts.length} shift(s)` });
          }
        })}
      >
        {/* Top fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            name="title"
            control={form.control}
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Roster Name</FormLabel>
                <FormControl>
                  <Input placeholder={defaultTitle} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="md:col-span-1">
            <FormLabel>Date</FormLabel>
            <Input value={formatDate(defaultDate, "dd/MM/yyyy")} disabled readOnly aria-label="Roster date" />
          </div>
        </div>

        <FormField
          name="description"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Add any notes or special instructions for this roster..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card>
            <CardContent className="py-4">
              <div className="text-sm text-muted-foreground">Total Cost</div>
              <div className="text-xl font-semibold">${stats.totalCost.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="text-sm text-muted-foreground">Total Hours</div>
              <div className="text-xl font-semibold">{stats.totalHours}h</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="text-sm text-muted-foreground">Total Shifts</div>
              <div className="text-xl font-semibold">{stats.totalShifts}</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between">
          <FormLabel className="text-base">Shifts by Area</FormLabel>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="secondary" onClick={(e) => e.stopPropagation()}>+ Add Shift</Button>
            </DialogTrigger>
            <DialogContent
              className="sm:max-w-xl max-h-[85vh] overflow-y-auto"
            >
              <DialogHeader>
                <DialogTitle>Add New Shift</DialogTitle>
                <DialogDescription>Fill out shift details and assign a staff member.</DialogDescription>
              </DialogHeader>
              <AddShiftForm
                onCancel={() => setOpen(false)}
                onAdd={(s) => {
                  append(s);
                  setOpen(false);
                }}
                roles={roles}
                staff={eligibleStaff}
                getSections={getSections}
                areas={areas}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Areas */}
        <div className="space-y-3">
          {areas.map((a) => {
            const pairs = (shifts || []).map((s, i) => [s, i] as const).filter(([s]) => s.areaId === a.id);
            return (
              <Card key={a.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{a.name}</div>
                    <div className="text-xs text-muted-foreground">{pairs.length} {pairs.length === 1 ? "shift" : "shifts"}</div>
                  </div>
                  {pairs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No shifts assigned to this area</p>
                  ) : (
                    <ul className="space-y-2">
                      {pairs.map(([s, idx]) => {
                        const staffRec = staffMap.get(s.staffId);
                        return (
                          <li key={`${a.id}-${idx}`} className="text-sm flex items-center justify-between gap-2">
                            <div className="truncate">
                              <span className="font-medium">{staffRec?.name || "Unassigned"}</span>
                              <span className="mx-2 text-muted-foreground">•</span>
                              <span>{s.role}</span>
                              <span className="mx-2 text-muted-foreground">•</span>
                              <span>
                                {s.start} - {s.end}
                              </span>
                              {s.section ? (
                                <>
                                  <span className="mx-2 text-muted-foreground">•</span>
                                  <span>{s.section}</span>
                                </>
                              ) : null}
                            </div>
                            <Button variant="ghost" size="sm" onClick={(e) => { e.preventDefault(); remove(idx); }}>Remove</Button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={form.formState.isSubmitting || (shifts?.length || 0) === 0}>{roster ? "Save Changes" : "Save Roster"}</Button>
        </div>
      </form>
    </Form>
  );
}

function AddShiftForm({
  onAdd,
  onCancel,
  roles,
  staff,
  getSections,
  areas,
}: {
  onAdd: (s: Shift) => void;
  onCancel: () => void;
  roles: string[];
  staff: StaffRecord[];
  getSections: (areaId?: string) => string[];
  areas: Area[];
}) {
  const schema = ShiftSchema;
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      staffId: "",
      role: "",
      areaId: "",
      section: "",
      start: "",
      end: "",
      notes: "",
    },
  });

  const areaId = form.watch("areaId");
  const sections = getSections(areaId);

  useEffect(() => {
    // Ensure section is always valid for the selected area
    const first = sections[0] ?? "";
    if (!form.getValues("section") && first) form.setValue("section", first);
  }, [sections, form]);

  return (
    <Form {...form}>
      <div className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Role */}
          <FormField name="role" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {roles.length === 0 ? <SelectItem value="Staff">Staff</SelectItem> : roles.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          {/* Area */}
          <FormField name="areaId" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Area</FormLabel>
              <Select value={field.value} onValueChange={(val) => {
                field.onChange(val);
                const firstSection = getSections(val)[0] ?? "";
                form.setValue("section", firstSection);
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
              <FormLabel>Start Time</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {/* End */}
          <FormField name="end" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>End Time</FormLabel>
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
              <Select
                value={field.value}
                onValueChange={(val) => {
                  field.onChange(val);
                  const selected = staff.find((s) => s.id === val);
                  if (selected?.role) form.setValue("role", selected.role);
                }}
              >
                <FormControl>
                  <SelectTrigger disabled={staff.length === 0}>
                    <SelectValue placeholder="Select a team member" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {staff.length === 0 ? (
                    <SelectItem value="no-staff" disabled>No staff yet</SelectItem>
                  ) : (
                    staff.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}{s.role ? ` – ${s.role}` : ""}{typeof s.payRate === "number" ? ` ($${s.payRate}/hr)` : ""}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          {/* Notes */}
          <FormField name="notes" control={form.control} render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional notes for this shift..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="flex justify-between gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCancel(); }}>Cancel</Button>
          <Button
            type="button"
            disabled={staff.length === 0}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit((values) => onAdd(values))();
            }}
          >
            + Add Shift
          </Button>
        </div>
      </div>
    </Form>
  );
}
