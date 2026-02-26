'use client';
import { createContext, useContext } from 'react';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const user = {
    _id: '000000000000000000000001',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@medlab.com',
    role: 'admin',
    licenseNumber: 'ADM-001'
  };

  const login = async () => {};
  const logout = () => window.location.href = '/dashboard';

  return (
    <AuthContext.Provider value={{ user, login, logout, loading: false }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);