
import React from 'react';
import { LocationSectionProps } from '../../types/homepage';
import { MapPin, Phone, Mail } from 'lucide-react';

const LocationSection: React.FC<LocationSectionProps> = ({ headline, subheadline, address, phone, email, mapSrc }) => {
  return (
    <section className="py-24 bg-white dark:bg-gray-900">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-sans font-bold text-brand-dark dark:text-gray-100">{headline}</h2>
          <p className="mt-4 text-xl text-brand-secondary dark:text-gray-400 max-w-2xl mx-auto">
            {subheadline}
          </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <MapPin className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-dark dark:text-gray-200">Alamat</h3>
                <p className="text-lg text-brand-secondary dark:text-gray-400">{address}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <Phone className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-dark dark:text-gray-200">Telepon</h3>
                <p className="text-lg text-brand-secondary dark:text-gray-400">{phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <Mail className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-dark dark:text-gray-200">Email</h3>
                <p className="text-lg text-brand-secondary dark:text-gray-400">{email}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-lg h-96">
            <iframe
              src={mapSrc}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Restaurant Location"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;
