import React, { createContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { MenuItem, PromoCode, validatePromoCode } from '../data/mockDB';

export interface CartItem {
    item: MenuItem;
    quantity: number;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (item: MenuItem) => void;
    removeFromCart: (itemId: number) => void;
    updateQuantity: (itemId: number, quantity: number) => void;
    setItemQuantity: (item: MenuItem, quantity: number) => void;
    clearCart: () => void;
    total: number;
    subtotal: number;
    discount: number;
    isCartOpen: boolean;
    toggleCart: () => void;
    openCart: () => void;
    closeCart: () => void;
    appliedPromo: PromoCode | null;
    applyPromo: (code: string) => Promise<boolean>;
    removePromo: () => void;
    deliveryDistance: number;
    setDeliveryDistance: (distance: number) => void;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
    children: ReactNode;
}

const parsePrice = (price: string): number => {
    return Number(price.replace(/[^0-9]/g, ''));
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);

    // Listen for events to close cart when other panels open
    useEffect(() => {
        const handleCloseOtherPanels = (event: Event) => {
            const customEvent = event as CustomEvent;
            if (customEvent.detail !== 'cart') {
                setIsCartOpen(false);
            }
        };

        window.addEventListener('closeOtherPanels', handleCloseOtherPanels);
        return () => window.removeEventListener('closeOtherPanels', handleCloseOtherPanels);
    }, []);

    const openCart = () => {
        setIsCartOpen(true);
        // Dispatch event to close other panels
        window.dispatchEvent(new CustomEvent('closeOtherPanels', { detail: 'cart' }));
    };

    const addToCart = (itemToAdd: MenuItem) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(cartItem => cartItem.item.id === itemToAdd.id);
            if (existingItem) {
                return prevCart.map(cartItem =>
                    cartItem.item.id === itemToAdd.id
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem
                );
            }
            return [...prevCart, { item: itemToAdd, quantity: 1 }];
        });
    };

    const removeFromCart = (itemId: number) => {
        setCart(prevCart => prevCart.filter(cartItem => cartItem.item.id !== itemId));
    };

    const updateQuantity = (itemId: number, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(itemId);
        } else {
            setCart(prevCart =>
                prevCart.map(cartItem =>
                    cartItem.item.id === itemId ? { ...cartItem, quantity } : cartItem
                )
            );
        }
    };

    const setItemQuantity = (item: MenuItem, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(item.id);
        } else {
            setCart(prevCart => {
                const existingItem = prevCart.find(cartItem => cartItem.item.id === item.id);
                if (existingItem) {
                    return prevCart.map(cartItem =>
                        cartItem.item.id === item.id ? { ...cartItem, quantity } : cartItem
                    );
                } else {
                    return [...prevCart, { item, quantity }];
                }
            });
        }
    };

    const clearCart = () => {
        setCart([]);
        setAppliedPromo(null);
        setDeliveryDistance(0);
    };

    const subtotal = useMemo(() => {
        return cart.reduce((acc, cartItem) => {
            return acc + parsePrice(cartItem.item.price) * cartItem.quantity;
        }, 0);
    }, [cart]);

    const discount = useMemo(() => {
        if (!appliedPromo) return 0;

        if (appliedPromo.minOrderAmount && subtotal < appliedPromo.minOrderAmount) {
            return 0; // Requirement not met
        }

        if (appliedPromo.discountType === 'free_delivery' || appliedPromo.discountType === 'delivery_discount') {
            return 0; // Delivery discounts are handled in the component
        }

        let calculatedDiscount = 0;
        if (appliedPromo.discountType === 'fixed') {
            calculatedDiscount = appliedPromo.discountValue;
        } else {
            calculatedDiscount = subtotal * (appliedPromo.discountValue / 100);
        }

        if (appliedPromo.maxDiscountAmount) {
            calculatedDiscount = Math.min(calculatedDiscount, appliedPromo.maxDiscountAmount);
        }

        return calculatedDiscount;
    }, [subtotal, appliedPromo]);

    const total = subtotal - discount;

    const applyPromo = async (code: string): Promise<boolean> => {
        const promo = await validatePromoCode(code);
        if (promo) {
            if (promo.minOrderAmount && subtotal < promo.minOrderAmount) {
                return false; // Valid code but requirement not met
            }
            setAppliedPromo(promo);
            return true;
        }
        return false;
    };

    const removePromo = () => {
        setAppliedPromo(null);
    };

    const [deliveryDistance, setDeliveryDistance] = useState<number>(0);

    const toggleCart = () => setIsCartOpen(prev => !prev);
    const closeCart = () => setIsCartOpen(false);

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            setItemQuantity,
            clearCart,
            total,
            subtotal,
            discount,
            isCartOpen,
            toggleCart,
            openCart,
            closeCart,
            appliedPromo,
            applyPromo,
            removePromo,
            deliveryDistance,
            setDeliveryDistance
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = React.useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
