import React, { createContext, useState, ReactNode, useContext } from 'react';
import { Branch, mockBranches } from '../data/mockDB';
import { calculateDistance } from '../utils/geo';

interface LocationContextType {
    selectedBranch: Branch | null;
    setSelectedBranch: (branch: Branch | null) => void;
    isLocationModalOpen: boolean;
    openLocationModal: () => void;
    closeLocationModal: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

interface LocationProviderProps {
    children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
    const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

    const openLocationModal = () => setIsLocationModalOpen(true);
    const closeLocationModal = () => setIsLocationModalOpen(false);

    React.useEffect(() => {
        if (!selectedBranch) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        let minDistance = Infinity;
                        let nearestBranch = mockBranches[0];

                        mockBranches.forEach((branch) => {
                            const distance = calculateDistance(
                                latitude,
                                longitude,
                                branch.coordinates.lat,
                                branch.coordinates.lng
                            );
                            if (distance < minDistance) {
                                minDistance = distance;
                                nearestBranch = branch;
                            }
                        });
                        setSelectedBranch(nearestBranch);
                    },
                    (error) => {
                        console.error("Error getting location:", error);
                        // Fallback to the first branch if location access is denied or fails
                        setSelectedBranch(mockBranches[0]);
                    }
                );
            } else {
                console.error("Geolocation is not supported by this browser.");
                // Fallback to the first branch if geolocation is not supported
                setSelectedBranch(mockBranches[0]);
            }
        }
    }, [selectedBranch]);

    return (
        <LocationContext.Provider
            value={{
                selectedBranch,
                setSelectedBranch,
                isLocationModalOpen,
                openLocationModal,
                closeLocationModal,
            }}
        >
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = () => {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
};
