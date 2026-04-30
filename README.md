# Vaultix - Smart Inventory & Asset Tracking System

A comprehensive enterprise-grade inventory and asset management system built with React, TypeScript, and Supabase.

## 🚀 Features

- **Asset Management**: Track and manage all organizational assets with detailed information
- **Inventory Control**: Real-time inventory tracking with automatic reorder alerts
- **Maintenance Scheduling**: Preventive and corrective maintenance management
- **Role-Based Access Control**: 5 distinct user roles (Admin, Manager, Clerk, Technician, Auditor)
- **Audit Logging**: Complete audit trail of all system activities
- **Real-time Updates**: Live data synchronization across all users
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## 🏗️ Architecture

```
Vaultix/
├── frontend/          # React TypeScript application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # React Context providers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and configurations
│   │   ├── pages/         # Application pages
│   │   └── data/          # Data utilities
│   └── public/        # Static assets
├── supabase/          # Database schema and migrations
│   ├── schema.sql     # Database structure
│   └── seed.sql       # Sample data
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Supabase Client** - Backend integration

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Real-time subscriptions
  - Row Level Security (RLS)

## 📋 Prerequisites

- Node.js 16+ and npm
- Supabase account
- Git

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Rudra7009/Vaultix.git
cd Vaultix
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the schema:
   - Go to SQL Editor in Supabase Dashboard
   - Copy and execute `supabase/schema.sql`
3. Seed the database (optional):
   - Execute `supabase/seed.sql` for demo data

### 3. Configure Environment Variables

```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Start Development Server

```bash
npm start
```

The application will open at `http://localhost:3000`

## 👥 Demo Accounts

After seeding the database, you can use these demo accounts:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| Admin | admin@vaultix.com | Vaultix@123 | Full system access |
| Manager | manager@vaultix.com | Vaultix@123 | Manage assets, inventory, users |
| Inventory Clerk | clerk@vaultix.com | Vaultix@123 | Manage inventory transactions |
| Technician | tech@vaultix.com | Vaultix@123 | Manage maintenance records |
| Auditor | auditor@vaultix.com | Vaultix@123 | Read-only access, view audit logs |

## 📦 Build for Production

```bash
cd frontend
npm run build
```

The optimized production build will be in the `frontend/build` directory.

## 🔒 Security Features

- **Row Level Security (RLS)**: Database-level access control
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Permissions**: Granular access control per user role
- **Audit Logging**: Complete activity tracking
- **Environment Variables**: Sensitive data protection

## 📊 Database Schema

### Core Tables
- `profiles` - User accounts and roles
- `departments` - Organizational departments
- `locations` - Physical locations
- `assets` - Asset tracking
- `inventory_items` - Inventory management
- `inventory_transactions` - Stock movements
- `maintenance_records` - Maintenance scheduling
- `audit_logs` - System activity logs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is proprietary software. All rights reserved.

## 👨‍💻 Author

**Rudra**
- GitHub: [@Rudra7009](https://github.com/Rudra7009)

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/)
- Powered by [Supabase](https://supabase.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

---

**Note**: This is a production-level application. Ensure proper security configurations before deploying to production environments.
