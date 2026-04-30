# Vaultix - Smart Inventory & Asset Tracking System

A modern, full-stack inventory and asset tracking system built with React and Supabase.

## Features

- 📦 **Asset Management** - Track and manage all your assets with detailed information
- 📊 **Inventory Control** - Monitor stock levels, transactions, and reorder points
- 🔧 **Maintenance Tracking** - Schedule and track maintenance activities
- 👥 **User Management** - Role-based access control (ADMIN, MANAGER, CLERK, TECHNICIAN, AUDITOR)
- 📈 **Reports & Analytics** - Comprehensive reporting and data visualization
- 🔐 **Secure Authentication** - Powered by Supabase Auth

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Routing**: React Router v7

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- A Supabase account (free tier works great)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm run install:all
   ```

3. Set up Supabase:
   - Follow the instructions in `SUPABASE_SETUP.md` at the project root
   - Create your Supabase project
   - Run the schema and seed SQL files
   - Copy your project URL and anon key to `frontend/.env.local`

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Demo Credentials

All demo users have the password: `password123`

- `vidushi@vaultix.com` - ADMIN
- `rajesh@vaultix.com` - MANAGER
- `priya@vaultix.com` - INVENTORY_CLERK
- `amit@vaultix.com` - TECHNICIAN
- `sneha@vaultix.com` - AUDITOR

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── context/        # React Context providers
│   ├── data/           # Type definitions and seed data
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Supabase client configuration
│   ├── pages/          # Page components
│   └── App.tsx         # Main app component
├── public/             # Static assets
└── package.json

supabase/
├── schema.sql          # Database schema
└── seed.sql            # Seed data
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run install:all` - Install all dependencies

## License

MIT
