// Central app types for the in-memory store
export type ID = string;

export type SectionName = string;

export type Area = {
  id: ID;
  name: string;
  sections: SectionName[];
};

export type Location = {
  id: ID;
  name: string;
  address: string;
  areas: Area[];
};

export type AvailabilityDay =
  | "Mon"
  | "Tue"
  | "Wed"
  | "Thu"
  | "Fri"
  | "Sat"
  | "Sun";

export type StaffRecord = {
  id: ID;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  payRate?: number;
  availability?: AvailabilityDay[];
  locations?: ID[];
};

export type Shift = {
  id: ID;
  role: string;
  areaId: ID;
  section: string;
  staffId?: ID;
  notes?: string;
  // Times are stored as HH:mm for simplicity; date is defined by the roster's dateISO
  start: string; // e.g. "09:00"
  end: string;   // e.g. "17:30"
};

export type Roster = {
  id: ID;
  dateISO: string; // yyyy-MM-dd
  locationId: ID;
  title?: string;
  description?: string;
  shifts: Shift[];
};

export type AppState = {
  locations: Location[];
  staff: StaffRecord[];
  rosters: Roster[];
  activeLocationId?: ID;
};

// Inputs for creating new records (no ids yet)
export type NewAreaInput = { name: string; sections: string[] };
export type NewLocationInput = { name: string; address: string; areas: NewAreaInput[] };
