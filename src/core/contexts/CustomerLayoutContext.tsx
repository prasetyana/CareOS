import React, { createContext, useState, useContext, ReactNode } from 'react';

interface CustomerLayoutContextType {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

const CustomerLayoutContext = createContext<CustomerLayoutContextType | undefined>(undefined);

export const CustomerLayoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <CustomerLayoutContext.Provider value={{ isSidebarCollapsed, setIsSidebarCollapsed }}>
      {children}
    </CustomerLayoutContext.Provider>
  );
};

export const useCustomerLayout = () => {
  const context = useContext(CustomerLayoutContext);
  if (context === undefined) {
    throw new Error('useCustomerLayout must be used within a CustomerLayoutProvider');
  }
  return context;
};
