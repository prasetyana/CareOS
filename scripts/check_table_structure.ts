
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load env vars manually
try {
    const envPath = path.resolve(process.cwd(), '.env');
    console.log('Loading .env from:', envPath);
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        console.log('File content length:', envConfig.length);
        envConfig.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                const cleanKey = key.trim();
                const cleanValue = value.trim();
                if (cleanKey.startsWith('VITE_')) {
                    console.log('Found key:', cleanKey);
                    process.env[cleanKey] = cleanValue;
                }
            }
        });
    } else {
        console.error('.env file not found at:', envPath);
    }
} catch (e) {
    console.error('Error loading .env:', e);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);


async function checkTableStructure() {
    console.log('Checking tenants table structure...');
    const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error selecting *:', error.message);
    } else {
        if (data && data.length > 0) {
            console.log('Table columns:', Object.keys(data[0]));
        } else {
            console.log('No data found in tenants table.');
        }
    }
}

checkTableStructure();
