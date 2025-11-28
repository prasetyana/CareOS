/**
 * Application Constants
 * Centralized constants for the entire application
 */

export const APP_CONFIG = {
    name: 'DineOS',
    version: '0.1.4',
    description: 'Multi-tenant Restaurant Management SaaS',
} as const;

export const API_CONFIG = {
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
} as const;

export const PAGINATION = {
    defaultPageSize: 20,
    maxPageSize: 100,
    pageSizeOptions: [10, 20, 50, 100],
} as const;

export const CACHE = {
    tenantTTL: 5 * 60 * 1000, // 5 minutes
    menuTTL: 2 * 60 * 1000, // 2 minutes
    userTTL: 10 * 60 * 1000, // 10 minutes
} as const;

export const ROUTES = {
    // Public routes
    home: '/',
    login: '/login',
    register: '/register',
    contact: '/contact',

    // Customer routes
    customer: {
        dashboard: '/',
        menu: '/akun/menu',
        orders: '/akun/pesanan',
        reservations: '/akun/reservasi',
        favorites: '/akun/favorit',
        rewards: '/akun/poin-hadiah',
        settings: '/akun/pengaturan',
    },

    // Admin routes
    admin: {
        dashboard: '/admin/beranda',
        menu: '/admin/menu',
        orders: '/admin/pesanan',
        customers: '/admin/pelanggan',
        analytics: '/admin/analitik',
        settings: '/admin/pengaturan',
    },

    // CS routes
    cs: {
        dashboard: '/cs/beranda',
        chat: '/cs/chat',
        knowledgeBase: '/cs/knowledge-base',
    },
} as const;

export const LIMITS = {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    maxImageSize: 2 * 1024 * 1024, // 2MB
    maxMenuItems: 500,
    maxCategories: 50,
    maxOrderItems: 50,
} as const;

export const TIMEOUTS = {
    toast: 5000, // 5 seconds
    notification: 10000, // 10 seconds
    sessionWarning: 5 * 60 * 1000, // 5 minutes before expiry
} as const;
