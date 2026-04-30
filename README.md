# Vaultix - Smart Inventory & Asset Tracking System

A modern, full-stack inventory and asset tracking system built with React and Supabase.

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm run install:all
   ```

2. **Set up Supabase**
   - Follow the detailed instructions in `SUPABASE_SETUP.md`
   - Create a Supabase project at https://supabase.com
   - Run the SQL files in `supabase/` directory
   - Configure your `.env.local` file

3. **Start the app**
   ```bash
   npm run dev
   ```

4. **Login with demo credentials**
   - Email: `vidushi@vaultix.com`
   - Password: `password123`

## 📋 Features

- **Asset Management** - Complete lifecycle tracking of physical assets
- **Inventory Control** - Real-time stock monitoring and transaction history
- **Maintenance Scheduling** - Preventive and corrective maintenance tracking
- **User Management** - Role-based access control with 5 user roles
- **Reports & Analytics** - Visual dashboards and comprehensive reporting
- **Audit Logging** - Complete audit trail for compliance

## 🛠 Tech Stack

- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Row Level Security)
- **State Management**: React Context API
- **Charts**: Recharts
- **Routing**: React Router v7

## 📁 Project Structure

```
vaultix/
├── frontend/           # React application
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── context/    # State management
│   │   ├── pages/      # Page components
│   │   └── lib/        # Supabase client
│   └── public/
├── supabase/          # Database schema and seeds
│   ├── schema.sql     # Database structure
│   └── seed.sql       # Sample data
├── SUPABASE_SETUP.md  # Setup instructions
└── package.json       # Root package file
```

## 👥 User Roles

- **ADMIN** - Full system access
- **MANAGER** - Manage assets, inventory, and users
- **INVENTORY_CLERK** - Manage inventory and transactions
- **TECHNICIAN** - Manage maintenance records
- **AUDITOR** - Read-only access to audit logs

## 🔐 Security

- Row Level Security (RLS) policies on all tables
- Role-based access control
- Secure authentication via Supabase Auth
- Audit logging for all critical operations

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
