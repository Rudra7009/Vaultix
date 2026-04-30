-- ================================================================
-- MASTER RESET & SEED FOR VAULTIX (FULL SCHEMA + DATA + RLS)
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ================================================================

-- 1. DROP EVERYTHING (CLEAN SLATE)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS assets_updated_at ON assets;
DROP TRIGGER IF EXISTS inventory_updated_at ON inventory_items;
DROP TRIGGER IF EXISTS maintenance_updated_at ON maintenance_records;
DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;

DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS get_user_role() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;

DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS maintenance_records CASCADE;
DROP TABLE IF EXISTS inventory_transactions CASCADE;
DROP TABLE IF EXISTS inventory_items CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

DROP TYPE IF EXISTS maintenance_status CASCADE;
DROP TYPE IF EXISTS maintenance_type CASCADE;
DROP TYPE IF EXISTS transaction_type CASCADE;
DROP TYPE IF EXISTS location_type CASCADE;
DROP TYPE IF EXISTS asset_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- 2. CREATE EXTENSIONS AND ENUMS
create extension if not exists "uuid-ossp";

create type user_role as enum ('ADMIN', 'MANAGER', 'INVENTORY_CLERK', 'TECHNICIAN', 'AUDITOR');
create type asset_status as enum ('AVAILABLE', 'ASSIGNED', 'UNDER_MAINTENANCE', 'DISPOSED');
create type location_type as enum ('WAREHOUSE', 'DEPARTMENT', 'FLOOR');
create type transaction_type as enum ('INWARD', 'OUTWARD', 'TRANSFER');
create type maintenance_type as enum ('PREVENTIVE', 'CORRECTIVE');
create type maintenance_status as enum ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED');

-- 3. CREATE TABLES
create table departments (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  description text,
  created_at timestamptz default now()
);

create table locations (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  type location_type not null,
  description text,
  created_at timestamptz default now()
);

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

create table audit_logs (
  id uuid primary key default uuid_generate_v4(),
  event_type text not null,
  entity_type text not null,
  entity_id uuid,
  performed_by uuid references profiles(id),
  details jsonb,
  created_at timestamptz default now()
);

-- 4. CREATE INDEXES
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

-- 5. SETUP ROW LEVEL SECURITY (RLS)
alter table profiles enable row level security;
alter table departments enable row level security;
alter table locations enable row level security;
alter table assets enable row level security;
alter table inventory_items enable row level security;
alter table inventory_transactions enable row level security;
alter table maintenance_records enable row level security;
alter table audit_logs enable row level security;

create or replace function get_user_role()
returns user_role as $$
  select role from profiles where id = auth.uid();
$$ language sql security definer stable;

-- Profiles
create policy "profiles_read_all" on profiles for select using (auth.uid() is not null);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);
create policy "profiles_insert_admin" on profiles for insert with check (true);

-- Departments & Locations
create policy "departments_read" on departments for select using (auth.uid() is not null);
create policy "departments_write" on departments for all using (get_user_role() in ('ADMIN', 'MANAGER'));
create policy "locations_read" on locations for select using (auth.uid() is not null);
create policy "locations_write" on locations for all using (get_user_role() in ('ADMIN', 'MANAGER'));

-- Assets
create policy "assets_read" on assets for select using (auth.uid() is not null);
create policy "assets_write" on assets for insert with check (get_user_role() in ('ADMIN', 'MANAGER'));
create policy "assets_update" on assets for update using (get_user_role() in ('ADMIN', 'MANAGER', 'TECHNICIAN'));
create policy "assets_delete" on assets for delete using (get_user_role() = 'ADMIN');

-- Inventory
create policy "inventory_read" on inventory_items for select using (auth.uid() is not null);
create policy "inventory_write" on inventory_items for all using (get_user_role() in ('ADMIN', 'MANAGER', 'INVENTORY_CLERK'));

-- Transactions
create policy "transactions_read" on inventory_transactions for select using (auth.uid() is not null);
create policy "transactions_insert" on inventory_transactions for insert with check (get_user_role() in ('ADMIN', 'MANAGER', 'INVENTORY_CLERK'));

-- Maintenance
create policy "maintenance_read" on maintenance_records for select using (auth.uid() is not null);
create policy "maintenance_write" on maintenance_records for all using (get_user_role() in ('ADMIN', 'MANAGER', 'TECHNICIAN'));

-- Audit Logs
create policy "audit_read" on audit_logs for select using (get_user_role() in ('ADMIN', 'AUDITOR'));
create policy "audit_insert" on audit_logs for insert with check (auth.uid() is not null);

-- 6. SETUP UPDATED_AT TRIGGERS
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger assets_updated_at before update on assets for each row execute function update_updated_at();
create trigger inventory_updated_at before update on inventory_items for each row execute function update_updated_at();
create trigger maintenance_updated_at before update on maintenance_records for each row execute function update_updated_at();
create trigger profiles_updated_at before update on profiles for each row execute function update_updated_at();

-- 7. FIX HANDLE_NEW_USER TRIGGER (Fixes the casting bug)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_role_val user_role;
BEGIN
  BEGIN
    user_role_val := (new.raw_user_meta_data->>'role')::user_role;
  EXCEPTION WHEN OTHERS THEN
    user_role_val := 'INVENTORY_CLERK';
  END;

  INSERT INTO profiles (id, name, email, role)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(user_role_val, 'INVENTORY_CLERK')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- 8. SEED DATA
-- Departments
INSERT INTO departments (id, name, description) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'IT', 'Information Technology Department'),
  ('d1000000-0000-0000-0000-000000000002', 'Operations', 'Operations Department'),
  ('d1000000-0000-0000-0000-000000000003', 'Engineering', 'Engineering Department'),
  ('d1000000-0000-0000-0000-000000000004', 'Finance', 'Finance Department');

-- Locations
INSERT INTO locations (id, name, type, description) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Main Warehouse', 'WAREHOUSE', 'Primary storage facility'),
  ('b1000000-0000-0000-0000-000000000002', 'IT Department', 'DEPARTMENT', 'IT Department Office'),
  ('b1000000-0000-0000-0000-000000000003', 'Engineering Floor', 'FLOOR', 'Engineering Department Floor'),
  ('b1000000-0000-0000-0000-000000000004', 'Operations Office', 'DEPARTMENT', 'Operations Department Office'),
  ('b1000000-0000-0000-0000-000000000005', 'Finance Office', 'DEPARTMENT', 'Finance Department Office'),
  ('b1000000-0000-0000-0000-000000000006', 'Storage', 'WAREHOUSE', 'Secondary storage');

-- Auth Users (password: Vaultix@123 for all)
DELETE FROM auth.users WHERE email IN ('admin@vaultix.com', 'manager@vaultix.com', 'clerk@vaultix.com', 'tech@vaultix.com', 'auditor@vaultix.com');

INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, instance_id, confirmation_token, recovery_token, email_change_token_new, email_change) VALUES 
('a0000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'admin@vaultix.com', crypt('Vaultix@123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Alice Admin","role":"ADMIN"}', now(), now(), '00000000-0000-0000-0000-000000000000', '', '', '', ''),
('a0000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'manager@vaultix.com', crypt('Vaultix@123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Mark Manager","role":"MANAGER"}', now(), now(), '00000000-0000-0000-0000-000000000000', '', '', '', ''),
('a0000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'clerk@vaultix.com', crypt('Vaultix@123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Carol Clerk","role":"INVENTORY_CLERK"}', now(), now(), '00000000-0000-0000-0000-000000000000', '', '', '', ''),
('a0000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'tech@vaultix.com', crypt('Vaultix@123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Tom Tech","role":"TECHNICIAN"}', now(), now(), '00000000-0000-0000-0000-000000000000', '', '', '', ''),
('a0000000-0000-0000-0000-000000000005', 'authenticated', 'authenticated', 'auditor@vaultix.com', crypt('Vaultix@123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Amy Auditor","role":"AUDITOR"}', now(), now(), '00000000-0000-0000-0000-000000000000', '', '', '', '');

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
SELECT id, id, email, json_build_object('sub', id, 'email', email), 'email', now(), now(), now()
FROM auth.users
WHERE email IN ('admin@vaultix.com', 'manager@vaultix.com', 'clerk@vaultix.com', 'tech@vaultix.com', 'auditor@vaultix.com');

-- Update profiles with correct departments (handle_new_user trigger creates them, we update them here)
UPDATE profiles SET department_id = 'd1000000-0000-0000-0000-000000000001' WHERE email = 'admin@vaultix.com';
UPDATE profiles SET department_id = 'd1000000-0000-0000-0000-000000000002' WHERE email = 'manager@vaultix.com';
UPDATE profiles SET department_id = 'd1000000-0000-0000-0000-000000000002' WHERE email = 'clerk@vaultix.com';
UPDATE profiles SET department_id = 'd1000000-0000-0000-0000-000000000003' WHERE email = 'tech@vaultix.com';
UPDATE profiles SET department_id = 'd1000000-0000-0000-0000-000000000004' WHERE email = 'auditor@vaultix.com';

-- Assets
INSERT INTO assets (id, serial_no, name, asset_type, status, location_id, department_id, assigned_to, purchase_date, cost, warranty_expiry, created_at) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'LAP-001', 'Dell Laptop XPS 13', 'Laptop', 'ASSIGNED', 'b1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '400 days', 1200, CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE - INTERVAL '400 days'),
  ('c1000000-0000-0000-0000-000000000002', 'SRV-001', 'HP ProLiant Server', 'Server', 'AVAILABLE', 'b1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', NULL, CURRENT_DATE - INTERVAL '350 days', 3500, CURRENT_DATE + INTERVAL '18 days', CURRENT_DATE - INTERVAL '350 days'),
  ('c1000000-0000-0000-0000-000000000003', 'PRN-001', 'Canon Laser Printer', 'Printer', 'UNDER_MAINTENANCE', 'b1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000002', NULL, CURRENT_DATE - INTERVAL '300 days', 450, CURRENT_DATE + INTERVAL '12 days', CURRENT_DATE - INTERVAL '300 days'),
  ('c1000000-0000-0000-0000-000000000004', 'MAC-001', 'MacBook Pro M2 14"', 'Laptop', 'ASSIGNED', 'b1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', CURRENT_DATE - INTERVAL '150 days', 1999, CURRENT_DATE + INTERVAL '215 days', CURRENT_DATE - INTERVAL '150 days'),
  ('c1000000-0000-0000-0000-000000000005', 'NET-001', 'Cisco Nexus 9300 Switch', 'Networking', 'AVAILABLE', 'b1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', NULL, CURRENT_DATE - INTERVAL '60 days', 4200, CURRENT_DATE + INTERVAL '305 days', CURRENT_DATE - INTERVAL '60 days'),
  ('c1000000-0000-0000-0000-000000000006', 'MON-001', 'Dell UltraSharp 27"', 'Monitor', 'ASSIGNED', 'b1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', CURRENT_DATE - INTERVAL '200 days', 550, CURRENT_DATE + INTERVAL '165 days', CURRENT_DATE - INTERVAL '200 days'),
  ('c1000000-0000-0000-0000-000000000007', 'PRJ-001', 'Epson Pro EX9220 Projector', 'AV Equipment', 'AVAILABLE', 'b1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000002', NULL, CURRENT_DATE - INTERVAL '500 days', 850, CURRENT_DATE - INTERVAL '135 days', CURRENT_DATE - INTERVAL '500 days'),
  ('c1000000-0000-0000-0000-000000000008', 'LAP-002', 'Lenovo ThinkPad T14', 'Laptop', 'ASSIGNED', 'b1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004', CURRENT_DATE - INTERVAL '100 days', 1450, CURRENT_DATE + INTERVAL '265 days', CURRENT_DATE - INTERVAL '100 days'),
  ('c1000000-0000-0000-0000-000000000009', 'DSK-001', 'Herman Miller Sit-Stand Desk', 'Furniture', 'ASSIGNED', 'b1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000005', CURRENT_DATE - INTERVAL '120 days', 950, CURRENT_DATE + INTERVAL '3500 days', CURRENT_DATE - INTERVAL '120 days'),
  ('c1000000-0000-0000-0000-000000000010', 'TAB-001', 'iPad Pro 12.9"', 'Tablet', 'UNDER_MAINTENANCE', 'b1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000005', CURRENT_DATE - INTERVAL '80 days', 1099, CURRENT_DATE + INTERVAL '285 days', CURRENT_DATE - INTERVAL '80 days');

-- Inventory
INSERT INTO inventory_items (id, name, category, unit, quantity_on_hand, reorder_level, location_id, description, is_active) VALUES
  ('e1000000-0000-0000-0000-000000000001', 'A4 Paper Reams', 'Office Supplies', 'Ream', 120, 50, 'b1000000-0000-0000-0000-000000000001', 'White A4 printing paper for office use', true),
  ('e1000000-0000-0000-0000-000000000002', 'HP Toner 58A', 'Printer Supplies', 'Piece', 8, 10, 'b1000000-0000-0000-0000-000000000001', 'HP LaserJet Pro M404 toner cartridge', true),
  ('e1000000-0000-0000-0000-000000000003', 'HDMI Cable 2m', 'IT Accessories', 'Cable', 45, 20, 'b1000000-0000-0000-0000-000000000006', 'High-speed HDMI cables for monitor setup', true),
  ('e1000000-0000-0000-0000-000000000004', 'Cat6 Ethernet Cable 5m', 'IT Accessories', 'Cable', 150, 50, 'b1000000-0000-0000-0000-000000000006', 'Ethernet networking patch cables', true),
  ('e1000000-0000-0000-0000-000000000005', 'Logitech MX Master 3', 'Peripherals', 'Unit', 12, 15, 'b1000000-0000-0000-0000-000000000006', 'Wireless ergonomic mouse', true),
  ('e1000000-0000-0000-0000-000000000006', 'Keychron K8 Keyboard', 'Peripherals', 'Unit', 5, 10, 'b1000000-0000-0000-0000-000000000006', 'Mechanical wireless keyboard', true),
  ('e1000000-0000-0000-0000-000000000007', 'Anker USB-C Hub', 'IT Accessories', 'Unit', 22, 15, 'b1000000-0000-0000-0000-000000000006', '7-in-1 USB-C multi-port adapter', true);

-- Maintenance Records
INSERT INTO maintenance_records (id, asset_id, maintenance_type, scheduled_date, completed_date, technician_id, cost, status, remarks, created_at) VALUES
  ('f1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000003', 'CORRECTIVE', CURRENT_DATE - INTERVAL '2 days', NULL, 'a0000000-0000-0000-0000-000000000004', NULL, 'IN_PROGRESS', 'Reported paper jams. Rollers need inspection and potential replacement.', CURRENT_DATE - INTERVAL '2 days'),
  ('f1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000010', 'CORRECTIVE', CURRENT_DATE + INTERVAL '1 day', NULL, 'a0000000-0000-0000-0000-000000000004', 350, 'SCHEDULED', 'Screen cracked due to drop. Replacement part ordered.', CURRENT_DATE - INTERVAL '1 day'),
  ('f1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000002', 'PREVENTIVE', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE - INTERVAL '14 days', 'a0000000-0000-0000-0000-000000000004', 0, 'COMPLETED', 'Quarterly server firmware updates and security patches applied.', CURRENT_DATE - INTERVAL '15 days');

-- Inventory Transactions
INSERT INTO inventory_transactions (item_id, quantity, type, from_location_id, to_location_id, performed_by, notes, created_at) VALUES
  ('e1000000-0000-0000-0000-000000000003', 20, 'INWARD', NULL, 'b1000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000003', 'Restocked from Amazon PO-4509', CURRENT_DATE - INTERVAL '10 days'),
  ('e1000000-0000-0000-0000-000000000005', 2, 'OUTWARD', 'b1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000003', 'Issued to new Operations hires', CURRENT_DATE - INTERVAL '5 days'),
  ('e1000000-0000-0000-0000-000000000004', 50, 'INWARD', NULL, 'b1000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000003', 'Bulk order received from CDW', CURRENT_DATE - INTERVAL '3 days'),
  ('e1000000-0000-0000-0000-000000000001', 10, 'OUTWARD', 'b1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000003', 'Paper resupply for Finance department printer', CURRENT_DATE - INTERVAL '1 day'),
  ('e1000000-0000-0000-0000-000000000002', 1, 'OUTWARD', 'b1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000003', 'Replaced empty toner in Operations printer', CURRENT_DATE);
