-- Add email and status columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive'));

-- Update existing profiles to have a valid role if they don't match the new constraint
-- This fixes the "check constraint violated" error
UPDATE profiles 
SET role = 'customer' 
WHERE role NOT IN ('admin', 'cs', 'owner', 'customer') OR role IS NULL;

-- Add constraint for role
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles
ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'cs', 'owner', 'customer'));

-- Update existing profiles to have a status if they are null
UPDATE profiles SET status = 'active' WHERE status IS NULL;
