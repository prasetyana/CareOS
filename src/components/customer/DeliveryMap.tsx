import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';

interface DeliveryMapProps {
    onLocationSelect: (lat: number, lng: number, distance: number) => void;
    restaurantLocation?: { lat: number; lng: number };
}

const containerStyle = {
    width: '100%',
    height: '100%',
};

// Default restaurant location (you should update this with actual restaurant coordinates)
const defaultRestaurantLocation = {
    lat: -6.2088,
    lng: 106.8456,
};

// Default center (Jakarta)
const defaultCenter = {
    lat: -6.2088,
    lng: 106.8456,
};

const DeliveryMap: React.FC<DeliveryMapProps> = ({
    onLocationSelect,
    restaurantLocation = defaultRestaurantLocation,
}) => {
    const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);

    // Replace 'YOUR_GOOGLE_MAPS_API_KEY' with your actual API key
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY',
    });

    const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
        // Haversine formula to calculate distance between two coordinates
        const R = 6371; // Radius of the Earth in kilometers
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance in kilometers
        return Math.round(distance * 10) / 10; // Round to 1 decimal place
    }, []);

    const handleMapClick = useCallback(
        (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
                const lat = e.latLng.lat();
                const lng = e.latLng.lng();
                setSelectedLocation({ lat, lng });

                // Calculate distance from restaurant
                const distance = calculateDistance(
                    restaurantLocation.lat,
                    restaurantLocation.lng,
                    lat,
                    lng
                );

                onLocationSelect(lat, lng, distance);
            }
        },
        [calculateDistance, onLocationSelect, restaurantLocation]
    );

    if (loadError) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl p-6">
                <div className="text-center max-w-md">
                    <MapPin className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                    <h3 className="font-semibold text-text-primary dark:text-gray-200 mb-2">
                        Google Maps API Key Diperlukan
                    </h3>
                    <p className="text-sm text-text-muted dark:text-gray-400 mb-4">
                        Untuk menggunakan peta interaktif, silakan tambahkan Google Maps API key ke file <code className="px-1.5 py-0.5 bg-black/10 dark:bg-white/10 rounded text-xs">.env</code>
                    </p>
                    <div className="text-left bg-white/60 dark:bg-black/30 rounded-lg p-3 text-xs space-y-1">
                        <p className="font-medium text-text-primary dark:text-gray-200">Langkah-langkah:</p>
                        <ol className="list-decimal list-inside space-y-1 text-text-muted dark:text-gray-400">
                            <li>Buka <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Google Cloud Console</a></li>
                            <li>Aktifkan "Maps JavaScript API"</li>
                            <li>Buat API Key di Credentials</li>
                            <li>Tambahkan ke file .env:<br /><code className="text-[10px] bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded">VITE_GOOGLE_MAPS_API_KEY=your_key</code></li>
                            <li>Restart server: <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded">npm run dev</code></li>
                        </ol>
                    </div>
                </div>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl">
                <div className="text-center p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-2"></div>
                    <p className="text-sm text-text-muted dark:text-gray-400">Memuat peta...</p>
                </div>
            </div>
        );
    }

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={selectedLocation || defaultCenter}
            zoom={13}
            onClick={handleMapClick}
            options={{
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
            }}
        >
            {/* Restaurant marker */}
            <Marker
                position={restaurantLocation}
                icon={{
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%23FF6B35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                    `),
                    scaledSize: new google.maps.Size(32, 32),
                }}
                title="Lokasi Restoran"
            />

            {/* Selected delivery location marker */}
            {selectedLocation && (
                <Marker
                    position={selectedLocation}
                    icon={{
                        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="%234F46E5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3" fill="white" stroke="%234F46E5"></circle>
                            </svg>
                        `),
                        scaledSize: new google.maps.Size(32, 32),
                    }}
                    title="Lokasi Pengiriman"
                />
            )}
        </GoogleMap>
    );
};

export default DeliveryMap;
