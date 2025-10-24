/* @refresh reset */
import React, { useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { useConvex } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { AuthContext } from './AuthContextBase';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const convex = useConvex();

  useEffect(() => {
    const savedSession = localStorage.getItem('currentUser');
    if (savedSession) {
      setCurrentUser(JSON.parse(savedSession));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const authenticated = await convex.query(api.users.authenticateUser, { email, password });
    if (authenticated) {
      const user: User = {
        id: authenticated._id,
        email: authenticated.email,
        password: '',
        name: authenticated.name,
        role: authenticated.role,
        avatar: authenticated.avatar,
        department: authenticated.department,
        position: authenticated.position,
        isActive: authenticated.isActive,
        faceEmbedding: authenticated.faceEmbedding,
        locationOptIn: authenticated.locationOptIn,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const register = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    try {
      await convex.mutation(api.users.createUser, {
        email: userData.email,
        password: userData.password,
        name: userData.name,
        role: userData.role as any,
        avatar: userData.avatar,
        department: userData.department,
        position: userData.position,
        isActive: userData.isActive,
        faceEmbedding: userData.faceEmbedding,
        locationOptIn: userData.locationOptIn,
      });
      return true;
    } catch (e) {
      return false;
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!currentUser) return;

    await convex.mutation(api.users.updateUser, { id: currentUser.id as any, ...updates });
    const updatedUser = { ...currentUser, ...updates, updatedAt: new Date().toISOString() } as User;
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, register, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
