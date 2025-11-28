import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@core/contexts/AuthContext';
import { useToast } from '@core/contexts/ToastContext';
import { useCart } from '@core/contexts/CartContext';
import { Order, fetchOrdersByCustomerId } from '@core/data/mockDB';
import { History, RotateCcw } from 'lucide-react';
import Modal from '@ui/Modal';
import SkeletonLoader from '@ui/SkeletonLoader';
import { useTenantParam } from '@core/hooks/useTenantParam';

const StatusBadge: React.FC<{ status: Order['status'] }> = ({ status }) => {
    const statusClasses = {
        'Selesai': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        'Diproses': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        'Dibatalkan': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        'Menunggu Konfirmasi': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        'Siap Diambil': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
};

const CustomerOrders: React.FC = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const { openCart, setItemQuantity } = useCart();
    const { withTenant } = useTenantParam();

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        let isMounted = true;
        const loadOrderHistory = async () => {
            if (user?.id) {
                setLoading(true);
                try {
                    const allOrders = await fetchOrdersByCustomerId(user.id);
                    if (isMounted) {
                        // Show all orders for now, or filter as needed. The original code filtered for history.
                        // Let's show all orders here as it is the main orders page.
                        // Or maybe we should split active vs history?
                        // For now, let's show all sorted by date.
                        const sortedOrders = allOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                        setOrders(sortedOrders);
                    }
                } catch (error) {
                    console.error("Failed to fetch order history:", error);
                    if (isMounted) {
                        setOrders([]);
                    }
                } finally {
                    if (isMounted) {
                        setLoading(false);
                    }
                }
            } else {
                setOrders([]);
                setLoading(false);
            }
        };

        loadOrderHistory();

        return () => {
            isMounted = false;
        };
    }, [user]);

    const handleReorder = (order: Order) => {
        order.items.forEach(item => {
            setItemQuantity(item.menuItem, item.quantity);
        });
        addToast('Menu berhasil ditambahkan ke keranjang!', 'success');
        openCart();
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-4 md:p-6">
                <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Pesanan Saya</h1>
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="border border-black/10 dark:border-white/10 p-4 rounded-xl flex justify-between items-center">
                            <div className="space-y-2">
                                <SkeletonLoader className="h-5 w-40 rounded bg-gray-200 dark:bg-gray-700" />
                                <SkeletonLoader className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                            </div>
                            <SkeletonLoader className="h-8 w-24 rounded-full bg-gray-200 dark:bg-gray-700" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Pesanan Saya</h1>

            {orders.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                    <History className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" />
                    <h3 className="mt-4 text-xl font-medium text-gray-900 dark:text-gray-200">Belum Ada Pesanan</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Riwayat pesanan Anda akan muncul di sini.</p>
                    <Link to={withTenant("/account/menu")} className="mt-6 inline-block bg-blue-600 text-white font-medium py-2 px-5 rounded-full hover:bg-blue-700 transition-colors duration-300 shadow-lg shadow-blue-600/20">
                        Pesan Sekarang
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order, index) => (
                        <div
                            key={order.id}
                            className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-5 rounded-2xl shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex-grow">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="font-bold text-lg text-gray-900 dark:text-gray-200">#{order.orderNumber.split('-').pop()}</p>
                                        <StatusBadge status={order.status} />
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                        <span>{new Date(order.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                        <span>{order.items.length} Item</span>
                                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                        <span className="font-medium text-gray-900 dark:text-gray-300">{order.total}</span>
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 self-end sm:self-center w-full sm:w-auto">
                                    <button
                                        onClick={() => setSelectedOrder(order)}
                                        className="flex-1 sm:flex-none py-2 px-4 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        Detail
                                    </button>
                                    <button
                                        onClick={() => handleReorder(order)}
                                        className="flex-1 sm:flex-none py-2 px-4 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm shadow-blue-600/20"
                                    >
                                        <RotateCcw size={16} />
                                        Pesan Lagi
                                    </button>
                                </div>
                            </div>

                            {/* Preview Items */}
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                                    {order.items.map(i => `${i.quantity}x ${i.menuItem.name}`).join(', ')}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedOrder && (
                <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Detail Pesanan #${selectedOrder.orderNumber}`}>
                    <div className="space-y-6">
                        <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Tanggal</span>
                                <span className="font-medium text-gray-900 dark:text-white">{new Date(selectedOrder.date).toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Tipe Pesanan</span>
                                <span className="font-medium text-gray-900 dark:text-white">{selectedOrder.type}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Status</span>
                                <StatusBadge status={selectedOrder.status} />
                            </div>
                            {selectedOrder.type === 'Dine In' && selectedOrder.tableNumber && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Nomor Meja</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{selectedOrder.tableNumber}</span>
                                </div>
                            )}
                            {selectedOrder.type === 'Delivery' && selectedOrder.deliveryAddress && (
                                <div className="pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">
                                    <span className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">ALAMAT PENGIRIMAN</span>
                                    <p className="text-sm text-gray-900 dark:text-white">{selectedOrder.deliveryAddress.fullAddress}</p>
                                </div>
                            )}
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Rincian Menu</h4>
                            <ul className="space-y-3">
                                {selectedOrder.items.map((item, index) => (
                                    <li key={index} className="flex justify-between items-start">
                                        <div className="flex gap-3">
                                            <div className="w-6 h-6 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 mt-0.5">
                                                {item.quantity}x
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{item.menuItem.name}</p>
                                                {item.notes && <p className="text-xs text-gray-500 italic">"{item.notes}"</p>}
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">{item.menuItem.price}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-bold text-lg text-gray-900 dark:text-white">Total Pembayaran</span>
                                <span className="font-bold text-xl text-blue-600">{selectedOrder.total}</span>
                            </div>
                            <button
                                onClick={() => {
                                    handleReorder(selectedOrder);
                                    setSelectedOrder(null);
                                }}
                                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                            >
                                <RotateCcw size={18} />
                                Pesan Lagi
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default CustomerOrders;
