import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Pencil, Mail, Shield, Trash2, X, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface StaffMember {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'cs';
    status: 'active' | 'inactive';
    avatar?: string;
}

interface NewStaffForm {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'cs';
}

const AdminStaffPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);
    const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState<NewStaffForm>({
        name: '',
        email: '',
        password: '',
        role: 'cs'
    });

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .in('role', ['admin', 'cs']); // Only fetch admin and cs roles

            if (error) throw error;

            if (data) {
                const mappedStaff: StaffMember[] = data.map(profile => ({
                    id: profile.id,
                    name: profile.full_name || 'Unnamed',
                    email: profile.email || 'No Email',
                    role: profile.role as 'admin' | 'cs',
                    status: (profile.status as 'active' | 'inactive') || 'active',
                    avatar: undefined
                }));
                setStaff(mappedStaff);
            }
        } catch (error) {
            console.error('Error fetching staff:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin':
                return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
            case 'cs':
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'admin':
                return 'Admin';
            case 'cs':
                return 'Customer Service';
            default:
                return role;
        }
    };

    const filteredStaff = staff.filter(member =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDeleteClick = (member: StaffMember) => {
        setStaffToDelete(member);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (staffToDelete) {
            try {
                const { error } = await supabase
                    .from('profiles')
                    .update({ status: 'inactive' })
                    .eq('id', staffToDelete.id);

                if (error) throw error;

                // Update local state
                setStaff(staff.filter(s => s.id !== staffToDelete.id));
                setIsDeleteModalOpen(false);
                setStaffToDelete(null);
            } catch (error) {
                console.error('Error deleting staff:', error);
                alert('Gagal menghapus staff');
            }
        }
    };

    const handleEditClick = (member: StaffMember) => {
        setEditingStaff(member);
        setFormData({
            name: member.name,
            email: member.email,
            password: '', // Password is optional when editing
            role: member.role
        });
        setIsModalOpen(true);
    };

    const handleAddClick = () => {
        setEditingStaff(null);
        setFormData({ name: '', email: '', password: '', role: 'cs' });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingStaff) {
                // Update existing staff
                const { error } = await supabase
                    .from('profiles')
                    .update({
                        full_name: formData.name,
                        role: formData.role,
                        // email is usually not editable directly in profiles if it's linked to auth, 
                        // but we'll update it here for display if our schema allows
                        email: formData.email
                    })
                    .eq('id', editingStaff.id);

                if (error) throw error;

                // Update local state
                setStaff(staff.map(s => s.id === editingStaff.id ? {
                    ...s,
                    name: formData.name,
                    email: formData.email,
                    role: formData.role
                } : s));
            } else {
                // Create new staff member
                // NOTE: Ideally this should create a Supabase Auth user. 
                // For now, we will insert into profiles directly to show it in the list.
                // In a real app, you'd use an Edge Function to create the auth user + profile.

                // We'll generate a random ID for now since we can't create Auth users from client easily without a function
                const tempId = crypto.randomUUID();

                const { error } = await supabase
                    .from('profiles')
                    .insert([{
                        id: tempId, // This usually comes from Auth
                        full_name: formData.name,
                        email: formData.email,
                        role: formData.role,
                        status: 'active',
                        // tenant_id should be handled by RLS or context, but for demo we might need to be careful
                        // Assuming RLS handles tenant_id via auth.uid() or we need to pass it if we are admin
                    }]);

                // Since we can't easily insert into profiles without a matching auth.users row due to foreign key constraint,
                // we might hit an error here if we strictly enforce FK. 
                // However, for this "Add" flow to work fully, we need the backend function.
                // Let's try to see if we can just update the local state for demo if the insert fails due to FK.

                if (error) {
                    console.error("Supabase Insert Error (Expected if no Auth User):", error);
                    alert("Gagal menambahkan staff ke database (Memerlukan integrasi Auth Backend). Menambahkan ke tampilan lokal saja.");

                    // Fallback to local state for demo
                    const newStaff: StaffMember = {
                        id: String(staff.length + 1),
                        name: formData.name,
                        email: formData.email,
                        role: formData.role,
                        status: 'active'
                    };
                    setStaff([...staff, newStaff]);
                } else {
                    // If insert succeeded (e.g. if FK constraint is not enforced or we have a trigger)
                    const newStaff: StaffMember = {
                        id: tempId,
                        name: formData.name,
                        email: formData.email,
                        role: formData.role,
                        status: 'active'
                    };
                    setStaff([...staff, newStaff]);
                }
            }

            // Reset form and close modal
            setFormData({ name: '', email: '', password: '', role: 'cs' });
            setEditingStaff(null);
            setShowPassword(false);
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error saving staff:', error);
            alert('Terjadi kesalahan saat menyimpan data staff');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Staff</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Kelola akun staff dan hak akses</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari staff..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                        />
                    </div>
                    <button
                        onClick={handleAddClick}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors shadow-sm"
                    >
                        <UserPlus className="w-4 h-4" />
                        Tambah Staff
                    </button>
                </div>
            </div>

            {/* Staff List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Staff
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredStaff.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        {searchQuery ? 'Tidak ada staff yang ditemukan' : 'Belum ada staff'}
                                    </td>
                                </tr>
                            ) : (
                                filteredStaff.map((member) => (
                                    <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-semibold">
                                                    {member.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {member.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                <Mail className="w-4 h-4" />
                                                {member.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                                                <Shield className="w-3 h-3" />
                                                {getRoleLabel(member.role)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${member.status === 'active'
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                                                }`}>
                                                {member.status === 'active' ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEditClick(member)}
                                                    className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(member)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Staff Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {editingStaff ? 'Edit Staff' : 'Tambah Staff Baru'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Name Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Nama Lengkap
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                    placeholder="Masukkan nama lengkap"
                                />
                            </div>

                            {/* Email Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                    placeholder="email@example.com"
                                />
                            </div>

                            {/* Password Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required={!editingStaff}
                                        minLength={6}
                                        className="w-full px-4 py-2.5 pr-12 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                        placeholder={editingStaff ? "Kosongkan jika tidak ingin mengubah" : "Minimal 6 karakter"}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Role Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Role
                                </label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                >
                                    <option value="cs">Customer Service</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium shadow-sm"
                                >
                                    {editingStaff ? 'Simpan Perubahan' : 'Tambah Staff'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && staffToDelete && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Hapus Staff?</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            Apakah Anda yakin ingin menghapus staff <span className="font-medium text-gray-900 dark:text-white">{staffToDelete.name}</span>? Tindakan ini tidak dapat dibatalkan.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium shadow-sm"
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminStaffPage;
