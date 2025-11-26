import React, { createContext, useContext, ReactNode } from 'react';
import { useCustomerLayout } from './CustomerLayoutContext';
import { useCart } from '../hooks/useCart';
import { useChat } from '../hooks/useChat';
import { useNotifications } from '../hooks/useNotifications';

interface ToastPositionContextType {
    getToastOffset: () => { left: string; transform: string };
}

const ToastPositionContext = createContext<ToastPositionContextType | undefined>(undefined);

export const ToastPositionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { isSidebarCollapsed } = useCustomerLayout();
    const { isCartOpen } = useCart();
    const { isChatOpen } = useChat();
    const { isNotificationPanelOpen } = useNotifications();

    const getToastOffset = () => {
        const isRightPanelOpen = isCartOpen || isChatOpen || isNotificationPanelOpen;

        // Layout structure:
        // [24px padding] [sidebar] [24px gap] [main panel] [24px gap] [right panel?] [24px padding]
        // Container max-width: 1440px

        const containerPadding = 24; // p-6 = 24px
        const gap = 24; // gap-6 = 24px

        let leftSidebarWidth = 0;
        let rightPanelWidth = 0;

        // Left sidebar width
        if (!isSidebarCollapsed) {
            leftSidebarWidth = 256; // w-64 = 16rem = 256px
        } else {
            leftSidebarWidth = 80; // w-20 = 5rem = 80px
        }

        // Right panel width
        if (isRightPanelOpen) {
            rightPanelWidth = 288; // w-[18rem] = 288px
        }

        // Calculate the left edge of the main panel from the left edge of the container
        const mainPanelLeftEdge = containerPadding + leftSidebarWidth + gap;

        // Calculate the right edge of the main panel from the left edge of the container
        // If right panel is open: containerPadding + leftSidebar + gap + mainPanel + gap + rightPanel + containerPadding = 1440
        // mainPanel = 1440 - (containerPadding * 2) - leftSidebar - (gap * 2) - rightPanel
        const totalFixedWidth = (containerPadding * 2) + leftSidebarWidth + (gap * 2) + rightPanelWidth;
        const mainPanelWidth = 1440 - totalFixedWidth;

        // Center of main panel from left edge of container
        const mainPanelCenter = mainPanelLeftEdge + (mainPanelWidth / 2);

        // Convert to percentage and offset from screen center
        // Screen center is at 50% of 1440px = 720px
        const offsetFromCenter = mainPanelCenter - 720;

        return {
            left: '50%',
            transform: `translateX(calc(-50% + ${offsetFromCenter}px))`
        };
    };

    return (
        <ToastPositionContext.Provider value={{ getToastOffset }}>
            {children}
        </ToastPositionContext.Provider>
    );
};

export const useToastPosition = () => {
    const context = useContext(ToastPositionContext);

    // Return fallback centered position if not within provider
    if (!context) {
        return {
            getToastOffset: () => ({
                left: '50%',
                transform: 'translateX(-50%)'
            })
        };
    }

    return context;
};
