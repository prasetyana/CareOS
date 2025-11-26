-- ============================================
-- CHECK CURRENT CONSTRAINT AND FIX
-- ============================================

-- First, let's see what the current constraint allows
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass 
AND conname LIKE '%role%';

-- Drop the existing role constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Create a new constraint that allows all our roles
ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('customer', 'admin', 'tenant_admin', 'cs', 'platform_admin'));

-- ============================================
-- NOW LINK USERS TO DEMO TENANT
-- ============================================

-- Delete any existing profiles for these users (in case of duplicates)
DELETE FROM profiles WHERE id IN (
    'c52e2749-280e-4465-8e4f-1091c51e1056',
    'd4ee679e-d0c3-439e-b6a6-a126619f573d',
    '0de835c6-d2a2-415e-874a-7cb71dc7836c'
);

-- Link Admin User
INSERT INTO profiles (id, tenant_id, full_name, phone, role)
VALUES (
    'c52e2749-280e-4465-8e4f-1091c51e1056',
    (SELECT id FROM tenants WHERE slug = 'demo'),
    'Demo Admin',
    '+62 812-3456-7890',
    'admin'
);

-- Link Customer User
INSERT INTO profiles (id, tenant_id, full_name, phone, role)
VALUES (
    'd4ee679e-d0c3-439e-b6a6-a126619f573d',
    (SELECT id FROM tenants WHERE slug = 'demo'),
    'Demo Customer',
    '+62 812-3456-7891',
    'customer'
);

-- Link CS User
INSERT INTO profiles (id, tenant_id, full_name, phone, role)
VALUES (
    '0de835c6-d2a2-415e-874a-7cb71dc7836c',
    (SELECT id FROM tenants WHERE slug = 'demo'),
    'Demo CS Agent',
    '+62 812-3456-7892',
    'cs'
);

-- ============================================
-- VERIFICATION
-- ============================================

SELECT '=== LINKED PROFILES ===' as info;

SELECT 
    p.id,
    p.full_name,
    p.role,
    p.phone,
    t.business_name as tenant
FROM profiles p
JOIN tenants t ON p.tenant_id = t.id
WHERE t.slug = 'demo'
ORDER BY p.role;
