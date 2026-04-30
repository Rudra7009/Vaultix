-- ================================================================
-- FINAL VAULTIX SEED & TRIGGER FIX (v2)
-- Run this in: Supabase Dashboard → SQL Editor
-- ================================================================

-- 1. CLEANUP (Ensures a fresh start)
DELETE FROM auth.users WHERE email LIKE '%@vaultix.com';
DELETE FROM profiles;
DELETE FROM assets;
DELETE FROM inventory_items;
DELETE FROM departments;
DELETE FROM locations;
DELETE FROM maintenance_records;
DELETE FROM inventory_transactions;
DELETE FROM audit_logs;

-- 2. FIX TRIGGER (Important casting fix)
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

-- 3. INSERT DEPARTMENTS
INSERT INTO departments (id, name, description) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'IT', 'Information Technology Department'),
  ('d1000000-0000-0000-0000-000000000002', 'Operations', 'Operations Department'),
  ('d1000000-0000-0000-0000-000000000003', 'Engineering', 'Engineering Department'),
  ('d1000000-0000-0000-0000-000000000004', 'Finance', 'Finance Department');

-- 4. INSERT LOCATIONS
INSERT INTO locations (id, name, type, description) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Main Warehouse', 'WAREHOUSE', 'Primary storage facility'),
  ('b1000000-0000-0000-0000-000000000002', 'IT Department', 'DEPARTMENT', 'IT Department Office'),
  ('b1000000-0000-0000-0000-000000000003', 'Engineering Floor', 'FLOOR', 'Engineering Department Floor'),
  ('b1000000-0000-0000-0000-000000000004', 'Operations Office', 'DEPARTMENT', 'Operations Department Office'),
  ('b1000000-0000-0000-0000-000000000005', 'Finance Office', 'DEPARTMENT', 'Finance Department Office'),
  ('b1000000-0000-0000-0000-000000000006', 'Storage', 'WAREHOUSE', 'Secondary storage');

-- 5. INSERT AUTH USERS (Password: Vaultix@123)
-- All use the same instance_id and encrypted password for 'Vaultix@123'
-- Admin
INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, instance_id)
VALUES ('a0000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'admin@vaultix.com', crypt('Vaultix@123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Alice Admin","role":"ADMIN"}', now(), now(), '00000000-0000-0000-0000-000000000000');

-- Manager
INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, instance_id)
VALUES ('a0000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'manager@vaultix.com', crypt('Vaultix@123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Mark Manager","role":"MANAGER"}', now(), now(), '00000000-0000-0000-0000-000000000000');

-- Clerk
INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, instance_id)
VALUES ('a0000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'clerk@vaultix.com', crypt('Vaultix@123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Carol Clerk","role":"INVENTORY_CLERK"}', now(), now(), '00000000-0000-0000-0000-000000000000');

-- Technician
INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, instance_id)
VALUES ('a0000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'tech@vaultix.com', crypt('Vaultix@123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Tom Tech","role":"TECHNICIAN"}', now(), now(), '00000000-0000-0000-0000-000000000000');

-- Auditor
INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, instance_id)
VALUES ('a0000000-0000-0000-0000-000000000005', 'authenticated', 'authenticated', 'auditor@vaultix.com', crypt('Vaultix@123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Amy Auditor","role":"AUDITOR"}', now(), now(), '00000000-0000-0000-0000-000000000000');

-- 6. ENSURE IDENTITIES (Fixing provider_id to be email for 'email' provider)
INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
SELECT id, id, email, json_build_object('sub', id, 'email', email), 'email', now(), now(), now()
FROM auth.users
WHERE email IN ('admin@vaultix.com','manager@vaultix.com','clerk@vaultix.com','tech@vaultix.com','auditor@vaultix.com');

-- 7. UPDATE PROFILES (The trigger handle_new_user creates these, we update the department)
UPDATE profiles SET department_id = 'd1000000-0000-0000-0000-000000000001' WHERE email = 'admin@vaultix.com';
UPDATE profiles SET department_id = 'd1000000-0000-0000-0000-000000000002' WHERE email = 'manager@vaultix.com';
UPDATE profiles SET department_id = 'd1000000-0000-0000-0000-000000000002' WHERE email = 'clerk@vaultix.com';
UPDATE profiles SET department_id = 'd1000000-0000-0000-0000-000000000003' WHERE email = 'tech@vaultix.com';
UPDATE profiles SET department_id = 'd1000000-0000-0000-0000-000000000004' WHERE email = 'auditor@vaultix.com';

-- 8. INSERT ASSETS
INSERT INTO assets (id, serial_no, name, asset_type, status, location_id, department_id, assigned_to, purchase_date, cost, warranty_expiry, created_at) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'LAP-001', 'Dell Laptop XPS 13', 'Laptop', 'ASSIGNED', 'b1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004', CURRENT_DATE - INTERVAL '400 days', 1200, CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE - INTERVAL '400 days'),
  ('c1000000-0000-0000-0000-000000000002', 'SRV-001', 'HP ProLiant Server', 'Server', 'AVAILABLE', 'b1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', NULL, CURRENT_DATE - INTERVAL '350 days', 3500, CURRENT_DATE + INTERVAL '18 days', CURRENT_DATE - INTERVAL '350 days'),
  ('c1000000-0000-0000-0000-000000000003', 'PRN-001', 'Canon Laser Printer', 'Printer', 'UNDER_MAINTENANCE', 'b1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000002', NULL, CURRENT_DATE - INTERVAL '300 days', 450, CURRENT_DATE + INTERVAL '12 days', CURRENT_DATE - INTERVAL '300 days');

-- 9. INSERT INVENTORY
INSERT INTO inventory_items (id, name, category, unit, quantity_on_hand, reorder_level, location_id, description, is_active) VALUES
  ('e1000000-0000-0000-0000-000000000001', 'A4 Paper', 'Office Supplies', 'Ream', 50, 20, 'b1000000-0000-0000-0000-000000000001', 'White A4 printing paper', true),
  ('e1000000-0000-0000-0000-000000000002', 'Toner Cartridge HP', 'Office Supplies', 'Piece', 10, 5, 'b1000000-0000-0000-0000-000000000001', 'HP LaserJet toner cartridge', true);
