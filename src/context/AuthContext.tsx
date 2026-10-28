import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';

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
  loginWithPhone: (phone: string, fullName?: string) => void;
  signInWithEmail: (email: string, password: string) => Promise<{ error: any; data?: any }>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<{ error: any; data?: any }>;
  signInWithGoogle: () => Promise<{ error?: any; data?: any }>;
  sendEmailOtp: (email: string, fullName?: string, phone?: string) => Promise<{ error: any; data?: any }>;
  verifyEmailOtp: (email: string, token: string, fullName?: string, phone?: string) => Promise<{ error: any; data?: any }>;
  sendMagicLink?: (email: string) => Promise<{ error: any; data?: any }>;
  resetPassword?: (email: string) => Promise<{ error: any; data?: any }>;
  loginAsAdmin: () => void;
  loginAsCustomer: () => void;
  logout: () => void;
  switchRole: (role: 'admin' | 'customer') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_USER = 'thekeralastore_current_user';

const DEFAULT_ADMIN: UserProfile = {
  id: 'usr-admin-1',
  email: 'admin@thekeralastore.com',
  full_name: 'Store Manager',
  role: 'admin',
  phone: '+91 98460 12345',
  created_at: new Date().toISOString(),
};

const DEFAULT_CUSTOMER: UserProfile = {
  id: 'usr-customer-1',
  email: 'shopper@example.com',
  full_name: 'Rahul Sharma',
  role: 'customer',
  phone: '+91 98765 43210',
  created_at: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window === 'undefined') return DEFAULT_CUSTOMER;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      return saved ? JSON.parse(saved) : DEFAULT_CUSTOMER;
    } catch {
      return DEFAULT_CUSTOMER;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const openOtpModal = () => setIsOtpModalOpen(true);
  const closeOtpModal = () => setIsOtpModalOpen(false);

  const signInWithEmail = async (email: string, pass: string): Promise<{ error: any; data?: any }> => {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        const { data, error } = await client.auth.signInWithPassword({
          email: email.trim(),
          password: pass,
        });
        if (!error && data.user) {
          const profile: UserProfile = {
            id: data.user.id,
            email: data.user.email || email.trim(),
            full_name: data.user.user_metadata?.full_name || email.trim().split('@')[0],
            role: data.user.user_metadata?.role === 'admin' ? 'admin' : 'customer',
            created_at: data.user.created_at,
          };
          setUser(profile);
          closeAuthModal();
        }
        return { data, error };
      }
    }
    // Local fallback
    const profile: UserProfile = {
      id: `usr-${Date.now()}`,
      email: email.trim(),
      full_name: email.trim().split('@')[0],
      role: 'customer',
      created_at: new Date().toISOString(),
    };
    setUser(profile);
    closeAuthModal();
    return { error: null, data: { user: profile } };
  };

  const signUpWithEmail = async (email: string, pass: string, fullName: string): Promise<{ error: any; data?: any }> => {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        const { data, error } = await client.auth.signUp({
          email: email.trim(),
          password: pass,
          options: {
            data: {
              full_name: fullName.trim() || email.trim().split('@')[0],
              role: 'customer',
            },
            emailRedirectTo: window.location.origin,
          },
        });
        if (!error && data.user && data.session) {
          const profile: UserProfile = {
            id: data.user.id,
            email: data.user.email || email.trim(),
            full_name: fullName.trim() || data.user.email?.split('@')[0] || 'Customer',
            role: 'customer',
            created_at: data.user.created_at,
          };
          setUser(profile);
          closeAuthModal();
        }
        return { data, error };
      }
    }
    const profile: UserProfile = {
      id: `usr-${Date.now()}`,
      email: email.trim(),
      full_name: fullName.trim() || email.trim().split('@')[0],
      role: 'customer',
      created_at: new Date().toISOString(),
    };
    setUser(profile);
    closeAuthModal();
    return { error: null, data: { user: profile } };
  };

  const signInWithGoogle = async (): Promise<{ error?: any; data?: any }> => {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        return await client.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
          },
        });
      }
    }
    // Simulated Google Login for local/sandbox testing
    const profile: UserProfile = {
      id: `google-user-${Date.now()}`,
      email: 'customer.google@thekeralastore.com',
      full_name: 'Kerala Shopper (Google)',
      role: 'customer',
      created_at: new Date().toISOString(),
    };
    setUser(profile);
    closeAuthModal();
    return { data: { user: profile } };
  };

  // Send 6-Digit Email OTP via Supabase (Brevo SMTP)
  const sendEmailOtp = async (
    email: string,
    fullName?: string,
    phone?: string
  ): Promise<{ error: any; data?: any }> => {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          const { data, error } = await client.auth.signInWithOtp({
            email: email.trim(),
            options: {
              data: {
                full_name: fullName?.trim() || email.trim().split('@')[0],
                phone: phone?.trim() || '',
                role: 'customer',
              },
            },
          });
          return { data, error };
        } catch (err: any) {
          return { error: err };
        }
      }
    }
    return { error: null, data: { message: 'OTP sent successfully (Simulated)' } };
  };

  // Verify 6-Digit Email OTP
  const verifyEmailOtp = async (
    email: string,
    token: string,
    fullName?: string,
    phone?: string
  ): Promise<{ error: any; data?: any }> => {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          const { data, error } = await client.auth.verifyOtp({
            email: email.trim(),
            token: token.trim(),
            type: 'email',
          });

          if (!error && data?.user) {
            const profile: UserProfile = {
              id: data.user.id,
              email: data.user.email || email.trim(),
              full_name: fullName?.trim() || data.user.user_metadata?.full_name || email.trim().split('@')[0],
              phone: phone?.trim() || data.user.user_metadata?.phone || '',
              role: data.user.user_metadata?.role === 'admin' ? 'admin' : 'customer',
              created_at: data.user.created_at,
            };
            setUser(profile);
            closeAuthModal();
            return { data, error: null };
          }
          if (error) {
            return { error, data: null };
          }
        } catch (err: any) {
          return { error: err, data: null };
        }
      }
    }

    // Local simulated verification
    const profile: UserProfile = {
      id: `usr-${Date.now()}`,
      email: email.trim(),
      full_name: fullName?.trim() || email.trim().split('@')[0],
      phone: phone?.trim() || '',
      role: 'customer',
      created_at: new Date().toISOString(),
    };
    setUser(profile);
    closeAuthModal();
    return { error: null, data: { user: profile } };
  };

  const sendMagicLink = async (email: string): Promise<{ error: any; data?: any }> => {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        return await client.auth.signInWithOtp({
          email: email.trim(),
          options: {
            emailRedirectTo: window.location.origin,
          },
        });
      }
    }
    return { error: null, data: { message: 'Magic link simulated' } };
  };

  const resetPassword = async (email: string): Promise<{ error: any; data?: any }> => {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        return await client.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: window.location.origin,
        });
      }
    }
    return { error: null, data: { message: 'Reset email simulated' } };
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

  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      } catch (e) {
        console.error(e);
      }
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  }, [user]);

  // Listen to Supabase auth state if configured
  useEffect(() => {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        client.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email || 'user@example.com',
              full_name: session.user.user_metadata?.full_name || 'Store User',
              role: session.user.user_metadata?.role === 'admin' ? 'admin' : 'customer',
              created_at: session.user.created_at,
            });
          }
        });

        const { data: authListener } = client.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email || 'user@example.com',
              full_name: session.user.user_metadata?.full_name || 'Store User',
              role: session.user.user_metadata?.role === 'admin' ? 'admin' : 'customer',
              created_at: session.user.created_at,
            });
          }
        });

        return () => {
          authListener.subscription.unsubscribe();
        };
      }
    }
  }, []);

  const loginAsAdmin = () => setUser(DEFAULT_ADMIN);
  const loginAsCustomer = () => setUser(DEFAULT_CUSTOMER);
  const logout = () => {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      client?.auth.signOut();
    }
    setUser(null);
  };
  const switchRole = (role: 'admin' | 'customer') => {
    if (role === 'admin') loginAsAdmin();
    else loginAsCustomer();
  };

  const isAdmin = user?.role === 'admin';

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
        loginWithPhone,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        sendEmailOtp,
        verifyEmailOtp,
        sendMagicLink,
        resetPassword,
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

