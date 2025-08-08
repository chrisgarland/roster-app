import React, { createContext, useContext, useMemo, useReducer } from "react";
import type { AppState, ID, Location, Roster, StaffRecord, NewLocationInput } from "./types";

// Simple id generator (stable without external deps)
const makeId = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`);

// Actions
type Action =
  | { type: "addLocations"; payload: { locations: NewLocationInput[] } }
  | { type: "setActiveLocation"; payload: { id: ID | undefined } }
  | { type: "addStaff"; payload: { staff: Omit<StaffRecord, "id"> } }
  | { type: "removeStaff"; payload: { id: ID } }
  | { type: "addRoster"; payload: { roster: Omit<Roster, "id"> } }
  | { type: "updateRoster"; payload: { roster: Roster } };

const initialState: AppState = {
  locations: [],
  staff: [],
  rosters: [],
  activeLocationId: undefined,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "addLocations": {
      const created = action.payload.locations.map((l) => ({
        ...l,
        id: makeId(),
        areas: l.areas.map((a) => ({ ...a, id: makeId() })),
      }));
      const activeLocationId = state.activeLocationId ?? created[0]?.id;
      return { ...state, locations: [...state.locations, ...created], activeLocationId };
    }
    case "setActiveLocation":
      return { ...state, activeLocationId: action.payload.id };
    case "addStaff": {
      const id = makeId();
      return { ...state, staff: [...state.staff, { ...action.payload.staff, id }] };
    }
    case "removeStaff": {
      return { ...state, staff: state.staff.filter((s) => s.id !== action.payload.id) };
    }
    case "addRoster": {
      const id = makeId();
      const rosterWithId = { ...action.payload.roster, id };
      console.log("[Store] addRoster", { title: rosterWithId.title, dateISO: rosterWithId.dateISO, locationId: rosterWithId.locationId, shiftCount: rosterWithId.shifts?.length ?? 0 });
      return { ...state, rosters: [...state.rosters, rosterWithId] };
    }
    case "updateRoster": {
      console.log("[Store] updateRoster", { id: action.payload.roster.id, title: action.payload.roster.title, dateISO: action.payload.roster.dateISO, shiftCount: action.payload.roster.shifts?.length ?? 0 });
      return { ...state, rosters: state.rosters.map((r) => (r.id === action.payload.roster.id ? action.payload.roster : r)) };
    }
    default:
      return state;
  }
}

const StoreContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStoreInternal() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export const ids = { makeId };
