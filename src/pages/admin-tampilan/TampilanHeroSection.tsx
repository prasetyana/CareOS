import React, { useState, useEffect } from 'react';
import { useHomepageContent } from '../../hooks/useHomepageContent';
import { useToast } from '../../hooks/useToast';
import SkeletonLoader from '../../components/SkeletonLoader';
import { HeroSectionProps } from '../../types/homepage';

const TampilanHeroSection: React.FC = () => {
  const { config, loading, updateSection } = useHomepageContent();
  const [formData, setFormData] = useState<Partial<HeroSectionProps>>({
    headline: '',
    subheadline: '',
    ctaButtonText: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const heroSection = config?.sections.find(s => s.type === 'hero');

  useEffect(() => {
    if (heroSection) {
      setFormData(heroSection.props as HeroSectionProps);
    }
  }, [heroSection]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroSection) return;

    setIsSubmitting(true);
    try {
      await updateSection(heroSection.id, formData);
      addToast('Konten hero section berhasil diperbarui!', 'success');
    } catch (error) {
      addToast('Gagal memperbarui konten.', 'error');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = "block w-full shadow-sm py-3 px-4 border border-gray-300 rounded-lg text-lg transition focus:outline-none focus:ring-2 focus:ring-brand-primary/50 bg-white dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white";
  const labelClasses = "block text-sm font-medium text-brand-secondary dark:text-gray-400 mb-1";

  if (loading || !heroSection) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 space-y-6">
          <SkeletonLoader className="h-8 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
          <SkeletonLoader className="h-12 w-full rounded bg-gray-200 dark:bg-gray-700" />
          <SkeletonLoader className="h-8 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
          <SkeletonLoader className="h-24 w-full rounded bg-gray-200 dark:bg-gray-700" />
          <SkeletonLoader className="h-8 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
          <SkeletonLoader className="h-12 w-full rounded bg-gray-200 dark:bg-gray-700" />
           <div className="flex justify-end pt-4">
              <SkeletonLoader className="h-12 w-32 rounded-full bg-gray-200 dark:bg-gray-700" />
          </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold font-sans text-brand-dark dark:text-gray-200 border-b dark:border-gray-700 pb-4 mb-6">Editor Hero Section</h2>
          <div className="space-y-6">
            <div>
              <label htmlFor="headline" className={labelClasses}>Judul</label>
              <input
                type="text"
                name="headline"
                id="headline"
                value={formData.headline}
                onChange={handleChange}
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="subheadline" className={labelClasses}>Subjudul</label>
              <textarea
                name="subheadline"
                id="subheadline"
                rows={3}
                value={formData.subheadline}
                onChange={handleChange}
                className={inputClasses}
              ></textarea>
            </div>
            <div>
              <label htmlFor="ctaButtonText" className={labelClasses}>Teks Tombol</label>
              <input
                type="text"
                name="ctaButtonText"
                id="ctaButtonText"
                value={formData.ctaButtonText}
                onChange={handleChange}
                className={inputClasses}
              />
            </div>
          </div>
        </section>
        
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-brand-primary text-white px-8 py-3 rounded-full font-medium hover:bg-red-700 transition-colors duration-300 disabled:bg-gray-400"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default TampilanHeroSection;
