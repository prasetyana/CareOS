

import React, { useState, useEffect } from 'react';
import { useHomepageContent } from '@core/hooks/useHomepageContent';
import { useToast } from '@core/hooks/useToast';
import SkeletonLoader from '@ui/SkeletonLoader';
import { HeroSectionProps } from '@core/types/homepage';

const AdminHomepageEditorPage: React.FC = () => {
  // FIX: Use `config` and `updateSection` from context instead of deprecated `content` and `updateContent`.
  const { config, loading, updateSection } = useHomepageContent();
  const [formData, setFormData] = useState({
    // FIX: Changed state property names to match HeroSectionProps for consistency.
    headline: '',
    subheadline: '',
    ctaButtonText: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  // FIX: Find hero section from the new `config` object.
  const heroSection = config?.sections.find(s => s.type === 'hero');

  useEffect(() => {
    // FIX: Populate form from hero section props in the new `config` object.
    if (heroSection) {
      const props = heroSection.props as HeroSectionProps;
      setFormData({
        headline: props.headline,
        subheadline: props.subheadline,
        ctaButtonText: props.ctaButtonText,
      });
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
      // FIX: Call `updateSection` with the correct section ID and updated props.
      await updateSection(heroSection.id, formData);
      addToast('Homepage content updated successfully!', 'success');
    } catch (error) {
      addToast('Failed to update content.', 'error');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <SkeletonLoader className="h-8 w-1/3 rounded" />
          <SkeletonLoader className="h-12 w-full rounded" />
          <SkeletonLoader className="h-8 w-1/3 rounded" />
          <SkeletonLoader className="h-24 w-full rounded" />
          <SkeletonLoader className="h-8 w-1/3 rounded" />
          <SkeletonLoader className="h-12 w-full rounded" />
          <div className="flex justify-end pt-4">
            <SkeletonLoader className="h-12 w-32 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold font-sans text-brand-dark border-b pb-4 mb-6">Hero Section</h2>
              <div className="space-y-6">
                <div>
                  <label htmlFor="heroTitle" className="block text-sm font-medium text-brand-secondary mb-1">Title</label>
                  <input
                    type="text"
                    // FIX: Changed form field name and value to match updated state.
                    name="headline"
                    id="heroTitle"
                    value={formData.headline}
                    onChange={handleChange}
                    className="block w-full shadow-sm py-3 px-4 border border-gray-300 rounded-lg text-lg transition focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                  />
                </div>
                <div>
                  <label htmlFor="heroSubtitle" className="block text-sm font-medium text-brand-secondary mb-1">Subtitle</label>
                  <textarea
                    // FIX: Changed form field name and value to match updated state.
                    name="subheadline"
                    id="heroSubtitle"
                    rows={3}
                    value={formData.subheadline}
                    onChange={handleChange}
                    className="block w-full shadow-sm py-3 px-4 border border-gray-300 rounded-lg text-lg transition focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                  ></textarea>
                </div>
                <div>
                  <label htmlFor="heroButtonText" className="block text-sm font-medium text-brand-secondary mb-1">Button Text</label>
                  <input
                    type="text"
                    // FIX: Changed form field name and value to match updated state.
                    name="ctaButtonText"
                    id="heroButtonText"
                    value={formData.ctaButtonText}
                    onChange={handleChange}
                    className="block w-full shadow-sm py-3 px-4 border border-gray-300 rounded-lg text-lg transition focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                  />
                </div>
              </div>
            </section>

            {/* Future sections (e.g., About Us) can be added here */}

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-brand-primary text-white px-8 py-3 rounded-full font-medium hover:bg-red-700 transition-colors duration-300 disabled:bg-gray-400"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminHomepageEditorPage;
