
import React from 'react';
import { GallerySectionProps } from '../../types/homepage';

const GallerySection: React.FC<GallerySectionProps> = ({ headline, subheadline, images }) => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-sans font-bold text-brand-dark">{headline}</h2>
          <p className="mt-4 text-xl text-brand-secondary max-w-2xl mx-auto">
            {subheadline}
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((src, index) => (
            <div key={index} className="rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300 aspect-w-1 aspect-h-1">
              <img src={src} alt={`Gallery image ${index + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
