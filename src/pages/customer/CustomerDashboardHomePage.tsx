
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
    fetchPromotions,
    PromotionBanner,
    fetchUserFavorites,
    MenuItem,
    fetchChefRecommendations,
    fetchPromoMenuItems,
} from '../../data/mockDB';
import { Utensils, Calendar, Tag, Star, Gift, MessageCircle, QrCode, MapPin, Search } from 'lucide-react';

import PromoSlider from '../../components/customer/dashboard-home/PromoSlider';
import QuickActionButton from '../../components/customer/dashboard-home/QuickActionButton';
import PersonalizedMenuSection from '../../components/customer/dashboard-home/PersonalizedMenuSection';
import SkeletonLoader from '../../components/SkeletonLoader';
import RealTimeStatusWidget from '../../components/customer/dashboard-home/RealTimeStatusWidget';
import SpotlightSearch from '../../components/customer/SpotlightSearch';
import { useChat } from '../../hooks/useChat';
import { useToast } from '../../hooks/useToast';
import { useCustomerLayout } from '../../contexts/CustomerLayoutContext';
import { useCart } from '../../hooks/useCart';
import { useNotifications } from '../../hooks/useNotifications';
import { useWindowSize } from '../../hooks/useWindowSize';
import { useLocation } from '../../contexts/LocationContext';
import LocationModal from '../../components/customer/LocationModal';
import { useTenantParam } from '../../hooks/useTenantParam';

const CustomerDashboardHomePage: React.FC = () => {
    const { user } = useAuth();
    const { openChat, isChatOpen } = useChat();
    const { addToast } = useToast();
    const { openLocationModal } = useLocation();
    const { withTenant } = useTenantParam();
    const [loading, setLoading] = useState(true);

    const { isSidebarCollapsed } = useCustomerLayout();
    const { isCartOpen } = useCart();
    const { isNotificationPanelOpen } = useNotifications();
    const { width } = useWindowSize();

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

    // Calculate Grid Columns Logic (Same as CustomerPesanPage)
    const isRightPanelOpen = isCartOpen || isChatOpen || isNotificationPanelOpen;
    const isLeftPanelOpen = !isSidebarCollapsed;
    const isDesktop = width >= 1024; // Tailwind lg breakpoint

    let gridColumns: number | undefined = undefined;

    if (isDesktop) {
        // Logic for Menu Items (Personalized Section)
        if (isLeftPanelOpen && isRightPanelOpen) {
            gridColumns = 4;
        } else if (!isLeftPanelOpen && !isRightPanelOpen) {
            gridColumns = 6;
        } else {
            gridColumns = 5;
        }
    }

    const greetingSubtext = loading ? "Memuat rekomendasi..." :
        chefRecommendations.length > 0 ? `Hari ini ada ${chefRecommendations.length} menu rekomendasi dari Chef kami!` :
            "Jelajahi menu lezat kami hari ini.";

    if (loading) {
        return (
            <div className="space-y-8">
                <SkeletonLoader className="h-12 w-3/4 rounded-lg" />
                <SkeletonLoader className="h-48 w-full rounded-2xl" />
                <div className="grid grid-cols-4 gap-4">
                    <SkeletonLoader className="h-20 w-full rounded-2xl" />
                    <SkeletonLoader className="h-20 w-full rounded-2xl" />
                    <SkeletonLoader className="h-20 w-full rounded-2xl" />
                    <SkeletonLoader className="h-20 w-full rounded-2xl" />
                </div>
                <SkeletonLoader className="h-64 w-full rounded-2xl" />
            </div>
        );
    }


    return (
        <div className="space-y-8">
            {/* 1. Status Widget + Search Bar (Desktop Only) */}
            <div className="hidden lg:flex items-center gap-3 sticky top-[-20px] z-20 -mt-5 mb-5">
                {/* Search Bar - Trigger for Spotlight */}
                <div className="flex-1">
                    <div
                        className="relative group cursor-pointer"
                        onClick={() => setIsSearchOpen(true)}
                    >
                        <div
                            className="w-full h-9 pl-10 pr-4 rounded-full bg-surface/70 backdrop-blur-xl border border-white/20 dark:border-white/10 text-sm font-medium text-text-secondary/60 flex items-center hover:bg-surface/80 hover:border-white/30 dark:hover:border-white/20 transition-all duration-200"
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
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/70 group-hover:text-primary transition-colors duration-200"
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
                    to={withTenant("/akun/menu")}
                    icon={Utensils}
                    label="Menu"
                    color="text-blue-500"
                />
                <QuickActionButton
                    to={withTenant("/akun/reservasi/buat")}
                    icon={Calendar}
                    label="Reservasi"
                    color="text-purple-500"
                />
                <QuickActionButton
                    to={withTenant("/akun/menu?category=Promo")}
                    icon={Tag}
                    label="Promo"
                    color="text-orange-500"
                />
                <QuickActionButton
                    to={withTenant("/akun/poin-hadiah")}
                    icon={Gift}
                    label="Poin Saya"
                    color="text-emerald-500"
                />
                <QuickActionButton
                    to={withTenant("/akun/favorit")}
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
                            visibleItems={gridColumns}
                        />
                    )}

                    {userFavorites.length > 0 && (
                        <PersonalizedMenuSection
                            title="Menu Favorit Kamu"
                            items={userFavorites}
                            visibleItems={gridColumns}
                        />
                    )}
                    {chefRecommendations.length > 0 && (
                        <PersonalizedMenuSection
                            title="Rekomendasi Chef Hari Ini"
                            items={chefRecommendations}
                            visibleItems={gridColumns}
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

export default CustomerDashboardHomePage;
