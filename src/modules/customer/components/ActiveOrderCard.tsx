import React, { useState } from 'react';
import { Order } from '../../data/mockDB';
import { Check, Clock, ChevronDown, ChevronUp, MapPin, Utensils, Bike, Package, Navigation, QrCode, Phone, MessageCircle, HelpCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StatusStep: React.FC<{ title: string; isCompleted: boolean; isActive: boolean; isLast?: boolean }> = ({ title, isCompleted, isActive, isLast }) => {
    return (
        <div className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center relative z-10">
                <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300
                    ${isCompleted ? 'bg-accent border-accent text-white' :
                            isActive ? 'bg-white border-accent text-accent ring-4 ring-accent/20' :
                                'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400'}`}
                >
                    {isCompleted ? <Check className="w-4 h-4" /> : <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-accent' : 'bg-gray-300 dark:bg-gray-500'}`} />}
                </div>
                <p className={`absolute -bottom-8 w-24 text-center text-[10px] font-semibold transition-colors duration-300 leading-tight
                    ${isCompleted || isActive ? 'text-text-primary dark:text-gray-200' : 'text-text-muted'}`}>
                    {title}
                </p>
            </div>
            {!isLast && (
                <div className="flex-grow h-1 mx-2 bg-gray-200 dark:bg-gray-700 rounded relative overflow-hidden">
                    <motion.div
                        className="absolute top-0 left-0 h-full bg-accent"
                        initial={{ width: "0%" }}
                        animate={{ width: isCompleted ? "100%" : isActive ? "50%" : "0%" }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            )}
        </div>
    );
};

interface ActiveOrderCardProps {
    order: Order;
    onTrackOrder?: (order: Order) => void;
    onShowQR?: (order: Order) => void;
    onNeedHelp?: (order: Order) => void;
    onCancelOrder?: (order: Order) => void;
}

const ActiveOrderCard: React.FC<ActiveOrderCardProps> = ({ order, onTrackOrder, onShowQR, onNeedHelp, onCancelOrder }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const isDelivery = order.type === 'Delivery';

    const steps = isDelivery
        ? ['Dikonfirmasi', 'Disiapkan', 'Diantar', 'Tiba']
        : ['Dikonfirmasi', 'Disiapkan', 'Siap Disajikan'];

    // Dynamic Status Logic
    let currentStepIndex = 0;
    if (order.status === 'Menunggu Konfirmasi') currentStepIndex = 0;
    else if (order.status === 'Diproses') currentStepIndex = 1;
    else if (order.status === 'Siap Diambil') currentStepIndex = 2;
    else if (order.status === 'Selesai') currentStepIndex = 3;

    const OrderIcon = isDelivery ? Bike : order.type === 'Take Away' ? Package : Utensils;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-black/5 dark:border-white/10 overflow-hidden transition-all hover:shadow-xl">
            {/* Header */}
            <div className="p-5 border-b border-black/5 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 flex justify-between items-start">
                <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center text-accent">
                        <OrderIcon size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded-md bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-wider border border-accent/20">
                                {order.type}
                            </span>
                            <span className="text-xs text-text-muted font-mono">#{order.orderNumber}</span>
                        </div>
                        <h3 className="font-bold text-text-primary dark:text-gray-100 text-lg">
                            {order.items.length} Item • {order.total}
                        </h3>
                    </div>
                </div>
                <div className="text-right">
                    <div className="flex items-center justify-end gap-1.5 text-accent font-bold text-sm mb-1 bg-accent/5 px-2 py-1 rounded-lg">
                        <Clock className="w-4 h-4" />
                        <span>Est. {isDelivery ? '15-20' : '5-10'} mnt</span>
                    </div>
                </div>
            </div>

            {/* Progress Stepper */}
            <div className="px-6 py-8 mb-2">
                <div className="flex items-center justify-between relative">
                    {steps.map((step, index) => (
                        <StatusStep
                            key={step}
                            title={step}
                            isCompleted={index < currentStepIndex}
                            isActive={index === currentStepIndex}
                            isLast={index === steps.length - 1}
                        />
                    ))}
                </div>
            </div>

            {/* Driver Card (Only for Delivery & On The Way) */}
            {isDelivery && currentStepIndex === 2 && (
                <div className="px-5 pb-4">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <img src="https://i.pravatar.cc/150?u=driver" alt="Driver" className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm" />
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-700 rounded-full"></div>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-text-primary dark:text-gray-200">Budi Santoso</p>
                                <p className="text-xs text-text-muted">Honda Vario • B 1234 XYZ</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 bg-white dark:bg-gray-700 rounded-full shadow-sm hover:scale-110 transition-transform text-green-600 dark:text-green-400">
                                <Phone size={16} />
                            </button>
                            <button className="p-2 bg-white dark:bg-gray-700 rounded-full shadow-sm hover:scale-110 transition-transform text-blue-600 dark:text-blue-400">
                                <MessageCircle size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Primary Action Button (Context Aware) */}
            <div className="px-5 pb-2 space-y-3">
                {isDelivery && currentStepIndex >= 2 ? (
                    <button
                        onClick={() => onTrackOrder && onTrackOrder(order)}
                        className="w-full py-3 bg-accent text-white rounded-xl font-bold shadow-lg shadow-accent/30 hover:bg-accent/90 transition-all flex items-center justify-center gap-2"
                    >
                        <Navigation className="w-5 h-5" />
                        Lacak Pengiriman
                    </button>
                ) : (order.type === 'Take Away' || order.type === 'Dine In') && currentStepIndex >= 2 ? (
                    <button
                        onClick={() => onShowQR && onShowQR(order)}
                        className="w-full py-3 bg-accent text-white rounded-xl font-bold shadow-lg shadow-accent/30 hover:bg-accent/90 transition-all flex items-center justify-center gap-2"
                    >
                        <QrCode className="w-5 h-5" />
                        Tampilkan QR Pesanan
                    </button>
                ) : null}
            </div>

            {/* Details Section */}
            <div className="px-5 pb-4">
                {/* Toggle Details */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-text-muted hover:text-text-primary hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors mt-2"
                >
                    {isExpanded ? 'Sembunyikan Detail' : 'Lihat Rincian Pesanan'}
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                        >
                            {/* Contextual Info Box */}
                            <div className="mb-4 mt-2 p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl flex items-start gap-3">
                                {order.type === 'Delivery' ? (
                                    <>
                                        <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs font-bold text-text-primary dark:text-gray-200 uppercase mb-0.5">Alamat Pengiriman</p>
                                            <p className="text-sm text-text-muted dark:text-gray-400 leading-tight line-clamp-2">{order.deliveryAddress?.fullAddress || 'Alamat tidak tersedia'}</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Utensils className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs font-bold text-text-primary dark:text-gray-200 uppercase mb-0.5">Lokasi</p>
                                            <p className="text-sm text-text-muted dark:text-gray-400">
                                                {order.type === 'Dine In' ? `Meja Nomor ${order.tableNumber}` : `Ambil di Kasir (${order.pickupTime})`}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="pt-2 pb-2 border-t border-dashed border-gray-200 dark:border-gray-700 mt-2">
                                <ul className="space-y-3">
                                    {order.items?.map((item, index) => (
                                        <li key={index} className="flex justify-between text-sm items-start">
                                            <span className="text-text-primary dark:text-gray-300 flex gap-2">
                                                <span className="font-bold bg-gray-100 dark:bg-gray-700 px-1.5 rounded text-xs h-fit mt-0.5">{item.quantity}x</span>
                                                <span>{item.menuItem.name}</span>
                                            </span>
                                            <span className="text-text-muted tabular-nums">{item.menuItem.price}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="flex justify-between text-sm font-bold pt-3 border-t border-gray-100 dark:border-gray-700 mt-3 text-text-primary dark:text-white">
                                    <span>Total Pembayaran</span>
                                    <span className="text-accent">{order.total}</span>
                                </div>
                                <div className="flex justify-between text-xs text-text-muted mt-1 mb-4">
                                    <span>Metode Pembayaran</span>
                                    <span>{order.paymentMethod.provider}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => onNeedHelp && onNeedHelp(order)}
                                        className="py-2 text-sm font-medium text-accent border border-accent/30 rounded-lg hover:bg-accent/5 flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <HelpCircle size={16} />
                                        Bantuan
                                    </button>
                                    <button
                                        onClick={() => onCancelOrder && onCancelOrder(order)}
                                        className="py-2 text-sm font-medium text-danger border border-danger/30 rounded-lg hover:bg-danger/5 flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <XCircle size={16} />
                                        Batalkan
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ActiveOrderCard;
