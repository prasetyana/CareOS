
import { HomepageConfig, TestimonialItem } from '../types/homepage';
import { logoDataUri } from '../components/Logo';

const mockTestimonials: TestimonialItem[] = [
  {
    id: 1,
    name: 'Jessica Wijaya',
    role: 'Pecinta Kuliner',
    quote: '"Pengalaman bersantap terbaik yang pernah saya alami! Carbonara-nya luar biasa dan suasananya sempurna. Pasti akan kembali lagi!"',
    avatar: 'https://picsum.photos/seed/person1/200/200'
  },
  {
    id: 2,
    name: 'Budi Hartono',
    role: 'Pelanggan Setia',
    quote: '"Tempat andalan saya untuk makan malam bisnis. Layanan yang sempurna, makanan yang konsisten lezat, dan suasana yang elegan."',
    avatar: 'https://picsum.photos/seed/person2/200/200'
  },
  {
    id: 3,
    name: 'Sarah Chen',
    role: 'Pengulas Makanan',
    quote: '"DineOS benar-benar permata tersembunyi. Setiap hidangan adalah sebuah karya seni. Tiramisu mereka adalah yang terbaik di kota!"',
    avatar: 'https://picsum.photos/seed/person3/200/200'
  }
];

// Default Homepage Structure
let homepageConfig: HomepageConfig = {
  header: {
    brandName: 'DineOS',
    logoUrl: logoDataUri
  },
  sections: [
    {
      id: 'hero-1',
      type: 'hero',
      enabled: true,
      props: {
        headline: 'Santapan Istimewa',
        subheadline: 'Sebuah simfoni rasa, dibuat dengan penuh gairah dan disajikan dengan cinta. Selamat datang di tempat di mana setiap hidangan adalah perayaan.',
        ctaButtonText: 'Lihat Menu Kami',
        backgroundImage: 'https://picsum.photos/seed/restaurant/1920/1080',
        alignment: 'center',
        backgroundType: 'image',
      },
    },
    {
      id: 'about-1',
      type: 'about',
      enabled: true,
      props: {
        headline: 'Kisah Kami',
        paragraph: 'Didirikan pada tahun 2024, DineOS lahir dari keinginan untuk memadukan resep tradisional dengan teknik kuliner modern. Filosofi kami sederhana: menggunakan bahan-bahan lokal segar untuk menciptakan hidangan yang nyaman dan inovatif. Kami mengundang Anda untuk bergabung dan menjadi bagian dari kisah kami.',
        image1: 'https://picsum.photos/seed/interior/800/400',
        image2: 'https://picsum.photos/seed/ingredients/400/400',
        image3: 'https://picsum.photos/seed/chef/400/400',
        layout: 'image-right',
      },
    },
    {
        id: 'featured-menu-1',
        type: 'featured-menu',
        enabled: true,
        props: {
            headline: 'Menu Unggulan Kami',
            subheadline: 'Cicipi hidangan yang paling disukai oleh para tamu kami.',
            layout: 'grid',
            cardStyle: 'solid',
        },
    },
    {
        id: 'for-you-1',
        type: 'for-you',
        enabled: true,
        props: {
            headline: 'Untuk Kamu',
            subheadline: 'Berdasarkan pesanan terakhirmu, kamu mungkin suka:',
        },
    },
    {
        id: 'promotion-1',
        type: 'promotion',
        enabled: true,
        props: {
            headline: 'Promo Spesial Akhir Pekan',
            subheadline: 'Nikmati diskon 20% untuk semua hidangan utama setiap Sabtu & Minggu.',
            ctaButtonText: 'Lihat Promo',
            ctaButtonLink: '/menu',
            backgroundImage: 'https://picsum.photos/seed/promo/1200/400',
            style: 'apple-card',
        },
    },
    {
        id: 'gallery-1',
        type: 'gallery',
        enabled: true,
        props: {
            headline: 'Galeri Kami',
            subheadline: 'Lihatlah suasana hangat dan hidangan lezat kami.',
            images: [
                'https://picsum.photos/seed/gallery1/600/600',
                'https://picsum.photos/seed/gallery2/600/600',
                'https://picsum.photos/seed/gallery3/600/600',
                'https://picsum.photos/seed/gallery4/600/600',
            ],
        },
    },
    {
        id: 'testimonials-1',
        type: 'testimonials',
        enabled: true,
        props: {
            headline: 'Apa Kata Mereka',
            subheadline: 'Kami bangga menyajikan pengalaman kuliner yang tak terlupakan.',
            testimonials: mockTestimonials,
        },
    },
    {
      id: 'location-1',
      type: 'location',
      enabled: true,
      props: {
        headline: 'Kunjungi Kami',
        subheadline: 'Temukan kami di jantung kota, siap menyajikan hidangan tak terlupakan untuk Anda.',
        address: 'Jl. Kuliner 123, Kota Foodie, 10101',
        phone: '(021) 123-4567',
        email: 'reservasi@dineos.com',
        mapSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.571189558327!2d106.82496417500418!3d-6.188214393800069!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f42369689823%3A0x2e8de4e17e303706!2sMonumen%20Nasional!5e0!3m2!1sen!2sid!4v1718086084045!5m2!1sen!2sid'
      },
    },
    {
        id: 'reservation-cta-1',
        type: 'reservation-cta',
        enabled: true,
        props: {
            headline: 'Siap untuk Pengalaman Tak Terlupakan?',
            subheadline: 'Pesan meja Anda hari ini dan biarkan kami memanjakan Anda dengan keajaiban kuliner kami.',
            ctaButtonText: 'Reservasi Sekarang',
            ctaButtonLink: '/contact',
        },
    },
  ],
  footer: {
    copyrightText: `© ${new Date().getFullYear()} DineOS. Hak Cipta Dilindungi Undang-Undang.`,
  }
};

// Simulate API calls
export const getHomepageConfig = (): Promise<HomepageConfig> => {
    return new Promise(resolve => {
        setTimeout(() => {
            // Deep copy to prevent mutation of the original object
            resolve(JSON.parse(JSON.stringify(homepageConfig)));
        }, 800);
    });
};

export const updateHomepageConfig = (newConfig: HomepageConfig): Promise<HomepageConfig> => {
    return new Promise(resolve => {
        setTimeout(() => {
            homepageConfig = newConfig;
            resolve(JSON.parse(JSON.stringify(homepageConfig)));
        }, 500);
    });
};