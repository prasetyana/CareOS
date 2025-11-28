
import React, { useState } from 'react';
// FIX: Re-typed import to fix "no exported member" errors.
import { Link } from "react-router-dom";
import { useAuth } from '../hooks/useAuth';
import { Menu, X, Sun, Moon, User } from 'lucide-react';
import { useHomepageContent } from '../hooks/useHomepageContent';
import { useTheme } from '../hooks/useTheme';
import { useTenantParam } from '../hooks/useTenantParam';
import { useTenant } from '@core/tenant';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { config } = useHomepageContent();
  const { mode, toggleMode } = useTheme();
  const { withTenant } = useTenantParam();
  const { tenant } = useTenant();

  const brandName = tenant?.businessName || config?.header.brandName || 'DineOS';
  const logoUrl = tenant?.logoUrl || config?.header.logoUrl;

  const brandClasses = `text-2xl font-sans font-bold text-brand-primary`;

  const hamburgerButtonClasses = `inline-flex items-center justify-center p-2 rounded-md text-brand-secondary dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-brand-primary`;

  const closeAllMenus = () => {
    setIsMenuOpen(false);
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 p-4 pointer-events-none">
      <div
        className={`relative max-w-[1440px] mx-auto transition-all duration-300 ease-in-out pointer-events-auto ${isMenuOpen
          ? 'bg-white dark:bg-gray-800 rounded-2xl shadow-lg'
          : 'bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-lg border border-white/20 dark:border-gray-700/50 rounded-full'
          }`}
      >
        <div className="flex items-center justify-between h-16 px-4 sm:px-6">
          <div className="flex-shrink-0">
            <Link to="/home" className="flex items-center gap-3">
              {logoUrl && (
                <img src={logoUrl} alt={`${brandName} logo`} className="h-8 w-8 text-brand-primary" />
              )}
              <span className={brandClasses}>
                {brandName}
              </span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-2">
              <button
                onClick={toggleMode}
                className="p-2 rounded-full text-brand-secondary dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                aria-label="Toggle light/dark mode"
              >
                {mode === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>
              {isAuthenticated ? (
                <>
                  {user?.role === 'admin' ? (
                    <Link to="/admin" className="bg-brand-primary text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-red-700 transition-colors duration-300">
                      Dashboard
                    </Link>
                  ) : (
                    <Link
                      to={withTenant("/akun/beranda")}
                      className="bg-brand-primary text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-red-700 transition-colors duration-300 inline-flex items-center"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Akun Saya
                    </Link>
                  )}
                </>
              ) : (
                <Link to="/login" className="bg-brand-primary text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-red-700 transition-colors duration-300">
                  Masuk
                </Link>
              )}
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
              className={hamburgerButtonClasses}
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Buka menu utama</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden" id="mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
              <button
                onClick={() => { toggleMode(); closeAllMenus(); }}
                className="w-full flex items-center justify-between text-left px-3 py-2 rounded-md text-base font-medium text-brand-secondary dark:text-gray-300 hover:text-brand-dark dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <span>Ganti Tema</span>
                {mode === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>
              {isAuthenticated ? (
                <>
                  {user?.role === 'admin' ? (
                    <Link to="/admin" onClick={closeAllMenus} className="block text-center bg-brand-primary text-white px-3 py-2 rounded-md text-base font-medium hover:bg-red-700 transition-colors">
                      Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link to={withTenant("/akun/beranda")} onClick={closeAllMenus} className="block px-3 py-2 rounded-md text-base font-medium text-brand-secondary dark:text-gray-300 hover:text-brand-dark dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Dasbor Akun</Link>
                      <button onClick={() => { logout(); closeAllMenus(); }} className="w-full text-left bg-red-600 text-white px-3 py-2 rounded-md text-base font-medium hover:bg-red-700 transition-colors">
                        Keluar
                      </button>
                    </>
                  )}
                </>
              ) : (
                <Link to="/login" onClick={closeAllMenus} className="block text-center bg-brand-primary text-white px-3 py-2 rounded-md text-base font-medium hover:bg-red-700 transition-colors">
                  Masuk
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
