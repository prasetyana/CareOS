
import React from 'react';
// FIX: Re-typed import to fix "no exported member" errors.
import { Link } from "react-router-dom";
import { ArrowRight } from 'lucide-react';
import { HeroSectionProps } from '../../types/homepage';

const HeroSection: React.FC<HeroSectionProps> = ({ headline, subheadline, ctaButtonText, backgroundImage }) => {
  return (
    <section 
      className="relative bg-cover bg-center h-screen flex items-center justify-center text-white"
      style={{ backgroundImage: `url('${backgroundImage}')` }}
    >
      <div className="absolute inset-0 bg-black opacity-60"></div>
      <div className="relative z-10 text-center px-4 max-w-[1440px] mx-auto w-full">
        <h1 className="text-5xl md:text-8xl font-sans font-bold mb-4">
          {headline}
        </h1>
        <p className="text-lg md:text-2xl mb-8 max-w-3xl mx-auto">
          {subheadline}
        </p>
        <Link 
          to="/menu" 
          className="bg-brand-primary text-white font-bold py-3 px-10 rounded-full text-lg hover:bg-red-700 transition duration-300 ease-in-out transform hover:scale-105 inline-flex items-center group"
        >
          {ctaButtonText}
          <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
};

export default HeroSection;
