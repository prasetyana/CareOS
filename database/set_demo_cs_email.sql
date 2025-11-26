-- Update the Demo CS Agent profile to have the correct email
UPDATE profiles
SET 
    email = 'cs@demo.com',
    status = 'active',
    role = 'cs',
    full_name = 'Demo CS Agent'
WHERE id = '0de835c6-d2a2-415e-874a-7cb71dc7836c';

-- Verify the update
SELECT * FROM profiles WHERE email = 'cs@demo.com';
