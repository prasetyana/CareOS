-- Create a helper function to get the current user's tenant_id
-- This function runs with SECURITY DEFINER to bypass RLS when fetching the tenant_id
CREATE OR REPLACE FUNCTION get_auth_user_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT tenant_id FROM profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;

-- Create a new policy that allows users to see profiles in their own tenant
-- This allows Admins to see CS users, and CS users to see Admins (within the same tenant)
CREATE POLICY "Users can view profiles in same tenant"
    ON profiles FOR SELECT
    TO authenticated
    USING (
        tenant_id = get_auth_user_tenant_id()
        OR
        id = auth.uid() -- Always allow seeing own profile (fallback)
    );

-- Also ensure Admins can update profiles in their tenant (for soft delete/edit)
CREATE POLICY "Admins can update profiles in same tenant"
    ON profiles FOR UPDATE
    TO authenticated
    USING (
        tenant_id = get_auth_user_tenant_id()
        AND
        (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'owner')
    );
