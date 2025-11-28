import React, { useState, useEffect } from 'react';
import { useAuth } from '@core/contexts/AuthContext';
import {
    fetchUserFavorites,
    fetchChefRecommendations,
    fetchPromoMenuItems,
    MenuItem,
} from '@core/data/mockDB';
import PersonalizedMenuSection from '../../../customer/components/dashboard/PersonalizedMenuSection';

const MenuSection: React.FC = () => {
    const { user } = useAuth();
    const [userFavorites, setUserFavorites] = useState<MenuItem[]>([]);
    const [chefRecommendations, setChefRecommendations] = useState<MenuItem[]>([]);
    const [promoItems, setPromoItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadMenuData = async () => {
            if (user) {
                try {
                    const [
                        fetchedFavorites,
                        fetchedRecommendations,
                        fetchedPromoItems,
                    ] = await Promise.all([
                        fetchUserFavorites(user.id),
                        fetchChefRecommendations(),
                        fetchPromoMenuItems(),
                    ]);

                    setUserFavorites(fetchedFavorites);
                    setChefRecommendations(fetchedRecommendations);
                    setPromoItems(fetchedPromoItems);
                } catch (error) {
                    console.error("Failed to load menu data:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };
        loadMenuData();
    }, [user]);

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-20 w-full bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
                <div className="h-20 w-full bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
            </div>
        );
    }

    if (userFavorites.length === 0 && chefRecommendations.length === 0 && promoItems.length === 0) {
        return null;
    }

    return (
        <div className="space-y-2 pt-2">
            {/* Promo Hari Ini Section */}
            {promoItems.length > 0 && (
                <PersonalizedMenuSection
                    title="Promo Hari Ini"
                    items={promoItems}
                    visibleItems={undefined}
                />
            )}

            {userFavorites.length > 0 && (
                <PersonalizedMenuSection
                    title="Menu Favorit Kamu"
                    items={userFavorites}
                    visibleItems={undefined}
                />
            )}
            {chefRecommendations.length > 0 && (
                <PersonalizedMenuSection
                    title="Rekomendasi Chef Hari Ini"
                    items={chefRecommendations}
                    visibleItems={undefined}
                />
            )}
        </div>
    );
};

export default MenuSection;
