import React, { useEffect } from 'react';
import { useTenant } from '@core/contexts/TenantContext';

const DynamicFavicon: React.FC = () => {
    const { tenant } = useTenant();

    useEffect(() => {
        const updateFavicon = (url: string) => {
            const link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
            if (link) {
                link.href = url;
            } else {
                const newLink = document.createElement('link');
                newLink.rel = 'icon';
                newLink.href = url;
                document.head.appendChild(newLink);
            }
        };

        if (tenant?.logoUrl) {
            updateFavicon(tenant.logoUrl);
        } else {
            // Reset to default if needed, or keep previous. 
            // Usually better to revert to default favicon.svg
            updateFavicon('/favicon.svg');
        }
    }, [tenant?.logoUrl]);

    return null;
};

export default DynamicFavicon;
