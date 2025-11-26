
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Trash2, X, UtensilsCrossed, Package, Bike, ArrowLeft } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { addOrder, Order } from '../../data/mockDB';
import { PaymentMethod } from '../../data/types/customer';
import GojekLogo from '../logos/GojekLogo';
import GrabLogo from '../logos/GrabLogo';
import DineOSLogo from '../logos/DineOSLogo';
import DeliveryMapWrapper from './DeliveryMapWrapper';
import { useTenantParam } from '../../hooks/useTenantParam';

const stepVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? '100%' : '-100%',
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
    },
    exit: (direction: number) => ({
        x: direction < 0 ? '100%' : '-100%',
        opacity: 0,
    }),
};

interface CartContentProps {
    onClose: () => void;
}

const CartContent: React.FC<CartContentProps> = ({ onClose }) => {
    const { cart, updateQuantity, removeFromCart, total, clearCart, subtotal: cartSubtotal, discount, applyPromo, appliedPromo, removePromo, deliveryDistance, setDeliveryDistance } = useCart();

    const [checkoutStep, setCheckoutStep] = useState(0); // 0: Cart, 1: Order Type, 2: Details, 3: Provider Execution, 4: Summary, 5: QRIS, 6: Success
    const [direction, setDirection] = useState(1);

    const [orderType, setOrderType] = useState<'Dine In' | 'Take Away' | 'Delivery' | null>(null);
    const [deliveryProvider, setDeliveryProvider] = useState<'gojek' | 'grab' | 'dineos' | null>(null);
    const [dineInPaymentOption, setDineInPaymentOption] = useState<'cashier' | 'now' | null>(null);
    const [onlinePaymentMethod, setOnlinePaymentMethod] = useState<'qris' | 'e-wallet' | 'bank-transfer' | null>(null);
    const [details, setDetails] = useState({ tableNumber: '', pickupTime: 'Sekarang (15-20 mnt)', address: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [promoCodeInput, setPromoCodeInput] = useState('');
    // deliveryDistance moved to Context
    const [isCalculatingFee, setIsCalculatingFee] = useState(false);

    const { user } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const { withTenant } = useTenantParam();

    const handleApplyPromo = async () => {
        if (!promoCodeInput.trim()) return;
        const success = await applyPromo(promoCodeInput);
        if (success) {
            addToast('Kode promo berhasil digunakan!', 'success');
            setPromoCodeInput('');
        } else {
            addToast('Kode promo tidak valid atau tidak memenuhi syarat.', 'error');
        }
    };

    useEffect(() => {
        if (cart.length === 0) {
            const timer = setTimeout(() => {
                setCheckoutStep(0);
                setOrderType(null);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [cart.length]);

    const changeStep = (newStep: number) => {
        setDirection(newStep > checkoutStep ? 1 : -1);
        setCheckoutStep(newStep);
    };

    const handleSelectOrderType = (type: 'Dine In' | 'Take Away' | 'Delivery') => {
        setOrderType(type);
        changeStep(2);
    };

    const handleNextToSummary = () => {
        if (orderType === 'Dine In') {
            if (!details.tableNumber.trim()) { addToast('Silakan masukkan nomor meja.', 'error'); return; }
            if (!dineInPaymentOption) { addToast('Silakan pilih metode pembayaran.', 'error'); return; }
            if (dineInPaymentOption === 'now' && !onlinePaymentMethod) { addToast('Silakan pilih jenis pembayaran online.', 'error'); return; }
            changeStep(4);
        } else if (orderType === 'Take Away') {
            changeStep(4);
        } else if (orderType === 'Delivery') {
            if (!deliveryProvider) { addToast('Silakan pilih layanan pengiriman.', 'error'); return; }
            if (deliveryProvider === 'dineos' && !details.address.trim()) { addToast('Silakan masukkan alamat pengiriman.', 'error'); return; }
            changeStep(3);
        }
    };

    const getPaymentMethod = (): PaymentMethod => {
        if (orderType === 'Dine In' && dineInPaymentOption === 'cashier') {
            return { id: 99, type: 'Cash' as any, provider: 'Di Kasir', last4: '' };
        }
        return { id: 1, type: 'E-Wallet' as const, provider: 'GoPay', last4: '' };
    };

    const handleSubmitOrder = async () => {
        if (!user || !orderType) return;
        setIsSubmitting(true);
        const deliveryFee = orderType === 'Delivery' ? 15000 : 0;
        const tax = (total + deliveryFee) * 0.1;
        const finalTotal = total + deliveryFee + tax;

        try {
            await addOrder(user.id, {
                items: cart.map(ci => ({ menuItem: ci.item, quantity: ci.quantity })),
                total: `Rp ${finalTotal.toLocaleString('id-ID')}`,
                type: orderType,
                paymentMethod: getPaymentMethod(),
                ...(orderType === 'Dine In' && { tableNumber: details.tableNumber }),
                ...(orderType === 'Take Away' && { pickupTime: details.pickupTime }),
                ...(orderType === 'Delivery' && { deliveryAddress: { id: Date.now(), label: 'Alamat Pengiriman', fullAddress: details.address, city: 'Kota', postalCode: '00000' } }),
            });
            // If QRIS payment, show QR code first, otherwise go to success
            if (dineInPaymentOption === 'now' && onlinePaymentMethod === 'qris') {
                changeStep(5); // QRIS payment step
            } else {
                changeStep(6); // Success step
                clearCart();
                setTimeout(() => {
                    onClose();
                    navigate(withTenant('/akun/pesanan/aktif'), { state: { refresh: Date.now() } });
                    addToast('Pesanan berhasil dibuat!', 'success');
                }, 2500);
            }
        } catch (error) {
            addToast('Gagal membuat pesanan.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const subtotal = cartSubtotal;
    const baseDeliveryFee = 10000;
    const costPerKm = 2000;
    const deliveryFee = orderType === 'Delivery' ? (deliveryDistance > 0 ? baseDeliveryFee + (deliveryDistance * costPerKm) : 15000) : 0;

    // Calculate Delivery Discount
    let deliveryDiscount = 0;
    if (appliedPromo && orderType === 'Delivery') {
        if (appliedPromo.discountType === 'free_delivery') {
            deliveryDiscount = deliveryFee;
        } else if (appliedPromo.discountType === 'delivery_discount') {
            deliveryDiscount = Math.min(appliedPromo.discountValue, deliveryFee);
        }
    }

    // Tax calculated on subtotal - discount + delivery fee - delivery discount
    const taxableAmount = Math.max(0, subtotal - discount + deliveryFee - deliveryDiscount);
    const tax = taxableAmount * 0.1;
    const finalTotal = taxableAmount + tax;

    const titles: { [key: number]: string } = {
        0: 'Keranjang Anda',
        1: 'Jenis Pesanan',
        2: 'Lengkapi Detail',
        3: 'Konfirmasi Pengiriman',
        4: 'Ringkasan Pesanan',
        5: 'Pembayaran QRIS',
        6: 'Pesanan Diterima!'
    };

    const commonInputClasses = "w-full p-3 border border-black/10 dark:border-white/10 rounded-lg bg-black/5 dark:bg-white/5 focus:ring-1 focus:ring-accent focus:border-accent transition";

    return (
        <div className="h-full flex flex-col font-sans">
            <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10 mb-4">
                <div className="flex items-center gap-2">
                    {checkoutStep > 0 && checkoutStep < 6 && (
                        <button onClick={() => changeStep(checkoutStep - 1)} className="p-2 -ml-2 text-text-muted hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/10 rounded-full">
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <h2 className="font-semibold tracking-tight text-text-primary dark:text-gray-100 flex items-center gap-2">
                        {checkoutStep === 0 && <ShoppingCart className="w-5 h-5" />}
                        {titles[checkoutStep]}
                    </h2>
                </div>
                <button onClick={onClose} className="p-2 -mr-2 text-text-muted hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/10 rounded-full">
                    <X size={20} />
                </button>
            </div>
            <div className="flex-grow relative overflow-hidden">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                    <motion.div
                        key={checkoutStep}
                        custom={direction}
                        variants={stepVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="h-full flex flex-col"
                    >
                        {/* Step 0: Cart View */}
                        {checkoutStep === 0 && (
                            <>
                                {cart.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center">
                                        <ShoppingCart size={64} className="text-neutral-300 dark:text-neutral-600 mb-4" />
                                        <h3 className="font-medium text-text-primary dark:text-gray-200">Keranjang Anda kosong</h3>
                                        <p className="text-sm text-text-muted dark:text-gray-400 mt-1 px-4">Tambahkan item dari menu untuk memulai pesanan Anda.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex-grow overflow-y-auto -mr-3 pr-3 space-y-4">
                                            {cart.map(cartItem => (
                                                <div key={cartItem.item.id} className="flex items-center gap-4">
                                                    <img src={cartItem.item.image} alt={cartItem.item.name} className="w-16 h-16 rounded-md object-cover" />
                                                    <div className="flex-grow">
                                                        <p className="font-medium text-sm text-text-primary dark:text-gray-200">{cartItem.item.name}</p>
                                                        <p className="text-xs text-text-muted dark:text-gray-400">{cartItem.item.price}</p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <button onClick={() => updateQuantity(cartItem.item.id, cartItem.quantity - 1)} className="p-1.5 rounded-full bg-black/5 dark:bg-white/10 text-text-muted dark:text-gray-400 hover:bg-black/10 dark:hover:bg-white/20"><Minus className="w-3 h-3" /></button>
                                                            <span className="text-sm font-medium w-5 text-center text-text-primary dark:text-gray-200 tabular-nums">{cartItem.quantity}</span>
                                                            <button onClick={() => updateQuantity(cartItem.item.id, cartItem.quantity + 1)} className="p-1.5 rounded-full bg-black/5 dark:bg-white/10 text-text-muted dark:text-gray-400 hover:bg-black/10 dark:hover:bg-white/20"><Plus className="w-3 h-3" /></button>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => removeFromCart(cartItem.item.id)} className="p-2 text-text-muted dark:text-gray-400 hover:text-danger hover:bg-danger/10 rounded-full"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Promo Code Section */}
                                        <div className="mt-4 mb-2">
                                            {appliedPromo ? (
                                                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center text-green-600 dark:text-green-400">
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-green-800 dark:text-green-300">{appliedPromo.code}</p>
                                                            <p className="text-xs text-green-600 dark:text-green-400">{appliedPromo.description}</p>
                                                        </div>
                                                    </div>
                                                    <button onClick={removePromo} className="text-xs font-medium text-red-500 hover:text-red-700 dark:hover:text-red-400">Hapus</button>
                                                </div>
                                            ) : (
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={promoCodeInput}
                                                        onChange={(e) => setPromoCodeInput(e.target.value)}
                                                        placeholder="Punya kode promo?"
                                                        className="w-full pl-4 pr-24 py-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 transition-all uppercase placeholder:normal-case"
                                                    />
                                                    <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                                                        <button
                                                            onClick={handleApplyPromo}
                                                            disabled={!promoCodeInput.trim()}
                                                            className="px-3 py-1.5 bg-accent text-white text-xs font-medium rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                                        >
                                                            Terapkan
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="border-t border-black/10 dark:border-white/10 pt-4 space-y-2 text-sm">
                                            <div className="flex justify-between"><span className="text-text-muted dark:text-gray-400">Subtotal</span><span className="font-medium text-text-primary dark:text-gray-200">Rp {subtotal.toLocaleString('id-ID')}</span></div>
                                            {discount > 0 && (
                                                <div className="flex justify-between text-green-600 dark:text-green-400">
                                                    <span>Diskon</span>
                                                    <span>-Rp {discount.toLocaleString('id-ID')}</span>
                                                </div>
                                            )}
                                            {deliveryDiscount > 0 && (
                                                <div className="flex justify-between text-green-600 dark:text-green-400">
                                                    <span>Diskon Ongkir</span>
                                                    <span>-Rp {deliveryDiscount.toLocaleString('id-ID')}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between"><span className="text-text-muted dark:text-gray-400">Pajak (est. 10%)</span><span className="font-medium text-text-primary dark:text-gray-200">Rp {tax.toLocaleString('id-ID')}</span></div>
                                            <div className="flex justify-between font-bold text-base pt-2 border-t border-black/10 dark:border-white/10 mt-2"><span className="text-text-primary dark:text-gray-100">Total</span><span className="text-accent">Rp {finalTotal.toLocaleString('id-ID')}</span></div>
                                        </div>
                                        <button onClick={() => changeStep(1)} disabled={cart.length === 0} className="mt-6 w-full p-3 rounded-xl bg-accent text-white font-medium text-center hover:opacity-90 transition-opacity disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed">Lanjutkan</button>
                                    </>
                                )}
                            </>
                        )}

                        {/* Step 1: Order Type */}
                        {checkoutStep === 1 && (
                            <div className="flex-grow space-y-3">
                                {[
                                    { type: 'Dine In' as const, icon: UtensilsCrossed, title: 'Makan di Tempat', desc: 'Nikmati hidangan langsung di restoran.' },
                                    { type: 'Take Away' as const, icon: Package, title: 'Dibawa Pulang', desc: 'Pesan sekarang, ambil pesanan Anda nanti.' },
                                    { type: 'Delivery' as const, icon: Bike, title: 'Diantar', desc: 'Kami akan mengantar pesanan ke lokasi Anda.' }
                                ].map(item => (
                                    <button
                                        key={item.type}
                                        onClick={() => handleSelectOrderType(item.type)}
                                        className="w-full flex items-start text-left p-4 bg-white/60 dark:bg-black/30 backdrop-blur-sm border border-black/5 dark:border-white/10 rounded-2xl hover:bg-white/80 dark:hover:bg-black/40 hover:border-black/10 dark:hover:border-white/15 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group"
                                    >
                                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mr-3.5 group-hover:bg-accent/15 group-hover:scale-110 transition-all duration-200">
                                            <item.icon className="w-5 h-5 text-accent" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-[15px] text-text-primary dark:text-gray-100 mb-0.5">{item.title}</p>
                                            <p className="text-[13px] text-text-muted dark:text-gray-400 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Step 2: Details */}
                        {checkoutStep === 2 && (
                            <div className="flex-grow flex flex-col">
                                <div className="flex-grow space-y-6">
                                    {orderType === 'Dine In' && (
                                        <div className="space-y-6">
                                            {/* Table Number Input */}
                                            <div className="px-0.5">
                                                <label htmlFor="tableNumber" className="block text-[13px] font-medium text-text-muted dark:text-gray-400 mb-2.5">
                                                    Nomor Meja Anda
                                                </label>
                                                <input
                                                    type="text"
                                                    id="tableNumber"
                                                    value={details.tableNumber}
                                                    onChange={e => setDetails({ ...details, tableNumber: e.target.value })}
                                                    placeholder="Cth: 12A"
                                                    className="w-full px-4 py-3.5 bg-white/60 dark:bg-black/30 backdrop-blur-sm border border-black/5 dark:border-white/10 rounded-xl text-[15px] text-text-primary dark:text-gray-100 placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 transition-all"
                                                />
                                            </div>

                                            {/* Payment Method Selection */}
                                            <div className="space-y-3 px-0.5">
                                                <label className="block text-[13px] font-medium text-text-muted dark:text-gray-400">
                                                    Pilih Metode Pembayaran
                                                </label>
                                                <div className="space-y-2.5">
                                                    <button
                                                        onClick={() => { setDineInPaymentOption('cashier'); setOnlinePaymentMethod(null); }}
                                                        className={`w-full flex items-center gap-3 p-3.5 border rounded-xl transition-all duration-200 ${dineInPaymentOption === 'cashier'
                                                            ? 'border-accent bg-accent/10 ring-2 ring-accent/30 shadow-sm'
                                                            : 'border-black/5 dark:border-white/10 bg-white/60 dark:bg-black/30 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-black/40 hover:border-black/10 dark:hover:border-white/15 hover:scale-[1.01] active:scale-[0.99]'
                                                            }`}
                                                    >
                                                        <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${dineInPaymentOption === 'cashier' ? 'bg-accent/15' : 'bg-black/5 dark:bg-white/5'
                                                            }`}>
                                                            <svg className={`w-5 h-5 ${dineInPaymentOption === 'cashier' ? 'text-accent' : 'text-text-muted'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                                            </svg>
                                                        </div>
                                                        <div className="flex-1 text-left">
                                                            <p className="font-medium text-[14px] text-text-primary dark:text-gray-100">Bayar di Kasir</p>
                                                            <p className="text-[12px] text-text-muted dark:text-gray-400 mt-0.5">Bayar saat mengambil pesanan</p>
                                                        </div>
                                                    </button>
                                                    <button
                                                        onClick={() => setDineInPaymentOption('now')}
                                                        className={`w-full flex items-center gap-3 p-3.5 border rounded-xl transition-all duration-200 ${dineInPaymentOption === 'now'
                                                            ? 'border-accent bg-accent/10 ring-2 ring-accent/30 shadow-sm'
                                                            : 'border-black/5 dark:border-white/10 bg-white/60 dark:bg-black/30 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-black/40 hover:border-black/10 dark:hover:border-white/15 hover:scale-[1.01] active:scale-[0.99]'
                                                            }`}
                                                    >
                                                        <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${dineInPaymentOption === 'now' ? 'bg-accent/15' : 'bg-black/5 dark:bg-white/5'
                                                            }`}>
                                                            <svg className={`w-5 h-5 ${dineInPaymentOption === 'now' ? 'text-accent' : 'text-text-muted'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                            </svg>
                                                        </div>
                                                        <div className="flex-1 text-left">
                                                            <p className="font-medium text-[14px] text-text-primary dark:text-gray-100">Bayar Sekarang</p>
                                                            <p className="text-[12px] text-text-muted dark:text-gray-400 mt-0.5">Bayar online dengan berbagai metode</p>
                                                        </div>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Online Payment Options */}
                                            <AnimatePresence>
                                                {dineInPaymentOption === 'now' && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                                        animate={{ opacity: 1, height: 'auto', marginTop: '1.5rem' }}
                                                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="space-y-3 overflow-hidden px-0.5 pb-0.5"
                                                    >
                                                        <label className="block text-[13px] font-medium text-text-muted dark:text-gray-400">
                                                            Pilih Pembayaran Online
                                                        </label>
                                                        <div className="space-y-2">
                                                            <button
                                                                onClick={() => setOnlinePaymentMethod('qris')}
                                                                className={`w-full flex items-center gap-3 p-3 border rounded-xl transition-all duration-200 ${onlinePaymentMethod === 'qris'
                                                                    ? 'border-accent bg-accent/10 ring-2 ring-accent/30 shadow-sm'
                                                                    : 'border-black/5 dark:border-white/10 bg-white/60 dark:bg-black/30 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-black/40 hover:border-black/10 dark:hover:border-white/15 hover:scale-[1.01] active:scale-[0.99]'
                                                                    }`}
                                                            >
                                                                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${onlinePaymentMethod === 'qris' ? 'bg-accent/15' : 'bg-black/5 dark:bg-white/5'
                                                                    }`}>
                                                                    <svg className={`w-4 h-4 ${onlinePaymentMethod === 'qris' ? 'text-accent' : 'text-text-muted'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                                                    </svg>
                                                                </div>
                                                                <span className="font-medium text-[13px] text-text-primary dark:text-gray-100">QRIS</span>
                                                            </button>
                                                            <button
                                                                onClick={() => setOnlinePaymentMethod('e-wallet')}
                                                                className={`w-full flex items-center gap-3 p-3 border rounded-xl transition-all duration-200 ${onlinePaymentMethod === 'e-wallet'
                                                                    ? 'border-accent bg-accent/10 ring-2 ring-accent/30 shadow-sm'
                                                                    : 'border-black/5 dark:border-white/10 bg-white/60 dark:bg-black/30 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-black/40 hover:border-black/10 dark:hover:border-white/15 hover:scale-[1.01] active:scale-[0.99]'
                                                                    }`}
                                                            >
                                                                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${onlinePaymentMethod === 'e-wallet' ? 'bg-accent/15' : 'bg-black/5 dark:bg-white/5'
                                                                    }`}>
                                                                    <svg className={`w-4 h-4 ${onlinePaymentMethod === 'e-wallet' ? 'text-accent' : 'text-text-muted'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                                                    </svg>
                                                                </div>
                                                                <span className="font-medium text-[13px] text-text-primary dark:text-gray-100">E-Wallet</span>
                                                            </button>
                                                            <button
                                                                onClick={() => setOnlinePaymentMethod('bank-transfer')}
                                                                className={`w-full flex items-center gap-3 p-3 border rounded-xl transition-all duration-200 ${onlinePaymentMethod === 'bank-transfer'
                                                                    ? 'border-accent bg-accent/10 ring-2 ring-accent/30 shadow-sm'
                                                                    : 'border-black/5 dark:border-white/10 bg-white/60 dark:bg-black/30 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-black/40 hover:border-black/10 dark:hover:border-white/15 hover:scale-[1.01] active:scale-[0.99]'
                                                                    }`}
                                                            >
                                                                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${onlinePaymentMethod === 'bank-transfer' ? 'bg-accent/15' : 'bg-black/5 dark:bg-white/5'
                                                                    }`}>
                                                                    <svg className={`w-4 h-4 ${onlinePaymentMethod === 'bank-transfer' ? 'text-accent' : 'text-text-muted'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                                                                    </svg>
                                                                </div>
                                                                <span className="font-medium text-[13px] text-text-primary dark:text-gray-100">Bank Transfer</span>
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                    {orderType === 'Take Away' && <div><label htmlFor="pickupTime" className="block text-sm font-medium text-text-muted dark:text-gray-400 mb-2">Waktu Pengambilan</label><select id="pickupTime" value={details.pickupTime} onChange={e => setDetails({ ...details, pickupTime: e.target.value })} className={commonInputClasses}><option>Sekarang (15-20 mnt)</option><option>18:00</option><option>18:30</option><option>19:00</option></select></div>}
                                    {orderType === 'Delivery' && (
                                        <div className="space-y-4">
                                            {/* Delivery Provider Selection */}
                                            <div className="space-y-3 px-0.5">
                                                <label className="block text-[13px] font-medium text-text-muted dark:text-gray-400">
                                                    Pilih Layanan Pengiriman
                                                </label>
                                                <div className="space-y-2.5">
                                                    {/* Gojek */}
                                                    <button
                                                        onClick={() => {
                                                            setDeliveryProvider('gojek');
                                                            changeStep(3);
                                                        }}
                                                        className={`w-full flex items-center gap-3 p-3.5 border rounded-xl transition-all duration-200 ${deliveryProvider === 'gojek'
                                                            ? 'border-accent bg-accent/10 ring-2 ring-accent/30 shadow-sm'
                                                            : 'border-black/5 dark:border-white/10 bg-white/60 dark:bg-black/30 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-black/40 hover:border-black/10 dark:hover:border-white/15 hover:scale-[1.01] active:scale-[0.99]'
                                                            }`}
                                                    >
                                                        <div className="flex-shrink-0">
                                                            <GojekLogo size={36} />
                                                        </div>
                                                        <div className="flex-1 text-left">
                                                            <p className="font-medium text-[14px] text-text-primary dark:text-gray-100">Gojek</p>
                                                            <p className="text-[12px] text-text-muted dark:text-gray-400 mt-0.5">Diantar oleh mitra Gojek</p>
                                                        </div>
                                                    </button>

                                                    {/* Grab */}
                                                    <button
                                                        onClick={() => {
                                                            setDeliveryProvider('grab');
                                                            changeStep(3);
                                                        }}
                                                        className={`w-full flex items-center gap-3 p-3.5 border rounded-xl transition-all duration-200 ${deliveryProvider === 'grab'
                                                            ? 'border-accent bg-accent/10 ring-2 ring-accent/30 shadow-sm'
                                                            : 'border-black/5 dark:border-white/10 bg-white/60 dark:bg-black/30 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-black/40 hover:border-black/10 dark:hover:border-white/15 hover:scale-[1.01] active:scale-[0.99]'
                                                            }`}
                                                    >
                                                        <div className="flex-shrink-0">
                                                            <GrabLogo size={36} />
                                                        </div>
                                                        <div className="flex-1 text-left">
                                                            <p className="font-medium text-[14px] text-text-primary dark:text-gray-100">Grab</p>
                                                            <p className="text-[12px] text-text-muted dark:text-gray-400 mt-0.5">Diantar oleh mitra Grab</p>
                                                        </div>
                                                    </button>

                                                    {/* DineOS */}
                                                    <button
                                                        onClick={() => {
                                                            setDeliveryProvider('dineos');
                                                            changeStep(3);
                                                        }}
                                                        className={`w-full flex items-center gap-3 p-3.5 border rounded-xl transition-all duration-200 ${deliveryProvider === 'dineos'
                                                            ? 'border-accent bg-accent/10 ring-2 ring-accent/30 shadow-sm'
                                                            : 'border-black/5 dark:border-white/10 bg-white/60 dark:bg-black/30 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-black/40 hover:border-black/10 dark:hover:border-white/15 hover:scale-[1.01] active:scale-[0.99]'
                                                            }`}
                                                    >
                                                        <div className="flex-shrink-0">
                                                            <DineOSLogo size={36} />
                                                        </div>
                                                        <div className="flex-1 text-left">
                                                            <p className="font-medium text-[14px] text-text-primary dark:text-gray-100">DineOS</p>
                                                            <p className="text-[12px] text-text-muted dark:text-gray-400 mt-0.5">Diantar oleh kurir DineOS</p>
                                                        </div>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {(orderType === 'Dine In' || orderType === 'Take Away') && (
                                    <div className="pt-6 mt-auto">
                                        <button
                                            onClick={handleNextToSummary}
                                            className="w-full p-3 rounded-xl bg-accent text-white font-medium hover:opacity-90 transition-opacity"
                                        >
                                            Lanjutkan
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 3: Delivery Provider Execution */}
                        {checkoutStep === 3 && orderType === 'Delivery' && (
                            <div className="flex-grow flex flex-col">
                                <div className="flex-grow space-y-6">
                                    {/* Show provider-specific content */}
                                    {deliveryProvider === 'gojek' && (
                                        <div className="space-y-4">
                                            <div className="flex flex-col items-center justify-center py-8">
                                                <GojekLogo size={80} />
                                                <h3 className="text-lg font-semibold text-text-primary dark:text-gray-100 mt-4">Pengiriman via Gojek</h3>
                                                <p className="text-sm text-text-muted dark:text-gray-400 text-center mt-2 px-4">
                                                    Pesanan Anda akan diantar oleh mitra Gojek
                                                </p>
                                            </div>
                                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                                                <p className="text-sm text-blue-800 dark:text-blue-300">
                                                    Setelah konfirmasi pesanan, Anda akan diarahkan ke aplikasi Gojek untuk menyelesaikan pengiriman.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {deliveryProvider === 'grab' && (
                                        <div className="space-y-4">
                                            <div className="flex flex-col items-center justify-center py-8">
                                                <GrabLogo size={80} />
                                                <h3 className="text-lg font-semibold text-text-primary dark:text-gray-100 mt-4">Pengiriman via Grab</h3>
                                                <p className="text-sm text-text-muted dark:text-gray-400 text-center mt-2 px-4">
                                                    Pesanan Anda akan diantar oleh mitra Grab
                                                </p>
                                            </div>
                                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                                                <p className="text-sm text-blue-800 dark:text-blue-300">
                                                    Setelah konfirmasi pesanan, Anda akan diarahkan ke aplikasi Grab untuk menyelesaikan pengiriman.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {deliveryProvider === 'dineos' && (
                                        <div className="space-y-4">
                                            <div className="flex flex-col items-center justify-center py-6">
                                                <DineOSLogo size={80} />
                                                <h3 className="text-lg font-semibold text-text-primary dark:text-gray-100 mt-4">Pengiriman via DineOS</h3>
                                                <p className="text-sm text-text-muted dark:text-gray-400 text-center mt-2 px-4">
                                                    Pesanan Anda akan diantar oleh kurir DineOS
                                                </p>
                                            </div>

                                            {/* Map and Address for DineOS */}
                                            <div>
                                                <label className="block text-sm font-medium text-text-muted dark:text-gray-400 mb-2">Lokasi Pengiriman</label>
                                                <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border border-black/5 dark:border-white/10 mb-3">
                                                    <DeliveryMapWrapper
                                                        onLocationSelect={(lat, lng, distance) => {
                                                            setDeliveryDistance(distance);
                                                            setIsCalculatingFee(false);
                                                            addToast(`Lokasi dipilih! Jarak: ${distance}km`, 'success');
                                                        }}
                                                        restaurantLocation={{
                                                            lat: -6.2088,
                                                            lng: 106.8456,
                                                        }}
                                                    />
                                                </div>
                                                <label htmlFor="address" className="block text-sm font-medium text-text-muted dark:text-gray-400 mb-2">Detail Alamat</label>
                                                <textarea
                                                    id="address"
                                                    value={details.address}
                                                    onChange={e => setDetails({ ...details, address: e.target.value })}
                                                    rows={3}
                                                    placeholder="Contoh: Jl. Sudirman No. 123, Gedung A, Lantai 2"
                                                    className={commonInputClasses}
                                                />
                                            </div>

                                            {/* Delivery Cost Calculation */}
                                            {deliveryDistance > 0 && (
                                                <div className="p-4 bg-white/60 dark:bg-black/30 backdrop-blur-sm border border-black/5 dark:border-white/10 rounded-xl space-y-2">
                                                    <h4 className="font-medium text-sm text-text-primary dark:text-gray-100 mb-3">Rincian Biaya Pengiriman</h4>
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="text-text-muted dark:text-gray-400">Biaya Dasar</span>
                                                            <span className="font-medium text-text-primary dark:text-gray-200">Rp {baseDeliveryFee.toLocaleString('id-ID')}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-text-muted dark:text-gray-400">Jarak ({deliveryDistance} km × Rp {costPerKm.toLocaleString('id-ID')})</span>
                                                            <span className="font-medium text-text-primary dark:text-gray-200">Rp {(deliveryDistance * costPerKm).toLocaleString('id-ID')}</span>
                                                        </div>
                                                        <div className="pt-2 border-t border-black/10 dark:border-white/10 flex justify-between">
                                                            <span className="font-semibold text-text-primary dark:text-gray-100">Total Biaya Pengiriman</span>
                                                            <span className="font-bold text-accent">Rp {deliveryFee.toLocaleString('id-ID')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-end pt-4">
                                    <button
                                        onClick={() => {
                                            if (deliveryProvider === 'dineos' && !details.address.trim()) {
                                                addToast('Silakan masukkan alamat pengiriman.', 'error');
                                                return;
                                            }
                                            changeStep(4);
                                        }}
                                        className="px-6 py-2 rounded-lg bg-accent text-white font-medium hover:bg-opacity-90"
                                    >
                                        Lanjutkan
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Summary */}
                        {checkoutStep === 4 && (
                            <div className="flex-grow flex flex-col">
                                <div className="flex-grow space-y-4">
                                    <ul className="divide-y divide-black/10 dark:divide-white/10 max-h-96 overflow-y-auto">
                                        {cart.map(ci => <li key={ci.item.id} className="py-2 flex justify-between text-sm"><span className="text-text-primary dark:text-gray-200 truncate pr-4">{ci.quantity}x {ci.item.name}</span><span className="text-text-muted dark:text-gray-400 flex-shrink-0">{`Rp ${(ci.quantity * Number(ci.item.price.replace(/[^0-9]/g, ''))).toLocaleString('id-ID')}`}</span></li>)}
                                    </ul>
                                    <div className="border-t border-black/10 dark:border-white/10 pt-4 space-y-2 text-sm">
                                        <div className="flex justify-between"><span className="text-text-muted dark:text-gray-400">Subtotal</span><span className="text-text-primary dark:text-gray-200 font-medium">Rp {subtotal.toLocaleString('id-ID')}</span></div>
                                        {discount > 0 && (
                                            <div className="flex justify-between text-green-600 dark:text-green-400">
                                                <span>Diskon</span>
                                                <span>-Rp {discount.toLocaleString('id-ID')}</span>
                                            </div>
                                        )}
                                        {orderType === 'Delivery' && <div className="flex justify-between"><span className="text-text-muted dark:text-gray-400">Biaya Pengiriman</span><span className="text-text-primary dark:text-gray-200 font-medium">Rp {deliveryFee.toLocaleString('id-ID')}</span></div>}
                                        {deliveryDiscount > 0 && (
                                            <div className="flex justify-between text-green-600 dark:text-green-400">
                                                <span>Diskon Ongkir</span>
                                                <span>-Rp {deliveryDiscount.toLocaleString('id-ID')}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between"><span className="text-text-muted dark:text-gray-400">Pajak (10%)</span><span className="text-text-primary dark:text-gray-200 font-medium">Rp {tax.toLocaleString('id-ID')}</span></div>
                                        <div className="flex justify-between font-semibold text-base pt-2 border-t border-black/10 dark:border-white/10 mt-2"><span className="text-text-primary dark:text-gray-100">Total</span><span className="text-accent">Rp {finalTotal.toLocaleString('id-ID')}</span></div>
                                    </div>
                                </div>
                                <div className="flex justify-end pt-6"><button onClick={handleSubmitOrder} disabled={isSubmitting} className="w-full p-3 rounded-xl bg-accent text-white font-medium text-center hover:opacity-90 transition-opacity disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed">{isSubmitting ? 'Memproses...' : (orderType === 'Dine In' && dineInPaymentOption === 'cashier' ? 'Konfirmasi Pesanan' : 'Konfirmasi & Bayar')}</button></div>
                            </div>
                        )}

                        {/* Step 5: QRIS Payment */}
                        {checkoutStep === 5 && (
                            <div className="flex-grow flex flex-col items-center justify-center py-6">
                                <div className="text-center mb-6">
                                    <h3 className="text-lg font-semibold text-text-primary dark:text-gray-100 mb-2">Scan QR Code untuk Bayar</h3>
                                    <p className="text-sm text-text-muted dark:text-gray-400">Total Pembayaran</p>
                                    <p className="text-2xl font-bold text-accent mt-1">Rp {finalTotal.toLocaleString('id-ID')}</p>
                                </div>

                                {/* QR Code */}
                                <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
                                    <div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center">
                                        <svg className="w-full h-full p-4" viewBox="0 0 100 100" fill="#000">
                                            <rect x="0" y="0" width="7" height="7" />
                                            <rect x="8" y="0" width="7" height="7" />
                                            <rect x="16" y="0" width="7" height="7" />
                                            <rect x="24" y="0" width="7" height="7" />
                                            <rect x="32" y="0" width="7" height="7" />
                                            <rect x="40" y="0" width="7" height="7" />
                                            <rect x="48" y="0" width="7" height="7" />
                                            <rect x="64" y="0" width="7" height="7" />
                                            <rect x="72" y="0" width="7" height="7" />
                                            <rect x="80" y="0" width="7" height="7" />
                                            <rect x="88" y="0" width="7" height="7" />
                                            <rect x="0" y="8" width="7" height="7" />
                                            <rect x="48" y="8" width="7" height="7" />
                                            <rect x="64" y="8" width="7" height="7" />
                                            <rect x="88" y="8" width="7" height="7" />
                                            {/* Add more QR pattern rectangles for visual effect */}
                                            <rect x="0" y="88" width="7" height="7" />
                                            <rect x="8" y="88" width="7" height="7" />
                                            <rect x="16" y="88" width="7" height="7" />
                                            <rect x="24" y="88" width="7" height="7" />
                                            <rect x="32" y="88" width="7" height="7" />
                                            <rect x="40" y="88" width="7" height="7" />
                                            <rect x="48" y="88" width="7" height="7" />
                                        </svg>
                                    </div>
                                </div>

                                <p className="text-xs text-text-muted dark:text-gray-400 text-center mb-6 px-4">
                                    Buka aplikasi pembayaran QRIS Anda dan scan kode di atas
                                </p>

                                <button
                                    onClick={() => {
                                        changeStep(6);
                                        clearCart();
                                        setTimeout(() => {
                                            onClose();
                                            navigate(withTenant('/akun/pesanan/aktif'), { state: { refresh: Date.now() } });
                                            addToast('Pesanan berhasil dibuat!', 'success');
                                        }, 2500);
                                    }}
                                    className="px-6 py-2.5 rounded-xl bg-accent text-white font-medium hover:opacity-90 transition-opacity"
                                >
                                    Saya Sudah Bayar
                                </button>
                            </div>
                        )}

                        {/* Step 6: Success */}
                        {checkoutStep === 6 && (
                            <div className="text-center flex flex-col items-center justify-center h-full pt-8">
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1, transition: { type: 'spring', stiffness: 260, damping: 20, delay: 0.2 } }} className="w-16 h-16 bg-success rounded-full flex items-center justify-center text-white mb-4"><svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></motion.div>
                                <h3 className="text-xl font-semibold tracking-tight text-text-primary dark:text-gray-100">Pesanan Diterima!</h3>
                                <p className="text-text-muted dark:text-gray-400 mt-2">Pesanan Anda sedang kami siapkan. Terima kasih!</p>
                            </div>
                        )}

                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default CartContent;
