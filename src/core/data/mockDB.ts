import { Address, PaymentMethod } from "./types/customer";
export type { Address, PaymentMethod };

// Helper to parse Indonesian date strings
const monthMap: { [key: string]: string } = {
    'Januari': 'January', 'Februari': 'February', 'Maret': 'March', 'April': 'April',
    'Mei': 'May', 'Juni': 'June', 'Juli': 'July', 'Agustus': 'August',
    'September': 'September', 'Oktober': 'October', 'November': 'November', 'Desember': 'December'
};

const parseIndonesianDate = (dateStr: string): Date => {
    const parts = dateStr.split(' ');
    if (parts.length === 3) {
        const day = parts[0];
        const month = monthMap[parts[1]];
        const year = parts[2];
        if (day && month && year) {
            return new Date(`${month} ${day}, ${year}`);
        }
    }
    return new Date(dateStr); // Fallback
};

export interface UserPreferences {
    emailNotifications: {
        orderStatus: boolean;
        reservationReminders: boolean;
    };
    promoNewsletters: boolean;
}

export interface User {
    id: number;
    name: string;
    username?: string;
    email: string;
    password?: string; // Should be hashed in a real app
    role: 'admin' | 'customer' | 'cs';
    phone?: string;
    loyaltyPoints?: number;
    savedAddresses?: Address[];
    savedPaymentMethods?: PaymentMethod[];
    preferences?: UserPreferences;
    birthdate?: string; // YYYY-MM-DD
    birthdayRewardClaimed?: boolean;
    dailyCheckinStreak?: number;
    lastCheckinDate?: string; // YYYY-MM-DD
    twoFactorEnabled?: boolean;
    twoFactorCode?: string;      // Current 2FA verification code
    twoFactorExpiry?: string;    // Code expiration time (ISO string)
    avatarUrl?: string | null;
    lastUsernameChange?: string; // ISO string
}


export let mockUsers: User[] = [
    { id: 1, name: 'Admin User', email: 'a.prasetyanaharudin@gmail.com', password: 'password', role: 'admin', avatarUrl: null },
    // Temporary admin for new tenants (until Supabase Auth is integrated)
    { id: 999, name: 'Restaurant Owner', email: 'agung45didi@gmail.com', password: 'password', role: 'admin', avatarUrl: null },
    {
        id: 2,
        name: 'Jessica Wijaya',
        username: 'jessicaw',
        email: 'silaban90edo@gmail.com',
        password: 'password',
        role: 'customer',
        phone: '081234567890',
        loyaltyPoints: 11250,
        avatarUrl: 'https://i.pravatar.cc/150?u=jessica',
        savedAddresses: [
            { id: 1, label: 'Rumah', fullAddress: 'Jl. Merdeka No. 45, Kebayoran Baru', city: 'Jakarta Selatan', postalCode: '12345', notes: 'Pagar warna hitam.' },
            { id: 2, label: 'Kantor', fullAddress: 'Gedung Gemini Lt. 10, Jl. Jenderal Sudirman Kav. 52-53', city: 'Jakarta Pusat', postalCode: '10210' },
        ],
        savedPaymentMethods: [
            { id: 1, type: 'Credit Card', provider: 'Visa', last4: '4242', expiry: '12/25' },
            { id: 2, type: 'E-Wallet', provider: 'GoPay', last4: '', expiry: '' },
        ],
        preferences: {
            emailNotifications: {
                orderStatus: true,
                reservationReminders: true,
            },
            promoNewsletters: false,
        },
        birthdate: `1995-08-17`,
        birthdayRewardClaimed: false,
        dailyCheckinStreak: 3,
        lastCheckinDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0], // Yesterday
        twoFactorEnabled: false,
    },
    {
        id: 3,
        name: 'Budi Hartono',
        email: 'hgheby@gmail.com',
        password: 'customer123',
        role: 'customer',
        loyaltyPoints: 480,
        avatarUrl: null,
        savedAddresses: [],
        savedPaymentMethods: [],
        preferences: {
            emailNotifications: {
                orderStatus: true,
                reservationReminders: false,
            },
            promoNewsletters: true,
        },
        twoFactorEnabled: false,
    },
    { id: 4, name: 'CS Agent', email: 'pawradiserunway@gmail.com', password: 'password', role: 'cs', avatarUrl: null },
    {
        id: 5,
        name: 'Doni Saputra',
        email: 'silaban90edo@gmail.com',
        password: 'password',
        role: 'customer',
        loyaltyPoints: 0,
        avatarUrl: null,
        savedAddresses: [],
        savedPaymentMethods: [],
        preferences: {
            emailNotifications: {
                orderStatus: true,
                reservationReminders: true,
            },
            promoNewsletters: true,
        },
        twoFactorEnabled: false,
    },
];

export const updateUser = (userId: number, updates: Partial<User>): Promise<User | undefined> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const userIndex = mockUsers.findIndex(u => u.id === userId);
            if (userIndex !== -1) {
                const existingUser = mockUsers[userIndex];

                const updatedUser = { ...existingUser, ...updates };

                // Deep merge for preferences if it exists in updates
                if (updates.preferences && existingUser.preferences) {
                    updatedUser.preferences = {
                        ...existingUser.preferences,
                        ...updates.preferences,
                        emailNotifications: {
                            ...existingUser.preferences.emailNotifications,
                            ...(updates.preferences.emailNotifications),
                        }
                    };
                }

                mockUsers[userIndex] = updatedUser;
                resolve(updatedUser);
            } else {
                resolve(undefined);
            }
        }, 800);
    });
};

export const deleteUser = (userId: number): Promise<boolean> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const initialLength = mockUsers.length;
            mockUsers = mockUsers.filter(u => u.id !== userId);
            resolve(mockUsers.length < initialLength);
        }, 500);
    });
};

// ========================================
// BRANCH DATA
// ========================================

export interface Branch {
    id: number;
    name: string;
    address: string;
    city: string;
    area: string;
    mall?: string;
    openingHours: string;
    closingHours: string;
    status: 'Open' | 'Closing Soon' | 'Closed';
    estimatedPickupTime: string;
    coordinates: {
        lat: number;
        lng: number;
    };
}

export const mockBranches: Branch[] = [
    {
        id: 1,
        name: 'DineOS Plaza Indonesia',
        address: 'Plaza Indonesia, Lantai 5, Jl. M.H. Thamrin No.28-30',
        city: 'Jakarta',
        area: 'Central Jakarta',
        mall: 'Plaza Indonesia',
        openingHours: '10:00',
        closingHours: '22:00',
        status: 'Open',
        estimatedPickupTime: '15-20 menit',
        coordinates: { lat: -6.1944, lng: 106.8229 }
    },
    {
        id: 2,
        name: 'DineOS Grand Indonesia',
        address: 'Grand Indonesia Shopping Town, West Mall Lantai 3A',
        city: 'Jakarta',
        area: 'Central Jakarta',
        mall: 'Grand Indonesia',
        openingHours: '10:00',
        closingHours: '22:00',
        status: 'Open',
        estimatedPickupTime: '10-15 menit',
        coordinates: { lat: -6.1953, lng: 106.8227 }
    },
    {
        id: 3,
        name: 'DineOS Senayan City',
        address: 'Senayan City, Lantai 6, Jl. Asia Afrika No.19',
        city: 'Jakarta',
        area: 'South Jakarta',
        mall: 'Senayan City',
        openingHours: '10:00',
        closingHours: '22:00',
        status: 'Closing Soon',
        estimatedPickupTime: '20-25 menit',
        coordinates: { lat: -6.2253, lng: 106.7992 }
    },
    {
        id: 4,
        name: 'DineOS Pondok Indah Mall',
        address: 'Pondok Indah Mall 2, Lantai 2, Jl. Metro Pondok Indah',
        city: 'Jakarta',
        area: 'South Jakarta',
        mall: 'Pondok Indah Mall',
        openingHours: '10:00',
        closingHours: '22:00',
        status: 'Open',
        estimatedPickupTime: '15-20 menit',
        coordinates: { lat: -6.2655, lng: 106.7838 }
    },
    {
        id: 5,
        name: 'DineOS Kelapa Gading',
        address: 'Mall Kelapa Gading 3, Lantai 3, Jl. Boulevard Barat Raya',
        city: 'Jakarta',
        area: 'North Jakarta',
        mall: 'Mall Kelapa Gading',
        openingHours: '10:00',
        closingHours: '22:00',
        status: 'Open',
        estimatedPickupTime: '10-15 menit',
        coordinates: { lat: -6.1588, lng: 106.9008 }
    }
];

export const fetchBranches = (): Promise<Branch[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([...mockBranches]);
        }, 500);
    });
};

export const fetchBranchById = (id: number): Promise<Branch | undefined> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const branch = mockBranches.find(b => b.id === id);
            resolve(branch);
        }, 300);
    });
};

// ========================================
// CATEGORY DATA
// ========================================

export interface Category {
    id: number;
    name: string;
    description?: string;
    slug: string;
}

export let mockCategories: Category[] = (() => {
    const stored = localStorage.getItem('mockCategories');
    return stored ? JSON.parse(stored) : [
        { id: 1, name: 'Hidangan Pembuka', slug: 'hidangan-pembuka', description: 'Makanan pembuka untuk memulai santapan Anda.' },
        { id: 2, name: 'Hidangan Utama', slug: 'hidangan-utama', description: 'Menu andalan kami yang mengenyangkan.' },
        { id: 3, name: 'Hidangan Penutup', slug: 'hidangan-penutup', description: 'Manis-manis untuk mengakhiri makan.' },
        { id: 4, name: 'Minuman', slug: 'minuman', description: 'Berbagai pilihan minuman segar dan hangat.' },
    ];
})();

export const fetchCategories = (): Promise<Category[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([...mockCategories]);
        }, 500);
    });
};

export const addCategory = (categoryData: Omit<Category, 'id'>): Promise<Category> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const nextId = mockCategories.length > 0 ? Math.max(...mockCategories.map(c => c.id)) + 1 : 1;
            const newCategory = { ...categoryData, id: nextId };
            mockCategories.push(newCategory);
            localStorage.setItem('mockCategories', JSON.stringify(mockCategories));
            resolve(newCategory);
        }, 500);
    });
};

export const updateCategory = (id: number, updates: Partial<Omit<Category, 'id'>>): Promise<Category | undefined> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const index = mockCategories.findIndex(c => c.id === id);
            if (index > -1) {
                mockCategories[index] = { ...mockCategories[index], ...updates };
                localStorage.setItem('mockCategories', JSON.stringify(mockCategories));
                resolve(mockCategories[index]);
            } else {
                resolve(undefined);
            }
        }, 500);
    });
};

export const deleteCategory = (id: number): Promise<boolean> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const index = mockCategories.findIndex(c => c.id === id);
            if (index !== -1) {
                mockCategories.splice(index, 1);
                localStorage.setItem('mockCategories', JSON.stringify(mockCategories));
                resolve(true);
            } else {
                resolve(false);
            }
        }, 500);
    });
};

export interface MenuItem {
    id: number;
    name: string;
    description: string;
    price: string;
    category: string;
    image: string;
    images?: string[];
    badge?: string;
    rating?: number;
    cookTime?: string;
    mainIngredient?: string;
    isPromo?: boolean;
    originalPrice?: string;
    promoEndTime?: string; // ISO 8601 date string
    soldCount?: number;
    dietaryTags?: string[];
    // New Apple-grade fields
    calories?: number;
    spicyLevel?: 0 | 1 | 2 | 3; // 0=none, 1=mild, 2=medium, 3=hot
    isVegetarian?: boolean;
    isHalal?: boolean;
    allergens?: string[];
    ingredients?: string[];
    servingInfo?: string;
    prepTime?: string;
    availableBranches?: string[];
    slug: string;
    featuredReview?: {
        author: string;
        text: string;
        avatar?: string;
    };
}

export let menuItems: MenuItem[] = (() => {
    const stored = localStorage.getItem('menuItems');
    return stored ? JSON.parse(stored) : [
        {
            id: 1,
            name: 'Bruschetta al Pomodoro',
            description: 'Roti panggang dengan tomat segar, bawang putih, kemangi, dan minyak zaitun. Klasik Italia abadi yang membawa cita rasa musim panas ke piring Anda.',
            price: 'Rp 65.000',
            category: 'Hidangan Pembuka',
            image: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=800&h=600&fit=crop',
            rating: 4.7,
            cookTime: '~10 mnt',
            mainIngredient: 'Tomat Segar',
            soldCount: 120,
            dietaryTags: ['Ⓥ'],
            slug: 'bruschetta-al-pomodoro',
        },
        {
            id: 2,
            name: 'Calamari Fritti',
            description: 'Cumi-cumi yang digoreng renyah dengan adonan tipis, garing di luar dan lembut di dalam. Disajikan dengan saus marinara pedas.',
            price: 'Rp 85.000',
            category: 'Hidangan Pembuka',
            image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&h=600&fit=crop',
            soldCount: 85,
            dietaryTags: ['🌶'],
            slug: 'calamari-fritti',
        },
        {
            id: 9,
            name: 'Salad Caprese',
            description: 'Salad sederhana dan elegan dari mozzarella segar, tomat matang, dan kemangi manis, dibumbui dengan garam dan minyak zaitun extra-virgin.',
            price: 'Rp 75.000',
            category: 'Hidangan Pembuka',
            image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=800&h=600&fit=crop',
            cookTime: '~5 mnt',
            mainIngredient: 'Mozzarella',
            soldCount: 200,
            dietaryTags: ['Ⓥ', 'GF'],
            slug: 'salad-caprese',
        },
        {
            id: 3,
            name: 'Spaghetti Carbonara',
            description: 'Pasta klasik Romawi dengan kuning telur krim, pancetta yang kaya, keju pecorino yang tajam, dan lada hitam yang baru digiling.',
            price: 'Rp 120.000',
            category: 'Hidangan Utama',
            image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&h=600&fit=crop',
            rating: 4.9,
            cookTime: '~20 mnt',
            mainIngredient: 'Pancetta',
            soldCount: 450,
            slug: 'spaghetti-carbonara',
        },
        {
            id: 4,
            name: 'Pizza Margherita',
            description: 'Pizza Neapolitan klasik, menampilkan kombinasi sempurna dari mozzarella segar, tomat San Marzano, dan kemangi harum.',
            price: 'Rp 110.000',
            category: 'Hidangan Utama',
            image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop',
            soldCount: 500,
            dietaryTags: ['Ⓥ'],
            slug: 'pizza-margherita',
        },
        {
            id: 5,
            name: 'Bistecca alla Fiorentina',
            description: 'Steak Porterhouse panggang yang megah, dibumbui sederhana dengan garam, lada, dan rosemary untuk menonjolkan kualitas dagingnya.',
            price: 'Rp 280.000',
            category: 'Hidangan Utama',
            image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&h=600&fit=crop',
            badge: '✨ Rekomendasi Chef',
            rating: 5.0,
            cookTime: '~25 mnt',
            mainIngredient: 'Daging Sapi',
            soldCount: 50,
            dietaryTags: ['GF'],
            slug: 'bistecca-alla-fiorentina',
        },
        {
            id: 10,
            name: 'Risotto ai Funghi',
            description: 'Nasi Arborio krim yang dimasak perlahan dengan aneka jamur liar, keju Parmesan, dan sedikit minyak truffle putih.',
            price: 'Rp 145.000',
            category: 'Hidangan Utama',
            image: 'https://images.unsplash.com/photo-1637806930600-37fa8892069d?w=800&h=600&fit=crop',
            badge: '🔥 Paling Populer',
            rating: 4.8,
            cookTime: '~30 mnt',
            mainIngredient: 'Jamur Truffle',
            soldCount: 320,
            dietaryTags: ['Ⓥ', 'GF'],
            slug: 'risotto-ai-funghi',
        },
        {
            id: 6,
            name: 'Tiramisu',
            description: 'Hidangan penutup ikonik Italia. Biskuit Savoiardi dicelupkan ke dalam espresso, dilapisi dengan campuran kocok telur, gula, dan keju mascarpone.',
            price: 'Rp 70.000',
            category: 'Hidangan Penutup',
            image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&h=600&fit=crop',
            soldCount: 210,
            slug: 'tiramisu',
        },
        {
            id: 7,
            name: 'Panna Cotta',
            description: 'Krim manis yang lembut dan halus, dikentalkan dengan gelatin dan dicetak. Disajikan dengan coulis buah beri yang cerah dan tajam.',
            price: 'Rp 60.000',
            category: 'Hidangan Penutup',
            image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&h=600&fit=crop',
            soldCount: 150,
            dietaryTags: ['GF'],
            slug: 'panna-cotta',
        },
        {
            id: 8,
            name: 'Espresso',
            description: 'Kopi pekat penuh rasa yang disajikan dalam "shots". Penutup sempurna untuk setiap hidangan Italia.',
            price: 'Rp 30.000',
            category: 'Minuman',
            image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800&h=600&fit=crop',
            soldCount: 600,
            dietaryTags: ['Ⓥ', 'GF'],
            slug: 'espresso',
        },
        // Promo Items
        {
            id: 11,
            name: 'Spaghetti Carbonara',
            description: 'Pasta klasik Romawi dengan kuning telur krim, pancetta yang kaya, keju pecorino yang tajam, dan lada hitam yang baru digiling.',
            price: 'Rp 90.000',
            originalPrice: 'Rp 120.000',
            category: 'Hidangan Utama',
            image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&h=600&fit=crop',
            rating: 4.9,
            cookTime: '~20 mnt',
            mainIngredient: 'Pancetta',
            isPromo: true,
            badge: '🎉 Diskon 25%',
            promoEndTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
            soldCount: 450,
            // New fields
            calories: 580,
            spicyLevel: 0,
            isVegetarian: false,
            isHalal: false,
            allergens: ['Gluten', 'Dairy', 'Eggs'],
            ingredients: ['Spaghetti', 'Pancetta', 'Egg Yolks', 'Pecorino Romano', 'Black Pepper', 'Salt'],
            servingInfo: 'Best served immediately while hot. Garnish with extra pecorino and black pepper.',
            prepTime: '15-20 minutes',
            availableBranches: ['Jakarta Pusat', 'Bandung', 'Surabaya'],
            slug: 'spaghetti-carbonara-promo',
            featuredReview: {
                author: "Jessica W.",
                text: "Carbonara terbaik yang pernah saya coba di Jakarta! Creamy tapi ga bikin eneg.",
                avatar: "https://i.pravatar.cc/150?u=jessica"
            }
        },
        {
            id: 12,
            name: 'Pizza Margherita',
            description: 'Pizza Neapolitan klasik, menampilkan kombinasi sempurna dari mozzarella segar, tomat San Marzano, dan kemangi harum.',
            price: 'Rp 85.000',
            originalPrice: 'Rp 110.000',
            category: 'Hidangan Utama',
            image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop',
            isPromo: true,
            badge: '🎉 Diskon 23%',
            promoEndTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(), // 5 hours from now
            soldCount: 500,
            dietaryTags: ['Ⓥ'],
            slug: 'pizza-margherita-promo',
        },
        {
            id: 13,
            name: 'Tiramisu',
            description: 'Hidangan penutup ikonik Italia. Biskuit Savoiardi dicelupkan ke dalam espresso, dilapisi dengan campuran kocok telur, gula, dan keju mascarpone.',
            price: 'Rp 50.000',
            originalPrice: 'Rp 70.000',
            category: 'Hidangan Penutup',
            image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&h=600&fit=crop',
            isPromo: true,
            badge: '🎉 Diskon 29%',
            promoEndTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
            soldCount: 210,
            // New fields
            calories: 450,
            spicyLevel: 0,
            isVegetarian: true,
            isHalal: false,
            allergens: ['Gluten', 'Dairy', 'Eggs', 'Caffeine'],
            ingredients: ['Ladyfinger Biscuits', 'Espresso', 'Mascarpone', 'Eggs', 'Sugar', 'Cocoa Powder'],
            servingInfo: 'Best served chilled. Contains caffeine from espresso.',
            prepTime: '30 minutes + 4 hours chilling',
            availableBranches: ['Jakarta Pusat', 'Bandung', 'Surabaya', 'Yogyakarta'],
            slug: 'tiramisu-promo',
        },
        {
            id: 14,
            name: 'Bruschetta al Pomodoro',
            description: 'Roti panggang dengan tomat segar, bawang putih, kemangi, dan minyak zaitun. Klasik Italia abadi yang membawa cita rasa musim panas ke piring Anda.',
            price: 'Rp 45.000',
            originalPrice: 'Rp 65.000',
            category: 'Hidangan Pembuka',
            image: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=800&h=600&fit=crop',
            rating: 4.7,
            cookTime: '~10 mnt',
            mainIngredient: 'Tomat Segar',
            isPromo: true,
            badge: '🎉 Diskon 31%',
            promoEndTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours from now
            soldCount: 120,
            dietaryTags: ['Ⓥ'],
            slug: 'bruschetta-al-pomodoro-promo',
        },
    ];
})();

// Simulate API calls
export const fetchMenuItems = (): Promise<MenuItem[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([...menuItems]);
        }, 500); // Simulate 0.5 second delay
    });
};

export const fetchPromoMenuItems = (): Promise<MenuItem[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const promoItems = menuItems.filter(item => item.isPromo);
            resolve(promoItems);
        }, 500);
    });
};

// Favorites Data
let mockUserFavorites: { userId: number; menuItemIds: number[] }[] = [
    { userId: 2, menuItemIds: [1, 3, 6] }, // Jessica's favorites
];



export const fetchUserFavoriteIds = (userId: number): Promise<number[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const userFavs = mockUserFavorites.find(f => f.userId === userId);
            resolve(userFavs ? [...userFavs.menuItemIds] : []);
        }, 300);
    });
};

export const fetchUserFavorites = (userId: number): Promise<MenuItem[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const userFavs = mockUserFavorites.find(f => f.userId === userId);
            if (!userFavs) {
                resolve([]);
                return;
            }
            const favoriteItems = menuItems.filter(item => userFavs.menuItemIds.includes(item.id));
            resolve(favoriteItems);
        }, 300);
    });
};

export const addUserFavorite = (userId: number, menuItemId: number): Promise<boolean> => {
    return new Promise(resolve => {
        setTimeout(() => {
            let userFavs = mockUserFavorites.find(f => f.userId === userId);
            if (!userFavs) {
                userFavs = { userId, menuItemIds: [] };
                mockUserFavorites.push(userFavs);
            }
            if (!userFavs.menuItemIds.includes(menuItemId)) {
                userFavs.menuItemIds.push(menuItemId);
            }
            resolve(true);
        }, 300);
    });
};

export const removeUserFavorite = (userId: number, menuItemId: number): Promise<boolean> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const userFavs = mockUserFavorites.find(f => f.userId === userId);
            if (userFavs) {
                userFavs.menuItemIds = userFavs.menuItemIds.filter(id => id !== menuItemId);
            }
            resolve(true);
        }, 300);
    });
};

export const fetchMenuItemById = (id: number): Promise<MenuItem | undefined> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const item = menuItems.find(item => item.id === id);
            resolve(item);
        }, 500);
    });
};

export const fetchMenuItemBySlug = (slug: string): Promise<MenuItem | undefined> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const item = menuItems.find(item => item.slug === slug);
            resolve(item);
        }, 500);
    });
};

export const addMenuItem = (itemData: Omit<MenuItem, 'id'>): Promise<MenuItem> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const nextId = menuItems.length > 0 ? Math.max(...menuItems.map(item => item.id)) + 1 : 1;
            const newItem: MenuItem = { ...itemData, id: nextId };
            menuItems.push(newItem);
            localStorage.setItem('menuItems', JSON.stringify(menuItems));
            resolve(newItem);
        }, 500);
    });
};

export const updateMenuItem = (id: number, updates: Partial<Omit<MenuItem, 'id'>>): Promise<MenuItem | undefined> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const itemIndex = menuItems.findIndex(item => item.id === id);
            if (itemIndex > -1) {
                menuItems[itemIndex] = { ...menuItems[itemIndex], ...updates };
                localStorage.setItem('menuItems', JSON.stringify(menuItems));
                resolve(menuItems[itemIndex]);
            } else {
                resolve(undefined);
            }
        }, 500);
    });
};

export const deleteMenuItem = (id: number): Promise<boolean> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const index = menuItems.findIndex(item => item.id === id);
            if (index !== -1) {
                menuItems.splice(index, 1);
                localStorage.setItem('menuItems', JSON.stringify(menuItems));
                resolve(true);
            } else {
                resolve(false);
            }
        }, 500);
    });
};

// ========================================
// PROMO CODE DATA
// ========================================

export interface PromoCode {
    code: string;
    discountType: 'percentage' | 'fixed' | 'free_delivery' | 'delivery_discount';
    discountValue: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    description: string;
}

// Helper to get codes from storage
const getStoredPromoCodes = (): PromoCode[] => {
    try {
        const stored = localStorage.getItem('mockPromoCodes');
        if (stored) return JSON.parse(stored);
    } catch (e) {
        console.error('Error reading promo codes from storage:', e);
    }
    // Default data if storage is empty or invalid
    const defaults: PromoCode[] = [
        {
            code: 'HEMAT10',
            discountType: 'percentage',
            discountValue: 10,
            minOrderAmount: 50000,
            maxDiscountAmount: 20000,
            description: 'Diskon 10% untuk pesanan di atas Rp 50.000'
        },
        {
            code: 'DISKON50',
            discountType: 'fixed',
            discountValue: 50000,
            minOrderAmount: 200000,
            description: 'Potongan Rp 50.000 untuk pesanan di atas Rp 200.000'
        },
        {
            code: 'DINEOS25',
            discountType: 'percentage',
            discountValue: 25,
            minOrderAmount: 100000,
            maxDiscountAmount: 50000,
            description: 'Diskon Spesial 25%'
        }
    ];
    // Initialize storage with defaults
    localStorage.setItem('mockPromoCodes', JSON.stringify(defaults));
    return defaults;
};

export let mockPromoCodes: PromoCode[] = getStoredPromoCodes();

export const fetchPromoCodes = (): Promise<PromoCode[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const codes = getStoredPromoCodes();
            // Update the exported variable just in case
            mockPromoCodes = codes;
            resolve(codes);
        }, 500);
    });
};

export const addPromoCode = (promoData: PromoCode): Promise<PromoCode> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                const codes = getStoredPromoCodes();
                codes.push(promoData);
                localStorage.setItem('mockPromoCodes', JSON.stringify(codes));
                mockPromoCodes = codes;
                resolve(promoData);
            } catch (e) {
                console.error('Error adding promo code:', e);
                reject(e);
            }
        }, 500);
    });
};

export const deletePromoCode = (code: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                const codes = getStoredPromoCodes();
                console.log('Attempting to delete:', code);
                console.log('Current codes:', codes);
                const index = codes.findIndex(p => p.code === code);
                console.log('Found index:', index);

                if (index !== -1) {
                    codes.splice(index, 1);
                    localStorage.setItem('mockPromoCodes', JSON.stringify(codes));
                    mockPromoCodes = codes;
                    console.log('Delete successful. New codes:', codes);
                    resolve(true);
                } else {
                    console.warn('Code not found:', code);
                    resolve(false);
                }
            } catch (e) {
                console.error('Error deleting promo code:', e);
                reject(e);
            }
        }, 500);
    });
};

export const validatePromoCode = (code: string): Promise<PromoCode | null> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const promo = mockPromoCodes.find(p => p.code === code.toUpperCase());
            resolve(promo || null);
        }, 500);
    });
};

export const getSortScore = (item: MenuItem): number => {
    let score = 0;
    if (item.isPromo) score += 10;
    if (item.rating && item.rating >= 4.5) score += 5;
    if (item.soldCount && item.soldCount > 100) score += 3;
    return score;
};

// Customer Data

// Internal representation of an order item, storing only the ID.
interface OrderItemStub {
    menuItemId: number;
    quantity: number;
}
// Internal representation of an order, storing only item IDs.
interface OrderStub {
    id: number;
    customerId: number;
    orderNumber: string;
    date: string;
    status: 'Menunggu Konfirmasi' | 'Diproses' | 'Siap Diambil' | 'Selesai' | 'Dibatalkan';
    total: string;
    items: OrderItemStub[];
    type: 'Dine In' | 'Take Away' | 'Delivery';
    deliveryAddress?: Address;
    paymentMethod: PaymentMethod;
    tableNumber?: string;
    pickupTime?: string;
}

// Public-facing representation of an order item, with the full MenuItem object.
export interface OrderItem {
    menuItem: MenuItem;
    quantity: number;
}
// Public-facing representation of an order, with full MenuItem objects.
export interface Order {
    id: number;
    customerId: number;
    orderNumber: string;
    date: string;
    status: 'Menunggu Konfirmasi' | 'Diproses' | 'Siap Diambil' | 'Selesai' | 'Dibatalkan';
    total: string;
    items: OrderItem[];
    type: 'Dine In' | 'Take Away' | 'Delivery';
    deliveryAddress?: Address;
    paymentMethod: PaymentMethod;
    tableNumber?: string;
    pickupTime?: string;
}

export interface Reservation {
    id: number;
    customerId: number;
    reservationNumber: string;
    date: string;
    time: string;
    partySize: number;
    status: 'Dikonfirmasi' | 'Selesai' | 'Dibatalkan';
    specialRequests?: string;
}

// Store orders with only IDs to prevent module-load time errors.
let mockOrders: OrderStub[] = [
    // Active Orders for Demo
    {
        id: 101,
        customerId: 2,
        orderNumber: 'ORD-20240730-001',
        date: 'Hari Ini',
        status: 'Diproses',
        total: 'Rp 145.000',
        items: [
            { menuItemId: 10, quantity: 1 }, // Risotto
        ],
        type: 'Delivery',
        deliveryAddress: { id: 1, label: 'Rumah', fullAddress: 'Jl. Merdeka No. 45, Kebayoran Baru', city: 'Jakarta Selatan', postalCode: '12345' },
        paymentMethod: { id: 1, type: 'E-Wallet', provider: 'GoPay', last4: '' }
    },
    {
        id: 102,
        customerId: 2,
        orderNumber: 'ORD-20240730-002',
        date: 'Hari Ini',
        status: 'Diproses',
        total: 'Rp 65.000',
        items: [
            { menuItemId: 1, quantity: 1 }, // Bruschetta
        ],
        type: 'Dine In',
        tableNumber: '05',
        paymentMethod: { id: 99, type: 'Cash' as any, provider: 'Di Kasir', last4: '' }
    },
    {
        id: 103,
        customerId: 2,
        orderNumber: 'ORD-20240730-003',
        date: 'Hari Ini',
        status: 'Diproses',
        total: 'Rp 30.000',
        items: [
            { menuItemId: 8, quantity: 1 }, // Espresso
        ],
        type: 'Take Away',
        pickupTime: '14:00',
        paymentMethod: { id: 100, type: 'E-Wallet', provider: 'OVO', last4: '' }
    },
    // Past Orders
    {
        id: 1,
        customerId: 2, // Corresponds to Jessica Wijaya
        orderNumber: 'ORD-20240728-001',
        date: '28 Juli 2024',
        status: 'Selesai',
        total: 'Rp 190.000',
        items: [
            { menuItemId: 3, quantity: 1 }, // Spaghetti Carbonara
            { menuItemId: 6, quantity: 1 }, // Tiramisu
        ],
        type: 'Dine In',
        tableNumber: '15A',
        paymentMethod: { id: 1, type: 'E-Wallet', provider: 'GoPay', last4: '' }
    },
    {
        id: 2,
        customerId: 2,
        orderNumber: 'ORD-20240725-002',
        date: '25 Juli 2024',
        status: 'Selesai',
        total: 'Rp 230.000',
        items: [
            { menuItemId: 1, quantity: 1 }, // Bruschetta al Pomodoro
            { menuItemId: 10, quantity: 1 }, // Risotto ai Funghi
        ],
        type: 'Take Away',
        pickupTime: '19:30',
        paymentMethod: { id: 2, type: 'Credit Card', provider: 'Visa', last4: '4242' }
    },
    {
        id: 3,
        customerId: 2,
        orderNumber: 'ORD-20240720-003',
        date: '20 Juli 2024',
        status: 'Dibatalkan',
        total: 'Rp 85.000',
        items: [
            { menuItemId: 2, quantity: 1 }, // Calamari Fritti
        ],
        type: 'Delivery',
        deliveryAddress: { id: 1, label: 'Rumah', fullAddress: 'Jl. Merdeka No. 45', city: 'Jakarta', postalCode: '12345' },
        paymentMethod: { id: 2, type: 'E-Wallet', provider: 'GoPay', last4: '' }
    },
    // Orders for Budi Hartono
    {
        id: 4,
        customerId: 3,
        orderNumber: 'ORD-20240729-001',
        date: '29 Juli 2024',
        status: 'Selesai',
        total: 'Rp 110.000',
        items: [{ menuItemId: 4, quantity: 1 }], // Pizza Margherita
        type: 'Dine In',
        tableNumber: '12',
        paymentMethod: { id: 1, type: 'E-Wallet', provider: 'GoPay', last4: '' }
    }
];

// Initialize from localStorage if available
try {
    const stored = localStorage.getItem('dineos_orders');
    if (stored) {
        mockOrders = JSON.parse(stored);
    } else {
        // Save initial mock data to storage
        localStorage.setItem('dineos_orders', JSON.stringify(mockOrders));
    }
} catch (e) {
    console.error("Failed to load orders from storage", e);
}

const saveOrders = () => {
    try {
        localStorage.setItem('dineos_orders', JSON.stringify(mockOrders));
        // Dispatch a custom event to notify other tabs/components if needed
        window.dispatchEvent(new Event('storage'));
    } catch (e) {
        console.error("Failed to save orders to storage", e);
    }
};

let mockReservations: Reservation[] = [
    { id: 1, customerId: 2, reservationNumber: 'RES-20240725-003', date: '25 Juli 2024', time: '19:00', partySize: 2, status: 'Dikonfirmasi' },
    { id: 2, customerId: 2, reservationNumber: 'RES-20240615-012', date: '15 Juni 2024', time: '18:30', partySize: 4, status: 'Selesai' },
    { id: 3, customerId: 2, reservationNumber: 'RES-20240510-007', date: '10 Mei 2024', time: '20:00', partySize: 2, status: 'Dibatalkan' },
];

// Helper to hydrate OrderStub to Order
const hydrateOrder = (stub: OrderStub): Order => {
    return {
        ...stub,
        items: stub.items.map(item => {
            const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
            // Placeholder for deleted items
            const finalMenuItem = menuItem || { id: -1, name: 'Item Dihapus', price: 'Rp 0', description: '', category: 'Minuman' as const, image: '', slug: 'deleted-item' };
            return {
                quantity: item.quantity,
                menuItem: finalMenuItem
            };
        })
    };
};

export const fetchOrdersByCustomerId = (customerId: number): Promise<Order[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            // Re-read from storage to ensure we have the latest data from other tabs
            const stored = localStorage.getItem('dineos_orders');
            if (stored) {
                mockOrders = JSON.parse(stored);
            }

            const customerOrders = mockOrders.filter(o => o.customerId === customerId);
            const hydratedOrders = customerOrders.map(hydrateOrder);
            resolve(hydratedOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }, 600);
    });
};

export const fetchAllOrders = (): Promise<Order[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            // Re-read from storage to ensure we have the latest data from other tabs
            const stored = localStorage.getItem('dineos_orders');
            if (stored) {
                mockOrders = JSON.parse(stored);
            }

            const hydratedOrders = mockOrders.map(hydrateOrder);
            resolve(hydratedOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }, 600);
    });
};

export const addOrder = (customerId: number, orderDetails: Omit<Order, 'id' | 'customerId' | 'orderNumber' | 'date' | 'status' | 'paymentStatus'>): Promise<Order> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const nextId = mockOrders.length > 0 ? Math.max(...mockOrders.map(o => o.id)) + 1 : 1;
            const date = new Date();
            const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
            const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

            const newOrderStub: OrderStub = {
                id: nextId,
                customerId,
                orderNumber: `ORD-${dateStr}-${randomSuffix}`,
                date: date.toISOString(),
                status: 'Menunggu Konfirmasi',
                total: orderDetails.total,
                type: orderDetails.type,
                paymentMethod: orderDetails.paymentMethod,
                deliveryAddress: orderDetails.deliveryAddress,
                tableNumber: orderDetails.tableNumber,
                pickupTime: orderDetails.pickupTime,
                items: orderDetails.items.map(item => ({
                    menuItemId: item.menuItem.id,
                    quantity: item.quantity
                }))
            };

            mockOrders.unshift(newOrderStub);
            saveOrders();

            resolve(hydrateOrder(newOrderStub));
        }, 800);
    });
};

export const updateOrderStatus = (orderId: number, status: Order['status']): Promise<boolean> => {
    return new Promise(resolve => {
        setTimeout(() => {
            // Re-read from storage
            const stored = localStorage.getItem('dineos_orders');
            if (stored) {
                mockOrders = JSON.parse(stored);
            }

            const order = mockOrders.find(o => o.id === orderId);
            if (order) {
                order.status = status;
                saveOrders();
                resolve(true);
            } else {
                resolve(false);
            }
        }, 500);
    });
};

export const cancelOrder = (orderId: number): Promise<boolean> => {
    return new Promise(resolve => {
        setTimeout(() => {
            // Re-read from storage
            const stored = localStorage.getItem('dineos_orders');
            if (stored) {
                mockOrders = JSON.parse(stored);
            }

            const order = mockOrders.find(o => o.id === orderId);
            if (order) {
                order.status = 'Dibatalkan';
                saveOrders();
                resolve(true);
            } else {
                resolve(false);
            }
        }, 500);
    });
};

export const fetchReservationsByCustomerId = (customerId: number): Promise<Reservation[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const reservations = mockReservations.filter(r => r.customerId === customerId);
            resolve(reservations);
        }, 800);
    });
};

export const addReservation = (customerId: number, details: Omit<Reservation, 'id' | 'customerId' | 'reservationNumber' | 'status'>): Promise<Reservation> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const newId = Math.max(...mockReservations.map(r => r.id), 0) + 1;
            const datePart = details.date.split(' ').join('').slice(0, 10);
            const newReservation: Reservation = {
                ...details,
                id: newId,
                customerId,
                reservationNumber: `RES-${datePart}-${String(newId).padStart(3, '0')}`,
                status: 'Dikonfirmasi',
            };
            mockReservations.unshift(newReservation); // Add to the top of the list
            resolve(newReservation);
        }, 800);
    });
};


// Loyalty Program Data
export interface LoyaltyReward {
    id: number;
    title: string;
    description: string;
    pointsRequired: number;
    image: string;
    category: 'Makanan & Minuman' | 'Diskon & Voucher' | 'Pengalaman';
}

export interface PointTransaction {
    id: number;
    customerId: number;
    description: string;
    points: number; // positive for earned, negative for spent
    date: string;
}

export interface Mission {
    id: number;
    title: string;
    progress: number;
    goal: number;
    points: number;
    completed: boolean;
    claimed: boolean;
}


export interface UserReward {
    id: number;
    userId: number;
    rewardId: number;
    code: string;
    status: 'Active' | 'Used' | 'Expired';
    redeemedAt: string;
    expiryDate: string;
}

export let mockUserRewards: UserReward[] = (() => {
    const stored = localStorage.getItem('mockUserRewards');
    return stored ? JSON.parse(stored) : [];
})();

export const fetchUserRewards = (userId: number): Promise<UserReward[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            // Clean up expired and used rewards
            const now = new Date();
            mockUserRewards = mockUserRewards.filter(reward => {
                const isExpired = new Date(reward.expiryDate) < now;
                const isUsed = reward.status === 'Used';
                // Keep rewards that belong to other users or are still active
                return reward.userId !== userId || (!isExpired && !isUsed);
            });

            // Save cleaned up data back to localStorage
            localStorage.setItem('mockUserRewards', JSON.stringify(mockUserRewards));

            // Return only this user's active rewards
            const userActiveRewards = mockUserRewards.filter(r => r.userId === userId);
            resolve(userActiveRewards.sort((a, b) => new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime()));
        }, 600);
    });
};

export const redeemReward = (userId: number, rewardId: number): Promise<{ success: boolean; message: string; reward?: UserReward }> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const userIndex = mockUsers.findIndex(u => u.id === userId);
            const reward = mockRewards.find(r => r.id === rewardId);

            if (userIndex === -1 || !reward) {
                resolve({ success: false, message: 'User or Reward not found' });
                return;
            }

            const user = mockUsers[userIndex];
            if ((user.loyaltyPoints || 0) < reward.pointsRequired) {
                resolve({ success: false, message: 'Poin tidak cukup' });
                return;
            }

            // Deduct points
            user.loyaltyPoints = (user.loyaltyPoints || 0) - reward.pointsRequired;

            // Create transaction record
            const newTransaction: PointTransaction = {
                id: Date.now(),
                customerId: userId,
                description: `Redeem: ${reward.title}`,
                points: -reward.pointsRequired,
                date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
            };
            mockPointTransactions.unshift(newTransaction);

            // Create User Reward
            const newUserReward: UserReward = {
                id: Date.now(),
                userId,
                rewardId,
                code: `DINEOS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                status: 'Active',
                redeemedAt: new Date().toISOString(),
                expiryDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString() // 30 days expiry
            };
            mockUserRewards.unshift(newUserReward);

            // Persist changes
            localStorage.setItem('mockUserRewards', JSON.stringify(mockUserRewards));
            // Note: mockUsers is in-memory but initialized from code. In a real app we'd save user state too.
            // For this mock setup, we rely on the fact that mockUsers is exported and mutable.
            // However, to be safe with our AuthContext reload logic, we should probably persist mockUsers if we were fully simulating a backend.
            // But since we just fixed AuthContext to read from mockUsers, modifying the in-memory mockUsers array is sufficient for the current session.

            resolve({ success: true, message: 'Berhasil menukar poin', reward: newUserReward });
        }, 800);
    });
};


export interface Achievement {
    id: number;
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
}

export interface FaqItem {
    id: number;
    question: string;
    answer: string;
}

const mockRewards: LoyaltyReward[] = [
    { id: 1, title: 'Gratis Espresso', description: 'Tukarkan poin untuk secangkir espresso klasik.', pointsRequired: 200, image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&h=300&fit=crop', category: 'Makanan & Minuman' },
    { id: 2, title: 'Diskon 10%', description: 'Dapatkan diskon 10% untuk total tagihan Anda.', pointsRequired: 500, image: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=400&h=300&fit=crop', category: 'Diskon & Voucher' },
    { id: 3, title: 'Gratis Hidangan Pembuka', description: 'Pilih hidangan pembuka apa pun dari menu kami.', pointsRequired: 750, image: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400&h=300&fit=crop', category: 'Makanan & Minuman' },
    { id: 4, title: 'Voucher Rp 100.000', description: 'Gunakan voucher ini untuk pesanan Anda berikutnya.', pointsRequired: 1000, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop', category: 'Diskon & Voucher' },
    { id: 5, title: 'Wine Pairing Gratis', description: 'Sempurnakan hidangan utama Anda dengan wine pilihan.', pointsRequired: 1500, image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop', category: 'Pengalaman' },
    { id: 6, title: 'Akses VIP Jazz Night', description: 'Dapatkan 2 tiket eksklusif untuk malam jazz spesial.', pointsRequired: 2500, image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400&h=300&fit=crop', category: 'Pengalaman' },
];

let mockPointTransactions: PointTransaction[] = [
    { id: 5, customerId: 2, description: 'Poin dari Reservasi #RES-20240728-005', points: 200, date: '28 Jul' },
    { id: 4, customerId: 2, description: 'Tukar Voucher Rp100.000', points: -1000, date: '25 Jul' },
    { id: 3, customerId: 2, description: 'Poin dari Ulasan Menu', points: 50, date: '24 Jul' },
    { id: 2, customerId: 2, description: 'Poin dari Pesanan #ORD-20240720-003', points: 460, date: '20 Jul' },
    { id: 1, customerId: 2, description: 'Bonus Selamat Datang', points: 100, date: '19 Jul' },
];

let mockMissions: Mission[] = [
    { id: 1, title: 'Tulis 3 Ulasan Menu', progress: 1, goal: 3, points: 150, completed: false, claimed: false },
    { id: 2, title: 'Pesan dari 2 Kategori Berbeda', progress: 2, goal: 2, points: 100, completed: true, claimed: false },
    { id: 3, title: 'Check-in di Akhir Pekan', progress: 0, goal: 1, points: 200, completed: false, claimed: false },
    { id: 4, title: 'Coba Menu Rekomendasi Chef', progress: 1, goal: 1, points: 120, completed: true, claimed: true },
];

const mockAchievements: Achievement[] = [
    { id: 1, title: 'Petualang Rasa', description: 'Coba 5 menu utama yang berbeda.', icon: '🍲', unlocked: true },
    { id: 2, title: 'Kritikus Andal', description: 'Tulis ulasan pertamamu.', icon: '✍️', unlocked: true },
    { id: 3, title: 'Pesan Perdana', description: 'Selesaikan pesanan pertamamu.', icon: '🎉', unlocked: true },
    { id: 4, title: 'Spesialis Pasta', description: 'Pesan 3 jenis pasta yang berbeda.', icon: '🍝', unlocked: false },
    { id: 5, title: 'Langganan Akhir Pekan', description: 'Berkunjung 3 kali di akhir pekan.', icon: '☀️', unlocked: false },
    { id: 6, title: 'Kolektor Hidangan Pembuka', description: 'Coba semua hidangan pembuka.', icon: '🍤', unlocked: false },
    { id: 7, title: 'Manis Manja', description: 'Coba semua hidangan penutup.', icon: '🍰', unlocked: false },
    { id: 8, title: 'Member Setia', description: 'Menjadi member selama 1 bulan.', icon: '📅', unlocked: true },
];

const mockFaqItems: FaqItem[] = [
    { id: 1, question: "Bagaimana cara mendapatkan poin?", answer: "Anda mendapatkan poin untuk setiap transaksi, reservasi, penulisan ulasan, dan saat menyelesaikan misi mingguan. Setiap pembelanjaan Rp 10.000 setara dengan 10 poin." },
    { id: 2, question: "Apakah poin saya bisa hangus?", answer: "Ya, sebagian poin Anda mungkin memiliki masa berlaku. Poin yang akan hangus akan ditampilkan di dasbor Anda untuk mengingatkan Anda agar segera menggunakannya." },
    { id: 3, question: "Bagaimana cara menukarkan hadiah?", answer: "Pilih hadiah yang Anda inginkan dari katalog, klik 'Tukar', lalu konfirmasi. Anda akan menerima kode voucher unik yang bisa Anda tunjukkan di kasir atau gunakan saat checkout online." },
    { id: 4, question: "Apa keuntungan naik level?", answer: "Setiap level (Bronze, Silver, Gold, Platinum) memberikan keuntungan yang lebih besar, seperti bonus perolehan poin yang lebih tinggi, hadiah ulang tahun eksklusif, dan akses ke acara khusus." },
];

export const fetchRewards = (): Promise<LoyaltyReward[]> => {
    return new Promise(resolve => {
        setTimeout(() => resolve(mockRewards), 800);
    });
};

export const fetchPointTransactionsByCustomerId = (customerId: number): Promise<PointTransaction[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const transactions = mockPointTransactions.filter(t => t.customerId === customerId);
            resolve(transactions);
        }, 1000);
    });
};

export const fetchMissions = (customerId: number): Promise<Mission[]> => {
    return new Promise(resolve => {
        setTimeout(() => resolve(JSON.parse(JSON.stringify(mockMissions))), 600);
    });
};

export const fetchAchievements = (customerId: number): Promise<Achievement[]> => {
    return new Promise(resolve => {
        setTimeout(() => resolve(JSON.parse(JSON.stringify(mockAchievements))), 700);
    });
};

export const fetchFaqItems = (): Promise<FaqItem[]> => {
    return new Promise(resolve => {
        setTimeout(() => resolve(mockFaqItems), 500);
    });
};


// Customer Address & Payment Management
let nextAddressId = 3;
let nextPaymentMethodId = 3;

export const addAddress = (userId: number, address: Omit<Address, 'id'>): Promise<Address> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const user = mockUsers.find(u => u.id === userId);
            const newAddress = { ...address, id: nextAddressId++ };
            if (user && user.savedAddresses) {
                user.savedAddresses.push(newAddress);
            }
            resolve(newAddress);
        }, 500);
    });
}

export const updateAddress = (userId: number, addressId: number, updates: Partial<Omit<Address, 'id'>>): Promise<Address | undefined> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const user = mockUsers.find(u => u.id === userId);
            if (user && user.savedAddresses) {
                const addressIndex = user.savedAddresses.findIndex(a => a.id === addressId);
                if (addressIndex !== -1) {
                    const updatedAddress = { ...user.savedAddresses[addressIndex], ...updates };
                    user.savedAddresses[addressIndex] = updatedAddress;
                    resolve(updatedAddress);
                } else {
                    resolve(undefined);
                }
            } else {
                resolve(undefined);
            }
        }, 500);
    });
};

export const deleteAddress = (userId: number, addressId: number): Promise<boolean> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const user = mockUsers.find(u => u.id === userId);
            if (user && user.savedAddresses) {
                user.savedAddresses = user.savedAddresses.filter(a => a.id !== addressId);
                resolve(true);
            }
            resolve(false);
        }, 500);
    });
}

export const addPaymentMethod = (userId: number, paymentMethod: Omit<PaymentMethod, 'id'>): Promise<PaymentMethod> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const user = mockUsers.find(u => u.id === userId);
            const newPaymentMethod = { ...paymentMethod, id: nextPaymentMethodId++ };
            if (user && user.savedPaymentMethods) {
                user.savedPaymentMethods.push(newPaymentMethod);
            }
            resolve(newPaymentMethod);
        }, 500);
    });
}

export const updatePaymentMethod = (userId: number, paymentMethodId: number, updates: Partial<Omit<PaymentMethod, 'id'>>): Promise<PaymentMethod | undefined> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const user = mockUsers.find(u => u.id === userId);
            if (user && user.savedPaymentMethods) {
                const paymentIndex = user.savedPaymentMethods.findIndex(p => p.id === paymentMethodId);
                if (paymentIndex !== -1) {
                    const updatedPayment = { ...user.savedPaymentMethods[paymentIndex], ...updates };
                    user.savedPaymentMethods[paymentIndex] = updatedPayment;
                    resolve(updatedPayment);
                } else {
                    resolve(undefined);
                }
            } else {
                resolve(undefined);
            }
        }, 500);
    });
}

export const deletePaymentMethod = (userId: number, paymentMethodId: number): Promise<boolean> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const user = mockUsers.find(u => u.id === userId);
            if (user && user.savedPaymentMethods) {
                user.savedPaymentMethods = user.savedPaymentMethods.filter(p => p.id !== paymentMethodId);
                resolve(true);
            }
            resolve(false);
        }, 500);
    });
}


// --- Active Sessions ---
export interface UserSession {
    id: string;
    userId: number;
    device: string; // "Chrome on Windows", "Safari on iPhone"
    location: string; // "Jakarta, ID"
    lastActive: string; // ISO string
    isCurrent: boolean;
}

let mockSessions: UserSession[] = [
    { id: 'session-1', userId: 2, device: 'Chrome on Windows', location: 'Jakarta, ID', lastActive: new Date().toISOString(), isCurrent: true },
    { id: 'session-2', userId: 2, device: 'Safari on iPhone', location: 'Bandung, ID', lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), isCurrent: false },
    { id: 'session-3', userId: 2, device: 'Firefox on macOS', location: 'Surabaya, ID', lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), isCurrent: false },
];

export const fetchUserSessions = (userId: number): Promise<UserSession[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(mockSessions.filter(s => s.userId === userId));
        }, 500);
    });
};

export const deleteUserSession = (userId: number, sessionId: string): Promise<boolean> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const initialLength = mockSessions.length;
            mockSessions = mockSessions.filter(s => !(s.userId === userId && s.id === sessionId));
            resolve(mockSessions.length < initialLength);
        }, 500);
    });
};

export const deleteAllOtherUserSessions = (userId: number): Promise<boolean> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const initialLength = mockSessions.length;
            mockSessions = mockSessions.filter(s => s.userId !== userId || s.isCurrent);
            resolve(mockSessions.length < initialLength);
        }, 500);
    });
}



// New data for Smart Dining Dashboard
export interface PromotionBanner {
    id: number;
    title: string;
    subtitle: string;
    image: string;
    cta: {
        text: string;
        link: string;
    }
}

const mockPromotions: PromotionBanner[] = [
    { id: 1, title: '🍂 Spesial Musim Gugur', subtitle: 'Manjakan diri dengan Panna Cotta labu kami.', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=1200&h=600&fit=crop', cta: { text: 'Coba Sekarang 🍰', link: '/akun/menu' } },
    { id: 2, title: '🍣 Menu Baru: Salmon Truffle Roll', subtitle: 'Rasakan perpaduan salmon segar dengan aroma truffle yang mewah.', image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=1200&h=600&fit=crop', cta: { text: 'Lihat Menu', link: '/akun/menu' } },
    { id: 3, title: '🎶 Live Jazz Night Setiap Sabtu!', subtitle: 'Nikmati malam Anda dengan alunan musik jazz dan hidangan spesial.', image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200&h=600&fit=crop', cta: { text: 'Reservasi Meja', link: '/akun/reservasi/buat' } },
];

export const fetchPromotions = (): Promise<PromotionBanner[]> => {
    return new Promise(resolve => setTimeout(() => resolve(mockPromotions), 700));
}



export const fetchForYouRecommendations = (userId: number): Promise<MenuItem[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const userOrders = mockOrders.filter(o => o.customerId === userId && o.status === 'Selesai');

            if (userOrders.length === 0) {
                resolve([]);
                return;
            }

            // Use items from the most recent completed order as a base
            const lastOrder = userOrders.sort((a, b) => parseIndonesianDate(b.date).getTime() - parseIndonesianDate(a.date).getTime())[0];
            const lastOrder_itemIds = new Set(lastOrder.items.map(item => item.menuItemId));
            const lastOrder_categories = new Set(lastOrder.items.map(item => {
                const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
                return menuItem?.category;
            }).filter(Boolean));

            if (lastOrder_categories.size === 0) {
                resolve([]);
                return;
            }

            // Find other items in the same categories that the user hasn't ordered in their last order
            const recommendations = menuItems.filter(item =>
                lastOrder_categories.has(item.category) && !lastOrder_itemIds.has(item.id)
            );

            // Shuffle and take top 5
            const shuffled = recommendations.sort(() => 0.5 - Math.random());
            resolve(shuffled.slice(0, 5));

        }, 950); // Simulate network delay
    });
};

export const fetchChefRecommendations = (): Promise<MenuItem[]> => {
    // In a real app, this would be dynamic
    return new Promise(resolve => setTimeout(() => {
        const item5 = menuItems.find(i => i.id === 5);
        const item10 = menuItems.find(i => i.id === 10);
        resolve([item5, item10].filter(Boolean) as MenuItem[]);
    }, 900));
}

export interface Event {
    id: number;
    title: string;
    category: string;
    image: string;
}

const mockEvents: Event[] = [
    { id: 1, title: 'Malam Anggur & Keju', category: 'Acara Spesial', image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=600&fit=crop' },
    { id: 2, title: 'Musik Jazz Setiap Akhir Pekan', category: 'Hiburan', image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400&h=600&fit=crop' },
    { id: 3, title: 'Peluncuran Menu Baru', category: 'Berita', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=600&fit=crop' },
    { id: 4, title: 'Kelas Memasak Pasta', category: 'Workshop', image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=600&fit=crop' },
];

export const fetchEvents = (): Promise<Event[]> => {
    return new Promise(resolve => setTimeout(() => resolve(mockEvents), 1000));
}


// Reviews Data
export interface Review {
    id: number;
    menuItemId: number;
    customerId: number;
    customerName: string;
    customerAvatar: string;
    rating: number; // 1-5
    comment: string;
    date: string; // "2 hari lalu", "1 minggu lalu", etc.
}

let mockReviews: Review[] = [
    { id: 1, menuItemId: 10, customerId: 3, customerName: 'Budi Hartono', customerAvatar: 'https://i.pravatar.cc/150?u=budi', rating: 5, comment: 'Risotto terbaik yang pernah saya makan! Creamy, gurih, dan aroma truffle-nya sangat menggugah selera. Wajib coba!', date: '2 hari lalu' },
    { id: 2, menuItemId: 10, customerId: 2, customerName: 'Jessica Wijaya', customerAvatar: 'https://i.pravatar.cc/150?u=jessica', rating: 4, comment: 'Sangat enak, porsinya juga pas. Mungkin sedikit terlalu creamy buat saya, tapi secara keseluruhan sangat memuaskan.', date: '5 hari lalu' },
    { id: 3, menuItemId: 5, customerId: 3, customerName: 'Budi Hartono', customerAvatar: 'https://i.pravatar.cc/150?u=budi', rating: 5, comment: 'Steaknya luar biasa! Dimasak dengan sempurna, juicy, dan bumbunya meresap sampai ke dalam. Harganya sepadan dengan kualitasnya.', date: '1 minggu lalu' },
    { id: 4, menuItemId: 10, customerId: 1, customerName: 'Pengguna Tamu', customerAvatar: 'https://i.pravatar.cc/150?u=guest', rating: 5, comment: 'Lezat!', date: '1 minggu lalu' },
    // Reviews for Spaghetti Carbonara Promo (ID 11)
    { id: 5, menuItemId: 11, customerId: 2, customerName: 'Jessica Wijaya', customerAvatar: 'https://i.pravatar.cc/150?u=jessica', rating: 5, comment: 'Carbonara terbaik yang pernah saya coba di Jakarta! Creamy tapi ga bikin eneg.', date: '1 hari lalu' },
    { id: 6, menuItemId: 11, customerId: 3, customerName: 'Budi Hartono', customerAvatar: 'https://i.pravatar.cc/150?u=budi', rating: 4, comment: 'Rasanya otentik, porsinya pas. Recommended!', date: '2 hari lalu' },
    { id: 7, menuItemId: 11, customerId: 5, customerName: 'Doni Saputra', customerAvatar: 'https://i.pravatar.cc/150?u=doni', rating: 5, comment: 'Suka banget sama tekstur pastanya. Al dente sempurna.', date: '3 hari lalu' },
    { id: 8, menuItemId: 11, customerId: 1, customerName: 'Siti Aminah', customerAvatar: 'https://i.pravatar.cc/150?u=siti', rating: 5, comment: 'Anak-anak saya suka sekali. Pasti pesan lagi.', date: '4 hari lalu' },
    { id: 9, menuItemId: 11, customerId: 4, customerName: 'Rudi Hermawan', customerAvatar: 'https://i.pravatar.cc/150?u=rudi', rating: 4, comment: 'Enak, tapi pengiriman agak lama.', date: '5 hari lalu' },
];

export const fetchReviewsByItemId = (menuItemId: number): Promise<Review[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(mockReviews.filter(r => r.menuItemId === menuItemId).sort((a, b) => b.id - a.id));
        }, 600);
    });
};

export const addReview = (reviewData: Omit<Review, 'id' | 'date'>): Promise<Review> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const nextId = mockReviews.length > 0 ? Math.max(...mockReviews.map(r => r.id)) + 1 : 1;
            const newReview: Review = {
                ...reviewData,
                id: nextId,
                date: 'Baru saja'
            };
            mockReviews.unshift(newReview);
            resolve(newReview);
        }, 500);
    });
};


// --- NOTIFICATIONS ---

export interface Notification {
    id: number;
    userId: number;
    type: 'order_status' | 'new_promo' | 'reservation_reminder' | 'reward_update' | 'general_info';
    title: string;
    message: string;
    timestamp: string; // ISO 8601 string
    read: boolean;
    link?: string;
}

const now = new Date();
let mockNotifications: Notification[] = [
    { id: 1, userId: 2, type: 'order_status', title: 'Pesanan #ORD-20240725-002 Selesai', message: 'Pesanan Take Away Anda sudah siap untuk diambil.', timestamp: new Date(now.getTime() - 5 * 60000).toISOString(), read: false, link: '/akun/pesanan/riwayat' },
    { id: 2, userId: 2, type: 'new_promo', title: 'Promo Akhir Pekan!', message: 'Nikmati diskon 20% untuk semua pasta akhir pekan ini.', timestamp: new Date(now.getTime() - 2 * 3600 * 1000).toISOString(), read: false, link: '/akun/poin-hadiah' },
    { id: 3, userId: 2, type: 'reservation_reminder', title: 'Pengingat Reservasi', message: 'Reservasi Anda untuk 2 orang hari ini pukul 19:00.', timestamp: new Date(now.getTime() - 4 * 3600 * 1000).toISOString(), read: false, link: '/akun/reservasi/riwayat' },
    { id: 4, userId: 2, type: 'reward_update', title: 'Anda Mendapat Poin!', message: 'Anda mendapatkan +150 poin dari misi mingguan.', timestamp: new Date(new Date().setDate(now.getDate() - 1)).toISOString(), read: true, link: '/akun/poin-hadiah' },
    { id: 5, userId: 2, type: 'general_info', title: 'Jam Operasional Baru', message: 'Mulai minggu depan, kami buka hingga pukul 24:00 di akhir pekan.', timestamp: new Date(new Date().setDate(now.getDate() - 2)).toISOString(), read: true },
    { id: 6, userId: 2, type: 'order_status', title: 'Pesanan #ORD-20240720-003 Dibatalkan', message: 'Pesanan Anda telah berhasil dibatalkan.', timestamp: new Date(new Date().setDate(now.getDate() - 3)).toISOString(), read: true, link: '/akun/pesanan/riwayat' },
    // Admin notifications
    { id: 101, userId: 1, type: 'order_status', title: 'Pesanan Baru Diterima', message: 'Pesanan #ORD-20240728-005 baru saja masuk.', timestamp: new Date(now.getTime() - 1 * 60000).toISOString(), read: false },
    { id: 102, userId: 1, type: 'reservation_reminder', title: 'Reservasi Baru Masuk', message: 'Reservasi baru untuk 4 orang atas nama Budi.', timestamp: new Date(now.getTime() - 10 * 60000).toISOString(), read: false },
    { id: 103, userId: 1, type: 'general_info', title: 'Stok Hampir Habis', message: 'Stok untuk Bistecca alla Fiorentina hampir habis.', timestamp: new Date(now.getTime() - 3 * 3600 * 1000).toISOString(), read: true },
];

export const fetchNotificationsByUserId = (userId: number): Promise<Notification[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const userNotifications = mockNotifications.filter(n => n.userId === userId)
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            resolve(JSON.parse(JSON.stringify(userNotifications)));
        }, 700);
    });
};

export const markNotificationAsRead = (userId: number, notificationId: number): Promise<boolean> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const notifIndex = mockNotifications.findIndex(n => n.id === notificationId && n.userId === userId);
            if (notifIndex !== -1) {
                mockNotifications[notifIndex].read = true;
                resolve(true);
            } else {
                resolve(false);
            }
        }, 300);
    });
};

export const markAllNotificationsAsRead = (userId: number): Promise<boolean> => {
    return new Promise(resolve => {
        setTimeout(() => {
            mockNotifications.forEach(n => {
                if (n.userId === userId) {
                    n.read = true;
                }
            });
            resolve(true);
        }, 500);
    });
};

// --- LIVE CHAT ---

export interface Sender {
    id: number;
    name: string;
    type: 'customer' | 'agent' | 'system';
}

export interface Attachment {
    type: 'image';
    url: string; // base64 data URI
}

export interface Message {
    id: number;
    sender: Sender;
    text?: string;
    attachment?: Attachment;
    timestamp: string; // ISO 8601 string
    type: 'public' | 'internal';
    read?: boolean;
}

export interface CSAT {
    rating: number; // 1-5
    comment?: string;
}

export interface Conversation {
    id: number;
    customerId: number;
    customerName: string;
    messages: Message[];
    status: 'open' | 'closed';
    unreadCount: number;
    typing: {
        customer: boolean;
        agent: boolean;
        customerPreview?: string;
    };
    requiresHuman: boolean;
    csat?: CSAT;
    tags?: string[];
    assigneeId?: number;
    snoozedUntil?: string;
    viewingAgents?: number[];
    firstResponseTime?: number; // in seconds
    duration?: number; // in seconds
    metadata?: {
        currentPage: string;
        device: string;
    };
}

export interface CannedResponse {
    shortcut: string;
    text: string;
}

export const mockCannedResponses: CannedResponse[] = [
    { shortcut: 'salam', text: 'Selamat datang di DineOS! Ada yang bisa kami bantu?' },
    { shortcut: 'terimakasih', text: 'Terima kasih telah menghubungi kami. Senang bisa membantu!' },
    { shortcut: 'tunggu', text: 'Mohon ditunggu sebentar, kami sedang memeriksa detail pesanan Anda.' },
    { shortcut: 'promo', text: 'Untuk informasi promo terbaru, Anda bisa melihatnya di halaman Poin & Hadiah pada aplikasi kami.' },
];

export interface KnowledgeBaseItem {
    id: number;
    question: string;
    answer: string;
    category: 'Operasional' | 'Menu' | 'Pembayaran' | 'Promo';
}

export let mockKnowledgeBase: KnowledgeBaseItem[] = [
    { id: 1, category: 'Operasional', question: "Jam operasional restoran?", answer: "Restoran kami buka setiap hari dari pukul 17.00 hingga 23.00 untuk hari kerja, dan 16.00 hingga 24.00 di akhir pekan." },
    { id: 2, category: 'Operasional', question: "Bagaimana cara melakukan reservasi?", answer: "Anda dapat melakukan reservasi melalui website kami di halaman 'Reservasi', atau dengan menghubungi kami langsung di (021) 123-4567." },
    { id: 3, category: 'Menu', question: "Apakah ada pilihan menu vegetarian?", answer: "Tentu! Kami memiliki beberapa pilihan vegetarian yang lezat, seperti Risotto ai Funghi dan Salad Caprese. Silakan tanyakan kepada staf kami untuk rekomendasi lainnya." },
    { id: 4, category: 'Pembayaran', question: "Metode pembayaran apa saja yang diterima?", answer: "Kami menerima pembayaran tunai, kartu kredit/debit (Visa, Mastercard), dan E-Wallet (GoPay, OVO)." },
    { id: 5, category: 'Promo', question: "Apakah ada promo yang sedang berlangsung?", answer: "Untuk informasi promo terbaru, Anda bisa melihatnya di halaman Poin & Hadiah pada aplikasi kami atau di bagian banner promo di homepage." },
    { id: 6, category: 'Menu', question: "Apakah menu Bistecca alla Fiorentina tersedia?", answer: "Menu Bistecca alla Fiorentina adalah salah satu menu andalan kami. Namun, ketersediaannya terbatas setiap hari. Kami sarankan untuk memesan di awal atau menanyakannya saat reservasi." },
];

export const fetchKnowledgeBase = (): Promise<KnowledgeBaseItem[]> => {
    return new Promise(resolve => {
        setTimeout(() => resolve(JSON.parse(JSON.stringify(mockKnowledgeBase))), 300);
    });
};

export const fetchKnowledgeBaseItemById = (id: number): Promise<KnowledgeBaseItem | undefined> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const item = mockKnowledgeBase.find(item => item.id === id);
            resolve(item);
        }, 300);
    });
};

export const addKnowledgeBaseItem = (itemData: Omit<KnowledgeBaseItem, 'id'>): Promise<KnowledgeBaseItem> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const nextId = mockKnowledgeBase.length > 0 ? Math.max(...mockKnowledgeBase.map(item => item.id)) + 1 : 1;
            const newItem: KnowledgeBaseItem = { ...itemData, id: nextId };
            mockKnowledgeBase.push(newItem);
            resolve(newItem);
        }, 500);
    });
};

export const updateKnowledgeBaseItem = (id: number, updates: Partial<Omit<KnowledgeBaseItem, 'id'>>): Promise<KnowledgeBaseItem | undefined> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const itemIndex = mockKnowledgeBase.findIndex(item => item.id === id);
            if (itemIndex > -1) {
                mockKnowledgeBase[itemIndex] = { ...mockKnowledgeBase[itemIndex], ...updates };
                resolve(mockKnowledgeBase[itemIndex]);
            } else {
                resolve(undefined);
            }
        }, 500);
    });
};

export const deleteKnowledgeBaseItem = (id: number): Promise<boolean> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const itemIndex = mockKnowledgeBase.findIndex(item => item.id === id);
            if (itemIndex > -1) {
                mockKnowledgeBase.splice(itemIndex, 1);
                resolve(true);
            } else {
                resolve(false);
            }
        }, 500);
    });
};

export interface CustomerActivity {
    id: number;
    customerId: number;
    type: 'page_view' | 'placed_order' | 'started_chat';
    description: string;
    timestamp: string; // ISO 8601 string
}

export const mockCustomerActivity: CustomerActivity[] = [
    // Jessica Wijaya (id: 2)
    { id: 1, customerId: 2, type: 'started_chat', description: 'Memulai chat #1', timestamp: new Date(now.getTime() - 5 * 60000).toISOString() },
    { id: 2, customerId: 2, type: 'page_view', description: 'Melihat halaman /akun/menu/5', timestamp: new Date(now.getTime() - 7 * 60000).toISOString() },
    { id: 3, customerId: 2, type: 'placed_order', description: 'Membuat Pesanan #ORD-20240728-001', timestamp: new Date(now.getTime() - 10 * 60 * 60000).toISOString() },
    { id: 4, customerId: 2, type: 'page_view', description: 'Melihat halaman /home', timestamp: new Date(now.getTime() - 11 * 60 * 60000).toISOString() },

    // Budi Hartono (id: 3)
    { id: 5, customerId: 3, type: 'started_chat', description: 'Memulai chat #2', timestamp: new Date(now.getTime() - 10 * 60000).toISOString() },
    { id: 6, customerId: 3, type: 'page_view', description: 'Melihat halaman /akun/menu/10', timestamp: new Date(now.getTime() - 12 * 60000).toISOString() },
];

export const fetchCustomerActivityByCustomerId = (customerId: number): Promise<CustomerActivity[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const activities = mockCustomerActivity.filter(a => a.customerId === customerId);
            resolve(activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
        }, 500);
    });
};


export let mockConversations: Conversation[] = [
    {
        id: 1,
        customerId: 2,
        customerName: 'Jessica Wijaya',
        status: 'open',
        unreadCount: 1,
        typing: { customer: false, agent: false, customerPreview: '' },
        requiresHuman: false,
        tags: ['Status Pesanan'],
        assigneeId: 4,
        viewingAgents: [1],
        metadata: {
            currentPage: '/akun/pesanan/aktif',
            device: 'Desktop',
        },
        messages: [
            { id: 1, sender: { id: 2, name: 'Jessica Wijaya', type: 'customer' }, text: 'Halo, saya mau tanya tentang status pesanan saya.', timestamp: new Date(Date.now() - 5 * 60000).toISOString(), type: 'public', read: true },
            { id: 2, sender: { id: 4, name: 'CS Agent', type: 'agent' }, text: 'Tentu, bisa bantu sebutkan nomor pesanannya?', timestamp: new Date(Date.now() - 4 * 60000).toISOString(), type: 'public', read: true },
            { id: 3, sender: { id: 2, name: 'Jessica Wijaya', type: 'customer' }, text: 'ORD-20240725-002. Apakah sudah bisa diambil?', timestamp: new Date(Date.now() - 2 * 60000).toISOString(), type: 'public', read: false },
        ],
    },
    {
        id: 2,
        customerId: 3,
        customerName: 'Budi Hartono',
        status: 'open',
        unreadCount: 0,
        typing: { customer: false, agent: false, customerPreview: '' },
        requiresHuman: true,
        tags: ['Pertanyaan Menu', 'Vegetarian'],
        assigneeId: 1,
        viewingAgents: [],
        metadata: {
            currentPage: '/akun/menu',
            device: 'Mobile',
        },
        messages: [
            { id: 4, sender: { id: 3, name: 'Budi Hartono', type: 'customer' }, text: 'Apakah tersedia menu vegetarian?', timestamp: new Date(Date.now() - 10 * 60000).toISOString(), type: 'public', read: true },
        ],
    },
    {
        id: 3,
        customerId: 2, // Jessica Wijaya
        customerName: 'Jessica Wijaya',
        status: 'closed',
        unreadCount: 0,
        typing: { customer: false, agent: false, customerPreview: '' },
        requiresHuman: false,
        csat: { rating: 5, comment: "Sangat membantu dan cepat!" },
        tags: ['Bantuan Selesai'],
        viewingAgents: [],
        assigneeId: 4,
        firstResponseTime: 60,
        duration: 180,
        messages: [
            { id: 5, sender: { id: 2, name: 'Jessica Wijaya', type: 'customer' }, text: 'Terima kasih atas bantuannya!', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60000).toISOString(), type: 'public', read: true },
            { id: 6, sender: { id: 4, name: 'CS Agent', type: 'agent' }, text: 'Sama-sama! Senang bisa membantu.', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60000 + 60000).toISOString(), type: 'public', read: true },
            { id: 7, sender: { id: 0, name: 'System', type: 'system' }, text: 'Percakapan ditutup oleh CS Agent.', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60000 + 120000).toISOString(), type: 'public', read: true },
        ],
    },
    {
        id: 4,
        customerId: 2, // Jessica Wijaya
        customerName: 'Jessica Wijaya',
        status: 'closed',
        unreadCount: 0,
        typing: { customer: false, agent: false, customerPreview: '' },
        requiresHuman: false,
        viewingAgents: [],
        assigneeId: 1,
        firstResponseTime: 45,
        duration: 120,
        csat: { rating: 4 },
        messages: [
            { id: 8, sender: { id: 2, name: 'Jessica Wijaya', type: 'customer' }, text: 'Saya mau tanya soal promo akhir pekan.', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60000).toISOString(), type: 'public', read: true },
            { id: 9, sender: { id: 4, name: 'CS Agent', type: 'agent' }, text: 'Tentu, promo akhir pekan diskon 20% untuk semua pasta.', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60000 + 60000).toISOString(), type: 'public', read: true },
            { id: 10, sender: { id: 0, name: 'System', type: 'system' }, text: 'Percakapan ditutup oleh CS Agent.', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60000 + 120000).toISOString(), type: 'public', read: true },
        ],
    }
];

export const addMessageToConversation = (conversationId: number, text: string, sender: Sender, type: 'public' | 'internal' = 'public'): Message | null => {
    const conversation = mockConversations.find(c => c.id === conversationId);
    if (!conversation) return null;

    const newMessage: Message = {
        id: Math.random(),
        sender,
        text,
        timestamp: new Date().toISOString(),
        type,
    };

    conversation.messages.push(newMessage);
    return newMessage;
};

export const createNewConversation = (customerId: number, customerName: string, initialMessage: string): Promise<Conversation> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const newConversation: Conversation = {
                id: Math.max(...mockConversations.map(c => c.id), 0) + 1,
                customerId,
                customerName,
                messages: [], // The initial message will be added by `sendMessage`
                status: 'open',
                unreadCount: 1,
                typing: { customer: false, agent: false, customerPreview: '' },
                requiresHuman: false,
                viewingAgents: [],
            };
            mockConversations.push(newConversation);
            resolve(newConversation);
        }, 300);
    });
}

export const fetchConversationsByCustomerId = (customerId: number): Promise<Conversation[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const customerConversations = mockConversations.filter(c => c.customerId === customerId);
            resolve(JSON.parse(JSON.stringify(customerConversations.sort((a, b) => b.id - a.id)))); // Newest first
        }, 500);
    });
};

// ========================================
// OWNER ACCOUNT MANAGEMENT
// ========================================

export interface ActivityLog {
    id: number;
    userId: number;
    action: string;
    description: string;
    timestamp: string;
    ipAddress?: string;
    device?: string;
}

let mockActivityLogs: ActivityLog[] = [];

/**
 * Fetch owner profile by user ID (admin role)
 * Defaults to user ID 1 if not specified
 */
export const fetchOwnerProfile = (userId: number = 1): Promise<User | undefined> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const owner = mockUsers.find(u => u.id === userId && u.role === 'admin');
            resolve(owner ? { ...owner } : undefined);
        }, 500);
    });
};

/**
 * Update owner password with validation
 */
export const updateOwnerPassword = (
    userId: number,
    currentPassword: string,
    newPassword: string
): Promise<{ success: boolean; message: string }> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const user = mockUsers.find(u => u.id === userId);

            if (!user) {
                resolve({ success: false, message: 'User not found' });
                return;
            }

            // In a real app, this would check hashed passwords
            if (user.password !== currentPassword) {
                resolve({ success: false, message: 'Current password is incorrect' });
                return;
            }

            if (newPassword.length < 6) {
                resolve({ success: false, message: 'New password must be at least 6 characters' });
                return;
            }

            // Update password
            user.password = newPassword;

            // Log the activity
            const newLog: ActivityLog = {
                id: Math.max(...mockActivityLogs.map(l => l.id), 0) + 1,
                userId,
                action: 'password_change',
                description: 'Changed account password',
                timestamp: new Date().toISOString(),
                ipAddress: '192.168.1.100',
                device: 'Chrome on Windows'
            };
            mockActivityLogs.push(newLog);

            resolve({ success: true, message: 'Password updated successfully' });
        }, 800);
    });
};

/**
 * Fetch activity logs for a specific user
 */
export const fetchOwnerActivityLog = (userId: number, limit: number = 10): Promise<ActivityLog[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const userLogs = mockActivityLogs
                .filter(log => log.userId === userId)
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(0, limit);
            resolve([...userLogs]);
        }, 500);
    });
};

/**
 * Add activity log entry
 */
export const addActivityLog = (log: Omit<ActivityLog, 'id'>): Promise<ActivityLog> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const newLog: ActivityLog = {
                ...log,
                id: Math.max(...mockActivityLogs.map(l => l.id), 0) + 1,
            };
            mockActivityLogs.push(newLog);
            resolve(newLog);
        }, 300);
    });
};

// ========================================
// TWO-FACTOR AUTHENTICATION (2FA)
// ========================================

/**
 * Generate a 6-digit 2FA code and store it with expiry
 */
export const generate2FACode = (userId: number): Promise<{ success: boolean; code?: string; error?: string }> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const user = mockUsers.find(u => u.id === userId);

            if (!user) {
                resolve({ success: false, error: 'User not found' });
                return;
            }

            if (!user.twoFactorEnabled) {
                resolve({ success: false, error: '2FA is not enabled for this user' });
                return;
            }

            // Generate 6-digit code
            const code = Math.floor(100000 + Math.random() * 900000).toString();

            // Set expiry to 5 minutes from now
            const expiry = new Date(Date.now() + 5 * 60 * 1000).toISOString();

            // Update user with code and expiry
            const userIndex = mockUsers.findIndex(u => u.id === userId);
            mockUsers[userIndex] = {
                ...user,
                twoFactorCode: code,
                twoFactorExpiry: expiry
            };

            resolve({ success: true, code });
        }, 300);
    });
};

/**
 * Verify a 2FA code for a user
 */
export const verify2FACode = (userId: number, code: string): Promise<{ success: boolean; error?: string }> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const user = mockUsers.find(u => u.id === userId);

            if (!user) {
                resolve({ success: false, error: 'User not found' });
                return;
            }

            if (!user.twoFactorCode || !user.twoFactorExpiry) {
                resolve({ success: false, error: 'No verification code found' });
                return;
            }

            // Check if code has expired
            const now = new Date();
            const expiry = new Date(user.twoFactorExpiry);

            if (now > expiry) {
                resolve({ success: false, error: 'Verification code has expired' });
                return;
            }

            // Check if code matches
            if (user.twoFactorCode !== code) {
                resolve({ success: false, error: 'Invalid verification code' });
                return;
            }

            // Code is valid, clear it
            const userIndex = mockUsers.findIndex(u => u.id === userId);
            mockUsers[userIndex] = {
                ...user,
                twoFactorCode: undefined,
                twoFactorExpiry: undefined
            };

            resolve({ success: true });
        }, 500);
    });
};

/**
 * Clear 2FA code for a user (e.g., after successful verification or timeout)
 */
export const clear2FACode = (userId: number): Promise<boolean> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const userIndex = mockUsers.findIndex(u => u.id === userId);

            if (userIndex === -1) {
                resolve(false);
                return;
            }

            mockUsers[userIndex] = {
                ...mockUsers[userIndex],
                twoFactorCode: undefined,
                twoFactorExpiry: undefined
            };
            resolve(true);
        }, 300);
    });
};
