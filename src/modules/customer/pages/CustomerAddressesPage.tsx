import React, { useState, useEffect } from 'react';
import { useAuth } from '@core/hooks/useAuth';
import { useToast } from '@core/contexts/ToastContext';
import { Address, addAddress, updateAddress, deleteAddress } from '@core/data/mockDB';
import { MoreVertical, Edit, Trash2, Plus, Home } from 'lucide-react';
import Modal from '@ui/Modal';

const AddressListItem: React.FC<{ address: Address; onEdit: () => void; onDelete: () => void }> = ({ address, onEdit, onDelete }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <li className="py-6 flex items-start justify-between">
            <div>
                <p className="font-semibold text-text-primary">{address.label}</p>
                <p className="text-sm text-text-muted mt-1">{address.fullAddress}</p>
                <p className="text-sm text-text-muted">{address.city}, {address.postalCode}</p>
                {address.notes && <p className="text-xs text-text-muted italic mt-2">Catatan: {address.notes}</p>}
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

// Address Form Component (used inside Modal)
const AddressForm: React.FC<{
    initialData: Partial<Address> | null;
    onSubmit: (data: Omit<Address, 'id'>) => void;
    onCancel: () => void;
    isSubmitting: boolean;
}> = ({ initialData, onSubmit, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState({
        label: initialData?.label || '',
        fullAddress: initialData?.fullAddress || '',
        city: initialData?.city || '',
        postalCode: initialData?.postalCode || '',
        notes: initialData?.notes || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const inputClasses = "block w-full shadow-sm py-2 px-3 border border-black/10 dark:border-white/20 rounded-lg sm:text-sm transition focus:outline-none focus:ring-1 focus:ring-accent bg-surface dark:bg-neutral-800";
    const labelClasses = "block text-sm font-medium text-text-muted mb-1.5";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="label" className={labelClasses}>Label Alamat</label>
                <input type="text" name="label" id="label" value={formData.label} onChange={handleChange} required className={inputClasses} placeholder="cth: Rumah, Kantor" />
            </div>
            <div>
                <label htmlFor="fullAddress" className={labelClasses}>Alamat Lengkap</label>
                <textarea name="fullAddress" id="fullAddress" value={formData.fullAddress} onChange={handleChange} required rows={3} className={inputClasses} placeholder="cth: Jl. Merdeka No. 45, Kebayoran Baru"></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="city" className={labelClasses}>Kota</label>
                    <input type="text" name="city" id="city" value={formData.city} onChange={handleChange} required className={inputClasses} placeholder="cth: Jakarta Selatan" />
                </div>
                <div>
                    <label htmlFor="postalCode" className={labelClasses}>Kode Pos</label>
                    <input type="text" name="postalCode" id="postalCode" value={formData.postalCode} onChange={handleChange} required className={inputClasses} placeholder="cth: 12345" />
                </div>
            </div>
            <div>
                <label htmlFor="notes" className={labelClasses}>Catatan (Opsional)</label>
                <input type="text" name="notes" id="notes" value={formData.notes} onChange={handleChange} placeholder="cth: Pagar warna hitam" className={inputClasses} />
            </div>
            <div className="pt-4 flex justify-end gap-4">
                <button type="button" onClick={onCancel} disabled={isSubmitting} className="px-5 py-2 rounded-lg text-sm font-semibold text-text-muted hover:bg-black/5 dark:hover:bg-white/10">Batal</button>
                <button type="submit" disabled={isSubmitting} className="bg-accent text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50">
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Alamat'}
                </button>
            </div>
        </form>
    );
};


const CustomerAddressesPage: React.FC = () => {
    const { user, updateUserData } = useAuth();
    const { addToast } = useToast();

    const [addresses, setAddresses] = useState<Address[]>(user?.savedAddresses || []);
    const [modalState, setModalState] = useState<{ isOpen: boolean; mode: 'add' | 'edit'; data: Address | null }>({ isOpen: false, mode: 'add', data: null });
    const [confirmDeleteState, setConfirmDeleteState] = useState<{ isOpen: boolean; data: Address | null }>({ isOpen: false, data: null });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setAddresses(user?.savedAddresses || []);
    }, [user?.savedAddresses]);

    const handleFormSubmit = async (formData: Omit<Address, 'id'>) => {
        if (!user) return;
        setIsSubmitting(true);
        try {
            if (modalState.mode === 'add') {
                const newAddress = await addAddress(user.id, formData);
                updateUserData({ ...user, savedAddresses: [...addresses, newAddress] });
                addToast('Alamat baru berhasil ditambahkan.', 'success');
            } else if (modalState.mode === 'edit' && modalState.data) {
                await updateAddress(user.id, modalState.data.id, formData);
                const updatedAddresses = addresses.map(a => a.id === modalState.data!.id ? { ...modalState.data!, ...formData } : a);
                updateUserData({ ...user, savedAddresses: updatedAddresses });
                addToast('Alamat berhasil diperbarui.', 'success');
            }
            setModalState({ isOpen: false, mode: 'add', data: null });
        } catch (error) {
            addToast('Gagal menyimpan alamat.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!user || !confirmDeleteState.data) return;
        setIsSubmitting(true);
        try {
            await deleteAddress(user.id, confirmDeleteState.data.id);
            const updatedAddresses = addresses.filter(a => a.id !== confirmDeleteState.data!.id);
            updateUserData({ ...user, savedAddresses: updatedAddresses });
            addToast('Alamat berhasil dihapus.', 'success');
            setConfirmDeleteState({ isOpen: false, data: null });
        } catch (error) {
            addToast('Gagal menghapus alamat.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="bg-surface dark:bg-neutral-800/50 rounded-2xl shadow-card border border-black/10 dark:border-white/10">
                <div className="p-6 border-b border-black/10 dark:border-white/10 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-medium tracking-tight text-text-primary">Alamat</h3>
                        <p className="text-sm text-text-muted">Kelola alamat tersimpan Anda.</p>
                    </div>
                    <button onClick={() => setModalState({ isOpen: true, mode: 'add', data: null })} className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold border border-accent text-accent hover:bg-accent/10 transition-colors">
                        <Plus size={16} /> Tambah
                    </button>
                </div>
                <div className="p-6">
                    {addresses.length > 0 ? (
                        <ul className="divide-y divide-black/10 dark:divide-white/10 -my-6">
                            {addresses.map(addr => (
                                <AddressListItem
                                    key={addr.id}
                                    address={addr}
                                    onEdit={() => setModalState({ isOpen: true, mode: 'edit', data: addr })}
                                    onDelete={() => setConfirmDeleteState({ isOpen: true, data: addr })}
                                />
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-8">
                            <Home className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
                            <h3 className="mt-2 font-medium text-text-primary">Tidak ada alamat tersimpan</h3>
                            <p className="mt-1 text-sm text-text-muted">Tambah alamat untuk checkout yang lebih cepat.</p>
                        </div>
                    )}
                </div>
            </div>

            <Modal isOpen={modalState.isOpen} onClose={() => setModalState({ isOpen: false, mode: 'add', data: null })} title={modalState.mode === 'add' ? 'Tambah Alamat Baru' : 'Edit Alamat'}>
                <AddressForm
                    initialData={modalState.data}
                    onSubmit={handleFormSubmit}
                    onCancel={() => setModalState({ isOpen: false, mode: 'add', data: null })}
                    isSubmitting={isSubmitting}
                />
            </Modal>

            <Modal isOpen={confirmDeleteState.isOpen} onClose={() => setConfirmDeleteState({ isOpen: false, data: null })} title="Konfirmasi Hapus">
                <p className="text-text-muted">Anda yakin ingin menghapus alamat "{confirmDeleteState.data?.label}"?</p>
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

export default CustomerAddressesPage;
