



import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMenuItems, MenuItem, addOrder, Order } from '../../data/mockDB';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useToast } from '../../hooks/useToast';
import { Plus, Minus, Trash2, ShoppingCart, X, UtensilsCrossed, Package, Bike, Check } from 'lucide-react';
import SkeletonLoader from '../../components/SkeletonLoader';
import Modal from '../../components/Modal';
import { OrderItem } from '../../data/mockDB';
import MenuCardSkeleton from '../../components/MenuCardSkeleton';

const DUMMY_SKELETON_CATEGORIES: string[] = ['Hidangan Pembuka', 'Hidangan Utama', 'Minuman'];

const CustomerPesanOnlinePage: React.FC = () => {
    const [menu, setMenu] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();
    const { cart, addToCart, updateQuantity, removeFromCart, clearCart, total } = useCart();
    const { addToast } = useToast();
    
    // State for cart and checkout modals
    const [isCartModalOpen, setIsCartModalOpen] = useState(false);
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [checkoutStep, setCheckoutStep] = useState(1);
    const [orderType, setOrderType] = useState<'Dine In' | 'Take Away' | 'Delivery' | null>(null);
    
    // State for order details
    const [dineInDetails, setDineInDetails] = useState({ tableNumber: '' });
    const [takeAwayDetails, setTakeAwayDetails] = useState({ pickupTime: '18:00' });
    const [deliveryDetails, setDeliveryDetails] = useState({ address: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    useEffect(() => {
        const loadMenu = async () => {
            setLoading(true);
            const items = await fetchMenuItems();
            setMenu(items);
            setLoading(false);
        };
        loadMenu();
    }, []);

    const groupedMenu: Record<string, MenuItem[]> = useMemo(() => {
        // FIX: The type of `items` was `unknown` because `reduce` was not typed correctly.
        // By explicitly typing the accumulator in the reduce callback, we ensure that `groupedMenu`
        // is correctly typed, which resolves the error on `items.map`.
        // FIX: Add generic type to `reduce` to correctly infer the return type. This resolves the error on `items.map`.
        // FIX: Add a generic type to `menu.reduce` to ensure `groupedMenu` is correctly typed as `Record<string, MenuItem[]>`. This resolves the TypeScript error where `items` was inferred as `unknown` and lacked a `.map` method.
        return menu.reduce<Record<string, MenuItem[]>>((acc, item) => {
            const { category } = item;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(item);
            return acc;
        }, {});
    }, [menu]);

    const handleAddToCart = (item: MenuItem) => {
        addToCart(item);
    };

    const handleStartCheckout = () => {
        if (isCartModalOpen) setIsCartModalOpen(false);
        setIsCheckoutModalOpen(true);
    };
    
    const handleCloseCheckout = () => {
        setIsCheckoutModalOpen(false);
        // Reset state after a delay for the closing animation
        setTimeout(() => {
            setCheckoutStep(1);
            setOrderType(null);
        }, 300);
    };

    const handleSelectOrderType = (type: 'Dine In' | 'Take Away' | 'Delivery') => {
        setOrderType(type);
        setCheckoutStep(2);
    };

    const handleSubmitOrder = async () => {
        if (!user || !orderType) return;
        
        setIsSubmitting(true);
        const orderItems: OrderItem[] = cart.map(ci => ({ menuItem: ci.item, quantity: ci.quantity }));

        const orderDetails: Omit<Order, 'id' | 'customerId' | 'orderNumber' | 'date' | 'status'> = {
            items: orderItems,
            total: `Rp ${(total * 1.1).toLocaleString('id-ID')}`, // Example total with 10% tax
            type: orderType,
            paymentMethod: { id: 1, type: 'E-Wallet', provider: 'GoPay', last4: '' }, // Mock payment
        };
        
        if (orderType === 'Dine In') {
            if (!dineInDetails.tableNumber) {
                addToast('Silakan masukkan nomor meja.', 'error');
                setIsSubmitting(false);
                return;
            }
            orderDetails.tableNumber = dineInDetails.tableNumber;
        } else if (orderType === 'Take Away') {
            orderDetails.pickupTime = takeAwayDetails.pickupTime;
        } else if (orderType === 'Delivery') {
            if (!deliveryDetails.address) {
                addToast('Silakan masukkan alamat pengiriman.', 'error');
                setIsSubmitting(false);
                return;
            }
            orderDetails.deliveryAddress = { id: Date.now(), label: 'Alamat Pengiriman', fullAddress: deliveryDetails.address, city: 'Kota', postalCode: '00000' };
        }

        try {
            await addOrder(user.id, orderDetails);
            addToast('Pesanan Anda berhasil dibuat!', 'success');
            clearCart();
            handleCloseCheckout();
            navigate('/akun/riwayat-pesanan');
        } catch (error) {
            addToast('Gagal membuat pesanan.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

    const CartContent = ({ onCheckout }: { onCheckout: () => void }) => (
        <div className="flex flex-col h-full">
            <h3 className="text-xl font-bold text-dashboard-text-primary mb-4 pb-4 border-b border-dashboard-border">Keranjang Anda</h3>
            {cart.length === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center text-center">
                    <ShoppingCart className="w-16 h-16 text-gray-300" />
                    <p className="mt-4 text-dashboard-text-secondary">Keranjang Anda kosong.</p>
                    <p className="text-sm text-dashboard-text-secondary">Tambahkan item dari menu untuk memulai.</p>
                </div>
            ) : (
                <>
                    <div className="flex-grow overflow-y-auto -mr-3 pr-3 space-y-4">
                        {cart.map(cartItem => (
                            <div key={cartItem.item.id} className="flex items-center gap-4">
                                <img src={cartItem.item.image} alt={cartItem.item.name} className="w-16 h-16 rounded-lg object-cover" />
                                <div className="flex-grow">
                                    <p className="font-semibold text-sm text-dashboard-text-primary">{cartItem.item.name}</p>
                                    <p className="text-xs text-dashboard-text-secondary">{cartItem.item.price}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <button onClick={() => updateQuantity(cartItem.item.id, cartItem.quantity - 1)} className="p-1 rounded-full bg-dashboard-border text-dashboard-text-secondary hover:bg-gray-300"><Minus className="w-3 h-3" /></button>
                                        <span className="text-sm font-medium w-5 text-center">{cartItem.quantity}</span>
                                        <button onClick={() => updateQuantity(cartItem.item.id, cartItem.quantity + 1)} className="p-1 rounded-full bg-dashboard-border text-dashboard-text-secondary hover:bg-gray-300"><Plus className="w-3 h-3" /></button>
                                    </div>
                                </div>
                                <button onClick={() => removeFromCart(cartItem.item.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded-full"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-dashboard-border mt-4 pt-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-dashboard-text-secondary">Subtotal</span>
                            <span className="font-medium text-dashboard-text-primary">Rp {total.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-dashboard-text-secondary">Pajak & Biaya (10%)</span>
                            <span className="font-medium text-dashboard-text-primary">Rp {(total * 0.1).toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between font-bold text-base pt-2 border-t border-dashboard-border mt-2">
                            <span className="text-dashboard-text-primary">Total</span>
                            <span className="text-dashboard-active">Rp {(total * 1.1).toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                </>
            )}
            <button 
                onClick={onCheckout}
                disabled={cart.length === 0}
                className="w-full mt-6 bg-dashboard-active text-white font-bold py-3 rounded-lg hover:bg-opacity-90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">
                Lanjutkan ke Pembayaran
            </button>
        </div>
    );

    const CheckoutStep1 = () => (
        <div className="text-center">
            <h3 className="text-xl font-bold text-dashboard-text-primary mb-2">Pilih Jenis Pesanan</h3>
            <p className="text-dashboard-text-secondary mb-6">Bagaimana Anda ingin menikmati pesanan Anda?</p>
            <div className="space-y-4">
                 <button onClick={() => handleSelectOrderType('Dine In')} className="w-full flex items-center text-left p-4 border border-dashboard-border rounded-lg hover:bg-gray-50 hover:border-dashboard-active">
                    <UtensilsCrossed className="w-8 h-8 mr-4 text-dashboard-active"/>
                    <div>
                        <p className="font-semibold">Makan di Tempat</p>
                        <p className="text-sm text-dashboard-text-secondary">Pesan dan nikmati hidangan di restoran kami.</p>
                    </div>
                </button>
                <button onClick={() => handleSelectOrderType('Take Away')} className="w-full flex items-center text-left p-4 border border-dashboard-border rounded-lg hover:bg-gray-50 hover:border-dashboard-active">
                    <Package className="w-8 h-8 mr-4 text-dashboard-active"/>
                    <div>
                        <p className="font-semibold">Dibawa Pulang</p>
                        <p className="text-sm text-dashboard-text-secondary">Pesan sekarang, ambil nanti di restoran.</p>
                    </div>
                </button>
                 <button onClick={() => handleSelectOrderType('Delivery')} className="w-full flex items-center text-left p-4 border border-dashboard-border rounded-lg hover:bg-gray-50 hover:border-dashboard-active">
                    <Bike className="w-8 h-8 mr-4 text-dashboard-active"/>
                    <div>
                        <p className="font-semibold">Diantar</p>
                        <p className="text-sm text-dashboard-text-secondary">Kami akan mengantar pesanan ke lokasi Anda.</p>
                    </div>
                </button>
            </div>
        </div>
    );
    
    const CheckoutStep2 = () => (
        <div className="space-y-6">
            {orderType === 'Dine In' && (
                <div>
                    <label htmlFor="tableNumber" className="block text-sm font-medium text-dashboard-text-secondary mb-2">Nomor Meja</label>
                    <input type="text" id="tableNumber" value={dineInDetails.tableNumber} onChange={e => setDineInDetails({ tableNumber: e.target.value })} placeholder="Cth: 12A" className="w-full p-3 border border-dashboard-border rounded-lg"/>
                </div>
            )}
            {orderType === 'Take Away' && (
                <div>
                    <label htmlFor="pickupTime" className="block text-sm font-medium text-dashboard-text-secondary mb-2">Waktu Pengambilan</label>
                    <select id="pickupTime" value={takeAwayDetails.pickupTime} onChange={e => setTakeAwayDetails({ pickupTime: e.target.value })} className="w-full p-3 border border-dashboard-border rounded-lg">
                        <option value="18:00">18:00</option>
                        <option value="18:30">18:30</option>
                        <option value="19:00">19:00</option>
                    </select>
                </div>
            )}
            {orderType === 'Delivery' && (
                <div>
                    <label htmlFor="address" className="block text-sm font-medium text-dashboard-text-secondary mb-2">Alamat Pengiriman</label>
                    <textarea id="address" value={deliveryDetails.address} onChange={e => setDeliveryDetails({ address: e.target.value })} rows={3} placeholder="Masukkan alamat lengkap Anda" className="w-full p-3 border border-dashboard-border rounded-lg"/>
                </div>
            )}
            <div className="flex justify-between pt-4">
                <button onClick={() => setCheckoutStep(1)} className="px-6 py-2 rounded-lg text-dashboard-text-secondary font-medium hover:bg-gray-100">Kembali</button>
                <button onClick={() => setCheckoutStep(3)} className="px-6 py-2 rounded-lg bg-dashboard-active text-white font-medium hover:bg-opacity-90">Lanjutkan</button>
            </div>
        </div>
    );
    
    const CheckoutStep3 = () => (
         <div>
            <h3 className="text-xl font-bold text-dashboard-text-primary mb-4 text-center">Konfirmasi Pesanan</h3>
            <div className="bg-dashboard-bg p-4 rounded-lg space-y-2 text-sm mb-6">
                <div className="flex justify-between"><span className="text-dashboard-text-secondary">Jenis Pesanan</span><span className="font-medium">{orderType}</span></div>
                {orderType === 'Dine In' && <div className="flex justify-between"><span className="text-dashboard-text-secondary">No. Meja</span><span className="font-medium">{dineInDetails.tableNumber}</span></div>}
                {orderType === 'Take Away' && <div className="flex justify-between"><span className="text-dashboard-text-secondary">Waktu Ambil</span><span className="font-medium">{takeAwayDetails.pickupTime}</span></div>}
                {orderType === 'Delivery' && <div className="flex justify-between"><span className="text-dashboard-text-secondary">Alamat</span><span className="font-medium truncate max-w-[150px]">{deliveryDetails.address}</span></div>}
            </div>
             <div className="flex justify-between font-bold text-lg pt-2 border-t border-dashboard-border">
                <span className="text-dashboard-text-primary">Total Pembayaran</span>
                <span className="text-dashboard-active">Rp {(total * 1.1).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between pt-8">
                <button onClick={() => setCheckoutStep(2)} className="px-6 py-2 rounded-lg text-dashboard-text-secondary font-medium hover:bg-gray-100">Kembali</button>
                <button onClick={handleSubmitOrder} disabled={isSubmitting} className="px-6 py-2 rounded-lg bg-dashboard-active text-white font-medium hover:bg-opacity-90 disabled:bg-gray-400">
                    {isSubmitting ? 'Memproses...' : 'Konfirmasi & Bayar'}
                </button>
            </div>
        </div>
    );

    return (
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            <div className="lg:col-span-2 space-y-10">
                <div>
                    <h2 className="text-3xl font-bold font-sans text-dashboard-text-primary">Pesan</h2>
                    <p className="text-dashboard-text-secondary mt-1">Jelajahi menu kami dan tambahkan item ke keranjang Anda.</p>
                </div>
                {loading ? (
                    DUMMY_SKELETON_CATEGORIES.map((category) => (
                        <section key={category}>
                             <SkeletonLoader className="h-8 w-48 mb-6 rounded bg-gray-200 dark:bg-gray-700" />
                             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                <MenuCardSkeleton />
                                <MenuCardSkeleton />
                                <MenuCardSkeleton />
                            </div>
                        </section>
                    ))
                ) : (
                    Object.entries(groupedMenu).map(([category, items]) => (
                        <div key={category}>
                             <h3 className="text-2xl font-bold font-sans text-dashboard-text-primary mb-6">{category}</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {items.map(item => (
                                    <div key={item.id} className="bg-dashboard-surface p-4 rounded-xl shadow-md flex gap-4 transition-shadow hover:shadow-lg">
                                        <div className="flex-grow">
                                            <h4 className="font-bold text-dashboard-text-primary">{item.name}</h4>
                                            <p className="text-sm text-dashboard-text-secondary mt-1 text-ellipsis overflow-hidden h-10">{item.description}</p>
                                            <p className="font-semibold text-dashboard-active my-2">{item.price}</p>
                                            <button onClick={() => handleAddToCart(item)} className="text-sm font-medium bg-dashboard-active/10 text-dashboard-active px-4 py-1.5 rounded-full hover:bg-dashboard-active/20 transition-colors">
                                                Tambah
                                            </button>
                                        </div>
                                        <img src={item.image} alt={item.name} className="w-24 h-24 rounded-lg object-cover flex-shrink-0" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            <aside className="hidden lg:block sticky top-24 h-[calc(100vh-7rem)]">
                <div className="bg-dashboard-surface p-6 rounded-2xl shadow-lg h-full">
                   <CartContent onCheckout={handleStartCheckout} />
                </div>
            </aside>
            
            {cartItemCount > 0 && (
                <div className="lg:hidden fixed bottom-6 right-6 z-40">
                    <button 
                        onClick={() => setIsCartModalOpen(true)}
                        className="bg-dashboard-active text-white rounded-full p-4 shadow-lg flex items-center justify-center"
                    >
                        <ShoppingCart className="w-6 h-6" />
                        <span className="absolute -top-1 -right-1 bg-white text-dashboard-active text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-dashboard-active">
                            {cartItemCount}
                        </span>
                    </button>
                </div>
            )}
            
            <Modal isOpen={isCartModalOpen} onClose={() => setIsCartModalOpen(false)} title="Keranjang Anda">
                <div className="h-[60vh]">
                    <CartContent onCheckout={handleStartCheckout} />
                </div>
            </Modal>
            
             <Modal isOpen={isCheckoutModalOpen} onClose={handleCloseCheckout} title="Checkout Pesanan">
                <div className="min-h-[350px]">
                    {checkoutStep === 1 && <CheckoutStep1 />}
                    {checkoutStep === 2 && <CheckoutStep2 />}
                    {checkoutStep === 3 && <CheckoutStep3 />}
                </div>
            </Modal>
        </div>
    );
};

export default CustomerPesanOnlinePage;