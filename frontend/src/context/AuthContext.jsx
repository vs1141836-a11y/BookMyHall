import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Configure backend API base URL
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
axios.defaults.baseURL = API_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Apply token header globally when token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [token]);

  // Load user profile on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get('/auth/me');
        setUser(response.data.data);
      } catch (error) {
        console.error('Failed to load user profile:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [token]);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post('/auth/login', { email, password });
      const { token: userToken, ...userData } = response.data;
      setToken(userToken);
      setUser(userData);
      return { success: true, role: userData.role };
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Login failed. Please check credentials.';
      return { 
        success: false, 
        message,
        requiresVerification: error.response?.data?.requiresVerification || false,
        email: error.response?.data?.email || null
      };
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await axios.post('/auth/register', userData);
      const { token: userToken, ...userObject } = response.data;
      setToken(userToken);
      setUser(userObject);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      const message = error.response?.data?.message || 'Registration failed. Try again.';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  // Update profile handler
  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/auth/profile', profileData);
      const { token: newToken, ...updatedUser } = response.data;
      if (newToken) {
        setToken(newToken);
      }
      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to update profile.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!user,
        isCustomer: user?.role === 'customer' || user?.role === 'user',
        isAdmin: user?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
