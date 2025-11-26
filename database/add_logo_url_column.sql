-- Add logo_url column to tenants table
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tenants' AND column_name = 'logo_url';
