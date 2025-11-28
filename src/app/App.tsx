import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from '@core/contexts/AuthContext';
import LoginPage from '@modules/platform/pages/LoginPage';
import AdminDashboardPage from '@modules/admin/pages/AdminDashboardPage';
import ProtectedAdminRoute from './router/ProtectedAdminRoute';
import AdminComponentGalleryPage from '@modules/admin/pages/AdminComponentGalleryPage';
import { ToastProvider } from '@core/contexts/ToastContext';
import MainLayout from '@layouts/MainLayout';
import AdminLayout from '@layouts/AdminLayout';
import { ThemeProvider } from '@core/contexts/ThemeContext';
import AdminSettingsPage from '@modules/admin/pages/AdminSettingsPage';
import { HomepageProvider } from '@core/contexts/HomepageContext';
import AdminMenuLayout from '@modules/admin/pages/admin/AdminMenuLayout';
import TambahMenuBaru from '@modules/admin/pages/admin-menu/TambahMenuBaru';
import EditMenuBaru from '@modules/admin/pages/admin-menu/EditMenuBaru';
import KelolaMenu from '@modules/admin/pages/admin-menu/KelolaMenu';
import KategoriMenu from '@modules/admin/pages/admin-menu/KategoriMenu';
import AdminPesananLayout from '@modules/admin/pages/admin/AdminPesananLayout';
import SemuaPesanan from '@modules/admin/pages/admin-pesanan/SemuaPesanan';
import PesananAktif from '@modules/admin/pages/admin-pesanan/PesananAktif';
import RiwayatPesanan from '@modules/admin/pages/admin-pesanan/RiwayatPesanan';
import AdminReservasiLayout from '@modules/admin/pages/admin/AdminReservasiLayout';
import JadwalReservasi from '@modules/admin/pages/admin-reservasi/JadwalReservasi';
import TambahReservasiManual from '@modules/admin/pages/admin-reservasi/TambahReservasiManual';
import AdminPelangganLayout from '@modules/admin/pages/admin/AdminPelangganLayout';
import DaftarPelanggan from '@modules/admin/pages/admin-pelanggan/DaftarPelanggan';
import UlasanFeedback from '@modules/admin/pages/admin-pelanggan/UlasanFeedback';
import AdminAnalitikLayout from '@modules/admin/pages/admin/AdminAnalitikLayout';
import StatistikPenjualan from '@modules/admin/pages/admin-analitik/StatistikPenjualan';
import TrafficWebsite from '@modules/admin/pages/admin-analitik/TrafficWebsite';
import MenuTerlaris from '@modules/admin/pages/admin-analitik/MenuTerlaris';
import ProfilRestoran from '@modules/admin/pages/admin-pengaturan/ProfilRestoran';
import AkunPemilik from '@modules/admin/pages/admin-pengaturan/AkunPemilik';
import PengaturanUmum from '@modules/admin/pages/admin-pengaturan/PengaturanUmum';
import TagihanLangganan from '@modules/admin/pages/admin-pengaturan/TagihanLangganan';
import AdminTampilanLayout from '@modules/admin/pages/admin/AdminTampilanLayout';
import KustomisasiHomepage from '@modules/admin/pages/admin-tampilan/KustomisasiHomepage';
import EditSectionPage from '@modules/admin/pages/admin-tampilan/EditSectionPage';
import TampilanTemaWarna from '@modules/admin/pages/admin-tampilan/TampilanTemaWarna';
import AdminPromosiLayout from '@modules/admin/pages/admin/AdminPromosiLayout';
import BannerPromo from '@modules/admin/pages/admin-promosi/BannerPromo';
import KodeDiskon from '@modules/admin/pages/admin-promosi/KodeDiskon';
import EventCampaign from '@modules/admin/pages/admin-promosi/EventCampaign';
import Loyalti from '@modules/admin/pages/admin-promosi/Loyalti';
import EditHeaderPage from '@modules/admin/pages/admin-tampilan/EditHeaderPage';
import EditFooterPage from '@modules/admin/pages/admin-tampilan/EditFooterPage';
import { CartProvider } from '@core/contexts/CartContext';
import { CustomerLayoutProvider } from '@core/contexts/CustomerLayoutContext';
import { NotificationProvider } from '@core/contexts/NotificationContext';
import { ChatProvider } from '@core/contexts/ChatContext';
import ProtectedCsRoute from './router/ProtectedCsRoute';
import CustomerServiceLayout from '@layouts/CustomerServiceLayout';
import CustomerServiceDashboardPage from '@modules/cs/pages/CustomerServiceDashboardPage';
import LiveChatPage from '@modules/cs/pages/LiveChatPage';
import PesanMasukPage from '@modules/cs/pages/PesanMasukPage';
import FaqManagementPage from '@modules/cs/pages/FaqManagementPage';
import FaqEditorPage from '@modules/cs/pages/FaqEditorPage';
import AdminLiveChatPage from '@modules/admin/pages/admin-pelanggan/AdminLiveChatPage';
import { LiveChatProvider } from '@core/contexts/LiveChatContext';
import StatistikChatPage from '@modules/admin/pages/admin-pelanggan/StatistikChatPage';
import { LocationProvider } from '@core/contexts/LocationContext';
import { FavoritesProvider } from '@core/contexts/FavoritesContext';
import { TenantProvider, TenantConfig } from '@core/tenant';
import RestaurantRegisterPage from '@modules/platform/pages/RestaurantRegisterPage';
import OnboardingWizardPage from '@modules/platform/pages/OnboardingWizardPage';
import AdminStaffPage from '@modules/admin/pages/admin-staff/AdminStaffPage';
import EmailSettings from '@modules/admin/pages/admin-pengaturan/EmailSettings';
import DomainSettings from '@modules/admin/pages/admin-pengaturan/DomainSettings';
import DynamicFavicon from '@ui/DynamicFavicon';
import { TenantAppWrapper } from './TenantAppWrapper';
import ThemeSwitcher from '../modules/storefront/themes/ThemeSwitcher';
import DefaultTheme from '@modules/storefront/themes/default/DefaultTheme';
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
                            <Routes>
                              {/* Platform routes (NO tenant context needed) */}
                              <Route path="/register" element={<RestaurantRegisterPage />} />
                              <Route path="/onboarding" element={<OnboardingWizardPage />} />

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
                                                <Route index element={<Navigate to="kelola-menu" replace />} />
                                                <Route path="tambah-menu-baru" element={<TambahMenuBaru />} />
                                                <Route path="edit-menu/:slug" element={<EditMenuBaru />} />
                                                <Route path="kelola-menu" element={<KelolaMenu />} />
                                                <Route path="kategori-menu" element={<KategoriMenu />} />
                                              </Route>

                                              <Route path="pesanan" element={<AdminPesananLayout />}>
                                                <Route index element={<Navigate to="semua-pesanan" replace />} />
                                                <Route path="semua-pesanan" element={<SemuaPesanan />} />
                                                <Route path="pesanan-aktif" element={<PesananAktif />} />
                                                <Route path="riwayat-pesanan" element={<RiwayatPesanan />} />
                                              </Route>

                                              <Route path="reservasi" element={<AdminReservasiLayout />}>
                                                <Route index element={<Navigate to="jadwal-reservasi" replace />} />
                                                <Route path="jadwal-reservasi" element={<JadwalReservasi />} />
                                                <Route path="tambah-reservasi-manual" element={<TambahReservasiManual />} />
                                              </Route>

                                              <Route path="pelanggan" element={<AdminPelangganLayout />}>
                                                <Route index element={<Navigate to="daftar-pelanggan" replace />} />
                                                <Route path="daftar-pelanggan" element={<DaftarPelanggan />} />
                                                <Route path="ulasan-feedback" element={<UlasanFeedback />} />
                                                <Route path="live-chat" element={<AdminLiveChatPage />} />
                                                <Route path="statistik-chat" element={<StatistikChatPage />} />
                                              </Route>

                                              <Route path="promosi" element={<AdminPromosiLayout />}>
                                                <Route index element={<Navigate to="banner-promo" replace />} />
                                                <Route path="banner-promo" element={<BannerPromo />} />
                                                <Route path="kode-diskon" element={<KodeDiskon />} />
                                                <Route path="event-campaign" element={<EventCampaign />} />
                                                <Route path="loyalti" element={<Loyalti />} />
                                              </Route>

                                              <Route path="analitik" element={<AdminAnalitikLayout />}>
                                                <Route index element={<Navigate to="statistik-penjualan" replace />} />
                                                <Route path="statistik-penjualan" element={<StatistikPenjualan />} />
                                                <Route path="traffic-website" element={<TrafficWebsite />} />
                                                <Route path="menu-terlaris" element={<MenuTerlaris />} />
                                              </Route>

                                              <Route path="tampilan" element={<AdminTampilanLayout />}>
                                                <Route index element={<KustomisasiHomepage />} />
                                                <Route path="edit-header" element={<EditHeaderPage />} />
                                                <Route path="edit-section/:sectionId" element={<EditSectionPage />} />
                                                <Route path="edit-footer" element={<EditFooterPage />} />
                                                <Route path="tema-warna" element={<TampilanTemaWarna />} />
                                              </Route>

                                              <Route path="pengaturan" element={<AdminSettingsPage />}>
                                                <Route index element={<Navigate to="profil-restoran" replace />} />
                                                <Route path="profil-restoran" element={<ProfilRestoran />} />
                                                <Route path="akun-pemilik" element={<AkunPemilik />} />
                                                <Route path="manajemen-staff" element={<AdminStaffPage />} />
                                                <Route path="email" element={<EmailSettings />} />
                                                <Route path="domain" element={<DomainSettings />} />
                                                <Route path="pengaturan-umum" element={<PengaturanUmum />} />
                                                <Route path="tagihan-langganan" element={<TagihanLangganan />} />
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
                                              <Route path="pesan-masuk" element={<PesanMasukPage />} />
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
