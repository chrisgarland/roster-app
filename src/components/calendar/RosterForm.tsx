import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export const RosterSchema = z.object({
  title: z.string().min(1),
  area: z.string().min(1),
  section: z.string().min(1),
});

export type Roster = z.infer<typeof RosterSchema> & { id: string };

export default function RosterForm({ defaultDate, onSubmit }: { defaultDate: Date; onSubmit: (r: Roster) => void }) {
  const form = useForm<z.infer<typeof RosterSchema>>({ resolver: zodResolver(RosterSchema) });

  return (
    <Form {...form}>
      <form
        className="grid gap-4"
        onSubmit={form.handleSubmit((values) => onSubmit({ id: Date.now().toString(), ...values }))}
      >
        <FormField name="title" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Roster title</FormLabel>
            <FormControl><Input placeholder={`Daily roster – ${defaultDate.toDateString()}`} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField name="area" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Area</FormLabel>
              <FormControl><Input placeholder="e.g. Bar" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name="section" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Section</FormLabel>
              <FormControl><Input placeholder="e.g. Front Bar" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="submit" variant="default">Save</Button>
        </div>
      </form>
    </Form>
  );
}
