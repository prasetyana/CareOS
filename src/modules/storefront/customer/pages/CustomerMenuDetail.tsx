
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { MenuItem, Review, fetchMenuItemBySlug, fetchReviewsByItemId, addReview, fetchMenuItems } from '@core/data/mockDB';
import { useCart } from '@core/contexts/CartContext';
import { useAuth } from '@core/hooks/useAuth';
import { useToast } from '@core/contexts/ToastContext';
import { useFavorites } from '@core/contexts/FavoritesContext';
import { ChevronLeft, ChevronRight, Heart, Minus, Plus, Share2, ShoppingCart, Star, X, Zap, MessageSquare, ArrowLeft, Flame, Send, Leaf, Award, AlertCircle, Maximize2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SkeletonLoader from '@ui/SkeletonLoader';
import MenuCard from '../components/MenuCard';
import ContentCarousel from '../components/dashboard/ContentCarousel';
import { useTenantParam } from '@core/hooks/useTenantParam';

// --- SUB-COMPONENTS ---

const RatingSummary: React.FC<{ reviews: Review[] }> = ({ reviews }) => {
    const totalReviews = reviews.length;
    if (totalReviews === 0) return null;

    const averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews;
    const ratingDistribution = [5, 4, 3, 2, 1].map(star => {
        const count = reviews.filter(r => r.rating === star).length;
        return { star, count, percentage: totalReviews > 0 ? (count / totalReviews) * 100 : 0 };
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ duration: 0.5 }}
            className="p-6 bg-white/60 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-black/5 dark:border-white/10 shadow-sm"
        >
            <div className="flex items-center gap-8">
                <div className="text-center">
                    <p className="text-5xl font-semibold text-text-primary tracking-tight">{averageRating.toFixed(1)}</p>
                    <div className="flex justify-center text-yellow-400 mt-2">
                        {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < Math.round(averageRating) ? 'fill-current' : 'text-gray-300 dark:text-gray-600'}`} />)}
                    </div>
                    <p className="text-xs text-text-muted mt-2 whitespace-nowrap font-medium">dari {totalReviews} ulasan</p>
                </div>
                <div className="flex-grow space-y-2">
                    {ratingDistribution.map(({ star, percentage }) => (
                        <div key={star} className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-text-muted w-3">{star}★</span>
                            <div className="w-full bg-black/5 dark:bg-white/5 rounded-full h-2">
                                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

const ReviewList: React.FC<{ reviews: Review[] }> = ({ reviews }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-4"
    >
        {reviews.map(review => (
            <div key={review.id} className="py-5 border-b border-black/5 dark:border-white/5 last:border-b-0">
                <div className="flex items-start gap-4">
                    <img src={review.customerAvatar} alt={review.customerName} className="w-11 h-11 rounded-full ring-2 ring-black/5 dark:ring-white/10" />
                    <div className="flex-grow">
                        <div className="flex justify-between items-center mb-1">
                            <p className="font-semibold text-text-primary text-sm">{review.customerName}</p>
                            <div className="flex items-center gap-1.5 text-xs text-yellow-500">
                                <Star className="w-3.5 h-3.5 fill-current" />
                                <span className="font-bold">{review.rating.toFixed(1)}</span>
                            </div>
                        </div>
                        <p className="text-xs text-text-muted mb-2.5">{review.date}</p>
                        <p className="text-sm text-text-primary leading-relaxed">{review.comment}</p>
                    </div>
                </div>
            </div>
        ))}
    </motion.div>
);

const AddReviewForm: React.FC<{ menuItemId: number; onReviewAdded: (review: Review) => void }> = ({ menuItemId, onReviewAdded }) => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || rating === 0 || !comment.trim()) {
            addToast('Silakan berikan rating dan komentar.', 'error');
            return;
        }
        setIsSubmitting(true);
        try {
            const newReview = await addReview({
                menuItemId,
                customerId: user.id,
                customerName: user.name,
                customerAvatar: `https://i.pravatar.cc/150?u=${user.email}`,
                rating,
                comment,
            });
            onReviewAdded(newReview);
            setRating(0);
            setComment('');
            addToast('Terima kasih atas ulasan Anda!', 'success');
        } catch (error) {
            addToast('Gagal mengirim ulasan.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6"
        >
            <form onSubmit={handleSubmit} className="flex items-start gap-4">
                <img src={`https://i.pravatar.cc/150?u=${user?.email}`} alt={user?.name} className="w-11 h-11 rounded-full ring-2 ring-black/5 dark:ring-white/10" />
                <div className="flex-1 bg-white/60 dark:bg-white/5 backdrop-blur-xl rounded-2xl px-5 py-4 border border-black/5 dark:border-white/10 shadow-sm">
                    <div className="flex mb-3" onMouseLeave={() => setHoverRating(0)}>
                        {[1, 2, 3, 4, 5].map(star => (
                            <button key={star} type="button" onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)} className="transition-transform hover:scale-110">
                                <Star className={`w-5 h-5 transition-colors ${star <= (hoverRating || rating) ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
                            </button>
                        ))}
                    </div>
                    <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Tulis pengalaman Anda..." className="w-full bg-transparent resize-none text-sm text-text-primary focus:outline-none leading-relaxed" rows={2} />
                </div>
                <button type="submit" disabled={isSubmitting} className="text-accent text-lg p-3 hover:text-accent/80 disabled:opacity-50 self-end mb-1 transition-all hover:scale-110 active:scale-95"><Send className="w-5 h-5" /></button>
            </form>
        </motion.div>
    );
};


const PageSkeleton: React.FC = () => (
    <div>
        <SkeletonLoader className="h-6 w-32 mb-6 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <SkeletonLoader className="h-96 w-full rounded-2xl" />
            <div className="space-y-5">
                <SkeletonLoader className="h-10 w-3/4 rounded-lg" />
                <div className="flex gap-2">
                    <SkeletonLoader className="h-8 w-24 rounded-full" />
                    <SkeletonLoader className="h-8 w-24 rounded-full" />
                </div>
                <SkeletonLoader className="h-24 w-full rounded-lg" />
                <div className="pt-4 flex gap-4">
                    <SkeletonLoader className="h-14 w-32 rounded-xl" />
                    <SkeletonLoader className="h-14 flex-grow rounded-xl" />
                </div>
            </div>
        </div>
        <div className="mt-12 border-t border-black/10 dark:border-white/10 pt-8">
            <SkeletonLoader className="h-8 w-48 mb-6 rounded-lg" />
            <SkeletonLoader className="h-40 w-full rounded-2xl" />
        </div>
    </div>
);


const sliderVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? '100%' : '-100%', opacity: 0 }),
};
const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => Math.abs(offset) * velocity;

const CustomerMenuDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [item, setItem] = useState<MenuItem | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [loading, setLoading] = useState(true);
    const [recommendations, setRecommendations] = useState<MenuItem[]>([]);

    const { cart, setItemQuantity, openCart, addToCart } = useCart();
    const { addToast } = useToast();
    const { isFavorite, toggleFavorite } = useFavorites();
    const [orderQuantity, setOrderQuantity] = useState(1);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [[page, direction], setPage] = useState([0, 0]);

    const { withTenant } = useTenantParam();
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            if (!slug) { setLoading(false); return; }
            document.querySelector('.custom-scrollbar')?.scrollTo(0, 0);
            setLoading(true);
            setLoadingReviews(true);
            try {
                const fetchedItem = await fetchMenuItemBySlug(slug);
                if (fetchedItem) {
                    setItem(fetchedItem);
                    // Fetch reviews
                    fetchReviewsByItemId(fetchedItem.id).then(fetchedReviews => {
                        setReviews(fetchedReviews.slice(0, 5));
                    });
                    const allItems = await fetchMenuItems();
                    const otherItems = allItems.filter(i => i.id !== fetchedItem.id);
                    otherItems.sort((a, b) => {
                        const aIsDiffCat = a.category !== fetchedItem.category;
                        const bIsDiffCat = b.category !== fetchedItem.category;
                        if (aIsDiffCat && !bIsDiffCat) return -1;
                        if (!aIsDiffCat && bIsDiffCat) return 1;
                        return 0.5 - Math.random(); // add some randomness
                    });
                    setRecommendations(otherItems.slice(0, 5));
                }
            } finally {
                setLoading(false);
                setLoadingReviews(false);
            }
        };
        loadData();
    }, [slug]);

    useEffect(() => {
        if (item) {
            const currentCartItem = cart.find(ci => ci.item.id === item.id);
            setOrderQuantity(currentCartItem?.quantity || 1);
        }
    }, [item, cart]);


    if (loading) return <PageSkeleton />;

    if (!item) {
        return (
            <div className="text-center py-16">
                <h2 className="text-xl font-bold text-text-primary">Menu Tidak Ditemukan</h2>
                <p className="text-text-muted mt-2 mb-6">Item menu yang Anda cari tidak ada.</p>
                <button onClick={() => navigate(-1)} className="text-accent hover:underline font-medium inline-flex items-center">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali ke Menu
                </button>
            </div>
        );
    }

    // --- Dynamic Info Chips ---
    const infoChips = [];
    if (item.rating) {
        infoChips.push({ icon: Star, text: `${item.rating.toFixed(1)} Rating`, color: 'text-amber-500' });
    }
    if (item.cookTime) {
        infoChips.push({ icon: Clock, text: item.cookTime, color: 'text-sky-500' });
    }
    if (item.mainIngredient) {
        infoChips.push({ icon: Flame, text: item.mainIngredient, color: 'text-orange-500' });
    }

    // --- Carousel Logic ---
    const images = (item.images && item.images.length > 0)
        ? item.images
        : [item.image, item.image.replace('seed/', 'seed/detail2-'), item.image.replace('seed/', 'seed/detail3-')];
    const imageIndex = page;
    const paginate = (newDirection: number) => {
        let newPage = page + newDirection;
        if (newPage < 0) newPage = images.length - 1;
        else if (newPage >= images.length) newPage = 0;
        setPage([newPage, newDirection]);
    };

    const handleReviewAdded = (newReview: Review) => setReviews(prev => [newReview, ...prev]);

    // --- Action Button Logic ---
    const cartItem = cart.find(ci => ci.item.id === item.id);
    const isAlreadyInCart = !!cartItem;
    const quantityHasChanged = isAlreadyInCart && cartItem.quantity !== orderQuantity;

    const isAddToCartDisabled = isAlreadyInCart && !quantityHasChanged;
    let addToCartButtonText = 'Masukan Keranjang';
    if (isAlreadyInCart) {
        if (quantityHasChanged) {
            addToCartButtonText = 'Perbarui Keranjang';
        } else {
            addToCartButtonText = 'Sudah di Keranjang';
        }
    }

    const handleAddToCartClick = () => {
        setItemQuantity(item, orderQuantity);
        const toastMessage = isAlreadyInCart && quantityHasChanged
            ? `Keranjang diperbarui: ${item.name} (${orderQuantity})`
            : `${orderQuantity} ${item.name} dimasukan ke keranjang`;
        addToast(toastMessage, 'success');
    };

    return (
        <div className="pb-16">
            <nav className="mb-8 flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="font-medium inline-flex items-center text-sm text-accent hover:text-accent/80 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali ke Menu
                </button>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => toggleFavorite(item.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-white/5 backdrop-blur-xl rounded-full border border-black/5 dark:border-white/10 shadow-sm text-text-primary hover:bg-white/80 dark:hover:bg-white/10 transition-all active:scale-95"
                    >
                        <Heart className={`w-4 h-4 ${isFavorite(item.id) ? 'fill-red-500 text-red-500' : ''}`} />
                    </button>
                    <button
                        onClick={() => {
                            if (navigator.share) {
                                navigator.share({
                                    title: item.name,
                                    text: `Check out ${item.name} - ${item.description.substring(0, 100)}...`,
                                    url: window.location.href
                                }).catch(() => { });
                            } else {
                                navigator.clipboard.writeText(window.location.href);
                                addToast('Link disalin ke clipboard', 'success');
                            }
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-white/5 backdrop-blur-xl rounded-full border border-black/5 dark:border-white/10 shadow-sm text-text-primary hover:bg-white/80 dark:hover:bg-white/10 transition-all active:scale-95"
                    >
                        <Share2 className="w-4 h-4" />
                        <span className="text-sm font-medium">Bagikan</span>
                    </button>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                    <div className="space-y-4">
                        <div
                            className="relative h-[28rem] w-full flex-shrink-0 rounded-3xl overflow-hidden group shadow-2xl shadow-black/10 dark:shadow-black/30 cursor-pointer"
                            onClick={() => setIsFullscreen(true)}
                        >
                            <AnimatePresence initial={false} custom={direction}>
                                <motion.img key={page} src={images[imageIndex]} alt={`${item.name} image ${imageIndex + 1}`} custom={direction} variants={sliderVariants} initial="enter" animate="center" exit="exit" transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }} drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.2} onDragEnd={(e, { offset, velocity }) => { const swipe = swipePower(offset.x, velocity.x); if (swipe < -swipeConfidenceThreshold) paginate(1); else if (swipe > swipeConfidenceThreshold) paginate(-1); }} className="absolute w-full h-full object-cover" />
                            </AnimatePresence>
                            <div className="absolute inset-0 flex justify-between items-center px-4 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                <button onClick={(e) => { e.stopPropagation(); paginate(-1); }} className="bg-white/70 dark:bg-black/40 backdrop-blur-xl p-3 rounded-full text-text-primary hover:bg-white/90 dark:hover:bg-black/60 transition-all hover:scale-110 pointer-events-auto"><ChevronLeft className="w-5 h-5" /></button>
                                <button onClick={(e) => { e.stopPropagation(); paginate(1); }} className="bg-white/70 dark:bg-black/40 backdrop-blur-xl p-3 rounded-full text-text-primary hover:bg-white/90 dark:hover:bg-black/60 transition-all hover:scale-110 pointer-events-auto"><ChevronRight className="w-5 h-5" /></button>
                            </div>
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <div className="bg-black/50 backdrop-blur-md p-2 rounded-full text-white">
                                    <Maximize2 className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        {/* Thumbnails */}
                        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                            {images.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage([i, i > page ? 1 : -1])}
                                    className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden transition-all duration-200 ${imageIndex === i ? 'ring-2 ring-accent ring-offset-2 dark:ring-offset-black' : 'opacity-70 hover:opacity-100'}`}
                                >
                                    <img src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h1 className="text-4xl lg:text-5xl font-semibold text-text-primary tracking-tight leading-tight">{item.name}</h1>

                        {infoChips.length > 0 && (
                            <div className="flex gap-2.5 text-sm flex-wrap">
                                {infoChips.map(info => (
                                    <div key={info.text} className="bg-white/60 dark:bg-white/5 backdrop-blur-xl px-4 py-2 rounded-full flex items-center gap-2 border border-black/5 dark:border-white/10 shadow-sm">
                                        <info.icon className={`w-4 h-4 ${info.color}`} />
                                        <span className="font-medium text-text-muted">{info.text}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Dietary Attributes & Nutritional Info */}
                        {(item.isHalal || item.isVegetarian || item.spicyLevel || item.calories) && (
                            <div className="flex flex-wrap gap-2 text-sm">
                                {item.isHalal && (
                                    <div className="bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-green-200 dark:border-green-800">
                                        <Award className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                                        <span className="font-medium text-green-700 dark:text-green-300">Halal</span>
                                    </div>
                                )}
                                {item.isVegetarian && (
                                    <div className="bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800">
                                        <Leaf className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                        <span className="font-medium text-emerald-700 dark:text-emerald-300">Vegetarian</span>
                                    </div>
                                )}
                                {item.spicyLevel && item.spicyLevel > 0 && (
                                    <div className="bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-orange-200 dark:border-orange-800">
                                        <Flame className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                                        <span className="font-medium text-orange-700 dark:text-orange-300">
                                            {'🌶️'.repeat(item.spicyLevel)} Spicy
                                        </span>
                                    </div>
                                )}
                                {item.calories && (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-blue-200 dark:border-blue-800">
                                        <span className="font-medium text-blue-700 dark:text-blue-300">
                                            🔥 {item.calories} kcal
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        <div><p className={`text-text-muted text-base leading-relaxed transition-all duration-300 ${!isDescriptionExpanded && 'line-clamp-3'}`}>{item.description} {item.description}</p><button onClick={() => setIsDescriptionExpanded(prev => !prev)} className="text-sm font-semibold text-accent mt-2 hover:text-accent/80 transition-colors">{isDescriptionExpanded ? 'Baca lebih sedikit' : 'Baca selengkapnya'}</button></div>

                        {/* Ingredients */}
                        {item.ingredients && item.ingredients.length > 0 && (
                            <div className="p-4 bg-white/60 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-black/5 dark:border-white/10">
                                <h3 className="text-sm font-semibold text-text-primary mb-2">Ingredients</h3>
                                <div className="flex flex-wrap gap-2">
                                    {item.ingredients.map((ingredient, idx) => (
                                        <span key={idx} className="text-xs px-2.5 py-1 bg-black/5 dark:bg-white/10 rounded-full text-text-muted">
                                            {ingredient}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Allergen Warning */}
                        {item.allergens && item.allergens.length > 0 && (
                            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 backdrop-blur-xl rounded-2xl border border-amber-200 dark:border-amber-800">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-1">Allergy Information</h3>
                                        <p className="text-xs text-amber-800 dark:text-amber-300">
                                            Contains: {item.allergens.join(', ')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Serving Info & Prep Time */}
                        {(item.servingInfo || item.prepTime) && (
                            <div className="p-4 bg-white/60 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-black/5 dark:border-white/10 space-y-2">
                                {item.prepTime && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="w-4 h-4 text-accent" />
                                        <span className="text-text-muted"><span className="font-medium text-text-primary">Prep Time:</span> {item.prepTime}</span>
                                    </div>
                                )}
                                {item.servingInfo && (
                                    <p className="text-sm text-text-muted leading-relaxed">
                                        <span className="font-medium text-text-primary">Serving Suggestion:</span> {item.servingInfo}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="pt-6 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-around w-36 bg-white/60 dark:bg-white/5 backdrop-blur-xl rounded-2xl p-1.5 border border-black/5 dark:border-white/10 shadow-sm">
                                    <button onClick={() => setOrderQuantity(q => Math.max(isAlreadyInCart ? 0 : 1, q - 1))} className="w-11 h-11 flex items-center justify-center text-text-muted rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-all active:scale-95" aria-label="Kurangi jumlah">
                                        <Minus className="w-5 h-5" />
                                    </button>
                                    <span className="font-semibold text-xl text-text-primary tabular-nums w-10 text-center">{orderQuantity}</span>
                                    <button onClick={() => setOrderQuantity(q => q + 1)} className="w-11 h-11 flex items-center justify-center text-text-muted rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-all active:scale-95" aria-label="Tambah jumlah">
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                                <button
                                    onClick={handleAddToCartClick}
                                    disabled={isAddToCartDisabled}
                                    className="flex-grow h-14 bg-white/60 dark:bg-white/5 backdrop-blur-xl text-accent font-semibold rounded-2xl transition-all duration-200 ease-out active:scale-[0.98] hover:bg-white/80 dark:hover:bg-white/10 border border-accent/20 shadow-sm disabled:bg-neutral-100 disabled:text-text-muted disabled:cursor-not-allowed disabled:border-black/10 dark:disabled:bg-white/5 dark:disabled:border-white/10"
                                >
                                    {addToCartButtonText}
                                </button>
                            </div>
                            <button
                                onClick={() => {
                                    if (isAlreadyInCart && !quantityHasChanged) {
                                        openCart();
                                    } else {
                                        setItemQuantity(item, orderQuantity);
                                        openCart();
                                    }
                                }}
                                className="w-full h-14 bg-gradient-to-r from-[#007aff] to-[#0a84ff] text-white font-semibold rounded-2xl transition-all duration-200 ease-out active:scale-[0.98] hover:shadow-xl hover:shadow-accent/30 shadow-lg"
                            >
                                Pesan Sekarang
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-20 pt-16 border-t border-black/5 dark:border-white/10">
                    <h2 className="text-3xl font-semibold text-text-primary mb-8 tracking-tight">Rating & Ulasan</h2>
                    <div className="space-y-6">
                        {loadingReviews ? <p className="text-sm text-text-muted">Memuat ulasan...</p> : (
                            <>
                                <RatingSummary reviews={reviews} />
                                {reviews.length > 0 && <ReviewList reviews={reviews} />}
                                <AddReviewForm menuItemId={item.id} onReviewAdded={handleReviewAdded} />
                            </>
                        )}
                    </div>
                </div>

                {recommendations.length > 0 && (
                    <div className="mt-20 pt-16 border-t border-black/5 dark:border-white/10">
                        <h2 className="text-3xl font-semibold text-text-primary mb-8 tracking-tight">Disarankan Bersama Ini</h2>
                        <div className="h-[420px]">
                            <ContentCarousel<MenuItem>
                                items={recommendations}
                                renderItem={(recItem) => (
                                    <MenuCard
                                        {...recItem}
                                        onAddToCart={() => {
                                            addToCart(recItem);
                                            addToast(`${recItem.name} ditambahkan ke keranjang.`, 'success');
                                        }}
                                        onViewDetails={() => navigate(withTenant(`/akun/menu/${recItem.slug}`))}
                                    />
                                )}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Fullscreen Image Modal - Pro Apple Style */}
            {isFullscreen && createPortal(
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
                        onClick={() => setIsFullscreen(false)}
                    >
                        {/* Background with Blur & Vignette */}
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-xl"></div>
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40"></div>



                        {/* Top Control Bar - Floating Glass (Right) */}
                        <div className="absolute top-6 right-6 z-50 pointer-events-none">
                            <div className="flex gap-2 p-1.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-lg shadow-[inset_0_0_1px_1px_rgba(255,255,255,0.1)] pointer-events-auto">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleFavorite(item.id);
                                    }}
                                    className="p-3 rounded-full hover:bg-white/20 text-white transition-all active:scale-95"
                                >
                                    <Heart className={`w-5 h-5 ${isFavorite(item.id) ? 'fill-red-500 text-red-500' : ''}`} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (navigator.share) {
                                            navigator.share({
                                                title: item.name,
                                                text: `Check out ${item.name} - ${item.description.substring(0, 100)}...`,
                                                url: window.location.href
                                            }).catch(() => { });
                                        } else {
                                            navigator.clipboard.writeText(window.location.href);
                                            addToast('Link disalin ke clipboard', 'success');
                                        }
                                    }}
                                    className="p-3 rounded-full hover:bg-white/20 text-white transition-all active:scale-95"
                                >
                                    <Share2 className="w-5 h-5" />
                                </button>
                                <div className="w-px bg-white/20 my-2 mx-1"></div>
                                <button
                                    onClick={() => setIsFullscreen(false)}
                                    className="p-3 rounded-full hover:bg-white/20 text-white transition-all active:scale-95"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Main Image Container */}
                        <div className="relative w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
                            {/* Navigation Arrows */}
                            <button
                                onClick={(e) => { e.stopPropagation(); paginate(-1); }}
                                className="absolute left-4 h-12 w-12 flex items-center justify-center rounded-full bg-black/40 border border-white/10 backdrop-blur-md text-white hover:bg-black/60 transition-all active:scale-95 z-20 group"
                            >
                                <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform opacity-80 group-hover:opacity-100" />
                            </button>

                            <motion.img
                                key={page}
                                src={images[imageIndex]}
                                custom={direction}
                                variants={sliderVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                                className="w-full h-full object-cover shadow-[0_20px_40px_rgba(0,0,0,0.35)] drop-shadow-2xl"
                            />

                            <button
                                onClick={(e) => { e.stopPropagation(); paginate(1); }}
                                className="absolute right-4 h-12 w-12 flex items-center justify-center rounded-full bg-black/40 border border-white/10 backdrop-blur-md text-white hover:bg-black/60 transition-all active:scale-95 z-20 group"
                            >
                                <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform opacity-80 group-hover:opacity-100" />
                            </button>
                        </div>

                        {/* Info Box - Floating Glass (Left Middle) */}
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute left-24 top-1/2 -translate-y-1/2 max-w-xs p-5 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-xl shadow-lg z-50 pointer-events-auto hidden lg:block"
                        >
                            <h2 className="text-xl font-bold text-white mb-1.5">{item.name}</h2>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="flex items-center gap-1 text-yellow-400">
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                    <span className="font-medium text-white text-sm">{item.rating}</span>
                                    <span className="text-[10px] text-gray-300">({reviews.length} ulasan)</span>
                                </div>
                                <div className="text-lg font-bold text-white">
                                    {item.price.toLocaleString('id-ID')}
                                </div>
                            </div>
                            <p className="text-xs text-gray-200 line-clamp-4 leading-relaxed mb-3">
                                {item.description}
                            </p>
                            <div className="pt-3 border-t border-white/10 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                {reviews.length > 0 ? (
                                    <div className="space-y-3">
                                        {reviews.map((review) => (
                                            <div key={review.id} className="flex items-start gap-2">
                                                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center overflow-hidden flex-shrink-0 mt-0.5">
                                                    {review.customerAvatar ? (
                                                        <img src={review.customerAvatar} alt={review.customerName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-white">{review.customerName[0]}</span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-0.5">
                                                        <p className="text-[10px] font-medium text-white truncate">{review.customerName}</p>
                                                        <div className="flex items-center gap-0.5">
                                                            <Star className="w-2 h-2 text-yellow-400 fill-current" />
                                                            <span className="text-[9px] text-white">{review.rating}</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-[10px] text-gray-300 italic leading-snug line-clamp-2">"{review.comment}"</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 opacity-60">
                                        <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                                            <MessageSquare className="w-2.5 h-2.5 text-white" />
                                        </div>
                                        <p className="text-[10px] text-gray-300 italic">Belum ada ulasan</p>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-4 pt-3 border-t border-white/10">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (isAlreadyInCart && !quantityHasChanged) {
                                            openCart();
                                        } else {
                                            setItemQuantity(item, orderQuantity);
                                            openCart();
                                        }
                                        setIsFullscreen(false);
                                    }}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-black font-semibold rounded-xl shadow-lg hover:bg-gray-100 transition-all active:scale-95 text-sm"
                                >
                                    <Zap className="w-4 h-4 fill-current" />
                                    <span>Pesan</span>
                                </button>
                            </div>
                        </div>

                        {/* Bottom Thumbnail Bar - Floating Glass */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                            <div className="flex gap-3 px-4 py-3 rounded-full bg-black/40 border border-white/10 backdrop-blur-xl shadow-lg pointer-events-auto overflow-x-auto max-w-[90vw]">
                                {images.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={(e) => { e.stopPropagation(); setPage([i, i > page ? 1 : -1]); }}
                                        className={`relative flex-shrink-0 w-16 h-16 rounded-full overflow-hidden transition-all duration-300 ${imageIndex === i ? 'ring-2 ring-white shadow-lg scale-105 z-10' : 'opacity-60 hover:opacity-100 hover:scale-105 border-2 border-transparent'}`}
                                    >
                                        <img src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

export default CustomerMenuDetail;
