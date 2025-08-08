import { useLocations, useActiveLocation, useSetActiveLocation } from "@/data/hooks";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function LocationSwitcher() {
  const locations = useLocations();
  const active = useActiveLocation();
  const setActive = useSetActiveLocation();

  if (locations.length === 0) return null;

  return (
    <Select value={active?.id} onValueChange={(v) => setActive(v)}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Select location" />
      </SelectTrigger>
      <SelectContent>
        {locations.map((l) => (
          <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
