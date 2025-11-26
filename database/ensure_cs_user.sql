-- Ensure Demo Tenant Exists and get ID
DO $$
DECLARE
    demo_tenant_id UUID;
BEGIN
    SELECT id INTO demo_tenant_id FROM tenants WHERE slug = 'demo';

    -- If demo tenant exists
    IF demo_tenant_id IS NOT NULL THEN
        -- Insert or Update CS User
        -- Note: This assumes the Auth User with this ID already exists. 
        -- If not, this might fail on FK constraint unless we handle it.
        -- For this fix, we will try to update if exists, or insert.
        
        INSERT INTO profiles (id, tenant_id, full_name, email, role, status, phone)
        VALUES (
            '0de835c6-d2a2-415e-874a-7cb71dc7836c', -- Fixed UUID for Demo CS
            demo_tenant_id,
            'Demo CS Agent',
            'cs@demo.com',
            'cs',
            'active',
            '+62 812-3456-7892'
        )
        ON CONFLICT (id) DO UPDATE SET
            tenant_id = EXCLUDED.tenant_id,
            full_name = EXCLUDED.full_name,
            email = EXCLUDED.email,
            role = EXCLUDED.role,
            status = EXCLUDED.status;
            
        RAISE NOTICE 'CS User ensured.';
    ELSE
        RAISE NOTICE 'Demo tenant not found!';
    END IF;
END $$;
