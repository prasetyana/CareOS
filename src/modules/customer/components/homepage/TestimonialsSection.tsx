
import React from 'react';
import TestimonialCard from '../TestimonialCard';
import { TestimonialsSectionProps } from '../../types/homepage';

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ headline, subheadline, testimonials }) => {
  return (
    <section className="py-24 bg-brand-background dark:bg-black">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-sans font-bold text-brand-dark dark:text-gray-100">{headline}</h2>
          <p className="mt-4 text-xl text-brand-secondary dark:text-gray-400 max-w-2xl mx-auto">
            {subheadline}
          </p>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id}>
              <TestimonialCard testimonial={testimonial} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
