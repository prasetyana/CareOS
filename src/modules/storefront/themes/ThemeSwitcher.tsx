import React from 'react';
import { useTheme } from '@core/hooks/useTheme';
import { TenantConfig } from '@core/tenant/tenantConfig';
import DefaultTheme from './default/DefaultTheme';
import MinimalTheme from './minimal/MinimalTheme';

interface ThemeSwitcherProps {
    tenant: TenantConfig;
    mode?: 'public' | 'customer';
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ tenant, mode = 'public' }) => {
    const { layout } = useTheme();

    // Render based on layout selection
    switch (layout) {
        case 'minimal':
            return <MinimalTheme tenant={tenant} />;
        case 'default':
        default:
            return <DefaultTheme tenant={tenant} mode={mode} />;
    }
};

export default ThemeSwitcher;
