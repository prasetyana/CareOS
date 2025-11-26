-- Update Demo Admin email
UPDATE profiles
SET email = 'admin@demo.com'
WHERE id = 'c52e2749-280e-4465-8e4f-1091c51e1056';

-- Verify
SELECT * FROM profiles WHERE id = 'c52e2749-280e-4465-8e4f-1091c51e1056';
