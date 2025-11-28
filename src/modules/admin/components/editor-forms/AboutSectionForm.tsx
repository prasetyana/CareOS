
import React, { useState } from 'react';
import { AboutSectionProps } from '@core/types/homepage';

interface AboutSectionFormProps {
  initialData: AboutSectionProps;
  onSubmit: (data: Partial<AboutSectionProps>) => Promise<void>;
}

const AboutSectionForm: React.FC<AboutSectionFormProps> = ({ initialData, onSubmit }) => {
  const [formData, setFormData] = useState(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(formData);
    setIsSubmitting(false);
  };
  
  const inputClasses = "block w-full shadow-sm py-3 px-4 border border-gray-300 rounded-lg text-lg transition focus:outline-none focus:ring-2 focus:ring-brand-primary/50 bg-white dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white";
  const labelClasses = "block text-sm font-medium text-brand-secondary dark:text-gray-400 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="headline" className={labelClasses}>Judul</label>
        <input type="text" name="headline" id="headline" value={formData.headline} onChange={handleChange} className={inputClasses}/>
      </div>
      <div>
        <label htmlFor="paragraph" className={labelClasses}>Paragraf</label>
        <textarea name="paragraph" id="paragraph" rows={4} value={formData.paragraph} onChange={handleChange} className={inputClasses}></textarea>
      </div>
      <div>
        <label htmlFor="image1" className={labelClasses}>URL Gambar 1 (Besar)</label>
        <input type="text" name="image1" id="image1" value={formData.image1} onChange={handleChange} className={inputClasses} />
      </div>
      <div>
        <label htmlFor="image2" className={labelClasses}>URL Gambar 2 (Kecil)</label>
        <input type="text" name="image2" id="image2" value={formData.image2} onChange={handleChange} className={inputClasses} />
      </div>
      <div>
        <label htmlFor="image3" className={labelClasses}>URL Gambar 3 (Kecil)</label>
        <input type="text" name="image3" id="image3" value={formData.image3} onChange={handleChange} className={inputClasses} />
      </div>

      <div className="pt-4 flex justify-end">
        <button type="submit" disabled={isSubmitting} className="bg-brand-primary text-white px-8 py-3 rounded-full font-medium hover:bg-red-700 transition-colors duration-300 disabled:bg-gray-400">
          {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>
    </form>
  );
};

export default AboutSectionForm;
