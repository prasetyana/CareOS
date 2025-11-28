
import React, { useState } from 'react';
import { GallerySectionProps } from '@core/types/homepage';
import { X, Plus } from 'lucide-react';

interface GallerySectionFormProps {
  initialData: GallerySectionProps;
  onSubmit: (data: Partial<GallerySectionProps>) => Promise<void>;
}

const GallerySectionForm: React.FC<GallerySectionFormProps> = ({ initialData, onSubmit }) => {
  const [formData, setFormData] = useState(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const addImage = () => {
    setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, images: newImages }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Filter out empty strings before submitting
    const finalData = { ...formData, images: formData.images.filter(img => img.trim() !== '') };
    await onSubmit(finalData);
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
        <label htmlFor="subheadline" className={labelClasses}>Subjudul</label>
        <textarea name="subheadline" id="subheadline" rows={3} value={formData.subheadline} onChange={handleChange} className={inputClasses}></textarea>
      </div>

       <div>
        <label className={labelClasses}>URL Gambar</label>
        <div className="space-y-3">
            {formData.images.map((img, index) => (
                <div key={index} className="flex items-center gap-2">
                    <input 
                        type="text"
                        value={img}
                        onChange={(e) => handleImageChange(index, e.target.value)}
                        placeholder="https://..."
                        className={inputClasses}
                    />
                    <button type="button" onClick={() => removeImage(index)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            ))}
            <button type="button" onClick={addImage} className="flex items-center gap-2 text-sm font-medium text-brand-primary hover:underline">
                <Plus className="w-4 h-4" />
                Tambah Gambar
            </button>
        </div>
      </div>


      <div className="pt-4 flex justify-end">
        <button type="submit" disabled={isSubmitting} className="bg-brand-primary text-white px-8 py-3 rounded-full font-medium hover:bg-red-700 transition-colors duration-300 disabled:bg-gray-400">
          {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>
    </form>
  );
};

export default GallerySectionForm;
