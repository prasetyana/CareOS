import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from '@core/contexts/AuthContext';
import LoginPage from '@modules/platform/pages/LoginPage';
import AdminDashboardPage from '@modules/admin/pages/AdminDashboardPage';
import ProtectedAdminRoute from './router/ProtectedAdminRoute';
import AdminComponentGalleryPage from '@modules/admin/pages/AdminComponentGalleryPage';
import { PreserveParamsNavigate } from './router/PreserveParamsNavigate';
import { ToastProvider } from '@core/contexts/ToastContext';
import MainLayout from '@layouts/MainLayout';
import AdminLayout from '@layouts/AdminLayout';
import { ThemeProvider } from '@core/contexts/ThemeContext';
import AdminSettingsPage from '@modules/admin/pages/AdminSettingsPage';
import { HomepageProvider } from '@core/contexts/HomepageContext';
import AdminMenuLayout from '@modules/admin/pages/admin/AdminMenuLayout';
import AddNewMenu from '@modules/admin/pages/admin-menu/AddNewMenu';
import EditMenu from '@modules/admin/pages/admin-menu/EditMenu';
import ManageMenu from '@modules/admin/pages/admin-menu/ManageMenu';
import MenuCategories from '@modules/admin/pages/admin-menu/MenuCategories';
import AdminOrdersLayout from '@modules/admin/pages/admin/AdminOrdersLayout';
import AllOrders from '@modules/admin/pages/admin-orders/AllOrders';
import ActiveOrders from '@modules/admin/pages/admin-orders/ActiveOrders';
import OrderHistory from '@modules/admin/pages/admin-orders/OrderHistory';
import AdminReservationsLayout from '@modules/admin/pages/admin/AdminReservationsLayout';
import ReservationSchedule from '@modules/admin/pages/admin-reservations/ReservationSchedule';
import AddManualReservation from '@modules/admin/pages/admin-reservations/AddManualReservation';
import AdminCustomersLayout from '@modules/admin/pages/admin/AdminCustomersLayout';
import CustomerList from '@modules/admin/pages/admin-customers/CustomerList';
import ReviewsFeedback from '@modules/admin/pages/admin-customers/ReviewsFeedback';
import AdminAnalyticsLayout from '@modules/admin/pages/admin/AdminAnalyticsLayout';
import SalesStatistics from '@modules/admin/pages/admin-analytics/SalesStatistics';
import WebsiteTraffic from '@modules/admin/pages/admin-analytics/WebsiteTraffic';
import BestSellingMenu from '@modules/admin/pages/admin-analytics/BestSellingMenu';
import RestaurantProfile from '@modules/admin/pages/admin-settings/RestaurantProfile';
import OwnerAccount from '@modules/admin/pages/admin-settings/OwnerAccount';
import GeneralSettings from '@modules/admin/pages/admin-settings/GeneralSettings';
import BillingSubscription from '@modules/admin/pages/admin-settings/BillingSubscription';
import AdminAppearanceLayout from '@modules/admin/pages/admin/AdminAppearanceLayout';

import EditSectionPage from '@modules/admin/pages/admin-appearance/EditSectionPage';
import Themes from '@modules/admin/pages/admin-appearance/Themes';
import ThemeDetailsPage from '@modules/admin/pages/admin-appearance/ThemeDetailsPage';
import Colors from '@modules/admin/pages/admin-appearance/Colors';
import AdminPromotionsLayout from '@modules/admin/pages/admin/AdminPromotionsLayout';
import PromoBanner from '@modules/admin/pages/admin-promotions/PromoBanner';
import DiscountCodes from '@modules/admin/pages/admin-promotions/DiscountCodes';
import EventCampaign from '@modules/admin/pages/admin-promotions/EventCampaign';
import Loyalty from '@modules/admin/pages/admin-promotions/Loyalty';
import EditHeaderPage from '@modules/admin/pages/admin-appearance/EditHeaderPage';
import EditFooterPage from '@modules/admin/pages/admin-appearance/EditFooterPage';
import { CartProvider } from '@core/contexts/CartContext';
import { CustomerLayoutProvider } from '@core/contexts/CustomerLayoutContext';
import { NotificationProvider } from '@core/contexts/NotificationContext';
import { ChatProvider } from '@core/contexts/ChatContext';
import ProtectedCsRoute from './router/ProtectedCsRoute';
import CustomerServiceLayout from '@layouts/CustomerServiceLayout';
import CustomerServiceDashboardPage from '@modules/cs/pages/CustomerServiceDashboardPage';
import LiveChatPage from '@modules/cs/pages/LiveChatPage';
import InboxPage from '@modules/cs/pages/InboxPage';
import FaqManagementPage from '@modules/cs/pages/FaqManagementPage';
import FaqEditorPage from '@modules/cs/pages/FaqEditorPage';
import AdminLiveChatPage from '@modules/admin/pages/admin-customers/AdminLiveChatPage';
import { LiveChatProvider } from '@core/contexts/LiveChatContext';
import StatistikChatPage from '@modules/admin/pages/admin-customers/StatistikChatPage';
import { LocationProvider } from '@core/contexts/LocationContext';
import { FavoritesProvider } from '@core/contexts/FavoritesContext';
import { TenantProvider, TenantConfig } from '@core/tenant';
import RestaurantRegisterPage from '@modules/platform/pages/RestaurantRegisterPage';
import AdminStaffPage from '@modules/admin/pages/admin-staff/AdminStaffPage';
import EmailSettings from '@modules/admin/pages/admin-settings/EmailSettings';
import DomainSettings from '@modules/admin/pages/admin-settings/DomainSettings';
import DynamicFavicon from '@ui/DynamicFavicon';
import { TenantAppWrapper } from './TenantAppWrapper';
import ThemeSwitcher from '../modules/storefront/themes/ThemeSwitcher';
import DefaultTheme from '@modules/storefront/themes/default/DefaultTheme';
import PlatformLandingPage from '@modules/platform/pages/PlatformLandingPage';
import ThemePreviewPanel from '@modules/common/components/ThemePreviewPanel';
import CheckoutPage from '@modules/platform/pages/CheckoutPage';
import PaymentSuccessPage from '@modules/platform/pages/PaymentSuccessPage';
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <HomepageProvider>
              <LocationProvider>
                <CartProvider>
                  <FavoritesProvider>
                    <ChatProvider>
                      <NotificationProvider>
                        <CustomerLayoutProvider>
                          <LiveChatProvider>
                            <ThemePreviewPanel />
                            <Routes>
                              {/* Platform routes (NO tenant context needed) */}
                              <Route path="/start" element={<RestaurantRegisterPage />} />
                              <Route path="/start/payment" element={<CheckoutPage />} />
                              <Route path="/start/success" element={<PaymentSuccessPage />} />

                              {/* All other routes need tenant context (including login) */}
                              <Route path="/*" element={
                                <TenantAppWrapper>
                                  {(tenant, loading) => {
                                    if (loading) {
                                      return (
                                        <div style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          height: '100vh',
                                          fontSize: '18px',
                                          color: '#666'
                                        }}>
                                          Loading tenant...
                                        </div>
                                      );
                                    }

                                    return (
                                      <TenantProvider value={tenant}>
                                        <DynamicFavicon />
                                        <Routes>
                                          {/* Tenant root - dynamic based on auth */}
                                          <Route path="/" element={
                                            tenant?.id === 'platform'
                                              ? <PlatformLandingPage />
                                              : tenant ? <ThemeSwitcher tenant={tenant as TenantConfig} mode="public" /> : <Navigate to="/login" />
                                          } />
                                          <Route path="/account/*" element={tenant ? <DefaultTheme tenant={tenant as TenantConfig} mode="customer" /> : <Navigate to="/login" />} />

                                          {/* Tenant-specific login (uses tenant branding) */}
                                          <Route path="/login" element={<LoginPage />} />

                                          {/* Admin Routes */}
                                          <Route element={<ProtectedAdminRoute />}>
                                            <Route path="/admin" element={<AdminLayout />}>
                                              <Route index element={<Navigate to="dasbor" replace />} />
                                              <Route path="dasbor" element={<AdminDashboardPage />} />

                                              <Route path="menu" element={<AdminMenuLayout />}>
                                                <Route index element={<PreserveParamsNavigate to="kelola-menu" replace />} />
                                                <Route path="tambah-menu-baru" element={<AddNewMenu />} />
                                                <Route path="edit-menu/:slug" element={<EditMenu />} />
                                                <Route path="kelola-menu" element={<ManageMenu />} />
                                                <Route path="kategori-menu" element={<MenuCategories />} />
                                              </Route>

                                              <Route path="pesanan" element={<AdminOrdersLayout />}>
                                                <Route index element={<PreserveParamsNavigate to="semua-pesanan" replace />} />
                                                <Route path="semua-pesanan" element={<AllOrders />} />
                                                <Route path="pesanan-aktif" element={<ActiveOrders />} />
                                                <Route path="riwayat-pesanan" element={<OrderHistory />} />
                                              </Route>

                                              <Route path="reservasi" element={<AdminReservationsLayout />}>
                                                <Route index element={<PreserveParamsNavigate to="jadwal-reservasi" replace />} />
                                                <Route path="jadwal-reservasi" element={<ReservationSchedule />} />
                                                <Route path="tambah-reservasi-manual" element={<AddManualReservation />} />
                                              </Route>

                                              <Route path="pelanggan" element={<AdminCustomersLayout />}>
                                                <Route index element={<PreserveParamsNavigate to="daftar-pelanggan" replace />} />
                                                <Route path="daftar-pelanggan" element={<CustomerList />} />
                                                <Route path="ulasan-feedback" element={<ReviewsFeedback />} />
                                                <Route path="live-chat" element={<AdminLiveChatPage />} />
                                                <Route path="statistik-chat" element={<StatistikChatPage />} />
                                              </Route>

                                              <Route path="promosi" element={<AdminPromotionsLayout />}>
                                                <Route index element={<PreserveParamsNavigate to="banner-promo" replace />} />
                                                <Route path="banner-promo" element={<PromoBanner />} />
                                                <Route path="kode-diskon" element={<DiscountCodes />} />
                                                <Route path="event-campaign" element={<EventCampaign />} />
                                                <Route path="loyalti" element={<Loyalty />} />
                                              </Route>

                                              <Route path="analitik" element={<AdminAnalyticsLayout />}>
                                                <Route index element={<PreserveParamsNavigate to="statistik-penjualan" replace />} />
                                                <Route path="statistik-penjualan" element={<SalesStatistics />} />
                                                <Route path="traffic-website" element={<WebsiteTraffic />} />
                                                <Route path="menu-terlaris" element={<BestSellingMenu />} />
                                              </Route>

                                              <Route path="tampilan" element={<AdminAppearanceLayout />}>
                                                <Route index element={<PreserveParamsNavigate to="tema" replace />} />
                                                <Route path="edit-header" element={<EditHeaderPage />} />
                                                <Route path="edit-section/:sectionId" element={<EditSectionPage />} />
                                                <Route path="edit-footer" element={<EditFooterPage />} />
                                                <Route path="tema" element={<Themes />} />
                                                <Route path="tema/detail/:themeId" element={<ThemeDetailsPage />} />
                                                <Route path="warna" element={<Colors />} />
                                              </Route>

                                              <Route path="pengaturan" element={<AdminSettingsPage />}>
                                                <Route index element={<PreserveParamsNavigate to="profil-restoran" replace />} />
                                                <Route path="profil-restoran" element={<RestaurantProfile />} />
                                                <Route path="akun-pemilik" element={<OwnerAccount />} />
                                                <Route path="manajemen-staff" element={<AdminStaffPage />} />
                                                <Route path="email" element={<EmailSettings />} />
                                                <Route path="domain" element={<DomainSettings />} />
                                                <Route path="pengaturan-umum" element={<GeneralSettings />} />
                                                <Route path="tagihan-langganan" element={<BillingSubscription />} />
                                              </Route>

                                              <Route path="components" element={<AdminComponentGalleryPage />} />
                                            </Route>
                                          </Route>

                                          {/* Customer Service Routes */}
                                          <Route element={<ProtectedCsRoute />}>
                                            <Route path="/cs" element={<CustomerServiceLayout />}>
                                              <Route index element={<Navigate to="dasbor" replace />} />
                                              <Route path="dasbor" element={<CustomerServiceDashboardPage />} />
                                              <Route path="live-chat" element={<LiveChatPage />} />
                                              <Route path="pesan-masuk" element={<InboxPage />} />
                                              <Route path="kelola-faq" element={<FaqManagementPage />} />
                                              <Route path="kelola-faq/baru" element={<FaqEditorPage />} />
                                              <Route path="kelola-faq/edit/:faqId" element={<FaqEditorPage />} />
                                            </Route>
                                          </Route>

                                          {/* Catch-all for tenant routes */}
                                          <Route path="*" element={<Navigate to="/login" replace />} />
                                        </Routes>
                                      </TenantProvider>
                                    );
                                  }}
                                </TenantAppWrapper>
                              } />
                            </Routes>
                          </LiveChatProvider>
                        </CustomerLayoutProvider>
                      </NotificationProvider>
                    </ChatProvider>
                  </FavoritesProvider>
                </CartProvider>
              </LocationProvider>
            </HomepageProvider>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider >
    </BrowserRouter >
  );
};

export default App;
