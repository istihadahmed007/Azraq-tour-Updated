/**
 * Azraq Trips - API-First Authentication & Account Service
 * Clean, production-ready auth client supporting email/phone login, registration, password resets, and session tokens.
 */

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  password: string;
  confirmPassword?: string;
  agreeTerms: boolean;
  referralCode?: string;
  photoURL?: string;
}

export interface LoginPayload {
  emailOrPhone: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthUser {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  photoURL: string;
  bio?: string;
  languages?: string[];
  homeLocation?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt?: string;
  isAdmin?: boolean;
  role?: 'admin' | 'user';
  isProfileComplete?: boolean;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  token?: string;
  message?: string;
  error?: string;
  demoEmailCode?: string;
  demoPhoneOtp?: string;
}

const AUTH_TOKEN_KEY = 'azraq_auth_session_token';
const AUTH_USER_KEY = 'azraq_cached_user';

export const authService = {
  // Store authentication session token
  setSessionToken(token: string, persist = true) {
    if (persist) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      sessionStorage.setItem(AUTH_TOKEN_KEY, token);
    }
  },

  // Get active session token
  getSessionToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY);
  },

  // Clear session
  clearSession() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  },

  // Validate Bangladeshi Mobile Number
  validateBangladeshiPhone(phone: string): { isValid: boolean; normalized: string; error?: string } {
    const cleaned = phone.replace(/[\s\-()]/g, '');
    
    // Pattern 1: +8801XXXXXXXXX (14 chars)
    if (/^\+8801[3-9]\d{8}$/.test(cleaned)) {
      return { isValid: true, normalized: cleaned };
    }
    // Pattern 2: 8801XXXXXXXXX (13 chars)
    if (/^8801[3-9]\d{8}$/.test(cleaned)) {
      return { isValid: true, normalized: `+${cleaned}` };
    }
    // Pattern 3: 01XXXXXXXXX (11 chars)
    if (/^01[3-9]\d{8}$/.test(cleaned)) {
      return { isValid: true, normalized: `+88${cleaned}` };
    }
    // Pattern 4: 1XXXXXXXXX (10 chars)
    if (/^1[3-9]\d{8}$/.test(cleaned)) {
      return { isValid: true, normalized: `+880${cleaned}` };
    }

    return {
      isValid: false,
      normalized: cleaned,
      error: 'Please enter a valid 11-digit Bangladeshi mobile number (e.g. 01712345678 or +8801712345678).',
    };
  },

  // Register new account
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    try {
      if (payload.confirmPassword && payload.password !== payload.confirmPassword) {
        return { success: false, error: 'Passwords do not match. Please re-enter your password.' };
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to create account.' };
      }

      if (data.token) {
        this.setSessionToken(data.token, true);
      }
      if (data.user) {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
      }

      return {
        success: true,
        user: data.user,
        token: data.token,
        message: data.message,
        demoEmailCode: data.demoEmailCode,
        demoPhoneOtp: data.demoPhoneOtp,
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during registration.' };
    }
  },

  // Login with Email or Phone
  async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: payload.emailOrPhone,
          password: payload.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Invalid login credentials.' };
      }

      if (data.token) {
        this.setSessionToken(data.token, payload.rememberMe !== false);
      }
      if (data.user) {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
      }

      return {
        success: true,
        user: data.user,
        token: data.token,
        message: data.message,
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during login.' };
    }
  },

  // Verify Current Session User
  async getCurrentUser(): Promise<AuthUser | null> {
    const token = this.getSessionToken();
    if (!token) return null;

    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        this.clearSession();
        return null;
      }

      const data = await res.json();
      if (data.user) {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
        return data.user;
      }
      return null;
    } catch {
      // Return cached user if offline
      try {
        const cached = localStorage.getItem(AUTH_USER_KEY);
        return cached ? JSON.parse(cached) : null;
      } catch {
        return null;
      }
    }
  },

  // Send Password Reset Instructions
  async sendPasswordReset(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to send password reset.' };
      }
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Could not connect to server.' };
    }
  },

  // Verify Email Code
  async verifyEmailCode(email: string, code: string): Promise<AuthResponse> {
    try {
      const res = await fetch('/api/auth/verify-email-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Invalid code.' };
      }
      return { success: true, user: data.user, message: data.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Verification failed.' };
    }
  },

  // Logout
  async logout(): Promise<void> {
    try {
      const token = this.getSessionToken();
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
      }
    } finally {
      this.clearSession();
    }
  },
};
