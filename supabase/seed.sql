-- ================================================================
-- SEED DATA FOR VAULTIX
-- ================================================================

-- Insert Departments
INSERT INTO departments (id, name, description) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'IT', 'Information Technology Department'),
  ('d1000000-0000-0000-0000-000000000002', 'Operations', 'Operations Department'),
  ('d1000000-0000-0000-0000-000000000003', 'Engineering', 'Engineering Department'),
  ('d1000000-0000-0000-0000-000000000004', 'Finance', 'Finance Department');

-- Insert Locations
INSERT INTO locations (id, name, type, description) VALUES
  ('l1000000-0000-0000-0000-000000000001', 'Main Warehouse', 'WAREHOUSE', 'Primary storage facility'),
  ('l1000000-0000-0000-0000-000000000002', 'IT Department', 'DEPARTMENT', 'IT Department Office'),
  ('l1000000-0000-0000-0000-000000000003', 'Engineering Floor', 'FLOOR', 'Engineering Department Floor'),
  ('l1000000-0000-0000-0000-000000000004', 'Operations Office', 'DEPARTMENT', 'Operations Department Office'),
  ('l1000000-0000-0000-0000-000000000005', 'Finance Office', 'DEPARTMENT', 'Finance Department Office'),
  ('l1000000-0000-0000-0000-000000000006', 'Storage', 'WAREHOUSE', 'Secondary storage');

-- Create auth users and profiles
-- Password for all users: Vaultix@123
DO $
DECLARE
  user_id_1 uuid;
  user_id_2 uuid;
  user_id_3 uuid;
  user_id_4 uuid;
  user_id_5 uuid;
BEGIN
  -- User 1: Alice Admin (ADMIN)
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'u1000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'admin@vaultix.com',
    crypt('Vaultix@123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Alice Admin","role":"ADMIN"}',
    now(),
    now(),
    '',
    ''
  ) RETURNING id INTO user_id_1;

  INSERT INTO profiles (id, name, email, role, department_id, is_active) VALUES
    (user_id_1, 'Alice Admin', 'admin@vaultix.com', 'ADMIN', 'd1000000-0000-0000-0000-000000000001', true);

  -- User 2: Mark Manager (MANAGER)
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'u1000000-0000-0000-0000-000000000002',
    'authenticated',
    'authenticated',
    'manager@vaultix.com',
    crypt('Vaultix@123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Mark Manager","role":"MANAGER"}',
    now(),
    now(),
    '',
    ''
  ) RETURNING id INTO user_id_2;

  INSERT INTO profiles (id, name, email, role, department_id, is_active) VALUES
    (user_id_2, 'Mark Manager', 'manager@vaultix.com', 'MANAGER', 'd1000000-0000-0000-0000-000000000002', true);

  -- User 3: Carol Clerk (INVENTORY_CLERK)
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'u1000000-0000-0000-0000-000000000003',
    'authenticated',
    'authenticated',
    'clerk@vaultix.com',
    crypt('Vaultix@123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Carol Clerk","role":"INVENTORY_CLERK"}',
    now(),
    now(),
    '',
    ''
  ) RETURNING id INTO user_id_3;

  INSERT INTO profiles (id, name, email, role, department_id, is_active) VALUES
    (user_id_3, 'Carol Clerk', 'clerk@vaultix.com', 'INVENTORY_CLERK', 'd1000000-0000-0000-0000-000000000002', true);

  -- User 4: Tom Tech (TECHNICIAN)
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'u1000000-0000-0000-0000-000000000004',
    'authenticated',
    'authenticated',
    'tech@vaultix.com',
    crypt('Vaultix@123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Tom Tech","role":"TECHNICIAN"}',
    now(),
    now(),
    '',
    ''
  ) RETURNING id INTO user_id_4;

  INSERT INTO profiles (id, name, email, role, department_id, is_active) VALUES
    (user_id_4, 'Tom Tech', 'tech@vaultix.com', 'TECHNICIAN', 'd1000000-0000-0000-0000-000000000003', true);

  -- User 5: Amy Auditor (AUDITOR)
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'u1000000-0000-0000-0000-000000000005',
    'authenticated',
    'authenticated',
    'auditor@vaultix.com',
    crypt('Vaultix@123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Amy Auditor","role":"AUDITOR"}',
    now(),
    now(),
    '',
    ''
  ) RETURNING id INTO user_id_5;

  INSERT INTO profiles (id, name, email, role, department_id, is_active) VALUES
    (user_id_5, 'Amy Auditor', 'auditor@vaultix.com', 'AUDITOR', 'd1000000-0000-0000-0000-000000000004', true);
END $;

-- Insert Assets
INSERT INTO assets (id, serial_no, name, asset_type, status, location_id, department_id, assigned_to, purchase_date, cost, warranty_expiry, created_at) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'LAP-001', 'Dell Laptop XPS 13', 'Laptop', 'ASSIGNED', 'l1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000003', 'u1000000-0000-0000-0000-000000000004', CURRENT_DATE - INTERVAL '400 days', 1200, CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE - INTERVAL '400 days'),
  ('a1000000-0000-0000-0000-000000000002', 'SRV-001', 'HP ProLiant Server', 'Server', 'AVAILABLE', 'l1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', NULL, CURRENT_DATE - INTERVAL '350 days', 3500, CURRENT_DATE + INTERVAL '18 days', CURRENT_DATE - INTERVAL '350 days'),
  ('a1000000-0000-0000-0000-000000000003', 'PRN-001', 'Canon Laser Printer', 'Printer', 'UNDER_MAINTENANCE', 'l1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000002', NULL, CURRENT_DATE - INTERVAL '300 days', 450, CURRENT_DATE + INTERVAL '12 days', CURRENT_DATE - INTERVAL '300 days'),
  ('a1000000-0000-0000-0000-000000000004', 'VEH-001', 'Toyota Forklift', 'Vehicle', 'AVAILABLE', 'l1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000002', NULL, CURRENT_DATE - INTERVAL '800 days', 25000, CURRENT_DATE + INTERVAL '200 days', CURRENT_DATE - INTERVAL '800 days'),
  ('a1000000-0000-0000-0000-000000000005', 'GEN-001', 'Caterpillar Generator', 'Generator', 'AVAILABLE', 'l1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000002', NULL, CURRENT_DATE - INTERVAL '700 days', 15000, CURRENT_DATE + INTERVAL '180 days', CURRENT_DATE - INTERVAL '700 days'),
  ('a1000000-0000-0000-0000-000000000006', 'LAP-002', 'MacBook Pro 16"', 'Laptop', 'ASSIGNED', 'l1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', 'u1000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '200 days', 2500, CURRENT_DATE + INTERVAL '165 days', CURRENT_DATE - INTERVAL '200 days'),
  ('a1000000-0000-0000-0000-000000000007', 'PRJ-001', 'Epson Projector', 'Projector', 'AVAILABLE', 'l1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000003', NULL, CURRENT_DATE - INTERVAL '250 days', 800, CURRENT_DATE + INTERVAL '115 days', CURRENT_DATE - INTERVAL '250 days'),
  ('a1000000-0000-0000-0000-000000000008', 'SCN-001', 'Fujitsu Scanner', 'Scanner', 'ASSIGNED', 'l1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000004', 'u1000000-0000-0000-0000-000000000005', CURRENT_DATE - INTERVAL '180 days', 350, CURRENT_DATE + INTERVAL '185 days', CURRENT_DATE - INTERVAL '180 days'),
  ('a1000000-0000-0000-0000-000000000009', 'LAP-003', 'Lenovo ThinkPad', 'Laptop', 'UNDER_MAINTENANCE', 'l1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000002', NULL, CURRENT_DATE - INTERVAL '450 days', 950, CURRENT_DATE + INTERVAL '50 days', CURRENT_DATE - INTERVAL '450 days'),
  ('a1000000-0000-0000-0000-000000000010', 'SRV-002', 'Dell PowerEdge Server', 'Server', 'AVAILABLE', 'l1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', NULL, CURRENT_DATE - INTERVAL '500 days', 4200, CURRENT_DATE + INTERVAL '95 days', CURRENT_DATE - INTERVAL '500 days'),
  ('a1000000-0000-0000-0000-000000000011', 'PRN-002', 'HP LaserJet Pro', 'Printer', 'ASSIGNED', 'l1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000002', 'u1000000-0000-0000-0000-000000000002', CURRENT_DATE - INTERVAL '150 days', 380, CURRENT_DATE + INTERVAL '215 days', CURRENT_DATE - INTERVAL '150 days'),
  ('a1000000-0000-0000-0000-000000000012', 'TAB-001', 'iPad Pro 12.9"', 'Tablet', 'DISPOSED', 'l1000000-0000-0000-0000-000000000006', 'd1000000-0000-0000-0000-000000000001', NULL, CURRENT_DATE - INTERVAL '1200 days', 1100, CURRENT_DATE - INTERVAL '100 days', CURRENT_DATE - INTERVAL '1200 days');

-- Insert Inventory Items
INSERT INTO inventory_items (id, name, category, unit, quantity_on_hand, reorder_level, location_id, description, is_active) VALUES
  ('i1000000-0000-0000-0000-000000000001', 'A4 Paper', 'Office Supplies', 'Ream', 5, 20, 'l1000000-0000-0000-0000-000000000001', 'White A4 printing paper', true),
  ('i1000000-0000-0000-0000-000000000002', 'Toner Cartridge HP', 'Office Supplies', 'Piece', 2, 5, 'l1000000-0000-0000-0000-000000000001', 'HP LaserJet toner cartridge', true),
  ('i1000000-0000-0000-0000-000000000003', 'Safety Helmets', 'Safety Equipment', 'Piece', 3, 10, 'l1000000-0000-0000-0000-000000000001', 'Industrial safety helmets', true),
  ('i1000000-0000-0000-0000-000000000004', 'Ethernet Cables', 'Spare Parts', 'Meter', 15, 50, 'l1000000-0000-0000-0000-000000000002', 'Cat6 ethernet cables', true),
  ('i1000000-0000-0000-0000-000000000005', 'Printer Ink Black', 'Office Supplies', 'Cartridge', 0, 3, 'l1000000-0000-0000-0000-000000000001', 'Black ink cartridge for inkjet printers', true),
  ('i1000000-0000-0000-0000-000000000006', 'Fire Extinguisher', 'Safety Equipment', 'Piece', 0, 2, 'l1000000-0000-0000-0000-000000000001', 'Portable fire extinguisher', true),
  ('i1000000-0000-0000-0000-000000000007', 'USB Flash Drives 32GB', 'Office Supplies', 'Piece', 45, 10, 'l1000000-0000-0000-0000-000000000002', 'USB 3.0 flash drives', true),
  ('i1000000-0000-0000-0000-000000000008', 'Cleaning Supplies', 'Consumables', 'Bottle', 8, 5, 'l1000000-0000-0000-0000-000000000001', 'Multi-purpose cleaning solution', true),
  ('i1000000-0000-0000-0000-000000000009', 'Batteries AA', 'Consumables', 'Pack', 22, 15, 'l1000000-0000-0000-0000-000000000001', 'Alkaline AA batteries pack of 10', true),
  ('i1000000-0000-0000-0000-000000000010', 'HDMI Cables', 'Spare Parts', 'Piece', 18, 8, 'l1000000-0000-0000-0000-000000000002', '2m HDMI cables', true),
  ('i1000000-0000-0000-0000-000000000011', 'Sticky Notes', 'Office Supplies', 'Pack', 35, 20, 'l1000000-0000-0000-0000-000000000001', 'Assorted color sticky notes', true),
  ('i1000000-0000-0000-0000-000000000012', 'Safety Gloves', 'Safety Equipment', 'Pair', 28, 15, 'l1000000-0000-0000-0000-000000000001', 'Industrial work gloves', true),
  ('i1000000-0000-0000-0000-000000000013', 'Keyboard & Mouse Set', 'Spare Parts', 'Set', 12, 5, 'l1000000-0000-0000-0000-000000000002', 'Wireless keyboard and mouse combo', true),
  ('i1000000-0000-0000-0000-000000000014', 'Whiteboard Markers', 'Office Supplies', 'Box', 19, 10, 'l1000000-0000-0000-0000-000000000001', 'Dry erase markers assorted colors', true),
  ('i1000000-0000-0000-0000-000000000015', 'Power Strips', 'Spare Parts', 'Piece', 14, 6, 'l1000000-0000-0000-0000-000000000002', '6-outlet surge protector power strips', true);

-- Insert Inventory Transactions (sample recent transactions)
INSERT INTO inventory_transactions (id, item_id, quantity, type, from_location_id, to_location_id, performed_by, notes, created_at) VALUES
  ('t1000000-0000-0000-0000-000000000001', 'i1000000-0000-0000-0000-000000000001', 50, 'INWARD', NULL, 'l1000000-0000-0000-0000-000000000001', 'u1000000-0000-0000-0000-000000000003', 'Monthly stock replenishment', CURRENT_TIMESTAMP - INTERVAL '55 days'),
  ('t1000000-0000-0000-0000-000000000002', 'i1000000-0000-0000-0000-000000000002', 3, 'OUTWARD', 'l1000000-0000-0000-0000-000000000001', NULL, 'u1000000-0000-0000-0000-000000000003', 'Issued to Operations', CURRENT_TIMESTAMP - INTERVAL '48 days'),
  ('t1000000-0000-0000-0000-000000000003', 'i1000000-0000-0000-0000-000000000007', 50, 'INWARD', NULL, 'l1000000-0000-0000-0000-000000000002', 'u1000000-0000-0000-0000-000000000001', 'New purchase order', CURRENT_TIMESTAMP - INTERVAL '42 days'),
  ('t1000000-0000-0000-0000-000000000004', 'i1000000-0000-0000-0000-000000000003', 7, 'OUTWARD', 'l1000000-0000-0000-0000-000000000001', NULL, 'u1000000-0000-0000-0000-000000000002', 'Warehouse team equipment', CURRENT_TIMESTAMP - INTERVAL '38 days'),
  ('t1000000-0000-0000-0000-000000000005', 'i1000000-0000-0000-0000-000000000004', 20, 'TRANSFER', 'l1000000-0000-0000-0000-000000000001', 'l1000000-0000-0000-0000-000000000002', 'u1000000-0000-0000-0000-000000000004', 'Network upgrade project', CURRENT_TIMESTAMP - INTERVAL '35 days'),
  ('t1000000-0000-0000-0000-000000000006', 'i1000000-0000-0000-0000-000000000001', 45, 'OUTWARD', 'l1000000-0000-0000-0000-000000000001', NULL, 'u1000000-0000-0000-0000-000000000003', 'Distributed to departments', CURRENT_TIMESTAMP - INTERVAL '25 days'),
  ('t1000000-0000-0000-0000-000000000007', 'i1000000-0000-0000-0000-000000000007', 5, 'OUTWARD', 'l1000000-0000-0000-0000-000000000002', NULL, 'u1000000-0000-0000-0000-000000000001', 'Project team', CURRENT_TIMESTAMP - INTERVAL '6 days'),
  ('t1000000-0000-0000-0000-000000000008', 'i1000000-0000-0000-0000-000000000015', 6, 'OUTWARD', 'l1000000-0000-0000-0000-000000000002', NULL, 'u1000000-0000-0000-0000-000000000004', 'Workstation setup', CURRENT_TIMESTAMP),
  ('t1000000-0000-0000-0000-000000000009', 'i1000000-0000-0000-0000-000000000012', 25, 'INWARD', NULL, 'l1000000-0000-0000-0000-000000000001', 'u1000000-0000-0000-0000-000000000002', 'Safety equipment order', CURRENT_TIMESTAMP);

-- Insert Maintenance Records
INSERT INTO maintenance_records (id, asset_id, maintenance_type, scheduled_date, completed_date, technician_id, cost, status, remarks, created_at) VALUES
  ('m1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'PREVENTIVE', CURRENT_DATE + INTERVAL '2 days', NULL, 'u1000000-0000-0000-0000-000000000004', NULL, 'SCHEDULED', 'Routine laptop maintenance and cleaning', CURRENT_TIMESTAMP),
  ('m1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'CORRECTIVE', CURRENT_DATE + INTERVAL '4 days', NULL, 'u1000000-0000-0000-0000-000000000004', NULL, 'SCHEDULED', 'Server hardware check and firmware update', CURRENT_TIMESTAMP),
  ('m1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003', 'CORRECTIVE', CURRENT_DATE + INTERVAL '6 days', NULL, 'u1000000-0000-0000-0000-000000000004', NULL, 'IN_PROGRESS', 'Paper jam issue and roller replacement', CURRENT_TIMESTAMP),
  ('m1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000004', 'PREVENTIVE', CURRENT_DATE + INTERVAL '15 days', NULL, 'u1000000-0000-0000-0000-000000000004', NULL, 'SCHEDULED', 'Quarterly vehicle inspection', CURRENT_TIMESTAMP),
  ('m1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000005', 'PREVENTIVE', CURRENT_DATE + INTERVAL '20 days', NULL, 'u1000000-0000-0000-0000-000000000004', NULL, 'SCHEDULED', 'Oil change and filter replacement', CURRENT_TIMESTAMP),
  ('m1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000006', 'PREVENTIVE', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE - INTERVAL '10 days', 'u1000000-0000-0000-0000-000000000004', 150, 'COMPLETED', 'Battery health check and software updates completed', CURRENT_TIMESTAMP - INTERVAL '10 days'),
  ('m1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000009', 'CORRECTIVE', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE - INTERVAL '3 days', 'u1000000-0000-0000-0000-000000000004', 280, 'COMPLETED', 'Hard drive replacement and OS reinstallation', CURRENT_TIMESTAMP - INTERVAL '5 days'),
  ('m1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000010', 'PREVENTIVE', CURRENT_DATE + INTERVAL '30 days', NULL, 'u1000000-0000-0000-0000-000000000004', NULL, 'SCHEDULED', 'Scheduled server maintenance', CURRENT_TIMESTAMP),
  ('m1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000007', 'PREVENTIVE', CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE - INTERVAL '18 days', 'u1000000-0000-0000-0000-000000000004', 120, 'COMPLETED', 'Lamp replacement and lens cleaning', CURRENT_TIMESTAMP - INTERVAL '20 days'),
  ('m1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000011', 'PREVENTIVE', CURRENT_DATE + INTERVAL '45 days', NULL, 'u1000000-0000-0000-0000-000000000004', NULL, 'SCHEDULED', 'Routine printer maintenance', CURRENT_TIMESTAMP);
