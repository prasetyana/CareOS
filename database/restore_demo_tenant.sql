-- ============================================
-- RESTORE DEMO TENANT DATA ONLY
-- Run this if tables already exist
-- ============================================

-- Insert demo tenant (or update if exists)
INSERT INTO tenants (
    business_name,
    slug,
    description,
    email,
    phone,
    primary_color,
    secondary_color,
    font_family,
    subscription_tier,
    status
) VALUES (
    'DineOS Demo Restaurant',
    'demo',
    'A demo restaurant for testing DineOS platform',
    'demo@dineos.com',
    '+62 812-3456-7890',
    '#FF6B35',
    '#004E89',
    'Inter',
    'trial',
    'active'
) 
ON CONFLICT (slug) 
DO UPDATE SET
    business_name = EXCLUDED.business_name,
    description = EXCLUDED.description,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    primary_color = EXCLUDED.primary_color,
    secondary_color = EXCLUDED.secondary_color,
    font_family = EXCLUDED.font_family,
    updated_at = NOW();

-- Insert demo branch (delete old ones first to avoid duplicates)
DELETE FROM branches WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'demo');

INSERT INTO branches (
    tenant_id,
    name,
    address,
    city,
    area,
    latitude,
    longitude,
    opening_hours,
    closing_hours,
    status
) 
SELECT 
    id,
    'Main Branch',
    'Jl. Sudirman No. 123',
    'Jakarta',
    'Central Jakarta',
    -6.2088,
    106.8456,
    '09:00',
    '22:00',
    'open'
FROM tenants WHERE slug = 'demo';

-- Insert demo menu categories (delete old ones first)
DELETE FROM menu_categories WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'demo');

INSERT INTO menu_categories (tenant_id, name, description, display_order)
SELECT 
    t.id,
    category_name,
    category_desc,
    category_order
FROM tenants t, (
    VALUES 
        ('Main Course', 'Delicious main dishes', 1),
        ('Appetizers', 'Start your meal right', 2),
        ('Beverages', 'Refreshing drinks', 3),
        ('Desserts', 'Sweet endings', 4)
) AS categories(category_name, category_desc, category_order)
WHERE t.slug = 'demo';

-- ============================================
-- VERIFICATION
-- ============================================

-- Check tenant
SELECT 
    id,
    business_name,
    slug,
    email,
    primary_color,
    secondary_color,
    status
FROM tenants 
WHERE slug = 'demo';

-- Check branches
SELECT 
    id,
    name,
    address,
    city,
    status
FROM branches 
WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'demo');

-- Check categories
SELECT 
    id,
    name,
    description,
    display_order
FROM menu_categories 
WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'demo')
ORDER BY display_order;
