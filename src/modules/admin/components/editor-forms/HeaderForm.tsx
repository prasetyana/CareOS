
import React, { useState } from 'react';
import { HeaderConfig } from '@core/types/homepage';

interface HeaderFormProps {
  initialData: HeaderConfig;
  onSubmit: (data: Partial<HeaderConfig>) => Promise<void>;
}

const HeaderForm: React.FC<HeaderFormProps> = ({ initialData, onSubmit }) => {
  const [formData, setFormData] = useState(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        <label htmlFor="brandName" className={labelClasses}>Nama Brand</label>
        <input type="text" name="brandName" id="brandName" value={formData.brandName} onChange={handleChange} className={inputClasses}/>
      </div>
       <div>
        <label htmlFor="logoUrl" className={labelClasses}>URL Logo</label>
        <input type="text" name="logoUrl" id="logoUrl" value={formData.logoUrl} onChange={handleChange} className={inputClasses} placeholder="https://... atau data:image/svg+xml..."/>
        <p className="text-xs text-brand-secondary dark:text-gray-500 mt-2">Anda dapat menggunakan URL gambar eksternal atau Data URI untuk SVG.</p>
      </div>

      <div className="pt-4 flex justify-end">
        <button type="submit" disabled={isSubmitting} className="bg-brand-primary text-white px-8 py-3 rounded-full font-medium hover:bg-red-700 transition-colors duration-300 disabled:bg-gray-400">
          {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>
    </form>
  );
};

export default HeaderForm;
