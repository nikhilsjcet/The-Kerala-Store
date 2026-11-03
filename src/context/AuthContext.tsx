import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { StoreService } from '../services/storeService';

interface AuthContextType {
  user: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  isOtpModalOpen: boolean;
  openOtpModal: () => void;
  closeOtpModal: () => void;
  signInWithGoogle: () => Promise<{ error?: any; data?: any }>;
  verifyMasterAdminPasscode: (passcode: string) => boolean;
  loginWithPhone: (phone: string, fullName?: string) => void;
  signInWithEmail: (email: string, password: string) => Promise<{ error: any; data?: any }>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<{ error: any; data?: any; isAlreadyRegistered?: boolean }>;
  sendEmailOtp: (email: string, fullName?: string, phone?: string) => Promise<{ error: any; data?: any }>;
  verifyEmailOtp: (email: string, token: string, fullName?: string, phone?: string, type?: 'signup' | 'email') => Promise<{ error: any; data?: any }>;
  resendSignupOtp: (email: string) => Promise<{ error: any; data?: any }>;
  sendMagicLink?: (email: string) => Promise<{ error: any; data?: any }>;
  resetPassword?: (email: string) => Promise<{ error: any; data?: any }>;
  loginAsAdmin: () => void;
  loginAsCustomer: () => void;
  logout: () => void;
  switchRole: (role: 'admin' | 'customer') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_USER = 'thekeralastore_current_user';
export const STORAGE_KEY_ADMIN_SESSION = 'thekeralastore_admin_session';

export const MASTER_ADMIN_PASSCODE = 'kinnan123';

const DEFAULT_ADMIN: UserProfile = {
  id: 'usr-admin-1',
  email: 'admin@thekeralastore.shop',
  full_name: 'Store Administrator',
  role: 'admin',
  phone: '+91 98460 12345',
  created_at: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const isAdminSession = localStorage.getItem(STORAGE_KEY_ADMIN_SESSION) === 'true';
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Automatically purge any dummy customer from old defaults
        if (
          parsed?.id === 'usr-customer-1' || 
          parsed?.email === 'shopper@example.com' ||
          parsed?.full_name?.toLowerCase().includes('rahul') ||
          parsed?.full_name?.toLowerCase().includes('rohit')
        ) {
          localStorage.removeItem(STORAGE_KEY_USER);
          return null;
        }

        if (parsed?.role === 'admin' || isAdminSession) {
          return {
            ...DEFAULT_ADMIN,
            ...parsed,
            role: 'admin',
          };
        }

        return parsed;
      }

      if (isAdminSession) {
        return DEFAULT_ADMIN;
      }

      return null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const openOtpModal = () => setIsOtpModalOpen(true);
  const closeOtpModal = () => setIsOtpModalOpen(false);

  // Helper to check if current tab/session is an active Admin session
  const checkIsAdminActive = (): boolean => {
    if (typeof window === 'undefined') return false;
    return (
      localStorage.getItem(STORAGE_KEY_ADMIN_SESSION) === 'true' ||
      user?.role === 'admin' ||
      window.location.pathname.toLowerCase().includes('/nikhil')
    );
  };

  // 1. Google OAuth Sign-In (Primary customer authentication)
  const signInWithGoogle = async (): Promise<{ error?: any; data?: any }> => {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          const redirectTo = window.location.origin;
          return await client.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo,
              queryParams: {
                prompt: 'select_account',
              },
            },
          });
        } catch (err: any) {
          return { error: err };
        }
      }
    }
    return { error: { message: 'Authentication service is not connected. Please verify your Supabase connection.' } };
  };

  // 2. Master Admin Passcode for /admin
  const verifyMasterAdminPasscode = (passcode: string): boolean => {
    if (passcode.trim() === MASTER_ADMIN_PASSCODE) {
      const adminProfile: UserProfile = {
        id: 'usr-admin-master',
        email: 'admin@thekeralastore.shop',
        full_name: 'Store Administrator',
        role: 'admin',
        phone: '+91 98460 12345',
        created_at: new Date().toISOString(),
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_ADMIN_SESSION, 'true');
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(adminProfile));
      }
      setUser(adminProfile);
      return true;
    }
    return false;
  };

  // 3. Sync User state to localStorage
  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
        if (user.role === 'admin') {
          localStorage.setItem(STORAGE_KEY_ADMIN_SESSION, 'true');
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      const isAdminSession = typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY_ADMIN_SESSION) === 'true';
      if (!isAdminSession) {
        localStorage.removeItem(STORAGE_KEY_USER);
      }
    }
  }, [user]);

  // Keep user state in sync if admin session exists in localStorage
  useEffect(() => {
    if (!user && typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY_ADMIN_SESSION) === 'true') {
      setUser(DEFAULT_ADMIN);
    }
  }, [user]);

  // 4. Supabase Session & OAuth Callback Listener
  useEffect(() => {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        // Initial session check (e.g. on return from OAuth redirect)
        client.auth.getSession().then(({ data: { session }, error }) => {
          if (!error && session?.user) {
            const isAdminActive = checkIsAdminActive();
            const meta = session.user.user_metadata || {};
            const resolvedName = meta.full_name || meta.name || session.user.email?.split('@')[0] || 'Customer';
            const profile: UserProfile = {
              id: session.user.id,
              email: session.user.email || '',
              full_name: resolvedName,
              phone: meta.phone || session.user.phone || '',
              role: meta.role === 'admin' ? 'admin' : 'customer',
              created_at: session.user.created_at,
            };

            // Don't downgrade active store administrator to customer
            if (isAdminActive && profile.role !== 'admin') {
              if (profile.email) {
                StoreService.saveRegisteredCustomer({
                  id: session.user.id,
                  email: session.user.email,
                  full_name: resolvedName,
                  phone: meta.phone || session.user.phone || '',
                  avatar_url: meta.avatar_url || meta.picture || '',
                  created_at: session.user.created_at,
                  source: 'google',
                }).catch(() => {});
              }
              return;
            }

            setUser(profile);
            closeAuthModal();

            // Auto-sync registered customer to store database and customer list
            if (profile.role !== 'admin' && profile.email) {
              StoreService.saveRegisteredCustomer({
                id: session.user.id,
                email: session.user.email,
                full_name: resolvedName,
                phone: meta.phone || session.user.phone || '',
                avatar_url: meta.avatar_url || meta.picture || '',
                created_at: session.user.created_at,
                source: 'google',
              }).catch(() => {});
            }

            // Clean up hash fragments if returning from OAuth
            if (window.location.hash.includes('access_token')) {
              window.history.replaceState(null, '', window.location.pathname + window.location.search);
            }
          }
        });

        // Real-time auth state subscription
        const { data: authListener } = client.auth.onAuthStateChange((event, session) => {
          const isAdminActive = checkIsAdminActive();

          if (event === 'SIGNED_IN' && session?.user) {
            const meta = session.user.user_metadata || {};
            const resolvedName = meta.full_name || meta.name || session.user.email?.split('@')[0] || 'Customer';
            const profile: UserProfile = {
              id: session.user.id,
              email: session.user.email || '',
              full_name: resolvedName,
              phone: meta.phone || session.user.phone || '',
              role: meta.role === 'admin' ? 'admin' : 'customer',
              created_at: session.user.created_at,
            };

            // If an Admin is currently active, do not demote their session to customer
            if (isAdminActive && profile.role !== 'admin') {
              if (profile.email) {
                StoreService.saveRegisteredCustomer({
                  id: session.user.id,
                  email: session.user.email,
                  full_name: resolvedName,
                  phone: meta.phone || session.user.phone || '',
                  avatar_url: meta.avatar_url || meta.picture || '',
                  created_at: session.user.created_at,
                  source: 'google',
                }).catch(() => {});
              }
              return;
            }

            setUser(profile);
            closeAuthModal();

            // Auto-sync registered customer to store database and customer list
            if (profile.role !== 'admin' && profile.email) {
              StoreService.saveRegisteredCustomer({
                id: session.user.id,
                email: session.user.email,
                full_name: resolvedName,
                phone: meta.phone || session.user.phone || '',
                avatar_url: meta.avatar_url || meta.picture || '',
                created_at: session.user.created_at,
                source: 'google',
              }).catch(() => {});
            }

            if (window.location.hash.includes('access_token')) {
              window.history.replaceState(null, '', window.location.pathname + window.location.search);
            }
          } else if (event === 'SIGNED_OUT') {
            // CRITICAL FIX: When user changes tabs or minimizes browser, Supabase GoTrue runs
            // internal _recoverAndRefresh() on visibilitychange and fires SIGNED_OUT if there is no OAuth token.
            // NEVER log out an active Admin on background Supabase SIGNED_OUT events!
            if (isAdminActive) {
              return;
            }

            setUser(null);
            try {
              localStorage.removeItem(STORAGE_KEY_USER);
            } catch (e) {
              console.error(e);
            }
          }
        });

        return () => {
          authListener?.subscription?.unsubscribe();
        };
      }
    }
  }, []);

  // 5. Sign Out
  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_ADMIN_SESSION);
      sessionStorage.removeItem(STORAGE_KEY_ADMIN_SESSION);
      localStorage.removeItem(STORAGE_KEY_USER);
    }
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      client?.auth.signOut().catch(() => {});
    }
    setUser(null);
  };

  // Admin and testing convenience
  const loginAsAdmin = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_ADMIN_SESSION, 'true');
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(DEFAULT_ADMIN));
    }
    setUser(DEFAULT_ADMIN);
  };

  const loginAsCustomer = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_ADMIN_SESSION);
    }
    const cust: UserProfile = {
      id: `usr-${Date.now()}`,
      email: 'customer@thekeralastore.shop',
      full_name: 'Kerala Shopper',
      role: 'customer',
      created_at: new Date().toISOString(),
    };
    setUser(cust);
  };
  const switchRole = (role: 'admin' | 'customer') => {
    if (role === 'admin') loginAsAdmin();
    else loginAsCustomer();
  };

  // Legacy compat functions (safe no-op / redirect to Google)
  const signInWithEmail = async (email: string, pass: string): Promise<{ error: any; data?: any }> => {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        return await client.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password: pass,
        });
      }
    }
    return { error: { message: 'Customer login now uses Google Sign-In.' } };
  };

  const signUpWithEmail = async (email: string, pass: string, fullName: string): Promise<{ error: any; data?: any; isAlreadyRegistered?: boolean }> => {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        return await client.auth.signUp({
          email: email.trim().toLowerCase(),
          password: pass,
          options: { data: { full_name: fullName.trim() } },
        });
      }
    }
    return { error: { message: 'Customer registration now uses Google Sign-In.' } };
  };

  const sendEmailOtp = async (email: string): Promise<{ error: any; data?: any }> => {
    return { error: { message: 'Please use Continue with Google to sign in.' } };
  };

  const verifyEmailOtp = async (): Promise<{ error: any; data?: any }> => {
    return { error: { message: 'Please use Continue with Google to sign in.' } };
  };

  const resendSignupOtp = async (): Promise<{ error: any; data?: any }> => {
    return { error: { message: 'Please use Continue with Google to sign in.' } };
  };

  const loginWithPhone = (phone: string, fullName?: string) => {
    const cleanDigits = phone.replace(/\D/g, '');
    const newUser: UserProfile = {
      id: `cust-${cleanDigits}`,
      email: `${cleanDigits}@customer.thekeralastore.com`,
      full_name: fullName?.trim() || `Customer (${cleanDigits.slice(-4)})`,
      phone: phone.startsWith('+91') ? phone : `+91 ${cleanDigits.slice(-10)}`,
      role: 'customer',
      created_at: new Date().toISOString(),
    };
    setUser(newUser);
    closeOtpModal();
  };

  const isAdmin =
    user?.role === 'admin' ||
    (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY_ADMIN_SESSION) === 'true');

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isLoading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        isOtpModalOpen,
        openOtpModal,
        closeOtpModal,
        signInWithGoogle,
        verifyMasterAdminPasscode,
        loginWithPhone,
        signInWithEmail,
        signUpWithEmail,
        sendEmailOtp,
        verifyEmailOtp,
        resendSignupOtp,
        loginAsAdmin,
        loginAsCustomer,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
