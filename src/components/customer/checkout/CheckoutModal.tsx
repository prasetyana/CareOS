
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useCart } from '../../../hooks/useCart';
import { useToast } from '../../../hooks/useToast';
import { addOrder, Order } from '../../../data/mockDB';
import { Address, PaymentMethod } from '../../../data/types/customer';
import Modal from '../../Modal';
import { UtensilsCrossed, Package, Bike, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 30 : -30,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 30 : -30,
    opacity: 0,
  }),
};

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [direction, setDirection] = useState(0);
    const [orderType, setOrderType] = useState<'Dine In' | 'Take Away' | 'Delivery' | null>(null);
    const [dineInPaymentOption, setDineInPaymentOption] = useState<'cashier' | 'now' | null>(null);
    const [onlinePaymentMethod, setOnlinePaymentMethod] = useState<'qris' | 'e-wallet' | 'bank-transfer' | null>(null);
    const [details, setDetails] = useState({
        tableNumber: '',
        pickupTime: 'Sekarang (15-20 mnt)',
        address: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { user } = useAuth();
    const { cart, total, clearCart } = useCart();
    const { addToast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isOpen) {
            const timer = setTimeout(() => {
                setCurrentStep(1);
                setOrderType(null);
                setDineInPaymentOption(null);
                setOnlinePaymentMethod(null);
                setDetails({ tableNumber: '', pickupTime: 'Sekarang (15-20 mnt)', address: '' });
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);
    
    const changeStep = (newStep: number, newDirection: number) => {
        setDirection(newDirection);
        setCurrentStep(newStep);
    }

    const handleSelectOrderType = (type: 'Dine In' | 'Take Away' | 'Delivery') => {
        setOrderType(type);
        changeStep(2, 1);
    };

    const getPaymentMethod = (): PaymentMethod => {
        if (orderType === 'Dine In') {
            if (dineInPaymentOption === 'cashier') {
                return { id: 99, type: 'Cash' as any, provider: 'Di Kasir', last4: '' };
            }
            if (dineInPaymentOption === 'now') {
                switch (onlinePaymentMethod) {
                    case 'qris': return { id: 100, type: 'E-Wallet', provider: 'QRIS', last4: '' };
                    case 'e-wallet': return { id: 101, type: 'E-Wallet', provider: 'E-Wallet', last4: '' };
                    case 'bank-transfer': return { id: 102, type: 'Bank Transfer' as any, provider: 'Bank Transfer', last4: '' };
                    default: break;
                }
            }
        }
        return { id: 1, type: 'E-Wallet' as const, provider: 'GoPay', last4: '' }; // Default
    };

    const handleSubmitOrder = async () => {
        if (!user || !orderType) return;
        
        setIsSubmitting(true);

        const deliveryFee = orderType === 'Delivery' ? 15000 : 0;
        const tax = (total + deliveryFee) * 0.1;
        const finalTotal = total + deliveryFee + tax;
        
        const orderDetails: Omit<Order, 'id' | 'customerId' | 'orderNumber' | 'date' | 'status'> = {
            items: cart.map(ci => ({ menuItem: ci.item, quantity: ci.quantity })),
            total: `Rp ${finalTotal.toLocaleString('id-ID')}`,
            type: orderType,
            paymentMethod: getPaymentMethod(),
        };
        
        if (orderType === 'Dine In') {
            orderDetails.tableNumber = details.tableNumber;
        } else if (orderType === 'Take Away') {
            orderDetails.pickupTime = details.pickupTime;
        } else if (orderType === 'Delivery') {
            orderDetails.deliveryAddress = { id: Date.now(), label: 'Alamat Pengiriman', fullAddress: details.address, city: 'Kota', postalCode: '00000' };
        }

        try {
            await addOrder(user.id, orderDetails);
            setDirection(1);
            setCurrentStep(4); // Success step
            clearCart();
            setTimeout(() => {
                onClose();
                navigate('/akun/riwayat-pesanan');
                addToast('Pesanan berhasil dibuat!', 'success');
            }, 2500);
        } catch (error) {
            addToast('Gagal membuat pesanan.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const modalTitle = 
        currentStep === 1 ? "Jenis Pesanan" :
        currentStep === 2 ? "Lengkapi Detail" :
        currentStep === 3 ? "Ringkasan Pesanan" : "Pesanan Diterima!";

    const commonInputClasses = "w-full p-3 border border-black/10 dark:border-white/10 rounded-lg bg-black/5 dark:bg-white/5 focus:ring-1 focus:ring-accent focus:border-accent transition";

    const handleNextToSummary = () => {
        if (orderType === 'Dine In') {
            if (!details.tableNumber.trim()) { addToast('Silakan masukkan nomor meja.', 'error'); return; }
            if (!dineInPaymentOption) { addToast('Silakan pilih metode pembayaran.', 'error'); return; }
            if (dineInPaymentOption === 'now' && !onlinePaymentMethod) { addToast('Silakan pilih jenis pembayaran online.', 'error'); return; }
        } else if (orderType === 'Delivery' && !details.address.trim()) {
            addToast('Silakan masukkan alamat pengiriman.', 'error'); return;
        }
        changeStep(3, 1);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} mobileAs="bottom-sheet">
            <div className="relative min-h-[350px] overflow-hidden">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={currentStep}
                        custom={direction}
                        variants={stepVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
                        className="absolute w-full"
                    >
                    {/* Step 1: Select Order Type */}
                    {currentStep === 1 && (
                        <div className="space-y-4">
                            <p className="text-center text-text-muted mb-4">Bagaimana Anda ingin menikmati pesanan Anda?</p>
                            {[
                                { type: 'Dine In' as const, icon: UtensilsCrossed, title: 'Makan di Tempat', desc: 'Nikmati hidangan langsung di restoran.' },
                                { type: 'Take Away' as const, icon: Package, title: 'Dibawa Pulang', desc: 'Pesan sekarang, ambil pesanan Anda nanti.' },
                                { type: 'Delivery' as const, icon: Bike, title: 'Diantar', desc: 'Kami akan mengantar pesanan ke lokasi Anda.' }
                            ].map(item => (
                                <button key={item.type} onClick={() => handleSelectOrderType(item.type)} className="w-full flex items-center text-left p-4 border border-black/10 dark:border-white/20 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                    <item.icon className="w-8 h-8 mr-4 text-accent"/>
                                    <div>
                                        <p className="font-semibold text-text-primary">{item.title}</p>
                                        <p className="text-sm text-text-muted">{item.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Step 2: Fill Details */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            {orderType === 'Dine In' && (
                                <div className="space-y-6">
                                    <div>
                                        <label htmlFor="tableNumber" className="block text-sm font-medium text-text-muted mb-2">Nomor Meja Anda</label>
                                        <input type="text" id="tableNumber" value={details.tableNumber} onChange={e => setDetails({...details, tableNumber: e.target.value})} placeholder="Cth: 12A" className={commonInputClasses}/>
                                    </div>
                                    <div className="space-y-2 pt-2">
                                        <label className="block text-sm font-medium text-text-muted mb-2">Pilih Metode Pembayaran</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button onClick={() => { setDineInPaymentOption('cashier'); setOnlinePaymentMethod(null); }} className={`p-4 border rounded-xl text-center transition-all ${dineInPaymentOption === 'cashier' ? 'border-accent bg-accent/10 ring-2 ring-accent' : 'border-black/10 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/5'}`}><span className="font-semibold text-text-primary">Bayar di Kasir</span></button>
                                            <button onClick={() => setDineInPaymentOption('now')} className={`p-4 border rounded-xl text-center transition-all ${dineInPaymentOption === 'now' ? 'border-accent bg-accent/10 ring-2 ring-accent' : 'border-black/10 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/5'}`}><span className="font-semibold text-text-primary">Bayar Sekarang</span></button>
                                        </div>
                                    </div>
                                    <AnimatePresence>
                                        {dineInPaymentOption === 'now' && (
                                            <motion.div initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: '1.5rem' }} exit={{ opacity: 0, height: 0, marginTop: 0 }} transition={{ duration: 0.3 }} className="space-y-2 overflow-hidden">
                                                <label className="block text-sm font-medium text-text-muted mb-2">Pilih Pembayaran Online</label>
                                                <div className="flex flex-col sm:flex-row gap-3">
                                                    {(['QRIS', 'E-Wallet', 'Bank Transfer'] as const).map(method => (
                                                        <button key={method} onClick={() => setOnlinePaymentMethod(method.toLowerCase().replace(' ', '-') as any)} className={`flex-1 p-3 border rounded-lg text-sm font-medium transition-colors ${onlinePaymentMethod === method.toLowerCase().replace(' ', '-') ? 'border-accent bg-accent/10 text-accent' : 'border-black/10 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/5'}`}>{method}</button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                            {orderType === 'Take Away' && <div><label htmlFor="pickupTime" className="block text-sm font-medium text-text-muted mb-2">Waktu Pengambilan</label><select id="pickupTime" value={details.pickupTime} onChange={e => setDetails({...details, pickupTime: e.target.value})} className={commonInputClasses}><option>Sekarang (15-20 mnt)</option><option>18:00</option><option>18:30</option><option>19:00</option></select></div>}
                            {orderType === 'Delivery' && <div><label htmlFor="address" className="block text-sm font-medium text-text-muted mb-2">Alamat Pengiriman</label><textarea id="address" value={details.address} onChange={e => setDetails({...details, address: e.target.value})} rows={3} placeholder="Masukkan alamat lengkap Anda" className={commonInputClasses}/></div>}
                            <div className="flex justify-between pt-4"><button onClick={() => changeStep(1, -1)} className="flex items-center gap-2 px-6 py-2 rounded-lg text-text-muted font-medium hover:bg-black/5 dark:hover:bg-white/5"><ArrowLeft size={16}/> Kembali</button><button onClick={handleNextToSummary} className="px-6 py-2 rounded-lg bg-accent text-white font-medium hover:bg-opacity-90">Lanjutkan</button></div>
                        </div>
                    )}
                    
                    {/* Step 3: Summary */}
                    {currentStep === 3 && (
                        <div className="space-y-4">
                            <ul className="divide-y divide-black/10 dark:divide-white/10">
                                {cart.map(ci => <li key={ci.item.id} className="py-2 flex justify-between text-sm"><span className="text-text-primary">{ci.quantity}x {ci.item.name}</span><span className="text-text-muted">{`Rp ${(ci.quantity * Number(ci.item.price.replace(/[^0-9]/g, ''))).toLocaleString('id-ID')}`}</span></li>)}
                            </ul>
                            <div className="border-t border-black/10 dark:border-white/10 pt-4 space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-text-muted">Subtotal</span><span className="text-text-primary font-medium">Rp {total.toLocaleString('id-ID')}</span></div>
                                {orderType === 'Delivery' && <div className="flex justify-between"><span className="text-text-muted">Biaya Pengiriman</span><span className="text-text-primary font-medium">Rp 15.000</span></div>}
                                <div className="flex justify-between"><span className="text-text-muted">Pajak (10%)</span><span className="text-text-primary font-medium">Rp {((total + (orderType === 'Delivery' ? 15000 : 0)) * 0.1).toLocaleString('id-ID')}</span></div>
                                <div className="flex justify-between font-bold text-base pt-2 border-t border-black/10 dark:border-white/10 mt-2"><span className="text-text-primary">Total</span><span className="text-accent">Rp {((total + (orderType === 'Delivery' ? 15000 : 0)) * 1.1).toLocaleString('id-ID')}</span></div>
                            </div>
                            <div className="flex justify-between pt-6"><button onClick={() => changeStep(2, -1)} className="flex items-center gap-2 px-6 py-2 rounded-lg text-text-muted font-medium hover:bg-black/5 dark:hover:bg-white/5"><ArrowLeft size={16}/> Kembali</button><button onClick={handleSubmitOrder} disabled={isSubmitting} className="px-6 py-2 rounded-lg bg-accent text-white font-medium hover:bg-opacity-90 disabled:bg-gray-400">{isSubmitting ? 'Memproses...' : (orderType === 'Dine In' && dineInPaymentOption === 'cashier' ? 'Konfirmasi Pesanan' : 'Konfirmasi & Bayar')}</button></div>
                        </div>
                    )}

                    {/* Step 4: Success */}
                    {currentStep === 4 && (
                        <div className="text-center flex flex-col items-center justify-center pt-8">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1, transition: { type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}} className="w-16 h-16 bg-success rounded-full flex items-center justify-center text-white mb-4">
                                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </motion.div>
                            <h3 className="text-xl font-bold text-text-primary">Pesanan Diterima!</h3>
                            <p className="text-text-muted mt-2">Pesanan Anda sedang kami siapkan. Anda akan diarahkan ke riwayat pesanan.</p>
                        </div>
                    )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </Modal>
    );
};

export default CheckoutModal;
