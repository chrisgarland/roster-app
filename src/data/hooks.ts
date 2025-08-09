import { useCallback, useMemo } from "react";
import { useStoreInternal } from "./store";
import type { ID, Location, Roster, StaffRecord, NewLocationInput } from "./types";

// Basic selectors and actions
export function useLocations() {
  const { state } = useStoreInternal();
  return state.locations;
}

export function useActiveLocation() {
  const { state } = useStoreInternal();
  const active = useMemo(() => state.locations.find((l) => l.id === state.activeLocationId), [state.locations, state.activeLocationId]);
  return active;
}

export function useSetActiveLocation() {
  const { dispatch } = useStoreInternal();
  return useCallback((id: ID | undefined) => dispatch({ type: "setActiveLocation", payload: { id } }), [dispatch]);
}

export function useAddLocations() {
  const { dispatch } = useStoreInternal();
  return useCallback((locations: NewLocationInput[]) => dispatch({ type: "addLocations", payload: { locations } }), [dispatch]);
}

export function useUpdateLocation() {
  const { dispatch } = useStoreInternal();
  return useCallback((id: ID, patch: Partial<Location>) => dispatch({ type: "updateLocation", payload: { id, patch } }), [dispatch]);
}

export function useRemoveLocation() {
  const { dispatch } = useStoreInternal();
  return useCallback((id: ID) => dispatch({ type: "removeLocation", payload: { id } }), [dispatch]);
}

export function useStaff() {
  const { state, dispatch } = useStoreInternal();
  const add = useCallback((staff: Omit<StaffRecord, "id">) => dispatch({ type: "addStaff", payload: { staff } }), [dispatch]);
  const remove = useCallback((id: ID) => dispatch({ type: "removeStaff", payload: { id } }), [dispatch]);
  return { staff: state.staff, add, remove };
}

export function useUpdateStaff() {
  const { dispatch } = useStoreInternal();
  return useCallback((id: ID, patch: Partial<StaffRecord>) => dispatch({ type: "updateStaff", payload: { id, patch } }), [dispatch]);
}

export function useStaffByLocation(locationId?: ID) {
  const { state } = useStoreInternal();
  return useMemo(
    () => (!locationId ? [] : state.staff.filter((s) => Array.isArray(s.locations) && s.locations.includes(locationId))),
    [state.staff, locationId]
  );
}

export function useRostersByDate(dateISO: string, locationId?: ID) {
  const { state } = useStoreInternal();
  return useMemo(() => state.rosters.filter((r) => r.dateISO === dateISO && (!locationId || r.locationId === locationId)), [state.rosters, dateISO, locationId]);
}

export function useAddRoster() {
  const { dispatch } = useStoreInternal();
  return useCallback((roster: Omit<Roster, "id">) => dispatch({ type: "addRoster", payload: { roster } }), [dispatch]);
}

export function useUpdateRoster() {
  const { dispatch } = useStoreInternal();
  return useCallback((roster: Roster) => dispatch({ type: "updateRoster", payload: { roster } }), [dispatch]);
}
