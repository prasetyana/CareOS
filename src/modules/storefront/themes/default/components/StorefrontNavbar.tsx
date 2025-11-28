import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@core/contexts/AuthContext';
import { useCart } from '@core/contexts/CartContext';
import { Home, ShoppingBag, User, LogOut, Menu } from 'lucide-react';
import { useTenantParam } from '@core/hooks/useTenantParam';

interface StorefrontNavbarProps {
    tenantName?: string;
}

const StorefrontNavbar: React.FC<StorefrontNavbarProps> = ({ tenantName }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();
    const { totalItems } = useCart();

    const { withTenant } = useTenantParam();

    const isActive = (path: string) => location.pathname.startsWith(withTenant(path));

    const navItems = [
        { label: 'Home', path: '/', icon: Home },
        { label: 'Orders', path: '/account/orders', icon: ShoppingBag },
        { label: 'Profile', path: '/account/profile', icon: User },
    ];

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 dark:bg-gray-900/80 dark:border-gray-800">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo / Brand */}
                    <div
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => navigate(withTenant('/'))}
                    >
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                            {tenantName?.charAt(0) || 'D'}
                        </div>
                        <span className="font-semibold text-lg hidden sm:block">
                            {tenantName || 'Storefront'}
                        </span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navItems.map((item) => (
                            <button
                                key={item.path}
                                onClick={() => navigate(withTenant(item.path))}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isActive(item.path)
                                    ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
                                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                                    }`}
                            >
                                <item.icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        {/* Cart Indicator */}
                        <button
                            onClick={() => navigate(withTenant('/account/cart'))}
                            className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
                        >
                            <ShoppingBag size={24} />
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                                    {totalItems}
                                </span>
                            )}
                        </button>

                        {/* Logout */}
                        <button
                            onClick={logout}
                            className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                            title="Sign Out"
                        >
                            <LogOut size={24} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 dark:bg-gray-900 dark:border-gray-800 pb-safe">
                <div className="flex justify-around items-center h-16">
                    {navItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(withTenant(item.path))}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive(item.path)
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-500 dark:text-gray-400'
                                }`}
                        >
                            <item.icon size={24} />
                            <span className="text-xs font-medium">{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default StorefrontNavbar;
