/**
 * Feature Flags
 * Control feature rollout and A/B testing
 */

import { env } from './env';

export interface FeatureFlags {
    // Core features
    enableLiveChat: boolean;
    enableReservations: boolean;
    enableLoyaltyProgram: boolean;
    enableOnlineOrdering: boolean;

    // Experimental features
    enableAIRecommendations: boolean;
    enableVoiceOrdering: boolean;
    enableTableQROrdering: boolean;
    enableMultiLanguage: boolean;

    // Admin features
    enableAdvancedAnalytics: boolean;
    enableInventoryManagement: boolean;
    enableStaffScheduling: boolean;

    // Payment features
    enableQRISPayment: boolean;
    enableCreditCardPayment: boolean;
    enableEWalletPayment: boolean;
}

/**
 * Default feature flags based on environment
 */
const getDefaultFeatures = (): FeatureFlags => {
    const isDev = env.app.isDevelopment;

    return {
        // Core features - enabled in all environments
        enableLiveChat: true,
        enableReservations: true,
        enableLoyaltyProgram: true,
        enableOnlineOrdering: true,

        // Experimental features - only in development
        enableAIRecommendations: isDev,
        enableVoiceOrdering: false,
        enableTableQROrdering: isDev,
        enableMultiLanguage: false,

        // Admin features
        enableAdvancedAnalytics: true,
        enableInventoryManagement: isDev,
        enableStaffScheduling: isDev,

        // Payment features
        enableQRISPayment: true,
        enableCreditCardPayment: isDev,
        enableEWalletPayment: true,
    };
};

/**
 * Feature flags instance
 * Can be overridden per tenant
 */
export const features = getDefaultFeatures();

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
    return features[feature];
}

/**
 * Enable a feature (useful for testing)
 */
export function enableFeature(feature: keyof FeatureFlags): void {
    features[feature] = true;
}

/**
 * Disable a feature (useful for testing)
 */
export function disableFeature(feature: keyof FeatureFlags): void {
    features[feature] = false;
}
