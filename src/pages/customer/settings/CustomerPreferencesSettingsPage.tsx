
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { updateUser } from '../../../data/mockDB';
import ToggleSwitch from '../../../components/ToggleSwitch';

const PreferenceField: React.FC<{ label: string; children: React.ReactNode; }> = ({ label, children }) => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-center py-4 first:pt-0 last:pb-0">
        <dt className="text-sm font-medium text-text-muted col-span-1">{label}</dt>
        <dd className="col-span-2 flex items-center justify-end">{children}</dd>
    </div>
);

const CustomerPreferencesSettingsPage: React.FC = () => {
    const { user, updateUserData } = useAuth();
    const { addToast } = useToast();

    const defaultPrefs = { emailNotifications: { orderStatus: true, reservationReminders: true }, promoNewsletters: false };

    const [preferences, setPreferences] = useState(user?.preferences || defaultPrefs);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user?.preferences) setPreferences(user.preferences);
    }, [user]);

    const handlePreferenceChange = async (category: 'emailNotifications' | 'promoNewsletters', key: string, value: boolean) => {
        if (!user || isSaving) return;

        setIsSaving(true);
        let updatedPrefs;
        if (category === 'emailNotifications') {
            updatedPrefs = { ...preferences, emailNotifications: { ...preferences.emailNotifications, [key]: value } };
        } else {
            updatedPrefs = { ...preferences, [key]: value };
        }

        setPreferences(updatedPrefs);

        try {
            const updatedUser = await updateUser(user.id, { preferences: updatedPrefs });
            if (updatedUser) {
                updateUserData(updatedUser);
                addToast('Preferensi berhasil disimpan.', 'success');
            } else {
                throw new Error("User not found");
            }
        } catch (error) {
            addToast('Gagal menyimpan preferensi.', 'error');
            setPreferences(user.preferences || defaultPrefs);
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) return null;

    return (
        <div className="space-y-8">
            {/* Notifications Card */}
            <div className="bg-surface dark:bg-neutral-800/50 rounded-2xl shadow-card border border-black/10 dark:border-white/10">
                <div className="p-6 border-b border-black/10 dark:border-white/10">
                    <h3 className="text-lg font-medium tracking-tight text-text-primary">Notifikasi</h3>
                    <p className="text-sm text-text-muted">Pilih notifikasi yang ingin Anda terima.</p>
                </div>
                <div className="p-6">
                    <dl className="divide-y divide-black/10 dark:divide-white/10">
                        <PreferenceField label="Pembaruan Status Pesanan">
                            <ToggleSwitch id="orderStatus" checked={preferences.emailNotifications.orderStatus} onChange={(checked) => handlePreferenceChange('emailNotifications', 'orderStatus', checked)} disabled={isSaving} />
                        </PreferenceField>
                        <PreferenceField label="Pengingat Reservasi">
                            <ToggleSwitch id="reservationReminders" checked={preferences.emailNotifications.reservationReminders} onChange={(checked) => handlePreferenceChange('emailNotifications', 'reservationReminders', checked)} disabled={isSaving} />
                        </PreferenceField>
                        <PreferenceField label="Newsletter Promosi">
                            <ToggleSwitch id="promoNewsletters" checked={preferences.promoNewsletters} onChange={(checked) => handlePreferenceChange('promoNewsletters', 'promoNewsletters', checked)} disabled={isSaving} />
                        </PreferenceField>
                    </dl>
                </div>
            </div>
        </div>
    );
};

export default CustomerPreferencesSettingsPage;