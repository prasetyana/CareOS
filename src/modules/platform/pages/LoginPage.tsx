import React, { useState, useEffect, useRef } from 'react';
// FIX: Re-typed import to fix "no exported member" errors.
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from '@core/hooks/useAuth';
import { useTenant } from '@core/tenant';
import { Eye, EyeOff, UtensilsCrossed } from 'lucide-react';
import Email2FAModal from '@modules/platform/components/Email2FAModal';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user, requires2FA, pending2FAEmail, send2FACode, verify2FACode, cancel2FA } = useAuth();
  const { tenant } = useTenant();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasRedirected = useRef(false);

  // Redirect based on user role if already logged in
  useEffect(() => {
    if (user && !hasRedirected.current) {
      hasRedirected.current = true;
      console.log('User already logged in, redirecting based on role:', user.role);

      // Preserve tenant parameter
      const urlParams = new URLSearchParams(window.location.search);
      const tenant = urlParams.get('tenant');
      const tenantParam = tenant ? `?tenant=${tenant}` : '';

      if (user.role === 'admin' || user.role === 'tenant_admin' || user.role === 'platform_admin') {
        window.location.href = `/admin/dasbor${tenantParam}`;
      } else if (user.role === 'cs') {
        window.location.href = `/cs/dasbor${tenantParam}`;
      } else {
        window.location.href = `/${tenantParam}`;
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    hasRedirected.current = false; // Reset flag before login

    const success = await login(email, password);
    setLoading(false);

    if (!success) {
      setError('Email atau kata sandi tidak valid.');
    }
    // If 2FA is required, the modal will show automatically
    // Redirect will happen via useEffect when user state updates
  };

  const handle2FAVerify = async (code: string) => {
    const result = await verify2FACode(code);
    return result;
  };

  const handle2FAResend = async () => {
    await send2FACode();
  };

  const handle2FACancel = () => {
    cancel2FA();
    setError('');
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden font-sans">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop"
          alt="Restaurant Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      </div>

      {/* Left Side - Copywriting */}
      <div className="hidden lg:flex flex-1 relative z-10 flex-col justify-center px-16 text-white">
        <div className="max-w-xl">
          {tenant?.slug === 'demo' ? (
            <>
              <div
                className="flex items-center gap-3 mb-8 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigate('/')}
              >
                <div className="h-12 w-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <UtensilsCrossed className="h-7 w-7 text-white" />
                </div>
                <span className="text-3xl font-bold tracking-tight">CareOS</span>
              </div>
              <h1 className="text-5xl font-bold leading-tight mb-6">
                Revolusi Manajemen <br />
                <span className="text-orange-400">Restoran Modern</span>
              </h1>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                Kelola pesanan, reservasi, dan pelanggan dalam satu platform terintegrasi.
                Tingkatkan efisiensi operasional dan berikan pengalaman terbaik bagi pelanggan Anda.
              </p>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
                  <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-sm font-medium">Live Demo System</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
                  <span className="text-sm font-medium">v0.1.4 Beta</span>
                </div>
              </div>
            </>
          ) : (
            <>
              {tenant?.logoUrl && (
                <img src={tenant.logoUrl} alt={tenant.businessName} className="h-16 w-auto mb-8 drop-shadow-lg" />
              )}
              <h1 className="text-5xl font-bold leading-tight mb-6">
                Selamat Datang di <br />
                <span className="text-orange-400">{tenant?.businessName || 'CareOS'}</span>
              </h1>
              <p className="text-lg text-gray-300 leading-relaxed">
                Nikmati hidangan lezat dan pelayanan terbaik kami.
                Masuk untuk mulai memesan atau mengelola reservasi Anda.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10 lg:justify-center lg:items-end lg:pr-24">

        {/* Mobile Logo - Only visible on mobile, outside the card */}
        <div className="flex lg:hidden justify-center mb-8">
          <div
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('/')}
          >
            <div className="h-12 w-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <UtensilsCrossed className="h-7 w-7 text-white" />
            </div>
            <span className="text-3xl font-bold tracking-tight text-white drop-shadow-md">CareOS</span>
          </div>
        </div>

        <div className="w-full max-w-[400px] bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_20px_50px_rgb(0,0,0,0.3)] border border-white/50">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 text-center mb-2">
              {tenant?.slug === 'demo' ? 'Login Demo' : 'Masuk Akun'}
            </h2>
            <p className="text-center text-sm text-gray-500 mb-8">
              {tenant?.slug === 'demo'
                ? <>Silakan masuk menggunakan akun demo.<br />Coba tanpa daftar!</>
                : 'Masukkan detail akun Anda untuk melanjutkan'}
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email-address" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Email</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full px-4 py-3 bg-white border border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 text-sm placeholder:text-gray-400"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Kata Sandi</label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className="block w-full px-4 py-3 bg-white border border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 text-sm pr-10 placeholder:text-gray-400"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-red-600 text-xs text-center font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-gray-900/20 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </span>
              ) : 'Masuk'}
            </button>
          </form>

          {/* Demo Credentials - Only visible for demo tenant */}
          {tenant?.slug === 'demo' && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest text-center mb-6">Kredensial Demo</p>

              <div className="grid grid-cols-1 gap-2.5">
                <button
                  onClick={() => { setEmail('admin@demo.com'); setPassword('password123'); }}
                  className="flex items-center p-2.5 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-200 group text-left w-full shadow-sm"
                >
                  <div className="h-9 w-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3 group-hover:scale-105 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-xs text-gray-900">Admin</div>
                    <div className="text-[10px] text-gray-500">Akses penuh</div>
                  </div>
                </button>

                <button
                  onClick={() => { setEmail('customer@demo.com'); setPassword('password123'); }}
                  className="flex items-center p-2.5 bg-orange-50/30 border border-orange-200 ring-1 ring-orange-500/20 rounded-xl hover:border-orange-300 hover:bg-orange-50/50 transition-all duration-200 group text-left w-full shadow-sm relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 bg-orange-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg shadow-sm">
                    Rekomendasi
                  </div>
                  <div className="h-9 w-9 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center mr-3 group-hover:scale-105 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-xs text-gray-900 flex items-center">
                      Pelanggan
                    </div>
                    <div className="text-[10px] text-gray-500">Pesan & reservasi</div>
                  </div>
                </button>

                <button
                  onClick={() => { setEmail('cs@demo.com'); setPassword('password123'); }}
                  className="flex items-center p-2.5 bg-white border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50/30 transition-all duration-200 group text-left w-full shadow-sm"
                >
                  <div className="h-9 w-9 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mr-3 group-hover:scale-105 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-xs text-gray-900">CS Agent</div>
                    <div className="text-[10px] text-gray-500">Bantuan live chat</div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Version Info - Only visible on mobile under the form */}
        <div className="flex lg:hidden justify-center gap-3 mt-8">
          <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
            <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] font-medium text-white/90">Live Demo</span>
          </div>
          <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
            <span className="text-[10px] font-medium text-white/90">v0.1.4 Beta</span>
          </div>
        </div>
      </div>

      {/* 2FA Modal */}
      <Email2FAModal
        isOpen={requires2FA}
        onClose={handle2FACancel}
        onVerify={handle2FAVerify}
        onResend={handle2FAResend}
        email={pending2FAEmail || email}
      />
    </div>
  );
};

export default LoginPage;
