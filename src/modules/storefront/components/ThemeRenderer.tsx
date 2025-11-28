/**
 * Theme Renderer
 * Dynamically loads and renders the correct theme based on tenant configuration
 */

import React from 'react';
import type { TenantConfig } from '@core/tenant/tenantConfig';
import DefaultTheme from '../themes/default/DefaultTheme';
import MinimalTheme from '../themes/minimal/MinimalTheme';

// Theme registry - expanding with more themes
const THEMES = {
    default: DefaultTheme,
    minimal: MinimalTheme,
    premium: DefaultTheme, // TODO: Create PremiumTheme
    dark: DefaultTheme,    // TODO: Create DarkTheme
};

interface ThemeRendererProps {
    tenant: TenantConfig;
    mode?: 'public' | 'customer';
}

export const ThemeRenderer: React.FC<ThemeRendererProps> = ({ tenant, mode = 'public' }) => {
    // 1. Get theme ID from tenant config
    const themeId = tenant.branding?.theme || 'default';

    // 2. Resolve theme component
    const ThemeComponent = THEMES[themeId as keyof typeof THEMES] || THEMES.default;

    // 3. Render theme
    return <ThemeComponent tenant={tenant} mode={mode} />;
};

export default ThemeRenderer;
