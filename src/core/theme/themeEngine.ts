/**
 * Theme Engine
 * Core theme configuration and management system
 */

export type ThemeId = 'default' | 'minimal' | 'premium' | 'dark';

export interface ThemeConfig {
    id: ThemeId;
    name: string;
    description: string;
    preview: string;
    category: 'food' | 'cafe' | 'restaurant' | 'minimal';
    colors: {
        primary: string;
        secondary: string;
        accent: string;
    };
}

export const AVAILABLE_THEMES: ThemeConfig[] = [
    {
        id: 'default',
        name: 'Default',
        description: 'Clean and professional design perfect for any restaurant',
        preview: '/themes/default-preview.jpg',
        category: 'restaurant',
        colors: {
            primary: '#3B82F6',
            secondary: '#8B5CF6',
            accent: '#F59E0B',
        },
    },
    {
        id: 'minimal',
        name: 'Minimal White',
        description: 'Simple and elegant with focus on content',
        preview: '/themes/minimal-preview.jpg',
        category: 'minimal',
        colors: {
            primary: '#1F2937',
            secondary: '#6B7280',
            accent: '#10B981',
        },
    },
    {
        id: 'premium',
        name: 'Premium Dark',
        description: 'Luxurious and modern with dark aesthetics',
        preview: '/themes/premium-preview.jpg',
        category: 'restaurant',
        colors: {
            primary: '#F59E0B',
            secondary: '#EF4444',
            accent: '#8B5CF6',
        },
    },
    {
        id: 'dark',
        name: 'Dark Mode',
        description: 'Sleek and contemporary dark theme',
        preview: '/themes/dark-preview.jpg',
        category: 'cafe',
        colors: {
            primary: '#60A5FA',
            secondary: '#A78BFA',
            accent: '#34D399',
        },
    },
];

/**
 * Get theme configuration by ID
 */
export function getThemeConfig(themeId: ThemeId): ThemeConfig {
    return AVAILABLE_THEMES.find(t => t.id === themeId) || AVAILABLE_THEMES[0];
}

/**
 * Get all themes by category
 */
export function getThemesByCategory(category: ThemeConfig['category']): ThemeConfig[] {
    return AVAILABLE_THEMES.filter(t => t.category === category);
}
