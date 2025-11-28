
import React from 'react';
// FIX: Re-typed import to fix "no exported member" errors.
import { Link } from "react-router-dom";
import { ArrowRight } from 'lucide-react';
import { PromotionSectionProps } from '../../types/homepage';

const PromotionSection: React.FC<PromotionSectionProps> = ({ headline, subheadline, ctaButtonText, ctaButtonLink, backgroundImage }) => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <div
          className="relative bg-cover bg-center rounded-3xl p-12 md:p-20 text-center text-white overflow-hidden"
          style={{ backgroundImage: `url('${backgroundImage}')` }}
        >
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-sans font-bold mb-4">
              {headline}
            </h2>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
              {subheadline}
            </p>
            <Link 
              to={ctaButtonLink}
              className="bg-white text-brand-dark font-bold py-3 px-10 rounded-full text-lg hover:bg-gray-200 transition duration-300 ease-in-out transform hover:scale-105 inline-flex items-center group"
            >
              {ctaButtonText}
              <ArrowRight className="w-5 h-5 ml-2 text-brand-primary transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromotionSection;
