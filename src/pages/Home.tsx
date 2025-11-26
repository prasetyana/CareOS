
import React, { useState, useEffect } from 'react';
import { useHomepageContent } from '../hooks/useHomepageContent';
import SkeletonLoader from '../components/SkeletonLoader';
import { MenuItem, fetchMenuItems, fetchForYouRecommendations } from '../data/mockDB';
import { useAuth } from '../hooks/useAuth';

// Import section components
import HeroSection from '../components/homepage/HeroSection';
import AboutSection from '../components/homepage/AboutSection';
import FeaturedMenuSection from '../components/homepage/FeaturedMenuSection';
import ForYouSection from '../components/homepage/ForYouSection';
import GallerySection from '../components/homepage/GallerySection';
import TestimonialsSection from '../components/homepage/TestimonialsSection';
import ReservationCtaSection from '../components/homepage/ReservationCtaSection';
import PromotionSection from '../components/homepage/PromotionSection';
import LocationSection from '../components/homepage/LocationSection';

const SectionComponentMap: { [key: string]: React.FC<any> } = {
  hero: HeroSection,
  about: AboutSection,
  'featured-menu': FeaturedMenuSection,
  'for-you': ForYouSection,
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