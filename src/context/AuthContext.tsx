import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  UserInfo,
  initiateLogin,
  exchangeCodeForTokens,
  refreshAccessToken,
  fetchUserInfo,
  OidcTokens,
} from '../api/oidc';
import { coreApi } from '../api/client';

interface AuthContextType {
  user: UserInfo | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  roles: string[];
  login: (idp?: string) => Promise<void>;
  logout: () => void;
  handleCallback: (code: string, state: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Configure coreApi handlers on mount and token update
  useEffect(() => {
    coreApi.setAuthHandlers(
      () => accessToken,
      async () => {
        if (!refreshToken) return null;
        try {
          const newTokens = await refreshAccessToken(refreshToken);
          setAccessToken(newTokens.access_token);
          sessionStorage.setItem('lbla_access_token', newTokens.access_token);
          if (newTokens.refresh_token) {
            setRefreshToken(newTokens.refresh_token);
            sessionStorage.setItem('lbla_refresh_token', newTokens.refresh_token);
          }
          return newTokens.access_token;
        } catch {
          logout();
          return null;
        }
      }
    );
  }, [accessToken, refreshToken]);

  // Initial session restoration
  useEffect(() => {
    const initAuth = async () => {
      const storedAccess = sessionStorage.getItem('lbla_access_token');
      const storedRefresh = sessionStorage.getItem('lbla_refresh_token');

      if (storedAccess) {
        setAccessToken(storedAccess);
        setRefreshToken(storedRefresh);
        try {
          const profile = await fetchUserInfo(storedAccess);
          setUser(profile);
        } catch {
          // If expired and refresh token available, attempt refresh
          if (storedRefresh) {
            try {
              const tokens = await refreshAccessToken(storedRefresh);
              setAccessToken(tokens.access_token);
              sessionStorage.setItem('lbla_access_token', tokens.access_token);
              const profile = await fetchUserInfo(tokens.access_token);
              setUser(profile);
            } catch {
              sessionStorage.removeItem('lbla_access_token');
              sessionStorage.removeItem('lbla_refresh_token');
            }
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (idp?: string) => {
    await initiateLogin(idp);
  };

  const logout = () => {
    sessionStorage.removeItem('lbla_access_token');
    sessionStorage.removeItem('lbla_refresh_token');
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const handleCallback = async (code: string, state: string) => {
    setIsLoading(true);
    try {
      const tokens: OidcTokens = await exchangeCodeForTokens(code, state);
      setAccessToken(tokens.access_token);
      sessionStorage.setItem('lbla_access_token', tokens.access_token);
      if (tokens.refresh_token) {
        setRefreshToken(tokens.refresh_token);
        sessionStorage.setItem('lbla_refresh_token', tokens.refresh_token);
      }

      const profile = await fetchUserInfo(tokens.access_token);
      setUser(profile);
    } finally {
      setIsLoading(false);
    }
  };

  const roles = user?.roles || [];
  const isAuthenticated = !!user && !!accessToken;

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated,
        isLoading,
        roles,
        login,
        logout,
        handleCallback,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
