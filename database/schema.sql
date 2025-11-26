-- DineOS Database Schema
-- Run this in Supabase SQL Editor to create all necessary tables

-- ============================================
-- 1. TENANTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    website TEXT,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#FF6B35',
    secondary_color TEXT DEFAULT '#004E89',
    font_family TEXT DEFAULT 'Inter',
    subscription_tier TEXT DEFAULT 'trial',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. TENANT DOMAINS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tenant_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    domain TEXT UNIQUE NOT NULL,
    domain_type TEXT DEFAULT 'subdomain', -- 'subdomain' or 'custom'
    is_verified BOOLEAN DEFAULT false,
    is_primary BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    role TEXT DEFAULT 'customer', -- 'customer', 'admin', 'tenant_admin', 'cs', 'platform_admin'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. BRANCHES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    area TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    opening_hours TEXT DEFAULT '09:00',
    closing_hours TEXT DEFAULT '22:00',
    status TEXT DEFAULT 'open', -- 'open', 'closed', 'temporarily_closed'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. MENU CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS menu_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenant_domains_domain ON tenant_domains(domain);
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_branches_tenant_id ON branches(tenant_id);
CREATE INDEX IF NOT EXISTS idx_menu_categories_tenant_id ON menu_categories(tenant_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;

-- Tenants: Allow public read (for tenant detection)
CREATE POLICY "Allow public read access to tenants"
    ON tenants FOR SELECT
    TO anon, authenticated
    USING (true);

-- Tenants: Allow insert for registration
CREATE POLICY "Allow insert for new tenants"
    ON tenants FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Tenant Domains: Allow public read (for domain detection)
CREATE POLICY "Allow public read access to tenant_domains"
    ON tenant_domains FOR SELECT
    TO anon, authenticated
    USING (true);

-- Tenant Domains: Allow insert for new domains
CREATE POLICY "Allow insert for new tenant domains"
    ON tenant_domains FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Profiles: Users can read their own profile
CREATE POLICY "Users can read own profile"
    ON profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Profiles: Allow insert for new profiles
CREATE POLICY "Allow insert for new profiles"
    ON profiles FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Branches: Allow public read
CREATE POLICY "Allow public read access to branches"
    ON branches FOR SELECT
    TO anon, authenticated
    USING (true);

-- Branches: Allow insert for authenticated users
CREATE POLICY "Allow insert for branches"
    ON branches FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Menu Categories: Allow public read
CREATE POLICY "Allow public read access to menu_categories"
    ON menu_categories FOR SELECT
    TO anon, authenticated
    USING (true);

-- Menu Categories: Allow insert for authenticated users
CREATE POLICY "Allow insert for menu_categories"
    ON menu_categories FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ============================================
-- INSERT DEMO TENANT DATA
-- ============================================

-- Insert demo tenant
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
) ON CONFLICT (slug) DO NOTHING;

-- Insert demo branch
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
FROM tenants WHERE slug = 'demo'
ON CONFLICT DO NOTHING;

-- Insert demo menu categories
INSERT INTO menu_categories (tenant_id, name, description, display_order)
SELECT 
    id,
    category_name,
    category_desc,
    category_order
FROM tenants, (
    VALUES 
        ('Main Course', 'Delicious main dishes', 1),
        ('Appetizers', 'Start your meal right', 2),
        ('Beverages', 'Refreshing drinks', 3),
        ('Desserts', 'Sweet endings', 4)
) AS categories(category_name, category_desc, category_order)
WHERE slug = 'demo'
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if demo tenant was created
SELECT * FROM tenants WHERE slug = 'demo';

-- Check branches
SELECT * FROM branches WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'demo');

-- Check categories
SELECT * FROM menu_categories WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'demo');
