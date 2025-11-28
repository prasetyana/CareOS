/**
 * Theme Configuration
 * Default theme settings for the application
 */

export interface ThemeConfig {
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        success: string;
        warning: string;
        danger: string;
        info: string;
    };
    fonts: {
        sans: string;
        mono: string;
    };
    spacing: {
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
    };
    borderRadius: {
        sm: string;
        md: string;
        lg: string;
        xl: string;
        full: string;
    };
    breakpoints: {
        sm: string;
        md: string;
        lg: string;
        xl: string;
        '2xl': string;
    };
}

/**
 * Default theme configuration
 * Can be overridden per tenant
 */
export const defaultTheme: ThemeConfig = {
    colors: {
        primary: '#3B82F6', // Blue
        secondary: '#6B7280', // Gray
        accent: '#F59E0B', // Amber
        success: '#10B981', // Green
        warning: '#F59E0B', // Amber
        danger: '#EF4444', // Red
        info: '#3B82F6', // Blue
    },
    fonts: {
        sans: 'Inter, system-ui, -apple-system, sans-serif',
        mono: 'JetBrains Mono, Consolas, monospace',
    },
    spacing: {
        xs: '0.25rem', // 4px
        sm: '0.5rem', // 8px
        md: '1rem', // 16px
        lg: '1.5rem', // 24px
        xl: '2rem', // 32px
    },
    borderRadius: {
        sm: '0.25rem', // 4px
        md: '0.5rem', // 8px
        lg: '0.75rem', // 12px
        xl: '1rem', // 16px
        full: '9999px',
    },
    breakpoints: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
    },
};

/**
 * Get theme configuration
 * In the future, this can load tenant-specific themes
 */
export function getTheme(): ThemeConfig {
    return defaultTheme;
}
