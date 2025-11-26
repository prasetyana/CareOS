-- ============================================
-- LINK USERS TO DEMO TENANT
-- ============================================

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
