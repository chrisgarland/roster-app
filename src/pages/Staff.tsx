import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useStaff, useLocations, useActiveLocation } from "@/data/hooks";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

const StaffSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  role: z.string().min(1, "Role is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  payRate: z.coerce.number().min(0).default(0),
  availability: z.array(z.enum(DAYS)).default([]),
  locations: z.array(z.string()).min(1, "Select at least one location"),
});


type StaffForm = z.infer<typeof StaffSchema>;

const ROLES = ["Bartender", "Chef", "Server", "Host", "Manager"];

export default function Staff() {
  const { toast } = useToast();
  const { staff, add, remove: removeStaff } = useStaff();
  const locations = useLocations();
  const active = useActiveLocation();
  const [tab, setTab] = useState("add");

  const form = useForm<StaffForm>({ resolver: zodResolver(StaffSchema), defaultValues: { availability: [], payRate: 0, locations: active?.id ? [active.id] : [] } });

  useEffect(() => {
    document.title = "Staff Management – Add and Manage Staff";
  }, []);

  const count = staff.length;
  const locMap = new Map((locations || []).map((l) => [l.id, l.name]));

  const onSubmit = (values: StaffForm) => {
    const DAY_TO_ABBR: Record<string, string> = { Monday:"Mon", Tuesday:"Tue", Wednesday:"Wed", Thursday:"Thu", Friday:"Fri", Saturday:"Sat", Sunday:"Sun" };
    const payload = { ...values, availability: (values.availability || []).map((d) => DAY_TO_ABBR[d] || d) } as any;
    add(payload);
    toast({ title: "Staff added", description: `${values.name} has been added.` });
    form.reset({ availability: [], payRate: 0 });
    setTab("manage");
  };

  const onRemove = (id: string) => {
    removeStaff(id);
    toast({ title: "Removed", description: "Staff member removed." });
  };

  const toggleAvailability = (day: typeof DAYS[number], checked: boolean) => {
    const current = new Set(form.getValues("availability"));
    if (checked) current.add(day); else current.delete(day);
    form.setValue("availability", Array.from(current) as any, { shouldDirty: true });
  };

  return (
    <section className="animate-enter">
      <header className="mb-4">
        <h1 className="text-xl font-semibold">Staff Management</h1>
        <p className="text-sm text-muted-foreground">Onboard team members and manage existing staff.</p>
      </header>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="add">Add Staff</TabsTrigger>
          <TabsTrigger value="manage">Manage Staff ({count})</TabsTrigger>
        </TabsList>

        <TabsContent value="add" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Staff Member</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField name="name" control={form.control} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl><Input placeholder="Enter full name" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField name="role" control={form.control} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ROLES.map((r) => (
                              <SelectItem key={r} value={r}>{r}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField name="email" control={form.control} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input type="email" placeholder="email@example.com" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField name="phone" control={form.control} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl><Input placeholder="(555) 123-4567" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField name="payRate" control={form.control} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hourly Pay Rate</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-2 rounded-md border bg-muted/30">$</span>
                            <Input type="number" step="0.01" min={0} placeholder="25.00" value={field.value} onChange={(e) => field.onChange(e.target.value)} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField name="locations" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign Locations *</FormLabel>
                      {locations.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Add a location first.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {locations.map((l) => (
                            <div key={l.id} className="flex items-center gap-2">
                              <Checkbox
                                checked={(field.value || []).includes(l.id)}
                                onCheckedChange={(c) => {
                                  const set = new Set<string>(field.value || []);
                                  if (c) set.add(l.id); else set.delete(l.id);
                                  field.onChange(Array.from(set));
                                }}
                                id={`loc-${l.id}`}
                              />
                              <Label htmlFor={`loc-${l.id}`}>{l.name}</Label>
                            </div>
                          ))}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="space-y-2">
                    <Label>Availability</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {DAYS.map((day) => (
                        <div key={day} className="flex items-center gap-2">
                          <Checkbox
                            checked={form.watch("availability").includes(day)}
                            onCheckedChange={(c) => toggleAvailability(day, Boolean(c))}
                            id={`day-${day}`}
                          />
                          <Label htmlFor={`day-${day}`}>{day}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={() => form.reset({ availability: [], payRate: 0 })}>Cancel</Button>
                    <Button type="submit">Add Staff Member</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Manage Staff ({count})</CardTitle>
            </CardHeader>
            <CardContent>
              {staff.length === 0 ? (
                <p className="text-sm text-muted-foreground">No staff yet. Add your first team member.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="py-2 pr-2">Name</th>
                        <th className="py-2 pr-2">Role</th>
                        <th className="py-2 pr-2">Email</th>
                        <th className="py-2 pr-2">Phone</th>
                        <th className="py-2 pr-2">Pay</th>
                        <th className="py-2 pr-2">Locations</th>
                        <th className="py-2 pr-2">Availability</th>
                        <th className="py-2 pr-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staff.map((s) => (
                        <tr key={s.id} className="border-b">
                          <td className="py-2 pr-2 font-medium">{s.name}</td>
                          <td className="py-2 pr-2">{s.role}</td>
                          <td className="py-2 pr-2">{s.email}</td>
                          <td className="py-2 pr-2">{s.phone}</td>
                          <td className="py-2 pr-2">{s.payRate ? `$${Number(s.payRate).toFixed(2)}` : "—"}</td>
                          <td className="py-2 pr-2">{s.availability?.length ? s.availability.join(", ") : "—"}</td>
                          <td className="py-2 pr-2 text-right">
                            <Button variant="ghost" size="sm" onClick={() => onRemove(s.id)}>Remove</Button>
                          </td>
                        </tr>
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
