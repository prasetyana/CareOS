-- Add operating_hours column to tenants table
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS operating_hours JSONB DEFAULT '{
    "monday": {"isOpen": true, "openTime": "10:00", "closeTime": "22:00"},
    "tuesday": {"isOpen": true, "openTime": "10:00", "closeTime": "22:00"},
    "wednesday": {"isOpen": true, "openTime": "10:00", "closeTime": "22:00"},
    "thursday": {"isOpen": true, "openTime": "10:00", "closeTime": "22:00"},
    "friday": {"isOpen": true, "openTime": "10:00", "closeTime": "23:00"},
    "saturday": {"isOpen": true, "openTime": "10:00", "closeTime": "23:00"},
    "sunday": {"isOpen": true, "openTime": "10:00", "closeTime": "22:00"}
}'::jsonb;
