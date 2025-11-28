
import React from 'react';
import { Link } from "react-router-dom";
import { MenuItem } from '../../data/mockDB';
import MenuCard from '../MenuCard';
import { ForYouSectionProps } from '../../types/homepage';
import { useTenantParam } from '../../hooks/useTenantParam';

interface Props extends ForYouSectionProps {
  menuItems: MenuItem[];
}

const ForYouSection: React.FC<Props> = ({ headline, subheadline, menuItems }) => {
  const { withTenant } = useTenantParam();

  if (!menuItems || menuItems.length === 0) {
    return null; // Don't render the section if there are no recommendations
  }

  return (
    <section className="py-24 bg-brand-background">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-sans font-bold text-brand-dark">{headline}</h2>
          <p className="mt-4 text-xl text-brand-secondary max-w-2xl mx-auto">
            {subheadline}
          </p>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-8 -mx-6 px-6 hide-scrollbar justify-center">
          {menuItems.map((item) => (
            <div key={item.id} className="flex-shrink-0 w-[280px]">
              <Link to={withTenant(`/akun/menu/${item.slug}`)} className="block">
                <MenuCard
                  id={item.id}
                  name={item.name}
                  description={item.description}
                  price={item.price}
                  image={item.image}
                  badge={item.badge}
                  onViewDetails={() => {
                    // This is just a placeholder, the Link handles navigation
                  }}
                />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ForYouSection;
