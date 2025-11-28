
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { HomepageConfig, Section, HeaderConfig, FooterConfig } from '../types/homepage';
import { getHomepageConfig, updateHomepageConfig } from '../data/homepageContent';

interface HomepageContextType {
  config: HomepageConfig | null;
  loading: boolean;
  updateSection: (sectionId: string, newProps: Partial<Section['props']>) => Promise<void>;
  updateHeader: (newHeaderConfig: Partial<HeaderConfig>) => Promise<void>;
  updateFooter: (newFooterConfig: Partial<FooterConfig>) => Promise<void>;
  updateFullConfig: (newConfig: HomepageConfig) => Promise<void>;
  setConfig: React.Dispatch<React.SetStateAction<HomepageConfig | null>>;
}

export const HomepageContext = createContext<HomepageContextType | undefined>(undefined);

interface HomepageProviderProps {
  children: ReactNode;
}

export const HomepageProvider: React.FC<HomepageProviderProps> = ({ children }) => {
  const [config, setConfig] = useState<HomepageConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    const data = await getHomepageConfig();
    setConfig(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const updateSection = useCallback(async (sectionId: string, newProps: Partial<Section['props']>) => {
    if (!config) return;

    const originalConfig = JSON.parse(JSON.stringify(config));

    const newSections = config.sections.map(section => {
      if (section.id === sectionId) {
        const updatedSection = { ...section, props: { ...section.props, ...newProps } };
        return updatedSection;
      }
      return section;
    });

    const newConfig = { ...config, sections: newSections as Section[] };
    setConfig(newConfig); // Optimistic update

    try {
      await updateHomepageConfig(newConfig);
    } catch (error) {
      console.error("Failed to update homepage config", error);
      setConfig(originalConfig);
      throw error;
    }
  }, [config]);

  const updateHeader = useCallback(async (newHeaderConfig: Partial<HeaderConfig>) => {
    if (!config) return;

    const originalConfig = JSON.parse(JSON.stringify(config));
    const newConfig = { ...config, header: { ...config.header, ...newHeaderConfig } };
    setConfig(newConfig); // Optimistic update

    try {
      await updateHomepageConfig(newConfig);
    } catch (error) {
      console.error("Failed to update header config", error);
      setConfig(originalConfig);
      throw error;
    }
  }, [config]);

  const updateFooter = useCallback(async (newFooterConfig: Partial<FooterConfig>) => {
    if (!config) return;

    const originalConfig = JSON.parse(JSON.stringify(config));
    const newConfig = { ...config, footer: { ...config.footer, ...newFooterConfig } };
    setConfig(newConfig); // Optimistic update

    try {
      await updateHomepageConfig(newConfig);
    } catch (error) {
      console.error("Failed to update footer config", error);
      setConfig(originalConfig);
      throw error;
    }
  }, [config]);

  const updateFullConfig = useCallback(async (newConfig: HomepageConfig) => {
    const originalConfig = JSON.parse(JSON.stringify(config));
    setConfig(newConfig); // Optimistic update

    try {
      await updateHomepageConfig(newConfig);
    } catch (error) {
      console.error("Failed to update full homepage config", error);
      setConfig(originalConfig);
      throw error;
    }
  }, [config]);

  return (
    <HomepageContext.Provider value={{ config, loading, updateSection, updateHeader, updateFooter, updateFullConfig, setConfig }}>
      {children}
    </HomepageContext.Provider>
  );
};

export const useHomepageContent = () => {
  const context = React.useContext(HomepageContext);
  if (context === undefined) {
    throw new Error('useHomepageContent must be used within a HomepageProvider');
  }
  return context;
};
