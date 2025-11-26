
import React from 'react';
import { MenuItem } from '../../../data/mockDB';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../hooks/useCart';
import { useToast } from '../../../hooks/useToast';
import MenuCard from '../../MenuCard';
import ContentCarousel from './ContentCarousel';
import { useTenantParam } from '../../../hooks/useTenantParam';

interface PersonalizedMenuSectionProps {
    title: string;
    items: MenuItem[];
    visibleItems?: number;
}

const PersonalizedMenuSection: React.FC<PersonalizedMenuSectionProps> = ({ title, items, visibleItems }) => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { addToast } = useToast();
    const { withTenant } = useTenantParam();

    const handleAddToCart = (item: MenuItem) => {
        addToCart(item);
        addToast(`${item.name} ditambahkan ke keranjang.`, 'success');
    };

    return (
        <section>
            <h2 className="text-[22px] font-semibold tracking-tight font-sans text-text-primary mb-6">{title}</h2>
            {/* Container for the carousel with a height that accommodates MenuCard's aspect ratio */}
            <div className="h-[440px] min-[320px]:h-[420px] min-[420px]:h-[320px] min-[540px]:h-[410px] md:h-[360px] lg:h-[350px] -mx-4 md:-mx-8 px-4 md:px-8">
                <ContentCarousel<MenuItem>
                    items={items}
                    visibleItems={visibleItems}
                    renderItem={(item) => (
                        <MenuCard
                            key={item.id}
                            {...item}
                            onAddToCart={() => handleAddToCart(item)}
                            onViewDetails={() => navigate(withTenant(`/akun/menu/${item.slug}`))}
                        />
                    )}
                />
            </div>
        </section>
    );
};

export default PersonalizedMenuSection;
