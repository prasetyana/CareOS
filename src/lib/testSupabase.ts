// Test Supabase Connection
// Run this in browser console to test if Supabase is connected

import { supabase } from './lib/supabase'

async function testSupabaseConnection() {
    console.log('Testing Supabase connection...')

    // Test 1: Check if client is initialized
    console.log('Supabase client:', supabase)

    // Test 2: Try to fetch tenants
    try {
        const { data, error } = await supabase
            .from('tenants')
            .select('*')
            .limit(5)

        if (error) {
            console.error('Error fetching tenants:', error)
        } else {
            console.log('Tenants found:', data)
        }
    } catch (err) {
        console.error('Connection error:', err)
    }

    // Test 3: Try to fetch demo tenant specifically
    try {
        const { data, error } = await supabase
            .from('tenants')
            .select('*')
            .eq('slug', 'demo')
            .single()

        if (error) {
            console.error('Error fetching demo tenant:', error)
        } else {
            console.log('Demo tenant:', data)
        }
    } catch (err) {
        console.error('Demo tenant error:', err)
    }
}

// Export for use
export { testSupabaseConnection }
