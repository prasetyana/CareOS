








import React from 'react';
// FIX: Re-typed import to fix "no exported member" errors.
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigate } from './components/Navigate';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ProtectedAdminRoute from './router/ProtectedAdminRoute';
import AdminComponentGalleryPage from './pages/AdminComponentGalleryPage';
import { ToastProvider } from './contexts/ToastContext';
import ToastContainer from './components/ToastContainer';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import { ThemeProvider } from './contexts/ThemeContext';
import AdminSettingsPage from './pages/AdminSettingsPage';
import { HomepageProvider } from './contexts/HomepageContext';
import AdminMenuLayout from './pages/admin/AdminMenuLayout';
import TambahMenuBaru from './pages/admin-menu/TambahMenuBaru';
import EditMenuBaru from './pages/admin-menu/EditMenuBaru';
import KelolaMenu from './pages/admin-menu/KelolaMenu';
import KategoriMenu from './pages/admin-menu/KategoriMenu';
import AdminPesananLayout from './pages/admin/AdminPesananLayout';
import SemuaPesanan from './pages/admin-pesanan/SemuaPesanan';
import PesananAktif from './pages/admin-pesanan/PesananAktif';
import RiwayatPesanan from './pages/admin-pesanan/RiwayatPesanan';
import AdminReservasiLayout from './pages/admin/AdminReservasiLayout';
import JadwalReservasi from './pages/admin-reservasi/JadwalReservasi';
import TambahReservasiManual from './pages/admin-reservasi/TambahReservasiManual';
import AdminPelangganLayout from './pages/admin/AdminPelangganLayout';
import DaftarPelanggan from './pages/admin-pelanggan/DaftarPelanggan';
import UlasanFeedback from './pages/admin-pelanggan/UlasanFeedback';
import AdminAnalitikLayout from './pages/admin/AdminAnalitikLayout';
import StatistikPenjualan from './pages/admin-analitik/StatistikPenjualan';
import TrafficWebsite from './pages/admin-analitik/TrafficWebsite';
import MenuTerlaris from './pages/admin-analitik/MenuTerlaris';
import ProfilRestoran from './pages/admin-pengaturan/ProfilRestoran';
import AkunPemilik from './pages/admin-pengaturan/AkunPemilik';
import PengaturanUmum from './pages/admin-pengaturan/PengaturanUmum';
import TagihanLangganan from './pages/admin-pengaturan/TagihanLangganan';
import AdminTampilanLayout from './pages/admin/AdminTampilanLayout';
import KustomisasiHomepage from './pages/admin-tampilan/KustomisasiHomepage';
import EditSectionPage from './pages/admin-tampilan/EditSectionPage';
import TampilanTemaWarna from './pages/admin-tampilan/TampilanTemaWarna';
import AdminPromosiLayout from './pages/admin/AdminPromosiLayout';
import BannerPromo from './pages/admin-promosi/BannerPromo';
import KodeDiskon from './pages/admin-promosi/KodeDiskon';
import EventCampaign from './pages/admin-promosi/EventCampaign';
import Loyalti from './pages/admin-promosi/Loyalti';
import EditHeaderPage from './pages/admin-tampilan/EditHeaderPage';
import EditFooterPage from './pages/admin-tampilan/EditFooterPage';
import ProtectedCustomerRoute from './router/ProtectedCustomerRoute';
import CustomerOrderHistoryPage from './pages/customer/CustomerOrderHistoryPage';
import CustomerReservationsPage from './pages/customer/CustomerReservationsPage';
import CustomerRewardsPage from './pages/customer/CustomerRewardsPage';
import CustomerPesanPage from './pages/customer/CustomerPesanPage';
import CustomerBuatReservasiPage from './pages/customer/CustomerBuatReservasiPage';
import CustomerMenuDetailPage from './pages/customer/CustomerMenuDetailPage';
import CustomerDashboardHomePage from './pages/customer/CustomerDashboardHomePage';
import CustomerFavoritesPage from './pages/customer/CustomerFavoritesPage';
import { CartProvider } from './contexts/CartContext';
import ResponsiveCustomerLayout from './layouts/ResponsiveCustomerLayout';
import { CustomerLayoutProvider } from './contexts/CustomerLayoutContext';
import CustomerPesananPage from './pages/customer/CustomerPesananPage';
import CustomerPesananAktifPage from './pages/customer/CustomerPesananAktifPage';
import CustomerReservasiPage from './pages/customer/CustomerReservasiPage';
import { NotificationProvider } from './contexts/NotificationContext';
import CustomerNotificationsPage from './pages/customer/CustomerNotificationsPage';
import { ChatProvider } from './contexts/ChatContext';
import ProtectedCsRoute from './router/ProtectedCsRoute';
import CustomerServiceLayout from './layouts/CustomerServiceLayout';
import CustomerServiceDashboardPage from './pages/cs/CustomerServiceDashboardPage';
import LiveChatPage from './pages/cs/LiveChatPage';
import PesanMasukPage from './pages/cs/PesanMasukPage';
import FaqManagementPage from './pages/cs/FaqManagementPage';
import FaqEditorPage from './pages/cs/FaqEditorPage';
import AdminLiveChatPage from './pages/admin-pelanggan/AdminLiveChatPage';
import { LiveChatProvider } from './contexts/LiveChatContext';
import StatistikChatPage from './pages/admin-pelanggan/StatistikChatPage';
import CustomerSettingsLayout from './pages/customer/CustomerSettingsLayout';
import CustomerProfileSettingsPage from './pages/customer/settings/CustomerProfileSettingsPage';
import CustomerSecurityPage from './pages/customer/settings/CustomerSecurityPage';
import CustomerPreferencesSettingsPage from './pages/customer/settings/CustomerPreferencesSettingsPage';
import CustomerAddressesPage from './pages/customer/settings/CustomerAddressesPage';
import CustomerPaymentMethodsPage from './pages/customer/settings/CustomerPaymentMethodsPage';
import { LocationProvider } from './contexts/LocationContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { TenantProvider } from './contexts/TenantContext';
import RestaurantRegisterPage from './pages/platform/RestaurantRegisterPage';
import OnboardingWizardPage from './pages/platform/OnboardingWizardPage';
import PlatformLandingPage from './pages/platform/PlatformLandingPage';
import AdminStaffPage from './pages/admin-staff/AdminStaffPage';
import EmailSettings from './pages/admin-pengaturan/EmailSettings';
import DomainSettings from './pages/admin-pengaturan/DomainSettings';
import DynamicFavicon from './components/DynamicFavicon';

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
                              <Route path="/" element={<PlatformLandingPage />} />
                              <Route path="/register" element={<RestaurantRegisterPage />} />
                              <Route path="/onboarding" element={<OnboardingWizardPage />} />

                              {/* All other routes need tenant context (including login) */}
                              <Route path="/*" element={
                                <TenantProvider>
                                  <DynamicFavicon />
                                  <Routes>
                                    {/* Tenant-specific login (uses tenant branding) */}
                                    <Route path="/login" element={<LoginPage />} />
                                    <Route element={<ProtectedCustomerRoute />}>
                                      <Route path="/akun" element={<ResponsiveCustomerLayout />}>
                                        <Route index element={<Navigate to="beranda" replace />} />
                                        <Route path="beranda" element={<CustomerDashboardHomePage />} />

                                        <Route path="menu" element={<CustomerPesanPage />} />
                                        <Route path="menu/:slug" element={<CustomerMenuDetailPage />} />

                                        <Route path="pesanan" element={<CustomerPesananPage />}>
                                          <Route index element={<Navigate to="aktif" replace />} />
                                          <Route path="aktif" element={<CustomerPesananAktifPage />} />
                                          <Route path="riwayat" element={<CustomerOrderHistoryPage />} />
                                        </Route>

                                        <Route path="reservasi" element={<CustomerReservasiPage />}>
                                          <Route index element={<Navigate to="buat" replace />} />
                                          <Route path="buat" element={<CustomerBuatReservasiPage />} />
                                          <Route path="reservasi" element={<CustomerReservationsPage filter="active" />} />
                                          <Route path="riwayat" element={<CustomerReservationsPage filter="history" />} />
                                        </Route>

                                        <Route path="poin-hadiah" element={<CustomerRewardsPage />} />
                                        <Route path="favorit" element={<CustomerFavoritesPage />} />
                                        <Route path="notifikasi" element={<CustomerNotificationsPage />} />

                                        <Route path="pengaturan" element={<CustomerSettingsLayout />}>
                                          <Route index element={<Navigate to="profil" replace />} />
                                          <Route path="profil" element={<CustomerProfileSettingsPage />} />
                                          <Route path="keamanan" element={<CustomerSecurityPage />} />
                                          <Route path="preferensi" element={<CustomerPreferencesSettingsPage />} />
                                          <Route path="alamat" element={<CustomerAddressesPage />} />
                                          <Route path="pembayaran" element={<CustomerPaymentMethodsPage />} />
                                        </Route>
                                      </Route>
                                    </Route>

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
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;