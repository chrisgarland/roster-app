import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const StaffSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

type StaffForm = z.infer<typeof StaffSchema>;

export default function Staff() {
  const form = useForm<StaffForm>({ resolver: zodResolver(StaffSchema) });

  return (
    <section className="max-w-xl space-y-4 animate-enter">
      <header>
        <h1 className="text-xl font-semibold">Staff</h1>
        <p className="text-sm text-muted-foreground">Onboard staff for your locations.</p>
      </header>
      <Form {...form}>
        <form className="grid gap-4 grid-cols-1">
          <FormField name="name" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl><Input placeholder="Pat Taylor" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name="email" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl><Input type="email" placeholder="pat@example.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name="phone" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl><Input placeholder="0400 000 000" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <div className="flex justify-end">
            <Button type="button" variant="default">Save</Button>
          </div>
        </form>
      </Form>
    </section>
  );
}
