/**
 * Script to create a demo tenant in Supabase for local development
 * Run with: node scripts/createDemoTenant.js
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.local') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase credentials in .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createDemoTenant() {
    console.log('🚀 Creating demo tenant...')
    console.log('📡 Supabase URL:', supabaseUrl)

    try {
        // Step 1: Check if demo tenant already exists
        const { data: existingTenant, error: checkError } = await supabase
            .from('tenants')
            .select('*')
            .eq('slug', 'demo')
            .maybeSingle()

        if (existingTenant) {
            console.log('✅ Demo tenant already exists!')
            console.log('📊 Tenant:', existingTenant)
            console.log(`\n📱 Access your app at: http://localhost:3000/?tenant=demo`)
            return existingTenant
        }

        // Step 2: Create demo tenant
        const { data: tenant, error: tenantError } = await supabase
            .from('tenants')
            .insert({
                business_name: 'DineOS Demo Restaurant',
                slug: 'demo',
                description: 'A demo restaurant for testing DineOS',
                email: 'demo@dineos.com',
                phone: '+62 812-3456-7890',
                primary_color: '#FF6B35',
                secondary_color: '#004E89',
                font_family: 'Inter',
                subscription_tier: 'trial',
                status: 'active'
            })
            .select()
            .single()

        if (tenantError) {
            console.error('❌ Error creating tenant:', tenantError)
            throw tenantError
        }

        console.log('✅ Demo tenant created:', tenant)

        // Step 3: Create a demo branch
        const { data: branch, error: branchError } = await supabase
            .from('branches')
            .insert({
                tenant_id: tenant.id,
                name: 'Main Branch',
                address: 'Jl. Sudirman No. 123',
                city: 'Jakarta',
                area: 'Central Jakarta',
                latitude: -6.2088,
                longitude: 106.8456,
                opening_hours: '09:00',
                closing_hours: '22:00',
                status: 'open'
            })
            .select()
            .single()

        if (branchError) {
            console.warn('⚠️ Could not create branch:', branchError.message)
        } else {
            console.log('✅ Demo branch created:', branch)
        }

        // Step 4: Create some demo menu categories
        const categories = [
            { name: 'Main Course', description: 'Delicious main dishes' },
            { name: 'Appetizers', description: 'Start your meal right' },
            { name: 'Beverages', description: 'Refreshing drinks' },
            { name: 'Desserts', description: 'Sweet endings' }
        ]

        for (const cat of categories) {
            const { error: catError } = await supabase
                .from('menu_categories')
                .insert({
                    tenant_id: tenant.id,
                    name: cat.name,
                    description: cat.description
                })

            if (catError && catError.code !== '23505') {
                console.warn(`⚠️ Could not create category ${cat.name}:`, catError.message)
            }
        }

        console.log('✅ Demo categories created')

        console.log('\n🎉 Demo tenant setup complete!')
        console.log(`\n📱 Access your app at: http://localhost:3000/?tenant=demo`)

        return tenant

    } catch (error) {
        console.error('❌ Error creating demo tenant:', error)
        throw error
    }
}

// Run the script
createDemoTenant()
    .then(() => {
        console.log('\n✨ Setup successful!')
        process.exit(0)
    })
    .catch((error) => {
        console.error('\n💥 Setup failed:', error.message)
        process.exit(1)
    })
