
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Ticket, X, Loader2 } from 'lucide-react';
import { PromoCode, fetchPromoCodes, addPromoCode, deletePromoCode } from '../../data/mockDB';
import { useToast } from '../../contexts/ToastContext';

const KodeDiskon: React.FC = () => {
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addToast } = useToast();

    // Form State
    const [formData, setFormData] = useState<Partial<PromoCode>>({
        code: '',
        discountType: 'percentage',
        discountValue: 0,
        minOrderAmount: 0,
        maxDiscountAmount: 0,
        description: ''
    });

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [codeToDelete, setCodeToDelete] = useState<string | null>(null);

    useEffect(() => {
        loadPromoCodes();
    }, []);

    const loadPromoCodes = async () => {
        setIsLoading(true);
        try {
            const data = await fetchPromoCodes();
            setPromoCodes(data);
        } catch (error) {
            addToast('Gagal memuat kode diskon', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const confirmDelete = (code: string) => {
        setCodeToDelete(code);
        setDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!codeToDelete) return;

        try {
            const success = await deletePromoCode(codeToDelete);
            if (success) {
                addToast('Kode diskon berhasil dihapus', 'success');
                // Add a small delay to ensure localStorage is updated before reloading
                setTimeout(() => {
                    loadPromoCodes();
                }, 600);
            } else {
                addToast('Gagal menghapus kode diskon', 'error');
            }
        } catch (error) {
            addToast('Terjadi kesalahan saat menghapus', 'error');
        } finally {
            setDeleteModalOpen(false);
            setCodeToDelete(null);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'code' ? value.toUpperCase() :
                (name === 'discountType' || name === 'description') ? value : Number(value)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.code || !formData.discountValue || !formData.description) {
            addToast('Mohon lengkapi semua field wajib', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            // Basic validation
            if (promoCodes.some(p => p.code === formData.code)) {
                addToast('Kode diskon sudah ada', 'error');
                setIsSubmitting(false);
                return;
            }

            const newPromo: PromoCode = {
                code: formData.code,
                discountType: formData.discountType as 'percentage' | 'fixed',
                discountValue: Number(formData.discountValue),
                minOrderAmount: Number(formData.minOrderAmount) || 0,
                maxDiscountAmount: Number(formData.maxDiscountAmount) || undefined,
                description: formData.description
            };

            await addPromoCode(newPromo);

            addToast('Kode diskon berhasil dibuat', 'success');
            setIsModalOpen(false);
            setFormData({
                code: '',
                discountType: 'percentage',
                discountValue: 0,
                minOrderAmount: 0,
                maxDiscountAmount: 0,
                description: ''
            });
            loadPromoCodes();
        } catch (error) {
            addToast('Gagal membuat kode diskon', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold font-sans text-brand-dark">Kode Diskon</h2>
                    <p className="text-brand-secondary mt-1">Kelola kode promo dan voucher diskon untuk pelanggan.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Buat Kode Baru
                </button>
            </div>

            {/* List Promo Codes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center text-gray-500">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                        Memuat data...
                    </div>
                ) : promoCodes.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <Ticket className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">Belum ada kode diskon</p>
                        <p className="text-sm mt-1">Buat kode diskon pertama Anda untuk menarik pelanggan.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kode</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipe</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nilai</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Min. Order</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Deskripsi</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {promoCodes.map((promo) => (
                                    <tr key={promo.code} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono font-bold text-brand-primary bg-brand-primary/10 px-2 py-1 rounded">
                                                {promo.code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                                            {promo.discountType === 'percentage' ? 'Persentase' :
                                                promo.discountType === 'fixed' ? 'Nominal Tetap' :
                                                    promo.discountType === 'free_delivery' ? 'Gratis Ongkir' : 'Potongan Ongkir'}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {promo.discountType === 'percentage' ? `${promo.discountValue}%` :
                                                promo.discountType === 'free_delivery' ? '-' :
                                                    `Rp ${promo.discountValue.toLocaleString('id-ID')}`}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            Rp {promo.minOrderAmount?.toLocaleString('id-ID') || '0'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                            {promo.description}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => confirmDelete(promo.code)}
                                                className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                                                title="Hapus"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">Buat Kode Diskon Baru</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kode Promo</label>
                                <input
                                    type="text"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent uppercase font-mono"
                                    placeholder="CONTOH: HEMAT10"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Diskon</label>
                                    <select
                                        name="discountType"
                                        value={formData.discountType}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                                    >
                                        <option value="percentage">Persentase (%)</option>
                                        <option value="fixed">Nominal (Rp)</option>
                                        <option value="free_delivery">Gratis Ongkir</option>
                                        <option value="delivery_discount">Potongan Ongkir</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nilai Diskon</label>
                                    <input
                                        type="number"
                                        name="discountValue"
                                        value={formData.discountValue}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
                                        min="0"
                                        required={formData.discountType !== 'free_delivery'}
                                        disabled={formData.discountType === 'free_delivery'}
                                        placeholder={formData.discountType === 'free_delivery' ? '-' : '0'}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Min. Order (Rp)</label>
                                    <input
                                        type="number"
                                        name="minOrderAmount"
                                        value={formData.minOrderAmount}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Max. Potongan (Rp)</label>
                                    <input
                                        type="number"
                                        name="maxDiscountAmount"
                                        value={formData.maxDiscountAmount}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                                        min="0"
                                        placeholder="Opsional"
                                        disabled={formData.discountType === 'free_delivery'}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                                    rows={3}
                                    placeholder="Jelaskan syarat dan ketentuan singkat..."
                                    required
                                />
                            </div>

                            <div className="pt-4 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        'Simpan Kode'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Kode Diskon?</h3>
                            <p className="text-gray-600 mb-6">
                                Apakah Anda yakin ingin menghapus kode <span className="font-mono font-bold text-gray-900">{codeToDelete}</span>? Tindakan ini tidak dapat dibatalkan.
                            </p>
                            <div className="flex space-x-3 justify-center">
                                <button
                                    onClick={() => setDeleteModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KodeDiskon;
