-- Add layout column to tenants table
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS layout text DEFAULT 'default';

-- Update existing records to have 'default' layout if null
UPDATE tenants 
SET layout = 'default' 
WHERE layout IS NULL;
