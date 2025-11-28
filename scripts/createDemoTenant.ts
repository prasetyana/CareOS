/**
 * Script to create a demo tenant in Supabase for local development
 * Run this once to set up your test data
 */

import { supabase } from '../src/core/supabase/supabase'

async function createDemoTenant() {
    console.log('🚀 Creating demo tenant...')

    try {
        // Step 1: Create demo tenant
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
            if (tenantError.code === '23505') {
                console.log('✅ Demo tenant already exists!')

                // Fetch existing tenant
                const { data: existingTenant } = await supabase
                    .from('tenants')
                    .select('*')
                    .eq('slug', 'demo')
                    .single()

                if (existingTenant) {
                    console.log('📊 Existing tenant:', existingTenant)
                    return existingTenant
                }
            }
            throw tenantError
        }

        console.log('✅ Demo tenant created:', tenant)

        // Step 2: Create a demo branch
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

        if (branchError) throw branchError
        console.log('✅ Demo branch created:', branch)

        // Step 3: Create some demo menu categories
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

            if (catError && catError.code !== '23505') throw catError
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
        console.error('\n💥 Setup failed:', error)
        process.exit(1)
    })
