/**
 * Theme Renderer
 * Dynamically loads and renders the correct theme based on tenant configuration
 */

import React from 'react';
import type { TenantConfig } from '@core/tenant/tenantConfig';
import DefaultTheme from '../themes/default/DefaultTheme';

// Theme registry - will expand with more themes
const THEMES = {
    default: DefaultTheme,
    minimal: DefaultTheme, // TODO: Create MinimalTheme
    premium: DefaultTheme, // TODO: Create PremiumTheme
    dark: DefaultTheme,    // TODO: Create DarkTheme
};

interface ThemeRendererProps {
    tenant: TenantConfig;
}

export const ThemeRenderer: React.FC<ThemeRendererProps> = ({ tenant }) => {
    // Get theme ID from tenant branding, fallback to 'default'
    const themeId = tenant.branding?.theme || 'default';

    // Get theme component, fallback to default if not found
    const ThemeComponent = THEMES[themeId] || THEMES.default;

    console.log(`Rendering theme: ${themeId} for tenant: ${tenant.name}`);

    return <ThemeComponent tenant={tenant} />;
};

export default ThemeRenderer;
