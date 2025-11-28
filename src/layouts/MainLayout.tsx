

import React from 'react';
// FIX: Re-typed import to fix "no exported member" errors.
import { Outlet } from "react-router-dom";
import Header from './Header';
import Footer from './Footer';

const MainLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow animate-page-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
