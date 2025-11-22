# Mikołajkowy Losowator (Secret Santa Draw)

## Overview

Mikołajkowy Losowator is a festive Secret Santa gift exchange application that enables groups to perform a randomized gift assignment. The application features a simple, single-page interface where users enter their name to discover who they've been assigned to buy a gift for. The system ensures fair assignments where no participant draws themselves, and the draw is performed once for the entire group with results persisted across sessions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**React Single-Page Application**
- Built with React 18 and TypeScript using Vite as the build tool
- Single-route application centered around a home page (`/`) with a not-found fallback
- Utilizes Wouter for lightweight client-side routing instead of React Router
- Component library: shadcn/ui (Radix UI primitives) styled with Tailwind CSS in "new-york" style
- Form state managed through react-hook-form with Zod validation
- Server state management via TanStack Query (React Query) for API interactions

**Design System**
- Tailwind CSS configuration with custom theming supporting light/dark modes
- Custom color palette based on HSL values with semantic color tokens
- Typography: Poppins (primary), Fredoka (accent/title), with playful holiday aesthetic
- Component styling follows utility-focused approach with festive personality
- Responsive design with mobile-first approach (768px breakpoint)

**UI Component Structure**
- Centralized layout with vertical/horizontal centering
- Single-column content flow with generous spacing (space-y-8 to space-y-12)
- Three main sections: Header (emoji + title), Form (input + button), Result Display (dynamic)
- Full viewport height with flex centering for balanced presentation

### Backend Architecture

**Express.js REST API**
- Node.js server with Express framework using ES modules
- Development mode: Hot-reload server with Vite middleware integration
- Production mode: Pre-built static file serving from dist directory
- TypeScript compilation with strict mode enabled
- Custom logging middleware tracking API response times and status codes

**API Endpoints**
- `POST /api/check-result`: Accepts user name, returns assigned gift recipient
  - Request validation using Zod schemas from shared schema definitions
  - Returns 404 if participant not found in list
  - Returns 400 for invalid request data
  - Triggers automatic draw if results don't exist yet

**Draw Algorithm**
- Shuffle-based assignment ensuring 1-to-1 mapping
- Validation loop prevents self-assignment (participants[i] ≠ shuffledList[i])
- Maximum 1000 shuffle attempts with error handling for impossible configurations
- Results cached after first successful draw
- Minimum 2 participants required for valid draw

### Data Storage

**In-Memory Storage (MemStorage)**
- Currently using in-memory storage implementation for development
- Data structure includes:
  - `participants`: Array of participant names (hardcoded: Anna, Marek, Kasia, Piotr, Zofia)
  - `results`: Array of DrawResult objects mapping who drew whom
- Storage interface (IStorage) abstracts data access for future database integration
- Draw results persist only during server runtime (lost on restart)

**Database Readiness**
- Drizzle ORM configured for PostgreSQL with schema definitions in `shared/schema.ts`
- Database URL expected via `DATABASE_URL` environment variable
- Migration support configured via drizzle-kit
- Neon serverless PostgreSQL client integrated but not actively used
- Session store configured (connect-pg-simple) for future session management

### External Dependencies

**UI Component Libraries**
- Radix UI primitives: Comprehensive set of unstyled, accessible components (accordion, dialog, dropdown, popover, tooltip, etc.)
- class-variance-authority: Type-safe variant styling for components
- cmdk: Command menu component (likely for future features)
- embla-carousel-react: Carousel component library
- lucide-react: Icon library for UI elements

**State Management & Data Fetching**
- @tanstack/react-query: Server state management with caching and automatic refetching
- react-hook-form: Form state and validation
- @hookform/resolvers: Integration between react-hook-form and validation libraries
- zod: Runtime type validation and schema definition (shared between client/server)
- drizzle-zod: Zod schema generation from Drizzle ORM schemas

**Database & ORM**
- drizzle-orm: TypeScript ORM for SQL databases
- @neondatabase/serverless: Serverless PostgreSQL client for Neon
- PostgreSQL dialect configured via drizzle-kit

**Build & Development Tools**
- Vite: Frontend build tool and dev server
- @vitejs/plugin-react: React plugin for Vite
- tsx: TypeScript execution for Node.js
- esbuild: Fast JavaScript bundler for production server build
- Replit-specific plugins: Runtime error modal, cartographer, dev banner

**Styling & Utilities**
- tailwindcss: Utility-first CSS framework
- tailwind-merge (via clsx): Utility for merging Tailwind classes
- date-fns: Date manipulation library
- autoprefixer: PostCSS plugin for vendor prefixes

**Fonts**
- Google Fonts: Poppins (400, 500, 600, 700), Fredoka (500, 600, 700)
- Preconnected to fonts.googleapis.com and fonts.gstatic.com for performance