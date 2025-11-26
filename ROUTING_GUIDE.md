# DineOS Routing Guide

## Overview
DineOS uses a **multi-tenant architecture** with separate routing for the platform (business owner registration) and tenant-specific applications (customer/admin interfaces).

---

## Platform Routes (No Tenant Required)

These routes are accessible without a tenant parameter and are used for business owner registration and onboarding:

### 1. **Landing Page**
- **URL:** `http://localhost:3000/`
- **Component:** `PlatformLandingPage`
- **Purpose:** Main marketing page where business owners learn about DineOS and can register
- **Features:**
  - Hero section with CTA buttons
  - Features showcase
  - Pricing tiers (Trial, Professional, Enterprise)
  - Testimonials
  - "Get Started" and "View Demo" buttons

### 2. **Registration Page**
- **URL:** `http://localhost:3000/#/register`
- **Component:** `RestaurantRegisterPage`
- **Purpose:** Business owner registration form
- **Collects:**
  - Owner information (name, email, password, phone)
  - Restaurant information (name, description, email, phone)
- **After Registration:** Redirects to `/onboarding?tenant={slug}`

### 3. **Onboarding Wizard**
- **URL:** `http://localhost:3000/#/onboarding?tenant={slug}`
- **Component:** `OnboardingWizardPage`
- **Purpose:** Guide new restaurant owners through setup
- **Steps:**
  1. Branding (colors, fonts, logo)
  2. Subdomain setup
  3. First branch creation
  4. Initial menu setup

### 4. **Login Page**
- **URL:** `http://localhost:3000/#/login`
- **Component:** `LoginPage`
- **Purpose:** Login for all user types (customers, admins, CS)

---

## Tenant Routes (Require ?tenant=demo Parameter)

All customer, admin, and CS routes require a tenant context. For local development, use `?tenant=demo`.

### Customer Routes
- **Base:** `http://localhost:3000/?tenant=demo#/akun`
- **Dashboard:** `#/akun/beranda`
- **Menu:** `#/akun/menu`
- **Orders:** `#/akun/pesanan/aktif` or `#/akun/pesanan/riwayat`
- **Reservations:** `#/akun/reservasi`
- **Rewards:** `#/akun/poin-hadiah`
- **Favorites:** `#/akun/favorit`
- **Settings:** `#/akun/pengaturan/profil`

### Admin Routes
- **Base:** `http://localhost:3000/?tenant=demo#/admin`
- **Dashboard:** `#/admin/dasbor`
- **Menu Management:** `#/admin/menu/kelola-menu`
- **Orders:** `#/admin/pesanan/pesanan-aktif`
- **Reservations:** `#/admin/reservasi/jadwal-reservasi`
- **Customers:** `#/admin/pelanggan/daftar-pelanggan`
- **Analytics:** `#/admin/analitik/statistik-penjualan`
- **Settings:** `#/admin/pengaturan/profil-restoran`

### Customer Service Routes
- **Base:** `http://localhost:3000/?tenant=demo#/cs`
- **Dashboard:** `#/cs/dasbor`
- **Live Chat:** `#/cs/live-chat`
- **FAQ Management:** `#/cs/kelola-faq`

---

## How Tenant Detection Works

### Production (Custom Domains)
When a restaurant has their own domain (e.g., `pizzapalace.com`):
1. The domain is mapped to their tenant in the `tenant_domains` table
2. The app automatically detects the tenant from the domain
3. No `?tenant=` parameter needed

### Development (Localhost)
For local development:
1. Add `?tenant=demo` (or any slug) to the URL
2. The app tries to fetch the tenant from Supabase
3. If not found or error occurs, it falls back to a **mock tenant**
4. This allows development without a configured database

### Mock Tenant Fallback
If the database is not available or tenant is not found:
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

---

## URL Structure Examples

### Platform (No Tenant)
```
http://localhost:3000/                    → Landing page
http://localhost:3000/#/register          → Registration
http://localhost:3000/#/login             → Login
```

### Customer App (With Tenant)
```
http://localhost:3000/?tenant=demo#/akun/beranda           → Customer dashboard
http://localhost:3000/?tenant=demo#/akun/menu              → Menu browsing
http://localhost:3000/?tenant=demo#/akun/menu/nasi-goreng → Menu item detail
```

### Admin App (With Tenant)
```
http://localhost:3000/?tenant=demo#/admin/dasbor           → Admin dashboard
http://localhost:3000/?tenant=demo#/admin/menu/kelola-menu → Menu management
```

### Production (Custom Domain)
```
https://pizzapalace.com/#/akun/beranda    → Customer dashboard (tenant auto-detected)
https://pizzapalace.com/#/admin/dasbor    → Admin dashboard (tenant auto-detected)
```

---

## Quick Start Guide

### For Business Owners
1. Visit `http://localhost:3000/`
2. Click "Get Started" or "Start Free Trial"
3. Fill in registration form at `/#/register`
4. Complete onboarding wizard
5. Get your custom subdomain (e.g., `pizzapalace.careos.id`)

### For Development/Testing
1. Visit `http://localhost:3000/?tenant=demo#/login`
2. Use mock credentials to login
3. Access customer/admin features with mock data

---

## Router Configuration

The app uses **React Router v6** with **HashRouter**:
- `HashRouter` is used for compatibility and easy deployment
- Platform routes are outside the `TenantProvider`
- All tenant-specific routes are wrapped in `TenantProvider`
- Protected routes use `ProtectedCustomerRoute`, `ProtectedAdminRoute`, `ProtectedCsRoute`

---

## Next Steps

### To Set Up Production Tenant
1. Create tenant in Supabase using `scripts/createDemoTenant.js`
2. Configure custom domain in `tenant_domains` table
3. Update DNS to point to your hosting
4. Tenant will be auto-detected from domain

### To Add More Platform Pages
Add routes outside the `TenantProvider` in `App.tsx`:
```tsx
<Route path="/about" element={<AboutPage />} />
<Route path="/pricing" element={<PricingPage />} />
<Route path="/contact" element={<ContactPage />} />
```

### To Add More Tenant Routes
Add routes inside the `TenantProvider` in `App.tsx`:
```tsx
<Route path="/new-feature" element={<NewFeaturePage />} />
```
