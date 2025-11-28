import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@core/hooks/useAuth';
import { useToast } from '@core/contexts/ToastContext';
import { useCart } from '@core/contexts/CartContext';
import { Order, fetchOrdersByCustomerId } from '@core/data/mockDB';
import { History, RotateCcw } from 'lucide-react';
import Modal from '@ui/Modal';
import SkeletonLoader from '@ui/SkeletonLoader';

const StatusBadge: React.FC<{ status: Order['status'] }> = ({ status }) => {
    const statusClasses = {
        'Selesai': 'bg-success/10 text-success',
        'Diproses': 'bg-accent/10 text-accent',
        'Dibatalkan': 'bg-danger/10 text-danger',
        'Menunggu Konfirmasi': 'bg-yellow-100 text-yellow-700',
        'Siap Diambil': 'bg-blue-100 text-blue-700'
    };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
};

const CustomerOrderHistoryPage: React.FC = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const { openCart, setItemQuantity } = useCart();

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
                        const historyOrders = allOrders.filter(o => o.status === 'Selesai' || o.status === 'Dibatalkan');
                        setOrders(historyOrders);
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
            <div>
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
        <div>
            {orders.length === 0 ? (
                <div className="text-center py-16">
                    <History className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" />
                    <h3 className="mt-4 text-xl font-medium text-text-primary dark:text-gray-200">Tidak Ada Riwayat Pesanan</h3>
                    <p className="mt-2 text-text-muted dark:text-gray-400">Pesanan yang telah selesai atau dibatalkan akan muncul di sini.</p>
                    <Link to="/akun/menu" className="mt-6 inline-block bg-accent text-white font-medium py-2 px-5 rounded-full hover:bg-opacity-90 transition-colors duration-300">
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
                                        <p className="font-bold text-lg text-text-primary dark:text-gray-200">#{order.orderNumber.split('-').pop()}</p>
                                        <StatusBadge status={order.status} />
                                    </div>
                                    <p className="text-sm text-text-muted dark:text-gray-400 flex items-center gap-2">
                                        <span>{new Date(order.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                        <span>{order.items.length} Item</span>
                                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                        <span className="font-medium text-text-primary dark:text-gray-300">{order.total}</span>
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
                                        className="flex-1 sm:flex-none py-2 px-4 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors flex items-center justify-center gap-2 shadow-sm shadow-accent/20"
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
                                <span className="font-bold text-xl text-accent">{selectedOrder.total}</span>
                            </div>
                            <button
                                onClick={() => {
                                    handleReorder(selectedOrder);
                                    setSelectedOrder(null);
                                }}
                                className="w-full py-3 bg-accent text-white font-bold rounded-xl hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 flex items-center justify-center gap-2"
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

export default CustomerOrderHistoryPage;