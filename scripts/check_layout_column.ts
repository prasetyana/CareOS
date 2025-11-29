
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkLayoutColumn() {
    console.log('Checking for layout column in tenants table...');
    const { data, error } = await supabase
        .from('tenants')
        .select('layout')
        .limit(1);

    if (error) {
        console.error('Error selecting layout:', error.message);
    } else {
        console.log('Successfully selected layout column. Data:', data);
    }
}

checkLayoutColumn();
