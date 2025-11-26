-- Add address column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS address TEXT;
