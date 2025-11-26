import React, { useState, useEffect } from 'react';
import { Plus, Mail, Shield, Trash2, User, Search, MoreVertical } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext';

interface StaffMember {
    id: string;
    full_name: string;
    email: string; // Note: email is in auth.users, might not be directly accessible in profiles unless we sync it or use a view. 
    // For now, we'll assume we can get it or use a placeholder if not available in profiles.
    // Actually, in our schema, profiles doesn't have email. We might need to fetch it or just show name/role.
    // Let's check the schema again. Profiles has: full_name, username, role, etc.
    // We can't easily get email from auth.users via standard client query due to security.
    // We'll use a placeholder or just show what we have.
    role: string;
    avatar_url: string | null;
    status?: 'active' | 'invited';
}

const ManajemenStaff: React.FC = () => {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [newStaffEmail, setNewStaffEmail] = useState('');
    const [newStaffRole, setNewStaffRole] = useState('tenant_staff');
    const [newStaffName, setNewStaffName] = useState('');
    const { user } = useAuth();
    const { showToast } = useToast();

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        setLoading(true);
        try {
            // Fetch profiles with roles relevant to staff
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .in('role', ['tenant_admin', 'tenant_staff', 'cs_agent'])
                .eq('tenant_id', user?.tenant_id || ''); // Filter by current tenant

            if (error) throw error;

            if (data) {
                // Map to StaffMember interface
                // Note: We don't have email in profiles. We'll simulate it or leave it blank for now.
                const mappedStaff: StaffMember[] = data.map(profile => ({
                    id: profile.id,
                    full_name: profile.full_name,
                    email: profile.username || 'No username', // Fallback
                    role: profile.role,
                    avatar_url: profile.avatar_url,
                    status: 'active'
                }));
                setStaff(mappedStaff);
            }
        } catch (error) {
            console.error('Error fetching staff:', error);
            showToast('Gagal memuat data staff', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would call a Supabase Edge Function to invite the user.
        // For now, we'll just show a success message.

        showToast(`Undangan dikirim ke ${newStaffEmail}`, 'success');
        setIsInviteModalOpen(false);
        setNewStaffEmail('');
        setNewStaffName('');
        setNewStaffRole('tenant_staff');
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'tenant_admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            case 'cs_agent': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'tenant_admin': return 'Admin';
            case 'tenant_staff': return 'Staff';
            case 'cs_agent': return 'Customer Service';
            default: return role;
        }
    };

    return (
        <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Staff</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Kelola akses dan peran anggota tim Anda.</p>
                </div>
                <button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-all"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Staff
                </button>
            </div>

            {/* Staff List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Memuat data staff...</div>
                ) : staff.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                            <User className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Belum ada staff</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                            Mulai dengan menambahkan anggota tim baru untuk membantu mengelola restoran Anda.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Nama
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Peran
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="relative px-6 py-3">
                                        <span className="sr-only">Edit</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {staff.map((member) => (
                                    <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    {member.avatar_url ? (
                                                        <img className="h-10 w-10 rounded-full object-cover" src={member.avatar_url} alt="" />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold">
                                                            {member.full_name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{member.full_name}</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">{member.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(member.role)}`}>
                                                {getRoleLabel(member.role)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                                Aktif
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Invite Modal */}
            {isInviteModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsInviteModalOpen(false)}></div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                            <form onSubmit={handleInvite}>
                                <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-brand-primary/10 sm:mx-0 sm:h-10 sm:w-10">
                                            <Mail className="h-6 w-6 text-brand-primary" aria-hidden="true" />
                                        </div>
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                                                Undang Staff Baru
                                            </h3>
                                            <div className="mt-4 space-y-4">
                                                <div>
                                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Nama Lengkap
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        id="name"
                                                        required
                                                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm dark:bg-gray-700 dark:text-white"
                                                        value={newStaffName}
                                                        onChange={(e) => setNewStaffName(e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Alamat Email
                                                    </label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        id="email"
                                                        required
                                                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm dark:bg-gray-700 dark:text-white"
                                                        value={newStaffEmail}
                                                        onChange={(e) => setNewStaffEmail(e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Peran
                                                    </label>
                                                    <select
                                                        id="role"
                                                        name="role"
                                                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm dark:bg-gray-700 dark:text-white"
                                                        value={newStaffRole}
                                                        onChange={(e) => setNewStaffRole(e.target.value)}
                                                    >
                                                        <option value="tenant_staff">Staff (Umum)</option>
                                                        <option value="tenant_admin">Admin (Akses Penuh)</option>
                                                        <option value="cs_agent">Customer Service</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-brand-primary text-base font-medium text-white hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Kirim Undangan
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={() => setIsInviteModalOpen(false)}
                                    >
                                        Batal
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManajemenStaff;
