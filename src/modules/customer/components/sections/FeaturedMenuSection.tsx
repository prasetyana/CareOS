import React from 'react';
import { MenuItem } from '@core/data/mockDB';
import MenuCard from '@modules/customer/components/MenuCard';

interface FeaturedMenuSectionProps {
    menuItems: MenuItem[];
}

const FeaturedMenuSection: React.FC<FeaturedMenuSectionProps> = ({ menuItems }) => {
    return (
        <section className="py-12 bg-white dark:bg-gray-900">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-8">Featured Menu</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {menuItems.map(item => (
                        <MenuCard key={item.id} {...item} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturedMenuSection;
