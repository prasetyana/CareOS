-- Update usernames for demo users
UPDATE profiles SET username = 'demo.cs' WHERE full_name = 'Demo CS Agent';
UPDATE profiles SET username = 'test' WHERE full_name = 'Test';
UPDATE profiles SET username = 'demo.admin' WHERE full_name = 'Demo Admin';
UPDATE profiles SET username = 'demo.customer' WHERE full_name = 'Demo Customer';
UPDATE profiles SET username = 'john.doe' WHERE full_name = 'John Doe';
