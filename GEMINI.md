# Vaultix - Project Instructions

## Project Overview
Vaultix is a smart inventory and asset tracking system built for enterprise-grade management. It leverages a modern web stack to provide real-time updates, role-based access control, and comprehensive audit logging.

- **Primary Technologies**: React 19, TypeScript, Tailwind CSS, Supabase (PostgreSQL, Auth, RLS).
- **Architecture**: A monorepo-style structure with a dedicated `frontend` directory and a `supabase` directory for database-related scripts.

## Building and Running

### Root Directory
- `npm run install:all`: Installs dependencies for the frontend.
- `npm run dev`: Starts the frontend development server.

### Frontend Directory (`/frontend`)
- `npm start`: Starts the development server (usually on port 3000 or 3001).
- `npm run build`: Creates an optimized production build in `frontend/build`.
- `npm test`: Runs the test suite using Jest.
- `npm run health-monitor`: Runs a custom health monitoring script.

## Setup Requirements
1. **Supabase Project**: Requires an active Supabase project.
2. **Environment Variables**: Create `frontend/.env.local` based on `frontend/.env.example`.
   - `REACT_APP_SUPABASE_URL`: Your Supabase Project URL.
   - `REACT_APP_SUPABASE_ANON_KEY`: Your Supabase Anon/Public Key.
3. **Database Schema**: Execute `supabase/schema.sql` in the Supabase SQL Editor to create tables, enums, and RLS policies.
4. **Seed Data**: Execute `supabase/seed.sql` to populate the database with initial departments, locations, and demo users.
5. **Auth Configuration**: In Supabase Dashboard -> Authentication -> Settings, **disable "Confirm email"** to allow logging in with seed accounts immediately.

## Demo Accounts (Password: `Vaultix@123`)
After running the seed script, you can use these accounts to test different role-based permissions:

| Role | Email | Description |
|------|-------|-------------|
| **Admin** | `admin@vaultix.com` | Full system access and user management. |
| **Manager** | `manager@vaultix.com` | Asset and inventory management. |
| **Clerk** | `clerk@vaultix.com` | Inventory transaction entry. |
| **Technician** | `tech@vaultix.com` | Maintenance record management. |
| **Auditor** | `auditor@vaultix.com` | Read-only access to all logs and data. |

## Development Conventions

### Frontend Architecture
- **Components**: Reusable UI components are located in `src/components`. Prefer functional components and composition.
- **Pages**: Top-level views are in `src/pages`.
- **Hooks**: Logic is encapsulated in custom hooks in `src/hooks` (e.g., `useAuth`, `usePermissions`).
- **Context**: Global state management (Assets, Inventory, Notifications) is handled via React Context in `src/context`.
- **Styling**: Use **Tailwind CSS** for all styling. Avoid adding custom CSS unless absolutely necessary.
- **Icons**: Use **Lucide React** for consistent iconography.
- **Data Fetching**: All database interactions must go through the Supabase client defined in `src/lib/supabase.ts`.

### Coding Standards
- **TypeScript**: Strictly type all props, state, and function parameters. Avoid using `any`.
- **Functional Style**: Use functional components with hooks.
- **Naming**: Use PascalCase for components and camelCase for functions and variables.
- **Data Safety**: Ensure all sensitive operations respect Row Level Security (RLS) configured in Supabase.

### Testing
- Tests are co-located or placed in `src/__tests__` (if applicable, though current structure suggests standard Jest setup).
- Run `npm test` in the `frontend` directory to verify changes.

## Database Schema Highlights
- `profiles`: Extends Supabase Auth users with roles and department info.
- `assets`: Primary table for tracking equipment and organizational assets.
- `inventory_items`: Tracks stock levels and reorder points.
- `maintenance_records`: Manages service schedules and history for assets.
- `audit_logs`: Automatic tracking of system-wide changes.

## Role-Based Access Control (RBAC)
The system supports 5 roles:
- `ADMIN`: Full system access.
- `MANAGER`: Asset and inventory management.
- `CLERK`: Inventory transactions.
- `TECHNICIAN`: Maintenance records.
- `AUDITOR`: Read-only access with audit log visibility.

Refer to `PROJECT_HEALTH_CHECKLIST.md` for current development status and pending tasks.
