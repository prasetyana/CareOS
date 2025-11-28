/**
 * Environment Configuration
 * Loads and validates environment variables with type safety
 */

interface EnvironmentConfig {
    supabase: {
        url: string;
        anonKey: string;
    };
    gemini: {
        apiKey: string;
    };
    app: {
        env: 'development' | 'staging' | 'production';
        isDevelopment: boolean;
        isProduction: boolean;
    };
}

/**
 * Validates that required environment variables are present
 */
function validateEnv(): void {
    const required = [
        'VITE_SUPABASE_URL',
        'VITE_SUPABASE_ANON_KEY',
        'VITE_GEMINI_API_KEY',
    ];

    const missing = required.filter(key => !import.meta.env[key]);

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(', ')}\n` +
            'Please check your .env file.'
        );
    }
}

/**
 * Load and export environment configuration
 */
function loadEnv(): EnvironmentConfig {
    validateEnv();

    const mode = import.meta.env.MODE as 'development' | 'staging' | 'production';

    return {
        supabase: {
            url: import.meta.env.VITE_SUPABASE_URL,
            anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        gemini: {
            apiKey: import.meta.env.VITE_GEMINI_API_KEY,
        },
        app: {
            env: mode,
            isDevelopment: mode === 'development',
            isProduction: mode === 'production',
        },
    };
}

export const env = loadEnv();
