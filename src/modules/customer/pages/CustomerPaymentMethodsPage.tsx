import React, { useState, useEffect } from 'react';
import { useAuth } from '@core/hooks/useAuth';
import { useToast } from '@core/contexts/ToastContext';
import { PaymentMethod, addPaymentMethod, deletePaymentMethod } from '@core/data/mockDB';
import { MoreVertical, Edit, Trash2, Plus, CreditCard } from 'lucide-react';
import Modal from '@ui/Modal';

const PaymentMethodListItem: React.FC<{ method: PaymentMethod; onEdit: () => void; onDelete: () => void }> = ({ method, onEdit, onDelete }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const isCard = method.type === 'Credit Card';

    return (
        <li className="py-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-12 h-8 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center font-bold text-xs text-text-muted">
                    {isCard ? method.provider.substring(0, 4) : method.provider}
                </div>
                <div>
                    <p className="font-semibold text-text-primary">{method.provider} {isCard ? `**** ${method.last4}` : ''}</p>
                    <p className="text-sm text-text-muted mt-1">{isCard ? `Berakhir ${method.expiry}` : 'E-Wallet'}</p>
                </div>
            </div>
            <div className="relative flex-shrink-0 ml-4">
                <button onClick={() => setIsMenuOpen(p => !p)} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                    <MoreVertical size={18} />
                </button>
                {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-32 bg-surface-2 dark:bg-neutral-700 rounded-lg shadow-popover border border-black/10 dark:border-white/10 z-10 p-1">
                        <button onClick={() => { onEdit(); setIsMenuOpen(false); }} className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-sm rounded-md hover:bg-black/5 dark:hover:bg-white/5">
                            <Edit size={14} /> Edit
                        </button>
                        <button onClick={() => { onDelete(); setIsMenuOpen(false); }} className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-sm rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-danger">
                            <Trash2 size={14} /> Hapus
                        </button>
                    </div>
                )}
            </div>
        </li>
    );
};


const CustomerPaymentMethodsPage: React.FC = () => {
    const { user, updateUserData } = useAuth();
    const { addToast } = useToast();

    const [methods, setMethods] = useState<PaymentMethod[]>(user?.savedPaymentMethods || []);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmDeleteState, setConfirmDeleteState] = useState<{ isOpen: boolean; data: PaymentMethod | null }>({ isOpen: false, data: null });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setMethods(user?.savedPaymentMethods || []);
    }, [user?.savedPaymentMethods]);

    // Simplified form logic as we don't have a real payment form
    const handleAddMethod = async () => {
        if (!user) return;
        setIsSubmitting(true);
        try {
            const newMethod: Omit<PaymentMethod, 'id'> = { type: 'Credit Card', provider: 'Mastercard', last4: String(Math.floor(1000 + Math.random() * 9000)), expiry: '08/28' };
            const addedMethod = await addPaymentMethod(user.id, newMethod);
            updateUserData({ ...user, savedPaymentMethods: [...methods, addedMethod] });
            addToast('Metode pembayaran baru ditambahkan.', 'success');
        } catch {
            addToast('Gagal menambah metode pembayaran.', 'error');
        } finally {
            setIsSubmitting(false);
            setIsModalOpen(false);
        }
    };

    const handleDelete = async () => {
        if (!user || !confirmDeleteState.data) return;
        setIsSubmitting(true);
        try {
            await deletePaymentMethod(user.id, confirmDeleteState.data.id);
            const updatedMethods = methods.filter(a => a.id !== confirmDeleteState.data!.id);
            updateUserData({ ...user, savedPaymentMethods: updatedMethods });
            addToast('Metode pembayaran dihapus.', 'success');
            setConfirmDeleteState({ isOpen: false, data: null });
        } catch (error) {
            addToast('Gagal menghapus metode pembayaran.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="bg-surface dark:bg-neutral-800/50 rounded-2xl shadow-card border border-black/10 dark:border-white/10">
                <div className="p-6 border-b border-black/10 dark:border-white/10 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-medium tracking-tight text-text-primary">Metode Pembayaran</h3>
                        <p className="text-sm text-text-muted">Kelola metode pembayaran Anda.</p>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold border border-accent text-accent hover:bg-accent/10 transition-colors">
                        <Plus size={16} /> Tambah
                    </button>
                </div>
                <div className="p-6">
                    {methods.length > 0 ? (
                        <ul className="divide-y divide-black/10 dark:divide-white/10 -my-6">
                            {methods.map(method => (
                                <PaymentMethodListItem
                                    key={method.id}
                                    method={method}
                                    onEdit={() => addToast('Fitur edit akan segera hadir.', 'info')}
                                    onDelete={() => setConfirmDeleteState({ isOpen: true, data: method })}
                                />
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-8">
                            <CreditCard className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
                            <h3 className="mt-2 font-medium text-text-primary">Tidak ada metode pembayaran</h3>
                            <p className="mt-1 text-sm text-text-muted">Tambah metode pembayaran untuk checkout yang lebih cepat.</p>
                        </div>
                    )}
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Metode Pembayaran">
                <div className="text-center p-4">
                    <p className="text-text-muted">Integrasi formulir pembayaran aman akan tersedia di sini.</p>
                    <button onClick={handleAddMethod} disabled={isSubmitting} className="mt-6 bg-accent text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50">
                        {isSubmitting ? 'Menyimpan...' : 'Tambah Kartu Dummy'}
                    </button>
                </div>
            </Modal>

            <Modal isOpen={confirmDeleteState.isOpen} onClose={() => setConfirmDeleteState({ isOpen: false, data: null })} title="Konfirmasi Hapus">
                <p className="text-text-muted">Anda yakin ingin menghapus metode pembayaran ini?</p>
                <div className="flex justify-end gap-4 mt-8">
                    <button onClick={() => setConfirmDeleteState({ isOpen: false, data: null })} disabled={isSubmitting} className="px-5 py-2 rounded-lg text-sm font-semibold text-text-muted hover:bg-black/5 dark:hover:bg-white/10">Batal</button>
                    <button onClick={handleDelete} disabled={isSubmitting} className="bg-danger text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50">
                        {isSubmitting ? 'Menghapus...' : 'Hapus'}
                    </button>
                </div>
            </Modal>
        </>
    );
};

export default CustomerPaymentMethodsPage;