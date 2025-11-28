
import React, { useState } from 'react';
import { FooterConfig } from '../../../types/homepage';

interface FooterFormProps {
  initialData: FooterConfig;
  onSubmit: (data: Partial<FooterConfig>) => Promise<void>;
}

const FooterForm: React.FC<FooterFormProps> = ({ initialData, onSubmit }) => {
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
        <label htmlFor="copyrightText" className={labelClasses}>Teks Hak Cipta</label>
        <input type="text" name="copyrightText" id="copyrightText" value={formData.copyrightText} onChange={handleChange} className={inputClasses}/>
      </div>

      <div className="pt-4 flex justify-end">
        <button type="submit" disabled={isSubmitting} className="bg-brand-primary text-white px-8 py-3 rounded-full font-medium hover:bg-red-700 transition-colors duration-300 disabled:bg-gray-400">
          {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>
    </form>
  );
};

export default FooterForm;
