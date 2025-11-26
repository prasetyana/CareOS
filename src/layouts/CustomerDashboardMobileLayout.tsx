
import React from 'react';
import { Outlet, useLocation, Link } from "react-router-dom";
import BottomNav from '../components/customer/BottomNav';
import MobileHeader from '../components/customer/MobileHeader';
import { useChat } from '../hooks/useChat';
import Modal from '../components/Modal';
import CustomerChatView from '../components/customer/CustomerChatView';
import { useNotifications } from '../hooks/useNotifications';
import { Bell } from 'lucide-react';
import NotificationContent from '../components/customer/NotificationContent';
import { useCart } from '../hooks/useCart';
import CartContent from '../components/customer/CartContent';
import { useTenantParam } from '../hooks/useTenantParam';

const getPageTitle = (pathname: string): string => {
    if (pathname.startsWith('/akun/menu')) return 'Menu';
    if (pathname.startsWith('/akun/pesanan/aktif')) return 'Pesanan Aktif';
    if (pathname.startsWith('/akun/pesanan/riwayat')) return 'Riwayat Pesanan';
    if (pathname.startsWith('/akun/pesanan')) return 'Pesanan';
    if (pathname.startsWith('/akun/reservasi/buat')) return 'Buat Reservasi';
    if (pathname.startsWith('/akun/reservasi/riwayat')) return 'Reservasi Saya';
    if (pathname.startsWith('/akun/reservasi')) return 'Reservasi';
    if (pathname.startsWith('/akun/poin-hadiah')) return 'Poin & Hadiah';
    if (pathname.startsWith('/akun/notifikasi')) return 'Notifikasi';
    if (pathname.startsWith('/akun/pengaturan/profil')) return 'Profil Saya';
    if (pathname.startsWith('/akun/pengaturan/preferensi')) return 'Preferensi Notifikasi';
    if (pathname.startsWith('/akun/pengaturan')) return 'Akun';
    return 'Beranda'; // for /akun/beranda
};

const CustomerDashboardMobileLayout: React.FC = () => {
    const location = useLocation();
    const pageTitle = getPageTitle(location.pathname);
    const { isChatOpen, closeChat } = useChat();
    const { unreadCount, isNotificationPanelOpen, closeNotificationPanel, markAllAsRead } = useNotifications();
    const { isCartOpen, closeCart } = useCart();
    const { withTenant } = useTenantParam();

    return (
        <div className="min-h-screen bg-gradient-to-br from-bg-gradient-start to-bg-base dark:from-[#1F1F24] dark:to-[#161618] flex flex-col">
            <MobileHeader title={pageTitle} />
            <main className="flex-grow pt-24 pb-28 px-4 sm:px-6">
                <Outlet />
            </main>
            <BottomNav />

            <Modal isOpen={isChatOpen} onClose={closeChat} title="" mobileAs="bottom-sheet">
                <div className="h-[80vh] p-0 -m-6">
                    <CustomerChatView onClose={closeChat} />
                </div>
            </Modal>

            <Modal isOpen={isNotificationPanelOpen} onClose={closeNotificationPanel} title="" mobileAs="bottom-sheet">
                <div className="h-[80vh] p-4 flex flex-col">
                    <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10 mb-4 flex-shrink-0">
                        <h3 className="font-bold text-text-primary text-xl flex items-center gap-2">
                            <Bell size={20} />
                            Notifikasi
                        </h3>
                        {unreadCount > 0 && (
                            <button onClick={markAllAsRead} className="text-xs font-medium text-accent hover:underline">Tandai semua dibaca</button>
                        )}
                    </div>
                    <div className="flex-grow overflow-y-auto custom-scrollbar -mx-4 px-4">
                        <NotificationContent onClose={closeNotificationPanel} />
                    </div>
                    <div className="pt-4 mt-auto border-t border-black/10 dark:border-white/10 text-center flex-shrink-0">
                        <Link to={withTenant("/akun/notifikasi")} onClick={closeNotificationPanel} className="text-sm font-medium text-accent hover:underline">
                            Lihat Semua Halaman Notifikasi
                        </Link>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isCartOpen} onClose={closeCart} title="" mobileAs="bottom-sheet">
                <div className="h-[70vh] p-6">
                    <CartContent onClose={closeCart} />
                </div>
            </Modal>
        </div>
    );
};

export default CustomerDashboardMobileLayout;
