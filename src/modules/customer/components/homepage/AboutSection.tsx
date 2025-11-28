
import React from 'react';
import { AboutSectionProps } from '../../types/homepage';

const AboutSection: React.FC<AboutSectionProps> = ({ headline, paragraph, image1, image2, image3 }) => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-5 gap-8 items-center">
          <div className="lg:col-span-2 text-center lg:text-left">
            <h2 className="text-5xl font-sans font-bold text-brand-dark mb-6">{headline}</h2>
            <p className="text-brand-secondary text-lg leading-relaxed">
                {paragraph}
            </p>
          </div>
          <div className="lg:col-span-3 grid grid-cols-2 grid-rows-2 gap-4 h-[500px]">
            <div className="col-span-2 row-span-1 rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300">
              <img src={image1} alt="Restaurant Interior" className="w-full h-full object-cover" />
            </div>
            <div className="col-span-1 row-span-1 rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300">
              <img src={image2} alt="Fresh Ingredients" className="w-full h-full object-cover" />
            </div>
            <div className="col-span-1 row-span-1 rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300">
              <img src={image3} alt="Chef Preparing Food" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
