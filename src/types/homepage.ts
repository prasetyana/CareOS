

export interface HeaderConfig {
  brandName: string;
  logoUrl: string;
}

export interface FooterConfig {
  copyrightText: string;
}

export interface TestimonialItem {
  id: number;
  name: string;
  role: string;
  quote: string;
  avatar: string;
}

export interface HeroSectionProps {
  headline: string;
  subheadline: string;
  ctaButtonText: string;
  backgroundImage: string;
  // Style fields
  alignment: 'center' | 'left';
  backgroundType: 'image' | 'video' | 'solid';
}

export interface AboutSectionProps {
  headline: string;
  paragraph: string;
  image1: string;
  image2: string;
  image3: string;
  // Style fields
  layout: 'image-left' | 'image-right';
}

export interface FeaturedMenuSectionProps {
  headline: string;
  subheadline: string;
  // Style fields
  layout: 'grid' | 'carousel';
  cardStyle: 'glass' | 'solid';
}

export interface ForYouSectionProps {
    headline: string;
    subheadline: string;
}

export interface PromotionSectionProps {
  headline: string;
  subheadline: string;
  ctaButtonText: string;
  ctaButtonLink: string;
  backgroundImage: string;
  // Style fields
  style: 'apple-card' | 'full-bleed';
}

export interface TestimonialsSectionProps {
    headline: string;
    subheadline: string;
    testimonials: TestimonialItem[];
}

export interface GallerySectionProps {
    headline: string;
    subheadline: string;
    images: string[];
}

export interface LocationSectionProps {
    headline: string;
    subheadline: string;
    address: string;
    phone: string;
    email: string;
    mapSrc: string;
}

export interface ReservationCtaSectionProps {
    headline: string;
    subheadline: string;
    ctaButtonText: string;
    ctaButtonLink: string;
}


// Discriminated Union for Sections
export type Section =
  | { id: string; type: 'hero'; enabled: boolean; props: HeroSectionProps }
  | { id: string; type: 'about'; enabled: boolean; props: AboutSectionProps }
  | { id: string; type: 'featured-menu'; enabled: boolean; props: FeaturedMenuSectionProps }
  | { id: string; type: 'for-you'; enabled: boolean; props: ForYouSectionProps }
  | { id: string; type: 'promotion'; enabled: boolean; props: PromotionSectionProps }
  | { id: string; type: 'testimonials'; enabled: boolean; props: TestimonialsSectionProps }
  | { id: string; type: 'gallery'; enabled: boolean; props: GallerySectionProps }
  | { id: string; type: 'location'; enabled: boolean; props: LocationSectionProps }
  | { id: string; type: 'reservation-cta'; enabled: boolean; props: ReservationCtaSectionProps };

export interface HomepageConfig {
  header: HeaderConfig;
  sections: Section[];
  footer: FooterConfig;
}