import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('educore_token') || null);
  const [loading, setLoading] = useState(true);

  // Synchronize authenticated user profile on application boot
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('educore_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            setToken(storedToken);
          }
        } catch (err) {
          console.warn('[AuthContext] Session expired or invalid on mount.');
          localStorage.removeItem('educore_token');
          localStorage.removeItem('educore_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Register handler
  const registerUser = async (name, email, password, role) => {
    const res = await api.post('/auth/register', { name, email, password, role });
    if (res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      localStorage.setItem('educore_token', receivedToken);
      localStorage.setItem('educore_user', JSON.stringify(receivedUser));
      setToken(receivedToken);
      setUser(receivedUser);
      return { success: true };
    }
    return { success: false, message: res.data.message };
  };

  // Login handler
  const loginUser = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      localStorage.setItem('educore_token', receivedToken);
      localStorage.setItem('educore_user', JSON.stringify(receivedUser));
      setToken(receivedToken);
      setUser(receivedUser);
      return { success: true };
    }
    return { success: false, message: res.data.message };
  };

  // Logout handler
  const logoutUser = () => {
    localStorage.removeItem('educore_token');
    localStorage.removeItem('educore_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        registerUser,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
