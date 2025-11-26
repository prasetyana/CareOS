
import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useLocation } from "react-router-dom";
import CsSidebar from '../components/cs/CsSidebar';
import { useTheme } from '../hooks/useTheme';
import { Sun, Moon, Bell, Mail } from 'lucide-react';
import NotificationDropdown from '../components/admin/NotificationDropdown';
import MessageDropdown from '../components/admin/MessageDropdown';
import { useClickOutside } from '../hooks/useClickOutside';
import AdminBottomNav from '../components/admin/AdminBottomNav';
import { useNotifications } from '../hooks/useNotifications';

const getPageTitle = (pathname: string): string => {
  const pathParts = pathname.split('/').filter(Boolean);
  const section = pathParts[1];

  const titles: { [key: string]: string } = {
    dasbor: 'Dasbor',
    'live-chat': 'Live Chat',
    'pesan-masuk': 'Pesan Masuk',
    'kelola-faq': 'Kelola FAQ',
  };

  return titles[section] || 'Customer Service';
};


const CustomerServiceLayout: React.FC = () => {
  const { mode, toggleMode } = useTheme();
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { unreadCount } = useNotifications();
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  useClickOutside(notificationRef, () => setIsNotificationsOpen(false));
  useClickOutside(messageRef, () => setIsMessagesOpen(false));

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-bg-base dark:bg-brand-dark text-text-primary dark:text-gray-300 flex justify-center">
      <div className="w-full max-w-[1440px] flex items-start">
          <CsSidebar 
            isCollapsed={isSidebarCollapsed} 
            toggleSidebar={toggleSidebar} 
          />
          
          <div className="flex-1 min-w-0 flex flex-col min-h-screen">
             {/* Desktop Header */}
             <header 
                className={`hidden lg:block sticky top-4 z-30 px-4 mb-6 transition-all duration-300 ease-in-out`}
              >
              <div className="relative flex items-center justify-between px-6 py-3">
                <div 
                  className={`absolute inset-0 transition-opacity duration-300 ease-in-out backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 border border-white/20 dark:border-gray-800 rounded-2xl shadow-lg ${
                    isScrolled ? 'opacity-100' : 'opacity-0'
                  }`}
                ></div>

                <div className="relative z-10 flex items-center justify-between w-full">
                  <h1 className="text-xl font-semibold text-text-primary dark:text-gray-200">{pageTitle}</h1>
                  <div className="flex items-center gap-2">
                      <button
                          onClick={toggleMode}
                          className="p-2 rounded-xl text-text-muted dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10"
                          aria-label="Toggle light/dark mode"
                      >
                          {mode === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                      </button>

                      <div className="relative" ref={messageRef}>
                          <button
                              onClick={() => setIsMessagesOpen(prev => !prev)}
                              className="p-2 rounded-xl text-text-muted dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10 relative"
                              aria-label="Lihat pesan"
                          >
                              <Mail className="w-5 h-5" />
                              <span className="absolute top-2 right-2 block h-1.5 w-1.5 rounded-full bg-accent ring-1 ring-white dark:ring-gray-900"></span>
                          </button>
                          {isMessagesOpen && <MessageDropdown />}
                      </div>

                      <div className="relative" ref={notificationRef}>
                          <button
                              onClick={() => setIsNotificationsOpen(prev => !prev)}
                              className="p-2 rounded-xl text-text-muted dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10 relative"
                              aria-label="View notifications"
                          >
                              <Bell className="w-5 h-5" />
                              {unreadCount > 0 && (
                                <span className="absolute top-2 right-2 block h-1.5 w-1.5 rounded-full bg-red-500 ring-1 ring-white dark:ring-gray-900"></span>
                              )}
                          </button>
                          {isNotificationsOpen && <NotificationDropdown />}
                      </div>
                  </div>
                </div>
              </div>
            </header>
            
            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-surface/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm">
              <div className="container mx-auto flex items-center justify-center h-16 px-4 relative">
                 <h1 className="text-lg font-semibold text-text-primary dark:text-gray-200">{pageTitle}</h1>
              </div>
            </header>

            <main className="flex-1 p-4 sm:p-6 pt-20 lg:pt-0 pb-28 lg:pb-8">
              <Outlet />
            </main>
          </div>
      </div>
      <AdminBottomNav />
    </div>
  );
};

export default CustomerServiceLayout;
