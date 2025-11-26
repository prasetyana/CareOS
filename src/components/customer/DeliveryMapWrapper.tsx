import React from 'react';
import { MapPin } from 'lucide-react';

interface DeliveryMapWrapperProps {
    onLocationSelect: (lat: number, lng: number, distance: number) => void;
    restaurantLocation?: { lat: number; lng: number };
}

const DeliveryMapWrapper: React.FC<DeliveryMapWrapperProps> = (props) => {
    // Check if Google Maps API key is available
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const hasApiKey = apiKey && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY' && apiKey.trim() !== '';

    // If no API key, show error message without loading Google Maps
    if (!hasApiKey) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl p-6">
                <div className="text-center max-w-md">
                    <MapPin className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                    <h3 className="font-semibold text-text-primary dark:text-gray-200 mb-2">
                        Google Maps API Key Diperlukan
                    </h3>
                    <p className="text-sm text-text-muted dark:text-gray-400 mb-4">
                        Untuk menggunakan peta interaktif, silakan tambahkan Google Maps API key
                    </p>
                    <div className="text-left bg-white/60 dark:bg-black/30 rounded-lg p-3 text-xs space-y-1">
                        <p className="font-medium text-text-primary dark:text-gray-200">Langkah-langkah:</p>
                        <ol className="list-decimal list-inside space-y-1 text-text-muted dark:text-gray-400">
                            <li>Buka <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Google Cloud Console</a></li>
                            <li>Aktifkan "Maps JavaScript API"</li>
                            <li>Buat API Key di Credentials</li>
                            <li>Tambahkan ke environment variables di Vercel</li>
                        </ol>
                    </div>
                </div>
            </div>
        );
    }

    // Lazy load the actual DeliveryMap component only when API key is available
    const DeliveryMap = React.lazy(() => import('./DeliveryMap'));

    return (
        <React.Suspense fallback={
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl">
                <div className="text-center p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-2"></div>
                    <p className="text-sm text-text-muted dark:text-gray-400">Memuat peta...</p>
                </div>
            </div>
        }>
            <DeliveryMap {...props} />
        </React.Suspense>
    );
};

export default DeliveryMapWrapper;
