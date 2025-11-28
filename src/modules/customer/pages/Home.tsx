import React, { useState, useEffect } from 'react';
import { useHomepageContent } from '@core/contexts/HomepageContext';
import { useAuth } from '@core/hooks/useAuth';
import { fetchMenuItems, fetchForYouRecommendations, MenuItem } from '@core/data/mockDB';
import SkeletonLoader from '@ui/SkeletonLoader';
import GallerySection from '@modules/customer/components/sections/GallerySection';
import TestimonialsSection from '@modules/customer/components/sections/TestimonialsSection';
import ReservationCtaSection from '@modules/customer/components/sections/ReservationCtaSection';
import PromotionSection from '@modules/customer/components/sections/PromotionSection';
import LocationSection from '@modules/customer/components/sections/LocationSection';
import HeroSection from '@modules/customer/components/sections/HeroSection';
import FeaturedMenuSection from '@modules/customer/components/sections/FeaturedMenuSection';
import ForYouSection from '@modules/customer/components/sections/ForYouSection';
import FeaturesSection from '@modules/customer/components/sections/FeaturesSection';
import StatsSection from '@modules/customer/components/sections/StatsSection';
import CtaSection from '@modules/customer/components/sections/CtaSection';

const SectionComponentMap: Record<string, React.FC<any>> = {
  hero: HeroSection,
  'featured-menu': FeaturedMenuSection,
  'for-you': ForYouSection,
  features: FeaturesSection,
  stats: StatsSection,
  cta: CtaSection,
  gallery: GallerySection,
  testimonials: TestimonialsSection,
  'reservation-cta': ReservationCtaSection,
  promotion: PromotionSection,
  location: LocationSection,
};

const Home: React.FC = () => {
  const { config, loading: configLoading } = useHomepageContent();
  const { user, isAuthenticated } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [forYouItems, setForYouItems] = useState<MenuItem[]>([]);
  const [forYouLoading, setForYouLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setMenuLoading(true);
      setForYouLoading(true);

      try {
        const menuPromise = fetchMenuItems();
        const forYouPromise = isAuthenticated && user ? fetchForYouRecommendations(user.id) : Promise.resolve([]);

        const [items, recs] = await Promise.all([menuPromise, forYouPromise]);

        setMenuItems(items);
        setForYouItems(recs);

      } catch (error) {
        console.error("Failed to fetch page data:", error);
      } finally {
        setMenuLoading(false);
        setForYouLoading(false);
      }
    };
    loadData();
  }, [isAuthenticated, user]);

  const loading = configLoading || menuLoading || forYouLoading;

  if (loading || !config) {
    return (
      <div className="space-y-1">
        <SkeletonLoader className="h-screen w-full" />
        <SkeletonLoader className="h-[70vh] w-full" />
        <SkeletonLoader className="h-[70vh] w-full" />
      </div>
    );
  }

  return (
    <div>
      {config.sections.map((section) => {
        // Special condition for 'for-you' section
        if (section.type === 'for-you' && (!isAuthenticated || forYouItems.length === 0)) {
          return null;
        }

        if (!section.enabled) {
          return null;
        }

        const Component = SectionComponentMap[section.type];
        if (!Component) {
          console.warn(`No component found for section type: ${section.type}`);
          return null;
        }

        if (section.type === 'featured-menu') {
          return <Component key={section.id} {...section.props} menuItems={menuItems.slice(0, 3)} />;
        }

        if (section.type === 'for-you') {
          return <Component key={section.id} {...section.props} menuItems={forYouItems} />;
        }

        return <Component key={section.id} {...section.props} />;
      })}
    </div>
  );
};

export default Home;