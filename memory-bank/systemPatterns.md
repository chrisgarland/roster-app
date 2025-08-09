# System Patterns: RosterFlow Architecture

## Overall Architecture

### Frontend-Only Architecture
- **Single Page Application (SPA)** built with React 18 and TypeScript
- **Client-Side State Management** using React Context + useReducer pattern
- **Component-Based Design** with shadcn/ui component library
- **No Backend Dependencies** - all data stored in memory during session

### Application Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui base components
│   ├── calendar/       # Calendar-specific components
│   ├── timeline/       # Timeline view components
│   └── layout/         # Layout and navigation
├── pages/              # Route-level page components
├── data/               # State management and types
├── hooks/              # Custom React hooks
└── lib/                # Utility functions
```

## Key Design Patterns

### 1. Centralized State Management

#### Store Pattern
- **Single Source of Truth**: All application state in one store
- **Immutable Updates**: State changes through reducer actions only
- **Type Safety**: Full TypeScript coverage for state and actions

```typescript
// Core state structure
type AppState = {
  locations: Location[];
  staff: StaffRecord[];
  rosters: Roster[];
  activeLocationId?: ID;
};
```

#### Action-Based Updates
- **Predictable State Changes**: All mutations through dispatched actions
- **Atomic Operations**: Each action represents a complete state transition
- **Logging Support**: Actions are logged for debugging

### 2. Hierarchical Data Model

#### Location → Area → Section Structure
```
Location (Venue)
├── Area (Bar, Kitchen, Floor)
│   └── Section (Front Bar, Beer Garden)
└── Area (Kitchen)
    └── Section (Prep, Grill, Pass)
```

#### Referential Integrity
- **ID-Based References**: All relationships use generated IDs
- **Cascade Protection**: Prevents deletion of referenced entities
- **Usage Tracking**: System tracks where entities are used

### 3. Component Composition Patterns

#### Container/Presentation Pattern
- **Smart Components**: Handle data fetching and state management
- **Dumb Components**: Pure presentation with props interface
- **Custom Hooks**: Extract data logic from components

#### Compound Components
- **Form Components**: Complex forms broken into reusable parts
- **Dialog Patterns**: Consistent modal/dialog implementations
- **Layout Components**: Flexible layout system with sidebar

### 4. Data Flow Patterns

#### Unidirectional Data Flow
```
User Action → Dispatch Action → Reducer → State Update → Component Re-render
```

#### Derived State Pattern
- **Computed Values**: Expensive calculations memoized with useMemo
- **Filtered Data**: Dynamic filtering based on active location/date
- **Aggregated Stats**: Real-time cost and hour calculations

## Critical Implementation Paths

### 1. Roster Creation Flow
```
Calendar Month View → Click Day → Open Roster Dialog → 
Add Shifts → Assign Staff → Calculate Costs → Save Roster
```

**Key Components:**
- `MonthGrid.tsx` - Calendar display and day selection
- `RosterForm.tsx` - Complex form with shift management
- `AddShiftForm` - Nested form for individual shift creation

### 2. Staff Assignment Logic
```
Select Area → Filter Sections → Choose Staff → 
Validate Availability → Assign to Shift → Update Costs
```

**Key Patterns:**
- **Eligibility Filtering**: Only show staff assigned to current location
- **Availability Checking**: Respect staff availability preferences
- **Cost Calculation**: Real-time updates based on pay rates and hours

### 3. Timeline Visualization
```
Parse Shifts → Calculate Positions → Render Timeline Blocks → 
Handle Click Events → Open Shift Editor
```

**Key Algorithms:**
- **Time Positioning**: Convert HH:mm to percentage positions on grid
- **Visual Layout**: 15-hour timeline (8am-11pm) with hourly divisions
- **Event Handling**: Complex click handling to prevent dialog conflicts

## Component Relationships

### Core Data Components
- **StoreProvider**: Root context provider for all state
- **Custom Hooks**: Abstract store access (`useLocations`, `useStaff`, etc.)
- **Type Definitions**: Central type system in `types.ts`

### UI Component Hierarchy
```
App
├── AppLayout
│   ├── AppSidebar (Navigation)
│   ├── LocationSwitcher (Context switching)
│   └── Outlet (Page content)
├── OnboardingGate (First-time setup)
└── Pages
    ├── CalendarMonth → MonthGrid → RosterForm
    ├── DayTimeline → ShiftEditorDialog
    ├── Locations → LocationRow (with inline editing)
    └── Staff → StaffForm (with availability management)
```

### Form Management Patterns
- **React Hook Form**: All forms use RHF with Zod validation
- **Field Arrays**: Dynamic shift lists and area/section management
- **Nested Forms**: Complex forms with multiple levels of data
- **Validation**: Real-time validation with user-friendly error messages

## Technical Decision Rationale

### State Management Choice
**Why Context + useReducer over Redux:**
- Simpler setup for medium-complexity state
- No external dependencies
- Built-in TypeScript support
- Sufficient for current scope

### Component Library Choice
**Why shadcn/ui:**
- Modern, accessible components
- Full TypeScript support
- Customizable with Tailwind CSS
- Copy-paste approach (no runtime dependency)

### Form Library Choice
**Why React Hook Form + Zod:**
- Excellent performance with minimal re-renders
- Strong TypeScript integration
- Powerful validation with Zod schemas
- Great developer experience

### Date Library Choice
**Why date-fns:**
- Functional approach matches React patterns
- Tree-shakeable (smaller bundle)
- Excellent TypeScript support
- Comprehensive date manipulation functions

## Performance Patterns

### Memoization Strategy
- **useMemo**: Expensive calculations (staff filtering, cost totals)
- **useCallback**: Event handlers passed to child components
- **React.memo**: Pure components that re-render frequently

### Rendering Optimization
- **Conditional Rendering**: Only render necessary components
- **List Keys**: Stable keys for dynamic lists
- **Event Delegation**: Efficient event handling in timeline view

### Data Efficiency
- **Normalized State**: Flat data structures with ID references
- **Selective Updates**: Only update changed portions of state
- **Derived State**: Calculate values on-demand rather than storing
