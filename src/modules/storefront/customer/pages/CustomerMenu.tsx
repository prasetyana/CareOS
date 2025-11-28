import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '@core/contexts/CartContext';
import { useChat } from '@core/contexts/ChatContext';
import { useNotifications } from '@core/contexts/NotificationContext';
import { useLocation as useLocationContext } from '@core/contexts/LocationContext';
import { useTenantParam } from '@core/hooks/useTenantParam';
import { MenuItem, Category, fetchMenuItems, fetchCategories, getSortScore } from '@core/data/mockDB';
import { Search } from 'lucide-react';
import MenuCard from '../components/MenuCard';
import MenuCardSkeleton from '../components/MenuCardSkeleton';
import ScrollableTabs from '@ui/ScrollableTabs';
import SkeletonLoader from '@ui/SkeletonLoader';
import RealTimeStatusWidget from '../components/dashboard/RealTimeStatusWidget';
import LocationModal from '../components/LocationModal';
import SpotlightSearch from '../components/SpotlightSearch';

const CustomerMenu: React.FC = () => {
    const [menu, setMenu] = useState<MenuItem[]>([]);
    const [categoriesData, setCategoriesData] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const { addToCart, isCartOpen } = useCart();
    const { isChatOpen } = useChat();
    const { isNotificationPanelOpen } = useNotifications();
    // const { isSidebarCollapsed } = useCustomerLayout(); // Removed legacy layout context
    const { selectedBranch, openLocationModal } = useLocationContext();
    const { withTenant } = useTenantParam();

    const [activeCategory, setActiveCategory] = useState<string>('Semua');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const location = useLocation();

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
        const params = new URLSearchParams(location.search);
        const categoryParam = params.get('category');
        if (categoryParam) {
            setActiveCategory(categoryParam);
        }
    }, [location.search]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await new Promise(res => setTimeout(res, 500));
            const [items, cats] = await Promise.all([fetchMenuItems(), fetchCategories()]);
            setMenu(items);
            setCategoriesData(cats);
            setLoading(false);
        };
        loadData();
    }, []);

    const groupedMenu = useMemo(() => {
        // Use fetched categories for ordering
        return categoriesData.reduce<Record<string, MenuItem[]>>((acc, category) => {
            const items = menu.filter(item => item.category === category.name);
            if (items.length > 0) {
                acc[category.name] = items;
            }
            return acc;
        }, {});
    }, [menu, categoriesData]);

    const sortedMenu = useMemo(() => {
        return [...menu].sort((a, b) => getSortScore(b) - getSortScore(a) || a.id - b.id);
    }, [menu]);

    const categories = useMemo(() => ['Semua', 'Promo', ...categoriesData.map(c => c.name)], [categoriesData]);

    const handleAddToCart = (item: MenuItem) => {
        addToCart(item);
    };

    const handleCategorySelect = (category: string) => {
        setActiveCategory(category);
        const scrollableContainer = document.querySelector('.custom-scrollbar') || window;
        if (scrollableContainer) {
            scrollableContainer.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Logic for Grid Columns based on Panel States
    const isRightPanelOpen = isCartOpen || isChatOpen || isNotificationPanelOpen;
    // const isLeftPanelOpen = !isSidebarCollapsed; // Removed
    const isLeftPanelOpen = false; // Assuming no left sidebar in storefront layout for now

    let columnsClass = "";

    if (isLeftPanelOpen && isRightPanelOpen) {
        // Both Panels Open -> 4 Cards
        columnsClass = "lg:grid-cols-3 xl:grid-cols-4";
    } else if (!isLeftPanelOpen && !isRightPanelOpen) {
        // Both Panels Closed -> 6 Cards
        columnsClass = "lg:grid-cols-4 xl:grid-cols-5"; // Adjusted for container width
    } else {
        // One Panel Open (Left OR Right) -> 5 Cards
        columnsClass = "lg:grid-cols-3 xl:grid-cols-4";
    }

    const layoutClass = `grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${columnsClass}`;


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

            <div className="text-center">
                <h1 className="text-2xl font-semibold tracking-tight font-sans text-text-primary dark:text-gray-100">Menu</h1>
                <p className="text-text-muted mt-1 dark:text-gray-400">Jelajahi menu kami dan buat pesanan Anda.</p>
            </div>
            <div className="py-4 flex justify-center">
                <ScrollableTabs
                    id="category-tabs"
                    options={categories}
                    value={activeCategory}
                    onChange={handleCategorySelect}
                />
            </div>

            <div className="space-y-12">
                {loading ? (
                    // Show skeleton for a few default categories while loading
                    ['Hidangan Pembuka', 'Hidangan Utama', 'Minuman'].map(category => (
                        <section key={category}>
                            <SkeletonLoader className="h-8 w-48 mb-6 rounded bg-gray-200 dark:bg-gray-700" />
                            <div className={layoutClass}>
                                <MenuCardSkeleton />
                                <MenuCardSkeleton />
                                <MenuCardSkeleton />
                                <MenuCardSkeleton />
                            </div>
                        </section>
                    ))
                ) : activeCategory === 'Semua' ? (
                    <section>
                        <div className={layoutClass}>
                            {sortedMenu.map(item =>
                                <MenuCard
                                    key={item.id}
                                    {...item}
                                    onAddToCart={() => handleAddToCart(item)}
                                    onViewDetails={() => navigate(withTenant(`/account/menu/${item.slug}`))}
                                />
                            )}
                        </div>
                    </section>
                ) : activeCategory === 'Promo' ? (
                    <section>
                        <div className={layoutClass}>
                            {menu.filter(item => item.isPromo).map(item =>
                                <MenuCard
                                    key={item.id}
                                    {...item}
                                    onAddToCart={() => handleAddToCart(item)}
                                    onViewDetails={() => navigate(withTenant(`/account/menu/${item.slug}`))}
                                />
                            )}
                        </div>
                    </section>
                ) : (
                    // Filtered View: Show only items for the selected category, without a title
                    <section>
                        <div className={`${layoutClass} animate-fade-in-up`}>
                            {(groupedMenu[activeCategory] || []).map(item => (
                                <MenuCard
                                    key={item.id}
                                    {...item}
                                    onAddToCart={() => handleAddToCart(item)}
                                    onViewDetails={() => navigate(withTenant(`/account/menu/${item.slug}`))}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>

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

export default CustomerMenu;
