/**
 * AuthContext.js
 * Provides authentication state and helpers throughout the app.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser } from '../services/api';

const AuthContext = createContext(null);

const SESSION_KEY = '@finance_tracker_session';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on app start
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const raw = await AsyncStorage.getItem(SESSION_KEY);
        if (raw) {
          setUser(JSON.parse(raw));
        }
      } catch (_) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  /**
   * Login: validates credentials via the API layer, persists session.
   */
  const login = async (username, password) => {
    const response = await loginUser(username, password);
    const userData = response.data;
    setUser(userData);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(userData));
    return userData;
  };

  /**
   * Logout: clears session.
   */
  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem(SESSION_KEY);
  };

  /**
   * Refresh user data (e.g. after budget update).
   */
  const refreshUser = (updatedUser) => {
    setUser(updatedUser);
    AsyncStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
