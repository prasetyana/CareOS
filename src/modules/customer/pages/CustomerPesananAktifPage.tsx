import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@core/hooks/useAuth';
import { useToast } from '@core/contexts/ToastContext';
import { useLiveChat } from '@core/contexts/LiveChatContext';
import { Order, fetchOrdersByCustomerId, cancelOrder } from '@core/data/mockDB';
import { ShoppingBag, Loader2, RefreshCw, Navigation, Phone, MessageCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import Modal from '@ui/Modal';
import SkeletonLoader from '@ui/SkeletonLoader';
import ActiveOrderCard from '@modules/customer/components/ActiveOrderCard';

const CustomerPesananAktifPage: React.FC = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const { openChat } = useLiveChat();
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeOrders, setActiveOrders] = useState<Order[]>([]);

    // Modal States
    const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
    const [qrOrder, setQrOrder] = useState<Order | null>(null);
    const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);

    const location = useLocation();

    const loadActiveOrders = useCallback(async (isBackgroundRefresh = false) => {
        if (!user?.id) return;

        if (!isBackgroundRefresh) setLoading(true);
        else setIsRefreshing(true);

        try {
            // Add a small delay to ensure mockDB update has propagated if navigating immediately
            if (!isBackgroundRefresh) await new Promise(resolve => setTimeout(resolve, 300));

            const allOrders = await fetchOrdersByCustomerId(user.id);
            const filteredOrders = allOrders.filter(o => ['Menunggu Konfirmasi', 'Diproses', 'Siap Diambil'].includes(o.status));
            setActiveOrders(filteredOrders);
        } catch (error) {
            console.error("Failed to fetch active orders:", error);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [user?.id]);

    // Initial Load & Navigation Trigger
    useEffect(() => {
        loadActiveOrders();
    }, [loadActiveOrders, location.key, location.state]);

    // Polling Mechanism (Auto-refresh every 15 seconds)
    useEffect(() => {
        const intervalId = setInterval(() => {
            loadActiveOrders(true);
        }, 15000);

        return () => clearInterval(intervalId);
    }, [loadActiveOrders]);

    const handleManualRefresh = () => {
        loadActiveOrders(true);
    };

    const handleNeedHelp = (order: Order) => {
        openChat();
        addToast(`Bantuan untuk Pesanan #${order.orderNumber} dibuka.`, 'info');
    };

    const handleContactDriver = (action: 'call' | 'message') => {
        if (action === 'call') {
            addToast('Menghubungi driver...', 'info');
        } else {
            addToast('Membuka chat dengan driver...', 'info');
        }
    };

    const handleConfirmCancel = async () => {
        if (!cancelModalOrder) return;

        setIsCancelling(true);
        try {
            const success = await cancelOrder(cancelModalOrder.id);
            if (success) {
                addToast(`Pesanan #${cancelModalOrder.orderNumber} berhasil dibatalkan.`, 'success');
                loadActiveOrders(false); // Refresh list
            } else {
                addToast('Gagal membatalkan pesanan.', 'error');
            }
        } catch (error) {
            addToast('Terjadi kesalahan.', 'error');
        } finally {
            setIsCancelling(false);
            setCancelModalOrder(null);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                    <SkeletonLoader className="h-6 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                    <SkeletonLoader className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                </div>
                <SkeletonLoader className="h-64 w-full rounded-2xl bg-gray-200 dark:bg-gray-700" />
                <SkeletonLoader className="h-64 w-full rounded-2xl bg-gray-200 dark:bg-gray-700" />
            </div>
        );
    }

    if (activeOrders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] bg-white/50 dark:bg-gray-800/50 rounded-3xl border border-dashed border-black/10 dark:border-white/10 p-8 text-center">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <ShoppingBag className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold tracking-tight text-text-primary dark:text-gray-200 mb-2">Belum Ada Pesanan</h3>
                <p className="text-text-muted dark:text-gray-400 max-w-md mb-8">
                    Kamu belum memesan apapun saat ini. Lapar? Yuk pesan menu spesial kami!
                </p>
                <Link
                    to="/akun/menu"
                    className="bg-accent text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-accent/30 hover:-translate-y-1 transition-all duration-300"
                >
                    Pesan Makanan
                </Link>
            </div>
        );
    }

    return (
        <div className="pb-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium tracking-tight text-text-primary dark:text-gray-200 flex items-center gap-2">
                    Sedang Berlangsung
                    <span className="px-2 py-0.5 bg-accent text-white text-xs rounded-full">{activeOrders.length}</span>
                </h2>
                <button
                    onClick={handleManualRefresh}
                    disabled={isRefreshing}
                    className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-text-muted transition-colors flex items-center gap-2 text-sm"
                    title="Segarkan Status"
                >
                    {isRefreshing ? (
                        <Loader2 className="w-4 h-4 animate-spin text-accent" />
                    ) : (
                        <RefreshCw className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">Update</span>
                </button>
            </div>

            <div className="space-y-6">
                {activeOrders.map((order, index) => (
                    <div
                        key={order.id}
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <ActiveOrderCard
                            order={order}
                            onTrackOrder={setTrackingOrder}
                            onShowQR={setQrOrder}
                            onNeedHelp={handleNeedHelp}
                            onCancelOrder={setCancelModalOrder}
                        />
                    </div>
                ))}
            </div>

            {/* Tracking Modal */}
            <Modal isOpen={!!trackingOrder} onClose={() => setTrackingOrder(null)} title="Lacak Pengiriman" mobileAs="bottom-sheet">
                <div className="space-y-6">
                    {/* Map Placeholder */}
                    <div className="relative w-full h-56 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden shadow-inner">
                        <img src="https://picsum.photos/seed/map/800/400" alt="Map" className="w-full h-full object-cover opacity-80 grayscale-[20%]" />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            {/* Animated Driver Icon on Map */}
                            <div className="relative">
                                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center animate-pulse absolute -left-5 -top-5"></div>
                                <div className="w-6 h-6 bg-accent border-2 border-white shadow-xl rounded-full z-10 relative flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur px-4 py-2 rounded-xl shadow-lg text-xs font-semibold flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Navigation className="w-4 h-4 text-accent" />
                                <span className="text-text-primary dark:text-gray-200">Estimasi Tiba: 18:50</span>
                            </div>
                            <span className="text-text-muted font-normal">5 min</span>
                        </div>
                    </div>

                    {/* Driver Info */}
                    <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl flex items-center gap-4 border border-black/5 dark:border-white/10">
                        <img src="https://i.pravatar.cc/150?u=driver" alt="Driver" className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-600" />
                        <div className="flex-grow">
                            <p className="font-semibold text-text-primary dark:text-gray-200">Budi Santoso</p>
                            <p className="text-xs text-text-muted">Honda Vario • B 1234 XYZ</p>
                            <div className="flex items-center gap-1 text-yellow-500 text-xs mt-1">
                                <span>★ 4.9</span>
                                <span className="text-text-muted">(1.2k pengiriman)</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleContactDriver('call')} className="p-2.5 rounded-full bg-green-500 text-white shadow hover:bg-green-600 active:scale-95 transition-transform"><Phone size={18} /></button>
                            <button onClick={() => handleContactDriver('message')} className="p-2.5 rounded-full bg-blue-500 text-white shadow hover:bg-blue-600 active:scale-95 transition-transform"><MessageCircle size={18} /></button>
                        </div>
                    </div>

                    {/* Order Timeline */}
                    <div className="pl-2">
                        <h4 className="text-sm font-semibold text-text-primary dark:text-gray-200 mb-3">Status Pesanan</h4>
                        <div className="space-y-6 pl-4 border-l-2 border-gray-200 dark:border-gray-700 ml-2">
                            <div className="relative">
                                <div className="absolute -left-[21px] top-0 w-4 h-4 bg-accent rounded-full border-2 border-white dark:border-gray-800 shadow flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                                </div>
                                <p className="text-sm font-semibold text-text-primary dark:text-gray-200 leading-none">Driver sedang menuju lokasi Anda</p>
                                <p className="text-xs text-text-muted mt-1">18:45 • Jl. Sudirman</p>
                            </div>
                            <div className="relative opacity-60">
                                <div className="absolute -left-[21px] top-0 w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full border-2 border-white dark:border-gray-800"></div>
                                <p className="text-sm font-medium text-text-primary dark:text-gray-200 leading-none">Pesanan diambil driver</p>
                                <p className="text-xs text-text-muted mt-1">18:30</p>
                            </div>
                            <div className="relative opacity-40">
                                <div className="absolute -left-[21px] top-0 w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full border-2 border-white dark:border-gray-800"></div>
                                <p className="text-sm font-medium text-text-primary dark:text-gray-200 leading-none">Makanan sedang disiapkan</p>
                                <p className="text-xs text-text-muted mt-1">18:15</p>
                            </div>
                            <div className="relative opacity-30">
                                <div className="absolute -left-[21px] top-0 w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full border-2 border-white dark:border-gray-800"></div>
                                <p className="text-sm font-medium text-text-primary dark:text-gray-200 leading-none">Pesanan dikonfirmasi</p>
                                <p className="text-xs text-text-muted mt-1">18:10</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* QR Code Modal */}
            <Modal isOpen={!!qrOrder} onClose={() => setQrOrder(null)} title="Tunjukkan ke Kasir">
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="bg-white p-4 rounded-2xl shadow-lg mb-6 border border-gray-100">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ORDER-${qrOrder?.id}`} alt="QR Code" className="w-48 h-48" />
                    </div>
                    <p className="text-xl font-semibold tracking-tight text-text-primary dark:text-gray-200 mb-1">Order #{qrOrder?.orderNumber}</p>
                    <p className="text-text-muted text-sm mb-6 max-w-xs mx-auto">Tunjukkan QR Code ini kepada staf kami untuk verifikasi pesanan Anda.</p>
                    <div className="w-full bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30 flex items-center justify-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-300">
                            <CheckCircle2 size={18} />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">Status: Siap Diambil</p>
                            <p className="text-xs text-blue-600 dark:text-blue-300">Silakan menuju kasir atau pick-up point.</p>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Cancel Confirmation Modal */}
            <Modal isOpen={!!cancelModalOrder} onClose={() => setCancelModalOrder(null)} title="Batalkan Pesanan?">
                <div className="p-4">
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-danger rounded-full flex items-center justify-center mb-4">
                            <AlertCircle size={24} />
                        </div>
                        <p className="text-text-muted dark:text-gray-300">
                            Apakah Anda yakin ingin membatalkan Pesanan <span className="font-semibold text-text-primary dark:text-white">#{cancelModalOrder?.orderNumber}</span>?
                        </p>
                        <p className="text-xs text-text-muted mt-2">
                            Tindakan ini tidak dapat dibatalkan. Pesanan akan dipindahkan ke tab Riwayat dengan status "Dibatalkan".
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setCancelModalOrder(null)}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-text-primary dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        >
                            Kembali
                        </button>
                        <button
                            onClick={handleConfirmCancel}
                            disabled={isCancelling}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-danger text-white font-bold shadow-lg shadow-danger/30 hover:bg-danger/90 transition-all flex items-center justify-center gap-2"
                        >
                            {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ya, Batalkan'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default CustomerPesananAktifPage;
