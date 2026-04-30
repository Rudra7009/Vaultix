-- ================================================================
-- VAULTIX SEED DATA (Fixed version)
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ================================================================

-- Step 1: Fix the handle_new_user trigger (original has a casting bug)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_role_val user_role;
BEGIN
  -- Safely cast role, defaulting to INVENTORY_CLERK
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

-- Step 2: Create auth users with proper passwords
-- Password for all: Vaultix@123

-- User 1: Alice Admin (ADMIN)
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a0000000-0000-0000-0000-000000000001',
  'authenticated', 'authenticated',
  'admin@vaultix.com',
  crypt('Vaultix@123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Alice Admin","role":"ADMIN"}',
  now(), now(), '', ''
);

-- User 2: Mark Manager (MANAGER)
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a0000000-0000-0000-0000-000000000002',
  'authenticated', 'authenticated',
  'manager@vaultix.com',
  crypt('Vaultix@123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Mark Manager","role":"MANAGER"}',
  now(), now(), '', ''
);

-- User 3: Carol Clerk (INVENTORY_CLERK)
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a0000000-0000-0000-0000-000000000003',
  'authenticated', 'authenticated',
  'clerk@vaultix.com',
  crypt('Vaultix@123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Carol Clerk","role":"INVENTORY_CLERK"}',
  now(), now(), '', ''
);

-- User 4: Tom Tech (TECHNICIAN)
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a0000000-0000-0000-0000-000000000004',
  'authenticated', 'authenticated',
  'tech@vaultix.com',
  crypt('Vaultix@123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Tom Tech","role":"TECHNICIAN"}',
  now(), now(), '', ''
);

-- User 5: Amy Auditor (AUDITOR)
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a0000000-0000-0000-0000-000000000005',
  'authenticated', 'authenticated',
  'auditor@vaultix.com',
  crypt('Vaultix@123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Amy Auditor","role":"AUDITOR"}',
  now(), now(), '', ''
);

-- Step 3: Update profiles with correct roles and departments
-- (The trigger creates them with defaults, so update them)
UPDATE profiles SET role = 'ADMIN', department_id = 'd1000000-0000-0000-0000-000000000001'
  WHERE id = 'a0000000-0000-0000-0000-000000000001';
UPDATE profiles SET role = 'MANAGER', department_id = 'd1000000-0000-0000-0000-000000000002'
  WHERE id = 'a0000000-0000-0000-0000-000000000002';
UPDATE profiles SET role = 'INVENTORY_CLERK', department_id = 'd1000000-0000-0000-0000-000000000002'
  WHERE id = 'a0000000-0000-0000-0000-000000000003';
UPDATE profiles SET role = 'TECHNICIAN', department_id = 'd1000000-0000-0000-0000-000000000003'
  WHERE id = 'a0000000-0000-0000-0000-000000000004';
UPDATE profiles SET role = 'AUDITOR', department_id = 'd1000000-0000-0000-0000-000000000004'
  WHERE id = 'a0000000-0000-0000-0000-000000000005';

-- Step 4: Create auth.identities entries (required for login in newer Supabase)
INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
SELECT id, id, id, json_build_object('sub', id, 'email', email), 'email', now(), now(), now()
FROM auth.users
WHERE email IN ('admin@vaultix.com','manager@vaultix.com','clerk@vaultix.com','tech@vaultix.com','auditor@vaultix.com');

-- Step 5: Insert Assets (using valid hex UUIDs)
INSERT INTO assets (id, serial_no, name, asset_type, status, location_id, department_id, assigned_to, purchase_date, cost, warranty_expiry, created_at) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'LAP-001', 'Dell Laptop XPS 13', 'Laptop', 'ASSIGNED', 'b1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004', CURRENT_DATE - INTERVAL '400 days', 1200, CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE - INTERVAL '400 days'),
  ('c1000000-0000-0000-0000-000000000002', 'SRV-001', 'HP ProLiant Server', 'Server', 'AVAILABLE', 'b1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', NULL, CURRENT_DATE - INTERVAL '350 days', 3500, CURRENT_DATE + INTERVAL '18 days', CURRENT_DATE - INTERVAL '350 days'),
  ('c1000000-0000-0000-0000-000000000003', 'PRN-001', 'Canon Laser Printer', 'Printer', 'UNDER_MAINTENANCE', 'b1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000002', NULL, CURRENT_DATE - INTERVAL '300 days', 450, CURRENT_DATE + INTERVAL '12 days', CURRENT_DATE - INTERVAL '300 days'),
  ('c1000000-0000-0000-0000-000000000004', 'VEH-001', 'Toyota Forklift', 'Vehicle', 'AVAILABLE', 'b1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000002', NULL, CURRENT_DATE - INTERVAL '800 days', 25000, CURRENT_DATE + INTERVAL '200 days', CURRENT_DATE - INTERVAL '800 days'),
  ('c1000000-0000-0000-0000-000000000005', 'GEN-001', 'Caterpillar Generator', 'Generator', 'AVAILABLE', 'b1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000002', NULL, CURRENT_DATE - INTERVAL '700 days', 15000, CURRENT_DATE + INTERVAL '180 days', CURRENT_DATE - INTERVAL '700 days'),
  ('c1000000-0000-0000-0000-000000000006', 'LAP-002', 'MacBook Pro 16"', 'Laptop', 'ASSIGNED', 'b1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '200 days', 2500, CURRENT_DATE + INTERVAL '165 days', CURRENT_DATE - INTERVAL '200 days'),
  ('c1000000-0000-0000-0000-000000000007', 'PRJ-001', 'Epson Projector', 'Projector', 'AVAILABLE', 'b1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000003', NULL, CURRENT_DATE - INTERVAL '250 days', 800, CURRENT_DATE + INTERVAL '115 days', CURRENT_DATE - INTERVAL '250 days'),
  ('c1000000-0000-0000-0000-000000000008', 'SCN-001', 'Fujitsu Scanner', 'Scanner', 'ASSIGNED', 'b1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000005', CURRENT_DATE - INTERVAL '180 days', 350, CURRENT_DATE + INTERVAL '185 days', CURRENT_DATE - INTERVAL '180 days'),
  ('c1000000-0000-0000-0000-000000000009', 'LAP-003', 'Lenovo ThinkPad', 'Laptop', 'UNDER_MAINTENANCE', 'b1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000002', NULL, CURRENT_DATE - INTERVAL '450 days', 950, CURRENT_DATE + INTERVAL '50 days', CURRENT_DATE - INTERVAL '450 days'),
  ('c1000000-0000-0000-0000-000000000010', 'SRV-002', 'Dell PowerEdge Server', 'Server', 'AVAILABLE', 'b1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', NULL, CURRENT_DATE - INTERVAL '500 days', 4200, CURRENT_DATE + INTERVAL '95 days', CURRENT_DATE - INTERVAL '500 days'),
  ('c1000000-0000-0000-0000-000000000011', 'PRN-002', 'HP LaserJet Pro', 'Printer', 'ASSIGNED', 'b1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', CURRENT_DATE - INTERVAL '150 days', 380, CURRENT_DATE + INTERVAL '215 days', CURRENT_DATE - INTERVAL '150 days'),
  ('c1000000-0000-0000-0000-000000000012', 'TAB-001', 'iPad Pro 12.9"', 'Tablet', 'DISPOSED', 'b1000000-0000-0000-0000-000000000006', 'd1000000-0000-0000-0000-000000000001', NULL, CURRENT_DATE - INTERVAL '1200 days', 1100, CURRENT_DATE - INTERVAL '100 days', CURRENT_DATE - INTERVAL '1200 days');

-- Step 6: Insert Inventory Items
INSERT INTO inventory_items (id, name, category, unit, quantity_on_hand, reorder_level, location_id, description, is_active) VALUES
  ('e1000000-0000-0000-0000-000000000001', 'A4 Paper', 'Office Supplies', 'Ream', 5, 20, 'b1000000-0000-0000-0000-000000000001', 'White A4 printing paper', true),
  ('e1000000-0000-0000-0000-000000000002', 'Toner Cartridge HP', 'Office Supplies', 'Piece', 2, 5, 'b1000000-0000-0000-0000-000000000001', 'HP LaserJet toner cartridge', true),
  ('e1000000-0000-0000-0000-000000000003', 'Safety Helmets', 'Safety Equipment', 'Piece', 3, 10, 'b1000000-0000-0000-0000-000000000001', 'Industrial safety helmets', true),
  ('e1000000-0000-0000-0000-000000000004', 'Ethernet Cables', 'Spare Parts', 'Meter', 15, 50, 'b1000000-0000-0000-0000-000000000002', 'Cat6 ethernet cables', true),
  ('e1000000-0000-0000-0000-000000000005', 'Printer Ink Black', 'Office Supplies', 'Cartridge', 0, 3, 'b1000000-0000-0000-0000-000000000001', 'Black ink cartridge for inkjet printers', true),
  ('e1000000-0000-0000-0000-000000000006', 'Fire Extinguisher', 'Safety Equipment', 'Piece', 0, 2, 'b1000000-0000-0000-0000-000000000001', 'Portable fire extinguisher', true),
  ('e1000000-0000-0000-0000-000000000007', 'USB Flash Drives 32GB', 'Office Supplies', 'Piece', 45, 10, 'b1000000-0000-0000-0000-000000000002', 'USB 3.0 flash drives', true),
  ('e1000000-0000-0000-0000-000000000008', 'Cleaning Supplies', 'Consumables', 'Bottle', 8, 5, 'b1000000-0000-0000-0000-000000000001', 'Multi-purpose cleaning solution', true),
  ('e1000000-0000-0000-0000-000000000009', 'Batteries AA', 'Consumables', 'Pack', 22, 15, 'b1000000-0000-0000-0000-000000000001', 'Alkaline AA batteries pack of 10', true),
  ('e1000000-0000-0000-0000-000000000010', 'HDMI Cables', 'Spare Parts', 'Piece', 18, 8, 'b1000000-0000-0000-0000-000000000002', '2m HDMI cables', true),
  ('e1000000-0000-0000-0000-000000000011', 'Sticky Notes', 'Office Supplies', 'Pack', 35, 20, 'b1000000-0000-0000-0000-000000000001', 'Assorted color sticky notes', true),
  ('e1000000-0000-0000-0000-000000000012', 'Safety Gloves', 'Safety Equipment', 'Pair', 28, 15, 'b1000000-0000-0000-0000-000000000001', 'Industrial work gloves', true),
  ('e1000000-0000-0000-0000-000000000013', 'Keyboard & Mouse Set', 'Spare Parts', 'Set', 12, 5, 'b1000000-0000-0000-0000-000000000002', 'Wireless keyboard and mouse combo', true),
  ('e1000000-0000-0000-0000-000000000014', 'Whiteboard Markers', 'Office Supplies', 'Box', 19, 10, 'b1000000-0000-0000-0000-000000000001', 'Dry erase markers assorted colors', true),
  ('e1000000-0000-0000-0000-000000000015', 'Power Strips', 'Spare Parts', 'Piece', 14, 6, 'b1000000-0000-0000-0000-000000000002', '6-outlet surge protector power strips', true);

-- Step 7: Insert Inventory Transactions
INSERT INTO inventory_transactions (id, item_id, quantity, type, from_location_id, to_location_id, performed_by, notes, created_at) VALUES
  ('f1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 50, 'INWARD', NULL, 'b1000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'Monthly stock replenishment', CURRENT_TIMESTAMP - INTERVAL '55 days'),
  ('f1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000002', 3, 'OUTWARD', 'b1000000-0000-0000-0000-000000000001', NULL, 'a0000000-0000-0000-0000-000000000003', 'Issued to Operations', CURRENT_TIMESTAMP - INTERVAL '48 days'),
  ('f1000000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000007', 50, 'INWARD', NULL, 'b1000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'New purchase order', CURRENT_TIMESTAMP - INTERVAL '42 days'),
  ('f1000000-0000-0000-0000-000000000004', 'e1000000-0000-0000-0000-000000000003', 7, 'OUTWARD', 'b1000000-0000-0000-0000-000000000001', NULL, 'a0000000-0000-0000-0000-000000000002', 'Warehouse team equipment', CURRENT_TIMESTAMP - INTERVAL '38 days'),
  ('f1000000-0000-0000-0000-000000000005', 'e1000000-0000-0000-0000-000000000004', 20, 'TRANSFER', 'b1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004', 'Network upgrade project', CURRENT_TIMESTAMP - INTERVAL '35 days'),
  ('f1000000-0000-0000-0000-000000000006', 'e1000000-0000-0000-0000-000000000001', 45, 'OUTWARD', 'b1000000-0000-0000-0000-000000000001', NULL, 'a0000000-0000-0000-0000-000000000003', 'Distributed to departments', CURRENT_TIMESTAMP - INTERVAL '25 days'),
  ('f1000000-0000-0000-0000-000000000007', 'e1000000-0000-0000-0000-000000000007', 5, 'OUTWARD', 'b1000000-0000-0000-0000-000000000002', NULL, 'a0000000-0000-0000-0000-000000000001', 'Project team', CURRENT_TIMESTAMP - INTERVAL '6 days'),
  ('f1000000-0000-0000-0000-000000000008', 'e1000000-0000-0000-0000-000000000015', 6, 'OUTWARD', 'b1000000-0000-0000-0000-000000000002', NULL, 'a0000000-0000-0000-0000-000000000004', 'Workstation setup', CURRENT_TIMESTAMP),
  ('f1000000-0000-0000-0000-000000000009', 'e1000000-0000-0000-0000-000000000012', 25, 'INWARD', NULL, 'b1000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Safety equipment order', CURRENT_TIMESTAMP);

-- Step 8: Insert Maintenance Records
INSERT INTO maintenance_records (id, asset_id, maintenance_type, scheduled_date, completed_date, technician_id, cost, status, remarks, created_at) VALUES
  ('aa000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'PREVENTIVE', CURRENT_DATE + INTERVAL '2 days', NULL, 'a0000000-0000-0000-0000-000000000004', NULL, 'SCHEDULED', 'Routine laptop maintenance and cleaning', CURRENT_TIMESTAMP),
  ('aa000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', 'CORRECTIVE', CURRENT_DATE + INTERVAL '4 days', NULL, 'a0000000-0000-0000-0000-000000000004', NULL, 'SCHEDULED', 'Server hardware check and firmware update', CURRENT_TIMESTAMP),
  ('aa000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000003', 'CORRECTIVE', CURRENT_DATE + INTERVAL '6 days', NULL, 'a0000000-0000-0000-0000-000000000004', NULL, 'IN_PROGRESS', 'Paper jam issue and roller replacement', CURRENT_TIMESTAMP),
  ('aa000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000004', 'PREVENTIVE', CURRENT_DATE + INTERVAL '15 days', NULL, 'a0000000-0000-0000-0000-000000000004', NULL, 'SCHEDULED', 'Quarterly vehicle inspection', CURRENT_TIMESTAMP),
  ('aa000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000005', 'PREVENTIVE', CURRENT_DATE + INTERVAL '20 days', NULL, 'a0000000-0000-0000-0000-000000000004', NULL, 'SCHEDULED', 'Oil change and filter replacement', CURRENT_TIMESTAMP),
  ('aa000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000006', 'PREVENTIVE', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE - INTERVAL '10 days', 'a0000000-0000-0000-0000-000000000004', 150, 'COMPLETED', 'Battery health check and software updates completed', CURRENT_TIMESTAMP - INTERVAL '10 days'),
  ('aa000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000009', 'CORRECTIVE', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE - INTERVAL '3 days', 'a0000000-0000-0000-0000-000000000004', 280, 'COMPLETED', 'Hard drive replacement and OS reinstallation', CURRENT_TIMESTAMP - INTERVAL '5 days'),
  ('aa000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000010', 'PREVENTIVE', CURRENT_DATE + INTERVAL '30 days', NULL, 'a0000000-0000-0000-0000-000000000004', NULL, 'SCHEDULED', 'Scheduled server maintenance', CURRENT_TIMESTAMP),
  ('aa000000-0000-0000-0000-000000000009', 'c1000000-0000-0000-0000-000000000007', 'PREVENTIVE', CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE - INTERVAL '18 days', 'a0000000-0000-0000-0000-000000000004', 120, 'COMPLETED', 'Lamp replacement and lens cleaning', CURRENT_TIMESTAMP - INTERVAL '20 days'),
  ('aa000000-0000-0000-0000-000000000010', 'c1000000-0000-0000-0000-000000000011', 'PREVENTIVE', CURRENT_DATE + INTERVAL '45 days', NULL, 'a0000000-0000-0000-0000-000000000004', NULL, 'SCHEDULED', 'Routine printer maintenance', CURRENT_TIMESTAMP);
