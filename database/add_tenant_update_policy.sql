-- Enable UPDATE for tenants table
CREATE POLICY "Allow update for tenants"
    ON tenants FOR UPDATE
    TO public
    USING (true)
    WITH CHECK (true);
