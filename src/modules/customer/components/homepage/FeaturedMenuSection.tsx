
import React from 'react';
// FIX: Re-typed import to fix "no exported member" errors.
import { Link } from "react-router-dom";
import { MenuItem } from '../../data/mockDB';
import MenuCard from '../MenuCard';
import { FeaturedMenuSectionProps } from '../../types/homepage';

interface Props extends FeaturedMenuSectionProps {
  menuItems: MenuItem[];
}

const FeaturedMenuSection: React.FC<Props> = ({ headline, subheadline, menuItems }) => {
  return (
    <section className="py-24 bg-brand-background">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-sans font-bold text-brand-dark">{headline}</h2>
          <p className="mt-4 text-xl text-brand-secondary max-w-2xl mx-auto">
            {subheadline}
          </p>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6">
          {menuItems && menuItems.length > 0 ? (
            menuItems.map((item) => (
              <Link 
                key={item.id} 
                to={`/menu/${item.id}`} 
                className="block"
              >
                <MenuCard 
                  id={item.id}
                  name={item.name}
                  description={item.description}
                  price={item.price}
                  image={item.image}
                  badge={item.badge}
                />
              </Link>
            ))
          ) : (
            <div className="col-span-3 text-center text-brand-secondary">
              <p>Menu unggulan tidak tersedia saat ini.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedMenuSection;
