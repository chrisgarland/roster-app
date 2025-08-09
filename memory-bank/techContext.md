# Technical Context: RosterFlow

## Technology Stack

### Core Framework
- **React 18.3.1**: Latest stable React with concurrent features
- **TypeScript 5.8.3**: Full type safety across the application
- **Vite 5.4.19**: Fast build tool and dev server
- **Node.js**: Development environment (no runtime dependency)

### UI & Styling
- **Tailwind CSS 3.4.17**: Utility-first CSS framework
- **shadcn/ui**: Modern React component library built on Radix UI
- **Radix UI Primitives**: Accessible, unstyled UI components
- **Lucide React**: Modern icon library
- **next-themes**: Dark/light mode support

### State Management & Data
- **React Context + useReducer**: Built-in state management
- **React Hook Form 7.61.1**: Performant form handling
- **Zod 3.25.76**: TypeScript-first schema validation
- **date-fns 3.6.0**: Functional date manipulation library

### Development Tools
- **ESLint 9.32.0**: Code linting with TypeScript support
- **TypeScript ESLint**: TypeScript-specific linting rules
- **Autoprefixer**: CSS vendor prefixing
- **PostCSS**: CSS processing pipeline

### Build & Deployment
- **Vite Build**: Optimized production builds
- **SWC**: Fast TypeScript/JavaScript compiler
- **Tree Shaking**: Automatic dead code elimination
- **Code Splitting**: Automatic route-based splitting

## Development Setup

### Prerequisites
- **Node.js**: Version 18+ (recommended: use nvm)
- **npm**: Package manager (comes with Node.js)
- **Modern Browser**: Chrome, Firefox, or Safari for development

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

### Development Server
- **Port**: Typically runs on http://localhost:5173
- **Hot Reload**: Instant updates during development
- **TypeScript Checking**: Real-time type checking in terminal
- **Fast Refresh**: Preserves component state during updates

## Project Configuration

### TypeScript Configuration
- **Strict Mode**: Full TypeScript strict checking enabled
- **Path Mapping**: `@/` alias points to `src/` directory
- **Module Resolution**: Node.js style module resolution
- **Target**: ES2020 for modern browser support

### Build Configuration
- **Bundle Splitting**: Automatic vendor and route-based splitting
- **Asset Optimization**: Image and font optimization
- **CSS Processing**: Tailwind compilation and purging
- **Source Maps**: Generated for debugging in development

### Linting Rules
- **ESLint Config**: Extended from recommended TypeScript rules
- **React Rules**: React-specific linting (hooks, refresh)
- **Import Rules**: Consistent import ordering and usage
- **TypeScript Rules**: Strict type checking enforcement

## Dependencies Overview

### Production Dependencies (Key Ones)
```json
{
  "@hookform/resolvers": "^3.10.0",    // React Hook Form + Zod integration
  "@radix-ui/*": "^1.x.x",             // Accessible UI primitives
  "@tanstack/react-query": "^5.83.0",  // Data fetching (future use)
  "class-variance-authority": "^0.7.1", // Component variant management
  "clsx": "^2.1.1",                    // Conditional className utility
  "date-fns": "^3.6.0",                // Date manipulation
  "lucide-react": "^0.462.0",          // Icon library
  "react": "^18.3.1",                  // Core React
  "react-dom": "^18.3.1",              // React DOM renderer
  "react-hook-form": "^7.61.1",        // Form management
  "react-router-dom": "^6.30.1",       // Client-side routing
  "tailwind-merge": "^2.6.0",          // Tailwind class merging
  "zod": "^3.25.76"                    // Schema validation
}
```

### Development Dependencies
```json
{
  "@types/react": "^18.3.23",          // React TypeScript types
  "@vitejs/plugin-react-swc": "^3.11.0", // Vite React plugin with SWC
  "eslint": "^9.32.0",                 // Code linting
  "tailwindcss": "^3.4.17",            // CSS framework
  "typescript": "^5.8.3",              // TypeScript compiler
  "vite": "^5.4.19"                    // Build tool
}
```

## Technical Constraints

### Browser Support
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+
- **ES2020 Features**: Uses modern JavaScript features
- **CSS Grid/Flexbox**: Relies on modern CSS layout
- **No IE Support**: Does not support Internet Explorer

### Performance Considerations
- **Bundle Size**: Optimized for fast loading
- **Runtime Performance**: Efficient React patterns
- **Memory Usage**: Careful state management to prevent leaks
- **Network**: Minimal external dependencies

### Security Considerations
- **No Backend**: Currently no server-side security concerns
- **Client-Side Only**: All data processing happens in browser
- **Input Validation**: Zod schemas validate all user inputs
- **XSS Prevention**: React's built-in XSS protection

## Development Patterns

### File Organization
```
src/
├── components/
│   ├── ui/              # Base UI components (shadcn/ui)
│   ├── calendar/        # Calendar-specific components
│   ├── timeline/        # Timeline view components
│   └── layout/          # Layout and navigation
├── pages/               # Route components
├── data/                # State management
│   ├── store.tsx        # Context store
│   ├── hooks.ts         # Custom hooks
│   └── types.ts         # TypeScript types
├── hooks/               # Reusable hooks
├── lib/                 # Utilities
└── assets/              # Static assets
```

### Naming Conventions
- **Components**: PascalCase (e.g., `MonthGrid.tsx`)
- **Hooks**: camelCase starting with 'use' (e.g., `useStaff`)
- **Types**: PascalCase (e.g., `StaffRecord`)
- **Files**: PascalCase for components, camelCase for utilities

### Import Patterns
- **Absolute Imports**: Use `@/` alias for src imports
- **Relative Imports**: Only for closely related files
- **Type Imports**: Use `import type` for type-only imports
- **Default Exports**: For components, named exports for utilities

## Build & Deployment

### Build Process
1. **TypeScript Compilation**: Check types and compile to JavaScript
2. **Asset Processing**: Optimize images, fonts, and other assets
3. **CSS Processing**: Compile and purge Tailwind CSS
4. **Bundle Creation**: Create optimized JavaScript bundles
5. **HTML Generation**: Generate HTML with proper asset links

### Production Optimizations
- **Code Splitting**: Automatic route-based splitting
- **Tree Shaking**: Remove unused code
- **Minification**: Compress JavaScript and CSS
- **Asset Hashing**: Cache-busting for static assets
- **Gzip Compression**: Server-level compression support

### Deployment Targets
- **Static Hosting**: Vercel, Netlify, GitHub Pages
- **CDN**: Can be served from any CDN
- **Docker**: Can be containerized for deployment
- **Traditional Hosting**: Any web server that serves static files

## Future Technical Considerations

### Backend Integration
- **API Design**: RESTful or GraphQL API integration
- **Authentication**: JWT or session-based auth
- **Real-time Updates**: WebSocket or Server-Sent Events
- **Data Persistence**: Database integration

### Scalability Preparations
- **State Management**: May need Redux for complex state
- **Caching**: React Query for server state caching
- **Performance**: Code splitting and lazy loading
- **Testing**: Unit and integration test setup
