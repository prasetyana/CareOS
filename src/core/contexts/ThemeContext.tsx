import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { TenantContext } from '../tenant/TenantContext';
import { updateTenantLayout } from '../services/tenantService';

type Theme = 'Garnet' | 'Sapphire' | 'Emerald' | 'Amethyst';
type Mode = 'light' | 'dark';

interface ThemeConfig {
  rgb: string;
}

const themes: Record<Theme, ThemeConfig> = {
  Garnet: { rgb: '173 52 62' },   // #AD343E
  Sapphire: { rgb: '0 113 227' },  // #0071E3 (Apple Blue)
  Emerald: { rgb: '48 209 88' },   // #30D158
  Amethyst: { rgb: '175 82 222' },  // #AF52DE
};

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  mode: Mode;
  toggleMode: () => void;
  layout: string;
  setLayout: (layout: string) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const savedTheme = window.localStorage.getItem('app-theme') as Theme;
      return savedTheme && themes[savedTheme] ? savedTheme : 'Sapphire';
    } catch (error) {
      return 'Sapphire';
    }
  });

  const [mode, setMode] = useState<Mode>(() => {
    try {
      const savedMode = window.localStorage.getItem('app-mode') as Mode;
      return savedMode === 'dark' ? 'dark' : 'light';
    } catch (error) {
      return 'light';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-brand-primary-rgb', themes[theme].rgb);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      window.localStorage.setItem('app-mode', mode);
    } catch (error) {
      console.error("Failed to save mode to localStorage", error);
    }
  }, [mode]);

  const setTheme = useCallback((newTheme: Theme) => {
    try {
      window.localStorage.setItem('app-theme', newTheme);
    } catch (error) {
      console.error("Failed to save theme to localStorage", error);
    }
    setThemeState(newTheme);
  }, []);

  const toggleMode = useCallback(() => {
    setMode(prevMode => (prevMode === 'light' ? 'dark' : 'light'));
  }, []);

  // Import tenant context and service
  // Import tenant context safely
  const tenantContext = React.useContext(TenantContext);
  const tenant = tenantContext?.tenant;

  const [layout, setLayoutState] = useState<string>(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const previewLayout = searchParams.get('layout');
      if (previewLayout) return previewLayout;

      // Prioritize tenant layout if available
      if (tenant?.layout) return tenant.layout;

      return window.localStorage.getItem('app-layout') || 'default';
    } catch (error) {
      return 'default';
    }
  });

  // Update layout when tenant data loads
  useEffect(() => {
    if (tenant?.layout) {
      const searchParams = new URLSearchParams(window.location.search);
      const previewLayout = searchParams.get('layout');
      if (!previewLayout) {
        setLayoutState(tenant.layout);
      }
    }
  }, [tenant]);

  const setLayout = useCallback(async (newLayout: string) => {
    try {
      window.localStorage.setItem('app-layout', newLayout);

      // Update tenant layout in Supabase if tenant exists
      if (tenant?.id) {
        await updateTenantLayout(tenant.id, newLayout);
      }
    } catch (error) {
      console.error("Failed to save layout", error);
    }
    setLayoutState(newLayout);
  }, [tenant]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, mode, toggleMode, layout, setLayout }}>
      {children}
    </ThemeContext.Provider>
  );
};
