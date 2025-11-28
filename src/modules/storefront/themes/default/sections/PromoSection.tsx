import React, { useState, useEffect } from 'react';
import { fetchPromotions, PromotionBanner } from '@core/data/mockDB';
import PromoSlider from '../../../customer/components/dashboard/PromoSlider';

const PromoSection: React.FC = () => {
    const [promotions, setPromotions] = useState<PromotionBanner[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPromotions = async () => {
            try {
                const data = await fetchPromotions();
                setPromotions(data);
            } catch (error) {
                console.error("Failed to load promotions:", error);
            } finally {
                setLoading(false);
            }
        };
        loadPromotions();
    }, []);

    if (loading) {
        return <div className="h-48 w-full bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />;
    }

    if (promotions.length === 0) return null;

    return <PromoSlider banners={promotions} />;
};

export default PromoSection;
