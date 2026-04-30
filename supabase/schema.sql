-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ================================================================
-- ENUMS
-- ================================================================
create type user_role as enum ('ADMIN', 'MANAGER', 'INVENTORY_CLERK', 'TECHNICIAN', 'AUDITOR');
create type asset_status as enum ('AVAILABLE', 'ASSIGNED', 'UNDER_MAINTENANCE', 'DISPOSED');
create type location_type as enum ('WAREHOUSE', 'DEPARTMENT', 'FLOOR');
create type transaction_type as enum ('INWARD', 'OUTWARD', 'TRANSFER');
create type maintenance_type as enum ('PREVENTIVE', 'CORRECTIVE');
create type maintenance_status as enum ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED');

-- ================================================================
-- TABLES
-- ================================================================

-- Departments
create table departments (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  description text,
  created_at timestamptz default now()
);

-- Locations
create table locations (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  type location_type not null,
  description text,
  created_at timestamptz default now()
);

-- Profiles (extends Supabase auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  role user_role not null default 'INVENTORY_CLERK',
  department_id uuid references departments(id),
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Assets
create table assets (
  id uuid primary key default uuid_generate_v4(),
  serial_no text not null unique,
  name text not null,
  description text,
  asset_type text not null,
  location_id uuid references locations(id),
  status asset_status not null default 'AVAILABLE',
  purchase_date date,
  cost numeric(12,2),
  warranty_expiry date,
  assigned_to uuid references profiles(id),
  department_id uuid references departments(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Inventory Items
create table inventory_items (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text not null,
  unit text not null,
  quantity_on_hand numeric(12,2) not null default 0,
  reorder_level numeric(12,2) not null default 0,
  location_id uuid references locations(id),
  description text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Inventory Transactions
create table inventory_transactions (
  id uuid primary key default uuid_generate_v4(),
  item_id uuid not null references inventory_items(id),
  quantity numeric(12,2) not null,
  type transaction_type not null,
  from_location_id uuid references locations(id),
  to_location_id uuid references locations(id),
  performed_by uuid references profiles(id),
  notes text,
  created_at timestamptz default now()
);

-- Maintenance Records
create table maintenance_records (
  id uuid primary key default uuid_generate_v4(),
  asset_id uuid not null references assets(id),
  maintenance_type maintenance_type not null,
  scheduled_date date not null,
  completed_date date,
  technician_id uuid references profiles(id),
  cost numeric(12,2),
  status maintenance_status not null default 'SCHEDULED',
  remarks text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Audit Logs
create table audit_logs (
  id uuid primary key default uuid_generate_v4(),
  event_type text not null,
  entity_type text not null,
  entity_id uuid,
  performed_by uuid references profiles(id),
  details jsonb,
  created_at timestamptz default now()
);

-- ================================================================
-- INDEXES
-- ================================================================
create index on assets(status);
create index on assets(asset_type);
create index on inventory_items(category);
create index on inventory_items(is_active);
create index on inventory_transactions(item_id);
create index on inventory_transactions(created_at);
create index on maintenance_records(status);
create index on maintenance_records(scheduled_date);
create index on audit_logs(entity_type, entity_id);
create index on audit_logs(created_at);

-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================
alter table profiles enable row level security;
alter table departments enable row level security;
alter table locations enable row level security;
alter table assets enable row level security;
alter table inventory_items enable row level security;
alter table inventory_transactions enable row level security;
alter table maintenance_records enable row level security;
alter table audit_logs enable row level security;

-- Helper function: get current user's role
create or replace function get_user_role()
returns user_role as $$
  select role from profiles where id = auth.uid();
$$ language sql security definer stable;

-- Profiles: users can read all, update own
create policy "profiles_read_all" on profiles for select using (auth.uid() is not null);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);
create policy "profiles_insert_admin" on profiles for insert with check (true);

-- Departments + Locations: all authenticated users can read
create policy "departments_read" on departments for select using (auth.uid() is not null);
create policy "departments_write" on departments for all using (get_user_role() in ('ADMIN', 'MANAGER'));

create policy "locations_read" on locations for select using (auth.uid() is not null);
create policy "locations_write" on locations for all using (get_user_role() in ('ADMIN', 'MANAGER'));

-- Assets: all can read, only ADMIN/MANAGER can write
create policy "assets_read" on assets for select using (auth.uid() is not null);
create policy "assets_write" on assets for insert with check (get_user_role() in ('ADMIN', 'MANAGER'));
create policy "assets_update" on assets for update using (get_user_role() in ('ADMIN', 'MANAGER', 'TECHNICIAN'));
create policy "assets_delete" on assets for delete using (get_user_role() = 'ADMIN');

-- Inventory: all can read, ADMIN/MANAGER/CLERK can write
create policy "inventory_read" on inventory_items for select using (auth.uid() is not null);
create policy "inventory_write" on inventory_items for all using (get_user_role() in ('ADMIN', 'MANAGER', 'INVENTORY_CLERK'));

-- Transactions: all can read, ADMIN/MANAGER/CLERK can insert
create policy "transactions_read" on inventory_transactions for select using (auth.uid() is not null);
create policy "transactions_insert" on inventory_transactions for insert with check (get_user_role() in ('ADMIN', 'MANAGER', 'INVENTORY_CLERK'));

-- Maintenance: all can read, ADMIN/MANAGER/TECHNICIAN can write
create policy "maintenance_read" on maintenance_records for select using (auth.uid() is not null);
create policy "maintenance_write" on maintenance_records for all using (get_user_role() in ('ADMIN', 'MANAGER', 'TECHNICIAN'));

-- Audit logs: only ADMIN and AUDITOR can read, system inserts
create policy "audit_read" on audit_logs for select using (get_user_role() in ('ADMIN', 'AUDITOR'));
create policy "audit_insert" on audit_logs for insert with check (auth.uid() is not null);

-- ================================================================
-- AUTO-UPDATE updated_at trigger
-- ================================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger assets_updated_at before update on assets
  for each row execute function update_updated_at();

create trigger inventory_updated_at before update on inventory_items
  for each row execute function update_updated_at();

create trigger maintenance_updated_at before update on maintenance_records
  for each row execute function update_updated_at();

create trigger profiles_updated_at before update on profiles
  for each row execute function update_updated_at();

-- ================================================================
-- AUTO-CREATE PROFILE on auth signup
-- ================================================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'INVENTORY_CLERK')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
