# White-Label Login Implementation Guide

## Overview
DineOS now uses **tenant-specific login** for a truly white-label experience. Each restaurant has their own branded login page on their custom domain.

---

## Architecture

### **Platform Routes (No Tenant Required)**
These routes are for business owner registration only:

```
http://localhost:3000/              → Landing page (CareOS branding)
http://localhost:3000/#/register    → Restaurant registration
http://localhost:3000/#/onboarding  → Onboarding wizard
```

### **Tenant Routes (Require Tenant Context)**
All other routes, **including login**, require tenant context:

```
http://localhost:3000/?tenant=demo#/login         → Tenant-specific login
http://localhost:3000/?tenant=demo#/akun/beranda  → Customer dashboard
http://localhost:3000/?tenant=demo#/admin/dasbor  → Admin dashboard
```

---

## Login Flow

### **For Customers**
1. Visit: `https://pizzapalace.com/#/login`
2. Tenant auto-detected from domain: `pizzapalace`
3. Login page shows **Pizza Palace** branding (logo, colors, name)
4. After login → Redirect to `/#/akun/beranda` (customer dashboard)

### **For Business Owners/Staff**
1. Visit: `https://pizzapalace.com/#/login`
2. Tenant auto-detected from domain: `pizzapalace`
3. Login page shows **Pizza Palace** branding
4. After login → Check role → Redirect to:
   - Admin: `/#/admin/dasbor`
   - CS: `/#/cs/dasbor`
   - Customer: `/#/akun/beranda`

### **For Development (Localhost)**
1. Visit: `http://localhost:3000/?tenant=demo#/login`
2. Tenant specified via URL parameter: `demo`
3. Login page shows **DineOS Demo Restaurant** branding
4. After login → Redirect based on role

---

## What Changed

### **1. Routing Structure**
**Before:**
```tsx
<Routes>
  <Route path="/" element={<PlatformLandingPage />} />
  <Route path="/register" element={<RestaurantRegisterPage />} />
  <Route path="/login" element={<LoginPage />} />  ← Platform login
  
  <Route path="/*" element={
    <TenantProvider>
      {/* Tenant routes */}
    </TenantProvider>
  } />
</Routes>
```

**After:**
```tsx
<Routes>
  {/* Platform routes (NO tenant context) */}
  <Route path="/" element={<PlatformLandingPage />} />
  <Route path="/register" element={<RestaurantRegisterPage />} />
  <Route path="/onboarding" element={<OnboardingWizardPage />} />
  
  {/* All other routes need tenant context (including login) */}
  <Route path="/*" element={
    <TenantProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />  ← Tenant-specific login
        {/* Other tenant routes */}
      </Routes>
    </TenantProvider>
  } />
</Routes>
```

### **2. Login Page Enhancement**
**Before:**
```tsx
<h2>Masuk</h2>
```

**After:**
```tsx
{tenant?.logoUrl && (
  <div className="flex justify-center mb-4">
    <img src={tenant.logoUrl} alt={tenant.businessName} className="h-16 w-auto" />
  </div>
)}

<h2>Masuk ke {tenant?.businessName || 'Akun Anda'}</h2>
```

### **3. Registration Page**
**Removed:** "Already have an account? Sign in" link

**Why:** In a white-label system, each tenant has their own login page. There's no central login to link to from the registration page.

---

## Tenant Branding

### **How Branding is Applied**
When a tenant is detected, the following CSS variables are set:

```typescript
document.documentElement.style.setProperty('--primary-color', tenant.primaryColor)
document.documentElement.style.setProperty('--secondary-color', tenant.secondaryColor)
document.documentElement.style.setProperty('--font-family', tenant.fontFamily)
```

### **Login Page Uses Tenant Branding**
- **Logo:** Displayed if `tenant.logoUrl` is set
- **Business Name:** Shown in heading "Masuk ke {businessName}"
- **Colors:** Uses `brand-primary`, `brand-secondary` CSS variables
- **Fonts:** Uses tenant's font family

---

## URL Examples

### **Production (Custom Domain)**
```
Customer visits:     https://pizzapalace.com/#/login
Tenant detected:     "pizzapalace" (from domain)
Login page shows:    Pizza Palace branding
After login:         https://pizzapalace.com/#/akun/beranda
```

### **Production (Subdomain)**
```
Customer visits:     https://pizzapalace.careos.id/#/login
Tenant detected:     "pizzapalace" (from subdomain)
Login page shows:    Pizza Palace branding
After login:         https://pizzapalace.careos.id/#/akun/beranda
```

### **Development (Localhost)**
```
Developer visits:    http://localhost:3000/?tenant=demo#/login
Tenant specified:    "demo" (from URL parameter)
Login page shows:    DineOS Demo Restaurant branding
After login:         http://localhost:3000/?tenant=demo#/akun/beranda
```

---

## Benefits of Tenant-Specific Login

### **1. Truly White-Label**
✅ Customers never see "CareOS" branding
✅ Each restaurant appears as an independent system
✅ Professional, branded experience

### **2. Better User Experience**
✅ Single domain for everything (no redirects)
✅ Consistent branding throughout
✅ Simpler navigation

### **3. SEO Benefits**
✅ All content on one domain
✅ Better search engine indexing
✅ Domain authority stays with tenant

### **4. Security**
✅ Tenant context required for login
✅ No cross-tenant authentication issues
✅ Clear separation between tenants

---

## Testing

### **Test Tenant-Specific Login**
1. Start dev server: `npm run dev`
2. Visit: `http://localhost:3000/?tenant=demo#/login`
3. Verify:
   - Page shows "Masuk ke DineOS Demo Restaurant"
   - Tenant branding colors are applied
   - After login, redirects to correct dashboard based on role

### **Test Platform Landing Page**
1. Visit: `http://localhost:3000/`
2. Verify:
   - Shows CareOS branding
   - "View Demo" button → `/?tenant=demo#/login`
   - "Get Started" button → `/#/register`

### **Test Registration Flow**
1. Visit: `http://localhost:3000/#/register`
2. Verify:
   - No "Already have an account? Sign in" link
   - After registration → Redirects to onboarding

---

## Migration Guide

### **For Existing Tenants**
If you have existing tenants with users:

1. **No code changes needed** - Login still works the same
2. **Update documentation** - Tell users to login at their domain
3. **Update email templates** - Link to `{tenant_domain}/#/login` instead of platform login

### **For New Tenants**
1. Register at `careos.com/#/register`
2. Complete onboarding wizard
3. Get custom subdomain (e.g., `pizzapalace.careos.id`)
4. Login at `pizzapalace.careos.id/#/login`
5. (Optional) Add custom domain later

---

## Future Enhancements

### **Custom Domain Setup**
1. Tenant adds custom domain in settings
2. DNS configuration instructions provided
3. Domain verified and activated
4. Login available at `pizzapalace.com/#/login`

### **SSO Integration**
- Google Sign-In (tenant-specific)
- Facebook Login (tenant-specific)
- Apple Sign-In (tenant-specific)

### **Multi-Factor Authentication**
- SMS verification
- Email verification
- Authenticator apps

---

## Troubleshooting

### **Issue: "Restaurant Not Found" Error**
**Cause:** Tenant parameter missing or invalid
**Solution:** Add `?tenant=demo` to URL for development

### **Issue: Login Page Shows "Masuk ke Akun Anda"**
**Cause:** Tenant context not loaded yet
**Solution:** This is normal during initial load, should update once tenant is detected

### **Issue: Wrong Branding Colors**
**Cause:** Tenant branding not applied
**Solution:** Check that tenant has `primaryColor` and `secondaryColor` set in database

---

## Summary

✅ **Login is now tenant-specific** - Each restaurant has their own branded login page
✅ **Truly white-label** - Customers never see platform branding
✅ **Better UX** - Everything on one domain
✅ **Registration removed login link** - Aligns with white-label concept
✅ **Tenant branding applied** - Logo, colors, and business name displayed

This implementation provides a professional, white-label experience where each restaurant appears as an independent system while still being powered by the DineOS platform.
