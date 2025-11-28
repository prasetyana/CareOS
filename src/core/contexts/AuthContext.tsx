import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from "react-router-dom";
import { supabase } from '../supabase/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { logActivity } from '../services/tenantService';

// Extended user type that includes profile data
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'customer' | 'cs' | 'tenant_admin' | 'platform_admin';
  phone?: string;
  tenant_id?: string;
  avatarUrl?: string | null;
  // Customer-specific fields (can be null for admins)
  loyaltyPoints?: number;
  username?: string;
  birthdate?: string;
  dailyCheckinStreak?: number;
  lastCheckinDate?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  updateUserData: (updatedUser: Partial<User>) => void;
  deleteAccount: () => Promise<void>;
  changeEmail: (newEmail: string) => Promise<{ success: boolean; error?: string }>;
  // 2FA states and functions
  requires2FA: boolean;
  pending2FAUserId: string | null;
  pending2FAEmail: string | null;
  send2FACode: () => Promise<{ success: boolean; error?: string }>;
  verify2FACode: (code: string) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 2FA states
  const [requires2FA, setRequires2FA] = useState(false);
  const [pending2FAUserId, setPending2FAUserId] = useState<string | null>(null);
  const [pending2FAEmail, setPending2FAEmail] = useState<string | null>(null);

  const fetchingProfile = React.useRef(false);

  // Load user session on mount
  useEffect(() => {
    let mounted = true;
    let safetyTimeout: NodeJS.Timeout;

    const initAuth = async () => {
      try {
        console.log('Initializing auth...');
        // Check for existing Supabase session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          if (mounted) setLoading(false);
          return;
        }

        console.log('Session:', session ? 'Found' : 'None', session?.user?.id);

        if (session?.user && session?.access_token && mounted) {
          await loadUserProfile(session.user, session.access_token);
        }
      } catch (error) {
        console.error('Error loading session:', error);
      } finally {
        if (mounted) {
          console.log('Auth initialization complete, setting loading=false');
          setLoading(false);
          clearTimeout(safetyTimeout);
        }
      }
    };

    // Safety timeout to ensure loading doesn't stick forever
    safetyTimeout = setTimeout(() => {
      if (mounted) {
        console.warn('Auth initialization timed out, forcing loading to false. Current loading state:', loading);
        setLoading(false);
      }
    }, 15000);

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);

      if (session?.user && session?.access_token && mounted) {
        await loadUserProfile(session.user, session.access_token);
      } else if (mounted) {
        console.log('No user in session, setting user to null');
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, []);

  // Load user profile from Supabase profiles table using direct fetch
  const loadUserProfile = async (authUser: SupabaseUser, accessToken: string) => {
    try {
      fetchingProfile.current = true;
      console.log('Loading profile for user:', authUser.id);
      console.log('🚀 Starting direct fetch for profile:', authUser.id);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${authUser.id}&select=*`, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Fetch error: ${response.statusText}`);
      }

      const data = await response.json();
      const profile = data && data.length > 0 ? data[0] : null;

      if (profile) {
        const userData: User = {
          id: authUser.id,
          email: authUser.email || '',
          name: profile.full_name || authUser.user_metadata?.full_name || 'User',
          role: profile.role || 'customer',
          phone: profile.phone || authUser.user_metadata?.phone,
          tenant_id: profile.tenant_id,
          avatarUrl: profile.avatar_url,
          loyaltyPoints: profile.loyalty_points || 0,
          username: profile.username,
          birthdate: profile.birthdate,
          dailyCheckinStreak: profile.daily_checkin_streak || 0,
          lastCheckinDate: profile.last_checkin_date,
        };

        setUser(userData);
        console.log('User profile loaded:', userData);
      } else {
        console.warn('Profile not found for user:', authUser.id);
        // Fallback to basic user data if profile missing
        const userData: User = {
          id: authUser.id,
          email: authUser.email || '',
          name: authUser.user_metadata?.full_name || 'User',
          role: 'customer',
          phone: authUser.user_metadata?.phone,
        };
        setUser(userData);
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      setLoading(false);
    } finally {
      fetchingProfile.current = false;
    }
  };

  const refreshProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user && session?.access_token) {
      await loadUserProfile(session.user, session.access_token);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        return false;
      }

      if (data.user && data.session) {
        // Check if user has 2FA enabled by fetching their profile
        const { mockUsers } = await import('../data/mockDB');
        const userProfile = mockUsers.find(u => u.email === email);

        if (userProfile?.twoFactorEnabled) {
          // User has 2FA enabled - don't complete login yet
          setPending2FAUserId(userProfile.id.toString());
          setPending2FAEmail(email);
          setRequires2FA(true);

          // Generate and send 2FA code
          const { generate2FACode } = await import('../data/mockDB');
          const result = await generate2FACode(userProfile.id);

          if (result.success && result.code) {
            console.log(`📧 2FA Code for ${email}: ${result.code}`);
            // TODO: Send email via Supabase in production
          }

          return true; // Return true to indicate login initiated (but not complete)
        }

        // No 2FA - complete login normally

        // Log login activity BEFORE updating state/redirecting
        // This is critical because updating state triggers a page reload in LoginPage
        const { error: logError } = await supabase
          .from('activity_logs')
          .insert({
            user_id: data.user.id,
            action: 'login',
            description: 'User logged in successfully'
          });

        if (logError) {
          console.error('Login activity log error:', logError);
        }

        await loadUserProfile(data.user, data.session.access_token);

        return true;
      }

      return false;
    } catch (error) {
      console.error('Login exception:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      if (user) {
        // Log logout activity
        await logActivity({
          userId: user.id,
          action: 'logout',
          description: 'User logged out'
        });
      }

      await supabase.auth.signOut();
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUserData = async (updatedData: Partial<User>) => {
    if (!user) return;

    try {
      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updatedData.name,
          phone: updatedData.phone,
          avatar_url: updatedData.avatarUrl,
          username: updatedData.username,
          birthdate: updatedData.birthdate,
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        return;
      }

      // Update local state
      setUser({ ...user, ...updatedData });
    } catch (error) {
      console.error('Error in updateUserData:', error);
    }
  };

  const deleteAccount = async () => {
    if (!user) return;

    try {
      // Delete profile first (due to foreign key constraints)
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) {
        console.error('Error deleting profile:', profileError);
        throw new Error('Gagal menghapus profil');
      }

      // Delete auth user (this might require admin privileges)
      // For now, just sign out
      await logout();
    } catch (error) {
      console.error('Error deleting account:', error);
      throw new Error('Gagal menghapus akun');
    }
  };

  const changeEmail = async (newEmail: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      // Call Supabase to update email - this will send a confirmation email
      const { data, error } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (error) {
        console.error('Error changing email:', error);

        // Handle specific error cases
        if (error.message.includes('already registered')) {
          return { success: false, error: 'Email sudah digunakan oleh akun lain' };
        }

        return { success: false, error: error.message || 'Gagal mengubah email' };
      }

      // Email change initiated successfully
      // Note: The email won't actually change until the user confirms via the link sent to the new email
      console.log('Email change initiated:', data);

      return { success: true };
    } catch (error) {
      console.error('Exception in changeEmail:', error);
      return { success: false, error: 'Terjadi kesalahan saat mengubah email' };
    }
  };

  // 2FA Functions
  const send2FACode = async (): Promise<{ success: boolean; error?: string }> => {
    if (!pending2FAUserId) {
      return { success: false, error: 'No pending 2FA user' };
    }

    try {
      // Import the generate2FACode function
      const { generate2FACode } = await import('../data/mockDB');

      // Generate code
      const result = await generate2FACode(parseInt(pending2FAUserId));

      if (!result.success || !result.code) {
        return { success: false, error: result.error || 'Failed to generate code' };
      }

      // Send email via Supabase (for now, just log it - in production, use Supabase Edge Functions)
      console.log(`📧 2FA Code for ${pending2FAEmail}: ${result.code}`);

      // TODO: In production, send email via Supabase Edge Function
      // await supabase.functions.invoke('send-2fa-email', {
      //   body: { email: pending2FAEmail, code: result.code }
      // });

      return { success: true };
    } catch (error) {
      console.error('Error sending 2FA code:', error);
      return { success: false, error: 'Failed to send verification code' };
    }
  };

  const verify2FACode = async (code: string): Promise<{ success: boolean; error?: string }> => {
    if (!pending2FAUserId) {
      return { success: false, error: 'No pending 2FA user' };
    }

    try {
      // Import the verify2FACode function
      const { verify2FACode: verifyCode } = await import('../data/mockDB');

      // Verify code
      const result = await verifyCode(parseInt(pending2FAUserId), code);

      if (!result.success) {
        return { success: false, error: result.error || 'Invalid code' };
      }

      // Code verified! Now complete the login
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        return { success: false, error: 'Session expired' };
      }

      await loadUserProfile(data.session.user, data.session.access_token);

      // Clear 2FA states
      setRequires2FA(false);
      setPending2FAUserId(null);
      setPending2FAEmail(null);

      return { success: true };
    } catch (error) {
      console.error('Error verifying 2FA code:', error);
      return { success: false, error: 'Failed to verify code' };
    }
  };

  const cancel2FA = () => {
    setRequires2FA(false);
    setPending2FAUserId(null);
    setPending2FAEmail(null);
    // Sign out the pending session
    supabase.auth.signOut();
  };

  const isAuthenticated = !!user;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      loading,
      login,
      logout,
      updateUserData,
      deleteAccount,
      changeEmail,
      requires2FA,
      pending2FAUserId,
      pending2FAEmail,
      send2FACode,
      verify2FACode,
      cancel2FA,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );

};