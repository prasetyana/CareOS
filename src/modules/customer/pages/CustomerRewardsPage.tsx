import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@core/hooks/useAuth';
import { fetchRewards, fetchPointTransactionsByCustomerId, LoyaltyReward, PointTransaction, User, updateUser, Mission, fetchMissions, Achievement, fetchAchievements, FaqItem, fetchFaqItems, UserReward, fetchUserRewards, redeemReward } from '@core/data/mockDB';
import SkeletonLoader from '@ui/SkeletonLoader';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Gift, Clock, Utensils, Calendar, MessageSquare, CakeSlice, Share2, Gem, Star, X, Ticket, Copy, QrCode, Sparkles, Plus, Minus, Loader2, Check, Search, Trophy, ChevronDown, TrendingUp, Flame, LogIn, ArrowRight, Target, ChevronRight } from 'lucide-react';
import { useToast } from '@core/contexts/ToastContext';
import Modal from '@ui/Modal';
import { logoDataUri } from '@ui/Logo';
import SegmentedControl from '@ui/SegmentedControl';
import ScrollableTabs from '@ui/ScrollableTabs';

// --- DATA & CONFIG ---

const levelData = [
    { name: 'Bronze', minPoints: 0, badge: '🥉', benefits: [{ icon: Award, text: 'Akses ke program poin.' }] },
    { name: 'Silver', minPoints: 500, badge: '🥈', benefits: [{ icon: TrendingUp, text: 'Bonus poin 5% setiap transaksi.' }] },
    { name: 'Gold', minPoints: 1000, badge: '🥇', benefits: [{ icon: TrendingUp, text: 'Bonus poin 10%' }, { icon: CakeSlice, text: 'Hadiah ulang tahun spesial.' }] },
    { name: 'Platinum', minPoints: 2000, badge: '💎', benefits: [{ icon: TrendingUp, text: 'Bonus poin 15%' }, { icon: Ticket, text: 'Akses event eksklusif.' }] },
];

const waysToEarn = [
    { icon: Utensils, text: 'Pesan menu', points: '10 poin / Rp10.000' },
    { icon: Calendar, text: 'Reservasi meja', points: '+200 poin' },
    { icon: MessageSquare, text: 'Tulis ulasan', points: '+100 poin' },
    { icon: CakeSlice, text: 'Ulang tahun', points: '+500 poin' },
    { icon: Share2, text: 'Share di medsos', points: '+150 poin' },
];

const ConfettiPiece: React.FC<{ x: number, y: number, rotation: number, color: string }> = ({ x, y, rotation, color }) => {
    return (
        <motion.div
            style={{
                position: 'absolute',
                left: `${x}% `,
                top: `${y}% `,
                backgroundColor: color,
                width: '8px',
                height: '16px',
            }}
            initial={{ opacity: 1, rotate: rotation, scale: 1 }}
            animate={{
                y: '120vh',
                opacity: [1, 1, 0],
                scale: [1, 0.5, 0],
                rotate: rotation + (Math.random() - 0.5) * 720,
            }}
            transition={{ duration: 2 + Math.random() * 2, ease: "linear" }}
        />
    );
};

const Confetti: React.FC = () => {
    const colors = ['#007AFF', '#34C759', '#FF9500', '#FF2D55', '#AF52DE'];
    const pieces = Array.from({ length: 50 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10 - Math.random() * 20,
        rotation: Math.random() * 360,
        color: colors[i % colors.length],
    }));

    return (
        <div className="fixed inset-0 pointer-events-none z-[100]">
            {pieces.map(p => <ConfettiPiece key={p.id} {...p} />)}
        </div>
    );
};

// --- SUB-COMPONENTS ---

const NotificationBanner: React.FC = () => {
    const [isVisible, setIsVisible] = useState(true);
    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                className="bg-accent/10 dark:bg-accent/20 border border-accent/20 text-accent p-3 rounded-xl flex items-center justify-between text-sm"
            >
                <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5" />
                    <p><span className="font-medium">Double Points Weekend!</span> Dapatkan 2x poin untuk semua pesanan akhir pekan ini.</p>
                </div>
                <button onClick={() => setIsVisible(false)} className="p-1 rounded-full hover:bg-accent/20">
                    <X className="w-4 h-4" />
                </button>
            </motion.div>
        </AnimatePresence>
    );
};

const DigitalMemberCard: React.FC<{ user: User; levelName: string; onClose: () => void }> = ({ user, levelName, onClose }) => {
    return (
        <div className="p-0">
            <div
                className="aspect-[85.6/53.98] w-full rounded-2xl p-6 flex flex-col justify-between text-white bg-gradient-to-br from-gray-800 to-black relative overflow-hidden"
            >
                <div className="absolute -right-12 -top-12 w-48 h-48 bg-accent/10 rounded-full"></div>
                <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-accent/20 rounded-full"></div>

                <div className="flex justify-between items-start z-10">
                    <img src={logoDataUri} alt="Logo" className="h-8 w-8 invert brightness-0" />
                    <div className="text-right">
                        <p className="font-medium text-lg">{levelName} Member</p>
                        <p className="text-xs opacity-70">Loyalty Program</p>
                    </div>
                </div>
                <div className="flex items-end justify-between z-10">
                    <div>
                        <p className="text-xs opacity-70 mb-1">Nama</p>
                        <p className="font-medium text-xl tracking-wider">{user.name}</p>
                    </div>
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=dineos-user-2&bgcolor=333333&color=FFFFFF&margin=0" alt="QR Code" className="rounded-lg bg-gray-700 p-1" />
                </div>
            </div>
            <button onClick={onClose} className="w-full mt-6 bg-accent text-white font-semibold py-3 rounded-lg hover:bg-opacity-90 transition-colors">
                Tutup
            </button>
        </div>
    );
};

const BirthdayRewardCard: React.FC<{
    userName: string;
    isClaimed: boolean;
    onClaim: () => void;
    isClaiming: boolean;
}> = ({ userName, isClaimed, onClaim, isClaiming }) => (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white relative overflow-hidden shadow-lg shadow-indigo-500/30">
        <CakeSlice className="absolute -right-8 -top-8 w-32 h-32 text-white/10" />
        <div className="relative z-10">
            <h3 className="text-xl font-semibold">Selamat Ulang Tahun, {userName.split(' ')[0]}! 🎉</h3>
            <p className="mt-2 text-indigo-100 max-w-md">Sebagai hadiah, kami telah menyiapkan 500 Poin Bonus spesial untuk Anda. Nikmati hari Anda!</p>
            <button
                onClick={onClaim}
                disabled={isClaimed || isClaiming}
                className="mt-4 px-5 py-2 rounded-full bg-white text-indigo-600 font-semibold text-sm transition-all duration-300 hover:bg-opacity-90 disabled:bg-white/70 disabled:text-indigo-400 disabled:cursor-not-allowed flex items-center justify-center w-40"
            >
                {isClaiming ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : isClaimed ? (
                    <>Terklaim <Check className="w-4 h-4 ml-2" /></>
                ) : (
                    'Klaim Hadiah'
                )}
            </button>
        </div>
    </div>
);


const ReferralCard: React.FC<{ userName: string }> = ({ userName }) => {
    const { addToast } = useToast();
    const referralCode = `${userName.split(' ')[0].toUpperCase()} -DINEOS`;
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(referralCode).then(() => {
            setIsCopied(true);
            addToast('Kode referral disalin!', 'success');
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return (
        <div className="p-5 bg-white/55 dark:bg-white/10 backdrop-blur-[30px] rounded-[24px] border border-white/35 shadow-[0_8px_28px_rgba(0,0,0,0.12)]">
            <div className="flex items-start gap-2.5 mb-3">
                <div className="w-7 h-7 flex items-center justify-center bg-[#007AFF]/10 rounded-[8px]">
                    <Gift className="w-[15px] h-[15px] text-[#007AFF]" strokeWidth={2} />
                </div>
                <div>
                    <h3 className="text-[17px] font-semibold text-gray-900 dark:text-white tracking-tight">
                        Undang Teman & Dapatkan Poin!
                    </h3>
                    <p className="text-[12px] text-gray-900/55 dark:text-white/55 mt-0.5">
                        Bagikan kode unik Anda dan dapatkan 500 poin untuk setiap teman yang mendaftar.
                    </p>
                </div>
            </div>

            {/* Referral Code Input */}
            <div className="flex items-center gap-2 p-3 bg-black/5 dark:bg-white/5 rounded-[14px] border border-white/20">
                <span className="flex-1 font-mono font-semibold text-[13px] text-gray-900 dark:text-white">
                    {referralCode}
                </span>
                <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 bg-[#007AFF]/15 hover:bg-[#007AFF]/25 text-[#007AFF] rounded-[10px] font-semibold text-[11px] transition-colors flex items-center gap-1.5"
                >
                    {isCopied ? (
                        <>
                            <Check className="w-[13px] h-[13px]" strokeWidth={2.5} />
                            Disalin
                        </>
                    ) : (
                        <>
                            <Copy className="w-[13px] h-[13px]" strokeWidth={2} />
                            Salin
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

const GoToRewardsCard: React.FC<{ onViewRewards: () => void }> = ({ onViewRewards }) => (
    <div className="p-5 bg-white/55 dark:bg-white/10 backdrop-blur-[30px] rounded-[24px] border border-white/35 shadow-[0_8px_28px_rgba(0,0,0,0.12)] flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 flex items-center justify-center bg-[#007AFF]/10 rounded-[16px] mb-2.5">
            <Gift className="w-[20px] h-[20px] text-[#007AFF]" strokeWidth={2} />
        </div>
        <h3 className="text-[17px] font-semibold text-gray-900 dark:text-white tracking-tight">
            Siap Tukarkan Poin?
        </h3>
        <p className="text-[12px] text-gray-900/55 dark:text-white/55 mt-1.5 mb-3 max-w-[260px]">
            Lihat katalog hadiah eksklusif yang bisa Anda dapatkan.
        </p>
        <button
            onClick={onViewRewards}
            className="px-4 py-2 bg-[#007AFF] hover:bg-[#0051D5] text-white rounded-[16px] font-semibold text-[13px] transition-colors flex items-center gap-1.5"
        >
            Tukar Hadiah
            <ArrowRight className="w-[14px] h-[14px]" strokeWidth={2.5} />
        </button>
    </div>
);


const RewardDetailsModal: React.FC<{
    reward: LoyaltyReward | null;
    onClose: () => void;
    onProceedToRedeem: (reward: LoyaltyReward) => void;
    userPoints: number;
}> = ({ reward, onClose, onProceedToRedeem, userPoints }) => {
    if (!reward) return null;
    const canAfford = userPoints >= reward.pointsRequired;

    return (
        <Modal isOpen={!!reward} onClose={onClose} title="Detail Hadiah">
            <div className="space-y-4">
                <img src={reward.image} alt={reward.title} className="w-full h-48 object-cover rounded-xl" />
                <h3 className="text-2xl font-semibold text-text-primary">{reward.title}</h3>
                <p className="text-sm text-text-muted">{reward.description} Lengkapi pengalaman bersantap Anda dengan sentuhan kemewahan.</p>

                <div className="text-xs text-text-muted bg-black/5 dark:bg-white/5 p-3 rounded-lg">
                    <h4 className="font-medium text-text-primary mb-1">Syarat & Ketentuan:</h4>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Hanya berlaku untuk satu kali penukaran.</li>
                        <li>Tidak dapat digabungkan dengan promo lain.</li>
                        <li>Berlaku hingga 30 hari setelah penukaran.</li>
                    </ul>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-black/10 dark:border-white/10">
                    <div>
                        <p className="text-sm text-text-muted">Biaya Poin</p>
                        <p className="font-semibold text-xl text-accent">🪙 {reward.pointsRequired.toLocaleString('id-ID')}</p>
                    </div>
                    <button
                        onClick={() => onProceedToRedeem(reward)}
                        disabled={!canAfford}
                        className="px-6 py-3 rounded-lg bg-accent text-white font-medium hover:bg-opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {canAfford ? 'Tukar Sekarang' : 'Poin Tidak Cukup'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};


const RedemptionModal: React.FC<{
    reward: LoyaltyReward | null;
    userPoints: number;
    onClose: () => void;
    onConfirm: () => void;
    step: 'confirm' | 'success';
    loading: boolean;
}> = ({ reward, userPoints, onClose, onConfirm, step, loading }) => {
    if (!reward) return null;

    return (
        <Modal isOpen={!!reward} onClose={onClose} title={step === 'confirm' ? "Konfirmasi Penukaran" : "Berhasil Ditukar!"}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                >
                    {step === 'confirm' ? (
                        <div className="text-center">
                            <img src={reward.image} alt={reward.title} className="w-full h-40 object-cover rounded-xl mb-4" />
                            <h3 className="text-xl font-semibold text-text-primary">Tukarkan {reward.title}?</h3>
                            <p className="text-text-muted text-sm mt-2">Poin Anda akan berkurang dan tidak dapat dikembalikan.</p>

                            <div className="my-6 p-4 bg-black/5 dark:bg-white/5 rounded-lg space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-text-muted">Saldo Saat Ini:</span> <span className="font-medium text-text-primary">{userPoints.toLocaleString('id-ID')} Poin</span></div>
                                <div className="flex justify-between"><span className="text-text-muted">Biaya Hadiah:</span> <span className="font-medium text-danger">-{reward.pointsRequired.toLocaleString('id-ID')} Poin</span></div>
                                <div className="flex justify-between font-semibold pt-2 border-t border-black/10 dark:border-white/10"><span className="text-text-primary">Sisa Saldo:</span> <span className="text-accent">{(userPoints - reward.pointsRequired).toLocaleString('id-ID')} Poin</span></div>
                            </div>

                            <div className="flex gap-4">
                                <button onClick={onClose} className="flex-1 px-5 py-2.5 rounded-lg bg-black/5 dark:bg-white/10 text-text-primary font-medium text-sm hover:bg-black/10 dark:hover:bg-white/20 transition-colors">Batal</button>
                                <button onClick={onConfirm} disabled={loading} className="flex-1 px-5 py-2.5 rounded-lg bg-accent text-white font-medium text-sm hover:bg-opacity-90 transition-opacity disabled:opacity-50">
                                    {loading ? 'Memproses...' : 'Ya, Tukarkan'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center">
                            <Ticket className="w-16 h-16 mx-auto text-success mb-4" />
                            <h3 className="text-xl font-semibold text-text-primary">{reward.title}</h3>
                            <p className="text-text-muted text-sm mt-1">berhasil ditukarkan!</p>
                            <div className="my-6 p-4 bg-black/5 dark:bg-white/5 rounded-lg">
                                <p className="text-xs text-text-muted">Kode Voucher Anda</p>
                                <div className="flex items-center justify-center gap-4 mt-2">
                                    <p className="text-lg font-semibold text-text-primary tracking-widest">DINEOS-REWARD123</p>
                                    <button onClick={() => navigator.clipboard.writeText('DINEOS-REWARD123')} className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/20">
                                        <Copy className="w-4 h-4 text-text-muted" />
                                    </button>
                                </div>
                            </div>
                            <button onClick={onClose} className="w-full px-5 py-2.5 rounded-lg bg-accent text-white font-medium text-sm hover:bg-opacity-90 transition-opacity">Selesai</button>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </Modal>
    );
};

const PointsSummary: React.FC<{ user: User | null; onOpenCard: () => void; }> = ({ user, onOpenCard }) => (
    <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight font-sans text-text-primary">Poin & Hadiah</h1>
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-text-muted">
            <div className="flex items-center gap-3">
                <p className="font-medium text-lg">Saldo Poin: <span className="text-accent font-semibold">🪙 {user?.loyaltyPoints?.toLocaleString('id-ID') || 0}</span></p>
                <button onClick={onOpenCard} className="p-2 rounded-full bg-black/5 dark:bg-white/10 text-text-muted hover:bg-black/10 dark:hover:bg-white/20 transition-colors" aria-label="Tampilkan Kartu Digital">
                    <QrCode className="w-4 h-4" />
                </button>
            </div>
            <p className="hidden sm:block text-gray-300 dark:text-gray-600">|</p>
            <p className="text-sm">Setiap 10.000 poin = Rp 100.000 voucher</p>
        </div>
        <div className="mt-3 flex items-center justify-center gap-2 text-sm text-amber-600 dark:text-amber-400">
            <Clock className="w-4 h-4" />
            <p>Anda memiliki 250 poin yang akan hangus pada <strong className="font-medium">31 Des 2024</strong>.</p>
        </div>
    </div>
);

const LevelBenefitsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    levelData: typeof levelData;
    userPoints: number;
    currentLevelName: string;
}> = ({ isOpen, onClose, levelData, userPoints, currentLevelName }) => {
    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Detail Level & Keuntungan">
            <div className="space-y-6">
                {levelData.map((level) => (
                    <div key={level.name} className={`p-4 rounded-xl border ${level.name === currentLevelName ? 'border-accent bg-accent/10' : 'border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5'}`}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="text-3xl">{level.badge}</div>
                            <div>
                                <h4 className="text-lg font-semibold text-text-primary">Level {level.name}</h4>
                                <p className="text-sm text-text-muted">
                                    {level.minPoints.toLocaleString('id-ID')} poin {level.name === 'Bronze' ? 'untuk memulai' : `atau lebih`}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {level.benefits.map((benefit, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <benefit.icon className="w-4 h-4 text-accent" strokeWidth={2} />
                                    <p className="text-sm text-text-primary">{benefit.text}</p>
                                </div>
                            ))}
                        </div>
                        {level.name === currentLevelName && (
                            <p className="mt-4 text-xs text-accent font-medium">
                                Ini adalah level Anda saat ini.
                            </p>
                        )}
                        {userPoints < level.minPoints && level.name !== currentLevelName && (
                            <p className="mt-4 text-xs text-text-muted">
                                Anda membutuhkan {(level.minPoints - userPoints).toLocaleString('id-ID')} poin lagi untuk mencapai level ini.
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </Modal>
    );
};

const LevelTracker: React.FC<{ userPoints: number }> = ({ userPoints }) => {
    const [showLevelModal, setShowLevelModal] = useState(false);
    const currentLevelIndex = levelData.slice().reverse().findIndex(level => userPoints >= level.minPoints);
    const actualCurrentLevelIndex = currentLevelIndex !== -1 ? levelData.length - 1 - currentLevelIndex : 0;
    const currentLevel = levelData[actualCurrentLevelIndex];
    const nextLevel = levelData[actualCurrentLevelIndex + 1];

    const progress = nextLevel ? ((userPoints - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100 : 100;

    return (
        <>
            <div className="p-5 bg-white/55 dark:bg-white/10 backdrop-blur-[30px] rounded-[24px] border border-white/35 shadow-[0_8px_28px_rgba(0,0,0,0.12)]">
                {/* Header */}
                <div className="flex items-center gap-2.5 mb-3">
                    <div className="text-2xl">{currentLevel.badge}</div>
                    <div className="flex-1">
                        <h3 className="text-[17px] font-semibold text-gray-900 dark:text-white tracking-tight">
                            Level {currentLevel.name}
                        </h3>
                        <p className="text-[12px] text-gray-900/55 dark:text-white/55 mt-0.5">
                            {userPoints.toLocaleString('id-ID')} poin
                        </p>
                    </div>
                    <button
                        onClick={() => setShowLevelModal(true)}
                        className="px-3 py-1.5 bg-[#007AFF]/10 hover:bg-[#007AFF]/20 text-[#007AFF] rounded-[10px] font-semibold text-[11px] transition-colors"
                    >
                        Lihat Detail
                    </button>
                </div>

                {/* Progress Bar - macOS Style */}
                <div className="relative h-[5px] bg-black/10 dark:bg-white/10 rounded-full overflow-hidden mb-2">
                    <motion.div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#007AFF] to-[#00C7FF] rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}% ` }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    />
                </div>

                {nextLevel && (
                    <p className="text-[11px] text-gray-900/55 dark:text-white/55 mb-3">
                        <span className="font-medium text-gray-900 dark:text-white">
                            {(nextLevel.minPoints - userPoints).toLocaleString('id-ID')}
                        </span>
                        {' '}poin lagi ke Level {nextLevel.name}
                    </p>
                )}

                {/* Benefits Section */}
                <div className="pt-3 border-t border-black/10 dark:border-white/10">
                    <p className="text-[11px] font-medium text-gray-900/55 dark:text-white/55 mb-2">
                        Keuntungan yang Anda nikmati
                    </p>
                    <div className="space-y-1.5">
                        {currentLevel.benefits.map((benefit, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2 p-2 bg-black/5 dark:bg-white/5 rounded-[12px] border border-white/20"
                            >
                                <div className="w-6 h-6 flex items-center justify-center bg-[#007AFF]/10 rounded-[8px]">
                                    <benefit.icon className="w-[14px] h-[14px] text-[#007AFF]" strokeWidth={2} />
                                </div>
                                <p className="text-[12px] font-medium text-gray-900 dark:text-white flex-1">
                                    {benefit.text}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Next Level Preview */}
                    {currentLevel.name !== 'Platinum' && (
                        <div className="mt-3 pt-3 border-t border-black/10 dark:border-white/10">
                            <p className="text-[11px] font-medium text-gray-900/55 dark:text-white/55 mb-2">
                                Naik level untuk mendapatkan:
                            </p>
                            <div className="space-y-1 opacity-50">
                                {levelData[levelData.findIndex(l => l.name === currentLevel.name) + 1]?.benefits.map((benefit, index) => (
                                    <div key={index} className="flex items-center gap-2 p-1.5">
                                        <benefit.icon className="w-[12px] h-[12px] text-gray-900 dark:text-white" strokeWidth={2} />
                                        <p className="text-[11px] text-gray-900 dark:text-white">
                                            {benefit.text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <LevelBenefitsModal
                isOpen={showLevelModal}
                onClose={() => setShowLevelModal(false)}
                levelData={levelData}
                userPoints={userPoints}
                currentLevelName={currentLevel.name}
            />
        </>
    );
};

type ActivityFilter = 'Semua' | 'Masuk' | 'Keluar';
const ActivityTimeline: React.FC<{ transactions: PointTransaction[] }> = ({ transactions }) => {
    const [filter, setFilter] = useState<ActivityFilter>('Semua');

    const filteredTransactions = useMemo(() => {
        if (filter === 'Masuk') return transactions.filter(t => t.points > 0);
        if (filter === 'Keluar') return transactions.filter(t => t.points < 0);
        return transactions;
    }, [transactions, filter]);

    return (
        <div className="p-6 bg-surface rounded-2xl shadow-card border border-glass-border h-full flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                <h3 className="text-lg font-medium tracking-tight text-text-primary">Riwayat Poin</h3>
                <div className="w-full sm:w-auto">
                    <SegmentedControl
                        id="activity-filter"
                        options={['Semua', 'Masuk', 'Keluar']}
                        value={filter}
                        onChange={(val) => setFilter(val as ActivityFilter)}
                    />
                </div>
            </div>
            {filteredTransactions.length > 0 ? (
                <ul className="space-y-4 flex-grow overflow-y-auto custom-scrollbar -mr-2 pr-2">
                    {filteredTransactions.map(tx => (
                        <li key={tx.id} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-3">
                                <div className={`w - 8 h - 8 flex - shrink - 0 rounded - full flex items - center justify - center ${tx.points > 0 ? 'bg-success/10' : 'bg-danger/10'} `}>
                                    {tx.points > 0 ? <Plus className="w-4 h-4 text-success" /> : <Minus className="w-4 h-4 text-danger" />}
                                </div>
                                <div>
                                    <p className="font-medium text-text-primary">{tx.description}</p>
                                    <p className="text-xs text-text-muted mt-0.5">{tx.date}</p>
                                </div>
                            </div>
                            <p className={`font - medium shrink - 0 ${tx.points > 0 ? 'text-success' : 'text-danger'} `}>
                                {tx.points > 0 ? `+ ${tx.points} ` : tx.points}
                            </p>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="text-center py-8 flex-grow flex flex-col justify-center">
                    <Clock className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600" />
                    <p className="mt-2 text-sm text-text-muted">Tidak ada aktivitas untuk filter ini.</p>
                </div>
            )}
        </div>
    );
};


const WaysToEarn: React.FC = () => (
    <div id="earn-section" className="p-6 bg-surface rounded-2xl shadow-card border border-glass-border scroll-mt-20">
        <h3 className="text-lg font-medium tracking-tight text-text-primary mb-4">Cara Kerja Program</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {waysToEarn.map((item, index) => (
                <motion.div
                    key={index}
                    className="p-3 text-center bg-black/5 dark:bg-white/10 rounded-lg transition-colors hover:bg-black/10 dark:hover:bg-white/20"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                >
                    <item.icon className="w-6 h-6 mx-auto text-accent mb-2" />
                    <p className="text-sm font-medium text-text-primary">{item.text}</p>
                    <p className="text-xs text-text-muted">{item.points}</p>
                </motion.div>
            ))}
        </div>
    </div>
);

const RewardCard: React.FC<{ reward: LoyaltyReward; userPoints: number; onViewDetails: (reward: LoyaltyReward) => void }> = ({ reward, userPoints, onViewDetails }) => {
    const canAfford = userPoints >= reward.pointsRequired;
    const pointsNeeded = reward.pointsRequired - userPoints;

    return (
        <div
            onClick={() => onViewDetails(reward)}
            className={`flex flex-col h-full bg-surface-2 rounded-2xl shadow-card border border-glass-border overflow-hidden transition-all duration-300 cursor-pointer ${!canAfford ? 'opacity-70' : 'hover:shadow-xl hover:-translate-y-1'}`}>
            <div className="relative">
                <img src={reward.image} alt={reward.title} className={`w-full h-32 object-cover ${!canAfford ? 'grayscale' : ''}`} />
                {!canAfford && <div className="absolute inset-0 bg-black/20"></div>}
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h4 className="font-semibold text-text-primary">{reward.title}</h4>
                <p className="text-xs text-text-muted flex-grow mt-1">{reward.description}</p>
                <div className="flex justify-between items-center mt-4">
                    <span className={`font-semibold text-sm ${canAfford ? 'text-accent' : 'text-danger'}`}>🪙 {reward.pointsRequired.toLocaleString('id-ID')}</span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (canAfford) {
                                onViewDetails(reward)
                            }
                        }}
                        disabled={!canAfford}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-opacity ${canAfford
                            ? 'bg-accent text-white hover:bg-opacity-90'
                            : 'bg-neutral-200 dark:bg-neutral-700 text-text-muted cursor-not-allowed'
                            }`}
                        aria-disabled={!canAfford}
                    >
                        {canAfford ? 'Tukar' : `Kurang ${pointsNeeded.toLocaleString('id-ID')}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

const RewardsSection: React.FC<{ rewards: LoyaltyReward[]; userPoints: number; onViewDetails: (reward: LoyaltyReward) => void }> = ({ rewards, userPoints, onViewDetails }) => {
    const [sortBy, setSortBy] = useState<'Poin Terendah' | 'Poin Tertinggi'>('Poin Terendah');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<'Semua' | LoyaltyReward['category']>('Semua');

    const rewardCategories: ('Semua' | LoyaltyReward['category'])[] = useMemo(() => {
        const categories = new Set(rewards.map(r => r.category));
        return ['Semua', ...Array.from(categories)] as ('Semua' | LoyaltyReward['category'])[];
    }, [rewards]);

    const filteredAndSortedRewards = useMemo(() => {
        const filtered = rewards.filter(reward =>
            (selectedCategory === 'Semua' || reward.category === selectedCategory) &&
            (reward.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                reward.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        if (sortBy === 'Poin Terendah') {
            filtered.sort((a, b) => a.pointsRequired - b.pointsRequired);
        } else {
            filtered.sort((a, b) => b.pointsRequired - a.pointsRequired);
        }
        return filtered;
    }, [rewards, sortBy, searchTerm, selectedCategory]);

    return (
        <div id="rewards-section" className="scroll-mt-20">
            <div>
                <div className="space-y-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                            <input
                                type="text"
                                placeholder="Cari hadiah..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-black/5 dark:bg-white/5 border border-transparent focus:border-accent focus:ring-1 focus:ring-accent rounded-full text-sm transition"
                            />
                        </div>
                        <div className="w-full sm:w-auto">
                            <SegmentedControl
                                id="reward-sort"
                                options={['Poin Terendah', 'Poin Tertinggi']}
                                value={sortBy}
                                onChange={(val) => setSortBy(val as 'Poin Terendah' | 'Poin Tertinggi')}
                            />
                        </div>
                    </div>
                    <ScrollableTabs
                        id="reward-category-filter"
                        options={rewardCategories}
                        value={selectedCategory}
                        onChange={(val) => setSelectedCategory(val as any)}
                    />
                </div>

                {filteredAndSortedRewards.length > 0 ? (
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
                        {filteredAndSortedRewards.map(reward => (
                            <RewardCard key={reward.id} reward={reward} userPoints={userPoints} onViewDetails={onViewDetails} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 col-span-full">
                        <Gift className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" />
                        <h4 className="mt-4 text-xl font-medium text-text-primary">Tidak Ada Hadiah Ditemukan</h4>
                        <p className="mt-2 text-text-muted">Coba ubah kata kunci pencarian atau filter Anda.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const MissionItem: React.FC<{
    mission: Mission;
    onClaim: (missionId: number) => void;
    isClaiming: boolean;
    isJustClaimed: boolean;
}> = ({ mission, onClaim, isClaiming, isJustClaimed }) => {
    const isClaimable = mission.progress >= mission.goal && mission.status !== 'Claimed';
    const isClaimed = mission.status === 'Claimed';
    const progressPercentage = (mission.progress / mission.goal) * 100;

    return (
        <div className="relative p-4 bg-black/5 dark:bg-white/5 rounded-[16px] border border-white/20">
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                    <h4 className="text-[15px] font-semibold text-gray-900 dark:text-white">
                        {mission.title}
                    </h4>
                    <p className="text-[13px] text-gray-900/55 dark:text-white/55 mt-0.5">
                        {mission.description}
                    </p>
                </div>
                <div className="flex items-center gap-2 text-[#007AFF] font-semibold text-[14px]">
                    +{mission.points} Poin
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-[6px] bg-black/10 dark:bg-white/10 rounded-full overflow-hidden mb-2">
                <motion.div
                    className={`absolute top - 0 left - 0 h - full rounded - full ${isClaimed ? 'bg-green-500' : 'bg-gradient-to-r from-[#007AFF] to-[#00C7FF]'
                        } `}
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}% ` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                />
            </div>

            {/* Status/Action */}
            <div className="flex items-center justify-between">
                <span className="text-[12px] text-gray-900/55 dark:text-white/55">
                    {mission.progress}/{mission.goal}
                </span>
                {isClaimable ? (
                    <button
                        onClick={() => onClaim(mission.id)}
                        disabled={isClaiming}
                        className="px-4 py-1.5 bg-[#007AFF] text-white rounded-[12px] hover:bg-[#0051D5] transition-colors text-[13px] font-semibold disabled:opacity-50"
                    >
                        {isClaiming ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Klaim'}
                    </button>
                ) : isClaimed ? (
                    <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-[13px] font-medium">
                        <Check className="w-[15px] h-[15px]" strokeWidth={2.5} />
                        Terklaim
                    </span>
                ) : null}
            </div>

            {/* Claim Animation */}
            <AnimatePresence>
                {isJustClaimed && (
                    <motion.span
                        key={mission.id}
                        initial={{ y: 0, opacity: 1, scale: 0.8 }}
                        animate={{ y: -30, opacity: 0, scale: 1.3 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="absolute right-4 top-4 text-[18px] font-bold text-[#007AFF]"
                    >
                        +{mission.points}
                    </motion.span>
                )}
            </AnimatePresence>
        </div>
    );
};

const WeeklyMissionsCard: React.FC<{
    missions: Mission[];
    onClaim: (missionId: number) => void;
    claimingId: number | null;
    justClaimedId: number | null;
    isPreview?: boolean;
    onViewAll?: () => void;
}> = ({ missions, onClaim, claimingId, justClaimedId, isPreview = false, onViewAll }) => (
    <div className="p-5 bg-white/55 dark:bg-white/10 backdrop-blur-[30px] rounded-[24px] border border-white/35 shadow-[0_8px_28px_rgba(0,0,0,0.12)]">
        <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
                <div className="w-7 h-7 flex items-center justify-center bg-[#007AFF]/10 rounded-[8px]">
                    <Target className="w-[15px] h-[15px] text-[#007AFF]" strokeWidth={2} />
                </div>
                <h3 className="text-[17px] font-semibold text-gray-900 dark:text-white tracking-tight">
                    Misi Mingguan Anda
                </h3>
            </div>
            {isPreview && onViewAll && (
                <button
                    onClick={onViewAll}
                    className="text-[12px] font-medium text-[#007AFF] hover:text-[#0051D5] flex items-center gap-0.5 transition-colors"
                >
                    Lihat Semua
                    <ChevronRight className="w-[14px] h-[14px]" strokeWidth={2.5} />
                </button>
            )}
        </div>
        <div className="space-y-2.5">
            {missions.map(mission => (
                <MissionItem
                    key={mission.id}
                    mission={mission}
                    onClaim={onClaim}
                    isClaiming={claimingId === mission.id}
                    isJustClaimed={justClaimedId === mission.id}
                />
            ))}
        </div>
    </div>
);


const TierComparisonCard: React.FC<{ userPoints: number }> = ({ userPoints }) => {
    const currentLevelIndex = levelData.slice().reverse().findIndex(level => userPoints >= level.minPoints);
    const actualCurrentLevelIndex = currentLevelIndex !== -1 ? levelData.length - 1 - currentLevelIndex : 0;

    return (
        <div className="p-6 bg-surface rounded-2xl shadow-card border border-glass-border">
            <h3 className="text-lg font-medium tracking-tight text-text-primary mb-4">Perbandingan Level</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {levelData.map((level, index) => {
                    const isCurrent = index === actualCurrentLevelIndex;
                    const isLocked = index > actualCurrentLevelIndex;

                    return (
                        <div key={level.name} className={`relative p - 4 rounded - xl border - 2 transition - all duration - 300 ${isCurrent ? 'border-accent shadow-lg bg-accent/5' : 'border-black/10 dark:border-white/10'} ${isLocked ? 'opacity-60' : ''} `}>
                            {isCurrent && <div className="absolute -top-3 right-3 text-xs font-bold bg-accent text-white px-2 py-0.5 rounded-full">Level Anda</div>}
                            <p className="text-3xl text-center mb-1">{level.badge}</p>
                            <h4 className="font-semibold text-center text-text-primary">{level.name}</h4>
                            <p className="text-xs text-center text-text-muted">{level.minPoints.toLocaleString('id-ID')}+ Poin</p>
                            <hr className="my-3 border-black/10 dark:border-white/10" />
                            <ul className="space-y-2">
                                {level.benefits.map((benefit, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs">
                                        <benefit.icon className={`w - 3.5 h - 3.5 mt - 0.5 flex - shrink - 0 ${isLocked ? 'text-text-muted' : 'text-accent'} `} />
                                        <span className="text-text-muted">{benefit.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


const Badge: React.FC<{ achievement: Achievement }> = ({ achievement }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="relative flex flex-col items-center"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={`w - 16 h - 16 rounded - full flex items - center justify - center text - 3xl transition - all duration - 300 ${achievement.unlocked
                ? 'bg-amber-100 dark:bg-amber-900/50 shadow-lg shadow-amber-500/20'
                : 'bg-gray-100 dark:bg-white/5 grayscale'
                } `}>
                {achievement.icon}
            </div>

            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute -top-20 w-48 bg-surface-2 p-3 rounded-lg shadow-popover border border-glass-border z-10 text-center"
                    >
                        <p className="font-semibold text-sm text-text-primary">{achievement.title}</p>
                        <p className="text-xs text-text-muted mt-1">{achievement.description}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const AchievementsCard: React.FC<{ achievements: Achievement[] }> = ({ achievements }) => (
    <div className="p-6 bg-surface rounded-2xl shadow-card border border-glass-border">
        <h3 className="text-lg font-medium tracking-tight text-text-primary mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Koleksi Lencana
        </h3>
        <div className="grid grid-cols-4 gap-4">
            {achievements.map(ach => <Badge key={ach.id} achievement={ach} />)}
        </div>
    </div>
);


interface ExclusiveOfferProps {
    levelName: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
}

const ExclusiveOffer: React.FC<ExclusiveOfferProps> = ({ levelName }) => {
    const offerConfig = {
        Bronze: {
            Icon: Award,
            title: "Buka Keuntungan Silver 🥈",
            description: "Naik ke level Silver untuk mendapatkan bonus poin 5% di setiap transaksi dan keuntungan lainnya yang akan datang."
        },
        Silver: {
            Icon: Gift,
            title: "Selangkah Lagi ke Gold 🥇",
            description: "Raih level Gold untuk mendapatkan hadiah ulang tahun spesial dan bonus poin 10% di setiap transaksi."
        },
        Gold: {
            Icon: Gem,
            title: "Program Eksklusif Platinum 💎",
            description: "Naik ke Level Platinum untuk mendapatkan akses undangan ke acara Private Tasting Dinner bersama Chef kami."
        },
        Platinum: {
            Icon: Sparkles,
            title: "Anda Anggota Platinum! 💎",
            description: "Selamat! Anda telah membuka semua keuntungan eksklusif. Nantikan undangan spesial dan penawaran premium hanya untuk Anda."
        }
    };

    const currentOffer = offerConfig[levelName];
    const { Icon, title, description } = currentOffer;

    return (
        <div className="p-8 rounded-2xl bg-gradient-to-br from-gray-800 to-black text-white relative overflow-hidden">
            <Icon className="absolute -right-8 -top-8 w-32 h-32 text-white/5" />
            <h3 className="text-xl font-semibold mb-2 relative z-10">{title}</h3>
            <p className="text-gray-300 max-w-md relative z-10">{description}</p>
        </div>
    );
};

const AccordionItem: React.FC<{ item: FaqItem; isOpen: boolean; onClick: () => void; }> = ({ item, isOpen, onClick }) => {
    return (
        <div className="border-b border-black/10 dark:border-white/10 last:border-b-0">
            <button
                onClick={onClick}
                className="w-full flex justify-between items-center text-left py-4"
                aria-expanded={isOpen}
            >
                <span className="font-medium text-text-primary">{item.question}</span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <ChevronDown className="w-5 h-5 text-text-muted" />
                </motion.div>
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        exit="collapsed"
                        variants={{
                            open: { opacity: 1, height: "auto" },
                            collapsed: { opacity: 0, height: 0 }
                        }}
                        transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                    >
                        <div className="pb-4 text-sm text-text-muted leading-relaxed">
                            {item.answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const MyRewardsList: React.FC<{ rewards: UserReward[]; rewardsData: LoyaltyReward[] }> = ({ rewards, rewardsData }) => {
    const { addToast } = useToast();
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const handleCopy = async (code: string, rewardId: number) => {
        try {
            await navigator.clipboard.writeText(code);
            addToast('Kode voucher disalin!', 'success');
            setCopiedId(rewardId);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            // Fallback for older browsers or if clipboard API fails
            const textArea = document.createElement('textarea');
            textArea.value = code;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                addToast('Kode voucher disalin!', 'success');
                setCopiedId(rewardId);
                setTimeout(() => setCopiedId(null), 2000);
            } catch (fallbackErr) {
                addToast('Gagal menyalin kode. Silakan salin manual.', 'error');
            }
            document.body.removeChild(textArea);
        }
    };

    // Filter to only show active rewards (not expired and not used)
    const activeRewards = rewards.filter(reward => {
        const isExpired = new Date(reward.expiryDate) < new Date();
        const isUsed = reward.status === 'Used';
        return !isExpired && !isUsed;
    });

    if (activeRewards.length === 0) {
        return (
            <div className="text-center py-16 col-span-full bg-surface rounded-2xl border border-glass-border">
                <Ticket className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" />
                <h4 className="mt-4 text-xl font-medium text-text-primary">Belum Ada Hadiah</h4>
                <p className="mt-2 text-text-muted">Tukarkan poin Anda dengan hadiah menarik sekarang!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeRewards.map(userReward => {
                const rewardDetails = rewardsData.find(r => r.id === userReward.rewardId);
                if (!rewardDetails) return null;

                const isExpired = new Date(userReward.expiryDate) < new Date();
                const isUsed = userReward.status === 'Used';

                return (
                    <div key={userReward.id} className={`flex bg-surface rounded-2xl shadow-card border border-glass-border overflow-hidden ${isExpired || isUsed ? 'opacity-60 grayscale' : ''}`}>
                        <div className="w-1/3 relative">
                            <img src={rewardDetails.image} alt={rewardDetails.title} className="w-full h-full object-cover" />
                            {(isExpired || isUsed) && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <span className="text-white font-bold text-sm bg-black/50 px-2 py-1 rounded">{isUsed ? 'TERPAKAI' : 'KADALUARSA'}</span>
                                </div>
                            )}
                        </div>
                        <div className="w-2/3 p-4 flex flex-col justify-between">
                            <div>
                                <h4 className="font-semibold text-text-primary line-clamp-1">{rewardDetails.title}</h4>
                                <p className="text-xs text-text-muted mt-1">Berlaku hingga: {new Date(userReward.expiryDate).toLocaleDateString('id-ID')}</p>
                            </div>

                            <div className="mt-4 p-2 bg-black/5 dark:bg-white/5 rounded-lg border border-black/5 dark:border-white/5 flex items-center justify-between">
                                <span className="font-mono font-medium text-sm text-accent">{userReward.code}</span>
                                <div className="flex items-center gap-2">
                                    {copiedId === userReward.id && (
                                        <span className="text-xs text-green-600 dark:text-green-400 font-medium animate-fade-in">
                                            Disalin!
                                        </span>
                                    )}
                                    <button
                                        onClick={() => handleCopy(userReward.code, userReward.id)}
                                        disabled={isExpired || isUsed}
                                        className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-md transition-colors disabled:opacity-50"
                                    >
                                        <Copy className="w-4 h-4 text-text-muted" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};



const FaqCard: React.FC<{ items: FaqItem[] }> = ({ items }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const handleClick = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="p-6 bg-surface rounded-2xl shadow-card border border-glass-border">
            <h3 className="text-lg font-semibold text-text-primary mb-2">Pertanyaan Umum (FAQ)</h3>
            <div className="divide-y divide-black/10 dark:divide-white/10">
                {items.map((item, index) => (
                    <AccordionItem
                        key={item.id}
                        item={item}
                        isOpen={openIndex === index}
                        onClick={() => handleClick(index)}
                    />
                ))}
            </div>
        </div>
    );
};

const DailyCheckinCard: React.FC<{
    onCheckin: () => void;
    canCheckin: boolean;
    isCheckingIn: boolean;
    streak: number;
}> = ({ onCheckin, canCheckin, isCheckingIn, streak }) => {
    return (
        <div className="p-5 bg-white/55 dark:bg-white/10 backdrop-blur-[30px] rounded-[24px] border border-white/35 shadow-[0_8px_28px_rgba(0,0,0,0.12)] h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="text-[17px] font-semibold text-gray-900 dark:text-white tracking-tight">
                        Check-in Harian
                    </h3>
                    <p className="text-[12px] text-gray-900/55 dark:text-white/55 mt-0.5">
                        Dapatkan poin setiap hari!
                    </p>
                </div>
                {streak > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 rounded-[10px] border border-amber-500/20">
                        <Flame className="w-[14px] h-[14px] text-amber-500" strokeWidth={2} />
                        <span className="text-[12px] font-semibold text-amber-600 dark:text-amber-400">{streak}</span>
                    </div>
                )}
            </div>

            {/* Check-in Button */}
            <div className="flex-1 flex items-end">
                <button
                    onClick={onCheckin}
                    disabled={!canCheckin || isCheckingIn}
                    className="w-full px-4 py-2.5 rounded-[16px] font-semibold text-[13px] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 bg-gray-900/5 dark:bg-white/10 text-gray-900 dark:text-white hover:bg-gray-900/10 dark:hover:bg-white/15 disabled:hover:bg-gray-900/5 dark:disabled:hover:bg-white/10"
                >
                    {isCheckingIn ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : canCheckin ? (
                        <>
                            <Check className="w-[14px] h-[14px]" strokeWidth={2.5} />
                            Check-in & Dapatkan 25 Poin
                        </>
                    ) : (
                        <>
                            <Check className="w-[14px] h-[14px]" strokeWidth={2.5} />
                            Sudah Check-in Hari Ini
                        </>
                    )}
                </button>
            </div>

            {/* Footer Text */}
            <p className="text-[10px] text-gray-900/55 dark:text-white/55 text-center mt-3">
                Check-in 7 hari berturut-turut untuk bonus 150 poin!
            </p>
        </div>
    );
};


const PageSkeleton: React.FC = () => (
    <div className="space-y-10">
        <div className="flex flex-col items-center gap-4">
            <SkeletonLoader className="h-9 w-3/4 rounded-lg bg-gray-200 dark:bg-gray-700" />
            <SkeletonLoader className="h-6 w-1/2 rounded-lg bg-gray-200 dark:bg-gray-700" />
            <div className="flex gap-4 mt-2">
                <SkeletonLoader className="h-9 w-32 rounded-full bg-gray-200 dark:bg-gray-700" />
                <SkeletonLoader className="h-9 w-32 rounded-full bg-gray-200 dark:bg-gray-700" />
            </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1 space-y-8">
                <SkeletonLoader className="h-24 rounded-2xl bg-gray-200 dark:bg-gray-700" />
                <SkeletonLoader className="h-48 rounded-2xl bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="lg:col-span-2 space-y-8">
                <SkeletonLoader className="h-40 rounded-2xl bg-gray-200 dark:bg-gray-700" />
                <SkeletonLoader className="h-64 rounded-2xl bg-gray-200 dark:bg-gray-700" />
            </div>
        </div>
    </div>
);

const CustomerRewardsPage: React.FC = () => {
    const { user, updateUserData } = useAuth();
    const { addToast } = useToast();

    const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
    const [transactions, setTransactions] = useState<PointTransaction[]>([]);
    const [missions, setMissions] = useState<Mission[]>([]);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
    const [userRewards, setUserRewards] = useState<UserReward[]>([]);

    const [loading, setLoading] = useState(true);
    const [showConfetti, setShowConfetti] = useState(false);
    const [isCardModalOpen, setIsCardModalOpen] = useState(false);

    const [rewardInDetails, setRewardInDetails] = useState<LoyaltyReward | null>(null);
    const [rewardToRedeem, setRewardToRedeem] = useState<LoyaltyReward | null>(null);
    const [redemptionStep, setRedemptionStep] = useState<'confirm' | 'success'>('confirm');
    const [isRedeeming, setIsRedeeming] = useState(false);

    const [userPoints, setUserPoints] = useState(user?.loyaltyPoints || 0);
    const [claimingId, setClaimingId] = useState<number | null>(null);
    const [justClaimedId, setJustClaimedId] = useState<number | null>(null);

    const [isClaimingBirthdayReward, setIsClaimingBirthdayReward] = useState(false);
    const [birthdayRewardClaimed, setBirthdayRewardClaimed] = useState(user?.birthdayRewardClaimed || false);

    const [isCheckingIn, setIsCheckingIn] = useState(false);

    const tabs = ['Ringkasan', 'Redeem', 'Hadiah Saya', 'Misi', 'Riwayat'] as const;
    type Tab = typeof tabs[number];
    const [activeTab, setActiveTab] = useState<Tab>('Ringkasan');

    useEffect(() => {
        if (user) {
            setUserPoints(user.loyaltyPoints || 0);
            setBirthdayRewardClaimed(user.birthdayRewardClaimed || false);
        }
    }, [user]);

    useEffect(() => {
        const loadData = async () => {
            if (user) {
                setLoading(true);
                const [fetchedRewards, fetchedTransactions, fetchedMissions, fetchedAchievements, fetchedFaqs, fetchedUserRewards] = await Promise.all([
                    fetchRewards(),
                    fetchPointTransactionsByCustomerId(user.id),
                    fetchMissions(user.id),
                    fetchAchievements(user.id),
                    fetchFaqItems(),
                    fetchUserRewards(user.id)
                ]);
                setRewards(fetchedRewards.sort((a, b) => a.pointsRequired - b.pointsRequired));
                setTransactions(fetchedTransactions);
                setMissions(fetchedMissions);
                setAchievements(fetchedAchievements);
                setFaqItems(fetchedFaqs);
                setUserRewards(fetchedUserRewards);
                setLoading(false);
            }
        };
        loadData();
    }, [user]);

    const handleViewDetails = (reward: LoyaltyReward) => {
        setRewardInDetails(reward);
    };

    const handleProceedToRedeem = (reward: LoyaltyReward) => {
        setRewardInDetails(null);
        setTimeout(() => {
            setRewardToRedeem(reward);
            setRedemptionStep('confirm');
        }, 300); // Wait for modal to close
    };

    const handleRedeemConfirm = async () => {
        if (!rewardToRedeem || !user) return;
        setIsRedeeming(true);

        const result = await redeemReward(user.id, rewardToRedeem.id);

        if (result.success) {
            const newPoints = userPoints - rewardToRedeem.pointsRequired;
            setUserPoints(newPoints);

            const updatedFields = { loyaltyPoints: newPoints };
            const updatedUser = await updateUser(user.id, updatedFields);
            if (updatedUser) {
                updateUserData(updatedUser);
            }

            const [newTransactions, newUserRewards] = await Promise.all([
                fetchPointTransactionsByCustomerId(user.id),
                fetchUserRewards(user.id)
            ]);
            setTransactions(newTransactions);
            setUserRewards(newUserRewards);

            setRedemptionStep('success');
            addToast(`Berhasil menukar ${rewardToRedeem.title} !`, 'success');
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 4000);
        } else {
            addToast(result.message, 'error');
            setRewardToRedeem(null); // Close modal if redemption failed
        }

        setIsRedeeming(false);
    };

    const handleCloseRedemptionModal = () => {
        setRewardToRedeem(null);
    };

    const handleClaimMission = async (missionId: number) => {
        const mission = missions.find(m => m.id === missionId);
        if (!mission || !user || mission.claimed || claimingId) return;

        setClaimingId(missionId);
        await new Promise(res => setTimeout(res, 800));

        const newPoints = userPoints + mission.points;
        setUserPoints(newPoints);

        setMissions(prev => prev.map(m => m.id === missionId ? { ...m, claimed: true } : m));

        const updatedFields = { loyaltyPoints: newPoints };
        const updatedUser = await updateUser(user.id, updatedFields);
        if (updatedUser) {
            updateUserData(updatedFields);
        }

        setTransactions(prev => [{
            id: Date.now(),
            customerId: user.id,
            description: `Klaim Misi: ${mission.title} `,
            points: mission.points,
            date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
        }, ...prev].sort((a, b) => b.id - a.id));

        addToast(`Selamat! Anda mendapatkan + ${mission.points} poin.`, 'success');

        setJustClaimedId(missionId);
        setTimeout(() => setJustClaimedId(null), 1500);

        setClaimingId(null);
    };

    const handleClaimBirthdayReward = async () => {
        if (!user || birthdayRewardClaimed) return;

        setIsClaimingBirthdayReward(true);
        await new Promise(res => setTimeout(res, 1200));

        const birthdayPoints = 500;
        const newPoints = userPoints + birthdayPoints;

        const updatedFields = {
            loyaltyPoints: newPoints,
            birthdayRewardClaimed: true,
        };

        const updatedUserInDB = await updateUser(user.id, updatedFields);
        if (updatedUserInDB) {
            updateUserData(updatedFields);
            setUserPoints(newPoints);
            setBirthdayRewardClaimed(true);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 4000);

            setTransactions(prev => [{
                id: Date.now(),
                customerId: user.id,
                description: `Hadiah Ulang Tahun`,
                points: birthdayPoints,
                date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
            }, ...prev].sort((a, b) => b.id - a.id));

            addToast(`Selamat! Anda mendapatkan + ${birthdayPoints} Poin Ulang Tahun!`, 'success');
        } else {
            addToast('Gagal mengklaim hadiah.', 'error');
        }

        setIsClaimingBirthdayReward(false);
    };

    const handleCheckin = async () => {
        if (!user) return;
        setIsCheckingIn(true);
        await new Promise(res => setTimeout(res, 1000));

        const isYesterday = (date: Date) => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            return date.toDateString() === yesterday.toDateString();
        };

        const lastCheckin = user.lastCheckinDate ? new Date(user.lastCheckinDate) : null;
        const currentStreak = user.dailyCheckinStreak || 0;
        const newStreak = lastCheckin && isYesterday(lastCheckin) ? currentStreak + 1 : 1;

        const basePoints = 25;
        const bonusPoints = (newStreak > 0 && newStreak % 7 === 0) ? 150 : 0;
        const pointsToAdd = basePoints + bonusPoints;
        const newPoints = userPoints + pointsToAdd;

        const todayString = new Date().toISOString().split('T')[0];

        const updatedFields = {
            loyaltyPoints: newPoints,
            dailyCheckinStreak: newStreak,
            lastCheckinDate: todayString,
        };

        const updatedUserInDB = await updateUser(user.id, updatedFields);
        if (updatedUserInDB) {
            updateUserData(updatedFields);

            setTransactions(prev => [{
                id: Date.now(),
                customerId: user.id,
                description: `Check -in Harian(Hari ke - ${newStreak})`,
                points: pointsToAdd,
                date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
            }, ...prev].sort((a, b) => b.id - a.id));

            addToast(`Check -in berhasil! + ${pointsToAdd} poin.`, 'success');
            if (bonusPoints > 0) {
                addToast(`Bonus rentetan 7 hari! + ${bonusPoints} poin ekstra!`, 'info');
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 4000);
            }
        } else {
            addToast('Gagal melakukan check-in.', 'error');
        }

        setIsCheckingIn(false);
    };

    const isBirthdayMonth = user?.birthdate ? new Date(user.birthdate).getMonth() === new Date().getMonth() : false;
    const currentLevel = levelData.slice().reverse().find(level => userPoints >= level.minPoints) || levelData[0];

    const lastCheckinDate = user?.lastCheckinDate ? new Date(user.lastCheckinDate) : null;
    const canCheckin = !lastCheckinDate || (lastCheckinDate.toDateString() !== new Date().toDateString());

    if (loading || !user) {
        return <PageSkeleton />;
    }

    return (
        <div className="space-y-8">
            {showConfetti && <Confetti />}

            <PointsSummary user={{ ...user, loyaltyPoints: userPoints }} onOpenCard={() => setIsCardModalOpen(true)} />

            <div className="py-4 flex justify-center">
                <SegmentedControl
                    id="rewards-tabs"
                    options={[...tabs]}
                    value={activeTab}
                    onChange={(val) => setActiveTab(val as Tab)}
                />
            </div>

            <div>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeTab === 'Ringkasan' && (
                            <div className="space-y-8">
                                <NotificationBanner />
                                {isBirthdayMonth && (
                                    <BirthdayRewardCard
                                        userName={user.name}
                                        isClaimed={birthdayRewardClaimed}
                                        onClaim={handleClaimBirthdayReward}
                                        isClaiming={isClaimingBirthdayReward}
                                    />
                                )}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <LevelTracker userPoints={userPoints} />
                                    <DailyCheckinCard
                                        onCheckin={handleCheckin}
                                        canCheckin={canCheckin}
                                        isCheckingIn={isCheckingIn}
                                        streak={canCheckin && user.lastCheckinDate && new Date(user.lastCheckinDate).toDateString() !== new Date(new Date().setDate(new Date().getDate() - 1)).toDateString() ? 0 : user.dailyCheckinStreak || 0}
                                    />
                                </div>
                                <WeeklyMissionsCard isPreview missions={missions.slice(0, 2)} onClaim={handleClaimMission} claimingId={claimingId} justClaimedId={justClaimedId} onViewAll={() => setActiveTab('Misi')} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <ReferralCard userName={user.name} />
                                    <GoToRewardsCard onViewRewards={() => setActiveTab('Redeem')} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'Redeem' && (
                            <div className="space-y-8">
                                <RewardsSection rewards={rewards} userPoints={userPoints} onViewDetails={handleViewDetails} />
                                <ExclusiveOffer levelName={currentLevel.name as 'Bronze' | 'Silver' | 'Gold' | 'Platinum'} />
                            </div>
                        )}

                        {activeTab === 'Hadiah Saya' && (
                            <motion.div
                                key="hadiah-saya"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <MyRewardsList rewards={userRewards} rewardsData={rewards} />
                            </motion.div>
                        )}

                        {activeTab === 'Misi' && (
                            <div className="space-y-8">
                                <WeeklyMissionsCard missions={missions} onClaim={handleClaimMission} claimingId={claimingId} justClaimedId={justClaimedId} />
                                <AchievementsCard achievements={achievements} />
                            </div>
                        )}

                        {activeTab === 'Riwayat' && (
                            <div className="space-y-8">
                                <ActivityTimeline transactions={transactions} />
                                <WaysToEarn />
                                <TierComparisonCard userPoints={userPoints} />
                                <FaqCard items={faqItems} />
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            <RewardDetailsModal
                reward={rewardInDetails}
                onClose={() => setRewardInDetails(null)}
                onProceedToRedeem={handleProceedToRedeem}
                userPoints={userPoints}
            />

            <RedemptionModal
                reward={rewardToRedeem}
                userPoints={userPoints}
                onClose={handleCloseRedemptionModal}
                onConfirm={handleRedeemConfirm}
                step={redemptionStep}
                loading={isRedeeming}
            />

            <Modal isOpen={isCardModalOpen} onClose={() => setIsCardModalOpen(false)} title="">
                <DigitalMemberCard user={user} levelName={currentLevel.name} onClose={() => setIsCardModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default CustomerRewardsPage;
