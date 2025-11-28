import React, { useState, useEffect } from 'react';
import { useAuth } from '@core/contexts/AuthContext';
import {
    fetchPromotions,
    PromotionBanner,
    fetchUserFavorites,
    MenuItem,
    fetchChefRecommendations,
    fetchPromoMenuItems,
} from '@core/data/mockDB';
import { Utensils, Calendar, Tag, Star, Gift, MessageCircle, QrCode, MapPin, Search } from 'lucide-react';

import PromoSlider from '../components/dashboard/PromoSlider';
import QuickActionButton from '../components/dashboard/QuickActionButton';
import PersonalizedMenuSection from '../components/dashboard/PersonalizedMenuSection';
import RealTimeStatusWidget from '../components/dashboard/RealTimeStatusWidget';
import LocationModal from '../components/LocationModal';
import SpotlightSearch from '../components/SpotlightSearch';

import { useChat } from '@core/contexts/ChatContext';
import { useToast } from '@core/contexts/ToastContext';
import { useLocation } from '@core/contexts/LocationContext';
import { useTenantParam } from '@core/hooks/useTenantParam';

const CustomerHome: React.FC = () => {
    const { user } = useAuth();
    const { openChat } = useChat();
    const { addToast } = useToast();
    const { openLocationModal } = useLocation();
    const { withTenant } = useTenantParam();
    const [loading, setLoading] = useState(true);

    // State for all dynamic data
    const [promotions, setPromotions] = useState<PromotionBanner[]>([]);
    const [userFavorites, setUserFavorites] = useState<MenuItem[]>([]);
    const [chefRecommendations, setChefRecommendations] = useState<MenuItem[]>([]);
    const [promoItems, setPromoItems] = useState<MenuItem[]>([]);

    // Search State
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    useEffect(() => {
        const loadDashboardData = async () => {
            if (user) {
                setLoading(true);
                try {
                    const [
                        fetchedPromotions,
                        fetchedFavorites,
                        fetchedRecommendations,
                        fetchedPromoItems,
                    ] = await Promise.all([
                        fetchPromotions(),
                        fetchUserFavorites(user.id),
                        fetchChefRecommendations(),
                        fetchPromoMenuItems(),
                    ]);

                    setPromotions(fetchedPromotions);
                    setUserFavorites(fetchedFavorites);
                    setChefRecommendations(fetchedRecommendations);
                    setPromoItems(fetchedPromoItems);

                } catch (error) {
                    console.error("Failed to load dashboard data:", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        loadDashboardData();
    }, [user]);

    // Keyboard Shortcut for Search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    if (loading) {
        return (
            <div className="space-y-8 p-4 md:p-6 max-w-7xl mx-auto w-full">
                <div className="h-12 w-3/4 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
                <div className="h-48 w-full bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
                <div className="grid grid-cols-4 gap-4">
                    <div className="h-20 w-full bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
                    <div className="h-20 w-full bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
                    <div className="h-20 w-full bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
                    <div className="h-20 w-full bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
                </div>
                <div className="h-64 w-full bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
            </div>
        );
    }

    return (
        <div className="space-y-8 p-4 md:p-6 max-w-7xl mx-auto w-full">
            {/* 1. Status Widget + Search Bar (Desktop Only) */}
            <div className="hidden lg:flex items-center gap-3 sticky top-[-20px] z-20 -mt-5 mb-5">
                {/* Search Bar - Trigger for Spotlight */}
                <div className="flex-1">
                    <div
                        className="relative group cursor-pointer"
                        onClick={() => setIsSearchOpen(true)}
                    >
                        <div
                            className="w-full h-9 pl-10 pr-4 rounded-full bg-white/70 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center hover:bg-white/80 dark:hover:bg-black/50 hover:border-white/30 dark:hover:border-white/20 transition-all duration-200"
                            style={{
                                boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.08), 0 1px 4px -1px rgba(0, 0, 0, 0.06)',
                            }}
                        >
                            <span>Cari menu, promo, atau kategori...</span>
                            <div className="ml-auto flex items-center gap-1">
                                <span className="text-xs bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded border border-black/5 dark:border-white/5">⌘K</span>
                            </div>
                        </div>
                        <Search
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-200"
                        />
                    </div>
                </div>

                {/* Status Widget */}
                <div className="flex-shrink-0">
                    <RealTimeStatusWidget />
                </div>
            </div>


            {/* 2. Promo Slider */}
            <PromoSlider banners={promotions} />

            {/* 3. Quick Action Menu - Shopee Style (Icon + Text) */}
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3 gap-y-6">
                <QuickActionButton
                    onClick={() => addToast('Fitur Scan QR akan segera hadir!', 'info')}
                    icon={QrCode}
                    label="Scan QR"
                    color="text-neutral-800 dark:text-white"
                />
                <QuickActionButton
                    onClick={openLocationModal}
                    icon={MapPin}
                    label="Lokasi"
                    color="text-red-500"
                />
                <QuickActionButton
                    to={withTenant("/account/menu")}
                    icon={Utensils}
                    label="Menu"
                    color="text-blue-500"
                />
                <QuickActionButton
                    to={withTenant("/account/reservasi/buat")}
                    icon={Calendar}
                    label="Reservasi"
                    color="text-purple-500"
                />
                <QuickActionButton
                    to={withTenant("/account/menu?category=Promo")}
                    icon={Tag}
                    label="Promo"
                    color="text-orange-500"
                />
                <QuickActionButton
                    to={withTenant("/account/poin-hadiah")}
                    icon={Gift}
                    label="Poin Saya"
                    color="text-emerald-500"
                />
                <QuickActionButton
                    to={withTenant("/account/favorit")}
                    icon={Star}
                    label="Favorit"
                    color="text-yellow-500"
                />
                <QuickActionButton
                    onClick={openChat}
                    icon={MessageCircle}
                    label="Live Chat"
                    color="text-pink-500"
                />
            </div>

            {/* 4. Personalized Section */}
            {(userFavorites.length > 0 || chefRecommendations.length > 0 || promoItems.length > 0) && (
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
            )}


            {/* Location Modal */}
            <LocationModal />

            {/* Spotlight Search Modal */}
            <SpotlightSearch
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
            />
        </div>
    );
};

export default CustomerHome;
