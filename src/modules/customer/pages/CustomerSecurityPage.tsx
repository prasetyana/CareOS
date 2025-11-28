import React, { useState, useEffect } from 'react';
import { useAuth } from '@core/hooks/useAuth';
import { useToast } from '@core/contexts/ToastContext';
import { UserSession, fetchUserSessions, deleteAllOtherUserSessions, deleteUserSession, updateUser, mockUsers } from '@core/data/mockDB';
import { Smartphone, Monitor } from 'lucide-react';
import Modal from '@ui/Modal';

const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Aktif sekarang";
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `Aktif ${minutes} menit lalu`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `Aktif ${hours} jam lalu`;
    const days = Math.round(hours / 24);
    return `Aktif ${days} hari lalu`;
};

const SecurityField: React.FC<{ label: string; children: React.ReactNode; }> = ({ label, children }) => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-start py-6">
        <dt className="text-sm font-medium text-text-muted col-span-1 pt-2.5">{label}</dt>
        <dd className="col-span-2 text-text-primary dark:text-gray-200">{children}</dd>
    </div>
);


const ActiveSessions: React.FC = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [sessions, setSessions] = useState<UserSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [confirmLogout, setConfirmLogout] = useState<{ isOpen: boolean; session: UserSession | 'all' | null }>({ isOpen: false, session: null });

    const loadSessions = async () => {
        if (!user) return;
        setLoading(true);
        const userSessions = await fetchUserSessions(user.id);
        setSessions(userSessions);
        setLoading(false);
    };

    useEffect(() => {
        loadSessions();
    }, [user]);

    const handleLogout = async () => {
        if (!user || !confirmLogout.session) return;

        setIsSubmitting(true);
        try {
            if (confirmLogout.session === 'all') {
                await deleteAllOtherUserSessions(user.id);
                addToast("Berhasil keluar dari semua perangkat lain.", 'success');
            } else if (typeof confirmLogout.session === 'object') {
                await deleteUserSession(user.id, confirmLogout.session.id);
                addToast(`Sesi di ${confirmLogout.session.device} telah dihentikan.`, 'success');
            }
            await loadSessions(); // Refresh list
        } catch {
            addToast("Gagal menghentikan sesi.", 'error');
        } finally {
            setIsSubmitting(false);
            setConfirmLogout({ isOpen: false, session: null });
        }
    };

    return (
        <>
            <div className="bg-surface dark:bg-neutral-800/50 rounded-2xl shadow-card border border-black/10 dark:border-white/10">
                <div className="p-6 border-b border-black/10 dark:border-white/10">
                    <h3 className="text-lg font-medium tracking-tight text-text-primary">Sesi Aktif</h3>
                    <p className="text-sm text-text-muted">Ini adalah daftar perangkat yang telah masuk ke akun Anda.</p>
                </div>
                {loading ? (
                    <div className="p-6 text-center text-sm text-text-muted">Memuat sesi...</div>
                ) : (
                    <ul className="divide-y divide-black/10 dark:divide-white/10">
                        {sessions.map(session => (
                            <li key={session.id} className="p-6 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    {session.device.toLowerCase().includes('iphone') ? <Smartphone className="w-8 h-8 text-text-muted" /> : <Monitor className="w-8 h-8 text-text-muted" />}
                                    <div>
                                        <p className="font-medium text-text-primary">{session.device} {session.isCurrent && <span className="text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded-full ml-2">Perangkat ini</span>}</p>
                                        <p className="text-sm text-text-muted">{session.location} • {formatTimeAgo(session.lastActive)}</p>
                                    </div>
                                </div>
                                {!session.isCurrent && (
                                    <button onClick={() => setConfirmLogout({ isOpen: true, session })} className="text-sm font-semibold text-accent hover:underline">Keluar</button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
                <div className="p-6 bg-black/5 dark:bg-white/5 border-t border-black/10 dark:border-white/10 rounded-b-2xl">
                    <button onClick={() => setConfirmLogout({ isOpen: true, session: 'all' })} className="text-sm font-semibold text-accent hover:underline">Keluar dari semua perangkat lain</button>
                </div>
            </div>

            <Modal isOpen={confirmLogout.isOpen} onClose={() => setConfirmLogout({ isOpen: false, session: null })} title="Konfirmasi Keluar">
                <p className="text-text-muted">
                    {confirmLogout.session === 'all'
                        ? "Anda yakin ingin keluar dari semua perangkat lain?"
                        : `Anda yakin ingin keluar dari sesi di ${typeof confirmLogout.session === 'object' ? confirmLogout.session?.device : ''}?`
                    }
                </p>
                <div className="flex justify-end gap-4 mt-8">
                    <button onClick={() => setConfirmLogout({ isOpen: false, session: null })} disabled={isSubmitting} className="px-5 py-2 rounded-lg text-sm font-semibold text-text-muted hover:bg-black/5 dark:hover:bg-white/10">Batal</button>
                    <button onClick={handleLogout} disabled={isSubmitting} className="bg-danger text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50">
                        {isSubmitting ? 'Memproses...' : 'Keluar'}
                    </button>
                </div>
            </Modal>
        </>
    );
}


const CustomerSecurityPage: React.FC = () => {
    const { user, deleteAccount } = useAuth();
    const { addToast } = useToast();

    const [isPasswordEditing, setIsPasswordEditing] = useState(false);
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordError, setPasswordError] = useState('');
    const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [confirmEmail, setConfirmEmail] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const inputClasses = "block w-full shadow-sm py-2.5 px-4 border border-black/10 dark:border-white/20 rounded-lg sm:text-sm transition focus:outline-none focus:ring-1 focus:ring-accent bg-surface dark:bg-neutral-800";
    const labelClasses = "block text-sm font-medium text-text-muted mb-1.5";

    if (!user) {
        return null;
    }

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        const { currentPassword, newPassword, confirmPassword } = passwordData;

        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError('Semua kolom harus diisi.');
            return;
        }
        if (newPassword.length < 6) {
            setPasswordError('Kata sandi baru minimal 6 karakter.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError('Kata sandi baru tidak cocok.');
            return;
        }
        const currentUserInDb = mockUsers.find(u => u.id === user.id);
        if (currentUserInDb?.password !== currentPassword) {
            setPasswordError('Kata sandi saat ini salah.');
            return;
        }

        setIsSubmittingPassword(true);
        const updatedUser = await updateUser(user.id, { password: newPassword });
        if (updatedUser) {
            addToast('Kata sandi berhasil diubah!', 'success');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setIsPasswordEditing(false);
        } else {
            addToast('Gagal mengubah kata sandi.', 'error');
        }
        setIsSubmittingPassword(false);
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            await deleteAccount();
            addToast('Akun berhasil dihapus.', 'success');
        } catch (e: any) {
            addToast(e.message || 'Gagal menghapus akun.', 'error');
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-surface dark:bg-neutral-800/50 rounded-2xl shadow-card border border-black/10 dark:border-white/10">
                <div className="p-6 border-b border-black/10 dark:border-white/10">
                    <h3 className="text-lg font-medium tracking-tight text-text-primary">Keamanan Akun</h3>
                    <p className="text-sm text-text-muted">Kelola kata sandi Anda.</p>
                </div>
                <div className="p-6">
                    <dl className="divide-y divide-black/10 dark:divide-white/10 -my-6">
                        <SecurityField label="Kata Sandi">
                            {!isPasswordEditing ? (
                                <div className="flex justify-between items-center">
                                    <p className="font-mono tracking-widest text-lg text-text-muted">••••••••</p>
                                    <button onClick={() => setIsPasswordEditing(true)} className="px-4 py-1.5 rounded-lg text-sm font-semibold border border-black/10 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                        Ubah
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handlePasswordSubmit}>
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="currentPassword" className={labelClasses}>Kata Sandi Saat Ini</label>
                                            <input id="currentPassword" type="password" value={passwordData.currentPassword} onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })} className={inputClasses} />
                                        </div>
                                        <div>
                                            <label htmlFor="newPassword" className={labelClasses}>Kata Sandi Baru</label>
                                            <input id="newPassword" type="password" value={passwordData.newPassword} onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })} className={inputClasses} />
                                        </div>
                                        <div>
                                            <label htmlFor="confirmPassword" className={labelClasses}>Konfirmasi Kata Sandi Baru</label>
                                            <input id="confirmPassword" type="password" value={passwordData.confirmPassword} onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className={inputClasses} />
                                        </div>
                                        {passwordError && <p className="text-sm text-danger">{passwordError}</p>}
                                        <div className="flex justify-end gap-3 pt-2">
                                            <button type="button" onClick={() => { setIsPasswordEditing(false); setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' }); setPasswordError(''); }} className="px-5 py-2 rounded-lg text-sm font-semibold text-text-muted hover:bg-black/5 dark:hover:bg-white/10">Batal</button>
                                            <button type="submit" disabled={isSubmittingPassword} className="bg-accent text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-colors duration-300 disabled:opacity-50">
                                                {isSubmittingPassword ? 'Menyimpan...' : 'Simpan'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </SecurityField>
                    </dl>
                </div>
            </div>

            <ActiveSessions />

            <div className="bg-danger/5 rounded-2xl shadow-card border border-danger/20">
                <div className="p-6 border-b border-danger/20">
                    <h3 className="text-lg font-semibold text-danger">Zona Berbahaya</h3>
                    <p className="text-sm text-danger/80">Tindakan berikut bersifat permanen dan tidak dapat diurungkan.</p>
                </div>
                <div className="p-6 flex justify-between items-center">
                    <div>
                        <p className="font-semibold text-text-primary">Hapus Akun Ini</p>
                        <p className="text-sm text-text-muted">Semua data Anda akan dihapus secara permanen.</p>
                    </div>
                    <button onClick={() => setIsDeleteModalOpen(true)} className="bg-danger text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-opacity-90">
                        Hapus Akun
                    </button>
                </div>
            </div>

            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Konfirmasi Hapus Akun">
                <p className="text-text-muted">Ini adalah tindakan permanen. Semua data Anda, termasuk riwayat pesanan dan poin loyalitas, akan dihapus. Anda yakin?</p>
                <p className="text-text-muted mt-4">Untuk melanjutkan, ketik <strong className="text-text-primary">{user.email}</strong> di bawah ini.</p>
                <input type="email" value={confirmEmail} onChange={(e) => setConfirmEmail(e.target.value)} className={inputClasses + ' mt-4'} />
                <div className="flex justify-end gap-4 mt-8">
                    <button onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting} className="px-5 py-2 rounded-lg text-sm font-semibold text-text-muted hover:bg-black/5 dark:hover:bg-white/10">Batal</button>
                    <button onClick={handleDeleteAccount} disabled={confirmEmail !== user.email || isDeleting} className="bg-danger text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50">
                        {isDeleting ? 'Menghapus...' : 'Hapus Akun Saya'}
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default CustomerSecurityPage;