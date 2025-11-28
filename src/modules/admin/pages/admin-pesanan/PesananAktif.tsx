
import React, { useState, useEffect } from 'react';
import { Order, fetchAllOrders, updateOrderStatus } from '@core/data/mockDB';
import { Clock, CheckCircle2, XCircle, ChefHat, Bell, ArrowRight, Utensils, Package, Truck } from 'lucide-react';

const PesananAktif: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        loadOrders();
        // Poll for new orders every 10 seconds
        const interval = setInterval(loadOrders, 10000);
        return () => clearInterval(interval);
    }, [refreshTrigger]);

    const loadOrders = async () => {
        const data = await fetchAllOrders();
        // Filter only active orders
        const activeOrders = data.filter(o => ['Menunggu Konfirmasi', 'Diproses', 'Siap Diambil'].includes(o.status));
        setOrders(activeOrders);
        setLoading(false);
    };

    const handleStatusUpdate = async (orderId: number, newStatus: Order['status']) => {
        // Optimistic update
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

        const success = await updateOrderStatus(orderId, newStatus);
        if (!success) {
            // Revert if failed
            loadOrders();
        } else {
            // Trigger refresh to ensure consistency
            setRefreshTrigger(prev => prev + 1);
        }
    };

    const KanbanColumn = ({ title, status, icon: Icon, color, orders }: { title: string, status: string, icon: any, color: string, orders: Order[] }) => (
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 flex flex-col min-h-[500px] border border-gray-100 dark:border-gray-700/50">
            <div className={`flex items-center gap-2 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700 ${color}`}>
                <Icon size={20} />
                <h3 className="font-bold text-lg">{title}</h3>
                <span className="ml-auto bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full text-sm font-medium shadow-sm border border-gray-100 dark:border-gray-700">
                    {orders.length}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                {orders.length === 0 ? (
                    <div className="h-32 flex flex-col items-center justify-center text-gray-400 text-sm italic border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                        <p>Tidak ada pesanan</p>
                    </div>
                ) : (
                    orders.map(order => (
                        <div key={order.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${order.type === 'Dine In' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                            order.type === 'Take Away' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                'bg-green-50 text-green-600 border-green-100'
                                            }`}>
                                            {order.type}
                                        </span>
                                        <span className="text-xs font-mono text-gray-500">#{order.orderNumber.split('-').pop()}</span>
                                    </div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">
                                        {order.type === 'Dine In' ? `Meja ${order.tableNumber}` : `Customer #${order.customerId}`}
                                    </h4>
                                </div>
                                <div className="text-xs text-gray-500 flex items-center gap-1 bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded">
                                    <Clock size={12} />
                                    {new Date(order.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>

                            <div className="space-y-1 mb-4">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                        <span className="text-gray-700 dark:text-gray-300">
                                            <span className="font-bold mr-2">{item.quantity}x</span>
                                            {item.menuItem.name}
                                        </span>
                                    </div>
                                ))}
                                {order.items.length > 3 && (
                                    <p className="text-xs text-gray-400 italic pt-1">+ {order.items.length - 3} item lainnya</p>
                                )}
                            </div>

                            <div className="flex gap-2 mt-auto pt-3 border-t border-gray-50 dark:border-gray-700">
                                {status === 'Menunggu Konfirmasi' && (
                                    <>
                                        <button
                                            onClick={() => handleStatusUpdate(order.id, 'Dibatalkan')}
                                            className="flex-1 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                        >
                                            Tolak
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(order.id, 'Diproses')}
                                            className="flex-[2] py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-1"
                                        >
                                            Terima <ArrowRight size={14} />
                                        </button>
                                    </>
                                )}
                                {status === 'Diproses' && (
                                    <button
                                        onClick={() => handleStatusUpdate(order.id, 'Siap Diambil')}
                                        className="w-full py-2 text-xs font-bold text-white bg-yellow-500 hover:bg-yellow-600 rounded-lg transition-colors flex items-center justify-center gap-1"
                                    >
                                        <ChefHat size={14} /> Siap Disajikan
                                    </button>
                                )}
                                {status === 'Siap Diambil' && (
                                    <button
                                        onClick={() => handleStatusUpdate(order.id, 'Selesai')}
                                        className="w-full py-2 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center justify-center gap-1"
                                    >
                                        <CheckCircle2 size={14} /> Selesai
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold font-sans text-brand-dark dark:text-white">Pesanan Aktif</h2>
                    <p className="text-brand-secondary dark:text-gray-400 mt-1">Pantau dan kelola pesanan yang sedang berlangsung.</p>
                </div>
                <div className="flex gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-sm">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-gray-600 dark:text-gray-300">Live Update</span>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    <KanbanColumn
                        title="Pesanan Baru"
                        status="Menunggu Konfirmasi"
                        icon={Bell}
                        color="text-blue-600"
                        orders={orders.filter(o => o.status === 'Menunggu Konfirmasi')}
                    />
                    <KanbanColumn
                        title="Sedang Diproses"
                        status="Diproses"
                        icon={ChefHat}
                        color="text-yellow-600"
                        orders={orders.filter(o => o.status === 'Diproses')}
                    />
                    <KanbanColumn
                        title="Siap Disajikan"
                        status="Siap Diambil"
                        icon={CheckCircle2}
                        color="text-green-600"
                        orders={orders.filter(o => o.status === 'Siap Diambil')}
                    />
                </div>
            )}
        </div>
    );
};

export default PesananAktif;
