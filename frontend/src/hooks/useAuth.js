import { useState, useEffect, useContext, createContext } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('authToken'));

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Check if we have a token and try to get user data
        if (token) {
          const userData = await authAPI.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        // Token is invalid, clear it
        localStorage.removeItem('authToken');
        setToken(null);
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, [token]);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      
      // dj-rest-auth returns a key (token) on successful login
      if (response.key) {
        localStorage.setItem('authToken', response.key);
        setToken(response.key);
        
        // Get the user data
        const userData = await authAPI.getCurrentUser();
        setUser(userData);
        
        return { success: true };
      } else {
        return { 
          success: false, 
          error: 'Invalid response from server' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.non_field_errors?.[0] || 
               error.response?.data?.detail ||
               error.message || 'Login failed' 
      };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await authAPI.signup(userData);
      
      // Check if this is an email verification response
      if (response.detail && response.detail.includes('Verification e-mail sent')) {
        return { 
          success: true, 
          requiresVerification: true,
          message: response.detail 
        };
      }
      
      // dj-rest-auth returns a key (token) on successful signup (if email verification is disabled)
      if (response.key) {
        localStorage.setItem('authToken', response.key);
        setToken(response.key);
        
        // Get the user data
        const currentUser = await authAPI.getCurrentUser();
        setUser(currentUser);
        
        return { success: true };
      }
      
      // Fallback for other successful responses
      return { 
        success: true,
        message: response.detail || 'Account created successfully'
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || error.message || 'Signup failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('authToken');
      setToken(null);
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}