import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useChat } from '../../hooks/useChat';
import { useNotifications } from '../../hooks/useNotifications';
import { useToast } from '../../hooks/useToast';
import { MenuItem, fetchUserFavorites, fetchCategories, Category } from '../../data/mockDB';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useCustomerLayout } from '../../contexts/CustomerLayoutContext';
import MenuCard from '../../components/MenuCard';
import MenuCardSkeleton from '../../components/MenuCardSkeleton';
import ScrollableTabs from '../../components/ScrollableTabs';
import SkeletonLoader from '../../components/SkeletonLoader';
import { Heart, Search } from 'lucide-react';
import { fetchMenuItemById } from '../../data/mockDB';
import { useLocation } from '../../contexts/LocationContext';
import LocationModal from '../../components/customer/LocationModal';
import RealTimeStatusWidget from '../../components/customer/dashboard-home/RealTimeStatusWidget';
import SpotlightSearch from '../../components/customer/SpotlightSearch';
import { useTenantParam } from '../../hooks/useTenantParam';

const CustomerFavoritesPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { addToCart, isCartOpen } = useCart();
    const { isChatOpen } = useChat();
    const { isNotificationPanelOpen } = useNotifications();
    const { isSidebarCollapsed } = useCustomerLayout();
    const { addToast } = useToast();
    const { favorites: favoriteIds, loading: favoritesLoading } = useFavorites();
    const [favorites, setFavorites] = useState<MenuItem[]>([]);
    const [categoriesData, setCategoriesData] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<string>('Semua');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { selectedBranch, openLocationModal } = useLocation();
    const { withTenant } = useTenantParam();

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

    useEffect(() => {
        loadData();
    }, [favoriteIds]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [items, cats] = await Promise.all([
                Promise.all(favoriteIds.map(id => fetchMenuItemById(id))),
                fetchCategories()
            ]);
            // Filter out undefined items (in case an ID doesn't exist)
            setFavorites(items.filter((item): item is MenuItem => item !== undefined));
            setCategoriesData(cats);
        } catch (error) {
            console.error('Failed to load data:', error);
            addToast('Gagal memuat data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const categories = useMemo(() => ['Semua', ...categoriesData.map(c => c.name)], [categoriesData]);

    const handleAddToCart = (item: MenuItem) => {
        addToCart(item);
        addToast(`${item.name} ditambahkan ke keranjang`, 'success');
    };

    const handleCategorySelect = (category: string) => {
        setActiveCategory(category);
    };

    const filteredFavorites = useMemo(() => {
        if (activeCategory === 'Semua') {
            return favorites;
        }
        return favorites.filter(item => item.category === activeCategory);
    }, [favorites, activeCategory]);

    // Logic for Grid Columns based on Panel States
    const isRightPanelOpen = isCartOpen || isChatOpen || isNotificationPanelOpen;
    const isLeftPanelOpen = !isSidebarCollapsed;

    let columnsClass = "";

    if (isLeftPanelOpen && isRightPanelOpen) {
        // Both Panels Open -> 4 Cards
        columnsClass = "lg:grid-cols-3 xl:grid-cols-4";
    } else if (!isLeftPanelOpen && !isRightPanelOpen) {
        // Both Panels Closed -> 6 Cards
        columnsClass = "lg:grid-cols-5 xl:grid-cols-6";
    } else {
        // One Panel Open (Left OR Right) -> 5 Cards
        columnsClass = "lg:grid-cols-4 xl:grid-cols-5";
    }

    const layoutClass = `grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${columnsClass}`;

    if (loading) {
        return (
            <div className="space-y-6">
                <SkeletonLoader className="h-10 w-64 rounded-lg" />
                <div className={layoutClass}>
                    <MenuCardSkeleton />
                    <MenuCardSkeleton />
                    <MenuCardSkeleton />
                    <MenuCardSkeleton />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Search Bar + Status Widget (Desktop Only) */}
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

            {/* Header */}
            <div className="text-center">
                <h1 className="text-2xl font-semibold tracking-tight font-sans text-text-primary dark:text-gray-100">Menu Favorit Saya</h1>
                <p className="text-text-muted mt-1 dark:text-gray-400">
                    {favorites.length > 0
                        ? `Kamu memiliki ${favorites.length} menu favorit`
                        : 'Belum ada menu favorit'}
                </p>
            </div>

            <div className="py-4 flex justify-center">
                <ScrollableTabs
                    id="favorite-category-tabs"
                    options={categories}
                    value={activeCategory}
                    onChange={handleCategorySelect}
                />
            </div>

            {/* Favorites Grid */}
            {favorites.length === 0 ? (
                <div className="text-center py-20">
                    <Heart className="w-20 h-20 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-text-primary mb-2">
                        Belum Ada Favorit
                    </h3>
                    <p className="text-text-muted mb-6">
                        Tandai menu favoritmu dengan menekan ikon hati
                    </p>
                    <button
                        onClick={() => navigate(withTenant('/akun/menu'))}
                        className="px-6 py-3 bg-accent text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                    >
                        Jelajahi Menu
                    </button>
                </div>
            ) : (
                <div className={layoutClass}>
                    {filteredFavorites.length > 0 ? (
                        filteredFavorites.map((item) => (
                            <MenuCard
                                key={item.id}
                                {...item}
                                onAddToCart={() => handleAddToCart(item)}
                                onViewDetails={() => navigate(withTenant(`/akun/menu/${item.slug}`))}
                            />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-10 text-text-muted">
                            Tidak ada menu favorit di kategori ini.
                        </div>
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

export default CustomerFavoritesPage;
