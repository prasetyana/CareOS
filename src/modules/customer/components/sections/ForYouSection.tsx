import React from 'react';
import { MenuItem } from '@core/data/mockDB';
import MenuCard from '@modules/customer/components/MenuCard';

interface ForYouSectionProps {
    menuItems: MenuItem[];
}

const ForYouSection: React.FC<ForYouSectionProps> = ({ menuItems }) => {
    return (
        <section className="py-12 bg-gray-50 dark:bg-gray-800">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-8">Recommended For You</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {menuItems.map(item => (
                        <MenuCard key={item.id} {...item} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ForYouSection;
