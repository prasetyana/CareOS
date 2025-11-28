import React, { useState } from 'react';
import { TestimonialsSectionProps, TestimonialItem } from '../../../types/homepage';
import { X, Plus } from 'lucide-react';

interface TestimonialsSectionFormProps {
  initialData: TestimonialsSectionProps;
  onSubmit: (data: Partial<TestimonialsSectionProps>) => Promise<void>;
}

const TestimonialsSectionForm: React.FC<TestimonialsSectionFormProps> = ({ initialData, onSubmit }) => {
  const [formData, setFormData] = useState(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTestimonialChange = (index: number, field: keyof Omit<TestimonialItem, 'id'>, value: string) => {
    const newTestimonials = [...formData.testimonials];
    (newTestimonials[index] as any)[field] = value;
    setFormData(prev => ({ ...prev, testimonials: newTestimonials }));
  };

  const addTestimonial = () => {
    const newTestimonial: TestimonialItem = {
      id: Date.now(), // simple unique id for key prop
      name: '',
      role: '',
      quote: '',
      avatar: '',
    };
    setFormData(prev => ({ ...prev, testimonials: [...prev.testimonials, newTestimonial] }));
  };

  const removeTestimonial = (index: number) => {
    const newTestimonials = formData.testimonials.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, testimonials: newTestimonials }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(formData);
    setIsSubmitting(false);
  };
  
  const inputClasses = "block w-full shadow-sm py-3 px-4 border border-gray-300 rounded-lg text-lg transition focus:outline-none focus:ring-2 focus:ring-brand-primary/50 bg-white dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white";
  const labelClasses = "block text-sm font-medium text-brand-secondary dark:text-gray-400 mb-1";
  const smallInputClasses = inputClasses.replace('text-lg', 'text-sm');

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="headline" className={labelClasses}>Judul</label>
        <input type="text" name="headline" id="headline" value={formData.headline} onChange={handleTextChange} className={inputClasses}/>
      </div>
      <div>
        <label htmlFor="subheadline" className={labelClasses}>Subjudul</label>
        <textarea name="subheadline" id="subheadline" rows={3} value={formData.subheadline} onChange={handleTextChange} className={inputClasses}></textarea>
      </div>
      
      <div className="pt-4 border-t dark:border-gray-700">
        <h3 className="text-lg font-semibold text-brand-dark dark:text-gray-200 mb-4">Daftar Testimoni</h3>
        <div className="space-y-6">
          {formData.testimonials.map((testimonial, index) => (
            <div key={testimonial.id} className="p-4 border dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 relative">
              <button
                type="button"
                onClick={() => removeTestimonial(index)}
                className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"
                aria-label="Hapus Testimoni"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-4">
                <div>
                    <label htmlFor={`testimonial-quote-${index}`} className={labelClasses}>Kutipan</label>
                    <textarea 
                        id={`testimonial-quote-${index}`}
                        rows={3} 
                        value={testimonial.quote} 
                        onChange={(e) => handleTestimonialChange(index, 'quote', e.target.value)} 
                        className={smallInputClasses}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor={`testimonial-name-${index}`} className={labelClasses}>Nama</label>
                        <input 
                            type="text" 
                            id={`testimonial-name-${index}`}
                            value={testimonial.name} 
                            onChange={(e) => handleTestimonialChange(index, 'name', e.target.value)} 
                            className={smallInputClasses}
                        />
                    </div>
                    <div>
                        <label htmlFor={`testimonial-role-${index}`} className={labelClasses}>Peran</label>
                        <input 
                            type="text" 
                            id={`testimonial-role-${index}`}
                            value={testimonial.role} 
                            onChange={(e) => handleTestimonialChange(index, 'role', e.target.value)} 
                            className={smallInputClasses}
                        />
                    </div>
                </div>
                 <div>
                    <label htmlFor={`testimonial-avatar-${index}`} className={labelClasses}>URL Avatar</label>
                    <input 
                        type="text" 
                        id={`testimonial-avatar-${index}`}
                        value={testimonial.avatar} 
                        onChange={(e) => handleTestimonialChange(index, 'avatar', e.target.value)} 
                        className={smallInputClasses}
                        placeholder="https://..."
                    />
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addTestimonial}
          className="mt-4 flex items-center gap-2 text-sm font-medium text-brand-primary hover:underline"
        >
          <Plus className="w-4 h-4" />
          Tambah Testimoni
        </button>
      </div>


      <div className="pt-4 flex justify-end">
        <button type="submit" disabled={isSubmitting} className="bg-brand-primary text-white px-8 py-3 rounded-full font-medium hover:bg-red-700 transition-colors duration-300 disabled:bg-gray-400">
          {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>
    </form>
  );
};

export default TestimonialsSectionForm;
