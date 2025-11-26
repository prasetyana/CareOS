# Supabase Database Setup Guide

## Quick Fix: Restore Demo Tenant

If you accidentally deleted the demo tenant, you have **two options**:

---

## **Option 1: Use Mock Data (Recommended for Development)** ✅

**No setup needed!** The app already has a fallback to mock data.

### How it works:
1. Visit: `http://localhost:3000/?tenant=demo#/login`
2. App tries to fetch tenant from Supabase
3. If not found → **Automatically uses mock tenant**
4. All features work with mock data from `src/data/mockDB.ts`

### Mock Tenant Details:
```typescript
{
  id: 'mock-tenant-id',
  slug: 'demo',
  businessName: 'DineOS Demo Restaurant',
  logoUrl: null,
  primaryColor: '#FF6B35',
  secondaryColor: '#004E89',
  fontFamily: 'Inter'
}
```

### Mock Login Credentials:
```
Admin:
Email: admin@gemini.com
Password: password

Customer:
Email: customer@example.com
Password: password

CS:
Email: cs@gemini.com
Password: password
```

**✅ This is the easiest option for development!**

---

## **Option 2: Set Up Real Supabase Database** 🗄️

If you want to use the actual Supabase database:

### **Step 1: Run Database Schema**

1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to: **SQL Editor**
3. Click: **New Query**
4. Copy the contents of `database/schema.sql`
5. Paste into the SQL Editor
6. Click: **Run**

This will create:
- ✅ All necessary tables (tenants, profiles, branches, etc.)
- ✅ Row Level Security (RLS) policies
- ✅ Demo tenant with slug "demo"
- ✅ Demo branch and menu categories

### **Step 2: Create Test Users**

You need to create users in Supabase Auth:

#### **Method A: Via Supabase Dashboard**

1. Go to: **Authentication** → **Users**
2. Click: **Add User**
3. Create these users:

**Admin User:**
- Email: `admin@demo.com`
- Password: `password123`
- Auto Confirm: ✅ Yes

**Customer User:**
- Email: `customer@demo.com`
- Password: `password123`
- Auto Confirm: ✅ Yes

**CS User:**
- Email: `cs@demo.com`
- Password: `password123`
- Auto Confirm: ✅ Yes

#### **Method B: Via SQL (After creating auth users)**

After creating users in Auth, link them to the demo tenant:

```sql
-- Get the demo tenant ID
SELECT id FROM tenants WHERE slug = 'demo';

-- Insert admin profile (replace USER_ID with actual auth user ID)
INSERT INTO profiles (id, tenant_id, full_name, phone, role)
VALUES (
    'USER_ID_FROM_AUTH_USERS',
    (SELECT id FROM tenants WHERE slug = 'demo'),
    'Demo Admin',
    '+62 812-3456-7890',
    'admin'
);

-- Insert customer profile
INSERT INTO profiles (id, tenant_id, full_name, phone, role)
VALUES (
    'USER_ID_FROM_AUTH_USERS',
    (SELECT id FROM tenants WHERE slug = 'demo'),
    'Demo Customer',
    '+62 812-3456-7891',
    'customer'
);

-- Insert CS profile
INSERT INTO profiles (id, tenant_id, full_name, phone, role)
VALUES (
    'USER_ID_FROM_AUTH_USERS',
    (SELECT id FROM tenants WHERE slug = 'demo'),
    'Demo CS',
    '+62 812-3456-7892',
    'cs'
);
```

### **Step 3: Verify Setup**

Run these queries to verify:

```sql
-- Check tenant
SELECT * FROM tenants WHERE slug = 'demo';

-- Check branches
SELECT * FROM branches WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'demo');

-- Check categories
SELECT * FROM menu_categories WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'demo');

-- Check profiles
SELECT * FROM profiles WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'demo');
```

### **Step 4: Test Login**

1. Visit: `http://localhost:3000/?tenant=demo#/login`
2. Login with:
   - Email: `admin@demo.com`
   - Password: `password123`
3. Should redirect to admin dashboard

---

## **Troubleshooting**

### **Issue: "Restaurant Not Found"**
**Cause:** Tenant not in database and mock fallback not working
**Solution:** 
1. Check browser console for errors
2. Verify `?tenant=demo` is in URL
3. Check Supabase connection in `.env.local`

### **Issue: "Permission Denied" when creating tenant**
**Cause:** RLS policies not set up correctly
**Solution:** Run the schema.sql file which includes RLS policies

### **Issue: Can't login after creating user**
**Cause:** User not linked to tenant in profiles table
**Solution:** Create profile entry linking user to tenant (see Step 2, Method B)

### **Issue: Login works but shows wrong role**
**Cause:** Profile role not set correctly
**Solution:** Update profile role in database:
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'USER_ID';
```

---

## **Database Tables Overview**

### **Core Tables:**
- `tenants` - Restaurant/business information
- `tenant_domains` - Custom domains for each tenant
- `profiles` - User profiles (extends auth.users)
- `branches` - Restaurant locations
- `menu_categories` - Menu organization

### **Auth Flow:**
1. User signs up → Creates entry in `auth.users`
2. Profile created → Links user to tenant in `profiles`
3. Role assigned → Determines access level
4. Login → Checks role → Redirects to appropriate dashboard

---

## **Environment Variables**

Make sure your `.env.local` has:

```env
VITE_SUPABASE_URL=https://erjfkpcdjppstjoienaa.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## **Recommendation**

For development, I recommend **Option 1 (Mock Data)** because:
- ✅ No database setup needed
- ✅ Works immediately
- ✅ Faster iteration
- ✅ No risk of data loss
- ✅ All features work the same

Use **Option 2 (Real Database)** when:
- Testing multi-tenant features
- Testing registration flow
- Preparing for production
- Need persistent data

---

## **Next Steps**

After choosing your option:

1. **Test Login:**
   - Visit: `http://localhost:3000/?tenant=demo#/login`
   - Use mock or real credentials
   - Verify redirect to correct dashboard

2. **Test Features:**
   - Browse menu
   - Add to cart
   - Create order
   - Check admin panel

3. **Continue Development:**
   - All features work with mock data
   - Switch to real database when needed

---

## **Quick Commands**

### Check if app is using mock or real tenant:
Open browser console and look for:
```
✅ Tenant found: {...}           → Real database
⚠️ Tenant not found, using mock  → Mock fallback
```

### Force mock tenant:
Use any non-existent slug:
```
http://localhost:3000/?tenant=anything#/login
```

### Use real tenant:
Ensure slug exists in database:
```
http://localhost:3000/?tenant=demo#/login
```
