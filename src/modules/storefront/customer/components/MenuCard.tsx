import React, { useState } from 'react';
import { Plus, Heart, Star } from 'lucide-react';
import { useFavorites } from '@core/contexts/FavoritesContext';
import { useCart } from '@core/contexts/CartContext';
import { MenuItem } from '@core/data/mockDB';

export interface MenuCardProps extends MenuItem {
    onAddToCart?: () => void;
    onViewDetails?: () => void;
}

const MenuCard: React.FC<MenuCardProps> = ({
    id,
    name,
    description,
    price,
    image,
    rating,
    soldCount,
    isPromo,
    originalPrice,
    badge,
    onAddToCart,
    onViewDetails,
}) => {
    const { isFavorite, toggleFavorite } = useFavorites();
    const [isAnimating, setIsAnimating] = useState(false);
    const isFavorited = isFavorite(id);

    // Countdown timer for promo


    const isInteractive = !!onAddToCart;

    // Conditionally call hook to prevent issues on public pages
    const cartContext = isInteractive ? useCart() : null;

    const cartItem = isInteractive ? cartContext?.cart.find(ci => ci.item.id === id) : undefined;
    const quantity = cartItem?.quantity || 0;

    const handleEvent = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        e.preventDefault();
        action();
    };

    const handleToggleFavorite = async (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        await toggleFavorite(id);

        // Trigger pop animation
        const btn = e.currentTarget;
        btn.classList.add('scale-125');
        setTimeout(() => btn.classList.remove('scale-125'), 200);
    };

    const handleAddToCartClick = (e: React.MouseEvent) => {
        if (onAddToCart) {
            setIsAnimating(true);
            handleEvent(e, onAddToCart);
            setTimeout(() => setIsAnimating(false), 300);
        }
    }

    const ActionArea = () => {
        if (!isInteractive || !cartContext) {
            return (
                <div className="w-[32px] h-[32px] bg-blue-600 rounded-full flex items-center justify-center text-white cursor-pointer shadow-sm hover:scale-105 transition-transform">
                    <Plus className="w-[16px] h-[16px]" />
                </div>
            );
        }

        const { openCart } = cartContext;

        const handleAddToCartClick = (e: React.MouseEvent) => {
            if (onAddToCart) {
                setIsAnimating(true);
                handleEvent(e, onAddToCart);
                openCart(); // Open cart sidebar
                setTimeout(() => setIsAnimating(false), 300);
            }
        }

        return (
            <button
                className={`w-[28px] h-[28px] bg-blue-600 rounded-full flex items-center justify-center text-white cursor-pointer shadow-sm hover:opacity-90 transition-all duration-200 ${isAnimating ? 'scale-110' : 'hover:scale-105'}`}
                onClick={handleAddToCartClick}
                aria-label={`Tambah ${name} ke keranjang`}
            >
                <Plus className="w-[14px] h-[14px]" />
            </button>
        );
    };

    return (
        <div
            className={`group w-full bg-white dark:bg-neutral-800 rounded-2xl shadow-sm hover:shadow-md border border-neutral-200 dark:border-neutral-700 transition-all duration-300 ease-out overflow-hidden flex flex-col ${onViewDetails ? 'cursor-pointer' : ''}`}
            onClick={onViewDetails}
        >
            {/* Image Block */}
            <div className="relative aspect-[4/3] overflow-hidden">
                <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />

                {/* Badges - Top Left */}
                {badge && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-semibold tracking-wide px-2 h-[22px] flex items-center rounded-md shadow-sm z-10">
                        {badge.replace(/✨|🔥|🎉/g, '').trim()}
                    </span>
                )}



                {/* Favorite Button - Top Right */}
                <button
                    onClick={handleToggleFavorite}
                    className="absolute top-3 right-3 w-[24px] h-[24px] rounded-full bg-white/70 backdrop-blur-md flex items-center justify-center shadow-sm hover:bg-white transition-all duration-200 z-10 active:scale-95"
                >
                    <Heart
                        className={`w-3.5 h-3.5 transition-colors duration-200 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-neutral-600'}`}
                        strokeWidth={2}
                    />
                </button>

                {/* Overlay on Hover */}
                {onViewDetails && (
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                )}
            </div>

            {/* Text Block */}
            <div className="p-3 flex-1 flex flex-col gap-[4px]">
                <div className="flex justify-between items-start gap-2">
                    <h3 className="text-[15px] font-medium tracking-tight text-gray-900 dark:text-gray-100 leading-tight line-clamp-1">{name}</h3>
                </div>

                {/* Rating & Sold Count */}
                {(rating || soldCount) && (
                    <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                        {rating && (
                            <div className="flex items-center gap-0.5">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium text-neutral-700 dark:text-neutral-300">{rating}</span>
                            </div>
                        )}
                        {rating && soldCount && <span>•</span>}
                        {soldCount && <span>{soldCount}+ terjual</span>}
                    </div>
                )}

                <p className="text-[11px] text-neutral-500 dark:text-gray-400 line-clamp-2 mt-0.5">{description}</p>


                <div className="flex items-center justify-between mt-auto pt-2">
                    <div className="flex flex-col gap-0.5">
                        {isPromo && originalPrice && (
                            <p className="text-[11px] font-medium text-red-500 line-through whitespace-nowrap">{originalPrice}</p>
                        )}
                        <p className="text-[15px] font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">{price}</p>
                    </div>
                    <ActionArea />
                </div>
            </div>
        </div>
    );
};

export default MenuCard;
