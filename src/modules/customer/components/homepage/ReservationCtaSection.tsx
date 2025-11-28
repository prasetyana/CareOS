
import React from 'react';
// FIX: Re-typed import to fix "no exported member" errors.
import { Link } from "react-router-dom";
import { ArrowRight } from 'lucide-react';
import { ReservationCtaSectionProps } from '../../types/homepage';

const ReservationCtaSection: React.FC<ReservationCtaSectionProps> = ({ headline, subheadline, ctaButtonText, ctaButtonLink }) => {
  return (
    <section className="py-24 bg-brand-dark">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 text-center">
        <h2 className="text-4xl md:text-5xl font-sans font-bold text-white mb-4">
          {headline}
        </h2>
        <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
          {subheadline}
        </p>
        <Link 
          to={ctaButtonLink} 
          className="bg-brand-primary text-white font-bold py-3 px-10 rounded-full text-lg hover:bg-red-700 transition duration-300 ease-in-out transform hover:scale-105 inline-flex items-center group"
        >
          {ctaButtonText}
          <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
};

export default ReservationCtaSection;
