import React from 'react';
import { TestimonialItem } from '@core/types/homepage';
import { Star } from 'lucide-react';

interface TestimonialCardProps {
  testimonial: TestimonialItem;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 flex flex-col items-center text-center h-full transform hover:scale-105 transition-transform duration-300">
      <img
        src={testimonial.avatar}
        alt={testimonial.name}
        className="w-20 h-20 rounded-full object-cover mb-4 shadow-md"
      />
      <div className="flex text-yellow-400 mb-4">
        {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
      </div>
      <p className="text-lg text-brand-secondary dark:text-gray-400 italic mb-6 flex-grow">
        {testimonial.quote}
      </p>
      <div>
        <h4 className="font-bold text-brand-dark dark:text-gray-200 text-lg">{testimonial.name}</h4>
        <p className="text-sm text-brand-secondary dark:text-gray-500">{testimonial.role}</p>
      </div>
    </div>
  );
};

export default TestimonialCard;
