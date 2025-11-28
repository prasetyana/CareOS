import React from 'react';
import { Utensils, Calendar, Tag, Star, Gift, MessageCircle, QrCode, MapPin } from 'lucide-react';
import QuickActionButton from '../../../customer/components/dashboard/QuickActionButton';
import { useChat } from '@core/contexts/ChatContext';
import { useToast } from '@core/contexts/ToastContext';
import { useLocation } from '@core/contexts/LocationContext';
import { useTenantParam } from '@core/hooks/useTenantParam';

const QuickActions: React.FC = () => {
    const { openChat } = useChat();
    const { addToast } = useToast();
    const { openLocationModal } = useLocation();
    const { withTenant } = useTenantParam();

    return (
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3 gap-y-6">
            <QuickActionButton
                onClick={() => addToast('Fitur Scan QR akan segera hadir!', 'info')}
                icon={QrCode}
                label="Scan QR"
                color="text-neutral-800 dark:text-white"
            />
            <QuickActionButton
                onClick={openLocationModal}
                icon={MapPin}
                label="Lokasi"
                color="text-red-500"
            />
            <QuickActionButton
                to={withTenant("/account/menu")}
                icon={Utensils}
                label="Menu"
                color="text-blue-500"
            />
            <QuickActionButton
                to={withTenant("/account/reservasi/buat")}
                icon={Calendar}
                label="Reservasi"
                color="text-purple-500"
            />
            <QuickActionButton
                to={withTenant("/account/menu?category=Promo")}
                icon={Tag}
                label="Promo"
                color="text-orange-500"
            />
            <QuickActionButton
                to={withTenant("/account/poin-hadiah")}
                icon={Gift}
                label="Poin Saya"
                color="text-emerald-500"
            />
            <QuickActionButton
                to={withTenant("/account/favorit")}
                icon={Star}
                label="Favorit"
                color="text-yellow-500"
            />
            <QuickActionButton
                onClick={openChat}
                icon={MessageCircle}
                label="Live Chat"
                color="text-pink-500"
            />
        </div>
    );
};

export default QuickActions;
