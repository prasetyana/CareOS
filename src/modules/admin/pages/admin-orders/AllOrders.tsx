import React, { useState, useEffect } from 'react';
import { Order, fetchAllOrders, mockUsers } from '@core/data/mockDB';
import { Search, Filter, ChevronDown, Clock, CheckCircle2, XCircle, Truck, Utensils, Package, User, ChevronLeft, ChevronRight } from 'lucide-react';

const SemuaPesanan: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('Semua');
    const [searchQuery, setSearchQuery] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        loadOrders();
    }, []);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filterStatus, searchQuery]);

    const loadOrders = async () => {
        setLoading(true);
        const data = await fetchAllOrders();
        setOrders(data);
        setLoading(false);
    };

    const getCustomerName = (customerId: number) => {
        const user = mockUsers.find(u => u.id === customerId);
        return user ? user.name : `Customer #${customerId}`;
    };

    const filteredOrders = orders.filter(order => {
        // Only show completed or cancelled orders
        const isCompletedOrCancelled = order.status === 'Selesai' || order.status === 'Dibatalkan';

        const customerName = getCustomerName(order.customerId).toLowerCase();
        const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.items.some(i => i.menuItem.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            customerName.includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'Semua' || order.status === filterStatus;

        return isCompletedOrCancelled && matchesSearch && matchesFilter;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Selesai': return 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
            case 'Dibatalkan': return 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
            default: return 'bg-gray-50 text-gray-700 border-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Selesai': return <CheckCircle2 size={12} />;
            case 'Dibatalkan': return <XCircle size={12} />;
            default: return <Clock size={12} />;
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Dine In': return <Utensils size={12} />;
            case 'Take Away': return <Package size={12} />;
            case 'Delivery': return <Truck size={12} />;
            default: return <Utensils size={12} />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Dine In': return 'text-orange-600 bg-orange-50 border-orange-100';
            case 'Take Away': return 'text-blue-600 bg-blue-50 border-blue-100';
            case 'Delivery': return 'text-green-600 bg-green-50 border-green-100';
            default: return 'text-gray-600 bg-gray-50 border-gray-100';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold font-sans text-brand-dark dark:text-white">Semua Pesanan</h2>
                    <p className="text-brand-secondary dark:text-gray-400 mt-1">Monitor semua pesanan yang telah selesai atau dibatalkan.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-grow md:flex-grow-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Cari Pesanan / Pelanggan..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full md:w-64 pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all shadow-sm"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="pl-9 pr-8 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all appearance-none cursor-pointer shadow-sm"
                        >
                            <option value="Semua">Semua Status</option>
                            <option value="Selesai">Selesai</option>
                            <option value="Dibatalkan">Dibatalkan</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">No</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">No. Pesanan</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pelanggan</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Menu</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipe</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-sm text-gray-500">Memuat pesanan...</td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-sm text-gray-500">Tidak ada pesanan ditemukan.</td>
                                </tr>
                            ) : (
                                currentOrders.map((order, index) => (
                                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 text-xs text-gray-500">
                                            {(currentPage - 1) * itemsPerPage + index + 1}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm font-medium text-brand-primary whitespace-nowrap">#{order.orderNumber.split('-').pop()}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-500">
                                                    {getCustomerName(order.customerId).charAt(0)}
                                                </div>
                                                <span className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                                    {getCustomerName(order.customerId)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs text-gray-600 dark:text-gray-300 max-w-[200px] truncate" title={order.items.map(i => `${i.quantity}x ${i.menuItem.name}`).join(', ')}>
                                                {order.items.map(i => `${i.quantity}x ${i.menuItem.name}`).join(', ')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${getTypeColor(order.type)}`}>
                                                {getTypeIcon(order.type)}
                                                {order.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{order.total}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusColor(order.status)}`}>
                                                {getStatusIcon(order.status)}
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {!loading && filteredOrders.length > 0 && (
                    <div className="flex items-center justify-between p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Menampilkan <span className="font-medium">{indexOfFirstItem + 1}</span> sampai <span className="font-medium">{Math.min(indexOfLastItem, filteredOrders.length)}</span> dari <span className="font-medium">{filteredOrders.length}</span> pesanan
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={16} className="text-gray-600 dark:text-gray-400" />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${currentPage === page
                                        ? 'bg-brand-primary text-white'
                                        : 'border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={16} className="text-gray-600 dark:text-gray-400" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SemuaPesanan;
